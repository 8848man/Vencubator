import test from 'node:test';
import assert from 'node:assert/strict';
import {blankStore,createProject,confirmContext,transact,commitEvidence,commitDecision} from '../domain.mjs';
import {startLesson,moveLesson,getRun,lessonContent,answerLesson,completeLesson,finishFieldTask} from '../guided.mjs';
import {projectTasks,sortTasks,resumeTask,planTaskField,beginFieldRecord,evidenceDraftKey,saveTaskMeta} from '../tasks.mjs';
import {storageAdapter} from '../adapters.mjs';
const setup=()=>{const s=blankStore();const p=createProject(s,{id:'p',description:'작업 흐름 테스트'});return {s,p};};
const preparation={target:'팀플하는 대학생',artifact:'최근 팀원을 구한 경험을 물어보기',criterion:'문제가 다르면 가설 수정하기'};
function learn(s,p,c='customer'){startLesson(s,p.id,c);if(getRun(p,c).step==='concept')moveLesson(s,p.id);const r=getRun(p,c);if(r.step==='question'){const q=lessonContent(c);answerLesson(s,p.id,{choice:q.answer,reason:q.reason});moveLesson(s,p.id);}const q=lessonContent(c,0,true);answerLesson(s,p.id,{choice:q.answer,reason:q.reason});moveLesson(s,p.id);return completeLesson(s,p.id,preparation);}
test('two entrances reuse run, resume does not regrade, stable id through first scope creation',()=>{
 const {s,p}=setup();assert.equal(projectTasks(p)[0].status,'ready');resumeTask(s,p.id,'new:customer');moveLesson(s,p.id);
 const t=projectTasks(p)[0];p.uiDraft['saved-answer']={choice:'1'};const before=s.events.length;resumeTask(s,p.id,t.id);assert.equal(getRun(p,'customer').step,'question');assert.equal(s.events.length,before);
 learn(s,p);assert.equal(projectTasks(p)[0].id,t.id);assert.equal(projectTasks(p)[0].label,'학습 완료 · 실행 준비');
});
test('parallel field tasks and per-task draft isolation',()=>{
 const {s,p}=setup(),a=learn(s,p),t1=planTaskField(s,p.id,a.id);beginFieldRecord(s,p.id,t1.id);p.uiDraft[evidenceDraftKey(t1.id)].summary='첫 작업 기록';
 const b=learn(s,p,'product'),t2=planTaskField(s,p.id,b.id);beginFieldRecord(s,p.id,t2.id);assert.equal(p.uiDraft[evidenceDraftKey(t2.id)].summary,undefined);
 assert.equal(p.fieldTasks.filter(t=>t.status==='planned').length,2);
 const one=projectTasks(p).find(t=>t.field?.id===t1.id);resumeTask(s,p.id,one.id);assert.equal(s.route.fieldTaskId,t1.id);assert.equal(s.route.view,'evidence');assert.equal(p.uiDraft[evidenceDraftKey(t1.id)].summary,'첫 작업 기록');
});
test('metadata, waiting, deterministic sorting, serialization and stale scope',()=>{
 const {s,p}=setup();learn(s,p);const t=projectTasks(p)[0];saveTaskMeta(s,p.id,t.id,{status:'waiting',priority:'high',dueAt:'2026-10-01',minutes:20});
 const restored=JSON.parse(JSON.stringify(s)).projects[0];assert.equal(projectTasks(restored)[0].status,'waiting');assert.equal(sortTasks(projectTasks(restored))[0].status,'ready');
 assert.throws(()=>saveTaskMeta(s,p.id,t.id,{status:'active',priority:'high',dueAt:'2026-02-31',minutes:20}));
 confirmContext(s,p.id,{...p.context,customer:'새로운 대상 고객'});assert.equal(projectTasks(p)[0].status,'archived');assert.throws(()=>resumeTask(s,p.id,t.id));
});
test('failed transaction cannot create duplicate run or metadata',()=>{
 const {s,p}=setup(),before=JSON.stringify(s);assert.throws(()=>transact(s,{commit(){throw Error('quota');}},x=>resumeTask(x,p.id,'new:customer')));assert.equal(JSON.stringify(s),before);
 resumeTask(s,p.id,'new:customer');const id=projectTasks(p)[0].id;resumeTask(s,p.id,id);resumeTask(s,p.id,id);assert.equal(Object.keys(p.learningRuns).length,1);
});
test('other tab writes cannot be overwritten',()=>{
 const m=new Map(),st={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
 const a=storageAdapter(st),b=storageAdapter(st),sa=a.load(),sb=b.load();sa.user={name:'A'};a.commit(sa);assert.throws(()=>b.commit(sb),/다른 탭/);assert.equal(a.load().user.name,'A');
});
test('field evidence completes ordinary flow; strategy waits for separate decision',()=>{
 for(const concept of ['customer','strategy']){
  const {s,p}=setup(),a=learn(s,p,concept),t=planTaskField(s,p.id,a.id);
  const input={id:'e',taskId:t.id,kind:'field',stat:'customer',claim:a.text,source:'가상 고객 A',date:new Date().toISOString().slice(0,10),method:'가상 인터뷰',summary:'최근 경험 관찰',interpretation:'문제 가설 비교',limitations:'가상 사례 한 건',assessment:'mixed'};
  commitEvidence(s,p.id,input);finishFieldTask(s,p.id,input);
  assert.equal(projectTasks(p).find(f=>f.concept===concept).status,concept==='strategy'?'active':'completed');
  if(concept==='strategy'){const flow=projectTasks(p).find(f=>f.concept===concept);resumeTask(s,p.id,flow.id);assert.equal(s.route.view,'decision');commitDecision(s,p.id,{id:'d',choice:'change',rationale:'다른 문제 확인 필요',nextAction:'다음 인터뷰 준비',comparison:''});assert.equal(projectTasks(p).find(f=>f.concept===concept).status,'completed');}
 }
});
