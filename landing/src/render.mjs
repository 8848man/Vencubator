// SPEC-006 §2: 섹션 type → HTML 문자열. 순수 함수, DOM 접근 없음.
// 카피는 content.mjs 데이터에서만 읽는다. (접근성 라벨 등 구조 문자열만 예외)
import { SITE, SECTIONS } from './content.mjs';

export const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = (v = '') => esc(v).replace(/\n/g, '<br>');

/** CTA/링크 키를 SITE.links 값으로. 키가 없으면 예외(AC-LP05) */
export function href(key, opts = {}) {
  const v = SITE.links[key];
  if (v === undefined) throw new Error(`Unknown link key: ${key}`);
  if (opts.linkPrefix && !/^(https?:|#|\/)/.test(v)) return opts.linkPrefix + v;
  return v;
}
const ext = key => /^https?:/.test(SITE.links[key]) ? ' rel="noopener"' : '';
const headingId = s => `${s.anchor}-title`;
const attrs = (s, cls = '') => `id="${s.anchor}" class="lp-section s-${s.type} ${cls}" data-spec="${s.id}" aria-labelledby="${headingId(s)}"`;
const eyebrow = t => t ? `<p class="lp-eyebrow">${esc(t)}</p>` : '';
const btn = (cta, cls, o) => `<a class="lp-btn ${cls}" href="${esc(href(cta.href, o))}"${ext(cta.href)} data-cta="${esc(cta.href)}">${esc(cta.label)} <span aria-hidden="true">${cls.includes('primary') ? '↗' : '↓'}</span></a>`;

/** 프로토타입의 새싹 부캐를 그룹 단위로 나눠 --grow 로 자랄 수 있게 한 SVG */
export function sprout(cls = '', label = '작은 새싹 창업 부캐') {
  return `<svg class="lp-sprout ${cls}" viewBox="0 0 220 240" role="img" aria-label="${esc(label)}">
<ellipse class="m-shadow" cx="111" cy="219" rx="65" ry="10"/>
<g class="m-sprout"><path class="m-stem" d="M108 98C111 60 102 47 91 31"/><path class="m-leaf-a" d="M104 64C64 63 60 28 64 20c37 1 51 16 40 44Z"/><path class="m-leaf-b" d="M106 73c2-41 41-52 55-48-1 39-23 54-55 48Z"/><path class="m-vein" d="M110 62c15-14 25-22 38-26"/></g>
<g class="m-body"><path class="m-arm" d="M69 98c-8 8-28 17-32 35-5 24 13 35 34 24"/><path class="m-arm" d="M153 106c14-12 29-10 34 2 5 11-1 26-18 33"/><path class="m-feet" d="M75 187c-5 14-8 25 3 28 13 4 18-13 22-22M128 192c4 14 9 23 20 21 12-3 5-22 0-28"/><path class="m-torso" d="M56 124c0-37 23-50 55-50 32 0 59 21 59 64 0 44-23 63-58 63-35 0-56-24-56-77Z"/><path class="m-shine" d="M65 122c3-29 16-39 34-41"/><ellipse class="m-eye" cx="87" cy="136" rx="5" ry="7"/><ellipse class="m-eye" cx="136" cy="136" rx="5" ry="7"/><ellipse class="m-cheek" cx="78" cy="150" rx="10" ry="5"/><ellipse class="m-cheek" cx="145" cy="150" rx="10" ry="5"/><path class="m-mouth" d="M104 151q8 10 16 0"/><path class="m-gem" d="m114 174 5-6 5 6-5 6Z"/></g>
<g class="m-spark"><path d="m185 70 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z"/><circle cx="44" cy="82" r="3"/></g>
</svg>`;
}

const brandMark = () => `<svg class="lp-brandmark" viewBox="0 0 32 35" fill="none" aria-hidden="true"><path d="M4 9 16 30 28 9M16 24V4" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M16 14C7 14 8 4 8 4c7 0 8 5 8 10ZM17 13c0-8 9-9 9-9s0 9-9 9Z" fill="currentColor"/></svg>`;

// 공개 빌드(SPEC-009)에서는 저장소 내부 문서 링크를 넣지 않는다
export const DOC_LINKS = ['brief', 'roadmap', 'spec'];
const navItems = () => SECTIONS.filter(s => s.nav);

export const RENDERERS = {
  nav: (s, o) => `<header class="lp-nav" data-spec="${s.id}">
<a class="lp-skip" href="#main">본문으로 이동</a>
<div class="lp-shell lp-nav-row">
<a class="lp-brand" href="#top" aria-label="${esc(SITE.brand)} 처음으로">${brandMark()}<span>${esc(SITE.brand)}<i>.</i></span></a>
<nav class="lp-local" aria-label="페이지 목차"><span class="lp-chapter" aria-hidden="true"><b id="lp-chapter">00</b> / ${String(navItems().length).padStart(2, '0')}</span><div class="lp-local-links">${navItems().map(n => `<a href="#${n.anchor}" data-target="${n.anchor}">${esc(n.navLabel)}</a>`).join('')}</div></nav>
${btn(s.headerCta, 'primary small', o)}
</div>
<div class="lp-progress" aria-hidden="true"><span></span></div>
</header>`,

  hero: (s, o) => `<section ${attrs(s)}>
<div class="lp-shell lp-hero-copy">
${eyebrow(s.eyebrow)}
<h1 id="${headingId(s)}" class="lp-hero-title"><span class="lp-hero-line one">${esc(s.lines[0])}</span><span class="lp-hero-line two">${esc(s.lines[1])}</span></h1>
<p class="lp-hero-lead lp-fade">${esc(s.lead)}</p>
<div class="lp-actions lp-fade">${btn(SITE.cta.primary, 'primary large', o)}${btn(SITE.cta.secondary, 'ghost large', o)}</div>
<p class="lp-assurance lp-fade">${esc(s.assurance)}</p>
</div>
<div class="lp-shell"><figure class="lp-hero-media">
<div class="lp-app" aria-label="학습 홈 화면 예시" role="img">
<div class="lp-app-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(SITE.brand)}</span></div>
<div class="lp-app-body">
<div class="lp-app-main">
<span class="lp-chip">내 프로젝트 · ${esc(s.mock.project)}</span>
<p class="lp-app-one">${esc(s.mock.oneLiner)}</p>
<div class="lp-app-card"><span class="lp-mini-eyebrow">${esc(s.mock.nextLabel)}</span><strong>${esc(s.mock.nextTitle)}</strong><span class="lp-app-meta">${s.mock.nextMeta.map(esc).join(' · ')}</span><span class="lp-app-btn">${esc(s.mock.cta)} →</span></div>
<ol class="lp-app-path">${s.mock.path.map((p, i) => `<li class="${i === 0 ? 'current' : ''}"><i></i>${esc(p)}</li>`).join('')}</ol>
</div>
<div class="lp-app-side">${sprout('is-grown floating', '학습을 함께하는 새싹 부캐')}<span class="lp-orbit">✧ 나의 첫 가설</span></div>
</div></div>
<figcaption class="lp-hero-caption">${esc(s.caption)}</figcaption>
</figure></div>
</section>`,

  typeStory: s => `<section ${attrs(s, 'lp-dark')}>
<h2 id="${headingId(s)}" class="lp-sr">${esc(s.lines.join(', '))}</h2>
<div class="lp-type-stage lp-stage">
<p class="lp-eyebrow on-dark lp-type-eyebrow">${esc(s.eyebrow)}</p>
<div class="lp-type-sprout" aria-hidden="true">${sprout('is-growing', '')}<span class="lp-soil"></span></div>
${s.lines.map((l, i) => `<p class="lp-type-line" data-line="${i}" aria-hidden="true">${esc(l)}</p>`).join('')}
<p class="lp-type-note">${esc(s.note)}</p>
<div class="lp-type-foot" aria-hidden="true"><span>${esc(s.cue)}</span><i><b></b></i><span><b id="lp-type-index">01</b> / ${String(s.lines.length).padStart(2, '0')}</span></div>
</div>
</section>`,

  proof: s => `<section ${attrs(s)}>
<div class="lp-shell lp-proof-grid lp-reveal">
<div class="lp-proof-intro">${eyebrow(s.eyebrow)}<h2 id="${headingId(s)}">${br(s.title)}</h2></div>
${s.items.map((it, i) => `<article class="lp-proof-item" style="--i:${i + 1}"><span class="lp-mono">${esc(it.k)}</span><h3>${esc(it.t)}</h3><p>${esc(it.d)}</p></article>`).join('')}
</div>
</section>`,

  route: (s, o) => `<section ${attrs(s)}>
<div class="lp-shell">
<header class="lp-head lp-reveal">${eyebrow(s.eyebrow)}<h2 id="${headingId(s)}">${br(s.title)}</h2></header>
<ol class="lp-route-list lp-reveal">${s.steps.map((st, i) => `<li style="--i:${i}"><span class="lp-mono">${esc(st.k)} · ${esc(st.en)}</span><strong>${esc(st.t)}</strong><p>${esc(st.d)}</p>${i < s.steps.length - 1 ? '<i class="lp-route-arrow" aria-hidden="true">→</i>' : ''}</li>`).join('')}</ol>
<p class="lp-reveal"><a class="lp-textlink" href="${esc(href(s.link.href, o))}">${esc(s.link.label)} <span aria-hidden="true">↓</span></a></p>
</div>
</section>`,

  areas: (s, o) => `<section ${attrs(s)}>
<div class="lp-shell">
<header class="lp-head split lp-reveal">${eyebrow(s.eyebrow)}<h2 id="${headingId(s)}">${br(s.title)}</h2><p>${esc(s.lead)}</p></header>
<ul class="lp-areas">${s.areas.map((a, i) => `<li class="lp-area lp-card-reveal" style="--area:var(--c-${a.key});--i:${i % 4}"><span class="lp-area-top"><b aria-hidden="true">${esc(a.icon)}</b><span class="lp-mono">${String(i + 1).padStart(2, '0')}</span></span><h3>${esc(a.name)}</h3><p>${esc(a.q)}</p><ul class="lp-tags">${a.subs.map(t => `<li>${esc(t)}</li>`).join('')}</ul><i class="lp-area-arrow" aria-hidden="true">↗</i></li>`).join('')}${s.filler ? `<li class="lp-area filler lp-card-reveal" style="--i:3"><h3>${br(s.filler.t)}</h3><a class="lp-textlink" href="${esc(href(s.filler.link.href, o))}"${ext(s.filler.link.href)}>${esc(s.filler.link.label)} <span aria-hidden="true">↗</span></a></li>` : ''}</ul>
</div>
</section>`,

  bridge: s => `<section ${attrs(s)}>
<div class="lp-bridge-stage lp-stage">
<div class="lp-shell lp-bridge-inner">
<div class="lp-bridge-labels lp-mono" aria-hidden="true"><span>${esc(s.fromLabel)}</span><span>${esc(s.toLabel)}</span></div>
<div class="lp-bridge-nums" aria-hidden="true"><b class="from">${esc(s.from)}</b><i class="arrow">→</i><b class="to">${esc(s.to)}</b></div>
<div class="lp-bridge-copy"><h2 id="${headingId(s)}"><span>${esc(s.title[0])}</span><span class="accent">${esc(s.title[1])}</span></h2><p>${esc(s.body)}</p></div>
</div></div>
</section>`,

  story: s => `<section ${attrs(s, 'lp-dark')} style="--frames:${s.frames.length}">
<div class="lp-story-stage lp-stage" data-index="01">
<div class="lp-shell lp-story-top"><p class="lp-eyebrow on-dark">${esc(s.eyebrow)}</p><h2 id="${headingId(s)}" class="lp-story-intro">${esc(s.intro)}</h2><span class="lp-story-count lp-mono" aria-hidden="true"><b id="lp-story-index">01</b> / ${String(s.frames.length).padStart(2, '0')}</span></div>
${s.frames.map((f, i) => `<article class="lp-story-frame${i === 0 ? ' is-active' : ''}" data-frame="${i}">
<div class="lp-shell lp-story-grid">
<div class="lp-story-step"><span class="lp-mono">${esc(f.k)} · ${esc(f.en)}</span><h3>${br(f.t)}</h3><p>${esc(f.d)}</p></div>
<div class="lp-story-visual">${storyMock(f.mock)}</div>
</div></article>`).join('')}
<ol class="lp-story-dots" aria-hidden="true">${s.frames.map((f, i) => `<li class="${i === 0 ? 'is-active' : ''}"><i></i><span>${esc(f.en)}</span></li>`).join('')}</ol>
</div>
</section>`,

  growth: s => `<section ${attrs(s)}>
<div class="lp-shell">
<header class="lp-head lp-reveal">${eyebrow(s.eyebrow)}<h2 id="${headingId(s)}">${br(s.title)}</h2></header>
<div class="lp-growth-grid lp-reveal">${s.cards.map((c, i) => `<article class="lp-growth-card g${i + 1}" style="--i:${i}"><span class="lp-chip">${esc(c.tag)}</span><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p><ol class="lp-stages">${c.stages.map(st => `<li>${esc(st)}</li>`).join('')}</ol></article>`).join('')}</div>
<p class="lp-note lp-reveal">${esc(s.note)}</p>
</div>
</section>`,

  status: s => `<section ${attrs(s)}>
<div class="lp-shell lp-status-grid">
<header class="lp-head lp-reveal">${eyebrow(s.eyebrow)}<h2 id="${headingId(s)}">${br(s.title)}</h2><p class="lp-note">${esc(s.note)}</p></header>
<ol class="lp-status-rows">${s.rows.map(r => `<li class="lp-status-row" data-status="${esc(r.status)}"><span class="lp-mono">${esc(r.stage)}</span><div><strong>${esc(r.name)}</strong><p>${esc(r.d)}</p></div><em>${esc(r.label)}</em></li>`).join('')}</ol>
</div>
</section>`,

  faq: s => `<section ${attrs(s)}>
<div class="lp-shell lp-faq-grid">
<header class="lp-head lp-reveal">${eyebrow(s.eyebrow)}<h2 id="${headingId(s)}">${esc(s.title)}</h2></header>
<div class="lp-faq-list lp-reveal">${s.items.map((it, i) => `<details style="--i:${i}"${i === 0 ? ' open' : ''}><summary>${esc(it.q)}</summary><p>${esc(it.a)}</p></details>`).join('')}</div>
</div>
</section>`,

  final: (s, o) => `<section ${attrs(s)}>
<div class="lp-shell lp-final-card lp-reveal">
<div>${eyebrow(s.eyebrow)}<h2 id="${headingId(s)}"><span>${esc(s.title[0])}</span><span>${esc(s.title[1])}</span></h2><p>${esc(s.body)}</p><div class="lp-actions">${btn(SITE.cta.primary, 'primary large', o)}</div></div>
${sprout('is-grown floating', '함께 자랄 새싹 부캐')}
</div>
</section>`,

  stickyCta: (s, o) => `<aside class="lp-sticky" data-spec="${s.id}" aria-label="빠른 시작" inert>
<div><strong>${esc(s.title)}</strong><span>${esc(s.sub)}</span></div>${btn(SITE.cta.primary, 'primary small', o)}
</aside>`,

  footer: (s, o) => `<footer class="lp-footer" data-spec="${s.id}"><div class="lp-shell">
<a class="lp-brand" href="#top">${brandMark()}<span>${esc(SITE.brand)}<i>.</i></span></a>
<p class="lp-footer-notice">${esc(s.notice)}</p>
<ul>${s.links.filter(l => !(o.public && DOC_LINKS.includes(l.href))).map(l => `<li><a href="${esc(href(l.href, o))}">${esc(l.label)}</a></li>`).join('')}</ul>
<small>${esc(s.copy)}</small>
</div></footer>`
};

function storyMock(m) {
  const head = `<span class="lp-mock-label">${esc(m.label)}</span>`;
  if (m.kind === 'quiz') return `<div class="lp-mock quiz">${head}<p>${esc(m.text)}</p><ul>${m.choices.map((c, i) => `<li class="${i === m.answer ? 'right' : ''}">${i === m.answer ? '✓' : '○'} ${esc(c)}</li>`).join('')}</ul></div>`;
  if (m.kind === 'speech') return `<div class="lp-mock speech">${head}<div class="lp-mock-row">${sprout('is-grown', '')}<p class="lp-bubble">${esc(m.text)}</p></div></div>`;
  return `<div class="lp-mock ${esc(m.kind)}">${head}<p class="lp-mock-main">${esc(m.text)}</p>${m.meta ? `<p class="lp-mock-meta">${esc(m.meta)}</p>` : ''}${m.kind === 'transfer' ? '<span class="lp-mock-input" aria-hidden="true">지난번 예약은 어떻게 하셨어요?<i></i></span>' : ''}</div>`;
}

/** 전체 본문 렌더. opts.linkPrefix: 빌드 산출물(dist/) 기준 상대 링크 보정 */
const CHROME = ['nav', 'stickyCta', 'footer'];
export function renderPage(opts = {}) {
  const one = s => {
    const r = RENDERERS[s.type];
    if (!r) throw new Error(`No renderer for type ${s.type} (${s.id})`);
    return r(s, opts);
  };
  const byType = t => SECTIONS.filter(s => s.type === t).map(one).join('');
  const body = SECTIONS.filter(s => !CHROME.includes(s.type)).map(one).join('\n');
  return `${byType('nav')}\n<main id="main">\n${body}\n</main>\n${byType('stickyCta')}\n${byType('footer')}`;
}
