// AC-L3-02 상태 모델: v2 규칙 동일 + 예시 값은 다 쓴 기록 + rootState
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, deriveCard, rootState, pathOrder, serialize, deserialize, CHAPTERS } from '../src/state.mjs';
import { SAMPLES, SLOTS, LESSON, SITE } from '../src/content.mjs';

const run = (...actions) => actions.reduce(reduce, initialState());
const full = [
  { type: 'SET_IDEA', text: '내 아이디어', source: 'mine' },
  { type: 'ANSWER', choice: LESSON.variants[0].answer },
  { type: 'SET_CUSTOMER', text: '동네 직장인' }, { type: 'SAVE_QUESTIONS' },
  { type: 'OBSERVE', result: 'supported' }, { type: 'DECIDE', key: 'keep' }
];

test('기본 상태: 0/5, 빈 칸 없이 모두 다 쓴 예시 기록 (DP-12)', () => {
  const c = deriveCard(initialState());
  assert.equal(c.filled, 0);
  assert.ok(c.slots.every(s => s.status === 'example'));
  assert.ok(c.slots.every(s => typeof s.value === 'string' && s.value.length >= 8), '안내문이 아닌 문장');
  assert.equal(c.slots[0].value, SAMPLES[0].idea);
  assert.equal(c.slots[2].value, `${SAMPLES[0].customer}에게 지난 행동 묻기`);
  for (const i of [1, 3, 4]) assert.equal(c.slots[i].value, SLOTS[i].example);
  assert.deepEqual(CHAPTERS, ['surface', 'learn', 'ask', 'observe', 'decide']);
});

test('예시 기록 문장에 빈 안내 표현 없음', () => {
  for (const s of SLOTS) assert.ok(!/비어|적어 주세요|입력하세요|아직/.test(s.example), s.key);
});

test('방문자 행동은 내 기록으로, 공백 정리', () => {
  const s = run({ type: 'SET_IDEA', text: '  내   아이디어  ', source: 'mine' });
  assert.equal(s.idea.text, '내 아이디어');
  assert.equal(deriveCard(s).slots[0].status, 'mine');
});

test('빈 문장·잘못된 액션·중복 액션은 상태를 바꾸지 않음, 길이 제한', () => {
  const s = initialState();
  assert.equal(reduce(s, { type: 'SET_IDEA', text: '   ' }), s);
  assert.equal(reduce(s, { type: 'NOPE' }), s);
  assert.equal(reduce(s, { type: 'OBSERVE', result: 'maybe' }), s);
  assert.equal(reduce(s, { type: 'DECIDE', key: 'keep' }), s, '관찰 전 결정 불가');
  assert.equal(reduce(s, { type: 'REACH', chapter: 'nope' }), s);
  const saved = reduce(s, { type: 'SAVE_QUESTIONS' });
  assert.equal(reduce(saved, { type: 'SAVE_QUESTIONS' }), saved);
  const obs = reduce(s, { type: 'OBSERVE', result: 'refuted' });
  assert.equal(reduce(obs, { type: 'OBSERVE', result: 'refuted' }), obs);
  assert.equal(reduce(s, { type: 'SET_IDEA', text: 'a'.repeat(500), source: 'mine' }).idea.text.length, SITE.limits.idea);
  assert.equal(reduce(s, { type: 'SET_CUSTOMER', text: 'b'.repeat(500) }).ask.customer.length, SITE.limits.customer);
});

test('샘플 선택: 고객 기본값도 샘플, 단 직접 쓴 고객은 유지', () => {
  const s = run({ type: 'SET_IDEA', text: SAMPLES[1].idea, source: 'example', sample: 'banchan' });
  assert.equal(s.ask.customer, SAMPLES[1].customer);
  assert.equal(deriveCard(s).slots[0].status, 'example');
  assert.equal(deriveCard(s).slots[2].value, `${SAMPLES[1].customer}에게 지난 행동 묻기`);
  const s2 = run({ type: 'SET_CUSTOMER', text: '내 고객' }, { type: 'SET_IDEA', text: SAMPLES[2].idea, source: 'example', sample: 'plant' });
  assert.equal(s2.ask.customer, '내 고객');
  assert.equal(deriveCard(s2).slots[2].value, SLOTS[2].example, '저장 전 직접 쓴 고객은 예시 문장 대신 기본 예시');
});

