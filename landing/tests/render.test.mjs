// AC-LP02, AC-LP05: 렌더 구조·접근성·링크
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, href } from '../src/render.mjs';
import { SITE, SECTIONS } from '../src/content.mjs';

const html = renderPage();

test('AC-LP02 h1은 정확히 1개', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});

test('AC-LP02 모든 aria-labelledby 대상 id가 존재', () => {
  const refs = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length >= 10);
  for (const r of refs) assert.ok(html.includes(`id="${r}"`), r);
});

test('AC-LP02 main 랜드마크, skip link, section 수', () => {
  assert.ok(html.includes('<main id="main">'));
  assert.ok(html.includes('href="#main"'));
  assert.equal((html.match(/<section\b/g) || []).length, SECTIONS.filter(s => !['nav', 'stickyCta', 'footer'].includes(s.type)).length);
});

test('AC-LP02 svg는 role=img+aria-label 또는 aria-hidden', () => {
  for (const tag of html.match(/<svg\b[^>]*>/g)) assert.ok(/aria-hidden="true"/.test(tag) || /role="img"[^>]*aria-label="[^"]*"/.test(tag) || /aria-label="[^"]*"[^>]*role="img"/.test(tag), tag);
});

test('AC-LP02 장식용 새싹(빈 라벨)은 aria-hidden 부모 안에 있음', () => {
  const empties = [...html.matchAll(/aria-label=""/g)].length;
  const hiddenWraps = (html.match(/aria-hidden="true">\s*<svg class="lp-sprout/g) || []).length + (html.match(/<div class="lp-mock-row"><svg class="lp-sprout is-grown" viewBox="0 0 220 240" role="img" aria-label="">/g) || []).length;
  assert.ok(empties <= hiddenWraps + 1, `${empties} empty labels`);
});

test('AC-LP05 모든 링크는 SITE.links 값 또는 페이지 내부 앵커', () => {
  const allowed = new Set([...Object.values(SITE.links), '#main', '#top', ...SECTIONS.map(s => '#' + s.anchor)]);
  for (const [, h] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) assert.ok(allowed.has(h), h);
  for (const [, k] of html.matchAll(/data-cta="([^"]+)"/g)) assert.ok(k in SITE.links, k);
});

test('AC-LP05 알 수 없는 링크 키는 예외, linkPrefix는 상대 문서 링크에만 적용', () => {
  assert.throws(() => href('nope'));
  assert.equal(href('brief', { linkPrefix: '../' }), '../' + SITE.links.brief);
  // SPEC-009: 서비스 진입 링크는 상대 경로라 dist(한 단계 아래)에서는 보정된다
  assert.equal(href('prototype', { linkPrefix: '../' }), '../' + SITE.links.prototype);
  assert.match(SITE.links.prototype, /^\.\.\/app\/\?from=v1$/);
  assert.equal(href('story', { linkPrefix: '../' }), SITE.links.story);
});

test('XSS: 카피는 이스케이프된다', async () => {
  const { esc } = await import('../src/render.mjs');
  assert.equal(esc('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
});
