// SPEC-006 §4: 모션 계약 LM-01~LM-09.
// 위쪽 = 순수 수식(테스트 대상), 아래 bindMotion = DOM 바인딩(수식 결과를 CSS 변수/클래스로만 반영).

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
/** smoothstep: v²(3−2v) */
export const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const r3 = v => Math.round(v * 1000) / 1000;

/** sticky 스테이지를 가진 섹션 내부 진행률 */
export const sectionProgress = (scrollY, top, height, vh) => clamp((scrollY - top) / Math.max(1, height - vh));
/** LM-02 히어로 진행률 */
export const heroProgress = (scrollY, top, height) => clamp((scrollY - top) / Math.max(1, height * 0.62));
/** 뷰포트 안에서 요소가 지나간 비율(패럴랙스용) */
export const viewProgress = (rectTop, rectHeight, vh) => clamp((vh - rectTop) / (vh + rectHeight));

/** LM-02 */
export function heroFrame(p, mobile = false) {
  const support = smooth((p - 0.02) / 0.34);
  return {
    one: { opacity: r3(1 - p * 0.45), y: r3(-p * (mobile ? 8 : 18)), scale: r3(1 - p * (mobile ? 0.12 : 0.2)) },
    two: { y: r3(p * (mobile ? 4 : 10)), scale: r3((mobile ? 0.97 : 0.94) + p * (mobile ? 0.08 : 0.16)) },
    support: { opacity: r3(1 - support), y: r3(-support * 18), interactive: support < 0.95 },
    media: { scale: r3(1 + p * 0.06), y: r3(-p * 24), radius: r3(Math.max(mobile ? 10 : 8, (mobile ? 18 : 26) - p * 16)), shadow: r3(0.08 + p * 0.1) },
    caption: r3(1 - p)
  };
}

/** LM-03: 3문장 교차 + 새싹 성장 */
export function typeFrame(p) {
  const o1 = smooth((p - 0.04) / 0.28), f1 = smooth((p - 0.2) / 0.14);
  const i2 = smooth((p - 0.18) / 0.24), o2 = smooth((p - 0.54) / 0.19);
  const i3 = smooth((p - 0.62) / 0.22), s3 = smooth((p - 0.9) / 0.1);
  return {
    lines: [
      { opacity: r3(1 - f1), y: r3(-24 * o1), scale: r3(1.5 - 0.8 * o1) },
      { opacity: r3(i2 * (1 - o2)), y: r3(40 * (1 - i2) - 24 * o2), scale: r3(0.55 + 0.65 * i2 - 0.35 * o2) },
      { opacity: r3(i3), y: r3(40 * (1 - i3)), scale: r3(0.55 + 0.55 * i3 - 0.05 * s3) }
    ],
    note: r3(smooth((p - 0.76) / 0.17)),
    grow: r3(smooth(p / 0.92)),
    index: p < 0.31 ? 1 : p < 0.68 ? 2 : 3
  };
}

/** LM-06: 7 → 1 */
export function bridgeFrame(p) {
  const a = smooth((p - 0.08) / 0.7);
  return {
    from: { opacity: r3(1 - p * 0.42), scale: r3(1 - p * 0.18), x: r3(-p * 2.5) },
    to: { opacity: r3(0.28 + a * 0.72), scale: r3(0.74 + a * 0.26), x: r3((1 - a) * 3) },
    arrow: { opacity: r3(0.35 + a * 0.65), scale: r3(0.7 + a * 0.3), rotate: r3(-12 + a * 12) },
    arrive: r3(a)
  };
}

const ACTIVE = { panel: 1, title: 1, titleScale: 1, blur: 0, stepY: 0, detail: 1, detailY: 0, visualScale: 1, visualY: 0 };
const HIDDEN = { panel: 0, title: 0, titleScale: 1.12, blur: 12, stepY: 24, detail: 0, detailY: 14, visualScale: 1.06, visualY: 16 };

