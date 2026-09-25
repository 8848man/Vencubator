// AC-L3-04, 05, 06
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/content.mjs';
import { read } from './_util.mjs';

const copy = JSON.stringify(Object.fromEntries(Object.entries(C).filter(([k]) => !['CLAIM_BANNED', 'REQUIRED_NOTICES'].includes(k))));
const css = read('src/landing.css').replace(/\/\*[\s\S]*?\*\//g, '');

test('AC-L3-04 금지 표현 없음', () => { for (const w of C.CLAIM_BANNED) assert.ok(!copy.includes(w), w); });
test('AC-L3-04 필수 고지 (푸터·지상·관찰)', () => {
  const footer = JSON.stringify(C.SECTIONS.find(s => s.type === 'footer'));
  for (const n of C.REQUIRED_NOTICES) assert.ok(footer.includes(n), n);
  assert.ok(C.SECTIONS.find(s => s.type === 'surface').privacy.includes('서버로 보내지 않고'));
  assert.ok(C.OBSERVATION.label.includes('예시'));
  assert.equal(C.STAMPS.example, '예시 기록');
});
test('AC-L3-04 성과 수치·백분율 없음', () => {
  assert.ok(!/\d+\s?%/.test(copy));
  assert.ok(!/\d[\d,]*\s?(만|천)?\s?명(이|의)?\s?(사용|선택|함께|가입)/.test(copy));
});
test('AC-L3-04 지층 제목 옆 실제 뜻 (은유만으로 두지 않음)', () => {
  for (const s of C.SECTIONS.filter(x => x.stratum)) assert.ok(s.depth && s.meaning && s.meaning.length >= 2, s.id);
});
test('AC-L3-05 landing.css hex 없음', () => { assert.deepEqual(css.match(/#[0-9a-fA-F]{3,8}\b/g) || [], []); });
test('AC-L3-05 스크롤 고정 없음: 100vh 초과 높이 없음, sticky는 상단바만, fixed 없음', () => {
  assert.deepEqual(css.match(/height:\s*(1[0-9]{2}|[2-9]\d{2})[sdl]?vh/g) || [], []);
  const sticky = [...css.matchAll(/([^{}]+)\{[^}]*position:\s*sticky/g)].map(m => m[1].trim());
  assert.deepEqual(sticky, ['.l3-top']);
  assert.ok(!/position:\s*fixed/.test(css));
});
test('AC-L3-05 참고 사이트 장치 흔적 없음 (챕터 번호 n/N, 거대 인덱스 숫자, 하단 고정 바)', () => {
  const html = read('src/render.mjs');
  assert.ok(!/\b0\d\s*\/\s*0\d\b/.test(copy + html));
  assert.ok(!C.SECTIONS.some(s => 'no' in s || 'index' in s));
  assert.ok(!/bottom:\s*0[^;]*;[^}]*position:\s*fixed|sticky-cta|bottom-bar/.test(css));
});
test('AC-L3-06 네트워크 전송 코드 없음', () => {
  const js = ['src/content.mjs', 'src/state.mjs', 'src/interact.mjs', 'src/render.mjs', 'src/main.mjs', 'src/track.mjs'].map(read).join('\n');
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(js));
});
test('AC-L3-06 방문자 입력은 innerHTML로 넣지 않음', () => {
  assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(read('src/interact.mjs')));
});
