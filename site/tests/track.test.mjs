// SPEC-009 AC-S02 공통 계측
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { track, cleanProps, readEvents, captureUtm, ensureAssignment, readAssignment, writeAssignment, MAX_EVENTS, EXP_KEY } from '../shared/track.mjs';

const mem = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; };
const broken = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };

test('자유 텍스트·이상한 키는 버린다', () => {
  assert.deepEqual(cleanProps({ source: 'mine', len: 30, ok: true, idea: '동네 반찬을 나눠 사는 구독', Bad: 1, x: 'a b', obj: {} }), { source: 'mine', len: 30, ok: true });
});

test('배정·UTM·페이지가 이벤트에 붙고 500건 상한', () => {
  const st = mem(), ss = mem();
  writeAssignment(st, { v: 1, visitor: 'vis-1', variant: 'v2', source: 'random', at: 1 });
  captureUtm('?utm_source=geeknews&utm_medium=community&utm_content=M-B&utm_campaign=<script>', ss);
  const ev = track('cta_click', { placement: 'l2s-11' }, { storage: st, session: ss, page: 'v2' });
  assert.equal(ev.variant, 'v2'); assert.equal(ev.visitor, 'vis-1'); assert.equal(ev.page, 'v2');
  assert.deepEqual(ev.utm, { source: 'geeknews', medium: 'community', content: 'M-B' });
  for (let i = 0; i < MAX_EVENTS + 20; i++) track('landing_view', {}, { storage: st, session: ss, page: 'v1' });
  assert.equal(readEvents(st).length, MAX_EVENTS);
});

test('한글 채널명 UTM 허용', () => {
  const ss = mem();
  assert.deepEqual(captureUtm('?utm_source=univ-서울', ss), { source: 'univ-서울' });
});

test('직접 방문은 보고 있는 변형으로 배정 기록, 기존 배정은 유지', () => {
  const st = mem();
  const a = ensureAssignment('v1', st);
  assert.equal(a.source, 'direct'); assert.equal(readAssignment(st).variant, 'v1');
  assert.equal(ensureAssignment('v2', st).variant, 'v1');
  const s2 = mem(); ensureAssignment('app', s2); assert.equal(s2.m.has(EXP_KEY), false);
});

test('저장소가 막혀도 예외 없음', () => {
  assert.doesNotThrow(() => track('landing_view', {}, { storage: broken, session: broken, page: 'v1' }));
  assert.doesNotThrow(() => ensureAssignment('v1', broken));
  assert.deepEqual(readEvents(broken), []);
});

test('직접 네트워크 API 대신 Google tag 어댑터, 복사본 동일', () => {
  const src = readFileSync(new URL('../shared/track.mjs', import.meta.url), 'utf8');
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(src));
  const h = s => createHash('sha256').update(s).digest('hex');
  for (const p of ['../../landing/src/track.mjs', '../../landing-v2/src/track.mjs', '../../prototype/track.mjs'])
    assert.equal(h(readFileSync(new URL(p, import.meta.url), 'utf8')), h(src), `${p}가 site/shared/track.mjs와 다름 — 복사해서 맞춰 주세요`);
});
