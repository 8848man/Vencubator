// SPEC-019: 첫 사용자만 보는 짧은 튜토리얼. 답변은 추천 문구용이며 검증된 사업 사실이 아니다.
export const ONBOARD_STEPS = ['welcome','stage','need','time','idea','summary'];
export const ONBOARD_OPTIONS = {
  stage: [['written','아이디어가 한 문장으로 있어요'],['forming','생각을 다듬는 중이에요'],['none','아직 아이디어가 없어요']],
  need: [['customer','누구의 문제인지 알고 싶어요'],['question','무엇을 물어볼지 알고 싶어요'],['action','오늘 할 일을 정하고 싶어요']],
  time: [['five','5분만 가볍게'],['ten','10분쯤 집중해서'],['later','천천히 살펴볼래요']]
};
const escape = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function firstSuggestion(data={}) {
  return ({customer:'누가 이 문제를 겪는지 한 사람부터 떠올려 보세요.',question:'최근 실제 경험을 묻는 질문 하나부터 만들어 보세요.',action:'오늘 확인할 작은 행동 하나를 정해 보세요.'})[data.need] || '아이디어 한 문장에서 시작해도 충분해요.';
}
export function onboardingView(data={}) {
  const step=Math.max(0,Math.min(5,Number(data.step)||0)), key=ONBOARD_STEPS[step];
  const title={welcome:'작은 생각에서, 다음 한 걸음으로.',stage:'아이디어는 지금 어디쯤 있나요?',need:'지금 가장 필요한 도움은?',time:'오늘은 얼마만큼 살펴볼까요?',idea:'떠오르는 아이디어를 한 문장으로.',summary:'나에게 맞는 첫 걸음'}[key];
  const help={welcome:'짧게 배우고, 내 아이디어에 적용하고, 실제로 확인해요. 어떤 사업이 될지는 당신이 결정합니다.',stage:'정확하지 않아도 괜찮아요. 시작점을 맞추는 데만 사용해요.',need:'가장 가까운 것 하나를 고르세요. 언제든 다른 방향으로 바꿀 수 있어요.',time:'추천 화면의 속도를 맞추기 위한 질문이에요. 알림을 보내지 않아요.',idea:'아직 없으면 건너뛰세요. 나중에 프로젝트에서 적을 수 있어요.',summary:'이 제안은 시작점일 뿐이에요. 프로젝트에서 언제든 수정할 수 있어요.'}[key];
  const options=ONBOARD_OPTIONS[key];
  const content=key==='welcome'?`<div class="ob-orbit" aria-hidden="true"><span>생각</span><b>→</b><span>배움</span><b>→</b><span>확인</span></div><p class="ob-note">현재는 프로토타입이에요. 기록은 이 브라우저에만 저장되고, 예시는 가상이에요.</p>`:
    options?`<div class="ob-options">${options.map(([value,label])=>`<button type="button" class="ob-option ${data[key]===value?'selected':''}" data-onboard-choice="${value}" data-onboard-key="${key}" aria-pressed="${data[key]===value}"><span class="ob-radio" aria-hidden="true"></span>${label}</button>`).join('')}</div>`:
    key==='idea'?`<label class="ob-field" for="ob-idea">내 아이디어 · 선택</label><textarea id="ob-idea" maxlength="120" placeholder="예: 프리랜서가 정산 과정을 한곳에서 확인하는 도구">${escape(data.idea||'')}</textarea><p class="ob-note">민감한 고객 정보는 적지 않아도 돼요.</p>`:
    `<div class="ob-summary"><span class="ob-tag">첫 제안</span><p>${escape(firstSuggestion(data))}</p>${data.idea?`<small>내 아이디어 · ${escape(data.idea)}</small>`:'<small>아이디어 문장은 프로젝트에서 나중에 적어도 돼요.</small>'}</div>`;
  return `<div class="ob-shell"><header class="ob-top"><span class="ob-brand">✳ vencubator</span><button type="button" data-onboard="skip" class="ob-text">건너뛰기</button></header><main id="main" class="ob-main"><div class="ob-progress" role="progressbar" aria-label="시작 준비" aria-valuenow="${step+1}" aria-valuemin="1" aria-valuemax="6"><span style="width:${(step+1)/6*100}%"></span></div><p class="ob-count">시작 준비 ${step+1} / 6</p><div class="ob-illustration" aria-hidden="true">${key==='summary'?'✦':key==='welcome'?'◡':'✳'}</div><h1 tabindex="-1">${title}</h1><p class="ob-help">${help}</p>${content}</main><footer class="ob-footer">${step>0?'<button type="button" data-onboard="back" class="ob-back">← 이전</button>':'<span></span>'}<button type="button" data-onboard="next" class="ob-next">${step===5?'프로젝트 시작하기':step===4?'다음':'계속하기'} →</button></footer></div>`;
}
export function advanceOnboarding(data={}, action, value, key) {
  const next={...data,step:Math.max(0,Math.min(5,Number(data.step)||0))};
  if(action==='back')next.step=Math.max(0,next.step-1);
  if(action==='choice'&&ONBOARD_OPTIONS[key]?.some(([v])=>v===value)){next[key]=value;next.step=Math.min(5,next.step+1);}
  if(action==='idea')next.idea=String(value||'').slice(0,120);
  if(action==='next')next.step=Math.min(5,next.step+1);
  if(action==='finish'||action==='skip')next.completed=true;
  return next;
}
