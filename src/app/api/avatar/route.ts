import { approvedAvatarUrl } from '@/lib/avatar';
export const runtime = 'nodejs';
export const maxDuration = 10;
const MAX_BYTES = 512 * 1024;
const cache = new Map<string,{ bytes: Uint8Array; type: string }>();
const pending = new Map<string,Promise<{ bytes: Uint8Array; type: string }>>();
let cacheBytes = 0;
function imageType(bytes: Uint8Array) {
  if (bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((n,i) => bytes[i]===n)) return 'image/png';
  const header = new TextDecoder().decode(bytes.slice(0,12));
  if (header.startsWith('GIF87a') || header.startsWith('GIF89a')) return 'image/gif';
  if (header.startsWith('RIFF') && header.slice(8,12)==='WEBP') return 'image/webp';
  throw new Error('Not an image');
}
async function fetchImage(url: string) {
  const response = await fetch(url,{ signal: AbortSignal.timeout(6000), redirect:'error', cache:'no-store' });
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('Photo unavailable');
  const reader = response.body.getReader();
  const chunks: Uint8Array[]=[]; let size=0;
  while (true) {
    const { done,value }=await reader.read(); if (done) break;
    size+=value.byteLength;
    if (size>MAX_BYTES) { await reader.cancel(); throw new Error('Photo too large'); }
    chunks.push(value);
  }
  const bytes=new Uint8Array(size); let offset=0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.byteLength; }
  return {bytes,type:imageType(bytes)};
}
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const src = approvedAvatarUrl(params.get('src'));
  if (!src || params.getAll('src').length!==1 || [...params.keys()].some(key => key!=='src')) return Response.json({error:'Invalid photo URL'},{status:400});
  try {
    let image=cache.get(src);
    if (!image) {
      let task=pending.get(src);
      if (!task) {
        if (pending.size>=8) return Response.json({error:'Photo service busy'},{status:429});
        task=fetchImage(src).finally(() => pending.delete(src));pending.set(src,task);
      }
      image=await task;
      if (!cache.has(src)) {
        while(cache.size && (cache.size>=64 || cacheBytes+image.bytes.length>8*1024*1024)) {
          const oldest=cache.keys().next().value!;cacheBytes-=cache.get(oldest)!.bytes.length;cache.delete(oldest);
        }
        cache.set(src,image);cacheBytes+=image.bytes.length;
      }
    }
    return new Response(new Uint8Array(image.bytes),{headers:{'Content-Type':image.type,'Cache-Control':'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800','X-Content-Type-Options':'nosniff'}});
  } catch { return Response.json({error:'Codeforces photo is temporarily unavailable'},{status:502,headers:{'Cache-Control':'no-store'}}); }
}
