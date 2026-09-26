import test from 'node:test';
import assert from 'node:assert/strict';
import {blankStore,createProject,transact} from '../domain.mjs';
import {startLesson,moveLesson,getRun,answerLesson,lessonContent} from '../guided.mjs';
import {questionDraftKey,questionView,answerFeedback} from '../question-ui.mjs';
import {createGuided} from '../guided-ui.mjs';
const esc=v=>String(v??'').replaceAll('<','&lt;');
function setup(){const s=blankStore(),p=createProject(s,{id:'test',description:'테스트 아이디어'});startLesson(s,p.id);moveLesson(s,p.id);return {s,p,r:getRun(p,'customer')};}
test('choice and reason are separate visible panels, saved draft survives reload',()=>{
 const {s,p,r}=setup();let html=questionView(p,r,esc);assert.equal((html.match(/type="radio"/g)||[]).length,3);assert.ok(!html.includes('왜 그렇게 생각했나요?'));
 p.uiDraft[questionDraftKey(r)]={choice:'1',reason:'0',panel:'reason'};
 const restored=JSON.parse(JSON.stringify(s)).projects[0];html=questionView(restored,r,esc);
 assert.ok(html.includes('왜 그렇게 생각했나요?'));assert.match(html,/name="choice" value="1"/);assert.match(html,/name="reason" value="0" required checked/);
 p.uiDraft[questionDraftKey(r)].panel='choice';assert.match(questionView(p,r,esc),/name="choice" value="1" required checked/);
});
test('draft identity separates scope, concept, retry and transfer',()=>{
 const {r}=setup();const keys=[r,{...r,scopeVersion:99},{...r,concept:'market'},{...r,variant:1},{...r,step:'transfer'}].map(questionDraftKey);assert.equal(new Set(keys).size,5);
});
test('answer review does not score again and feedback distinguishes choice/reason',()=>{
 const {s,p,r}=setup(),q=lessonContent('customer');answerLesson(s,p.id,{choice:q.answer,reason:(q.reason+1)%3});
 const before=JSON.stringify(s);const feedback=answerFeedback(r,esc);assert.match(feedback,/답 선택 · <strong>맞았어요/);assert.match(feedback,/이유 선택 · <strong>다시 살펴봐요/);
 assert.ok(questionView(p,r,esc).includes('해설 다시 보기'));assert.equal(JSON.stringify(s),before);
});
test('first panel only saves draft, failed save cannot advance',()=>{
 let {s,p,r}=setup();let fail=false;
 const guided=createGuided({getState:()=>s,update:fn=>{try{s=transact(s,{commit(){if(fail)throw Error('quota');}},fn).store;return {ok:true};}catch{return {ok:false};}},esc});
 fail=true;guided.submit({id:'guided-answer'},{panel:'choice',choice:'1'});assert.equal(s.projects[0].uiDraft[questionDraftKey(r)],undefined);
 fail=false;guided.submit({id:'guided-answer'},{panel:'choice',choice:'1'});assert.equal(s.projects[0].uiDraft[questionDraftKey(r)].panel,'reason');assert.equal(getRun(s.projects[0],'customer').results.question,undefined);
});
