// SPEC-017 AC-L32-02·03·04·06 — 메시지 개정
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/content.mjs';
import { renderPage } from '../src/render.mjs';
import { read } from './_util.mjs';

const spec = read('docs/SPEC-017-landing-v3.2.md');
const sec = t => C.SECTIONS.find(s => s.type === t);
const html = renderPage();

test('AC-L32-02 첫 화면 카피 = §7.1·§7.2', () => {
  const s = sec('surface');
  assert.equal(C.SITE.headline, 'a');
  assert.deepEqual(Object.keys(C.HEADLINES), ['a', 'b', 'c']);
  for (const h of Object.values(C.HEADLINES)) { assert.ok(spec.includes(h.lines.join(' / ')), h.lines[0]); assert.ok(spec.includes(h.lead), h.lead); }
  assert.equal(s.hook, undefined);
  assert.equal(s.eyebrow, '사이드 프로젝트·1인 창업을 준비하는 메이커를 위해');
  assert.equal(s.badge, '가입 없는 체험판');
  assert.deepEqual(C.GETS.map(g => g.t), ['오늘 확인할 것 하나', '고객에게 물어볼 질문 3개', '들은 답으로 정하는 다음 한 걸음']);
  for (const g of C.GETS) assert.ok(spec.includes(g.d), g.d);
  for (const k of ['tagLabel', 'submit', 'empty', 'samplesLabel', 'down']) assert.ok(spec.includes(`| \`${k}\` |`) && spec.includes(s[k]), k);
  assert.ok(spec.includes(C.SITE.title.replace('Vencubator · ', '')) && spec.includes(C.SITE.description));
});

test('AC-L32-02 층·버튼·하베스트 카피 = §7.4~7.6', () => {
  for (const s of C.SECTIONS.filter(x => x.stratum)) assert.ok(spec.includes(s.title.replace('\n', ' / ')), s.id);
  for (const n of C.NEXT) assert.ok(spec.includes(n.label), n.label);
  for (const v of [C.NEXT_COPY.live, C.CTA_COPY.first, C.CTA_COPY.complete, C.CTA_COPY.progress]) assert.ok(spec.includes(v), v);
  const h = sec('harvest'), ab = sec('aboveBelow');
  for (const v of [h.eyebrow, h.titleDone, h.titlePartial, h.titleNone, h.body, h.cta, h.again, ab.title, ab.above.tag, ab.below.tag]) assert.ok(spec.includes(v), v);
  assert.equal(sec('honest').rows[2].name, '나에게 맞춘 학습 길');
});

test('AC-L32-03 첫 읽기 자리에 은유어 없음 (§7.7)', () => {
  const s = sec('surface'), h = sec('harvest'), ab = sec('aboveBelow');
  const zone = [
    C.SITE.title, s.eyebrow, s.badge, s.tagLabel, s.submit, s.empty, s.samplesLabel, s.down,
    ...Object.values(C.HEADLINES).flatMap(x => [...x.lines, x.lead]),
    ...C.GETS.flatMap(g => [g.t, g.d]),
    ...C.SECTIONS.filter(x => x.stratum).map(x => x.title),
    ...C.NEXT.map(n => n.label), ...Object.values(C.NEXT_COPY), ...Object.values(C.CTA_COPY),
    ab.title, ab.above.tag, ab.below.tag, h.eyebrow, h.titleDone, h.titlePartial, h.titleNone, h.cta, h.again
  ];
  const hits = zone.flatMap(t => C.METAPHOR_TERMS.filter(m => t.includes(m)).map(m => `${m} ← ${t}`));
  assert.deepEqual(hits, []);
});

test('AC-L32-04 렌더 구조: h1 1개·eyebrow 먼저·gets 3·hook 없음', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.indexOf('class="l3-eyebrow"') < html.indexOf('<h1'));
  assert.ok(html.indexOf('<h1') < html.indexOf('class="l3-gets"'));
  assert.equal((html.match(/<ol class="l3-gets"[\s\S]*?<\/ol>/)[0].match(/<li /g) || []).length, 3);
  assert.ok(!html.includes('l3-hook'));
  assert.ok(html.includes(C.HEADLINES.a.lines[1]) && html.includes('data-headline="a"'));
  const css = read('src/landing.css');
  const gets = [...css.matchAll(/\.l3-gets[^{]*\{([^}]*)\}/g)].map(m => m[1]).join('');
  assert.ok(!/border\s*:/.test(gets), 'gets는 테두리 없음');
  for (const s of C.SECTIONS.filter(x => x.stratum)) { const i = html.indexOf(`data-spec="${s.id}"`); assert.ok(html.indexOf('class="l3-strata"', i) < html.indexOf(`id="${s.anchor}-title"`, i), s.id); }
});

test('AC-L32-05 후보 교체는 textContent로만 (정적 검사)', () => {
  const js = read('src/interact.mjs');
  assert.match(js, /L3I-13/);
  assert.match(js, /setText\('h1-0'/);
  assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(js));
});

test('AC-L32-06 금지 표현·수치·시간 약속', () => {
  const copy = JSON.stringify({ H: C.HEADLINES, G: C.GETS, S: C.SECTIONS, N: C.NEXT, T: C.SITE });
  for (const w of C.CLAIM_BANNED) assert.ok(!copy.includes(w), w);
  assert.ok(!/\d+\s?%/.test(copy));
  assert.ok(!/\d+\s?(분|시간|일)\s?(만에|안에|이면)/.test(copy), '숫자 시간 약속 금지(“몇 분”만)');
});
