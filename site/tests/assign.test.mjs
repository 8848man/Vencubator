// SPEC-009 AC-S01 배정 규칙
import test from 'node:test';
import assert from 'node:assert/strict';
import { pickVariant, resolveVariant, targetUrl, WEIGHTS } from '../src/assign.mjs';

test('기본 가중치는 50:50', () => assert.deepEqual(WEIGHTS, { v1: 0.5, v2: 0.5 }));

test('가중 무작위: 경계값과 분포', () => {
  assert.equal(pickVariant(0), 'v1');
  assert.equal(pickVariant(0.4999), 'v1');
  assert.equal(pickVariant(0.5), 'v2');
  assert.equal(pickVariant(1), 'v2');
  assert.equal(pickVariant(0.5, { v1: 0.8, v2: 0.2 }), 'v1');
  let seed = 42; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const n = 10000, v1 = Array.from({ length: n }, () => pickVariant(rnd())).filter(x => x === 'v1').length;
  assert.ok(Math.abs(v1 / n - 0.5) < 0.02, `v1 비율 ${v1 / n}`);
});

test('강제 지정 > 저장된 배정 > 무작위', () => {
  const stored = { v: 1, visitor: 'a', variant: 'v1' };
  assert.deepEqual(resolveVariant({ search: '?v=v2', stored, rand: 0 }), { variant: 'v2', source: 'override', write: true });
  assert.deepEqual(resolveVariant({ search: '', stored, rand: 0.9 }), { variant: 'v1', source: 'stored', write: false });
  assert.deepEqual(resolveVariant({ search: '', stored: null, rand: 0.9 }), { variant: 'v2', source: 'random', write: true });
});

test('잘못된 강제값·저장값은 무시', () => {
  assert.equal(resolveVariant({ search: '?v=v9', stored: null, rand: 0.1 }).source, 'random');
  assert.equal(resolveVariant({ search: '', stored: { variant: 'x' }, rand: 0.1 }).source, 'random');
});

test('이동 주소: 상대 경로, UTM 유지, v 제거, 해시 유지', () => {
  assert.equal(targetUrl('v2', '?utm_source=geeknews&v=v2&utm_content=M-B', '#start'), './v2/?utm_source=geeknews&utm_content=M-B#start');
  assert.equal(targetUrl('v1', '', ''), './v1/');
});
