import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 30;
const methods: Record<string, string[]> = {
  'problemset.problems': [], 'contest.list': ['gym'],
  'user.info': ['handles'], 'user.rating': ['handle'], 'user.status': ['handle', 'from', 'count'],
  'contest.status': ['contestId', 'handle', 'from', 'count'],
  'contest.standings': ['contestId', 'from', 'count', 'showUnofficial'],
};
const cache = new Map<string, { expires: number; data: unknown; bytes: number }>();
let cacheBytes = 0;
let upstreamQueue: Promise<void> = Promise.resolve();
let nextRequestAt = 0;
async function requestSlot() {
  const slot = upstreamQueue.then(async () => {
    const wait = Math.max(0, nextRequestAt - Date.now());
    if (wait) await new Promise(resolve => setTimeout(resolve,wait));
    nextRequestAt = Date.now() + 2100;
  });
  upstreamQueue = slot.catch(() => {});
  return slot;
}
const pending = new Map<string, Promise<unknown>>();
export async function GET(req: NextRequest, context: { params: Promise<{ method: string }> }) {
  const { method } = await context.params;
  const allowed = Object.hasOwn(methods, method) ? methods[method] : undefined;
  if (!allowed) return NextResponse.json({ status: 'FAILED', comment: 'Unknown API method' }, { status: 404 });
  const url = new URL(`https://codeforces.com/api/${method}`);
  const seen = new Set<string>();
  for (const [key, value] of req.nextUrl.searchParams) {
    if (seen.has(key)) return NextResponse.json({ status: "FAILED", comment: "Duplicate query parameter" }, { status: 400 });
    seen.add(key);
    if (!allowed.includes(key) || value.length > 100 || (['contestId','from','count'].includes(key) && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > (key === 'count' ? 10000 : 10000000)))) return NextResponse.json({ status: 'FAILED', comment: 'Invalid query parameter' }, { status: 400 });
    if (['handle','handles'].includes(key) && !/^[A-Za-z0-9_.-]{3,24}$/.test(value)) return NextResponse.json({ status: 'FAILED', comment: 'Invalid Codeforces handle' }, { status: 400 });
    if (['gym','showUnofficial'].includes(key) && !['true','false'].includes(value)) return NextResponse.json({ status: 'FAILED', comment: 'Invalid flag' }, { status: 400 });
    url.searchParams.set(key, value);
  }
  if ((method.startsWith('user.') && !url.searchParams.has(method === 'user.info' ? 'handles' : 'handle')) || (method.startsWith('contest.') && method !== 'contest.list' && !url.searchParams.has('contestId'))) return NextResponse.json({ status: 'FAILED', comment: 'Missing required parameter' }, { status: 400 });
  if (method === 'contest.list' && !url.searchParams.has('gym')) url.searchParams.set('gym','false');
  url.searchParams.sort();
  const publicCatalog = method === 'problemset.problems' || method === 'contest.list';
  const responseHeaders = publicCatalog ? { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } : { 'Cache-Control': 'private, no-store' };
  const key = url.toString();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return NextResponse.json(cached.data, { headers: responseHeaders });
  try {
    let task = pending.get(key);
    if (!task) {
      if (pending.size >= 8) return NextResponse.json({ status: 'FAILED', comment: 'Service is busy. Please try again shortly.' }, { status: 429, headers: { 'Retry-After': '5' } });
      task = (async () => {
        await requestSlot();
        const response = await fetch(url, { signal: AbortSignal.timeout(12000), cache: 'no-store' });
        if (!response.ok) throw new Error('Upstream unavailable');
        const data = await response.json();
        if (data.status !== 'OK') return data;
        const bytes = JSON.stringify(data).length * 2;
        const previous = cache.get(key);
        if (previous) { cacheBytes -= previous.bytes; cache.delete(key); }
        while (cache.size && (cache.size >= 100 || cacheBytes + bytes > 32 * 1024 * 1024)) {
          const oldest = cache.keys().next().value!;
          cacheBytes -= cache.get(oldest)!.bytes; cache.delete(oldest);
        }
        if (bytes <= 32 * 1024 * 1024) {
          cache.set(key, { data, bytes, expires: Date.now() + (method.startsWith('user.') || method === 'contest.status' ? 15000 : 300000) });
          cacheBytes += bytes;
        }
        return data;
      })().finally(() => pending.delete(key));
      pending.set(key, task);
    }
    const data = await task as { status: string };
    return NextResponse.json(data, { status: data.status === 'OK' ? 200 : 400, headers: data.status === 'OK' ? responseHeaders : { 'Cache-Control': 'no-store' } });
  } catch {
    if (cached) return NextResponse.json(cached.data, { headers: { 'X-Cache': 'STALE' } });
    return NextResponse.json({ status: 'FAILED', comment: 'Codeforces is temporarily unavailable. Please try again.' }, { status: 502 });
  }
}
