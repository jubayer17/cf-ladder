import { test } from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const get = (path, options) => fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000), ...options });
test('public pages and sitemap are available', async () => {
  for (const path of ['/', '/topics', '/contests', '/stats', '/unsolved', '/sitemap.xml', '/api/health']) {
    const response = await get(path); assert.equal(response.status,200,path);
  }
  const xml = await (await get('/sitemap.xml')).text(); assert.match(xml, /\/topics/); assert.match(xml, /\/contests/);
});
test('proxy rejects unsupported methods, prototype keys and invalid filters', async () => {
  for (const [path,status] of [['evil',404],['constructor',404],['user.info',400],['user.info?handles=a%26b',400],['user.status?handle=tourist&count=999999',400],['contest.list?gym=bad',400],['user.info?handles=tourist&handles=other',400]]) {
    const response = await get(`/api/codeforces/${path}`); assert.equal(response.status,status,path); assert.equal((await response.json()).status,'FAILED');
  }
});
test('legacy routes redirect to the maintained routes', async () => {
  for (const [path, location] of [['/demo','/'],['/categories','/topics'],['/api/sitemap','/sitemap.xml']]) {
    const response = await get(path,{ redirect:'manual' }); assert.ok([307,308].includes(response.status)); assert.equal(new URL(response.headers.get('location'),base).pathname,location);
  }
});
test('bug report rejects foreign origins before any email action', async () => {
  const response = await get('/api/send-bug',{method:'POST', headers:{origin:'https://invalid.example'}}); assert.equal(response.status,403);
});
test('photo proxy rejects private hosts, redirects and unexpected parameters', async () => {
  for (const query of ['src=http://127.0.0.1/a.jpg','src=https://example.com/a.jpg','src=https://userpic.codeforces.org/redirect','src=https://userpic.codeforces.org/no-avatar.jpg&extra=1','src=https://userpic.codeforces.org/no-avatar.jpg&src=https://userpic.codeforces.org/no-title.jpg']) {
    const response = await get(`/api/avatar?${query}`);
    assert.equal(response.status,400,query);
    assert.equal((await response.json()).error,'Invalid photo URL');
  }
});
