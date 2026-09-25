// AC-L2-03 렌더 구조·접근성
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, href, esc } from '../src/render.mjs';
import { SITE, SECTIONS } from '../src/content.mjs';

const html = renderPage();

test('h1 1개, main, skip link', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('<main id="main">') && html.includes('href="#main"'));
});
test('모든 input에 연결된 label', () => {
  for (const [, id] of html.matchAll(/<input[^>]*id="([^"]+)"/g)) assert.ok(html.includes(`for="${id}"`), id);
});
test('모든 button에 type', () => {
  for (const b of html.match(/<button\b[^>]*>/g)) assert.match(b, /type="(button|submit)"/, b);
});
test('aria-labelledby 대상 존재, aria-controls 대상 존재', () => {
  for (const [, id] of html.matchAll(/aria-(?:labelledby|controls)="([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`), id);
});
test('카드 5칸은 버튼이며 챕터로 연결', () => {
  const slots = [...html.matchAll(/class="l2-slot" data-slot="(\w+)" data-goto="(\w+)"/g)];
  assert.equal(slots.length, 5);
  for (const [, , goto] of slots) assert.ok(html.includes(`id="${goto}"`), goto);
});
test('동적 피드백 영역은 aria-live', () => {
  for (const k of ['quiz-feedback', 'observe-note', 'path-rule']) assert.match(html, new RegExp(`aria-live="polite"[^>]*data-bind="${k}"|data-bind="${k}"[^>]*aria-live`), k);
  assert.ok(html.includes('data-live="card"'));
});
test('svg는 라벨 또는 aria-hidden', () => {
  for (const t of html.match(/<svg\b[^>]*>/g)) assert.ok(/aria-hidden="true"/.test(t) || /role="img" aria-label="[^"]+"/.test(t), t);
});
test('링크는 SITE.links 값 또는 내부 앵커, 외부 링크는 새 탭+noopener', () => {
  const allowed = new Set([...Object.values(SITE.links), '#main', ...SECTIONS.map(s => '#' + s.anchor)]);
  for (const [tag, h] of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
    assert.ok(allowed.has(h), h);
    if (/^https?:/.test(h)) assert.match(tag, /rel="noopener"/);
  }
  assert.throws(() => href('nope'));
  assert.equal(href('brief', { linkPrefix: '../' }), '../' + SITE.links.brief);
});
test('정적 렌더에 방문자 입력 자리는 비어 있음(런타임 textContent)', () => {
  assert.match(html, /data-bind="idea"><\/p>/);
  assert.equal(esc('<img onerror=x>'), '&lt;img onerror=x&gt;');
});
