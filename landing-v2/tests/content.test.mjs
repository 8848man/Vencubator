// AC-L2-04, 05, 06
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/content.mjs';
import { read } from './_util.mjs';

const copy = JSON.stringify(Object.fromEntries(Object.entries(C).filter(([k]) => !['CLAIM_BANNED', 'REQUIRED_NOTICES'].includes(k))));

test('AC-L2-04 금지 표현 없음', () => { for (const w of C.CLAIM_BANNED) assert.ok(!copy.includes(w), w); });
test('AC-L2-04 필수 고지 (푸터·FAQ·히어로)', () => {
  const footer = JSON.stringify(C.SECTIONS.find(s => s.type === 'footer'));
  for (const n of C.REQUIRED_NOTICES) assert.ok(footer.includes(n), n);
  assert.ok(C.SECTIONS.find(s => s.type === 'hero').privacy.includes('서버로 전송되지 않고'));
  assert.ok(C.OBSERVATION.label.includes('예시'));
});
test('AC-L2-04 성과 수치·백분율 없음', () => {
  assert.ok(!/\d+\s?%/.test(copy));
  assert.ok(!/\d[\d,]*\s?(만|천)?\s?명(이|의)?\s?(사용|선택|함께|가입)/.test(copy));
});
test('AC-L2-05 landing.css hex 없음', () => {
  const css = read('src/landing.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.deepEqual(css.match(/#[0-9a-fA-F]{3,8}\b/g) || [], []);
});
test('AC-L2-05 스크롤 고정 스테이지 없음 (100svh/vh 초과 높이, sticky는 상단바·카드만)', () => {
  const css = read('src/landing.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.deepEqual(css.match(/height:\s*(1[0-9]{2}|[2-9]\d{2})s?vh/g) || [], []);
  const stickySelectors = [...css.matchAll(/([^{}]+)\{[^}]*position:\s*sticky/g)].map(m => m[1].trim());
  assert.deepEqual(stickySelectors.sort(), ['.l2-card', '.l2-top'].sort());
});
test('AC-L2-06 네트워크 전송 코드 없음', () => {
  const js = ['src/content.mjs', 'src/state.mjs', 'src/interact.mjs', 'src/render.mjs', 'src/main.mjs', 'src/track.mjs'].map(read).join('\n');
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(js));
});
test('AC-L2-06 방문자 입력은 innerHTML로 넣지 않음', () => {
  const js = read('src/interact.mjs');
  assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(js));
});
