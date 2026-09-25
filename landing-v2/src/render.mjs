// SPEC-007 §2: 섹션 type → HTML 문자열 (순수). 방문자 입력값은 여기서 넣지 않고 interact.mjs가 textContent로 채운다.
import { SITE, SECTIONS, SAMPLES, SLOTS, STAMPS, LESSON, QUESTION_TEMPLATES, AVOID_QUESTION, OBSERVATION } from './content.mjs';

export const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = v => esc(v).replace(/\n/g, '<br>');
export function href(key, opts = {}) {
  const v = SITE.links[key];
  if (v === undefined) throw new Error(`Unknown link key: ${key}`);
  return opts.linkPrefix && !/^(https?:|#|\/)/.test(v) ? opts.linkPrefix + v : v;
}
const ext = key => (/^https?:/.test(SITE.links[key]) ? ' target="_blank" rel="noopener"' : '');
const link = (l, cls, o) => `<a class="${cls}" href="${esc(href(l.href, o))}"${ext(l.href)} data-cta="${esc(l.href)}">${esc(l.label)}</a>`;
const hid = s => `${s.anchor}-title`;
const sec = (s, cls, inner) => `<section id="${s.anchor}" class="l2-sec ${cls}" data-spec="${s.id}" aria-labelledby="${hid(s)}">${inner}</section>`;
const kicker = s => `<p class="l2-kicker">${s.no ? `<span class="l2-no">${esc(s.no)}</span>` : ''}${esc(s.kicker)}</p>`;
const h2 = (s, text = s.title) => `<h2 id="${hid(s)}" tabindex="-1">${br(text)}</h2>`;

/** 새싹 부캐 (prototype SVG 계열). --grow 0~1 로 5단계 성장 */
export function sprout(cls = '', label = '') {
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg class="l2-sprout ${cls}" viewBox="0 0 220 240" ${a11y}>
<ellipse class="m-shadow" cx="111" cy="219" rx="65" ry="10"/>
<g class="m-sprout"><path class="m-stem" d="M108 98C111 60 102 47 91 31"/><path class="m-leaf-a" d="M104 64C64 63 60 28 64 20c37 1 51 16 40 44Z"/><path class="m-leaf-b" d="M106 73c2-41 41-52 55-48-1 39-23 54-55 48Z"/><path class="m-vein" d="M110 62c15-14 25-22 38-26"/></g>
<g class="m-body"><path class="m-arm" d="M69 98c-8 8-28 17-32 35-5 24 13 35 34 24"/><path class="m-arm" d="M153 106c14-12 29-10 34 2 5 11-1 26-18 33"/><path class="m-feet" d="M75 187c-5 14-8 25 3 28 13 4 18-13 22-22M128 192c4 14 9 23 20 21 12-3 5-22 0-28"/><path class="m-torso" d="M56 124c0-37 23-50 55-50 32 0 59 21 59 64 0 44-23 63-58 63-35 0-56-24-56-77Z"/><path class="m-shine" d="M65 122c3-29 16-39 34-41"/><ellipse class="m-eye" cx="87" cy="136" rx="5" ry="7"/><ellipse class="m-eye" cx="136" cy="136" rx="5" ry="7"/><ellipse class="m-cheek" cx="78" cy="150" rx="10" ry="5"/><ellipse class="m-cheek" cx="145" cy="150" rx="10" ry="5"/><path class="m-mouth" d="M104 151q8 10 16 0"/><path class="m-gem" d="m114 174 5-6 5 6-5 6Z"/></g>
<g class="m-spark"><path d="m185 70 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z"/><circle cx="44" cy="82" r="3"/></g>
</svg>`;
}
const mark = () => `<svg class="l2-mark" viewBox="0 0 32 35" fill="none" aria-hidden="true"><path d="M4 9 16 30 28 9M16 24V4" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M16 14C7 14 8 4 8 4c7 0 8 5 8 10ZM17 13c0-8 9-9 9-9s0 9-9 9Z" fill="currentColor"/></svg>`;

// 걱정 태그의 흩어진 위치 (결정형: 같은 입력 → 같은 배치)
const scatter = i => ({ x: [-38, 30, -12, 40, -44, 14, -26, 36, 2][i % 9], y: [-34, -40, -8, 6, 22, 34, 44, -22, 52][i % 9], r: [-6, 4, -3, 7, 3, -5, 6, -2, 4][i % 9] });

// 공개 빌드(SPEC-009)에서는 저장소 내부 문서·v1 링크를 넣지 않는다
export const DOC_LINKS = ['brief', 'roadmap', 'spec', 'v1'];
const quizOptions = v => v.options.map((o, i) => `<button type="button" class="l2-option" data-choice="${i}">${esc(o)}</button>`).join('');

export const RENDERERS = {
  topbar: (s, o) => `<header class="l2-top" data-spec="${s.id}">
<a class="l2-skip" href="#main">본문으로 이동</a>
<div class="l2-shell l2-top-row">
<a class="l2-brand" href="#start" aria-label="${esc(SITE.brand)} 맨 위로">${mark()}<span>${esc(SITE.brand)}<i>.</i></span></a>
<div class="l2-top-actions"><button type="button" class="l2-textbtn" data-action="reset">${esc(s.reset)}</button>${link(s.cta, 'l2-btn primary small', o)}</div>
</div></header>`,

  hero: s => sec(s, 'l2-hero', `<div class="l2-shell l2-hero-grid">
<div class="l2-hero-copy">
<p class="l2-eyebrow">${esc(s.eyebrow)}</p>
<h1 id="${hid(s)}"><span>${esc(s.lines[0])}</span><span><mark class="l2-mark-hl">${esc(s.lines[1])}</mark></span></h1>
<p class="l2-lead">${esc(s.lead)}</p>
<form class="l2-idea-form" data-form="idea" novalidate>
<label for="idea-input" class="l2-label">${esc(s.inputLabel)}</label>
<div class="l2-input-row"><input id="idea-input" name="idea" type="text" maxlength="${SITE.limits.idea}" autocomplete="off" placeholder="${esc(s.placeholder)}" aria-describedby="idea-help idea-msg"><button type="submit" class="l2-btn primary">${esc(s.submit)} <span aria-hidden="true">↓</span></button></div>
<p id="idea-msg" class="l2-msg" aria-live="polite" data-empty="${esc(s.empty)}"></p>
<div class="l2-samples" role="group" aria-label="${esc(s.samplesLabel)}"><span>${esc(s.samplesLabel)}</span>${SAMPLES.map(x => `<button type="button" class="l2-chip" data-sample="${esc(x.key)}" aria-pressed="false">${esc(x.label)}</button>`).join('')}</div>
<p id="idea-help" class="l2-privacy">${esc(s.privacy)}</p>
</form>
</div>
<div class="l2-hero-preview" aria-hidden="true">
<div class="l2-preview-card"><div class="l2-preview-head"><span>${esc(SECTIONS.find(x => x.type === 'card').title)}</span>${sprout('is-seed')}</div>
${SLOTS.map((sl, i) => `<div class="l2-preview-line${i === 0 ? ' is-live' : ''}"><span>${esc(sl.label)}</span><b${i === 0 ? ' data-bind="idea-preview"' : ''}></b></div>`).join('')}
</div>
<p class="l2-scroll-hint">${esc(s.scrollHint)} <span aria-hidden="true">↓</span></p>
</div>
</div>`),

  card: (s, o) => `<aside id="${s.anchor}" class="l2-card" data-spec="${s.id}" aria-labelledby="${hid(s)}">
<button type="button" class="l2-tray-toggle" aria-expanded="false" aria-controls="card-panel" data-open="${esc(s.trayOpen)}" data-close="${esc(s.trayClose)}">
<span class="l2-tray-sprout">${sprout('is-growing')}</span><span class="l2-tray-text"><b><span data-bind="filled">0</span>/${SLOTS.length}</b> ${esc(s.progress)}<i class="l2-tray-bar"><i></i></i></span><span class="l2-tray-label">${esc(s.trayOpen)}</span>
</button>
<div id="card-panel" class="l2-card-panel">
<div class="l2-card-head"><h2 id="${hid(s)}">${esc(s.title)}</h2><span class="l2-count"><b data-bind="filled">0</b>/${SLOTS.length}</span></div>
<div class="l2-card-sprout">${sprout('is-growing', '카드와 함께 자라는 새싹')}</div>
<ol class="l2-slots">${SLOTS.map(sl => `<li><button type="button" class="l2-slot" data-slot="${sl.key}" data-goto="${sl.chapter}" data-status="empty"><span class="l2-slot-label">${esc(sl.label)}</span><span class="l2-slot-value" data-value>${esc(sl.hint)}</span><span class="l2-stamp" data-stamp>${esc(STAMPS.empty)}</span></button></li>`).join('')}</ol>
<p class="l2-legend">${esc(s.legend)}</p>
${link(s.cta, 'l2-btn primary wide', o)}
</div>
<p class="l2-sr" aria-live="polite" data-live="card" data-template="${esc(s.announce)}"></p>
</aside>`,

  chapterIdea: s => sec(s, 'l2-ch', `${kicker(s)}${h2(s)}<p class="l2-body">${esc(s.body)}</p>
<div class="l2-work l2-converge">
<div class="l2-worries" aria-hidden="true">${s.worries.map((w, i) => { const p = scatter(i); return `<span style="--x:${p.x};--y:${p.y};--r:${p.r}deg;--i:${i}">${esc(w)}</span>`; }).join('')}</div>
<figure class="l2-sentence"><figcaption>${esc(s.resultLabel)}</figcaption><p class="l2-serif" data-bind="idea"></p></figure>
</div>`),

  chapterLearn: s => sec(s, 'l2-ch', `${kicker(s)}${h2(s)}<p class="l2-body">${esc(s.body)}</p>
<div class="l2-work">
<div class="l2-lesson"><span class="l2-tag">개념</span><p class="l2-lesson-title">${esc(LESSON.title)}</p><p>${esc(LESSON.summary)}</p><small>${esc(LESSON.source)}</small></div>
<div class="l2-quiz" data-quiz><p class="l2-tag">문제 <span data-bind="quiz-no">1</span></p><p class="l2-q" data-bind="quiz-q">${esc(LESSON.variants[0].question)}</p><div class="l2-options" data-options>${quizOptions(LESSON.variants[0])}</div><p class="l2-feedback" aria-live="polite" data-bind="quiz-feedback"></p></div>
</div>`),

  chapterApply: s => sec(s, 'l2-ch', `${kicker(s)}${h2(s)}<p class="l2-body">${esc(s.body)}</p>
<div class="l2-work l2-apply">
<label for="customer-input" class="l2-label">${esc(s.inputLabel)}</label>
<input id="customer-input" type="text" maxlength="${SITE.limits.customer}" autocomplete="off" aria-describedby="customer-hint">
<p id="customer-hint" class="l2-hint">${esc(s.inputHint)}</p>
<div class="l2-qsheet"><p class="l2-qsheet-head">${esc(s.listLabel)} · <span class="l2-serif" data-bind="customer"></span></p>
<ol class="l2-questions" aria-live="polite">${QUESTION_TEMPLATES.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
<p class="l2-avoid"><span>${esc(s.avoidLabel)}</span><s>${esc(AVOID_QUESTION)}</s></p></div>
<div class="l2-row"><button type="button" class="l2-btn primary" data-action="save-questions">${esc(s.save)}</button><span class="l2-msg" aria-live="polite" data-bind="apply-msg" data-saved="${esc(s.saved)}"></span></div>
</div>`),

  chapterObserve: s => sec(s, 'l2-ch', `${kicker(s)}${h2(s)}<p class="l2-body">${esc(s.body)}</p>
<div class="l2-work l2-obs">
<p><span class="l2-stamp is-example">${esc(OBSERVATION.label)}</span> ${esc(OBSERVATION.setup)}</p>
<ul class="l2-quotes">${OBSERVATION.quotes.map((q, i) => `<li style="--i:${i}"><span class="l2-who">응답 ${i + 1}</span>${esc(q)}</li>`).join('')}</ul>
<p class="l2-ask">${esc(OBSERVATION.ask)}</p>
<div class="l2-choice-row" role="group" aria-label="${esc(OBSERVATION.ask)}">${OBSERVATION.choices.map(c => `<button type="button" class="l2-choice" data-observe="${c.key}" aria-pressed="false">${esc(c.label)}</button>`).join('')}</div>
<p class="l2-note" aria-live="polite" data-bind="observe-note"></p>
</div>`),

  chapterDecide: s => sec(s, 'l2-ch', `${kicker(s)}${h2(s)}<p class="l2-body">${esc(s.body)}</p>
<div class="l2-work"><p class="l2-waiting" data-bind="decide-waiting">${esc(s.waiting)}</p><div class="l2-decisions" role="group" aria-label="다음 방향" data-decisions></div></div>`),

  path: s => sec(s, 'l2-path-sec', `${kicker(s)}${h2(s)}<p class="l2-body">${esc(s.body)}</p>
<ol class="l2-path" data-path data-current="${esc(s.currentLabel)}" data-next="${esc(s.nextLabel)}">${s.areas.map((a, i) => `<li class="l2-node" data-key="${a.key}" style="--c:var(--c-${a.key})"><span class="l2-node-dot" aria-hidden="true">${esc(a.icon)}</span><span class="l2-node-name">${esc(a.name)}</span><span class="l2-node-q">${esc(a.q)}</span><em class="l2-node-badge" data-badge>${i === 0 ? esc(s.currentLabel) : i === 1 ? esc(s.nextLabel) : ''}</em></li>`).join('')}</ol>
<p class="l2-rule" aria-live="polite" data-bind="path-rule" data-default="${esc(s.ruleDefault)}" data-refuted="${esc(s.ruleRefuted)}">${esc(s.ruleDefault)}</p>
<p class="l2-hint">${esc(s.ruleNote)}</p>`),

  grow: s => sec(s, 'l2-wide l2-grow', `<div class="l2-shell">${kicker(s)}${h2(s)}
<div class="l2-grow-grid">${s.cols.map((c, i) => `<article class="l2-grow-col g${i + 1} l2-in"><span class="l2-tag">${esc(c.tag)}</span><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p><ol class="l2-steps">${c.stages.map(x => `<li>${esc(x)}</li>`).join('')}</ol></article>`).join('')}</div>
<p class="l2-hint">${esc(s.note)}</p></div>`),

  honest: s => sec(s, 'l2-wide l2-honest', `<div class="l2-shell l2-honest-grid">
<div>${kicker(s)}${h2(s)}<ol class="l2-status">${s.rows.map(r => `<li data-status="${esc(r.status)}"><span class="l2-mono">${esc(r.stage)}</span><div><strong>${esc(r.name)}</strong><p>${esc(r.d)}</p></div><em>${esc(r.label)}</em></li>`).join('')}</ol></div>
<div><h3 class="l2-faq-title">${esc(s.faqTitle)}</h3><div class="l2-faq">${s.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div>
</div>`),

  finish: (s, o) => sec(s, 'l2-wide l2-finish', `<div class="l2-shell"><div class="l2-finish-card">
${sprout('is-growing', '완성된 카드의 새싹')}
<div>${kicker(s)}<h2 id="${hid(s)}" tabindex="-1" data-bind="finish-title" data-done="${esc(s.titleDone)}" data-partial="${esc(s.titlePartial)}">${esc(s.titlePartial.replace('{n}', '0'))}</h2>
<blockquote class="l2-serif" data-bind="idea"></blockquote>
<p class="l2-body">${esc(s.body)}</p>
<div class="l2-row"><a class="l2-btn primary" href="${esc(href('prototype', o))}"${ext('prototype')} data-cta="prototype">${esc(s.startApp)} <span aria-hidden="true">→</span></a><button type="button" class="l2-btn ghost" data-action="reset">${esc(s.again)}</button></div></div>
</div></div>`),

  footer: (s, o) => `<footer class="l2-footer" data-spec="${s.id}"><div class="l2-shell">
<a class="l2-brand" href="#start">${mark()}<span>${esc(SITE.brand)}<i>.</i></span></a>
<p>${esc(s.notice)}</p>
<ul>${s.links.filter(l => !(o.public && DOC_LINKS.includes(l.href))).map(l => `<li><a href="${esc(href(l.href, o))}">${esc(l.label)}</a></li>`).join('')}</ul>
<small>${esc(s.copy)}</small></div></footer>`
};

const BODY = ['chapterIdea', 'chapterLearn', 'chapterApply', 'chapterObserve', 'chapterDecide', 'path'];
export function renderPage(opts = {}) {
  const one = s => { const r = RENDERERS[s.type]; if (!r) throw new Error(`No renderer: ${s.type} (${s.id})`); return r(s, opts); };
  const of = t => SECTIONS.filter(s => t.includes(s.type)).map(one).join('\n');
  return `${of(['topbar'])}
<main id="main">
${of(['hero'])}
<div class="l2-shell l2-layout">
<div class="l2-chapters">
${of(BODY)}
</div>
${of(['card'])}
</div>
${of(['grow', 'honest', 'finish'])}
</main>
${of(['footer'])}`;
}
