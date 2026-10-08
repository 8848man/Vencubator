import { COMMON as C, CHOICES, PAGES } from './content.mjs';
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function renderChooser(current) {
  return `<div class="aud-shell" data-audience="${current}">
    <aside class="aud-bar" aria-label="설명 선택"><span>${CHOICES.find(c => c.key === current).short}</span><button type="button" data-aud-open hidden>${C.switch} <span aria-hidden="true">↗</span></button><noscript><nav aria-label="다른 설명">${CHOICES.map(c => `<a href="${c.href}">${c.short}</a>`).join('')}</nav></noscript></aside>
    <p class="aud-live" role="status" aria-live="polite"></p>
    <dialog class="aud-dialog" aria-labelledby="aud-title" aria-describedby="aud-intro">
      <div class="aud-dialog-top"><span class="aud-eyebrow">${C.eyebrow}</span><button type="button" data-aud-close>${C.close} <span aria-hidden="true">×</span></button></div>
      <h2 id="aud-title" tabindex="-1">${C.title}</h2><p id="aud-intro">${C.intro}</p>
      <div class="aud-choices">${CHOICES.map((c,i) => `<a href="${c.href}" data-aud-choice="${c.key}"><span class="aud-number" aria-hidden="true">0${i+1}</span><span><strong>${c.label}</strong><small>${c.desc}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</div>
      <button type="button" class="aud-skip" data-aud-close>${C.skip}</button><p class="aud-remember">${C.remember}</p>
    </dialog></div>`;
}
const cta = (p, placement) => `<a class="aud-cta" href="/app/?from=${p.from}" data-aud-cta="${placement}">${p.cta}<span aria-hidden="true">↗</span></a>`;
export function renderAudiencePage(audience) {
  const p = PAGES[audience];
  if (!p) throw new Error('Unknown audience');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(p.lead)}"><meta name="theme-color" content="#eef2e8"><title>${esc(p.title)} · Vencubator</title><link rel="canonical" href="https://vencubator.vercel.app${p.path}"><link rel="stylesheet" href="/assets/audience/tokens.css"><link rel="stylesheet" href="/assets/audience/style.css"></head>
  <body class="aud-page aud-${audience}"><a class="aud-skip-main" href="#main">본문으로 건너뛰기</a>
  <header class="aud-header"><a href="/" class="aud-brand" aria-label="Vencubator 홈"><span aria-hidden="true">✳</span> ${C.brand}</a><span>프로토타입</span></header>
  ${renderChooser(audience)}<main id="main">
  <section class="aud-hero"><div class="aud-hero-copy"><p class="aud-eyebrow">${p.eyebrow}</p><h1>${p.title}</h1><p class="aud-lead">${p.lead}</p><div class="aud-actions">${cta(p,'hero')}<a class="aud-text-link" href="#${audience === 'tester' ? 'flow' : 'result'}">${p.secondary} <span aria-hidden="true">↓</span></a></div><p class="aud-app-hint">${C.appHint}</p></div>
  <div class="aud-hero-art" aria-hidden="true"><div class="aud-orbit"></div><div class="aud-art-card aud-art-one"><span>01</span><strong>${p.steps[0][0]}</strong></div><div class="aud-art-card aud-art-two"><span>02</span><strong>${p.steps[1][0]}</strong></div><div class="aud-art-card aud-art-three"><span>03</span><strong>${p.steps[2][0]}</strong></div></div></section>
  <section class="aud-section" id="flow"><p class="aud-section-number" aria-hidden="true">01 / 03</p><h2>${p.flowTitle}</h2><ol class="aud-steps">${p.steps.map(([t,d],i)=>`<li><span class="aud-step-index" aria-hidden="true">0${i+1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol></section>
  <section class="aud-section aud-result" id="result"><div><p class="aud-section-number" aria-hidden="true">02 / 03</p><h2>${p.resultTitle}</h2>${p.resultLead?`<p>${p.resultLead}</p>`:`<p>${p.feedback}</p><p class="aud-note">${p.optional}</p>`}</div>
  ${p.records?`<article class="aud-record"><span class="aud-pill">${p.sample}</span><h3>${p.sampleTitle}</h3><dl>${p.records.map(([t,d])=>`<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl></article>`:`<ol class="aud-questions">${p.questions.map((q,i)=>`<li><span aria-hidden="true">0${i+1}</span><p>${q}</p></li>`).join('')}</ol>`}</section>
  <section class="aud-section aud-end"><p class="aud-section-number" aria-hidden="true">03 / 03</p><h2>${p.endTitle}</h2>${p.endLead?`<p>${p.endLead}</p>`:''}<p class="aud-notice">${C.notice}</p>${cta(p,'footer')}<p class="aud-app-hint">${C.appHint}</p></section></main><footer class="aud-footer"><span>${C.brand}</span><p>${C.footer}</p></footer><script type="module" src="/assets/audience/interact.mjs"></script></body></html>`;
}
