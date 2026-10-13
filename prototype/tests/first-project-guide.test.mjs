import test from 'node:test';
import assert from 'node:assert/strict';
import {readV33Transfer,createFirstProjectGuide,V33_DRAFT_KEY,V33_MARK_KEY} from '../first-project-guide.mjs';
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
test('idea-free entry is a distinct app mode without a project-guide requirement',()=>{
 const s=store({[V33_DRAFT_KEY]:JSON.stringify({stage:'new',need:'learning',time:'slow',idea:''}),[V33_MARK_KEY]:JSON.stringify({completedVersion:1})});
 assert.deepEqual(readV33Transfer(s,'?v33Explore=1'),{stage:'new',need:'learning',time:'slow',idea:''});
 assert.equal(readV33Transfer(s,'?v33Explore=1').idea,'');
 assert.equal(readV33Transfer(store({[V33_DRAFT_KEY]:JSON.stringify({stage:'new'})}),'?v33Explore=1'),null);
});
test('idea-free entry opens existing project list without creating or prefilling a project',()=>{
 const s=store({[V33_DRAFT_KEY]:JSON.stringify({stage:'new',need:'learning',time:'slow',idea:''}),[V33_MARK_KEY]:JSON.stringify({completedVersion:1})});
 const originalDocument=globalThis.document,originalAdd=globalThis.addEventListener;
 globalThis.document={addEventListener(){}};globalThis.addEventListener=()=>{};
 try{
  const state={user:null,route:{view:'welcome',projectId:null},forms:{onboarding:{},new:{description:'기존 초안'}},projects:[]};
  const guide=createFirstProjectGuide({storage:s,search:'?v33Explore=1',getState:()=>state,go(){},update:change=>{change(state);return {ok:true};}});
  assert.equal(guide.start(),true);
  assert.equal(guide.active,false);
  assert.equal(state.route.view,'projects');
  assert.equal(state.projects.length,0);
  assert.equal(state.forms.new.description,'기존 초안');
  assert.equal(state.user.name,'메이커');
 }finally{globalThis.document=originalDocument;globalThis.addEventListener=originalAdd;}
});
