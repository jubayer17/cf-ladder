import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentStreak, localDate, mergeSubmissions, makeKey, cfRequest, storage } from '../src/lib/codeforces.ts';
test('streak accepts yesterday and rejects gaps', () => {
  const now = new Date(2026, 10, 13, 15);
  assert.equal(currentStreak({ '2026-11-13': 1, '2026-11-12': 2, '2026-11-10': 1 }, now), 2);
  assert.equal(currentStreak({ '2026-11-12': 1, '2026-11-11': 1 }, now), 2);
  assert.equal(currentStreak({ '2026-11-11': 1 }, now), 0);
});
test('streak crosses month and year boundaries', () => {
  assert.equal(currentStreak({ '2026-01-01': 1, '2025-12-31': 1 }, new Date(2026,0,1,12)), 2);
});
test('local dates use calendar day and problem keys normalize indexes', () => {
  assert.equal(localDate(new Date(2026,0,2,0,1)), '2026-01-02');
  assert.equal(makeKey(100,' a1 '), '100-A1');
});
test('refresh replaces a pending verdict without duplicating submission', () => {
  const before = [{ id: 1, creationTimeSeconds: 100, verdict: 'TESTING' }];
  const after = mergeSubmissions(before, [{ id: 1, creationTimeSeconds: 100, verdict: 'OK' }, { id: 2, creationTimeSeconds: 101, verdict: 'WRONG_ANSWER' }]);
  assert.equal(after.length, 2); assert.equal(after[1].verdict, 'OK'); assert.equal(before[0].verdict, 'TESTING');
});
test('storage failure remains nonfatal', () => {
  assert.equal(storage.get('missing'), null); storage.set('key','value'); storage.remove('key');
});
test('API handles are encoded and failed results reject', async () => {
  const original = globalThis.fetch; let url;
  try {
    globalThis.fetch = async input => { url = input; return Response.json({ status: 'FAILED', comment: 'Handle not found' }, { status: 400 }); };
    await assert.rejects(cfRequest('user.info', { handles: 'a&b' }), /Handle not found/);
    assert.match(url,/handles=a%26b/);
  } finally { globalThis.fetch = original; }
});
