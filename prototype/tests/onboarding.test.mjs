import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceOnboarding,onboardingView,firstSuggestion} from '../onboarding.mjs';

test('invalid choice cannot advance or inject an arbitrary profile value',()=>{
  const next=advanceOnboarding({step:1},'choice','unknown','stage');
  assert.equal(next.step,1);
  assert.equal(next.stage,undefined);
});
test('optional idea is bounded and escaped in the rendered summary',()=>{
  const idea='<img src=x onerror=alert(1)>'.repeat(10);
  const data=advanceOnboarding({step:4},'idea',idea);
  assert.equal(data.idea.length,120);
  const html=onboardingView({...data,step:5});
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
});
test('back preserves answers and summary remains a suggestion',()=>{
  const picked=advanceOnboarding({step:2,stage:'forming'},'choice','question','need');
  const back=advanceOnboarding(picked,'back');
  assert.equal(back.step,2);
  assert.equal(back.need,'question');
  assert.match(firstSuggestion(back),/질문/);
  assert.equal(advanceOnboarding({...back,step:5},'finish').completed,true);
});
