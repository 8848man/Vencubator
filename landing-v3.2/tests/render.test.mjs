// AC-L3-03 렌더 구조·접근성
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, href, esc } from '../src/render.mjs';
import { SITE, SECTIONS, SLOTS } from '../src/content.mjs';

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
test('aria-labelledby 대상 존재', () => {
  for (const [, id] of html.matchAll(/aria-(?:labelledby|controls|describedby)="([^"]+)"/g)) for (const one of id.split(' ')) assert.ok(html.includes(`id="${one}"`), one);
});
test('이름표 입력칸 존재, 길이 제한', () => {
  assert.match(html, new RegExp(`<form class="l3-tag" data-form="idea"[\\s\\S]*id="idea-input"[^>]*maxlength="${SITE.limits.idea}"`));
});
test('지층 제목 옆 깊이·실제 뜻 병기', () => {
  for (const s of SECTIONS.filter(x => x.stratum)) {
    const sec = html.slice(html.indexOf(`id="${s.anchor}"`));
    const head = sec.slice(0, sec.indexOf('</h2>'));
    assert.ok(head.includes(esc(s.depth)) && head.includes(esc(s.meaning)) && head.includes(esc(s.stratum)), s.id);
  }
});
test('층 기록 4개 = 다 쓴 예시 문장 (빈 칸 아님, DP-12)', () => {
  const notes = [...html.matchAll(/class="l3-note" data-slot="(\w+)" data-status="example">[\s\S]*?data-value>([^<]+)</g)];
  assert.deepEqual(notes.map(n => n[1]), SLOTS.slice(1).map(s => s.key));
  notes.forEach(([, , v], i) => assert.equal(v, esc(SLOTS[i + 1].example)));
});
test('동적 피드백 영역은 aria-live', () => {
  for (const k of ['quiz-feedback', 'observe-note', 'ask-msg', 'path-rule']) assert.match(html, new RegExp(`aria-live="polite"[^>]*data-bind="${k}"|data-bind="${k}"[^>]*aria-live`), k);
});
test('svg는 라벨 또는 aria-hidden (뿌리 레일은 통째로 숨김)', () => {
  for (const t of html.match(/<svg\b[^>]*>/g)) {
    if (/class="l3-root"/.test(t)) { assert.match(html, /class="l3-rail" data-spec="L3S-02" aria-hidden="true"/); continue; }
    assert.ok(/aria-hidden="true"/.test(t) || /role="img" aria-label="[^"]+"/.test(t), t);
  }
});
test('링크는 SITE.links 값 또는 내부 앵커', () => {
  const allowed = new Set([...Object.values(SITE.links), '#main', ...SECTIONS.map(s => '#' + s.anchor)]);
  for (const [, h] of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) assert.ok(allowed.has(h), h);
  assert.throws(() => href('nope'));
  assert.deepEqual(Object.keys(SITE.links), ['prototype']);
});
test('사용자 화면에 개발자용 정보 없음 (명세·기획서 링크, 내부 단계 코드, 개발 용어)', () => {
  const text = html.replace(/<[^>]+>/g, ' ');
  assert.ok(!/docs\/|SPEC-|PRODUCT-BRIEF|명세|기획서/.test(html.replace(/data-spec="[^"]+"/g, '')));
  assert.ok(!/\bS[123]\b|\bMVP\b|AI 개인화|템플릿 ID|localStorage/.test(text), text.match(/\bS[123]\b|\bMVP\b|AI 개인화|localStorage/)?.[0]);
  assert.ok(html.includes('href="./app/?from=v32"'));
});
test('로드맵: 지금·다음·그다음 세 단계, 지금 단계 표시', () => {
  const h = SECTIONS.find(s => s.type === 'honest');
  assert.deepEqual(h.rows.map(r => r.when), ['지금', '다음', '그다음']);
  assert.equal((html.match(/<li data-status="in_progress">/g) || []).length, 1);
  for (const r of h.rows) assert.ok(r.items.length >= 3 && r.t && r.note, r.name);
});
test('정적 렌더에 방문자 입력 자리는 비어 있음(런타임 textContent)', () => {
  assert.match(html, /data-bind="idea"><\/p>/);
  assert.equal(esc('<img onerror=x>'), '&lt;img onerror=x&gt;');
});

test('AC-L31-03 다음 층 버튼 6개, 숨김·위치·접근성',()=>{
 const out=renderPage();
 assert.equal((out.match(/class="l3-next" data-next="[a-z]+" hidden/g)||[]).length,6);
 assert.equal((out.match(/type="button" class="l3-btn" data-goto=/g)||[]).length,6);
 assert.equal((out.match(/class="l3-app-link" data-cta="prototype"/g)||[]).length,5);
 assert.ok(out.includes('data-next-live aria-live="polite"'));
 for(const [layer,to] of [['surface','learn'],['learn','ask'],['ask','observe'],['observe','decide'],['decide','roots'],['roots','harvest']])assert.ok(out.includes('data-next="'+layer+'" hidden')&&out.includes('data-goto="'+to+'"'));
});

test('AC-L31-03 앱 CTA·진행 점·말풍선·히어로',()=>{
 const out=renderPage();assert.ok(out.includes('앱 시작하기'));
 assert.ok(out.includes('data-placement="hero"')&&out.includes('가입 없이 바로 앱에서 시작하기 →'));
 assert.ok(out.includes('aria-label="내가 해 본 단계 0/5"'));
 assert.ok(out.includes('data-cta-bubble aria-live="polite" hidden'));
});

test('AC-L31-03 고민 4개·why·관찰 바인딩 (v3.2: hook 없음)',()=>{
 const out=renderPage();assert.equal((out.match(/data-pain="[a-z]+" aria-pressed="false"/g)||[]).length,4);
 assert.equal((out.match(/class="l3-why"/g)||[]).length,4);
 assert.ok(out.includes('data-bind="pain-line" aria-live="polite"'));
 assert.ok(!out.includes('l3-hook'));
 assert.equal((out.match(/data-quote="[0-2]"/g)||[]).length,3);
});
