// SPEC-015 r0.2 F01·F02·F06(문서) — 가치 피드백 스케줄·로컬 보관 로직
import test from 'node:test';
import assert from 'node:assert/strict';
import {blankStore,createProject,confirmContext} from '../domain.mjs';
import {startLesson,moveLesson,getRun,lessonContent,answerLesson,completeLesson} from '../guided.mjs';
import {
  FEEDBACK_KEY, CATEGORIES, CHIPS, DOC_FIELDS, DAY_MS, OUTBOX_MAX, slotOccurrence, slotsUpTo, occurrences,
  loadFeedbackState, saveFeedbackState, createFeedbackState, duePrompt, markShown, closeSlot, recordValue, recordOpen,
  valueDoc, openDoc, enqueue, pruneOutbox, dequeue, valueDocId
} from '../feedback.mjs';

const T0 = Date.parse('2026-09-27T00:00:00Z');
const rnd = (() => { let i = 0; return () => (++i).toString(16).padStart(16, '0'); })();
const memory = () => { const m = new Map(); return { m, getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }; };
/** 카테고리 이벤트를 n개 가진 저장소(도메인 함수와 같은 이벤트 모양) */
const withEvents = (counts) => { const s = blankStore(); let i = 0; for (const [type, n] of Object.entries(counts)) for (let j = 0; j < n; j++) s.events.push({ id: `event-${++i}`, key: `${type}:${j}`, type }); return s; };
const EV = { idea: 'context_confirmed', learning: 'lesson_completed', evidence: 'evidence_recorded', decision: 'decision_committed' };
const add = (s, c, n = 1) => { for (let j = 0; j < n; j++) s.events.push({ id: `event-x${s.events.length}`, key: `${c}:x${s.events.length}`, type: EV[c] }); };

test('slot math: n(k)=k²+k+1 → 3,7,13,21,31,43', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(slotOccurrence), [3, 7, 13, 21, 31, 43]);
  assert.deepEqual(slotsUpTo(2), []); assert.deepEqual(slotsUpTo(3), [1]); assert.deepEqual(slotsUpTo(12), [1, 2]); assert.deepEqual(slotsUpTo(13), [1, 2, 3]);
});

test('occurrences are a read-only projection of real domain events', () => {
  const s = blankStore(); const p = createProject(s, { id: 'p', description: '팀플 동료 찾기 서비스' });
  const prep = { target: '팀플하는 대학생', artifact: '최근 팀원을 구한 경험을 물어보기', criterion: '문제가 다르면 가설 수정하기' };
  startLesson(s, p.id, 'customer'); if (getRun(p, 'customer').step === 'concept') moveLesson(s, p.id);
  if (getRun(p, 'customer').step === 'question') { const q = lessonContent('customer'); answerLesson(s, p.id, { choice: q.answer, reason: q.reason }); moveLesson(s, p.id); }
  const q = lessonContent('customer', 0, true); answerLesson(s, p.id, { choice: q.answer, reason: q.reason }); moveLesson(s, p.id); completeLesson(s, p.id, prep);
  const before = JSON.stringify(s);
  const c = occurrences(s);
  assert.equal(c.learning, 1); assert.equal(c.idea, 1, '첫 준비물 저장이 최소 가설을 확정한다');
  completeLesson(s, p.id, prep); assert.equal(occurrences(s).learning, 1, '같은 학습 재저장은 세지 않는다');
  assert.equal(JSON.stringify(s), before, '프로젝트 저장소를 바꾸지 않는다');
  confirmContext(s, p.id, { ...p.context, customer: '편입생' }); assert.equal(occurrences(s).idea, 2);
});

test('baseline: no retroactive prompts, first question at the next slot', () => {
  const s = withEvents({ lesson_completed: 5 }); const st = createFeedbackState(s, { random: rnd });
  assert.equal(st.baseline.learning, 5);
  assert.equal(duePrompt(st, s, 'learning', { now: T0 }), null, '5회 시점 도입: 3번째 슬롯은 소급하지 않는다');
  add(s, 'learning'); assert.equal(duePrompt(st, s, 'learning', { now: T0 }), null);
  add(s, 'learning'); assert.deepEqual(duePrompt(st, s, 'learning', { now: T0 }), { category: 'learning', slot: 2, occurrence: 7, missed: [] });
});

