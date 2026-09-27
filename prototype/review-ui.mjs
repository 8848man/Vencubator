// SPEC-012 r0.2 · 나의 성장 ‘작은 배움’: 오늘의 학습과 같은 집중형 흐름(개념 → 답 → 이유 → 결과 창).
// 채점·XP 규칙은 domain.submitQuiz 그대로(SPEC-002). 진행 위치는 state.forms.quiz 에 저장해 새로고침·뒤로 뒤에도 복원한다.
import {LESSONS,STATS} from './content.mjs';
import {submitQuiz} from './domain.mjs';
import {openFocusDialog} from './focus-dialog.mjs';

export function createReviewUI({getState,update,esc,mascot}){
 const form=()=>getState().forms.quiz||{};
 const lessonOf=f=>LESSONS.find(l=>l.id===f.concept)||LESSONS[0];
 const questionOf=f=>{const l=lessonOf(f);return f.application?l.application:l.variants[f.variant||0];};
 const attemptKey=f=>`attempt:${f.concept}:${f.application?'application':(f.variant||0)}`;
 const resultOf=f=>getState().events.find(e=>e.key===attemptKey(f))?.result||null;
 const project=()=>getState().projects.find(p=>p.id===getState().route.projectId);
 const stageOf=f=>{const s=f.stage||(f.application?'choice':'concept');return resultOf(f)&&s!=='concept'?'done':s;};
 const setForm=(patch,view)=>update(s=>{s.forms.quiz={...(s.forms.quiz||{}),...patch};if(view)s.route.view=view;});

 // 결과 뒤 이어갈 행동 하나 (기존 분기 유지: 오답이면 다른 문제, 이해했으면 새 상황, 그 외 나의 성장)
 function nextOf(f){const r=resultOf(f),m=getState().mastery[f.concept];
  if(!f.application&&r&&!r.correct&&(f.variant||0)===0)return {label:'다른 문제로 확인하기 →',act:'retry'};
  if(!f.application&&m?.understood)return {label:'새 상황에 적용하기 →',act:'apply'};
  return {label:'나의 성장으로 →',act:'exit'};}

 function feedbackBody(f){const r=resultOf(f),q=questionOf(f);if(!r)return '';
  const known=f.choice!==undefined&&f.choice!==null&&f.reason!==undefined&&f.reason!==null;
  const mark=ok=>ok?'맞았어요':'다시 살펴봐요';
  return `${known?`<div class="feedback-checks"><p>답 선택 · <strong>${mark(Number(f.choice)===q.answer)}</strong></p><p>이유 선택 · <strong>${mark(Number(f.reason)===q.reason)}</strong></p></div>`:''}<p>${esc(r.why||q.why)}</p><p class="small muted">${r.delta?`내 학습 +${r.delta} XP · 프로젝트 근거는 변하지 않았어요.`:r.repeated||!known?'이미 확인한 문항이에요. 추가 XP는 없어요.':'설명을 읽는 것만으로 XP가 오르지는 않아요. 다른 문제로 다시 확인할 수 있어요.'}</p>`;}

 function showFeedback(){const f=form(),r=resultOf(f);if(!r)return;const n=nextOf(f);
  openFocusDialog({title:r.correct?'맞아요. 핵심을 잘 짚었어요!':'괜찮아요. 같이 살펴봐요.',body:feedbackBody(f),actionLabel:n.label,returnFocus:'[data-review="feedback"]',onAction:()=>act(n.act)});}

 function act(a){const f=form();
  if(a==='retry')return setForm({variant:1,stage:'choice',choice:null,reason:null});
  if(a==='apply')return setForm({application:true,variant:0,stage:'choice',choice:null,reason:null});
  if(a==='exit')return update(s=>{s.route.view='learning';});
 }

 function header(f,stage){const labels=f.application?['새 상황','확인']:['개념','문제','확인'];
  const idx=f.application?(stage==='done'?1:0):(stage==='concept'?0:stage==='done'?2:1),n=labels.length;
  return `<header class="session-top"><button type="button" class="iconbtn" data-review="exit" aria-label="저장하고 나의 성장으로 나가기">×</button><div class="session-meter" aria-label="작은 배움 ${idx+1} / ${n}단계"><span style="width:${(idx+1)/n*100}%"></span></div><span>${idx+1} / ${n}</span></header><div class="session-labels">${labels.map((t,i)=>`<span class="${i===idx?'active':''}">${t}</span>`).join('')}</div>`;}

 function conceptView(f){const l=lessonOf(f),st=STATS.find(t=>t.id===l.stat),m=getState().mastery[f.concept];
  return `<div class="lesson-scene">${mascot()}<div class="speech">${esc(st?.description||'')}</div></div><span class="eyebrow">${esc(st?.name||'')} · 짧은 배움</span><h1>${esc(l.title)}</h1><p class="concept-copy">${esc(l.summary)}</p><div class="takeaway"><span>이렇게 확인해요</span><strong>문제 하나에서 답을 고르고, 이어서 그 이유를 골라요.</strong></div><p class="small muted">학습 근거: ${esc(l.source)}${m?.understood?' · 이미 이해를 확인한 개념이에요. 다시 풀어도 추가 XP는 없어요.':''}</p><div class="lesson-controls"><button type="button" class="btn primary" data-review="next">문제로 알아보기 →</button></div>`;}

 function questionView(f,stage){const q=questionOf(f),reason=stage==='reason';
  const name=reason?'reason':'choice',values=reason?q.reasons:q.options,picked=f[name];
  return `<ol class="question-steps" aria-label="문제 풀이 단계"><li ${!reason?'aria-current="step"':''}>① 답 고르기</li><li ${reason?'aria-current="step"':''}>② 이유 고르기</li></ol><span class="eyebrow">${f.application?'새로운 상황에 응용하기':`문제 ${(f.variant||0)+1} · 하나씩 생각해요`}</span><h1>${reason?'왜 그렇게 생각했나요?':'어떤 생각이 더 좋을까요?'}</h1>${reason?`<div class="answer-summary"><small>내가 고른 답</small>${esc(q.options[Number(f.choice)])}</div>`:''}<form id="review-answer"><input type="hidden" name="panel" value="${name}"><fieldset class="choice-set"><legend>${reason?'이 답을 고른 이유는 무엇인가요?':esc(q.question)}</legend>${values.map((v,i)=>`<label class="choice"><input type="radio" name="${name}" value="${i}" required ${picked!==undefined&&picked!==null&&String(picked)===String(i)?'checked':''}><span>${esc(v)}</span></label>`).join('')}</fieldset><div class="question-tools">${reason?'<button type="button" class="btn link" data-review="back">← 답 바꾸기</button>':'<span></span>'}<button type="button" class="btn link" data-review="hint">힌트 보기</button></div><button class="btn primary wide" type="submit">${reason?'답 확인하기':'이유 고르기 →'}</button></form>`;}

 function doneView(f){const q=questionOf(f),n=nextOf(f),known=f.choice!==undefined&&f.choice!==null&&f.reason!==undefined&&f.reason!==null,p=project();
  return `<span class="eyebrow">문제 확인 완료</span><h1>생각을 확인했어요.</h1><p class="concept-copy">${esc(q.question)}</p>${known?`<div class="answer-summary"><small>내가 고른 답</small>${esc(q.options[Number(f.choice)])}<small>내가 고른 이유</small>${esc(q.reasons[Number(f.reason)])}</div>`:''}<button type="button" class="btn primary wide" data-review="feedback">해설 다시 보기</button><div class="review-next"><button type="button" class="btn soft wide" data-review="${n.act}">${n.label}</button></div>${p?.context?'<div class="review-extra"><button type="button" class="btn link" data-action="evidence">내 프로젝트에 관찰 남기기 →</button></div>':''}`;}

 function view(){const f=form(),stage=stageOf(f);
  const content=stage==='concept'?conceptView(f):stage==='done'?doneView(f):questionView(f,stage);
  return `<div class="guided-session review-session">${header(f,stage)}<section class="lesson-paper">${content}</section></div>`;}

 function click(b){
  const a=b.dataset.action;
  // 나의 성장 카드에서 진입 (기존 data-action 유지)
  if(a==='lesson'||a==='application'){const concept=b.dataset.concept||'customer',app=a==='application';
   update(s=>{s.forms.quiz={concept,variant:0,application:app,stage:app?'choice':'concept',choice:null,reason:null};s.route.view='quiz';});return true;}
  if(a==='retry-quiz'){act('retry');return true;}
  const r=b.dataset.review;if(!r)return false;const f=form();
  if(r==='next')setForm({stage:'choice'});
  if(r==='back')setForm({stage:'choice'});
  if(r==='hint'){const l=lessonOf(f);openFocusDialog({title:'생각을 돕는 힌트',body:`<p>${esc(l.summary)}</p>`,actionLabel:'문제로 돌아가기',returnFocus:'[data-review="hint"]'});}
  if(r==='feedback')showFeedback();
  if(['retry','apply','exit'].includes(r))act(r);
  return true;
 }

 function submit(el,d){if(el.id!=='review-answer')return false;const f=form();
  if(d.panel==='choice'){if(!['0','1','2'].includes(String(d.choice)))return true;setForm({choice:d.choice,stage:'reason'});return true;}
  if(!['0','1','2'].includes(String(d.reason)))return true;
  const r=update(s=>{const res=submitQuiz(s,{concept:f.concept,variant:f.variant||0,choice:f.choice,reason:d.reason,application:!!f.application});s.forms.quiz={...s.forms.quiz,reason:d.reason,stage:'done'};return res;});
  if(r.ok)showFeedback();
  return true;
 }
 return {view,click,submit,showFeedback};
}
