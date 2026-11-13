import { test } from 'node:test';
import assert from 'node:assert/strict';
import { problemState, verdictLabel } from '../src/lib/progress.ts';
import { approvedAvatarUrl } from '../src/lib/avatar.ts';
import { topicTone } from '../src/lib/topicPalette.ts';
test('accepted solves remain green even after later failed attempts', () => {
  assert.equal(problemState(true,true,'WRONG_ANSWER'),'solved');
  assert.equal(problemState(false,false),'unsolved');
  assert.equal(problemState(false,true,'WRONG_ANSWER'),'failed');
});
test('unjudged submissions are not presented as failed attempts', () => {
  for (const verdict of [undefined,'TESTING','QUEUED']) assert.equal(problemState(false,true,verdict),'pending');
  assert.equal(verdictLabel('WRONG_ANSWER'),'Wrong answer');
  assert.equal(verdictLabel(undefined),'Awaiting judging');
});
test('avatar fetch only accepts public Codeforces image paths', () => {
  assert.equal(approvedAvatarUrl('//userpic.codeforces.org/123/avatar/abc123.jpg'),'https://userpic.codeforces.org/123/avatar/abc123.jpg');
  for (const bad of ['https://localhost/123/avatar/a.jpg','https://127.0.0.1/123/avatar/a.jpg','https://userpic.codeforces.org.evil.example/123/avatar/a.jpg','https://userpic.codeforces.org:8080/123/avatar/a.jpg','https://userpic.codeforces.org/../../api/user.info','https://user:pass@userpic.codeforces.org/123/avatar/a.jpg']) assert.equal(approvedAvatarUrl(bad),null,bad);
});
test('adjacent topic labels keep distinct and stable identities', () => {
  const tags=['constructive algorithms','dfs and similar','dsu','graphs','trees'];
  assert.equal(new Set(tags.map(topicTone)).size,tags.length);
  assert.equal(topicTone('trees'),topicTone('trees'));
});
