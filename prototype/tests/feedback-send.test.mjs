// SPEC-015 r0.4 F06·F07·F08 — 전송 어댑터(모의 fetch), 보안 규칙↔문서 계약 일치, GA 허용 속성
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { blankStore } from '../domain.mjs';
import { createFeedbackState, valueDoc, openDoc, enqueue, DOC_FIELDS, CHIPS, CATEGORIES, CONCEPTS, OPEN_TYPES, TEXT_MAX, OPEN_MIN } from '../feedback.mjs';
import { configured, sendAllowed, toValue, toFields, createUrl, sendOne, flushOutbox, MAX_TRIES, FEEDBACK_HOST } from '../feedback-send.mjs';
import { analyticsPayload } from '../track.mjs';

const CFG = { projectId: 'vencubator-test', apiKey: 'AIzaSyTESTKEY_1234567890abcd' };
const T0 = Date.parse('2026-09-27T00:00:00Z');
const win = (url, { session = {}, dnt } = {}) => { const u = new URL(url); return { location: { protocol: u.protocol, hostname: u.hostname, search: u.search }, sessionStorage: { getItem: k => session[k] ?? null }, navigator: { doNotTrack: dnt } }; };
const PROD = win(`https://${FEEDBACK_HOST}/app/`);
function queued(n = 3) {
  const st = createFeedbackState(blankStore(), { random: () => 'a1b2c3d4e5f60718' });
  for (let i = 1; i <= n; i++) enqueue(st, `${st.respondent}_learning_${i}`, valueDoc(st, { category: 'learning', slot: i, occurrence: i * i + i + 1, status: 'answered', rating: 4, helped: ['apply'], now: T0 }), T0);
  return st;
}
const fakeFetch = statuses => { const calls = []; const f = async (url, init) => { calls.push({ url, init }); const s = statuses[calls.length - 1] ?? 200; if (s === 'throw') throw Error('offline'); return { ok: s >= 200 && s < 300, status: s }; }; f.calls = calls; return f; };

test('config and host gate: production host only, internal/lab excluded, DNT does not block explicit feedback', () => {
  assert.equal(configured({ projectId: '', apiKey: '' }), false); assert.equal(configured(CFG), true);
  assert.equal(sendAllowed(PROD), true);
  assert.equal(sendAllowed(win(`https://${FEEDBACK_HOST}/app/`, { dnt: '1' })), true);
  for (const u of ['http://127.0.0.1:4183/', `http://${FEEDBACK_HOST}/app/`, 'https://vencubator-git-x.vercel.app/app/', `https://${FEEDBACK_HOST}/app/?lab=1`, `https://${FEEDBACK_HOST}/app/?internal=1`]) assert.equal(sendAllowed(win(u)), false, u);
  assert.equal(sendAllowed(win(`https://${FEEDBACK_HOST}/app/`, { session: { 'vencubator.analytics.internal': '1' } })), false);
  assert.equal(sendAllowed(undefined), false);
});

test('Firestore REST encoding: typed values and document URL', () => {
  assert.deepEqual(toValue(null), { nullValue: null }); assert.deepEqual(toValue(3), { integerValue: '3' });
  assert.deepEqual(toValue(['a']), { arrayValue: { values: [{ stringValue: 'a' }] } }); assert.deepEqual(toValue(true), { booleanValue: true });
  const st = queued(1), f = toFields(st.outbox[0].doc);
  assert.deepEqual(Object.keys(f).sort(), [...DOC_FIELDS].sort());
  assert.deepEqual(f.rating, { integerValue: '4' }); assert.deepEqual(f.status, { stringValue: 'answered' }); assert.deepEqual(f.openType, { nullValue: null });
  const url = createUrl('abc_learning_1', CFG);
  assert.equal(url, 'https://firestore.googleapis.com/v1/projects/vencubator-test/databases/(default)/documents/feedback?documentId=abc_learning_1&key=AIzaSyTESTKEY_1234567890abcd');
});

test('flush: nothing is requested without config or outside production', async () => {
  const st = queued(2), f = fakeFetch([]);
  assert.equal((await flushOutbox(st, { fetchImpl: f, cfg: { projectId: '', apiKey: '' }, allowed: true })).skipped, true);
  assert.equal((await flushOutbox(st, { fetchImpl: f, cfg: CFG, win: win('http://127.0.0.1:4183/') })).skipped, true);
  assert.equal(f.calls.length, 0); assert.equal(st.outbox.length, 2);
});

test('flush: 200 and 409 remove, POST body carries fields, order kept', async () => {
  const st = queued(3), f = fakeFetch([200, 409, 200]);
  const r = await flushOutbox(st, { fetchImpl: f, cfg: CFG, allowed: true });
  assert.deepEqual([r.sent, r.left], [3, 0]); assert.equal(f.calls.length, 3);
  assert.ok(f.calls[0].url.includes('documentId=a1b2c3d4e5f60718_learning_1'));
  assert.equal(f.calls[0].init.method, 'POST'); assert.equal(JSON.parse(f.calls[0].init.body).fields.slot.integerValue, '1');
});

