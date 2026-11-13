export function approvedAvatarUrl(value?: string | null): string | null {
  if (!value || value.length > 512) return null;
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    if (!['http:','https:'].includes(url.protocol) || url.hostname !== 'userpic.codeforces.org' || url.port || url.username || url.password || url.search || url.hash) return null;
    if (!/^(?:\/\d+\/(?:title|avatar)\/[a-f0-9]+\.(?:jpe?g|png|gif|webp)|\/no-(?:avatar|title)\.(?:jpg|png))$/i.test(url.pathname)) return null;
    url.protocol='https:';
    return url.toString();
  } catch { return null; }
}
export function avatarSources(primary?: string, fallback?: string): string[] {
  const urls = [...new Set([approvedAvatarUrl(primary),approvedAvatarUrl(fallback)].filter((url): url is string => !!url))];
  return [...urls.map(url => `/api/avatar?src=${encodeURIComponent(url)}`), ...urls];
}
