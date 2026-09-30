// SPEC-017 §2·§3: 섹션 type → HTML 문자열 (순수). 방문자 입력값은 여기서 넣지 않고 interact.mjs가 textContent로 채운다.
import { SITE, SECTIONS, SAMPLES, SLOTS, STAMPS, LESSON, QUESTION_TEMPLATES, AVOID_QUESTION, OBSERVATION, NEXT, NEXT_COPY, CTA_COPY, PAIN, HEADLINES, GETS } from './content.mjs';

export const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = v => esc(v).replace(/\n/g, '<br>');
export function href(key, opts = {}) {
  const v = SITE.links[key];
  if (v === undefined) throw new Error(`Unknown link key: ${key}`);
  return opts.linkPrefix && !/^(https?:|#|\/)/.test(v) ? opts.linkPrefix + v : v;
}
const hid = s => `${s.anchor}-title`;
const h2 = s => `<h2 id="${hid(s)}" tabindex="-1">${br(s.title)}</h2>`;

/** 새싹 부캐 (prototype 마스코트). --grow 0~1 로 자람 (L3M-07) */
export function sprout(cls = '', label = '') {
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg class="l3-sprout ${cls}" viewBox="0 0 220 240" ${a11y}>
<g class="m-sprout"><path class="m-stem" d="M108 98C111 60 102 47 91 31"/><path class="m-leaf-a" d="M104 64C64 63 60 28 64 20c37 1 51 16 40 44Z"/><path class="m-leaf-b" d="M106 73c2-41 41-52 55-48-1 39-23 54-55 48Z"/><path class="m-vein" d="M110 62c15-14 25-22 38-26"/></g>
<g class="m-body"><path class="m-arm" d="M69 98c-8 8-28 17-32 35-5 24 13 35 34 24"/><path class="m-arm" d="M153 106c14-12 29-10 34 2 5 11-1 26-18 33"/><path class="m-feet" d="M75 187c-5 14-8 25 3 28 13 4 18-13 22-22M128 192c4 14 9 23 20 21 12-3 5-22 0-28"/><path class="m-torso" d="M56 124c0-37 23-50 55-50 32 0 59 21 59 64 0 44-23 63-58 63-35 0-56-24-56-77Z"/><path class="m-shine" d="M65 122c3-29 16-39 34-41"/><ellipse class="m-eye" cx="87" cy="136" rx="5" ry="7"/><ellipse class="m-eye" cx="136" cy="136" rx="5" ry="7"/><ellipse class="m-cheek" cx="78" cy="150" rx="10" ry="5"/><ellipse class="m-cheek" cx="145" cy="150" rx="10" ry="5"/><path class="m-mouth" d="M104 151q8 10 16 0"/><path class="m-gem" d="m114 174 5-6 5 6-5 6Z"/></g>
<g class="m-spark"><path d="m185 70 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z"/><circle cx="44" cy="82" r="3"/></g>
</svg>`;
}
const mark = () => `<svg class="l3-mark" viewBox="0 0 32 35" fill="none" aria-hidden="true"><path d="M4 9 16 30 28 9M16 24V4" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M16 14C7 14 8 4 8 4c7 0 8 5 8 10ZM17 13c0-8 9-9 9-9s0 9-9 9Z" fill="currentColor"/></svg>`;

// 지층 경계선: 층마다 다른 결 (결정형)
const WAVES = {
  learn: 'M0 40V22C120 8 260 30 420 18S700 2 860 16 1180 34 1320 14L1440 10V40Z',
  ask: 'M0 40V16C160 30 300 6 480 20S780 36 960 18 1260 4 1440 22V40Z',
  observe: 'M0 40V24C140 10 340 34 520 16S820 0 1000 20 1300 34 1440 12V40Z',
  decide: 'M0 40V14C200 26 360 34 560 18S900 4 1080 22 1320 30 1440 18V40Z',
  roots: 'M0 40V20C180 6 380 28 600 14S960 32 1160 12 1360 20 1440 16V40Z'
};
const edge = key => `<svg class="l3-edge" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true"><path d="${WAVES[key]}"/></svg>`;
// 지표면의 풀 (결정형 위치)
const grass = () => `<svg class="l3-horizon" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path class="h-soil" d="M0 60V30C200 22 420 34 700 28S1180 20 1440 30V60Z"/><path class="h-grass" d="${Array.from({ length: 48 }, (_, i) => { const x = 12 + i * 30 + (i * 7) % 11, h = 8 + (i * 13) % 12, y = 30 - ((i * 5) % 4); return `M${x} ${y}q${(i % 2 ? 3 : -3)} -${h / 2} ${(i % 3) - 1} -${h}`; }).join('')}"/></svg>`;

// 로드맵 단계 그림: 씨앗 → 새싹 → 자란 나무 (장식)
const PLANTS = {
  seed: '<path class="p-ground" d="M6 46h52"/><ellipse class="p-seed" cx="32" cy="52" rx="7" ry="5"/><path class="p-leaf" d="M32 46c0-6 3-9 7-10-1 5-3 8-7 10Z"/>',
  sprout: '<path class="p-ground" d="M6 46h52"/><path class="p-stem" d="M32 46V26"/><path class="p-leaf" d="M32 34c-9 0-13-6-13-12 8 0 13 5 13 12Z"/><path class="p-leaf" d="M32 29c0-8 6-12 13-12 0 7-5 12-13 12Z"/>',
  tree: '<path class="p-ground" d="M6 46h52"/><path class="p-stem" d="M32 46V16"/><path class="p-leaf" d="M32 36c-11 0-16-7-16-14 10 0 16 6 16 14Z"/><path class="p-leaf" d="M32 30c0-9 7-14 16-14 0 8-6 14-16 14Z"/><path class="p-leaf" d="M32 20c-6-5-6-12 0-17 6 5 6 12 0 17Z"/>'
};
const plantIcon = k => `<svg class="l3-plant" viewBox="0 0 64 60" aria-hidden="true">${PLANTS[k] || PLANTS.seed}</svg>`;

// 사용자 화면에는 저장소 내부 문서(명세·기획서) 링크를 두지 않는다
export const DOC_LINKS = [];
const quizOptions = v => v.options.map((o, i) => `<button type="button" class="l3-option" data-choice="${i}">${esc(o)}</button>`).join('');

/** 층의 왼쪽 열: 깊이·지층·실제 뜻 + 뿌리 끝에 적힌 기록 (SPEC-017 §3 제약: 뜻 항상 병기) */
function strata(s, slotKey) {
  const sl = SLOTS.find(x => x.key === slotKey);
  return `<div class="l3-strata">
<p class="l3-depth"><span class="l3-mono">${esc(s.depth)}</span><span class="l3-stratum">${esc(s.stratum)}</span></p>
<p class="l3-meaning">${esc(s.meaning)}</p>
${sl ? `<figure class="l3-note" data-slot="${sl.key}" data-status="example"><figcaption>${esc(sl.label)}</figcaption><p class="l3-pen" data-value>${esc(sl.example)}</p><span class="l3-stamp" data-stamp>${esc(STAMPS.example)}</span></figure>` : ''}
</div>`;
}
const nextPanel = (key, opts = {}) => {
  const n = NEXT.find(n => n.layer === key);
  return `<div class="l3-next" data-next="${key}" hidden><svg class="l3-next-root" viewBox="0 0 120 28" aria-hidden="true"><path pathLength="1" d="M0 0C20 22 75 2 120 25"/></svg><button type="button" class="l3-btn" data-goto="${n.to}">${esc(n.label.slice(0,-1))}<span aria-hidden="true">↓</span></button>${key === 'roots' ? '' : `<a class="l3-app-link" data-cta="prototype" href="${esc(href('prototype', opts))}">${esc(NEXT_COPY.app)}</a>`}</div>`;
};
const painChoices = () => `<div class="l3-pain"><p class="l3-panel-tag">${esc(PAIN.title)}</p><p class="l3-hint">${esc(PAIN.hint)}</p><div role="group" aria-label="${esc(PAIN.title)}">${PAIN.options.map(p=>`<button type="button" class="l3-chip" data-pain="${p.key}" aria-pressed="false">${esc(p.label)}</button>`).join('')}</div></div>`;
const layer = (s, key, slotKey, inner) => `<section id="${s.anchor}" class="l3-layer l3-${key}" data-spec="${s.id}" data-chapter="${slotKey || ''}" aria-labelledby="${hid(s)}">
${edge(s.anchor)}
<div class="l3-layer-grid">${strata(s, slotKey)}
<div class="l3-story">${s.anchor === 'learn' ? painChoices() : ''}${h2(s)}<p class="l3-body l3-rise"${s.anchor === 'learn' ? ' data-bind="pain-line" aria-live="polite"' : ''}>${esc(s.body)}</p>${s.why ? `<p class="l3-why">${esc(s.why)}</p>` : ''}${inner}${nextPanel(s.anchor)}</div>
</div></section>`;

export const RENDERERS = {
  topbar: (s, o) => `<header class="l3-top" data-spec="${s.id}">
<a class="l3-skip" href="#main">본문으로 이동</a>
<div class="l3-shell l3-top-row">
<a class="l3-brand" href="#surface" aria-label="${esc(SITE.brand)} 맨 위로">${mark()}<span>${esc(SITE.brand)}</span></a>
<div class="l3-top-actions"><button type="button" class="l3-textbtn" data-action="reset">${esc(s.reset)}</button><a class="l3-btn l3-app-cta" href="${esc(href(s.cta.href, o))}" data-cta="prototype">${mark()}<span>${esc(s.cta.label)}</span><span class="l3-progress" aria-label="${esc(CTA_COPY.progress.replace('{n}',0))}">${Array.from({length:5},()=>'<span aria-hidden="true">○</span>').join('')}</span><svg class="l3-cta-spark m-spark" viewBox="0 0 30 30" aria-hidden="true"><path d="m15 1 3 11 11 3-11 3-3 11-3-11-11-3 11-3Z"/></svg></a><button type="button" class="l3-cta-bubble" data-cta-bubble aria-live="polite" hidden></button></div>
</div></header>`,

  surface: (s, o) => `<section id="${s.anchor}" class="l3-surface" data-spec="${s.id}" aria-labelledby="${hid(s)}">
<div class="l3-shell l3-surface-grid">
<div class="l3-surface-copy">
<p class="l3-eyebrow"><span>${esc(s.eyebrow)}</span> <span class="l3-badge">${esc(s.badge)}</span></p>
<h1 id="${hid(s)}" data-headline="${esc(SITE.headline)}"><span data-bind="h1-0">${esc(HEADLINES[SITE.headline].lines[0])}</span><span class="l3-h1-root" data-bind="h1-1">${esc(HEADLINES[SITE.headline].lines[1])}</span></h1>
<p class="l3-lead" data-bind="lead">${esc(HEADLINES[SITE.headline].lead)}</p>
<ol class="l3-gets" aria-label="${esc(s.getsLabel)}">${GETS.map(g => `<li style="--dot:var(--c-dot-${g.layer})"><strong>${esc(g.t)}</strong><span>${esc(g.d)}</span></li>`).join('')}</ol>
<div class="l3-samples" role="group" aria-label="${esc(s.samplesLabel)}"><span>${esc(s.samplesLabel)}</span>${SAMPLES.map(x => `<button type="button" class="l3-chip" data-sample="${esc(x.key)}" aria-pressed="false">${esc(x.label)}</button>`).join('')}</div>
<p id="idea-help" class="l3-privacy">${esc(s.privacy)}</p>
<a class="l3-app-link l3-hero-app" data-cta="prototype" data-placement="hero" href="${esc(href('prototype',o))}">${esc(s.appLink)}</a>
<a class="l3-down" href="#learn">${esc(s.down)} <span aria-hidden="true">↓</span></a>
</div>
<div class="l3-scene">
<form class="l3-tag" data-form="idea" novalidate>
<label for="idea-input" class="l3-tag-label">${esc(s.tagLabel)}</label>
<div class="l3-tag-line"><input id="idea-input" name="idea" type="text" maxlength="${SITE.limits.idea}" autocomplete="off" placeholder="${esc(s.placeholder)}" aria-describedby="idea-help idea-msg"><span class="l3-typing" aria-hidden="true" data-typing="${esc(JSON.stringify(s.typing))}"></span></div>
<div class="l3-tag-foot"><p id="idea-msg" class="l3-msg" aria-live="polite" data-empty="${esc(s.empty)}"></p><button type="submit" class="l3-btn">${esc(s.submit)} <span aria-hidden="true">↓</span></button></div>
</form>
${nextPanel(s.anchor)}
<div class="l3-stake" aria-hidden="true"></div>
${sprout('l3-surface-sprout', '이름표 옆에서 자라는 새싹')}
</div>
</div>
</section>`,

  gauge: s => `<div id="${s.anchor}" class="l3-rail" data-spec="${s.id}" aria-hidden="true">
<svg class="l3-root" preserveAspectRatio="none"><g data-root-hairs></g><path class="l3-root-edge" data-root-main-edge d=""/><path class="l3-root-main" data-root-main pathLength="1" d=""/><path class="l3-root-stub" data-root-stub d=""/><g data-root-sides></g></svg>
<div class="l3-ticks" data-ticks></div>
<div class="l3-tip" data-tip><div class="l3-tip-box"><span class="l3-mono" data-tip-depth>0${esc(s.unit)}</span><span data-tip-name>${esc(s.ground)}</span></div></div>
</div>
<p class="l3-legend"><span class="l3-legend-mine">${esc(s.legendMine)}</span><span class="l3-legend-example">${esc(s.legendExample)}</span></p>`,

  layerLearn: s => layer(s, 'learn', 'learn', `
<p class="l3-concept l3-rise">${esc(LESSON.title)}</p>
<p class="l3-summary l3-rise">${esc(LESSON.summary)} <small>${esc(LESSON.source)}</small></p>
<div class="l3-panel l3-quiz" data-quiz><p class="l3-panel-tag">확인 문제 <span data-bind="quiz-no">1</span></p><p class="l3-q" data-bind="quiz-q">${esc(LESSON.variants[0].question)}</p><div class="l3-options" data-options>${quizOptions(LESSON.variants[0])}</div><p class="l3-feedback" aria-live="polite" data-bind="quiz-feedback"></p></div>`),

  layerAsk: s => layer(s, 'ask', 'ask', `
<p class="l3-customer l3-rise"><span class="l3-pen" data-bind="customer"></span><span class="l3-customer-suffix">에게 물어볼게요</span></p>
<div class="l3-panel l3-asksheet">
<label for="customer-input" class="l3-panel-tag">${esc(s.inputLabel)}</label>
<input id="customer-input" type="text" maxlength="${SITE.limits.customer}" autocomplete="off" aria-describedby="customer-hint">
<p id="customer-hint" class="l3-hint">${esc(s.inputHint)}</p>
<p class="l3-panel-tag">${esc(s.listLabel)}</p>
<ol class="l3-questions">${QUESTION_TEMPLATES.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
<p class="l3-avoid"><span>${esc(s.avoidLabel)}</span><s>${esc(AVOID_QUESTION)}</s></p>
<div class="l3-row"><button type="button" class="l3-btn" data-action="save-questions" aria-pressed="false">${esc(s.save)}</button><span class="l3-msg" aria-live="polite" data-bind="ask-msg" data-saved="${esc(s.saved)}"></span></div>
</div>`),

  layerObserve: s => layer(s, 'observe', 'observe', `
<p class="l3-setup l3-rise"><span class="l3-stamp is-example">${esc(OBSERVATION.label)}</span> ${esc(OBSERVATION.setup)}</p>
<ul class="l3-quotes">${OBSERVATION.quotesBySample[SAMPLES[0].key].map((q, i) => `<li class="l3-rise" style="--i:${i}"><span class="l3-who">응답 ${i + 1}</span><span data-quote="${i}">${esc(q)}</span></li>`).join('')}</ul>
<div class="l3-panel l3-observe-panel"><p class="l3-q">${esc(OBSERVATION.ask)}</p>
<div class="l3-choice-row" role="group" aria-label="${esc(OBSERVATION.ask)}">${OBSERVATION.choices.map(c => `<button type="button" class="l3-choice" data-observe="${c.key}" aria-pressed="false">${esc(c.label)}</button>`).join('')}</div>
<p class="l3-note-msg" aria-live="polite" data-bind="observe-note" data-turn="${esc(s.turnNote)}"></p></div>`),

  layerDecide: s => layer(s, 'decide', 'decide', `
<div class="l3-panel"><p class="l3-waiting" data-bind="decide-waiting">${esc(s.waiting)}</p><div class="l3-decisions" role="group" aria-label="다음 방향" data-decisions></div></div>`),

  rootMap: s => `<section id="${s.anchor}" class="l3-layer l3-roots" data-spec="${s.id}" aria-labelledby="${hid(s)}">
${edge(s.anchor)}
<div class="l3-layer-grid">${strata(s, null)}
<div class="l3-story">${h2(s)}<p class="l3-body l3-rise">${esc(s.body)}</p></div>
</div>
<div class="l3-shell l3-map">
<svg class="l3-map-lines" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">${s.areas.map((a, i) => {
    const x = 71 + i * 143, c1 = 500 + (x - 500) * 0.15, bend = (i % 2 ? 18 : -14);
    return `<path data-branch="${a.key}" d="M500 0C${c1} ${70 + bend} ${x + bend} ${120} ${x} 214"/>`;
  }).join('')}<circle cx="500" cy="0" r="7"/></svg>
<ol class="l3-areas" data-path data-current="${esc(s.nowLabel)}" data-next="${esc(s.nextLabel)}">${s.areas.map((a, i) => `<li class="l3-area" data-key="${a.key}" style="--c:var(--c-${a.key})"><span class="l3-area-dot" aria-hidden="true">${esc(a.icon)}</span><span class="l3-area-name">${esc(a.name)}</span><span class="l3-area-q">${esc(a.q)}</span><em class="l3-area-badge" data-badge>${i === 0 ? esc(s.nowLabel) : i === 1 ? esc(s.nextLabel) : ''}</em></li>`).join('')}</ol>
<p class="l3-rule" aria-live="polite" data-bind="path-rule" data-default="${esc(s.ruleDefault)}" data-refuted="${esc(s.ruleRefuted)}">${esc(s.ruleDefault)}</p>
<p class="l3-hint">${esc(s.ruleNote)}</p>
${nextPanel(s.anchor)}
</div></section>`,

  aboveBelow: s => `<section id="${s.anchor}" class="l3-ab" data-spec="${s.id}" aria-labelledby="${hid(s)}">
<div class="l3-ab-above"><div class="l3-shell l3-ab-grid">
<svg class="l3-ab-stem" viewBox="0 0 200 260" aria-hidden="true"><path class="s-stem" d="M100 260C100 200 96 150 104 92"/><path class="s-leaf" d="M102 170c-40-4-62-30-60-56 34 0 58 20 60 56Z"/><path class="s-leaf" d="M103 128c30-6 52-30 50-58-32 4-50 26-50 58Z"/><path class="s-leaf" d="M104 92c-18-20-16-46 0-64 16 18 18 44 0 64Z"/></svg>
<div><h2 id="${hid(s)}" tabindex="-1">${esc(s.title)}</h2>
<p class="l3-ab-tag">${esc(s.above.tag)}</p><h3>${esc(s.above.t)}</h3><p class="l3-body">${esc(s.above.d)}</p>
<ol class="l3-leaves">${s.above.stages.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>
</div></div>
<div class="l3-ab-below"><div class="l3-shell l3-ab-grid">
<svg class="l3-ab-roots" viewBox="0 0 200 260" aria-hidden="true"><path d="M100 0C100 60 92 110 98 170S90 230 94 258"/><path d="M99 40c-20 14-46 18-70 44"/><path d="M100 70c24 10 44 30 58 58"/><path d="M98 120c-26 16-36 40-50 70"/><path d="M99 150c20 12 34 34 42 62"/><path d="M96 200c-14 10-22 26-28 44"/></svg>
<div><p class="l3-ab-tag">${esc(s.below.tag)}</p><h3>${esc(s.below.t)}</h3><p class="l3-body">${esc(s.below.d)}</p>
<ol class="l3-rootlets">${s.below.stages.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
<p class="l3-hint">${esc(s.note)}</p></div>
</div></div>
</section>`,

  honest: s => `<section id="${s.anchor}" class="l3-honest" data-spec="${s.id}" aria-labelledby="${hid(s)}"><div class="l3-shell">
<div class="l3-honest-head">${h2(s)}<p class="l3-body">${esc(s.lead)}</p></div>
<ol class="l3-journey">${s.rows.map(r => `<li data-status="${esc(r.status)}">
<div class="l3-journey-mark">${plantIcon(r.plant)}<span class="l3-journey-when">${esc(r.when)}</span></div>
<div class="l3-journey-head"><h3>${esc(r.name)}</h3><em>${esc(r.label)}</em></div>
<p class="l3-journey-t">${esc(r.t)}</p>
<ul>${r.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
<p class="l3-journey-note">${esc(r.note)}</p></li>`).join('')}</ol>
<div class="l3-faq-wrap"><h3 class="l3-faq-title">${esc(s.faqTitle)}</h3><div class="l3-faq">${s.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div>
</div></section>`,

  harvest: (s, o) => `<section id="${s.anchor}" class="l3-harvest" data-spec="${s.id}" aria-labelledby="${hid(s)}"><div class="l3-shell l3-harvest-grid">
<div class="l3-harvest-scene">${sprout('l3-harvest-sprout', '뿌리내린 만큼 자란 새싹')}<div class="l3-mini-tag"><span class="l3-tag-label">이름표</span><p class="l3-pen" data-bind="idea"></p></div><div class="l3-stake small" aria-hidden="true"></div></div>
<div><p class="l3-eyebrow">${esc(s.eyebrow)}</p>
<h2 id="${hid(s)}" tabindex="-1" data-bind="harvest-title" data-done="${esc(s.titleDone)}" data-partial="${esc(s.titlePartial)}" data-none="${esc(s.titleNone)}">${esc(s.titleNone)}</h2>
<p class="l3-body">${esc(s.body)}</p>
<div class="l3-row"><a class="l3-btn big" href="${esc(href('prototype', o))}" data-cta="prototype">${esc(s.cta)} <span aria-hidden="true">→</span></a><button type="button" class="l3-btn ghost" data-action="reset">${esc(s.again)}</button></div></div>
</div></section>`,

  footer: (s, o) => `<footer class="l3-footer" data-spec="${s.id}"><div class="l3-shell">
<a class="l3-brand" href="#surface">${mark()}<span>${esc(SITE.brand)}</span></a>
<p>${esc(s.notice)}</p>
<ul>${s.links.filter(l => !(o.public && DOC_LINKS.includes(l.href))).map(l => `<li><a data-cta="prototype" href="${esc(href(l.href, o))}">${esc(l.label)}</a></li>`).join('')}</ul>
<small>${esc(s.copy)}</small></div></footer>`
};

const SOIL = ['gauge', 'layerLearn', 'layerAsk', 'layerObserve', 'layerDecide', 'rootMap'];
export function renderPage(opts = {}) {
  const one = s => { const r = RENDERERS[s.type]; if (!r) throw new Error(`No renderer: ${s.type} (${s.id})`); return r(s, opts); };
  const of = t => SECTIONS.filter(s => t.includes(s.type)).map(one).join('\n');
  return `${of(['topbar'])}
<main id="main">
<p class="l3-sr-only" data-next-live aria-live="polite"></p>
${of(['surface'])}
<div class="l3-soil" data-soil>
${grass()}
${of(SOIL)}
</div>
${of(['aboveBelow', 'honest', 'harvest'])}
</main>
${of(['footer'])}`;
}
