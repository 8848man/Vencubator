// AC-LP01, AC-LP08: 명세 ↔ 코드 추적성
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SECTIONS } from '../src/content.mjs';
import { RENDERERS } from '../src/render.mjs';
import { read, exists, repoPath } from './_util.mjs';

const spec = read('docs/SPEC-006-landing.md');
const SPEC_SECTIONS = [...spec.matchAll(/^\| (LS-\d{2}) \| `(\w+)` \|/gm)].map(m => ({ id: m[1], type: m[2] }));

test('AC-LP01 SPEC-006 §3 섹션 표와 SECTIONS가 id·type·순서까지 일치', () => {
  assert.ok(SPEC_SECTIONS.length >= 10, '명세 표를 읽지 못함');
  assert.deepEqual(SECTIONS.map(s => ({ id: s.id, type: s.type })), SPEC_SECTIONS);
});

test('AC-LP01 id·anchor 중복 없음, 모든 type에 렌더러 존재', () => {
  assert.equal(new Set(SECTIONS.map(s => s.id)).size, SECTIONS.length);
  assert.equal(new Set(SECTIONS.map(s => s.anchor)).size, SECTIONS.length);
  for (const s of SECTIONS) assert.equal(typeof RENDERERS[s.type], 'function', s.type);
});

test('AC-LP01 명세의 모든 모션 ID(LM-01~09)가 motion.mjs 또는 CSS에 언급됨', () => {
  const src = read('src/motion.mjs') + read('src/landing.css');
  for (const id of [...new Set([...spec.matchAll(/\| (LM-\d{2}) \|/g)].map(m => m[1]))]) assert.ok(src.includes(id), id);
});

test('AC-LP08 LS-09 진행 상태가 docs/execution/STATE.json과 일치', { skip: !exists('docs/execution/STATE.json') && 'STATE.json 없음' }, () => {
  const state = JSON.parse(readFileSync(repoPath('docs/execution/STATE.json'), 'utf8'));
  const rows = SECTIONS.find(s => s.id === 'LS-09').rows;
  for (const r of rows) assert.equal(r.status, state.stages[r.stage]?.status, `${r.stage}`);
});
