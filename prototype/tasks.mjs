import {projectById,chooseAction} from './domain.mjs';
import {PATH,QUESTS,getRun,nextConcept,startLesson,planFieldTask} from './guided.mjs';

export const TASK_STATES={active:'진행 중',ready:'시작할 일',waiting:'외부 대기',paused:'잠시 보류',cancelled:'취소',completed:'완료',archived:'이전 가설'};
export const evidenceDraftKey=id=>`task-evidence:${id}`;
export const applicationDraftKey=r=>`guided:${r.scopeVersion}:${r.concept}`;
export const flowId=(p,r,key)=>`flow:${p.id}:${r.concept}:${r.originScopeVersion??'legacy'}:${r.createdAt||key}`;
export function fieldDraft(p,t){return p.uiDraft[evidenceDraftKey(t.id)]||(p.uiDraft.evidence?.taskId===t.id?p.uiDraft.evidence:{});}
export function projectTasks(p){
 if(!p)return [];
 const flows=Object.entries(p.learningRuns||{}).map(([key,r])=>{
  const id=flowId(p,r,key),meta=p.taskMeta?.[id]||{},field=p.fieldTasks?.find(t=>t.artifactId===r.artifactId&&r.artifactId),artifact=p.learningArtifacts?.find(a=>a.id===r.artifactId);
  const evidence=field&&p.evidence.find(e=>e.id===field.evidenceId);
  const decided=!!evidence&&p.decisions.some(d=>d.evidenceIds?.includes(evidence.id));
  const done=!!evidence&&(r.concept!=='strategy'||decided);
  const archived=r.scopeVersion!==p.scopeVersion||!QUESTS[r.concept]||(meta.flowVersion&&meta.flowVersion!==1);
  const status=archived?'archived':done?'completed':['waiting','paused','cancelled'].includes(meta.status)?meta.status:field?.status==='deferred'?'paused':'active';
  const draft=field?fieldDraft(p,field):{};
  const step=evidence?(done?'done':'decision'):field?(draft.summary?'record':'execute'):r.completedAt?'plan':r.step;
  const labels={concept:'개념을 배우는 중',question:r.results?.question?'문제 해설 확인 · 다음 단계 준비':'문제를 푸는 중',transfer:r.results?.transfer?'응용 해설 확인 · 준비물 작성 전':'새 상황에 적용하는 중',apply:'내 프로젝트 준비물 작성 중',plan:'학습 완료 · 실행 준비',execute:'학습 완료 · 현장 실행',record:'실행 결과 작성 중',decision:'결과를 보고 방향 결정',done:'실행과 회고 완료'};
  const next={concept:'짧은 개념부터 이어서 읽어요',question:'저장한 답과 이유를 이어서 확인해요',transfer:'새로운 상황의 문제를 이어서 풀어요',apply:'작성하던 준비물을 완성해요',plan:'준비한 내용으로 실행을 시작해요',execute:QUESTS[r.concept]?.action,record:'관찰과 해석을 마저 기록해요',decision:'근거를 보고 유지·수정·보류를 결정해요',done:'남긴 근거와 결정을 돌아봐요'};
  const stages=[r.step!=='concept',!!r.completedAt||r.step==='apply',!!artifact,!!evidence,done];
  return {id,projectId:p.id,concept:r.concept,run:r,field,artifact,scopeVersion:r.scopeVersion,status,step,title:QUESTS[r.concept]?.name||'이전 학습',label:labels[step]||'이전 흐름',next:next[step]||'기록을 확인해 주세요',stages,skippedQuestion:stages[1]&&!r.results?.question,priority:meta.priority||'normal',dueAt:meta.dueAt||'',minutes:meta.minutes||(field?20:3),reason:meta.priority==='high'?'직접 중요하게 지정했어요':'진행 중인 작업을 마무리할 수 있어요',meta};
 });
 const next=nextConcept(p);
 if(!getRun(p,next))flows.push({id:`new:${next}`,projectId:p.id,concept:next,status:'ready',step:'concept',title:QUESTS[next].name,label:'새로운 학습',next:'개념부터 짧게 시작해요',stages:[false,false,false,false,false],priority:'normal',dueAt:'',minutes:3,reason:'학습 로드맵의 다음 단계예요',meta:{}});
 return flows;
}
export function sortTasks(tasks,sort='recommended'){
 const rank={active:0,ready:1,waiting:2,paused:3,completed:4,cancelled:5,archived:6},priority={high:0,normal:1,low:2};
 const due=t=>t.dueAt||'9999-12-31';
 return [...tasks].sort((a,b)=>{
  const group=rank[a.status]-rank[b.status];
  if(group&&(sort==='recommended'||rank[a.status]>1||rank[b.status]>1))return group;
  if(sort==='deadline')return due(a).localeCompare(due(b))||group||a.id.localeCompare(b.id);
  if(sort==='short')return a.minutes-b.minutes||group||a.id.localeCompare(b.id);
  return priority[a.priority]-priority[b.priority]||due(a).localeCompare(due(b))||a.minutes-b.minutes||a.id.localeCompare(b.id);
 });
}
export function findTask(p,id){const t=projectTasks(p).find(t=>t.id===id);if(!t)throw Error('작업을 찾을 수 없어요. 목록에서 다시 선택해 주세요.');return t;}
export function saveTaskMeta(s,pid,id,input){
 const p=projectById(s,pid),t=findTask(p,id);if(['ready','archived','completed'].includes(t.status))throw Error('현재 작업의 설정은 바꿀 수 없어요.');
 if(!['active','waiting','paused','cancelled'].includes(input.status)||!['high','normal','low'].includes(input.priority))throw Error('작업 상태와 중요도를 선택해 주세요.');
 const minutes=Number(input.minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>480)throw Error('예상 시간은 1~480분으로 적어주세요.');
 const dueAt=String(input.dueAt||'');if(dueAt&&(!/^\d{4}-\d{2}-\d{2}$/.test(dueAt)||new Date(dueAt+'T00:00:00Z').toISOString().slice(0,10)!==dueAt))throw Error('목표일을 확인해 주세요.');
 p.taskMeta??={};p.taskMeta[id]={flowVersion:1,status:input.status,priority:input.priority,dueAt,minutes,updatedAt:new Date().toISOString()};
 if(t.field&&input.status==='active'&&t.field.status==='deferred')t.field.status='planned';
}
export function selectFieldTask(s,pid,id){
 const p=projectById(s,pid),t=p.fieldTasks?.find(t=>t.id===id&&t.scopeVersion===p.scopeVersion);if(!t)throw Error('현재 프로젝트의 실행 과제를 선택해 주세요.');
 s.route={view:'fieldtask',projectId:pid,fieldTaskId:t.id};
 // Compatibility only: the selected task supplies its own pre-recorded criterion.
 if(p.nextAction?.title!==t.title)chooseAction(s,pid,{title:t.title,criterion:t.criterion});
 return t;
}
export function beginFieldRecord(s,pid,id){
 const p=projectById(s,pid),t=selectFieldTask(s,pid,id),a=p.learningArtifacts.find(a=>a.id===t.artifactId);if(!a)throw Error('준비물을 찾을 수 없어요.');
 p.uiDraft[evidenceDraftKey(t.id)]={...fieldDraft(p,t),taskId:t.id,kind:'field',stat:t.concept==='strategy'?'customer':t.concept,claim:a.text,method:t.title};
 s.route.view='evidence';
}
export function resumeTask(s,pid,id){
 const p=projectById(s,pid),t=findTask(p,id);if(t.status==='archived')throw Error('이전 가설 또는 지원하지 않는 작업이에요. 기록을 보존하고 새 학습에서 확인해 주세요.');
 if(t.status==='completed'){s.route={view:'journal',projectId:pid};return;}
 if(t.status==='ready'){startLesson(s,pid,t.concept);return;}
 p.taskMeta??={};p.taskMeta[id]={...t.meta,status:'active',flowVersion:1};
 if(t.step==='decision'){selectFieldTask(s,pid,t.field.id);s.route.view='decision';return;}
 if(t.field){if(t.field.status==='deferred')t.field.status='planned';if(t.step==='record')beginFieldRecord(s,pid,t.field.id);else selectFieldTask(s,pid,t.field.id);return;}
 startLesson(s,pid,t.concept);
}
export function startTaskLesson(s,pid,concept){
 startLesson(s,pid,concept);
 const p=projectById(s,pid),t=projectTasks(p).find(t=>t.concept===concept&&t.scopeVersion===p.scopeVersion);
 if(t&&p.taskMeta?.[t.id])p.taskMeta[t.id]={...p.taskMeta[t.id],status:'active'};
}
export function planTaskField(s,pid,artifactId){const t=planFieldTask(s,pid,artifactId,{parallel:true});selectFieldTask(s,pid,t.id);return t;}
