import {STATS} from './content.mjs';
import {projectTasks,sortTasks,findTask,resumeTask,saveTaskMeta,TASK_STATES} from './tasks.mjs';
import {openFocusDialog,closeFocusDialog} from './focus-dialog.mjs';

const TASK_STEPS=['개념 배우기','문제와 이유 확인','내 프로젝트 준비','실행 결과 기록','회고·방향 확인'];

export function createTaskUI({getState,update,esc,toast}){
 const project=()=>getState().projects.find(p=>p.id===getState().route.projectId);
 let sort='recommended';
 // 작업 상세는 들어온 화면(학습 로드맵·프로젝트 상세)으로 돌아간다. route.from 에 저장해 새로고침 뒤에도 유지.
 const ORIGINS={dashboard:'학습 로드맵',details:'프로젝트 상세'};
 const originOf=r=>ORIGINS[r?.from]?r.from:'dashboard';
 let historyArmed=false,backOrigin=null; // 브라우저·기기 뒤로가기 연결 (같은 탭에서 상세로 들어온 경우만)
 const canHistory=typeof history!=='undefined'&&typeof addEventListener==='function';
 function goBack(origin=backOrigin||originOf(getState().route)){historyArmed=false;backOrigin=null;closeFocusDialog();update(s=>{s.route={view:origin,projectId:s.route.projectId};});}
 if(canHistory)addEventListener('popstate',e=>{if(!historyArmed||e.state?.vcTask)return;const r=getState().route;if(r.view==='taskdetail'||backOrigin)goBack();});
 const control=(text,action,id,cls='primary')=>`<button type="button" class="btn ${cls}" data-task="${action}" data-task-id="${esc(id)}">${text}</button>`;
 const area=t=>STATS.find(s=>s.id===t.concept)?.name||'이전 학습';
 const badge=t=>`<span class="task-state">${TASK_STATES[t.status]}</span>`;
 // SPEC-013 r0.4: 카드 상단 한 행의 컴팩트 단계 표시. 단계명·상태는 보조 기술에만 제공하고, 화면에서는 체크/중심 점/빈 원 형태로 구분한다.
 const CHECK='<svg viewBox="0 0 12 12" focusable="false"><path d="M2.6 6.3l2.2 2.2 4.6-4.9"/></svg>';
 function progress(t){const current=t.stages.indexOf(false),state=i=>t.stages[i]?'done':i===current?'current':'upcoming';
  const label=current<0?'작업 진행 단계, 5단계 모두 완료':`작업 진행 단계, 5단계 중 ${current+1}단계 진행 중`;
  return `<ol class="task-progress task-progress-track" aria-label="${label}">${TASK_STEPS.map((name,i)=>`<li class="${state(i)}" ${i===current?'aria-current="step"':''}><span class="task-progress-node" aria-hidden="true">${t.stages[i]?CHECK:''}</span><span class="task-progress-sr">${i+1}단계 ${name} · ${({done:'완료',current:'현재',upcoming:'미완'})[state(i)]}</span></li>`).join('')}</ol>`;}
 function card(t,featured=false){const active=t.status==='active';return `<article class="task-card ${featured?'featured':''}"><div class="task-card-top${active?' has-progress':''}">${badge(t)}${active?progress(t):''}<span class="task-area">${esc(area(t)).replace(/·/g,'\u2060·\u2060')}</span></div><h3>${esc(t.title)}</h3><p class="task-stage">${esc(t.label)}</p>${active&&t.skippedQuestion?'<p class="task-progress-note">문제 단계는 기존 이해를 활용했어요.</p>':''}<p>${esc(t.next)}</p><div class="task-meta"><span>다음 행동 약 ${t.minutes}분</span>${t.dueAt?`<span>목표 ${esc(t.dueAt)}</span>`:''}${t.priority==='high'?'<span>중요도 높음</span>':''}</div>${control(t.status==='ready'?'작업 살펴보기':'이어서 할 일 보기','detail',t.id,'soft wide')}</article>`;}
 function list(){const p=project();if(!p)return '<p>프로젝트를 먼저 선택해 주세요.</p>';const tasks=sortTasks(projectTasks(p),sort);
  return `<p class="task-project">${esc(p.name)}의 작업 · 기록은 이 브라우저에 저장돼요.</p><label class="task-sort">정렬<select data-task-sort aria-label="작업 정렬"><option value="recommended" ${sort==='recommended'?'selected':''}>추천순</option><option value="deadline" ${sort==='deadline'?'selected':''}>마감순</option><option value="short" ${sort==='short'?'selected':''}>짧은 시간순</option></select></label><div class="task-list">${tasks.map((t,i)=>`${i===0||tasks[i-1].status!==t.status?`<h3 class="task-group-title">${({active:'이어서 할 일',ready:'새로 시작할 일',waiting:'외부 결과를 기다리는 일',paused:'잠시 보류한 일',completed:'완료한 일',cancelled:'취소한 일',archived:'이전 가설의 기록'})[t.status]}</h3>`:''}${card(t)}`).join('')||'<p>남아 있는 작업이 없어요. 학습 로드맵에서 다음 배움을 선택해 주세요.</p>'}</div>`;
 }
 function openList(){openFocusDialog({title:'지금 할 일',body:list(),actionLabel:'목록 닫기',returnFocus:'[data-task="list"]',className:'task-sheet'});}
 function preview(){const p=project();if(!p)return '';const all=projectTasks(p),open=all.filter(t=>['active','ready','waiting'].includes(t.status)).length,t=sortTasks(all).find(t=>['active','ready'].includes(t.status));
  const done=t?t.stages.filter(Boolean).length:0;
  return `<section class="task-preview" aria-labelledby="task-preview-title"><div class="task-preview-head"><span class="task-preview-kicker"><i aria-hidden="true"></i>지금 할 일</span>${control(`전체 ${open}개 보기`,'list','','link')}</div>${t?`<h2 id="task-preview-title">${esc(t.title)}</h2><div class="task-preview-meta"><span>${esc(t.label)}</span><span>약 ${t.minutes}분</span><span>${done}/5 단계</span></div><p>${esc(t.next)}</p>${control(t.status==='ready'?'시작하기 →':'이어서 하기 →','resume',t.id,'primary wide')}`:'<h2 id="task-preview-title">잠시 기다리는 작업이 있어요.</h2><p>전체 목록에서 대기·보류한 일을 확인할 수 있어요.</p>'}</section>`;
 }
 function floating(){const p=project();if(!p||!['dashboard','details'].includes(getState().route.view))return '';const n=projectTasks(p).filter(t=>['active','ready','waiting'].includes(t.status)).length;return `<button class="task-fab" type="button" data-task="list" aria-label="지금 할 일 ${n}개 보기"><span aria-hidden="true">☷</span> 지금 할 일 <strong>${n}</strong></button>`;}
 function detail(){const p=project();let t;try{t=findTask(p,getState().route.taskId);}catch{return '<section class="narrow"><h1>작업을 다시 선택해 주세요.</h1><button class="btn primary" data-view="dashboard">학습 로드맵으로 돌아가기</button></section>';}
  const steps=TASK_STEPS;const current=t.stages.indexOf(false);
  return `<section class="task-detail narrow"><div class="task-detail-head">${control(`← ${ORIGINS[originOf(getState().route)]}`,'back','','link task-back')}${control('☷ 전체 작업','list','','link')}</div><p class="task-detail-project">${esc(p.name)}</p>${badge(t)}<h1>${esc(t.title)}</h1><p class="concept-copy">${esc(t.next)}</p><span class="pill">관련 영역 · ${esc(area(t))}</span><ol class="task-timeline" aria-label="작업 진행 단계">${steps.map((name,i)=>`<li class="${t.stages[i]?'done':i===current?'current':''}" ${i===current?'aria-current="step"':''}><span class="task-step-dot" aria-hidden="true">${t.stages[i]?'✓':i+1}</span><div><strong>${name}</strong><small>${i===1&&t.skippedQuestion?'기존 이해를 활용해 응용 확인':t.stages[i]?'완료':i===current?'지금 이어갈 단계':'다음 단계'}</small></div></li>`).join('')}</ol><p class="small muted">단계 표시는 작업 진행 기록이에요. 사업 성공률이나 남은 시간 비율이 아니에요.</p><div class="task-next-box"><strong>${esc(t.label)}</strong><p>${esc(t.reason)}</p><p>완료 기준: 준비한 행동의 결과와 해석을 기록${t.concept==='strategy'?'하고 다음 방향을 결정':''}해요. 예상과 다른 결과도 기록할 수 있어요.</p>${t.status!=='archived'?control(t.status==='completed'?'완료 기록 보기':t.status==='ready'?'시작하기 →':['paused','cancelled','waiting'].includes(t.status)?'다시 이어하기 →':'이어서 하기 →','resume',t.id,'primary wide'):'<p>이전 가설의 기록은 보존돼요. 학습 로드맵에서 현재 가설의 작업을 시작해 주세요.</p>'}</div>${!['ready','completed','archived'].includes(t.status)?`<details class="task-settings"><summary>중요도·일정·상태 조정</summary><form id="task-settings" data-task-id="${esc(t.id)}"><label for="task-priority">중요도</label><select id="task-priority" name="priority">${[['high','높음'],['normal','보통'],['low','낮음']].map(([v,l])=>`<option value="${v}" ${v===t.priority?'selected':''}>${l}</option>`).join('')}</select><label for="task-date">목표일 · 선택</label><input id="task-date" type="date" name="dueAt" value="${esc(t.dueAt)}"><label for="task-minutes">다음 행동 예상 시간(분)</label><input id="task-minutes" type="number" min="1" max="480" required name="minutes" value="${t.minutes}"><label for="task-status">작업 상태</label><select id="task-status" name="status">${[['active','진행 중'],['waiting','외부 결과 대기'],['paused','잠시 보류'],['cancelled','취소 · 기록 유지']].map(([v,l])=>`<option value="${v}" ${v===t.status?'selected':''}>${l}</option>`).join('')}</select><p class="small muted">취소해도 기록은 남고 다시 열 수 있어요.</p><button class="btn primary wide" type="submit">설정 저장</button></form></details>`:''}${control(`${ORIGINS[originOf(getState().route)]}(으)로 돌아가기`,'back','','link wide')}</section>`;
 }
 function click(b){const a=b.dataset.task;if(!a)return false;const p=project();if(!p)return true;
  if(a==='list'){openList();return true;}
  if(a==='back'){if(historyArmed&&history.state?.vcTask)history.back();else goBack();return true;}
  closeFocusDialog();
  if(a==='detail'){const r=getState().route,from=r.view==='taskdetail'?originOf(r):ORIGINS[r.view]?r.view:'dashboard';
   const ok=update(s=>{s.route={view:'taskdetail',projectId:p.id,taskId:b.dataset.taskId,from};}).ok;
   if(ok&&canHistory){backOrigin=from;if(historyArmed&&history.state?.vcTask)history.replaceState({vcTask:1},'');else{history.pushState({vcTask:1},'');historyArmed=true;}}}
  if(a==='resume')update(s=>resumeTask(s,p.id,b.dataset.taskId));return true;
 }
 function submit(f,d){if(f.id!=='task-settings')return false;const r=update(s=>saveTaskMeta(s,project().id,f.dataset.taskId,d));if(r.ok)toast('작업 설정을 저장했어요.');return true;}
 function change(el){if(!el.hasAttribute('data-task-sort'))return;sort=el.value;const body=document.querySelector('.task-sheet .focus-dialog-body');if(body){body.innerHTML=list();body.querySelector('select').focus();}}
 return {preview,floating,detail,click,submit,change};
}
