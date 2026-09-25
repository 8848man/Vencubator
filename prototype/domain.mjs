import {STATS,SAMPLE,QUESTIONS,LESSONS} from './content.mjs';
export const blankStore=()=>({schemaVersion:1,user:null,projects:[],mastery:{},events:[],preferences:{reducedMotion:false,reminder:false,time:'19:00',days:['화','목']},route:{view:'welcome',projectId:null},forms:{},eventSequence:0});
const valid=x=>typeof x==='string'&&x.trim().length>0&&x.trim()!=='아직 모르겠어요';
const clean=x=>String(x??'').trim().slice(0,3000);
export function projectById(s,id){const p=s.projects.find(p=>p.id===id);if(!p)throw Error('프로젝트를 찾을 수 없어요. 목록에서 다시 선택해 주세요.');return p;}
function event(s,key,data){if(s.events.some(e=>e.key===key))return null;const e={id:`event-${++s.eventSequence}`,key,time:new Date().toISOString(),policyVersion:'prototype-0.1',...data};s.events.push(e);return e;}
export function createProject(s,{id,name,description}){
 if(s.projects.some(p=>p.id===id))return projectById(s,id);
 if(!valid(description))throw Error('아이디어를 한 문장으로 적어주세요.');
 const p={id,name:clean(name)||'이름 없는 아이디어',description:clean(description),draft:Object.fromEntries(QUESTIONS.map(q=>[q.key,''])),step:0,context:null,revision:0,scopeVersion:0,stats:Object.fromEntries(STATS.map(t=>[t.id,{milestone:0,highest:0,state:'unknown'}])),evidence:[],decisions:[],nextAction:null,uiDraft:{},createdAt:new Date().toISOString()};
 s.projects.push(p);event(s,`create:${id}`,{type:'project_created',projectId:id});return p;
}
export function confirmContext(s,id,patch){
 const p=projectById(s,id);const next=Object.fromEntries(QUESTIONS.map(q=>[q.key,clean(patch[q.key])||'아직 모르겠어요']));
 if(p.context&&JSON.stringify(next)===JSON.stringify(p.context))return [];
 p.scopeVersion++;p.revision++;p.context=next;p.draft={...next};p.nextAction=null;
 for(const stat of Object.values(p.stats)){stat.milestone=0;stat.state='unknown';}
 const rewards=[];
 for(const stat of ['customer','product']){
 const eligible=stat==='customer'?['customer','problem','method'].every(k=>valid(next[k])):['customer','solution','value','method'].every(k=>valid(next[k]));
 if(eligible){p.stats[stat].milestone=1;p.stats[stat].highest=Math.max(1,p.stats[stat].highest);rewards.push({subject:'project',stat,before:0,after:1,delta:0});}
 }
 event(s,`context:${id}:${p.revision}`,{type:'context_confirmed',projectId:id,rewards});return rewards;
}
export function seedSample(s){const id='sample-teamup';if(s.projects.some(p=>p.id===id))return projectById(s,id);const p=createProject(s,{id,...SAMPLE});confirmContext(s,id,SAMPLE);return p;}
export function submitQuiz(s,{concept,variant=0,choice,reason,application=false}){
 const l=LESSONS.find(l=>l.id===concept);if(!l)throw Error('학습 개념을 찾을 수 없어요.');
 const q=application?l.application:l.variants[variant];if(!q)throw Error('새 문제를 선택해 주세요.');
 const awardType=application?'application':'understanding';
 const attemptKey=`attempt:${concept}:${application?'application':variant}`;
 const old=s.events.find(e=>e.key===attemptKey);if(old)return {...old.result,repeated:true,delta:0};
 const correct=Number(choice)===q.answer&&Number(reason)===q.reason;
 const m=s.mastery[concept]??={understood:false,applied:false,xp:0,review:false};
 if(application&&!m.understood)throw Error('먼저 개념 이해를 확인해 주세요.');
 let delta=0;if(correct){const flag=application?'applied':'understood';if(!m[flag]){delta=application?20:10;m[flag]=true;m.xp+=delta;}m.review=false;}else m.review=true;
 m.checkedAt=new Date().toISOString();
 const result={correct,delta,stat:l.stat,why:q.why,application,repeated:false};
 event(s,attemptKey,{type:'learning_attempt',result});if(delta)event(s,`award:${concept}:${awardType}`,{type:'user_growth',subject:'user',stat:l.stat,delta});return result;
}
export function chooseAction(s,id,{title,criterion}){
 const p=projectById(s,id);if(!valid(title)||!valid(criterion))throw Error('할 일과 확인할 기준을 적어주세요.');
 const e=event(s,`action:${id}:${++p.revision}`,{type:'action_selected',projectId:id});
 p.nextAction={title:clean(title),criterion:clean(criterion),status:'planned',scopeVersion:p.scopeVersion,sequence:s.eventSequence,id:e.id};
 return p.nextAction;
}
export function commitEvidence(s,id,input){
 const p=projectById(s,id);if(!p.context)throw Error('아이디어 요약을 먼저 확인해 주세요.');
 if(p.evidence.some(e=>e.id===input.id))return {rewards:[],duplicate:true};
 if(!STATS.some(t=>t.id===input.stat))throw Error('영역을 선택해 주세요.');
 if(input.stat==='strategy')throw Error('전략 성장은 관찰 기록 뒤 나의 결정에서 확인해요.');
 if(!['customer','product'].includes(input.stat)&&!valid(input.claim))throw Error('이 영역에서 확인하려는 가설을 먼저 적어주세요.');
 if(!['field','simulation'].includes(input.kind))throw Error('근거 종류를 확인해 주세요.');
 for(const k of ['source','date','method','summary','limitations','interpretation'])if(!valid(input[k]))throw Error('출처·날짜·방법·관찰·한계·해석을 모두 적어주세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||Number.isNaN(Date.parse(input.date))||input.date>new Date().toISOString().slice(0,10))throw Error('관찰 날짜를 확인해 주세요.');
 if(!['supported','refuted','mixed'].includes(input.assessment))throw Error('해석을 선택해 주세요.');
 const e={...Object.fromEntries(Object.entries(input).map(([k,v])=>[k,clean(v)])),claim:clean(input.claim||p.context[input.stat==='product'?'value':'problem']),scopeVersion:p.scopeVersion,sequence:s.eventSequence+1};
 const identical=p.evidence.some(x=>x.scopeVersion===e.scopeVersion&&['source','date','summary','stat','kind','claim'].every(k=>x[k]===e[k]));
 if(identical)return {rewards:[],duplicate:true};
 p.evidence.push(e);p.revision++;
 const st=p.stats[e.stat];
 if(e.kind==='field'&&st.currentClaim&&st.currentClaim!==e.claim){st.milestone=0;st.state='unknown';}
 const before=st.milestone;
 const real=p.evidence.filter(x=>x.scopeVersion===p.scopeVersion&&x.stat===e.stat&&x.kind==='field'&&x.claim===e.claim);
 if(e.kind==='field'){
 st.currentClaim=e.claim;
 const statuses=new Set(real.map(x=>x.assessment));st.state=statuses.size===1?e.assessment:'mixed';
 // A documented customer/claim scope and method are required for a field milestone.
 if(valid(p.context.customer)&&valid(p.context.method)&&valid(e.claim)){
 st.milestone=Math.max(st.milestone,2);
 if(new Set(real.map(x=>x.source.trim().toLowerCase())).size>=2&&valid(e.comparison))st.milestone=Math.max(st.milestone,3);
 }
 st.highest=Math.max(st.highest,st.milestone);
 }
 const rewards=st.milestone>before?[{subject:'project',stat:e.stat,before,after:st.milestone,delta:0}]:[];
 event(s,`evidence:${id}:${e.id}`,{type:'evidence_recorded',projectId:id,kind:e.kind,rewards});return {rewards,duplicate:false};
}
export function commitDecision(s,id,{id:decisionId,choice,rationale,nextAction,comparison}){
 const p=projectById(s,id);if(p.decisions.some(d=>d.id===decisionId))return [];
 if(!['continue','change','pause'].includes(choice)||![rationale,nextAction].every(valid))throw Error('결정과 이유, 다음 행동을 적어주세요.');
 const real=p.evidence.filter(e=>e.scopeVersion===p.scopeVersion&&e.kind==='field'&&e.claim===p.stats[e.stat].currentClaim);
 if(!real.length)throw Error('가상 현장 관찰을 먼저 기록해 주세요. AI 시뮬레이션만으로 실제 검증 결정을 만들 수 없어요.');
 const rewards=[];
 for(const stat of STATS){const st=p.stats[stat.id],before=st.milestone;
 const matching=real.filter(e=>e.stat===stat.id);
 if(st.milestone>=3&&valid(comparison)&&p.nextAction?.scopeVersion===p.scopeVersion&&matching.every(e=>p.nextAction.sequence<e.sequence))st.milestone=4;
 if(stat.id==='strategy')st.milestone=Math.max(st.milestone,2);
 st.highest=Math.max(st.highest,st.milestone);if(st.milestone>before)rewards.push({subject:'project',stat:stat.id,before,after:st.milestone,delta:0});
 }
 p.decisions.push({id:decisionId,choice,rationale:clean(rationale),nextAction:clean(nextAction),comparison:clean(comparison),scopeVersion:p.scopeVersion,evidenceIds:real.map(e=>e.id),criterion:p.nextAction?.criterion??null,time:new Date().toISOString()});
 if(p.nextAction)p.nextAction.status=choice==='pause'?'deferred':'completed';p.revision++;
 event(s,`decision:${id}:${decisionId}`,{type:'decision_committed',projectId:id,rewards});return rewards;
}
export function transact(store,storage,mutation){const next=structuredClone(store);const result=mutation(next);storage.commit(next);return {store:next,result};}