test('퀴즈: 한 번에 정답 / 오답 후 다른 문항 정답 / 두 번 오답이어도 막히지 않음 / 중복 보상 없음', () => {
  const v0 = LESSON.variants[0], v1 = LESSON.variants[1];
  assert.equal(run({ type: 'ANSWER', choice: v0.answer }).learn.result, 'first');
  const wrong0 = (v0.answer + 1) % v0.options.length, wrong1 = (v1.answer + 1) % v1.options.length;
  const r = run({ type: 'ANSWER', choice: wrong0 });
  assert.equal(r.learn.variant, 1); assert.equal(r.learn.result, null);
  assert.equal(reduce(r, { type: 'ANSWER', choice: v1.answer }).learn.result, 'retry');
  const h = run({ type: 'ANSWER', choice: wrong0 }, { type: 'ANSWER', choice: wrong1 });
  assert.equal(h.learn.result, 'helped');
  assert.equal(deriveCard(h).slots[1].status, 'mine');
  assert.equal(reduce(h, { type: 'ANSWER', choice: v1.answer }), h);
});

test('관찰 반박: 기록 플래그, 뿌리 방향 전환, 경로에서 전략이 2번째, 결과 변경 시 결정 초기화', () => {
  const s = run({ type: 'OBSERVE', result: 'refuted' }, { type: 'DECIDE', key: 'reframe' });
  assert.equal(deriveCard(s).slots[3].flag, 'refuted');
  assert.equal(rootState(s).turned, true);
  assert.equal(rootState(initialState()).turned, false);
  const p = pathOrder(s);
  assert.equal(p.current, 'customer'); assert.equal(p.next, 'strategy'); assert.equal(p.order.length, 7);
  assert.equal(pathOrder(initialState()).next, 'product');
  assert.equal(reduce(s, { type: 'OBSERVE', result: 'supported' }).decision, null);
  assert.equal(reduce(s, { type: 'DECIDE', key: 'keep' }), s, '다른 결과의 선택지는 거부');
});

test('rootState: 층별 실선/점선, 연속 깊이, 채운 층 수', () => {
  const r0 = rootState(initialState());
  assert.deepEqual(r0.layers.map(l => l.key), ['learn', 'ask', 'observe', 'decide']);
  assert.ok(r0.layers.every(l => l.status === 'example'));
  assert.equal(r0.depth, 0); assert.equal(r0.mine, 0);
  const skip = run({ type: 'SAVE_QUESTIONS' });
  assert.equal(rootState(skip).depth, 0, '겉흙을 건너뛰면 연속 깊이는 0');
  assert.equal(rootState(skip).mine, 1);
  const r = rootState(run(...full));
  assert.equal(r.depth, 4); assert.equal(r.mine, 4); assert.equal(r.idea, 'mine');
});

test('전체 흐름 → 5/5 완성, RESET', () => {
  const s = run(...full);
  const c = deriveCard(s);
  assert.equal(c.filled, 5); assert.equal(c.complete, true); assert.equal(c.grow, 1);
  assert.match(c.slots[2].value, /동네 직장인/);
  assert.equal(deriveCard(reduce(s, { type: 'RESET' })).filled, 0);
});

test('직렬화 복원, 손상·다른 버전 데이터는 기본값, 알 수 없는 값 제거', () => {
  const s = run({ type: 'SET_IDEA', text: '복원 테스트', source: 'mine' }, { type: 'REACH', chapter: 'learn' }, { type: 'OBSERVE', result: 'refuted' }, { type: 'DECIDE', key: 'narrow' });
  assert.deepEqual(deserialize(serialize(s)), s);
  assert.deepEqual(deserialize('{broken'), initialState());
  assert.deepEqual(deserialize(JSON.stringify({ v: 9 })), initialState());
  const bad = JSON.parse(serialize(s));
  bad.reached.push('<script>'); bad.idea.text = 'x'.repeat(999); bad.observe = 'maybe'; bad.decision = 'keep'; bad.ask.saved = 'yes';
  const d = deserialize(JSON.stringify(bad));
  assert.ok(!d.reached.includes('<script>')); assert.equal(d.idea.text.length, SITE.limits.idea);
  assert.equal(d.observe, null); assert.equal(d.decision, null); assert.equal(d.ask.saved, false);
});
