import {lessonContent} from './guided.mjs';
export const questionDraftKey=r=>`question:${r.scopeVersion}:${r.concept}:${r.step}:${r.variant}`;
export const nextAnswerLabel=r=>r.step==='transfer'?'내 프로젝트에 써보기 →':r.results[r.step]?.correct?'새 상황에 응용하기 →':r.variant===0?'다른 문제로 확인하기 →':'도움받아 내 프로젝트에 써보기 →';
export function questionView(p,r,esc){
 const result=r.results[r.step],q=lessonContent(r.concept,r.variant,r.step==='transfer'),key=questionDraftKey(r),d=p.uiDraft[key]||{};
 const reason=d.panel==='reason'&&['0','1','2'].includes(String(d.choice));
 const picked=result||d;
 if(result)return `<span class="eyebrow">문제 확인 완료</span><h1>생각을 확인했어요.</h1><p class="concept-copy">${esc(q.question)}</p><div class="answer-summary"><small>내가 고른 답</small>${esc(q.options[Number(result.choice)])}<small>내가 고른 이유</small>${esc(q.reasons[Number(result.reason)])}</div><button class="btn primary wide" data-guide="feedback">해설 다시 보기</button>`;
 const name=reason?'reason':'choice',values=reason?q.reasons:q.options;
 return `<ol class="question-steps" aria-label="문제 풀이 단계"><li ${!reason?'aria-current="step"':''}>① 답 고르기</li><li ${reason?'aria-current="step"':''}>② 이유 고르기</li></ol><span class="eyebrow">${r.step==='transfer'?'새로운 상황에 응용하기':'문제 · 하나씩 생각해요'}</span><h1>${reason?'왜 그렇게 생각했나요?':'어떤 생각이 더 좋을까요?'}</h1>${reason?`<div class="answer-summary"><small>내가 고른 답</small>${esc(q.options[Number(picked.choice)])}</div>`:''}<form id="guided-answer" data-project-draft="${key}"><input type="hidden" name="panel" value="${reason?'reason':'choice'}">${reason?`<input type="hidden" name="choice" value="${esc(d.choice)}">`:`<input type="hidden" name="reason" value="${esc(d.reason||'')}">`}<fieldset class="choice-set"><legend>${reason?'이 답을 고른 이유는 무엇인가요?':esc(q.question)}</legend>${values.map((v,i)=>`<label class="choice"><input type="radio" name="${name}" value="${i}" required ${String(picked[name])===String(i)?'checked':''}><span>${esc(v)}</span></label>`).join('')}</fieldset><div class="question-tools">${reason?'<button type="button" class="btn link" data-guide="answer-back">← 답 바꾸기</button>':'<span></span>'}<button type="button" class="btn link" data-guide="hint">힌트 보기</button></div><button class="btn primary wide" type="submit">${reason?'답 확인하기':'이유 고르기 →'}</button></form>`;
}
export function answerFeedback(r,esc){
 const result=r.results[r.step],q=lessonContent(r.concept,r.variant,r.step==='transfer');
 return `<div class="feedback-checks"><p>답 선택 · <strong>${String(result.choice)===String(q.answer)?'맞았어요':'다시 살펴봐요'}</strong></p><p>이유 선택 · <strong>${String(result.reason)===String(q.reason)?'맞았어요':'다시 살펴봐요'}</strong></p></div><p>${esc(q.why)}</p><p class="small muted">${result.delta?`이번 문항에서 받은 학습 보상 +${result.delta} XP`:result.repeated?'이미 확인한 문항이에요. 추가 보상은 없어요.':'설명을 읽는 것만으로 숙달 점수가 오르지는 않아요.'}</p>`;
}
