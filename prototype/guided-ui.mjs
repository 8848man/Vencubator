import {startTaskLesson,beginFieldRecord,planTaskField,selectFieldTask,fieldDraft,evidenceDraftKey,applicationDraftKey} from './tasks.mjs';
import {openFocusDialog} from './focus-dialog.mjs';
import {questionDraftKey,questionView,answerFeedback,nextAnswerLabel} from './question-ui.mjs';
import {LESSONS} from './content.mjs';
import {track} from './track.mjs';
import {PATH,QUESTS,getRun,nextConcept,startLesson,moveLesson,answerLesson,completeLesson,planFieldTask,lessonContent} from './guided.mjs';

export function createGuided({getState,update,go,esc,mascot,field,toast}){
 const state=()=>getState(),project=()=>state().projects.find(p=>p.id===state().route.projectId);
 const button=(label,action,primary=true,extra='')=>`<button type="button" class="btn ${primary?'primary':'link'}" data-guide="${action}" ${extra}>${label}</button>`;
 const actionTask=p=>p.fieldTasks?.find(t=>t.scopeVersion===p.scopeVersion&&(state().route.fieldTaskId?t.id===state().route.fieldTaskId:state().route.view==='session'?t.artifactId===getRun(p,state().route.concept)?.artifactId:t.status==='planned'));
 // SPEC-005 r0.3 AC-L07: 아직 열리지 않은 학습을 누르면 막기만 하지 않고, 여는 방법을 알려 주고 지금 단계를 강조한다.
 let nudgeTimer=0;
 function lockedMessage(p,locked){const cur=nextConcept(p),r=getRun(p,cur),name=QUESTS[cur].name;
  const how=!r?`‘${name}’ 학습을 시작해 주세요`:r.step==='concept'?`‘${name}’의 개념부터 이어서 읽어요`:['question','transfer'].includes(r.step)?`‘${name}’의 문제를 이어서 풀어요`:r.step==='apply'?`‘${name}’의 내 프로젝트 준비물을 완성해요`:`‘${name}’ 학습을 마무리해요`;
  const lname=QUESTS[locked]?.name||'이 학습',last=lname.charCodeAt(lname.length-1),topic=last>=0xAC00&&last<=0xD7A3&&(last-0xAC00)%28?'은':'는';
  return `‘${lname}’${topic} 아직 열리지 않았어요. 먼저 ${how}. 지금 단계를 마치면 다음 학습이 차례로 열려요.`;}
 function explainLocked(concept){const p=project();if(!p)return;toast(lockedMessage(p,concept));
  const stop=document.querySelector('.path-stop.current');if(!stop)return;const node=stop.querySelector('.path-node'),reduced=document.body.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  stop.classList.remove('is-nudge');void stop.offsetWidth;stop.classList.add('is-nudge');
  stop.scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});node?.focus({preventScroll:true});
  clearTimeout(nudgeTimer);nudgeTimer=setTimeout(()=>stop.classList.remove('is-nudge'),2600);}
 function home(){const p=project();if(!p)return `<div class="narrow empty">${mascot()}<h1>어떤 아이디어를 키워볼까요?</h1><p>한 문장으로 시작하고, 게임처럼 하나씩 배워요.</p><button class="btn primary" data-action="new">첫 학습 시작하기 →</button></div>`;
  const concept=nextConcept(p),q=QUESTS[concept],run=getRun(p,concept),done=PATH.filter(c=>getRun(p,c)?.completedAt).length,task=actionTask(p);
  return `<div class="learn-layout"><section class="learning-path"><div class="path-intro"><span class="eyebrow">YOUR LITTLE ADVENTURE</span><h1>조금 배우고,<br>내 아이디어에 써보기.</h1><p>${esc(p.name)}와 함께하는 창업 여정</p></div><div class="chapter-banner"><span>CHAPTER 01</span><strong>아이디어에 첫 뿌리 내리기</strong><small>${done} / ${PATH.length} 학습 완료 · 사업 완성률이 아니에요</small></div><ol class="quest-path" aria-label="나의 학습 경로">${PATH.map((c,i)=>{const r=getRun(p,c),complete=!!r?.completedAt,current=c===concept;return `<li class="path-stop ${complete?'done':current?'current':'locked'}"><button type="button" class="path-node" data-guide="${complete||current?'start':'locked'}" data-concept="${c}" aria-label="${QUESTS[c].name} · ${complete?'완료':current?'현재 학습':'아직 열리지 않은 학습, 여는 방법 보기'}">${complete?'✓':current?QUESTS[c].icon:'·'}</button><div ${!complete&&!current?`data-guide="locked" data-concept="${c}"`:''}><span>${String(i+1).padStart(2,'0')} ${complete?'완료':current?'지금 여기':'다음에 만나요'}</span><strong>${QUESTS[c].name}</strong>${current?'<small>하나씩, 내 속도로</small>':''}</div></li>`;}).join('')}</ol></section><aside class="journey-side"><div class="companion-card"><span class="eyebrow">GROW TOGETHER</span>${mascot('floating')}<h2>${esc(p.name)}</h2><p>오늘은 하나만 배워도 좋아요.<br>배운 만큼, 생각이 또렷해질 거예요.</p><button class="btn link" data-action="details">내 프로젝트 자세히 보기 ↗</button></div>${task?`<div class="field-note"><span class="eyebrow">앱 밖에서 이어갈 한 걸음</span><h3>${esc(task.title)}</h3><p>결과를 기다리는 동안에도 학습은 계속할 수 있어요.</p>${button('실행 내용 보기 →','task',false)}</div>`:'<div class="field-note"><span class="eyebrow">LEARN → TRY → GROW</span><p>짧게 배우고, 내 프로젝트에 적용하고, 실제로 확인해요.</p></div>'}</aside></div>`;
 }
 function session(){const p=project(),r=getRun(p,state().route.concept);if(!r)return home();const c=r.concept,q=QUESTS[c],l=LESSONS.find(l=>l.id===c);const step=r.step==='concept'?0:r.step==='question'?1:r.step==='complete'?3:2;
  let content='';
  if(r.step==='concept')content=`<div class="lesson-scene">${mascot()}<div class="speech">${q.scene}</div></div><span class="eyebrow">오늘의 개념</span><h1>${q.lesson}</h1><p class="concept-copy">${l.summary}</p><div class="takeaway"><span>오늘 남길 것</span><strong>${esc(p.name)}의 ${q.outcome}</strong></div><p class="small muted">${l.source} 기반 예시 · 결정형 학습 경로</p><div class="lesson-controls">${button(state().mastery[c]?.understood?'이미 배운 개념이에요 · 응용으로 →':'문제로 알아보기 →','next')}</div>`;
  if(['question','transfer'].includes(r.step))content=questionView(p,r,esc);
  if(r.step==='apply'){const d=p.uiDraft[applicationDraftKey(r)]??(Object.values(p.learningRuns||{}).filter(x=>x.concept===c).length===1?p.uiDraft[`guided-${c}`]:{})??{};content=`<span class="eyebrow">응용 2 · ${esc(p.name)}</span><h1>이제, 내 아이디어 차례.</h1><p class="concept-copy">${q.prompt}</p><div class="application-example"><span>가상 예시 · 내 상황에 맞게 직접 써보세요</span><p>${q.example}</p></div><form id="guided-apply" data-project-draft="${applicationDraftKey(r)}">${field('누구를 위한 준비인가요?','target',d.target||p.context?.customer||p.draft.customer,'예: 첫 전공 수업에서 팀원을 찾는 신입생','text','required minlength="5"')}${field(q.outcome,'artifact',d.artifact,'내 아이디어에 맞게 직접 적어보세요.','textarea','required minlength="5"')}${field('어떤 결과가 나오면 생각을 바꿀까요?','criterion',d.criterion,q.criterion,'textarea','required minlength="5"')}<p class="small muted">내가 확인한 준비물로 저장해요. 고객에게 검증된 사실이나 자유서술 숙달 평가가 아니에요.${!p.context?' 대상과 확인 방법을 첫 가설에 반영합니다.':''}</p><button class="btn primary wide" type="submit">내 준비물로 확정하고 학습 마치기 ✓</button></form>`;}
  if(r.step==='complete'){const a=p.learningArtifacts?.find(a=>a.id===r.artifactId),task=actionTask(p),executed=p.fieldTasks?.some(t=>t.artifactId===r.artifactId&&t.status==='completed');content=`<div class="lesson-finish"><span class="finish-seal" aria-hidden="true">✓</span><span class="eyebrow">ONE SMALL STEP, DONE!</span><h1>하나 배웠고,<br>하나 준비했어요.</h1><p>${esc(p.name)}에 쓸 ${q.outcome}이 생겼어요.</p><div class="saved-artifact"><span>${q.outcome}</span><blockquote>${esc(a?.text)}</blockquote><small>${esc(a?.target)}</small></div><p class="small muted">${r.assisted?'도움받아 응용했어요. 개념은 나중에 다시 확인해요.':'배운 것을 내 프로젝트에 연결했어요.'}<br>실제 실행과 고객 검증은 다음 단계예요.</p><div class="field-invitation"><span>앱 밖에서 해볼 일</span><h3>${q.action}</h3>${executed?`<p>이 준비물로 실행한 결과를 기록했어요.</p>${button('학습 로드맵로 돌아가기 →','home')}${button('실행 기록 살펴보기','journal',false)}`:button(task?'실행 내용 보기 →':'이 준비물로 실행해보기 →',task?'task':'plan')}</div>${button('오늘은 여기까지 · 학습 로드맵로','home',false)}</div>`;}
  return `<div class="guided-session"><header class="session-top"><button class="iconbtn" data-guide="home" aria-label="학습 저장하고 나가기">×</button><div class="session-meter" aria-label="학습 ${Math.min(step+1,3)} / 3단계"><span style="width:${step===3?100:(step+1)*100/3}%"></span></div><span>${Math.min(step+1,3)} / 3</span></header><div class="session-labels"><span class="${step===0?'active':''}">개념</span><span class="${step===1?'active':''}">문제</span><span class="${step>=2?'active':''}">응용</span></div><section class="lesson-paper">${content}</section></div>`;
 }
 function task(){const p=project(),t=actionTask(p);if(!t)return `<div class="narrow empty">${mascot()}<h1>작은 배움부터 시작해요.</h1><p>준비물이 생기면 실행 과제로 연결할 수 있어요.</p>${button('학습 로드맵로 돌아가기','home')}</div>`;
 const a=p.learningArtifacts.find(a=>a.id===t.artifactId);return `<div class="narrow field-mission"><span class="eyebrow">YOUR REAL-WORLD QUEST</span><h1>배운 것을, 밖에서 써볼까요?</h1><p class="concept-copy">${esc(t.title)}</p><section class="panel"><span class="pill">실행 대기 · 학습은 이미 완료했어요</span><h2>${QUESTS[t.concept].outcome}</h2><blockquote>${esc(a.text)}</blockquote><p>대상 · ${esc(a.target)}</p><div class="hint-box">판단 기준 · ${esc(t.criterion)}</div><p class="small muted">체험판에서는 가상 결과로 해봐요. 실제 개인정보는 적지 마세요.</p>${button('실행 결과 기록하기 →','record')}<div class="button-row">${button('아직 실행 전이에요 · 학습 계속하기','home',false)}${button('이 실행 잠시 보류','defer',false)}</div></section></div>`;
 }
 function click(b){const action=b.dataset.guide;if(!action)return false;const p=project();
  if(action==='hint'){const r=getRun(p,state().route.concept);openFocusDialog({title:'생각을 돕는 힌트',body:`<p>${esc(LESSONS.find(l=>l.id===r.concept).summary)}</p>`,returnFocus:'[data-guide="hint"]'});}
  if(action==='feedback')showFeedback();
  if(action==='answer-back'){const r=getRun(p,state().route.concept);update(s=>{s.projects.find(x=>x.id===p.id).uiDraft[questionDraftKey(r)].panel='choice';});}
  if(action==='home')go('dashboard');
  if(action==='task'){const t=actionTask(p);if(t)update(s=>selectFieldTask(s,p.id,t.id));}
  if(action==='journal')go('journal');
  if(action==='locked'){explainLocked(b.dataset.concept);return true;}
  if(action==='start'){const concept=b.dataset.concept||nextConcept(p);const result=update(s=>startTaskLesson(s,p.id,concept));if(result.ok)track('lesson_start',{concept},{page:'app'});}
  if(action==='next'){const concept=state().route.concept;const result=update(s=>moveLesson(s,p.id));if(result.ok)track('lesson_step',{concept,step:getRun(project(),concept).step},{page:'app'});}
  if(action==='plan'){const r=getRun(p,state().route.concept);const result=update(s=>{planTaskField(s,p.id,r.artifactId);});if(result.ok)track('field_task_plan',{concept:r.concept},{page:'app'});}
  if(action==='defer')update(s=>{s.projects.find(x=>x.id===p.id).fieldTasks.find(t=>t.id===actionTask(p).id).status='deferred';s.route.view='dashboard';});
  if(action==='record'){const t=actionTask(p);if(t)update(s=>beginFieldRecord(s,p.id,t.id));}
  return true;
 }
 function reflection(){const p=project(),t=p.fieldTasks?.find(t=>t.id===(state().route.fieldTaskId||p.uiDraft.evidence?.taskId));if(!t)return task();const d=fieldDraft(p,t);
  return `<div class="narrow"><span class="eyebrow">TRY → REFLECT</span><h1>해보니, 무엇이 달랐나요?</h1><p class="concept-copy">${esc(t.title)}<br>준비한 기준과 결과를 비교해요.</p><div class="warning">체험판이라 가상 결과로 해봐요. 실제 고객의 이름·연락처 같은 개인정보는 적지 마세요.</div><form id="evidence-form" class="panel" data-project-draft="${evidenceDraftKey(t.id)}"><input type="hidden" name="taskId" value="${esc(t.id)}"><input type="hidden" name="kind" value="field"><input type="hidden" name="stat" value="${esc(d.stat)}"><input type="hidden" name="claim" value="${esc(d.claim)}"><div class="hint-box">준비물 · ${esc(d.claim)}<br>판단 기준 · ${esc(t.criterion)}</div>${field('누구 또는 어떤 자료에서 확인했나요?','source',d.source,'예: 가상 고객 A','text','required')}${field('어떤 말이나 행동을 관찰했나요?','summary',d.summary,'해석과 구분해서 관찰한 내용을 적어주세요.','textarea','required')}${field('그래서 어떤 생각이 들었나요?','interpretation',d.interpretation,'준비한 기준과 비교해 달라진 생각을 적어주세요.','textarea','required')}<div class="field"><label for="guided-assessment">기존 생각과 비교하면?</label><select id="guided-assessment" name="assessment"><option value="mixed" ${d.assessment==='mixed'?'selected':''}>아직 판단하기 어려워요</option><option value="refuted" ${d.assessment==='refuted'?'selected':''}>다른 방향을 살펴봐야 해요</option><option value="supported" ${d.assessment==='supported'?'selected':''}>같은 방향을 더 확인해볼래요</option></select></div>${field('이번 확인의 한계는?','limitations',d.limitations,'예: 한 사람의 가상 사례여서 일반화할 수 없다.','text','required')}<details class="lesson-hint"><summary>확인 방법과 날짜</summary>${field('확인 방법','method',d.method||t.title,'','text','required')}${field('관찰 날짜','date',d.date||new Date().toISOString().slice(0,10),'','date','required')}</details><button class="btn primary wide" type="submit">기록 확인하기 →</button></form></div>`;
 }
 function showFeedback(){const r=getRun(project(),state().route.concept);if(!r?.results[r.step])return;openFocusDialog({title:r.results[r.step].correct?'맞아요. 핵심을 잘 짚었어요!':'괜찮아요. 같이 살펴봐요.',body:answerFeedback(r,esc),actionLabel:nextAnswerLabel(r),returnFocus:'[data-guide="feedback"]',onAction:()=>click({dataset:{guide:'next'}})});}
 function submit(form,data){const p=project();
  if(form.id==='guided-answer'){
   const r=getRun(p,state().route.concept),key=questionDraftKey(r);
   if(data.panel==='choice'){
    if(!['0','1','2'].includes(String(data.choice)))return true;
    update(s=>{const x=s.projects.find(x=>x.id===p.id);x.uiDraft[key]={...data,panel:'reason'};});
   }else{
    const result=update(s=>answerLesson(s,p.id,data));
    if(result.ok){track('lesson_answer',{concept:state().route.concept},{page:'app'});showFeedback();}
   }
   return true;
  }
  if(form.id==='guided-apply'){const r=update(s=>completeLesson(s,p.id,data));if(r.ok){track('application_save',{concept:state().route.concept},{page:'app'});toast('준비물을 저장했어요. 학습 한 단계 완료!');}return true;}
  return false;
 }
 return {home,session,task,reflection,click,submit};
}