test('schedule: asks at 3 and 7, never re-asks a closed slot, other categories independent', () => {
  const s = blankStore(); const st = createFeedbackState(s, { random: rnd });
  add(s, 'learning', 2); assert.equal(duePrompt(st, s, 'learning', { now: T0 }), null);
  add(s, 'learning'); const p1 = duePrompt(st, s, 'learning', { now: T0 }); assert.equal(p1.slot, 1); assert.equal(p1.occurrence, 3);
  markShown(st, p1, { now: T0 }); recordValue(st, p1, { rating: 5, helped: ['apply', 'bogus'] }, { now: T0 });
  assert.equal(st.slots.learning[1].status, 'answered');
  add(s, 'learning'); assert.equal(duePrompt(st, s, 'learning', { now: T0 + 2 * DAY_MS }), null, '4회: 다음 슬롯 7 전');
  add(s, 'learning', 3); const p2 = duePrompt(st, s, 'learning', { now: T0 + 2 * DAY_MS }); assert.equal(p2.slot, 2);
  add(s, 'evidence', 3); assert.equal(duePrompt(st, s, 'evidence', { now: T0 + 2 * DAY_MS }).slot, 1);
  assert.equal(duePrompt(st, s, 'bogus', { now: T0 }), null);
});

test('frequency cap: one per app load and one per 24h; capped slot stays for the next visit', () => {
  const s = blankStore(); const st = createFeedbackState(s, { random: rnd });
  add(s, 'learning', 3); add(s, 'evidence', 3);
  const a = duePrompt(st, s, 'learning', { now: T0 }); markShown(st, a, { now: T0 }); recordValue(st, a, { skipped: true }, { now: T0 });
  assert.equal(st.slots.learning[1].status, 'skipped');
  assert.equal(duePrompt(st, s, 'evidence', { now: T0 + 1000, sessionPrompted: true }), null, '같은 로드');
  assert.equal(duePrompt(st, s, 'evidence', { now: T0 + DAY_MS - 1 }), null, '24시간 이내');
  assert.equal(Object.keys(st.slots.evidence).length, 0, '제한에 걸린 슬롯은 기록하지 않는다');
  assert.equal(duePrompt(st, s, 'evidence', { now: T0 + DAY_MS }).slot, 1, '24시간 뒤 같은 슬롯');
});

test('skipped-over slots close as missed; only the latest slot is asked', () => {
  const s = blankStore(); const st = createFeedbackState(s, { random: rnd });
  add(s, 'decision', 13); const p = duePrompt(st, s, 'decision', { now: T0 });
  assert.deepEqual(p, { category: 'decision', slot: 3, occurrence: 13, missed: [1, 2] });
  const missedDocs = markShown(st, p, { now: T0 });
  assert.deepEqual(missedDocs.map(d => [d.slot, d.status, d.rating]), [[1, 'missed', null], [2, 'missed', null]]);
  assert.deepEqual(Object.fromEntries(Object.entries(st.slots.decision).map(([k, v]) => [k, v.status])), { 1: 'missed', 2: 'missed', 3: 'shown' });
  assert.equal(st.outbox.length, 2);
});

test('shown but never answered becomes unanswered on next load and is queued', () => {
  const s = blankStore(); const store = memory(); const { state: st } = loadFeedbackState(store, s, { now: T0, random: rnd });
  add(s, 'idea', 3); const p = duePrompt(st, s, 'idea', { now: T0 }); markShown(st, p, { now: T0 });
  assert.ok(saveFeedbackState(store, st));
  const again = loadFeedbackState(store, s, { now: T0 + 5000 });
  assert.equal(again.fresh, false); assert.equal(again.state.slots.idea[1].status, 'unanswered');
  assert.equal(again.closed.length, 1); assert.equal(again.state.outbox[0].id, valueDocId(st, 'idea', 1));
  assert.equal(closeSlot(again.state, 'idea', 1, 'answered'), false, '닫힌 슬롯은 바꾸지 않는다');
  assert.equal(duePrompt(again.state, s, 'idea', { now: T0 + 2 * DAY_MS }), null);
});

test('load: corrupt or missing state starts fresh with current counts as baseline; storage failure is non-fatal', () => {
  const s = withEvents({ evidence_recorded: 4 }); const store = memory(); store.setItem(FEEDBACK_KEY, '{bad json');
  const r = loadFeedbackState(store, s, { now: T0, random: rnd }); assert.equal(r.fresh, true); assert.equal(r.state.baseline.evidence, 4);
  assert.match(r.state.respondent, /^[0-9a-f]{16}$/);
  const broken = { getItem() { throw Error('denied'); }, setItem() { throw Error('quota'); } };
  const b = loadFeedbackState(broken, s, { now: T0 }); assert.equal(b.fresh, true); assert.equal(saveFeedbackState(broken, b.state), false);
});

