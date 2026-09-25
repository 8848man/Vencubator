// AC-LP03: 모션 수식
import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, smooth, sectionProgress, heroFrame, typeFrame, bridgeFrame, storyFrame, focusValue, navIndex, stickyVisible, inRanges } from '../src/motion.mjs';

const steps = n => Array.from({ length: n + 1 }, (_, i) => i / n);

test('clamp/smooth 경계와 단조성', () => {
  assert.equal(clamp(-1), 0); assert.equal(clamp(2), 1);
  assert.equal(smooth(0), 0); assert.equal(smooth(1), 1); assert.equal(smooth(.5), .5);
  let prev = -1; for (const v of steps(50)) { const s = smooth(v); assert.ok(s >= prev); prev = s; }
});

test('sectionProgress: 시작 전 0, 끝 이후 1, 높이=뷰포트여도 NaN 없음', () => {
  assert.equal(sectionProgress(0, 1000, 3000, 900), 0);
  assert.equal(sectionProgress(9999, 1000, 3000, 900), 1);
  assert.ok(Number.isFinite(sectionProgress(1000, 1000, 900, 900)));
});

test('LM-02 hero: p=0 기본 상태, p=1 보조 요소 숨김·비활성', () => {
  const a = heroFrame(0), b = heroFrame(1);
  assert.equal(a.one.opacity, 1); assert.equal(a.support.opacity, 1); assert.ok(a.support.interactive);
  assert.ok(b.one.scale < 1 && b.two.scale > a.two.scale);
  assert.equal(b.support.opacity, 0); assert.equal(b.support.interactive, false);
  assert.ok(b.media.radius >= 8);
});

test('LM-03 type story: 각 구간에 가장 잘 보이는 문장이 순서대로 바뀌고 새싹은 단조 증가', () => {
  const top = p => { const f = typeFrame(p); return f.lines.map(l => l.opacity).indexOf(Math.max(...f.lines.map(l => l.opacity))); };
  assert.equal(top(0.05), 0); assert.equal(top(0.45), 1); assert.equal(top(0.95), 2);
  assert.deepEqual([0.1, 0.5, 0.9].map(p => typeFrame(p).index), [1, 2, 3]);
  let g = -1; for (const p of steps(40)) { const v = typeFrame(p).grow; assert.ok(v >= g); g = v; }
  assert.equal(typeFrame(0).grow, 0); assert.equal(typeFrame(1).grow, 1);
  for (const p of steps(40)) for (const l of typeFrame(p).lines) assert.ok(l.opacity >= 0 && l.opacity <= 1);
});

test('LM-06 bridge: to 숫자는 도착하고 from은 물러남', () => {
  const a = bridgeFrame(0), b = bridgeFrame(1);
  assert.ok(b.to.scale === 1 && b.to.opacity === 1 && b.arrow.rotate === 0);
  assert.ok(b.from.opacity < a.from.opacity && b.from.scale < a.from.scale);
});

test('LM-07 story: 프레임 인덱스, 전환점 .56, 끝점에서 단일 활성', () => {
  const n = 5;
  assert.equal(storyFrame(0, n).shown, 0);
  assert.equal(storyFrame(1, n).shown, 4);
  assert.equal(storyFrame((0 + 0.5) / 4, n).shown, 0);
  assert.equal(storyFrame((0 + 0.6) / 4, n).shown, 1);
  assert.equal(storyFrame(0.5, n).shown, 2);
  const end = storyFrame(1, n).frames;
  assert.equal(end.filter(f => f.panel === 1).length, 1);
  // 프레임 정지 구간(local < .28): 현재 프레임 완전 표시, 다음 프레임 숨김
  const hold = storyFrame(0.2 / 4, n).frames;
  assert.equal(hold[0].panel, 1); assert.equal(hold[0].detail, 1); assert.equal(hold[1].panel, 0);
  for (const p of steps(80)) for (const f of storyFrame(p, n).frames) { assert.ok(f.panel >= 0 && f.panel <= 1); assert.ok(f.blur >= 0); }
});

test('LM-08 focus: 기준선에서 1, 멀어지면 0', () => {
  assert.equal(focusValue(540, 1000), 1);
  assert.equal(focusValue(-2000, 1000), 0);
  assert.ok(focusValue(700, 1000) < 1);
});

test('LM-01 navIndex / LM-09 stickyVisible', () => {
  assert.equal(navIndex([100, 500, 900], 50), -1);
  assert.equal(navIndex([100, 500, 900], 600), 1);
  assert.equal(stickyVisible(100, 800, 5000, 900), false);
  assert.equal(stickyVisible(1000, 800, 5000, 900), true);
  assert.equal(stickyVisible(1000, 800, 500, 900), false);
  assert.equal(stickyVisible(1000, 800, 5000, 900, true), false);
  assert.equal(inRanges(1500, [[1000, 2000]]), true);
  assert.equal(inRanges(2500, [[1000, 2000]]), false);
});