/** LM-07: n개 프레임 교차. shown = 현재 활성 프레임(전환점 .56) */
export function storyFrame(p, n) {
  const pos = clamp(p) * (n - 1);
  const base = Math.min(n - 1, Math.floor(pos));
  const next = Math.min(n - 1, base + 1);
  const local = pos - base;
  const shown = base === next ? base : (local < 0.56 ? base : next);
  const frames = Array.from({ length: n }, (_, i) => {
    if (base === next) return i === base ? { ...ACTIVE, z: n + 1 } : { ...HIDDEN, z: i + 1 };
    if (i === base) {
      const focus = smooth((local - 0.34) / 0.3), det = smooth((local - 0.28) / 0.2), vis = smooth((local - 0.3) / 0.6);
      return { panel: r3(1 - smooth((local - 0.4) / 0.36)), title: r3(1 - focus), titleScale: r3(1 - 0.05 * focus), blur: r3(10 * focus), stepY: r3(-16 * focus), detail: r3(1 - det), detailY: r3(-8 * det), visualScale: r3(1 + 0.03 * vis), visualY: r3(-8 * vis), z: n + base };
    }
    if (i === next) {
      const ti = smooth((local - 0.4) / 0.36), di = smooth((local - 0.6) / 0.24), vi = smooth((local - 0.34) / 0.5);
      return { panel: r3(smooth((local - 0.34) / 0.4)), title: r3(ti), titleScale: r3(1.12 - 0.12 * ti), blur: r3(12 * (1 - ti)), stepY: r3(24 * (1 - ti)), detail: r3(di), detailY: r3(14 * (1 - di)), visualScale: r3(1.06 - 0.06 * vi), visualY: r3(16 * (1 - vi)), z: n + base + 1 };
    }
    return { ...HIDDEN, z: i + 1 };
  });
  return { shown, frames };
}

/** LM-08: 뷰포트 기준선(.54vh)과 가까울수록 1 */
export const focusValue = (center, vh) => r3(1 - clamp(Math.abs(center - vh * 0.54) / (vh * 0.58)));

/** LM-01: marker 이하로 지나간 마지막 타깃 index, 없으면 -1 */
export const navIndex = (tops, marker) => tops.reduce((acc, t, i) => (t <= marker ? i : acc), -1);

/** LM-09: 히어로 통과 후 ~ 마지막 CTA 전, 단 고정 스테이지(LS-02/06/07)가 화면을 차지하는 동안은 숨김 */
export const stickyVisible = (scrollY, heroBottom, finalTop, vh, inStage = false) => scrollY >= heroBottom && finalTop > vh * 0.78 && !inStage;
/** 고정 스테이지 섹션 [top, bottom] 구간 안에 있는가 */
export const inRanges = (scrollY, ranges) => ranges.some(([t, b]) => scrollY >= t - 1 && scrollY <= b);

export const pad2 = n => String(n).padStart(2, '0');

