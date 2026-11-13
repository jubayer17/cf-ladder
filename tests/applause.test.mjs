import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APPLAUSE_BASE_COUNT, deviceApplauseTotal } from '../src/lib/applause.ts';

test('applause starts at the requested baseline and preserves additional claps', () => {
  assert.equal(APPLAUSE_BASE_COUNT, 157452);
  assert.equal(deviceApplauseTotal(0), 157452);
  assert.equal(deviceApplauseTotal(2), 157454);
});
test('invalid local counters cannot corrupt the displayed total', () => {
  for (const value of [-1, NaN, Infinity, 1.5]) assert.equal(deviceApplauseTotal(value),157452);
  assert.equal(deviceApplauseTotal(Number.MAX_SAFE_INTEGER),Number.MAX_SAFE_INTEGER);
});
