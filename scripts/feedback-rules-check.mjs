// SPEC-015 F07 실측 — 게시된 firestore.rules가 "생성만 허용"인지 실제 Firestore에 요청해 확인한다.
// 사용: node scripts/feedback-rules-check.mjs [projectId apiKey]   (생략하면 prototype/feedback-send.mjs의 FIREBASE_CONFIG)
// qa 문서(env='qa')를 1건 만든다. 규칙상 지울 수 없으므로 분석 때 env='qa'를 제외한다(SPEC-015 §7).
import { FIREBASE_CONFIG, createUrl, toFields, configured } from '../prototype/feedback-send.mjs';
import { createFeedbackState, valueDoc } from '../prototype/feedback.mjs';

const [pid, key] = process.argv.slice(2);
const cfg = pid && key ? { projectId: pid, apiKey: key } : FIREBASE_CONFIG;
if (!configured(cfg)) { console.log('SKIP: projectId·apiKey가 없어요. prototype/feedback-send.mjs FIREBASE_CONFIG를 채우거나 인자로 넘겨 주세요.'); process.exit(0); }

const hex = () => [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
const st = createFeedbackState({ events: [] }, { random: hex });
const doc = valueDoc(st, { category: 'learning', slot: 1, occurrence: 3, status: 'answered', rating: 5, helped: ['apply'], text: '규칙 실측 문서(qa)', env: 'qa' });
const id = `${st.respondent}_learning_1`;
const base = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/feedback`;
const q = `key=${encodeURIComponent(cfg.apiKey)}`;
const post = (docId, d) => fetch(createUrl(docId, cfg), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fields: toFields(d) }) });
const results = [];
async function expect(name, promise, want) {
  let status; try { status = (await promise).status; } catch (e) { status = `오류 ${e.message}`; }
  const ok = Array.isArray(want) ? want.includes(status) : status === want;
  results.push({ ok, name, status, want }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  → ${status} (기대 ${want})`);
}

await expect('올바른 qa 문서 생성', post(id, doc), 200);
await expect('같은 ID 다시 생성 → 이미 있음', post(id, doc), 409);
await expect('문서 읽기 거부', fetch(`${base}/${id}?${q}`), 403);
await expect('목록 읽기 거부', fetch(`${base}?${q}`), 403);
await expect('수정 거부', fetch(`${base}/${id}?${q}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fields: toFields({ ...doc, rating: 1 }) }) }), 403);
await expect('삭제 거부', fetch(`${base}/${id}?${q}`, { method: 'DELETE' }), 403);
await expect('허용되지 않은 필드 거부', post(`${st.respondent}_bad_1`, { ...doc, projectName: '비밀' }), 403);
await expect('점수 범위 밖 거부', post(`${st.respondent}_bad_2`, { ...doc, rating: 9 }), 403);
await expect('의견 5자 미만 거부', post(`${st.respondent}_bad_3`, { ...doc, kind: 'open', category: null, slot: null, occurrence: null, status: null, rating: null, helped: [], openType: 'bug', text: '짧음' }), 403);
await expect('다른 컬렉션 쓰기 거부', fetch(`https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/other?documentId=x&${q}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"fields":{}}' }), 403);

const passed = results.filter(r => r.ok).length;
console.log(`\n${passed}/${results.length} passed · 생성된 qa 문서 ID: ${id}`);
process.exitCode = passed === results.length ? 0 : 1;
