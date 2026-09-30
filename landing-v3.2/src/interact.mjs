// SPEC-017 §5·§6: 이벤트 → reduce → 화면 반영, 스크롤 → 뿌리·깊이. 스크롤은 그림만 바꾸고 상태를 바꾸지 않는다(REACH 제외).
// L3I-01~09, L3M-01~07. 방문자 입력은 textContent·value로만 넣는다(마크업 주입 없음).
import { SITE, SECTIONS, SAMPLES, STAMPS, LESSON, OBSERVATION, DECISIONS, NEXT_COPY, CTA_COPY, PAIN, HEADLINES } from './content.mjs';
import { initialState, reduce, deriveCard, rootState, pathOrder, serialize, deserialize, nextState, observationFor } from './state.mjs';
import { track, captureUtm, ensureAssignment } from './track.mjs';

const SVG = 'http://www.w3.org/2000/svg';
// 층 경계의 깊이(cm). SPEC-017 §3 지층 표와 같음
const DEPTH_STOPS = [['learn', 0], ['ask', 15], ['observe', 40], ['decide', 70], ['roots', 100]];

export function bindLanding(win = window) {
  const doc = win.document, root = doc.documentElement;
  const reduced = !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const TRACK_ENV = { page: SITE.variant };
  captureUtm(win.location.search);
  ensureAssignment(TRACK_ENV.page);
  track('landing_view', {}, TRACK_ENV);
  root.classList.add('js');
  root.classList.toggle('reduced', reduced);
  const $ = (s, el = doc) => el.querySelector(s), $$ = (s, el = doc) => [...el.querySelectorAll(s)];
  const binds = k => $$(`[data-bind="${k}"]`);
  const setText = (k, v) => binds(k).forEach(el => { if (el.textContent !== v) el.textContent = v; });
  const gauge = SECTIONS.find(s => s.type === 'gauge');
  const byAnchor = Object.fromEntries(SECTIONS.map(s => [s.anchor, s]));

  // L3I-13 첫 화면 후보 미리보기 (?h=a|b|c). 5초 테스트 전용, 계측 없음, textContent로만
  try {
    const h = new URLSearchParams(win.location.search).get('h');
    if (h && Object.hasOwn(HEADLINES, h) && h !== SITE.headline) {
      setText('h1-0', HEADLINES[h].lines[0]); setText('h1-1', HEADLINES[h].lines[1]); setText('lead', HEADLINES[h].lead);
      const h1 = $('h1[data-headline]'); if (h1) h1.dataset.headline = h;
    }
  } catch { /* 주소 해석 불가 환경 */ }

  // L3I-09 로컬 저장 (실패해도 동작)
  const store = {
    load() { try { const raw = win.localStorage.getItem(SITE.storageKey); return raw ? deserialize(raw) : initialState(); } catch { return initialState(); } },
    save(s) { try { win.localStorage.setItem(SITE.storageKey, serialize(s)); } catch { /* 저장 불가 환경 */ } },
    clear() { try { win.localStorage.removeItem(SITE.storageKey); } catch { /* noop */ } }
  };

  let state = store.load();
  let prev = null;
  let previousNext = null;
  let firstPlant = true, bubbleTimer = 0;
  const ideaInput = $('#idea-input'), customerInput = $('#customer-input');

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
  function paintIdea() {
    setText('idea', state.idea.text);
    // 내 문장만 입력칸에 되살린다. 예시 상태의 빈 칸에서는 손글씨 자동 쓰기가 돈다 (L3M-05)
    if (ideaInput && doc.activeElement !== ideaInput && state.idea.source === 'mine') ideaInput.value = state.idea.text;
    $$('[data-sample]').forEach(b => b.setAttribute('aria-pressed', String(state.idea.source === 'example' && state.idea.sample === b.dataset.sample)));
    typing.sync();
  }

  function paintNotes(c) {
    c.slots.forEach((s, i) => {
      const el = $(`.l3-note[data-slot="${s.key}"]`);
      if (!el) return;
      const stamp = s.flag === 'refuted' ? STAMPS.refuted : STAMPS[s.status];
      $('[data-value]', el).textContent = s.value;
      $('[data-stamp]', el).textContent = stamp;
      el.dataset.status = s.status;
      if (s.flag) el.dataset.flag = s.flag; else delete el.dataset.flag;
      const changed = prev && (prev.slots[i].value !== s.value || prev.slots[i].status !== s.status);
      if (changed && !reduced) { el.classList.remove('is-writing'); void el.offsetWidth; el.classList.add('is-writing'); }
    });
  }

  function paintLearn() {
    const L = state.learn, v = LESSON.variants[L.variant];
    const q = $('[data-bind="quiz-q"]'), box = $('[data-options]'), fb = $('[data-bind="quiz-feedback"]');
    if (!q || !box) return;
    setText('quiz-no', String(L.variant + 1));
    if (q.textContent !== v.question) {
      q.textContent = v.question;
      box.replaceChildren(...v.options.map((o, i) => { const b = doc.createElement('button'); b.type = 'button'; b.className = 'l3-option'; b.dataset.choice = String(i); b.textContent = o; return b; }));
    }
    const done = !!L.result;
    $$('.l3-option', box).forEach(b => { const i = Number(b.dataset.choice); b.disabled = done; b.classList.toggle('is-right', done && i === v.answer); });
    fb.textContent = L.result ? `${LESSON.feedback[L.result]} ${v.why}` : L.last === 'wrong' ? LESSON.feedback.wrong : '';
    fb.dataset.tone = L.result ? (L.result === 'helped' ? 'soft' : 'good') : L.last === 'wrong' ? 'retry' : '';
  }

  function paintAsk() {
    setText('customer', state.ask.customer);
    if (customerInput && doc.activeElement !== customerInput) customerInput.value = state.ask.customer;
    const m = $('[data-bind="ask-msg"]');
    if (m) m.textContent = state.ask.saved ? m.dataset.saved : '';
    $('[data-action="save-questions"]')?.classList.toggle('is-ready', state.ask.source === 'mine' && !state.ask.saved);
    $('[data-action="save-questions"]')?.setAttribute('aria-pressed', String(state.ask.saved));
  }

  function paintObserve() {
    observationFor(state).forEach((quote,i)=>{ const el = $('[data-quote="'+i+'"]'); if (el.textContent !== quote) el.textContent=quote; });
    $$('[data-observe]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.observe === state.observe)));
    const note = $('[data-bind="observe-note"]');
    if (note) { note.textContent = state.observe ? OBSERVATION.note[state.observe] + (state.observe === 'refuted' ? ' ' + note.dataset.turn : '') : ''; note.dataset.tone = state.observe || ''; }
    const wrap = $('[data-decisions]'), wait = $('[data-bind="decide-waiting"]');
    if (!wrap) return;
    wait.hidden = !!state.observe;
    const list = state.observe ? DECISIONS[state.observe] : [];
    const sig = list.map(d => d.key).join();
    if (wrap.dataset.sig !== sig) {
      wrap.dataset.sig = sig;
      wrap.replaceChildren(...list.map(d => {
        const b = doc.createElement('button'); b.type = 'button'; b.className = 'l3-decision'; b.dataset.decide = d.key;
        const t = doc.createElement('strong'); t.textContent = d.t; const p = doc.createElement('span'); p.textContent = d.d;
        b.append(t, p); return b;
      }));
    }
    $$('[data-decide]', wrap).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.decide === state.decision)));
  }

  function paintMap() {
    const ol = $('[data-path]'); if (!ol) return;
    const { current, next } = pathOrder(state);
    $$('.l3-area', ol).forEach(n => {
      const k = n.dataset.key;
      n.classList.toggle('is-current', k === current);
      n.classList.toggle('is-next', k === next);
      n.classList.toggle('is-moved', state.observe === 'refuted' && k === 'strategy');
      $('[data-badge]', n).textContent = k === current ? ol.dataset.current : k === next ? ol.dataset.next : '';
    });
    $$('[data-branch]').forEach(p => { p.classList.toggle('is-current', p.dataset.branch === current); p.classList.toggle('is-next', p.dataset.branch === next); });
    const rule = $('[data-bind="path-rule"]');
    if (rule) rule.textContent = state.observe === 'refuted' ? rule.dataset.refuted : rule.dataset.default;
  }

  function paintHarvest(c) {
    const rs = rootState(state), h = $('[data-bind="harvest-title"]');
    if (h) h.textContent = c.complete ? h.dataset.done : rs.mine > 0 ? h.dataset.partial.replace('{n}', rs.mine) : h.dataset.none;
    // L3M-07 새싹: 채운 만큼 자람 (예시 상태에서도 완성된 모습 — DP-12)
    const grow = String(0.35 + 0.65 * c.grow);
    $$('.l3-sprout').forEach(el => el.style.setProperty('--grow', grow));
  }

  // L3I-10 / L3M-08: 최초 paint는 복원, 이후 false→true만 유한 모션.
  function paintNext() {
    const visible = nextState(state);
    let opened = false;
    $$('.l3-next').forEach(el => {
      const key = el.dataset.next;
      el.hidden = !visible[key];
      if (!visible[key] || !previousNext) el.classList.remove('is-growing');
      if (previousNext && !previousNext[key] && visible[key]) {
        opened = true;
        if (!reduced) { el.classList.remove('is-growing'); void el.offsetWidth; el.classList.add('is-growing'); }
      }
    });
    if (opened) $('[data-next-live]').textContent = NEXT_COPY.live;
    else $('[data-next-live]').textContent = '';
    previousNext = visible;
  }

  // L3I-12 / L3M-09: 이름표 포함 5칸. 초기 복원에는 강조하지 않는다.
  function showBubble(text) {
    const bubble = $('[data-cta-bubble]');
    win.clearTimeout(bubbleTimer); bubble.textContent = text; bubble.hidden = false;
    bubbleTimer = win.setTimeout(() => { bubble.hidden = true; }, 3000);
  }
  function paintCTA(c) {
    const dots = $('.l3-progress'), cta = $('.l3-app-cta');
    dots.setAttribute('aria-label', CTA_COPY.progress.replace('{n}', c.filled));
    $$('span', dots).forEach((dot,i) => { dot.textContent = i < c.filled ? '●' : '○'; });
    if (prev && c.filled > prev.filled) {
      if (!reduced) { cta.classList.remove('is-shining','is-complete'); void cta.offsetWidth; cta.classList.add(c.complete?'is-complete':'is-shining'); }
      if (c.complete) showBubble(CTA_COPY.complete);
    }
    if (c.filled === 0) { cta.classList.remove('is-shining','is-complete'); $('[data-cta-bubble]').hidden = true; }
  }

  function paint() {
    const c = deriveCard(state);
    setText('pain-line', PAIN.options.find(p=>p.key===state.pain)?.line || PAIN.lineDefault);
    $$('[data-pain]').forEach(b=>b.setAttribute('aria-pressed',String(state.pain===b.dataset.pain)));
    paintIdea(); paintNotes(c); paintLearn(); paintAsk(); paintObserve(); paintMap(); paintHarvest(c); paintNext(); paintCTA(c);
    rootDraw.sync(prev, c);
    prev = c;
  }

  // ── L3M-05 이름표 손글씨 자동 쓰기 ──
  const typing = (() => {
    const el = $('.l3-typing');
    const lines = el ? JSON.parse(el.dataset.typing || '[]') : [];
    const ph = ideaInput?.getAttribute('placeholder') || '';
    let timer = 0, line = 0, pos = 0, dir = 1, on = false;
    const active = () => !reduced && el && lines.length && ideaInput && !ideaInput.value && doc.activeElement !== ideaInput;
    function tick() {
      const t = lines[line];
      pos += dir;
      el.textContent = t.slice(0, pos);
      let wait = dir > 0 ? 90 : 28;
      if (dir > 0 && pos >= t.length) { dir = -1; wait = 1700; }
      else if (dir < 0 && pos <= 0) { dir = 1; line = (line + 1) % lines.length; wait = 420; }
      timer = win.setTimeout(tick, wait);
    }
    return {
      sync() {
        const want = !!active();
        if (want === on) return;
        on = want;
        el?.classList.toggle('is-on', on);
        if (on) { ideaInput.setAttribute('placeholder', ''); pos = 0; dir = 1; timer = win.setTimeout(tick, 500); }
        else { win.clearTimeout(timer); if (el) el.textContent = ''; ideaInput?.setAttribute('placeholder', ph); }
      }
    };
  })();

  // ── L3M-01~04 뿌리와 깊이 ──
  const rootDraw = (() => {
    const soil = $('[data-soil]'), rail = $('.l3-rail'), svg = $('.l3-root');
    if (!soil || !svg) return { sync() {}, layout() {}, scroll() {} };
    const main = $('[data-root-main]', svg), mainEdge = $('[data-root-main-edge]', svg), stub = $('[data-root-stub]', svg);
    const sidesG = $('[data-root-sides]', svg), hairsG = $('[data-root-hairs]', svg);
    const ticks = $('[data-ticks]', rail), tip = $('[data-tip]', rail);
    let L = null; // 레이아웃 캐시
    const sideEls = new Map();
    const wiggle = y => Math.sin(y / 140) * 6 + Math.sin(y / 53) * 2;
    const ease = t => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t)))) / 2;

    function layout() {
      const sr = soil.getBoundingClientRect();
      const W = soil.clientWidth, H = soil.offsetHeight;
      const grid = $('.l3-layer-grid', soil);
      const railX = (grid ? grid.getBoundingClientRect().left - sr.left : 0) + (parseFloat(win.getComputedStyle(rail).getPropertyValue('--rail-x')) || 40);
      const top = id => { const el = doc.getElementById(id); return el ? el.getBoundingClientRect().top - sr.top : 0; };
      const stops = DEPTH_STOPS.map(([id, cm]) => ({ id, cm, y: top(id) }));
      const end = stops[stops.length - 1].y + 90;
      const obs = $('.l3-note[data-slot="observe"]', soil);
      const turnY = obs ? obs.getBoundingClientRect().top - sr.top + 26 : top('observe') + 120;
      const notes = $$('.l3-note', soil).map(n => { const r = n.getBoundingClientRect(); return { key: n.dataset.slot, x: r.left - sr.left - 6, y: r.top - sr.top + 24 }; });
      const turn = parseFloat(win.getComputedStyle(rail).getPropertyValue('--rail-turn')) || 34;
      L = { W, H, railX, turn, stops, end, turnY, notes, top: sr.top + win.scrollY };
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      ticks.replaceChildren(...stops.map(s => { const t = doc.createElement('span'); t.className = 'l3-tick'; t.style.top = s.y + 'px'; t.style.left = railX + 'px'; t.textContent = `${s.cm}${gauge.unit}`; return t; }));
      // 뿌리털 (장식): 줄기 양옆 짧은 선
      hairsG.replaceChildren(...Array.from({ length: Math.floor(end / 170) }, (_, i) => {
        const y = 60 + i * 170, x = railX + wiggle(y), s = i % 2 ? 1 : -1;
        const p = doc.createElementNS(SVG, 'path'); p.setAttribute('d', `M${x} ${y}q${s * 10} 6 ${s * 18} 22`); p.dataset.y = y; return p;
      }));
      build();
      scroll();
    }

    const mainX = (y, turned) => L.railX + wiggle(y) + (turned ? L.turn * ease((y - L.turnY) / 90) : 0);

    function build() {
      if (!L) return;
      const rs = rootState(state);
      const pts = [];
      for (let y = 0; y <= L.end; y += 24) pts.push(`${mainX(y, rs.turned).toFixed(1)} ${y}`);
      const d = 'M' + pts.join('L');
      main.setAttribute('d', d); mainEdge.setAttribute('d', d);
      mainEdge.setAttribute('pathLength', '1');
      // L3M-04 막힌 쪽 뿌리: 원래 방향으로 조금 뻗다 멈춘 흔적
      if (rs.turned) {
        const x = mainX(L.turnY, false), y2 = L.turnY + 84;
        stub.setAttribute('d', `M${x.toFixed(1)} ${L.turnY}C${x - 2} ${L.turnY + 30} ${L.railX + wiggle(y2) - 4} ${y2 - 20} ${L.railX + wiggle(y2) - 4} ${y2}m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0`);
      } else stub.setAttribute('d', '');
      soil.classList.toggle('is-turned', rs.turned);
      // L3M-03 곁뿌리: 층 기록(메모)까지
      const layers = new Map(rs.layers.map(l => [l.key, l]));
      L.sides = L.notes.filter(n => layers.has(n.key)).map(n => {
        const y0 = Math.max(0, n.y - 56), x0 = mainX(y0, rs.turned && y0 > L.turnY);
        const d2 = `M${x0.toFixed(1)} ${y0}C${(x0 + (n.x - x0) * 0.25).toFixed(1)} ${y0 + 34} ${(n.x - 28).toFixed(1)} ${n.y - 6} ${n.x.toFixed(1)} ${n.y}`;
        // 곁뿌리 = 테두리(흙색) + 속(연두) 두 겹
        let pair = sideEls.get(n.key);
        if (!pair) {
          pair = ['is-edge', 'is-top'].map(() => { const e = doc.createElementNS(SVG, 'path'); e.setAttribute('pathLength', '1'); sidesG.append(e); return e; });
          sideEls.set(n.key, pair);
        }
        const l = layers.get(n.key);
        pair.forEach((p, i) => {
          p.setAttribute('d', d2);
          p.setAttribute('class', `l3-side ${i ? 'is-top' : 'is-edge'} is-${l.status}${n.key === 'observe' && rs.turned ? ' is-turn' : ''}${p.classList.contains('is-drawn') ? ' is-drawn' : ''}`);
        });
        return { pair, y0 };
      });
    }

    // L3M-01·02 스크롤 진행 → 줄기 길이, 깊이 눈금
    function scroll() {
      if (!L) return;
      const vh = win.innerHeight;
      const tipY = reduced ? L.end : Math.min(L.end, Math.max(0, win.scrollY + vh * 0.6 - L.top));
      const p = tipY / L.end;
      const off = String(1 - p);
      main.style.strokeDashoffset = off; mainEdge.style.strokeDashoffset = off;
      stub.classList.toggle('is-drawn', tipY > L.turnY + 20);
      (L.sides || []).forEach(s => s.pair.forEach(p => p.classList.toggle('is-drawn', tipY > s.y0 + 20)));
      $$('path', hairsG).forEach(h => h.classList.toggle('is-drawn', tipY > Number(h.dataset.y)));
      // 깊이: 층 경계 사이를 선형 보간
      const st = L.stops;
      let cm = 0, name = gauge.ground;
      if (tipY <= 2) { cm = 0; }
      else if (tipY >= st[st.length - 1].y) { cm = 100; const s = byAnchor.roots; name = `${s.stratum} · ${s.meaning}`; }
      else for (let i = 0; i < st.length - 1; i++) {
        if (tipY >= st[i].y && tipY < st[i + 1].y) {
          cm = Math.round(st[i].cm + (st[i + 1].cm - st[i].cm) * (tipY - st[i].y) / Math.max(1, st[i + 1].y - st[i].y));
          const s = byAnchor[st[i].id]; name = `${s.stratum} · ${s.meaning}`;
        }
      }
      $('[data-tip-depth]', tip).textContent = `${cm}${cm >= 100 && tipY >= L.end - 1 ? '+' : ''}${gauge.unit}`;
      $('[data-tip-name]', tip).textContent = name;
      const tx = mainX(tipY, rootState(state).turned && tipY > L.turnY);
      tip.style.transform = `translate(${tx.toFixed(1)}px, ${tipY.toFixed(1)}px)`;
      tip.classList.toggle('is-visible', !reduced && tipY > 4 && tipY < L.end - 4);
      // 상단바: 짙은 흙 위에서는 어두운 톤
      const probe = 40 + win.scrollY - L.top;
      const dark = probe > (st.find(s => s.id === 'observe')?.y ?? Infinity) && probe < L.H;
      $('.l3-top')?.classList.toggle('is-dark', dark);
    }

    return {
      layout,
      scroll,
      sync(before, c) {
        if (!L) return;
        // 내가 채운 층이 새로 생기면 곁뿌리를 다시 그린다 (600ms)
        build();
        if (before) c.slots.forEach((s, i) => {
          if (s.status === 'mine' && before.slots[i].status !== 'mine') {
            const pair = sideEls.get(s.key);
            if (pair && !reduced) { pair.forEach(p => p.classList.remove('is-drawn')); void pair[0].getBoundingClientRect(); }
          }
        });
        scroll();
      }
    };
  })();

  const goTo = (id, focus = true) => {
    const el = doc.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (focus) $('h2', el)?.focus({ preventScroll: true });
  };

  // ── 이벤트 ──
  // L3I-01 이름표 심기
  $('[data-form="idea"]')?.addEventListener('submit', e => {
    e.preventDefault();
    const text = ideaInput.value.trim(), msg = $('#idea-msg');
    if (!text) { msg.textContent = msg.dataset.empty; ideaInput.focus(); return; }
    msg.textContent = '';
    const sample = SAMPLES.find(x => x.idea === text);
    dispatch(sample ? { type: 'SET_IDEA', text, source: 'example', sample: sample.key } : { type: 'SET_IDEA', text, source: 'mine' });
    dispatch({ type: 'REACH', chapter: 'surface' });
    if (firstPlant) { firstPlant = false; if (!deriveCard(state).complete) showBubble(CTA_COPY.first); }
    const tag = e.currentTarget;
    if (!reduced) { tag.classList.remove('is-planted'); void tag.offsetWidth; tag.classList.add('is-planted'); }
    win.setTimeout(() => goTo('learn'), reduced ? 0 : 520);
  });
  ideaInput?.addEventListener('focus', () => typing.sync());
  ideaInput?.addEventListener('blur', () => typing.sync());
  ideaInput?.addEventListener('input', () => typing.sync());

  doc.addEventListener('click', e => {
    const t = e.target.closest('button, a'); if (!t) return;
    if (t.dataset.pain) { // L3I-11
      if (state.pain !== t.dataset.pain) { dispatch({type:'SET_PAIN',key:t.dataset.pain}); track('pain_select',{pain:t.dataset.pain},TRACK_ENV); }
    } else if (t.hasAttribute('data-cta-bubble')) { t.hidden = true; win.clearTimeout(bubbleTimer);
    } else if (t.dataset.goto) { // L3I-10
      goTo(t.dataset.goto);
      track('next_click', {layer:t.closest('.l3-next').dataset.next}, TRACK_ENV);
    } else if (t.dataset.sample) { // L3I-02
      const s = SAMPLES.find(x => x.key === t.dataset.sample);
      if (ideaInput) ideaInput.value = s.idea;
      dispatch({ type: 'SET_IDEA', text: s.idea, source: 'example', sample: s.key });
    } else if (t.dataset.choice !== undefined && t.classList.contains('l3-option')) { // L3I-03
      dispatch({ type: 'ANSWER', choice: Number(t.dataset.choice) });
    } else if (t.dataset.action === 'save-questions') { // L3I-04
      dispatch({ type: 'SAVE_QUESTIONS' });
    } else if (t.dataset.observe) { // L3I-05
      dispatch({ type: 'OBSERVE', result: t.dataset.observe });
    } else if (t.dataset.decide) { // L3I-06
      dispatch({ type: 'DECIDE', key: t.dataset.decide });
    } else if (t.dataset.action === 'reset') { // L3I-07
      store.clear(); state = initialState(); prev = null; previousNext = null;
      if (ideaInput) ideaInput.value = '';
      paint();
      win.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      ideaInput?.focus({ preventScroll: true });
    } else if (t.dataset.cta === 'prototype') { // L3I-08 같은 사이트 /app/ 로 이동, 문장은 저장소로 인계
      track('cta_click', { placement: (t.dataset.placement || t.closest('[data-spec]')?.dataset.spec || 'page').toLowerCase(), filled: deriveCard(state).filled }, TRACK_ENV);
    }
  });

  customerInput?.addEventListener('input', () => dispatch({ type: 'SET_CUSTOMER', text: customerInput.value }));

  // ── 관찰자: L3M-06 진입, 도달(REACH) ──
  const rise = $$('.l3-rise, .l3-layer h2, .l3-note, .l3-panel');
  if (!('IntersectionObserver' in win) || reduced) {
    rise.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new win.IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }), { threshold: 0.2 });
    rise.forEach(el => io.observe(el));
    const reach = new win.IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && e.target.dataset.chapter) dispatch({ type: 'REACH', chapter: e.target.dataset.chapter });
    }), { threshold: 0.25 });
    $$('.l3-layer[data-chapter]').forEach(el => reach.observe(el));
  }

  // 스크롤·크기 변화 (rAF 1회 스로틀)
  let raf = 0;
  const onScroll = () => { if (!raf) raf = win.requestAnimationFrame(() => { raf = 0; rootDraw.scroll(); }); };
  let lraf = 0;
  const onLayout = () => { if (!lraf) lraf = win.requestAnimationFrame(() => { lraf = 0; rootDraw.layout(); }); };
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', onLayout);
  if ('ResizeObserver' in win) { const soil = $('[data-soil]'); if (soil) new win.ResizeObserver(onLayout).observe(soil); }
  doc.fonts?.ready?.then(onLayout);

  paint();
  rootDraw.layout();
  return { get state() { return state; }, dispatch };
}