test('value document: allow-listed fields and chips, rating rules, text limit, no project data', () => {
  const s = blankStore(); createProject(s, { id: 'secret-project', description: '비밀 아이디어 원문' });
  const st = createFeedbackState(s, { random: rnd });
  const d = valueDoc(st, { category: 'learning', slot: 1, occurrence: 3, status: 'answered', rating: 2, helped: ['apply'], friction: ['long', 'long', 'x'], text: '  너무   길어요 ', view: 'session', concept: 'customer', now: T0 });
  assert.deepEqual(Object.keys(d).sort(), [...DOC_FIELDS].sort());
  assert.deepEqual(d.helped, [], '낮은 점수에는 좋았던 점을 담지 않는다'); assert.deepEqual(d.friction, ['long']); assert.equal(d.text, '너무 길어요');
  assert.equal(d.env, 'production'); assert.equal(d.clientTime, '2026-09-27T00:00:00.000Z');
  const hi = valueDoc(st, { category: 'learning', slot: 1, occurrence: 3, status: 'answered', rating: 5, helped: ['apply'], friction: ['long'], now: T0 });
  assert.deepEqual([hi.helped, hi.friction], [['apply'], []]);
  const json = JSON.stringify([d, hi]); assert.ok(!json.includes('secret-project') && !json.includes('비밀'));
  assert.throws(() => valueDoc(st, { category: 'learning', slot: 1, occurrence: 3, status: 'answered', rating: 6 }));
  assert.throws(() => valueDoc(st, { category: 'learning', slot: 1, occurrence: 3, status: 'answered', rating: 3, text: 'x'.repeat(301) }));
  assert.throws(() => valueDoc(st, { category: 'learning', slot: 1, occurrence: 3, status: 'skipped', rating: 3 }), '건너뛴 응답에는 점수가 없다');
  assert.equal(valueDoc(st, { category: 'idea', slot: 1, occurrence: 3, status: 'answered', rating: 4, view: 'Bad View!' }).view, null);
  for (const c of CATEGORIES) { assert.ok(Object.keys(CHIPS[c].helped).length >= 3); assert.ok(Object.keys(CHIPS[c].friction).length >= 3); }
});

test('open feedback: type and length validation, optional context, draft cleared', () => {
  const st = createFeedbackState(blankStore(), { random: rnd }); st.openDraft = { text: '작성 중' };
  assert.throws(() => openDoc(st, { openType: 'nope', text: '충분히 긴 의견' }));
  assert.throws(() => openDoc(st, { openType: 'bug', text: '짧음' }));
  assert.throws(() => openDoc(st, { openType: 'bug', text: 'x'.repeat(1001) }));
  const d = recordOpen(st, { openType: 'idea', text: '목표일 알림이 있으면 좋겠어요', view: 'dashboard', category: 'learning', concept: 'market' }, { now: T0, random: rnd });
  assert.equal(d.kind, 'open'); assert.equal(d.view, 'dashboard'); assert.equal(d.status, null); assert.equal(st.openDraft, null);
  const noCtx = openDoc(st, { openType: 'helpful', text: '정리가 잘 돼요', view: 'dashboard', category: 'learning', withContext: false });
  assert.deepEqual([noCtx.view, noCtx.category, noCtx.concept], [null, null, null]);
  assert.ok(st.outbox[0].id.startsWith(`${st.respondent}_open_`));
});

test('outbox: no duplicate ids, 50 max keeps newest, 30-day expiry, dequeue', () => {
  const st = createFeedbackState(blankStore(), { random: rnd }); const doc = { kind: 'open' };
  assert.equal(enqueue(st, 'a', doc, T0), true); assert.equal(enqueue(st, 'a', doc, T0), false);
  for (let i = 0; i < 60; i++) enqueue(st, `b${i}`, doc, T0 + i);
  assert.equal(st.outbox.length, OUTBOX_MAX); assert.equal(st.outbox.at(-1).id, 'b59'); assert.ok(!st.outbox.some(x => x.id === 'a'));
  pruneOutbox(st, T0 + 31 * DAY_MS); assert.equal(st.outbox.length, 0);
  enqueue(st, 'c', doc, T0); assert.equal(dequeue(st, 'c'), true); assert.equal(dequeue(st, 'c'), false);
});

test('recordValue: rating-only answer is confirmed; second record of same slot is ignored', () => {
  const s = blankStore(); const st = createFeedbackState(s, { random: rnd }); add(s, 'evidence', 3);
  const p = duePrompt(st, s, 'evidence', { now: T0 }); markShown(st, p, { now: T0 });
  const d = recordValue(st, p, { rating: 3 }, { now: T0 });
  assert.deepEqual([d.status, d.rating, d.helped, d.friction, d.text], ['answered', 3, [], [], '']);
  assert.equal(recordValue(st, p, { rating: 1 }, { now: T0 }), null); assert.equal(st.outbox.length, 1);
});
