// SPEC-015 r0.3 — 가치 카드(비모달)와 ‘의견 보내기’ 페이지. 로직은 feedback.mjs, 전송은 W04.
import {
  CATEGORIES, QUESTIONS, SCALE, COPY, CHIPS, OPEN_TYPES, TEXT_MAX, OPEN_MIN,
  occurrences, loadFeedbackState, saveFeedbackState, duePrompt, markShown, recordValue, recordOpen
} from './feedback.mjs';
import { getRun } from './guided.mjs';

// 카테고리별 도착 화면(SPEC-015 §2). 이 화면에서 횟수가 늘었을 때만 판단한다.
const LANDING = { idea: ['born', 'dashboard'], learning: ['session'], evidence: ['dashboard'], decision: ['journal'] };
const VIEW_CATEGORY = { born: 'idea', review: 'idea', session: 'learning', quiz: 'learning', evidence: 'evidence', fieldtask: 'evidence', decision: 'decision', journal: 'decision' };

export function createFeedbackUI({ getState, update, esc, toast, win = globalThis.window }) {
  const doc = win?.document;
  const storage = (() => { try { return win.localStorage; } catch { return null; } })();
  let fb = loadFeedbackState(storage, getState()).state;
  let storageOk = save();
  let lastCounts = occurrences(getState());
  let sessionPrompted = false, active = null, waitingDialog = false;

  function save() { return storage ? saveFeedbackState(storage, fb) : false; }
  const route = () => getState().route || {};
  const screenKey = () => { const r = route(); return `${r.view}:${r.projectId || ''}:${r.concept || ''}`; };
  function landingOk(c) {
    const r = route();
    if (!LANDING[c].includes(r.view)) return false;
    if (r.view === 'session') { const p = getState().projects.find(x => x.id === r.projectId); return getRun(p, r.concept)?.step === 'complete'; }
    return true;
  }
  const openDialog = () => doc.querySelector('dialog[open]');

  // ── 가치 카드 ──
  function cardHTML(a) {
    const { category } = a.prompt, ans = a.answer, r = ans.rating;
    if (a.done) return `<section class="vf-card vf-done" role="status"><span class="vf-done-mark" aria-hidden="true">✓</span><p>${esc(COPY.thanks)}</p></section>`;
    const chips = r ? (r >= 4 ? ['helped', COPY.helpedTitle] : ['friction', COPY.frictionTitle]) : null;
    return `<section class="vf-card" aria-labelledby="vf-q">
<div class="vf-head"><span class="vf-kicker">${esc(COPY.kicker)}</span><button type="button" class="vf-close" data-fb="skip" aria-label="이번 질문 닫기">×</button></div>
<form id="vf-form" novalidate>
<fieldset class="vf-scale"><legend id="vf-q">${esc(QUESTIONS[category])}</legend><div class="vf-scale-options">${SCALE.map((label, i) => `<label class="vf-opt"><input type="radio" name="vf-rating" value="${i + 1}" ${r === i + 1 ? 'checked' : ''}><span class="vf-num" aria-hidden="true">${i + 1}</span><span class="vf-label">${esc(label)}</span></label>`).join('')}</div></fieldset>
${chips ? `<fieldset class="vf-chips"><legend>${esc(chips[1])} <small>(여러 개 골라도 돼요)</small></legend><div class="vf-chip-list">${Object.entries(CHIPS[category][chips[0]]).map(([id, label]) => `<label class="vf-chip"><input type="checkbox" name="vf-chip" value="${id}" ${ans[chips[0]].has(id) ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset>
<label class="vf-text-label" for="vf-text">한 줄 의견</label><input id="vf-text" class="vf-text" name="vf-text" type="text" maxlength="${TEXT_MAX.value}" placeholder="${esc(COPY.textPlaceholder)}" value="${esc(ans.text)}" aria-describedby="vf-privacy">
<p class="vf-privacy" id="vf-privacy">${esc(COPY.privacy)}</p>` : ''}
<div class="vf-actions">${r ? '<button type="submit" class="btn primary">보내기</button>' : ''}<button type="button" class="btn link" data-fb="skip">다음에</button></div>
</form></section>`;
  }
  function place(el) {
    const main = doc.querySelector('#main'); if (!main) return false;
    const before = main.querySelector('.lesson-finish .field-invitation') || main.querySelector('.born .button-row');
    if (before) { before.before(el); return true; }
    const after = main.querySelector('.task-preview') || main.querySelector('.page-heading');
    if (after) { after.after(el); return true; }
    main.prepend(el); return true;
  }
  function mount() {
    if (!active) return;
    doc.querySelector('.vf-card')?.remove();
    const holder = doc.createElement('div'); holder.innerHTML = cardHTML(active);
    const el = holder.firstElementChild; if (!place(el)) return;
    if (!active.shown) {
      markShown(fb, active.prompt); active.shown = true; sessionPrompted = true; save();
    }
  }
  function mountWhenFree() {
    if (!active) return;
    const d = openDialog();
    if (!d) { mount(); return; }
    if (waitingDialog) return;
    waitingDialog = true;
    d.addEventListener('close', () => { waitingDialog = false; win.setTimeout(mountWhenFree, 0); }, { once: true });
  }
  function finalize(a) {
    if (!a?.shown || a.done) return;
    const ans = a.answer, r = route();
    try {
      recordValue(fb, a.prompt, ans.rating ? { rating: ans.rating, helped: [...ans.helped], friction: [...ans.friction], text: ans.text, view: a.view, concept: a.concept } : {});
    } catch { recordValue(fb, a.prompt, ans.rating ? { rating: ans.rating } : {}); }
    save();
  }

  /** app.render() 끝에서 호출 */
  function afterRender() {
    const key = screenKey();
    if (active && active.key !== key) { finalize(active); active = null; }
    const counts = occurrences(getState());
    if (!active) for (const c of CATEGORIES) {
      if (counts[c] <= lastCounts[c] || !landingOk(c)) continue;
      const prompt = duePrompt(fb, getState(), c, { sessionPrompted });
      if (prompt) { const r = route(); active = { prompt, key, view: r.view, concept: r.concept || null, shown: false, done: false, answer: { rating: null, helped: new Set(), friction: new Set(), text: '' } }; break; }
    }
    lastCounts = counts;
    if (!active) return;
    if (active.shown && !openDialog()) mount(); else win.setTimeout(mountWhenFree, 0);
  }

  function rerenderCard(focusSel) {
    const old = doc.querySelector('.vf-card'); if (!old || !active) return;
    const holder = doc.createElement('div'); holder.innerHTML = cardHTML(active);
    old.replaceWith(holder.firstElementChild);
    if (focusSel) doc.querySelector(focusSel)?.focus();
  }

  // ── 의견 보내기 페이지 ──
  function view() {
    const d = fb.openDraft || {}, back = route().back;
    return `<div class="narrow vf-open"><div class="page-heading"><div><div class="eyebrow">FEEDBACK</div><h1>${esc(COPY.openTitle)}</h1><p>${esc(COPY.openLead)}</p></div></div>
<form id="vf-open" class="panel" novalidate>
<fieldset class="vf-types"><legend>어떤 의견인가요?</legend><div class="vf-chip-list">${Object.entries(OPEN_TYPES).map(([id, label]) => `<label class="vf-chip"><input type="radio" name="openType" value="${id}" required ${d.openType === id ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset>
<div class="field"><label for="vf-open-text">내용</label><textarea id="vf-open-text" name="text" minlength="${OPEN_MIN}" maxlength="${TEXT_MAX.open}" required aria-describedby="vf-open-count vf-open-privacy" placeholder="예: 작은 배움이 짧아서 좋았어요. 다만 실행 기록에서 무엇을 적을지 헷갈렸어요.">${esc(d.text || '')}</textarea><p class="vf-count" id="vf-open-count" aria-live="polite">${(d.text || '').length} / ${TEXT_MAX.open}자</p></div>
<label class="vf-context"><input type="checkbox" name="withContext" ${d.withContext === false ? '' : 'checked'}><span>지금 보던 화면 정보 함께 보내기 <small>(화면 이름만${back?.view ? ` · ${esc(back.view)}` : ''})</small></span></label>
<p class="vf-privacy" id="vf-open-privacy">${esc(COPY.privacy)}</p>
<div class="button-row"><button type="submit" class="btn primary">보내기</button><button type="button" class="btn link" data-fb="back">돌아가기</button></div>
</form></div>`;
  }
  function openDraftFrom(form) {
    const f = new FormData(form);
    return { openType: f.get('openType') || '', text: String(f.get('text') || ''), withContext: form.querySelector('[name=withContext]').checked };
  }
  function goBack() {
    update(s => { const back = s.route.back; s.route = back && back.view !== 'feedback' ? back : { view: 'dashboard', projectId: s.route.projectId }; });
  }

  // ── 이벤트 ──
  doc.addEventListener('click', e => {
    const b = e.target.closest('[data-fb]'); if (!b) return;
    e.preventDefault();
    const a = b.dataset.fb;
    if (a === 'skip' && active && !active.done) {
      recordValue(fb, active.prompt, { skipped: true }); save(); active = null;
      doc.querySelector('.vf-card')?.remove(); doc.querySelector('#main')?.focus({ preventScroll: true });
    }
    if (a === 'open') update(s => { const { back: _drop, ...here } = s.route; s.route = { view: 'feedback', projectId: s.route.projectId, back: here.view === 'feedback' ? s.route.back : here }; });
    if (a === 'back') goBack();
  });
  doc.addEventListener('change', e => {
    const el = e.target;
    if (el.name === 'vf-rating' && active) { active.answer.rating = Number(el.value); rerenderCard(`.vf-card input[name="vf-rating"][value="${el.value}"]`); }
    if (el.name === 'vf-chip' && active) { const set = active.answer[active.answer.rating >= 4 ? 'helped' : 'friction']; el.checked ? set.add(el.value) : set.delete(el.value); }
    if (el.form?.id === 'vf-open') { fb.openDraft = openDraftFrom(el.form); save(); }
  });
  doc.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'vf-text' && active) active.answer.text = el.value;
    if (el.form?.id === 'vf-open') { fb.openDraft = openDraftFrom(el.form); save(); const c = doc.querySelector('#vf-open-count'); if (c) c.textContent = `${el.form.text.value.length} / ${TEXT_MAX.open}자`; }
  });
  doc.addEventListener('submit', e => {
    const f = e.target;
    if (f.id === 'vf-form' && active && !active.done) {
      e.preventDefault();
      const ans = active.answer;
      try { recordValue(fb, active.prompt, { rating: ans.rating, helped: [...ans.helped], friction: [...ans.friction], text: ans.text, view: active.view, concept: active.concept }); }
      catch (err) { toast(err.message); return; }
      save(); active.done = true; rerenderCard('.vf-done');
    }
    if (f.id === 'vf-open') {
      e.preventDefault();
      const d = openDraftFrom(f), back = route().back || {};
      try { recordOpen(fb, { openType: d.openType, text: d.text, withContext: d.withContext, view: back.view, category: VIEW_CATEGORY[back.view] || null, concept: back.concept || null }); }
      catch (err) { toast(err.message); return; }
      save(); toast('의견을 받았어요. 고마워요!'); goBack();
    }
  }, true);
  win.addEventListener('pagehide', () => { if (active) { finalize(active); active = null; } });

  return {
    afterRender, view,
    entry: (cls, variant = 'link') => `<button type="button" class="btn ${variant} ${cls}" data-fb="open">의견 보내기</button>`,
    get state() { return fb; }, get storageOk() { return storageOk; }
  };
}
