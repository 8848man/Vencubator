// SPEC-007 §5·§6: 이벤트 → reduce → 화면 반영. 스크롤은 상태를 트리거할 뿐 변형하지 않는다.
// L2I-01~10, L2M-01~07. 방문자 입력은 textContent로만 넣는다(마크업 주입 없음).
import { SITE, SAMPLES, SLOTS, STAMPS, LESSON, OBSERVATION, DECISIONS } from './content.mjs';
import { initialState, reduce, deriveCard, pathOrder, serialize, deserialize } from './state.mjs';
import { track, captureUtm, ensureAssignment } from './track.mjs';

export function bindLanding(win = window) {
  const doc = win.document, root = doc.documentElement;
  const reduced = !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const TRACK_ENV = { page: SITE.variant || 'v2' };
  captureUtm(win.location.search);
  ensureAssignment(TRACK_ENV.page);
  track('landing_view', {}, TRACK_ENV);
  root.classList.add('js');
  root.classList.toggle('reduced', reduced);
  const $ = (s, el = doc) => el.querySelector(s), $$ = (s, el = doc) => [...el.querySelectorAll(s)];
  const binds = k => $$(`[data-bind="${k}"]`);
  const setText = (k, v) => binds(k).forEach(el => { if (el.textContent !== v) el.textContent = v; });

  // L2I-10 로컬 저장 (실패해도 동작)
  const store = {
    load() { try { const raw = win.localStorage.getItem(SITE.storageKey); return raw ? deserialize(raw) : initialState(); } catch { return initialState(); } },
    save(s) { try { win.localStorage.setItem(SITE.storageKey, serialize(s)); } catch { /* 저장 불가 환경 */ } },
    clear() { try { win.localStorage.removeItem(SITE.storageKey); } catch { /* noop */ } }
  };

  let state = store.load();
  let prevCard = null;
  const card = $('#card'), ideaInput = $('#idea-input'), customerInput = $('#customer-input');
  const live = $('[data-live="card"]');

  function dispatch(action) {
    const next = reduce(state, action);
    if (next === state) return;
    // SPEC-009 §4 계측: 자유 텍스트 없이 구간·개수만
    if (action.type === 'SET_IDEA') { const n = next.idea.text.length; track('idea_submit', { source: next.idea.source, len: n >= 30 ? 30 : n >= 10 ? 10 : 0 }, TRACK_ENV); }
    const before = deriveCard(state).filled, after = deriveCard(next).filled;
    if (after > before) track('card_progress', { filled: after }, TRACK_ENV);
    state = next;
    store.save(state);
    paint();
  }

  // ── 화면 반영 ──
  function paintCard() {
    const c = deriveCard(state);
    c.slots.forEach((s, i) => {
      const el = $(`.l2-slot[data-slot="${s.key}"]`);
      if (!el) return;
      const value = s.status === 'empty' ? SLOTS[i].hint : s.value;
      const stamp = s.flag === 'refuted' ? STAMPS.refuted : STAMPS[s.status];
      const valEl = $('[data-value]', el), stampEl = $('[data-stamp]', el);
      const changed = prevCard && (prevCard.slots[i].value !== s.value || prevCard.slots[i].status !== s.status);
      el.dataset.status = s.status;
      if (s.flag) el.dataset.flag = s.flag; else delete el.dataset.flag;
      valEl.textContent = value;
      stampEl.textContent = stamp;
      el.setAttribute('aria-label', `${s.label}: ${value} (${stamp}). 해당 설명으로 이동`);
      if (changed && !reduced) { el.classList.remove('is-writing'); void el.offsetWidth; el.classList.add('is-writing'); }
    });
    setText('filled', String(c.filled));
    const grow = String(c.grow);
    [card, $('.l2-finish-card')].forEach(el => el?.style.setProperty('--grow', grow));
    card?.classList.toggle('is-complete', c.complete);
    if (prevCard && c.filled > prevCard.filled) {
      const newly = c.slots.find((s, i) => s.status === 'mine' && prevCard.slots[i].status !== 'mine');
      if (live && newly) live.textContent = live.dataset.template.replace('{label}', newly.label).replace('{n}', c.filled).replace('{total}', c.total);
      if (!reduced && card) { card.classList.remove('is-nudge'); void card.offsetWidth; card.classList.add('is-nudge'); }
    }
    // L2S-11 제목
    const ft = $('[data-bind="finish-title"]');
    if (ft) ft.textContent = c.complete ? ft.dataset.done : ft.dataset.partial.replace('{n}', c.filled);
    prevCard = c;
  }

  function paintIdea() {
    setText('idea', state.idea.text);
    const preview = $('[data-bind="idea-preview"]');
    if (preview && !(ideaInput && ideaInput.value.trim())) { preview.textContent = state.idea.text; preview.classList.toggle('is-example', state.idea.source !== 'mine'); }
    $$('.l2-chip').forEach(b => b.setAttribute('aria-pressed', String(state.idea.source === 'example' && state.idea.sample === b.dataset.sample)));
  }

  function paintLearn() {
    const L = state.learn, v = LESSON.variants[L.variant];
    const q = $('[data-bind="quiz-q"]'), box = $('[data-options]'), fb = $('[data-bind="quiz-feedback"]');
    if (!q || !box) return;
    setText('quiz-no', String(L.variant + 1));
    if (q.textContent !== v.question) {
      q.textContent = v.question;
      box.replaceChildren(...v.options.map((o, i) => { const b = doc.createElement('button'); b.type = 'button'; b.className = 'l2-option'; b.dataset.choice = String(i); b.textContent = o; return b; }));
    }
    const done = !!L.result;
    $$('.l2-option', box).forEach(b => {
      const i = Number(b.dataset.choice);
      b.disabled = done;
      b.classList.toggle('is-right', done && i === v.answer);
    });
    const msg = L.result ? `${LESSON.feedback[L.result]} ${v.why}` : L.last === 'wrong' ? LESSON.feedback.wrong : '';
    fb.textContent = msg;
    fb.dataset.tone = L.result ? (L.result === 'helped' ? 'soft' : 'good') : L.last === 'wrong' ? 'retry' : '';
  }

  function paintApply() {
    setText('customer', state.apply.customer);
    if (customerInput && doc.activeElement !== customerInput) customerInput.value = state.apply.customer;
    const m = $('[data-bind="apply-msg"]');
    if (m) m.textContent = state.apply.saved ? m.dataset.saved : '';
    const save = $('[data-action="save-questions"]');
    if (save) save.setAttribute('aria-pressed', String(state.apply.saved));
  }

  function paintObserve() {
    $$('[data-observe]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.observe === state.observe)));
    setText('observe-note', state.observe ? OBSERVATION.note[state.observe] : '');
    $('[data-bind="observe-note"]')?.setAttribute('data-tone', state.observe || '');
    const wrap = $('[data-decisions]'), wait = $('[data-bind="decide-waiting"]');
    if (!wrap) return;
    wait.hidden = !!state.observe;
    const list = state.observe ? DECISIONS[state.observe] : [];
    const sig = list.map(d => d.key).join();
    if (wrap.dataset.sig !== sig) {
      wrap.dataset.sig = sig;
      wrap.replaceChildren(...list.map(d => {
        const b = doc.createElement('button'); b.type = 'button'; b.className = 'l2-decision'; b.dataset.decide = d.key;
        const t = doc.createElement('strong'); t.textContent = d.t; const p = doc.createElement('span'); p.textContent = d.d;
        b.append(t, p); return b;
      }));
    }
    $$('[data-decide]', wrap).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.decide === state.decision)));
  }

  // L2M-06 FLIP 재배치
  function paintPath() {
    const ol = $('[data-path]'); if (!ol) return;
    const { order, current, next } = pathOrder(state);
    const nodes = order.map(k => $(`.l2-node[data-key="${k}"]`, ol));
    const same = nodes.every((n, i) => ol.children[i] === n);
    const first = same || reduced ? null : new Map(nodes.map(n => [n, n.getBoundingClientRect()]));
    if (!same) ol.append(...nodes);
    const rule = $('[data-bind="path-rule"]');
    nodes.forEach(n => {
      const k = n.dataset.key, badge = $('[data-badge]', n);
      n.classList.toggle('is-current', k === current);
      n.classList.toggle('is-next', k === next);
      n.classList.toggle('is-moved', state.observe === 'refuted' && k === 'strategy');
      badge.textContent = k === current ? ol.dataset.current : k === next ? ol.dataset.next : '';
      if (first) {
        const a = first.get(n), b = n.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) n.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
    if (rule) rule.textContent = state.observe === 'refuted' ? rule.dataset.refuted : rule.dataset.default;
  }

  function paint() { paintIdea(); paintLearn(); paintApply(); paintObserve(); paintPath(); paintCard(); }

  // ── L2M-04 문장 → 카드 방향 ──
  function flyFromInput(text) {
    if (reduced || !ideaInput || !card) return;
    const r = ideaInput.getBoundingClientRect();
    const ghost = doc.createElement('div');
    ghost.className = 'l2-fly'; ghost.textContent = text; ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px' });
    doc.body.append(ghost);
    const dx = Math.min(win.innerWidth * 0.3, win.innerWidth - r.right), dy = win.innerHeight * 0.55;
    const anim = ghost.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(.6)`, opacity: 0 }
    ], { duration: 700, easing: 'cubic-bezier(.5,0,.2,1)' });
    anim.onfinish = () => ghost.remove();
  }

  const goTo = (id, focus = true) => {
    const el = doc.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (focus) $('h2', el)?.focus({ preventScroll: true });
  };

  // ── 이벤트 ──
  $('[data-form="idea"]')?.addEventListener('submit', e => {
    e.preventDefault();
    const text = ideaInput.value.trim(), msg = $('#idea-msg');
    if (!text) { msg.textContent = msg.dataset.empty; ideaInput.focus(); return; }
    msg.textContent = '';
    flyFromInput(text);
    dispatch({ type: 'SET_IDEA', text, source: 'mine' });
    dispatch({ type: 'REACH', chapter: 'idea' });
    setTimeout(() => goTo('idea'), reduced ? 0 : 180);
  });

  ideaInput?.addEventListener('input', () => {
    const p = $('[data-bind="idea-preview"]'); if (!p) return;
    const t = ideaInput.value.trim();
    p.textContent = t || state.idea.text; p.classList.toggle('is-example', !t && state.idea.source !== 'mine');
  });

  doc.addEventListener('click', e => {
    const t = e.target.closest('button, a'); if (!t) return;
    if (t.dataset.sample) {
      const s = SAMPLES.find(x => x.key === t.dataset.sample);
      if (ideaInput) ideaInput.value = s.idea;
      dispatch({ type: 'SET_IDEA', text: s.idea, source: 'example', sample: s.key });
      dispatch({ type: 'REACH', chapter: 'idea' });
      setTimeout(() => goTo('idea', false), reduced ? 0 : 120);
    } else if (t.dataset.choice !== undefined && t.classList.contains('l2-option')) {
      dispatch({ type: 'ANSWER', choice: Number(t.dataset.choice) });
    } else if (t.dataset.action === 'save-questions') {
      dispatch({ type: 'SAVE_QUESTIONS' });
    } else if (t.dataset.observe) {
      dispatch({ type: 'OBSERVE', result: t.dataset.observe });
    } else if (t.dataset.decide) {
      dispatch({ type: 'DECIDE', key: t.dataset.decide });
    } else if (t.dataset.goto) {
      setTray(false);
      goTo(t.dataset.goto);
    } else if (t.dataset.action === 'reset') {
      store.clear(); state = initialState(); prevCard = null;
      if (ideaInput) ideaInput.value = '';
      if (customerInput) customerInput.value = state.apply.customer;
      setText('copy-msg', '');
      paint();
      win.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      ideaInput?.focus({ preventScroll: true });
    } else if (t.dataset.cta === 'prototype') {
      // SPEC-009: 같은 사이트의 /app/ 으로 이동. 문장은 저장소로 인계되므로 복사 불필요
      track('cta_click', { placement: (t.closest('[data-spec]')?.dataset.spec || 'page').toLowerCase(), filled: deriveCard(state).filled }, TRACK_ENV);
    }
  });

  customerInput?.addEventListener('input', () => dispatch({ type: 'SET_CUSTOMER', text: customerInput.value }));

  // L2I-08 모바일 트레이
  const toggle = $('.l2-tray-toggle');
  function setTray(open) {
    if (!toggle || !card) return;
    card.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    $('.l2-tray-label', toggle).textContent = open ? toggle.dataset.close : toggle.dataset.open;
  }
  toggle?.addEventListener('click', () => setTray(toggle.getAttribute('aria-expanded') !== 'true'));
  doc.addEventListener('keydown', e => { if (e.key === 'Escape' && card?.classList.contains('is-open')) { setTray(false); toggle.focus(); } });

  // ── 관찰자: L2M-01 진입, 도달(REACH), 활성 챕터 ──
  const chapters = $$('.l2-ch');
  const reveal = $$('.l2-ch, .l2-path-sec, .l2-in');
  if (!('IntersectionObserver' in win)) {
    reveal.forEach(el => el.classList.add('is-in'));
    chapters.forEach(ch => dispatch({ type: 'REACH', chapter: ch.id }));
  } else {
    const io = new win.IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.classList.contains('l2-ch')) dispatch({ type: 'REACH', chapter: e.target.id });
      io.unobserve(e.target);
    }), { threshold: 0.25 });
    reveal.forEach(el => io.observe(el));
    const act = new win.IntersectionObserver(es => es.forEach(e => {
      e.target.classList.toggle('is-active', e.isIntersecting);
      const slot = $(`.l2-slot[data-goto="${e.target.id}"]`);
      slot?.classList.toggle('is-current', e.isIntersecting);
    }), { rootMargin: '-42% 0px -42% 0px' });
    chapters.forEach(ch => act.observe(ch));
  }

  paint();
  return { get state() { return state; }, dispatch };
}