// ────────────────────────────── DOM 바인딩 ──────────────────────────────
export function bindMotion(win = window) {
  const doc = win.document, root = doc.documentElement;
  const reduce = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  root.classList.toggle('is-reduced', !!reduce);
  root.classList.add('is-motion-ready');
  root.classList.toggle('motion-on', !reduce);
  const $ = s => doc.querySelector(s), $$ = s => [...doc.querySelectorAll(s)];
  const setVars = (el, vars) => { if (!el) return; for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, String(v)); };

  const hero = $('#hero'), heroCopy = $('.lp-hero-copy'), heroMedia = $('.lp-hero-media');
  const lineOne = $('.lp-hero-line.one'), lineTwo = $('.lp-hero-line.two'), fades = $$('.s-hero .lp-fade');
  const type = $('#grow'), typeStage = $('.lp-type-stage'), typeLines = $$('.lp-type-line'), typeIndex = $('#lp-type-index');
  const bridge = $('#bridge'), bridgeStage = $('.lp-bridge-stage');
  const story = $('#story'), storyStage = $('.lp-story-stage'), frames = $$('.lp-story-frame'), dots = $$('.lp-story-dots li'), storyIndex = $('#lp-story-index');
  const statusRows = $$('.lp-status-row');
  const sticky = $('.lp-sticky'), finalSec = $('#start');
  const progress = $('.lp-progress span'), chapter = $('#lp-chapter');
  const links = $$('.lp-local-links a'), linkWrap = $('.lp-local-links');
  const targets = links.map(a => doc.getElementById(a.dataset.target));
  let current = -1, currentNav = -2, ticking = false;

  function updateHero() {
    if (reduce || !hero) return;
    const f = heroFrame(heroProgress(win.scrollY, hero.offsetTop, hero.offsetHeight), win.innerWidth <= 640);
    setVars(lineOne, { '--o': f.one.opacity, '--y': f.one.y + 'px', '--s': f.one.scale });
    setVars(lineTwo, { '--y': f.two.y + 'px', '--s': f.two.scale });
    fades.forEach(el => { setVars(el, { '--o': f.support.opacity, '--y': f.support.y + 'px' }); el.style.pointerEvents = f.support.interactive ? '' : 'none'; });
    setVars(heroMedia, { '--m-scale': f.media.scale, '--m-y': f.media.y + 'px', '--m-radius': f.media.radius + 'px', '--m-shadow': f.media.shadow, '--cap': f.caption });
  }
  function updateType() {
    if (reduce || !type) return;
    const f = typeFrame(sectionProgress(win.scrollY, type.offsetTop, type.offsetHeight, win.innerHeight));
    typeLines.forEach((el, i) => setVars(el, { '--o': f.lines[i].opacity, '--y': f.lines[i].y + 'px', '--s': f.lines[i].scale }));
    setVars(typeStage, { '--grow': f.grow, '--note': f.note, '--type-p': f.grow });
    if (typeIndex) typeIndex.textContent = pad2(f.index);
  }
  function updateBridge() {
    if (reduce || !bridge) return;
    const f = bridgeFrame(sectionProgress(win.scrollY, bridge.offsetTop, bridge.offsetHeight, win.innerHeight));
    setVars(bridgeStage, {
      '--from-o': f.from.opacity, '--from-s': f.from.scale, '--from-x': f.from.x + 'vw',
      '--to-o': f.to.opacity, '--to-s': f.to.scale, '--to-x': f.to.x + 'vw',
      '--arrow-o': f.arrow.opacity, '--arrow-s': f.arrow.scale, '--arrow-r': f.arrow.rotate + 'deg', '--arrive': f.arrive
    });
  }
  function setScene(i) {
    if (i === current) return; current = i;
    frames.forEach((el, k) => { el.classList.toggle('is-active', k === i); el.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    dots.forEach((el, k) => el.classList.toggle('is-active', k === i));
    if (storyIndex) storyIndex.textContent = pad2(i + 1);
    storyStage?.setAttribute('data-index', pad2(i + 1));
  }
  function updateStory() {
    if (!story || !frames.length) return;
    if (reduce) return;
    const p = sectionProgress(win.scrollY, story.offsetTop, story.offsetHeight, win.innerHeight);
    const f = storyFrame(p, frames.length);
    setScene(f.shown);
    setVars(storyStage, { '--story-p': p });
    frames.forEach((el, i) => {
      const v = f.frames[i];
      el.style.zIndex = String(v.z);
      setVars(el, { '--panel': v.panel, '--title': v.title, '--title-s': v.titleScale, '--blur': v.blur + 'px', '--step-y': v.stepY + 'px', '--detail': v.detail, '--detail-y': v.detailY + 'px', '--vis-s': v.visualScale, '--vis-y': v.visualY + 'px' });
    });
  }
  function updateStatus() {
    if (!statusRows.length) return;
    let best = -1, bestF = 0;
    statusRows.forEach((row, i) => {
      const r = row.getBoundingClientRect(), f = reduce ? 1 : focusValue(r.top + r.height / 2, win.innerHeight);
      setVars(row, { '--focus': f });
      if (f > bestF) { bestF = f; best = i; }
    });
    statusRows.forEach((row, i) => row.classList.toggle('is-current', !reduce && i === best && bestF > 0.28));
  }
  function updateWayfinding() {
    const max = Math.max(1, root.scrollHeight - win.innerHeight);
    setVars(progress, { '--page-progress': clamp(win.scrollY / max) });
    const next = navIndex(targets.map(t => (t ? t.offsetTop : Infinity)), win.scrollY + 160);
    if (next === currentNav) return; currentNav = next;
    if (chapter) chapter.textContent = next < 0 ? '00' : pad2(next + 1);
    links.forEach((a, i) => { if (i === next) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    if (next >= 0 && linkWrap && linkWrap.scrollWidth > linkWrap.clientWidth) {
      const a = links[next];
      linkWrap.scrollTo({ left: Math.max(0, a.offsetLeft - (linkWrap.clientWidth - a.offsetWidth) / 2), behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  function updateSticky() {
    if (!sticky || !hero) return;
    const ranges = reduce ? [] : [type, bridge, story].filter(Boolean).map(s => [s.offsetTop - win.innerHeight * 0.5, s.offsetTop + s.offsetHeight - win.innerHeight * 0.5]);
    const vis = stickyVisible(win.scrollY, hero.offsetTop + hero.offsetHeight, finalSec ? finalSec.getBoundingClientRect().top : Infinity, win.innerHeight, inRanges(win.scrollY, ranges));
    sticky.classList.toggle('is-visible', vis);
    sticky.inert = !vis;
  }
  function update() { updateHero(); updateType(); updateBridge(); updateStory(); updateStatus(); updateWayfinding(); updateSticky(); ticking = false; }
  const request = () => { if (!ticking) { ticking = true; win.requestAnimationFrame(update); } };
  win.addEventListener('scroll', request, { passive: true });
  let rt; win.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(request, 120); });

  // LM-04 / LM-05: reveal
  const reveals = $$('.lp-reveal, .lp-card-reveal');
  if (reduce || !('IntersectionObserver' in win)) reveals.forEach(el => el.classList.add('is-visible'));
  else {
    const io = new win.IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }
  if (reduce) { frames.forEach(el => { el.classList.add('is-active'); el.setAttribute('aria-hidden', 'false'); }); }
  else setScene(0);
  update();
  return { update };
}
