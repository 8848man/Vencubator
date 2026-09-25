// AC-LP04, AC-LP07 + 프로토타입과의 일관성
import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE, SECTIONS, AREAS, CLAIM_BANNED, REQUIRED_NOTICES } from '../src/content.mjs';
import { read, exists, repoPath } from './_util.mjs';
import { pathToFileURL } from 'node:url';

const copy = JSON.stringify({ SITE, SECTIONS });

test('AC-LP04 금지 표현이 카피에 없음', () => {
  for (const w of CLAIM_BANNED) assert.ok(!copy.includes(w), `금지 표현: ${w}`);
});

test('AC-LP04 필수 고지 존재 (푸터·FAQ)', () => {
  const footer = JSON.stringify(SECTIONS.find(s => s.type === 'footer'));
  for (const n of REQUIRED_NOTICES) assert.ok(footer.includes(n), n);
  assert.ok(JSON.stringify(SECTIONS.find(s => s.type === 'faq')).includes('가상 예시'));
});

test('AC-LP04 백분율·순위 같은 성과 수치를 쓰지 않음', () => {
  assert.ok(!/\d+\s?%/.test(copy), '백분율');
  assert.ok(!/\d[\d,]*\s?(만|천)?\s?명(이|의)?\s?(사용|선택|함께|가입)/.test(copy), '사용자 수 주장');
});

test('AC-LP07 landing.css에 hex 색상 리터럴 없음 (토큰만)', () => {
  const css = read('src/landing.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.deepEqual(css.match(/#[0-9a-fA-F]{3,8}\b/g) || [], []);
});

test('7개 영역: SPEC-005 기본 경로 순서, 각 영역에 색 토큰 존재', () => {
  assert.deepEqual(AREAS.map(a => a.key), ['customer', 'product', 'market', 'gtm', 'finance', 'operations', 'strategy']);
  const tokens = read('src/tokens.css');
  for (const a of AREAS) assert.match(tokens, new RegExp(`--c-${a.key}:\\s*#`), a.key);
});

test('7개 영역: 이름·색이 prototype/content.mjs STATS와 일치', { skip: !exists('prototype/content.mjs') && 'prototype 없음' }, async () => {
  const { STATS } = await import(pathToFileURL(repoPath('prototype/content.mjs')).href);
  const tokens = read('src/tokens.css');
  for (const a of AREAS) {
    const s = STATS.find(x => x.id === a.key);
    assert.ok(s, a.key); assert.equal(a.name, s.name);
    assert.match(tokens, new RegExp(`--c-${a.key}:\\s*${s.color}`, 'i'));
  }
});
