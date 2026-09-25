import {LESSONS} from './content.mjs';
import {projectById,submitQuiz,confirmContext,chooseAction} from './domain.mjs';

export const PATH=['customer','product','market','gtm','finance','operations','strategy'];
export const QUESTS={
 customer:{name:'진짜 불편을 발견하기',outcome:'고객에게 물어볼 질문',prompt:'최근 행동과 현재 해결 방법을 알아볼 질문을 적어보세요.',example:'마지막으로 팀원을 찾았을 때 어떻게 구했고, 어디서 막혔나요?',action:'대상 고객 한 명에게 준비한 질문으로 최근 경험 듣기',criterion:'모집보다 다른 불편이 크다면 문제 가설을 다시 정한다.',scene:'“좋네요!”라는 말만 듣고 앱을 만들었는데, 아무도 쓰지 않는다면?',lesson:'칭찬보다 지난 행동을 물어보세요.',icon:'◎'},
 product:{name:'작게 만들어 확인하기',outcome:'확인할 핵심 과업',prompt:'가장 작은 첫 버전으로 고객이 해볼 행동을 한 가지 적어보세요.',example:'시간과 희망 역할을 받아 수동으로 팀원 한 명을 연결한다.',action:'한 사람에게 핵심 과업을 해보게 하고 막히는 지점 관찰하기',criterion:'도움 없이 과업을 끝내지 못하면 흐름을 줄인다.',scene:'추천 알고리즘을 만들기 전에, 직접 한 번 연결해볼 수 있을까요?',lesson:'기능 수보다 고객에게 생기는 변화가 중요해요.',icon:'◇'},
 market:{name:'첫 번째 시장 찾기',outcome:'비교할 현재 대안',prompt:'고객이 현재 쓰는 대안과 비교할 기준을 적어보세요.',example:'학과 단톡방과 학교 커뮤니티를 모집 시간과 역할 정보로 비교한다.',action:'현재 대안 한 곳의 실제 이용 방식과 조건 확인하기',criterion:'기존 대안만으로 충분하다면 다른 불편을 찾는다.',scene:'전국의 모든 대학생보다, 이번 주 만날 수 있는 고객은 누구인가요?',lesson:'접근할 수 있는 범위부터 살펴봐요.',icon:'◈'},
 gtm:{name:'관심을 행동으로 바꾸기',outcome:'작은 제안 문구',prompt:'어디에서 어떤 고객에게 무엇을 제안할지 적어보세요.',example:'허용된 학과 게시판에 수동 매칭 체험 신청을 제안한다.',action:'허용된 채널에서 작은 제안 한 번 실행하고 반응 기록하기',criterion:'조회만 있고 체험 약속이 없다면 제안 내용을 바꾼다.',scene:'조회 수는 늘었는데 체험 신청은 없다면, 무엇을 배울 수 있을까요?',lesson:'노출과 실제 선택을 구별해요.',icon:'↗'},
 finance:{name:'한 번 팔면 얼마나 남을까',outcome:'한 건의 수입·비용 가설',prompt:'한 건의 가격과 직접 비용, 아직 모르는 비용을 적어보세요.',example:'가격 5천 원, 직접 비용 2천 원. 고객을 만나는 비용은 아직 모른다.',action:'가정한 비용 하나를 실제 견적이나 가격 자료로 확인하기',criterion:'직접 비용이 가격보다 크면 가격 또는 제공 방식을 바꾼다.',scene:'1만 원을 벌었다고 1만 원이 남는 것은 아니에요.',lesson:'매출, 비용, 현금의 차이를 알아봐요.',icon:'₩'},
 operations:{name:'작은 약속을 지키기',outcome:'한 번 제공할 실행 순서',prompt:'고객 한 명에게 약속을 지키기 위한 순서와 담당을 적어보세요.',example:'신청 확인→조건 확인→후보 연락→연결 결과 확인을 내가 담당한다.',action:'제공 순서를 한 번 연습하고 시간과 병목 기록하기',criterion:'약속한 시간 안에 못 끝내면 가장 오래 걸린 단계를 줄인다.',scene:'첫 고객이 생겼어요. 이제 누가, 언제, 무엇을 해야 할까요?',lesson:'반복할 수 있는 작은 절차가 필요해요.',icon:'▦'},
 strategy:{name:'다음 방향을 직접 고르기',outcome:'실험과 중단 기준',prompt:'가장 불확실한 가설과 어떤 결과에서 생각을 바꿀지 적어보세요.',example:'모집이 가장 큰 문제라는 가설. 역할 갈등이 더 크다면 방향을 바꾼다.',action:'정한 기준으로 한 실험을 실행하고 유지·수정·보류 판단하기',criterion:'실험 전에 정한 기준과 실제 결과를 비교한다.',scene:'예상과 다른 반응을 들었어요. 실패일까요, 새로운 단서일까요?',lesson:'결과를 보기 전에 판단 기준을 정해요.',icon:'✧'}
};
const clean=v=>String(v??'').trim().slice(0,3000);
const meaningful=v=>clean(v).length>=5&&clean(v)!=='아직 모르겠어요';
export const runKey=(p,concept)=>`${p.scopeVersion}:${concept}`;
export const getRun=(p,c)=>p?.learningRuns?.[runKey(p,c)];
export function nextConcept(p){
 const active=PATH.find(c=>{const r=getRun(p,c);return r&&r.step!=='complete';});if(active)return active;
 if(['refuted','mixed'].includes(p.stats.customer.state)&&!getRun(p,'strategy')?.completedAt)return 'strategy';
 return PATH.find(c=>!getRun(p,c)?.completedAt)||'customer';
}
export function startLesson(s,id,concept=nextConcept(projectById(s,id))){
 if(!PATH.includes(concept))throw Error('학습을 찾을 수 없어요.');
 const p=projectById(s,id);p.learningRuns??={};const key=runKey(p,concept);
 p.learningRuns[key]??={concept,scopeVersion:p.scopeVersion,step:'concept',variant:0,results:{},createdAt:new Date().toISOString()};
 s.route={view:'session',projectId:id,concept};return p.learningRuns[key];
}
function activeRun(s,id){const p=projectById(s,id),r=getRun(p,s.route.concept);if(!r)throw Error('학습 길에서 다시 시작해 주세요.');return {p,r};}
export function moveLesson(s,id){const {r}=activeRun(s,id);
 if(r.step==='concept')r.step=s.mastery[r.concept]?.understood?'transfer':'question';
 else if(r.step==='question'){
  if(!r.results.question)throw Error('답을 먼저 확인해 주세요.');
  if(r.results.question.correct)r.step='transfer';
  else if(r.variant===0){r.variant=1;delete r.results.question;}
  else {r.assisted=true;r.step='apply';}
 }else if(r.step==='transfer'){
  if(!r.results.transfer)throw Error('답을 먼저 확인해 주세요.');r.step='apply';
 }
}
export function answerLesson(s,id,answer){const {r}=activeRun(s,id);
 if(!['question','transfer'].includes(r.step))throw Error('문제 단계가 아니에요.');
 if(r.results[r.step])return {...r.results[r.step],delta:0,repeated:true};
 if(!['0','1','2'].includes(String(answer.choice))||!['0','1','2'].includes(String(answer.reason)))throw Error('답과 이유를 골라주세요.');
 const result=submitQuiz(s,{concept:r.concept,variant:r.variant,choice:answer.choice,reason:answer.reason,application:r.step==='transfer'});
 r.results[r.step]={...result,choice:String(answer.choice),reason:String(answer.reason)};return result;
}
export function completeLesson(s,id,input){const {p,r}=activeRun(s,id);if(r.step==='complete')return p.learningArtifacts.find(a=>a.id===r.artifactId);
 if(r.step!=='apply')throw Error('응용 단계에서 저장해 주세요.');
 if(![input.target,input.artifact,input.criterion].every(meaningful))throw Error('대상·준비물·판단 기준을 각각 구체적으로 적어주세요. (5자 이상)');
 p.learningArtifacts??=[];const artifact={id:`learning:${id}:${r.scopeVersion}:${r.concept}`,concept:r.concept,target:clean(input.target),text:clean(input.artifact),criterion:clean(input.criterion),scopeVersion:p.scopeVersion,time:new Date().toISOString(),kind:'user_confirmed_preparation'};
 // First application explicitly confirms a minimal hypothesis; existing context is never silently replaced.
 if(!p.context){confirmContext(s,id,{...p.draft,customer:artifact.target,method:QUESTS[r.concept].action});artifact.scopeVersion=p.scopeVersion;p.learningRuns[runKey(p,r.concept)]=r;delete p.learningRuns[`${r.scopeVersion}:${r.concept}`];r.scopeVersion=p.scopeVersion;}
 p.learningArtifacts.push(artifact);r.step='complete';r.completedAt=artifact.time;r.artifactId=artifact.id;
 p.uiDraft[`guided-${r.concept}`]={};
 s.events.push({id:`event-${++s.eventSequence}`,key:`lesson:${artifact.id}`,type:'lesson_completed',projectId:id,concept:r.concept,artifactId:artifact.id,time:artifact.time,policyVersion:'guided-0.1'});
 return artifact;
}
export function planFieldTask(s,id,artifactId,{replace=false}={}){
 const p=projectById(s,id),a=p.learningArtifacts?.find(a=>a.id===artifactId);if(!a)throw Error('준비물을 먼저 완성해 주세요.');
 if(a.scopeVersion!==p.scopeVersion)throw Error('이전 가설의 준비물이에요. 새 범위에서 다시 확인해 주세요.');
 p.fieldTasks??=[];const old=p.fieldTasks.find(t=>t.artifactId===artifactId);if(old?.status==='completed')return old;
 for(const task of p.fieldTasks)if(task.status==='planned'&&task.scopeVersion!==p.scopeVersion)task.status='deferred';
 const current=p.fieldTasks.find(t=>t.status==='planned');if(current?.artifactId===artifactId)return current;
 if(current&&!replace)throw Error('진행 중인 실행이 있어요. 교체 여부를 확인해 주세요.');
 if(current)current.status='deferred';
 chooseAction(s,id,{title:QUESTS[a.concept].action,criterion:a.criterion});
 if(old){old.status='planned';return old;}
 const task={id:`task:${artifactId}`,artifactId,concept:a.concept,scopeVersion:p.scopeVersion,title:QUESTS[a.concept].action,criterion:a.criterion,status:'planned',createdAt:new Date().toISOString()};
 p.fieldTasks.push(task);return task;
}
export function finishFieldTask(s,id,evidence){const p=projectById(s,id),task=p.fieldTasks?.find(t=>t.id===evidence.taskId);if(!task||evidence.kind!=='field'||task.scopeVersion!==p.scopeVersion)return;
 task.status='completed';task.evidenceId=evidence.id;task.completedAt=new Date().toISOString();
 if(p.nextAction?.title===task.title)p.nextAction.status='completed';
}
export function lessonContent(concept,variant=0,transfer=false){const l=LESSONS.find(l=>l.id===concept);return transfer?l.application:l.variants[variant];}
