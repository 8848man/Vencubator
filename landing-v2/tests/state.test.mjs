// AC-L2-02 상태 모델
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, deriveCard, pathOrder, serialize, deserialize } from '../src/state.mjs';
import { SAMPLES, LESSON, SITE } from '../src/content.mjs';

const run = (...actions) => actions.reduce(reduce, initialState());

test('기본 상태: 예시 아이디어, 0/5, 빈 칸', () => {
  const c = deriveCard(initialState());
  assert.equal(c.filled, 0);
  assert.equal(c.slots[0].status, 'example');
  assert.deepEqual(c.slots.slice(1).map(s => s.status), ['empty', 'empty', 'empty', 'empty']);
});

test('도달한 챕터는 예시로, 방문자 행동은 내 것으로 구분', () => {
  const s = run({ type: 'REACH', chapter: 'learn' });
  assert.equal(deriveCard(s).slots[1].status, 'example');
  const s2 = reduce(s, { type: 'SET_IDEA', text: '  내   아이디어  ', source: 'mine' });
  assert.equal(s2.idea.text, '내 아이디어');
  assert.equal(deriveCard(s2).slots[0].status, 'mine');
});

test('빈 문장·잘못된 액션은 상태를 바꾸지 않음, 길이 제한', () => {
  const s = initialState();
  assert.equal(reduce(s, { type: 'SET_IDEA', text: '   ' }), s);
  assert.equal(reduce(s, { type: 'NOPE' }), s);
  assert.equal(reduce(s, { type: 'OBSERVE', result: 'maybe' }), s);
  assert.equal(reduce(s, { type: 'DECIDE', key: 'keep' }), s, '관찰 전 결정 불가');
  assert.equal(reduce(s, { type: 'SET_IDEA', text: 'a'.repeat(500), source: 'mine' }).idea.text.length, SITE.limits.idea);
  assert.equal(reduce(s, { type: 'SET_CUSTOMER', text: 'b'.repeat(500) }).apply.customer.length, SITE.limits.customer);
});

test('샘플 선택: 고객 기본값도 샘플, 단 직접 쓴 고객은 유지', () => {
  const s = run({ type: 'SET_IDEA', text: SAMPLES[1].idea, source: 'example', sample: 'banchan' });
  assert.equal(s.apply.customer, SAMPLES[1].customer);
  assert.equal(deriveCard(s).slots[0].status, 'example');
  const s2 = run({ type: 'SET_CUSTOMER', text: '내 고객' }, { type: 'SET_IDEA', text: SAMPLES[2].idea, source: 'example', sample: 'plant' });
  assert.equal(s2.apply.customer, '내 고객');
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

test('관찰 반박: 카드 플래그, 경로에서 전략이 2번째, 결과 변경 시 결정 초기화', () => {
  const s = run({ type: 'OBSERVE', result: 'refuted' }, { type: 'DECIDE', key: 'reframe' });
  assert.equal(deriveCard(s).slots[3].flag, 'refuted');
  const p = pathOrder(s);
  assert.equal(p.current, 'customer'); assert.equal(p.next, 'strategy'); assert.equal(p.order.length, 7);
  assert.equal(pathOrder(initialState()).next, 'product');
  assert.equal(s.decision, 'reframe');
  assert.equal(reduce(s, { type: 'OBSERVE', result: 'supported' }).decision, null);
  assert.equal(reduce(s, { type: 'DECIDE', key: 'keep' }), s, '다른 결과의 선택지는 거부');
});

test('전체 흐름 → 5/5 완성, RESET', () => {
  const s = run(
    { type: 'SET_IDEA', text: '내 아이디어', source: 'mine' },
    { type: 'ANSWER', choice: LESSON.variants[0].answer },
    { type: 'SET_CUSTOMER', text: '동네 직장인' }, { type: 'SAVE_QUESTIONS' },
    { type: 'OBSERVE', result: 'supported' }, { type: 'DECIDE', key: 'keep' });
  const c = deriveCard(s);
  assert.equal(c.filled, 5); assert.equal(c.complete, true); assert.equal(c.grow, 1);
  assert.match(c.slots[2].value, /동네 직장인/);
  assert.equal(deriveCard(reduce(s, { type: 'RESET' })).filled, 0);
});

test('직렬화 복원, 손상·다른 버전 데이터는 기본값, 알 수 없는 챕터 제거', () => {
  const s = run({ type: 'SET_IDEA', text: '복원 테스트', source: 'mine' }, { type: 'REACH', chapter: 'learn' });
  assert.deepEqual(deserialize(serialize(s)), s);
  assert.deepEqual(deserialize('{broken'), initialState());
  assert.deepEqual(deserialize(JSON.stringify({ v: 9 })), initialState());
  const bad = JSON.parse(serialize(s)); bad.reached.push('<script>'); bad.idea.text = 'x'.repeat(999);
  const d = deserialize(JSON.stringify(bad));
  assert.ok(!d.reached.includes('<script>')); assert.equal(d.idea.text.length, SITE.limits.idea);
});
