import test from 'node:test';
import assert from 'node:assert/strict';
import {readV33Transfer,V33_DRAFT_KEY,V33_MARK_KEY} from '../first-project-guide.mjs';
const store=(entries={})=>({getItem:k=>entries[k]??null});
test('v3.3 guide requires explicit handoff and completion marker',()=>{
 const s=store({[V33_DRAFT_KEY]:JSON.stringify({stage:'sentence',need:'customer',time:'five',idea:'한 문장'}),[V33_MARK_KEY]:JSON.stringify({completedVersion:1})});
 assert.equal(readV33Transfer(s,''),null);
 assert.deepEqual(readV33Transfer(s,'?v33Guide=1'),{stage:'sentence',need:'customer',time:'five',idea:'한 문장'});
 assert.equal(readV33Transfer(store({[V33_DRAFT_KEY]:'{}'}),'?v33Guide=1'),null);
});
test('handoff sanitizes untrusted values',()=>{
 const s=store({[V33_DRAFT_KEY]:JSON.stringify({stage:'admin',need:'profit',time:'all',idea:'x'.repeat(200)}),[V33_MARK_KEY]:JSON.stringify({completedVersion:1})});
 const d=readV33Transfer(s,'?v33Guide=1');
 assert.equal(d.stage,'');assert.equal(d.need,'');assert.equal(d.time,'');assert.equal(d.idea.length,120);
});