test('flush: rules rejection drops after 3 tries; server error/network stops the round and retries up to 5', async () => {
  const st = queued(2);
  for (let i = 1; i <= MAX_TRIES.rejected; i++) { const r = await flushOutbox(st, { fetchImpl: fakeFetch([403, 500]), cfg: CFG, allowed: true }); if (i < MAX_TRIES.rejected) assert.equal(st.outbox[0].tries, i); else assert.equal(r.dropped, 1); }
  assert.equal(st.outbox.length, 1);
  const net = fakeFetch(['throw', 200]); await flushOutbox(st, { fetchImpl: net, cfg: CFG, allowed: true });
  assert.equal(net.calls.length, 1, '네트워크 오류면 이번 차례 중단');
  assert.ok(st.outbox[0].tries >= 1);
  while (st.outbox.length) await flushOutbox(st, { fetchImpl: fakeFetch([503]), cfg: CFG, allowed: true });
  assert.equal(st.outbox.length, 0, '일시 오류도 5번 넘으면 제거');
  assert.equal(await sendOne({ id: 'x', doc: {} }, { fetchImpl: fakeFetch([404]), cfg: CFG }), 'rejected');
});

test('flush: concurrent calls share one run (no duplicate POST)', async () => {
  const st = queued(1), f = fakeFetch([200]);
  const [a, b] = [flushOutbox(st, { fetchImpl: f, cfg: CFG, allowed: true }), flushOutbox(st, { fetchImpl: f, cfg: CFG, allowed: true })];
  assert.equal(a, b); await a; assert.equal(f.calls.length, 1);
});

test('security rules contract matches feedback.mjs (fields, enums, chips, limits) and denies everything else', () => {
  const rules = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
  const listIn = name => { const m = new RegExp(`function ${name}\\(\\) \\{\\s*return \\[([^\\]]*)\\]`).exec(rules); return m[1].match(/'([^']+)'/g).map(x => x.slice(1, -1)); };
  assert.deepEqual(listIn('fields').sort(), [...DOC_FIELDS].sort());
  const chipIds = new Set(CATEGORIES.flatMap(c => [...Object.keys(CHIPS[c].helped), ...Object.keys(CHIPS[c].friction)]));
  assert.deepEqual(new Set(listIn('chipIds')), chipIds);
  const has = s => assert.ok(rules.includes(s), s);
  has(`optIn(d.category, [${CATEGORIES.map(c => `'${c}'`).join(', ')}])`);
  has(`optIn(d.openType, [${Object.keys(OPEN_TYPES).map(c => `'${c}'`).join(', ')}])`);
  has(`optIn(d.concept, [${CONCEPTS.map(c => `'${c}'`).join(', ')}])`);
  has(`d.text.size() <= ${TEXT_MAX.open}`); has(`d.text.size() <= ${TEXT_MAX.value}`); has(`d.text.size() >= ${OPEN_MIN}`);
  has("allow read, update, delete: if false;"); has('match /{document=**} {\n      allow read, write: if false;');
  has("d.env in ['production', 'qa']");
  // 앱이 만드는 문서는 모두 허용 필드만 가진다
  const st = createFeedbackState(blankStore(), { random: () => 'a1b2c3d4e5f60718' });
  for (const d of [valueDoc(st, { category: 'decision', slot: 2, occurrence: 7, status: 'missed' }), openDoc(st, { openType: 'bug', text: '버튼이 안 눌려요' })]) assert.deepEqual(Object.keys(d).sort(), [...DOC_FIELDS].sort());
});

test('GA feedback events: only enums/integers, never free text or chips', () => {
  const p = (name, props) => analyticsPayload({ name, page: 'app', props });
  assert.deepEqual([p('feedback_answer', { category: 'learning', slot: 2, rating: 4, text: '비밀', helped: 'apply' })].map(({ category, slot, rating, text, helped }) => ({ category, slot, rating, text, helped })), [{ category: 'learning', slot: 2, rating: 4, text: undefined, helped: undefined }]);
  assert.equal(p('feedback_answer', { category: 'learning', slot: 2, rating: 9 }).rating, undefined);
  assert.equal(p('feedback_prompt', { category: 'nope', slot: 0 }).category, undefined);
  assert.equal(p('feedback_prompt', { category: 'nope', slot: 0 }).slot, undefined);
  assert.equal(p('feedback_open', { open_type: 'friction' }).open_type, 'friction');
  assert.equal(p('feedback_skip', { category: 'idea', slot: 1 }).slot, 1);
});
