// AC-L3-01, AC-L3-07 명세·저장소 추적성
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { SECTIONS, AREAS, LESSON } from '../src/content.mjs';
import { RENDERERS } from '../src/render.mjs';
import { read, exists, repoPath } from './_util.mjs';

const spec = read('docs/SPEC-016-landing-v3.1.md');
const table = [...spec.matchAll(/^\| (L3S-\d{2}) \| `(\w+)` \|/gm)].map(m => ({ id: m[1], type: m[2] }));

test('AC-L3-01 §3 표 ↔ SECTIONS id·type·순서', () => {
  assert.equal(table.length, 12);
  assert.deepEqual(SECTIONS.map(s => ({ id: s.id, type: s.type })), table);
  for (const s of SECTIONS) assert.equal(typeof RENDERERS[s.type], 'function', s.type);
  assert.equal(new Set(SECTIONS.map(s => s.anchor)).size, SECTIONS.length);
});

test('AC-L3-01 명세의 L3I·L3M ID가 코드에 존재', () => {
  const code = read('src/interact.mjs') + read('src/landing.css') + read('src/state.mjs');
  const ids = new Set([...spec.matchAll(/\| (L3[IM]-\d{2}) \|/g)].map(m => m[1]));
  assert.equal(ids.size, 21);
  // 머리말의 범위 표기(L3I-01~09, L3M-01~07)도 인정
  const ranged = id => { const [p, n] = id.split('-'); const m = code.match(new RegExp(`${p}-(\\d+)~(\\d+)`)); return m && +n >= +m[1] && +n <= +m[2]; };
  assert.deepEqual([...ids].filter(id => !code.includes(id) && !ranged(id)), []);
});

test('지층 표의 깊이 = content 깊이', () => {
  for (const s of SECTIONS.filter(x => x.depth)) assert.ok(spec.includes(`| ${s.id} | \`${s.type}\` | ${s.depth}`) || spec.includes(`${s.depth} ${s.stratum}`), s.id);
});

test('AC-L3-07 진행 상태 = STATE.json', { skip: !exists('docs/execution/STATE.json') && 'STATE 없음' }, () => {
  const st = JSON.parse(readFileSync(repoPath('docs/execution/STATE.json'), 'utf8'));
  for (const r of SECTIONS.find(s => s.type === 'honest').rows) assert.equal(r.status, st.stages[r.stage]?.status, r.stage);
});

test('AC-L3-07 7영역 이름·색 = prototype STATS, 경로 순서 = guided PATH', { skip: !exists('prototype/content.mjs') && 'prototype 없음' }, async () => {
  const { STATS } = await import(pathToFileURL(repoPath('prototype/content.mjs')).href);
  const tokens = read('src/tokens.css');
  for (const a of AREAS) { const s = STATS.find(x => x.id === a.key); assert.equal(a.name, s.name); assert.match(tokens, new RegExp(`--c-${a.key}:\\s*${s.color}`, 'i')); }
  const guided = readFileSync(repoPath('prototype/guided.mjs'), 'utf8');
  const path = JSON.parse(guided.match(/PATH=(\[[^\]]+\])/)[1].replace(/'/g, '"'));
  assert.deepEqual(AREAS.map(a => a.key), path);
});

test('AC-L3-07 퀴즈 문항·정답 = prototype LESSONS.customer', { skip: !exists('prototype/content.mjs') && 'prototype 없음' }, async () => {
  const { LESSONS } = await import(pathToFileURL(repoPath('prototype/content.mjs')).href);
  const lesson = LESSONS.find(l => l.id === 'customer');
  assert.equal(LESSON.title, lesson.title);
  LESSON.variants.forEach((v, i) => { assert.equal(v.question, lesson.variants[i].question); assert.deepEqual(v.options, lesson.variants[i].options); assert.equal(v.answer, lesson.variants[i].answer); });
});

test('SPEC-009 계측 모듈 = site/shared 원본', { skip: !exists('site/shared/track.mjs') && 'site 없음' }, () => {
  assert.equal(read('src/track.mjs'), readFileSync(repoPath('site/shared/track.mjs'), 'utf8'));
});
