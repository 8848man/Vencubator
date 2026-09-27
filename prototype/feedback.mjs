// SPEC-015 r0.2 — 가치 순간 피드백: 스케줄·로컬 보관·전송 문서. 화면(W03)과 실제 전송(W04)은 별도 모듈.
// 프로젝트 저장소(vencubator.prototype.v1)는 읽기만 한다. 피드백 상태는 별도 키에 둔다(ADR-006).

export const FEEDBACK_KEY = 'vencubator.feedback.v1';
export const FEEDBACK_VERSION = 1;
export const APP_VERSION = 'feedback-1';
export const CATEGORIES = ['idea', 'learning', 'evidence', 'decision'];
export const EVENT_OF = { idea: 'context_confirmed', learning: 'lesson_completed', evidence: 'evidence_recorded', decision: 'decision_committed' };
export const CONCEPTS = ['customer', 'market', 'product', 'gtm', 'finance', 'operations', 'strategy'];
export const OPEN_TYPES = { helpful: '도움이 됐어요', friction: '불편해요', idea: '제안', bug: '오류' };
export const DAY_MS = 24 * 60 * 60 * 1000;
export const OUTBOX_MAX = 50, OUTBOX_DAYS = 30;
export const TEXT_MAX = { value: 300, open: 1000 }, OPEN_MIN = 5;

// ── 확정 문구 (SPEC-015 §4·§5·§8) ──
export const QUESTIONS = {
  idea: '아이디어를 정리하는 과정이 도움이 됐나요?',
  learning: '이번 작은 배움이 내 아이디어에 도움이 됐나요?',
  evidence: '실행 결과를 기록하면서 생각이 정리됐나요?',
  decision: '근거를 보고 방향을 정하는 데 도움이 됐나요?'
};
export const SCALE = ['전혀 아니에요', '조금 아쉬워요', '보통이에요', '도움이 됐어요', '아주 도움이 됐어요'];
export const COPY = {
  kicker: '잠깐, 한 가지만 물어볼게요',
  helpedTitle: '어떤 점이 좋았나요?', frictionTitle: '어떤 점이 아쉬웠나요?',
  textPlaceholder: '한 줄로 더 알려주셔도 좋아요 (선택)',
  privacy: '이름·연락처 같은 개인정보는 적지 말아 주세요. 보내주신 의견은 서비스 개선에만 쓰고 1년 동안 보관해요.',
  thanks: '고마워요! 다음 배움을 더 좋게 만드는 데 쓸게요.',
  openTitle: '의견 보내기', openLead: '좋았던 점도, 불편했던 점도 편하게 들려주세요.'
};
export const CHIPS = {
  idea: {
    helped: { clear: '생각이 정리됐어요', split: '고객과 문제가 구분됐어요', start: '무엇부터 할지 보였어요' },
    friction: { many: '질문이 많았어요', mismatch: '요약이 내 생각과 달라요', unsure: '무엇을 적을지 몰랐어요' }
  },
  learning: {
    helped: { concept: '개념 설명이 쉬웠어요', quiz: '문제와 해설이 좋았어요', apply: '내 프로젝트에 바로 적용됐어요', short: '짧아서 부담 없었어요' },
    friction: { long: '조금 길었어요', hard: '어려웠어요', mismatch: '내 상황과 잘 안 맞았어요', next: '다음에 할 일이 흐릿해요' }
  },
  evidence: {
    helped: { organize: '질문 덕분에 생각이 정리됐어요', interpret: '결과를 해석하게 됐어요', hint: '다음 방향이 보였어요' },
    friction: { input: '입력할 게 많았어요', unsure: '무엇을 적을지 몰랐어요', value: '기록이 어디에 쓰일지 모르겠어요' }
  },
  decision: {
    helped: { overview: '근거를 한눈에 봤어요', options: '선택지가 분명했어요', record: '결정이 기록으로 남았어요' },
    friction: { options: '선택지가 잘 안 맞았어요', evidence: '근거가 부족했어요', burden: '결정이 부담됐어요' }
  }
};

// ── 슬롯 수학: n(k) = k² + k + 1 → 3, 7, 13, 21, 31 … ──
export const slotOccurrence = k => k * k + k + 1;
/** n 이하의 슬롯 번호 목록(1부터) */
export function slotsUpTo(n) { const out = []; for (let k = 1; slotOccurrence(k) <= n; k++) out.push(k); return out; }

/** 도메인 이벤트에서 카테고리별 가치 발생 횟수를 센다(읽기 전용 projection). */
export function occurrences(store) {
  const counts = Object.fromEntries(CATEGORIES.map(c => [c, 0]));
  const byType = Object.fromEntries(CATEGORIES.map(c => [EVENT_OF[c], c]));
  for (const e of store?.events || []) { const c = byType[e?.type]; if (c) counts[c]++; }
  return counts;
}

function randomId(random) {
  if (random) return random();
  const c = globalThis.crypto;
  if (c?.getRandomValues) return [...c.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
  return Math.random().toString(16).slice(2, 18).padEnd(16, '0');
}

export function createFeedbackState(store, { random } = {}) {
  return { version: FEEDBACK_VERSION, respondent: randomId(random), baseline: occurrences(store), slots: Object.fromEntries(CATEGORIES.map(c => [c, {}])), lastPromptAt: null, outbox: [], openDraft: null };
}

function validState(x) {
  return x && x.version === FEEDBACK_VERSION && /^[0-9a-f]{16}$/.test(x.respondent) && x.baseline && x.slots && Array.isArray(x.outbox) &&
    CATEGORIES.every(c => Number.isInteger(x.baseline[c]) && x.baseline[c] >= 0 && x.slots[c] && typeof x.slots[c] === 'object');
}

/** 저장소에서 읽는다. 없거나 깨졌으면 새로 만들고(그 시점 횟수가 기준선) 표시 중이던 슬롯은 unanswered로 닫는다. */
export function loadFeedbackState(storage, store, { now = Date.now(), random } = {}) {
  let state = null, fresh = false;
  try { const raw = storage?.getItem(FEEDBACK_KEY); if (raw) { const x = JSON.parse(raw); if (validState(x)) state = x; } } catch {}
  if (!state) { state = createFeedbackState(store, { random }); fresh = true; }
  state.openDraft ??= null;
  const closed = closeStale(state, now);
  pruneOutbox(state, now);
  return { state, fresh, closed };
}

export function saveFeedbackState(storage, state) {
  try { storage.setItem(FEEDBACK_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

// ── 스케줄 판단 ──
/**
 * 가치 순간 화면에 도착했을 때 호출. 상태를 바꾸지 않는다.
 * 반환: {category, slot, occurrence, missed:[k…]} 또는 null.
 */
export function duePrompt(state, store, category, { now = Date.now(), sessionPrompted = false } = {}) {
  if (!CATEGORIES.includes(category) || !validState(state)) return null;
  const n = occurrences(store)[category], base = state.baseline[category], rec = state.slots[category];
  const open = slotsUpTo(n).filter(k => slotOccurrence(k) > base && !rec[k]);
  if (!open.length) return null;
  if (sessionPrompted) return null;
  if (state.lastPromptAt && now - Date.parse(state.lastPromptAt) < DAY_MS) return null;
  const slot = open[open.length - 1];
  return { category, slot, occurrence: n, missed: open.slice(0, -1) };
}

/** 카드를 실제로 보여 줄 때 호출: 밀린 슬롯은 missed로 닫아 outbox에 넣고, 현재 슬롯은 shown, 전역 제한 시각을 기록. missed 문서 목록을 돌려준다. */
export function markShown(state, prompt, { now = Date.now() } = {}) {
  const at = new Date(now).toISOString(), rec = state.slots[prompt.category], docs = [];
  for (const k of prompt.missed) { rec[k] = { n: prompt.occurrence, status: 'missed', at }; const doc = valueDoc(state, { category: prompt.category, slot: k, occurrence: prompt.occurrence, status: 'missed', now }); enqueue(state, valueDocId(state, prompt.category, k), doc, now); docs.push(doc); }
  rec[prompt.slot] = { n: prompt.occurrence, status: 'shown', at };
  state.lastPromptAt = at;
  return docs;
}

/** 표시 중인 슬롯을 닫는다. status: answered | skipped | unanswered. 이미 닫힌 슬롯은 바꾸지 않는다. */
export function closeSlot(state, category, slot, status, { now = Date.now() } = {}) {
  if (!['answered', 'skipped', 'unanswered'].includes(status)) throw Error('알 수 없는 상태예요.');
  const r = state.slots[category]?.[slot];
  if (!r || r.status !== 'shown') return false;
  r.status = status; r.at = new Date(now).toISOString();
  return true;
}

/** 이전 로드에서 표시만 되고 닫히지 않은 슬롯 → unanswered. 전송 문서를 outbox에 넣고 목록을 돌려준다. */
export function closeStale(state, now = Date.now()) {
  const docs = [];
  for (const c of CATEGORIES) for (const [k, r] of Object.entries(state.slots[c] || {})) {
    if (r?.status !== 'shown') continue;
    closeSlot(state, c, Number(k), 'unanswered', { now });
    const doc = valueDoc(state, { category: c, slot: Number(k), occurrence: r.n, status: 'unanswered', now });
    enqueue(state, valueDocId(state, c, Number(k)), doc, now); docs.push(doc);
  }
  return docs;
}

// ── 전송 문서 (SPEC-015 §7 허용 목록) ──
export const DOC_FIELDS = ['schema', 'kind', 'category', 'slot', 'occurrence', 'status', 'rating', 'helped', 'friction', 'openType', 'text', 'view', 'concept', 'respondent', 'appVersion', 'env', 'clientTime'];
const cleanText = t => String(t ?? '').replace(/\s+/g, ' ').trim();
const safeView = v => (typeof v === 'string' && /^[a-z]{2,20}$/.test(v) ? v : null);

export const valueDocId = (state, category, slot) => `${state.respondent}_${category}_${slot}`;

export function valueDoc(state, { category, slot, occurrence, status, rating = null, helped = [], friction = [], text = '', view = null, concept = null, now = Date.now(), env = 'production' }) {
  if (!CATEGORIES.includes(category)) throw Error('카테고리를 확인해 주세요.');
  if (!Number.isInteger(slot) || slot < 1 || !Number.isInteger(occurrence) || occurrence < 0) throw Error('슬롯 정보를 확인해 주세요.');
  if (!['answered', 'skipped', 'unanswered', 'missed'].includes(status)) throw Error('상태를 확인해 주세요.');
  const answered = status === 'answered';
  if (answered ? !(Number.isInteger(rating) && rating >= 1 && rating <= 5) : rating !== null) throw Error('점수를 확인해 주세요.');
  const chips = CHIPS[category];
  const pick = (list, allowed) => [...new Set((answered ? list : []).filter(id => Object.hasOwn(allowed, id)))];
  const body = answered ? cleanText(text) : '';
  if (body.length > TEXT_MAX.value) throw Error(`의견은 ${TEXT_MAX.value}자 이내로 적어주세요.`);
  return {
    schema: 1, kind: 'value', category, slot, occurrence, status, rating: answered ? rating : null,
    helped: rating >= 4 ? pick(helped, chips.helped) : [], friction: answered && rating <= 3 ? pick(friction, chips.friction) : [],
    openType: null, text: body, view: safeView(view), concept: CONCEPTS.includes(concept) ? concept : null,
    respondent: state.respondent, appVersion: APP_VERSION, env, clientTime: new Date(now).toISOString()
  };
}

export function openDoc(state, { openType, text, view = null, category = null, concept = null, withContext = true, now = Date.now(), env = 'production' }) {
  if (!Object.hasOwn(OPEN_TYPES, openType)) throw Error('의견 유형을 골라주세요.');
  const body = cleanText(text);
  if (body.length < OPEN_MIN) throw Error(`내용을 ${OPEN_MIN}자 이상 적어주세요.`);
  if (body.length > TEXT_MAX.open) throw Error(`내용은 ${TEXT_MAX.open}자 이내로 적어주세요.`);
  return {
    schema: 1, kind: 'open', category: withContext && CATEGORIES.includes(category) ? category : null, slot: null, occurrence: null, status: null, rating: null,
    helped: [], friction: [], openType, text: body, view: withContext ? safeView(view) : null, concept: withContext && CONCEPTS.includes(concept) ? concept : null,
    respondent: state.respondent, appVersion: APP_VERSION, env, clientTime: new Date(now).toISOString()
  };
}
export const openDocId = (state, random) => `${state.respondent}_open_${randomId(random)}`;

// ── outbox ──
export function enqueue(state, id, doc, now = Date.now()) {
  if (state.outbox.some(x => x.id === id)) return false;
  state.outbox.push({ id, doc, tries: 0, queuedAt: new Date(now).toISOString() });
  pruneOutbox(state, now);
  return true;
}
export function pruneOutbox(state, now = Date.now()) {
  state.outbox = state.outbox.filter(x => now - Date.parse(x.queuedAt) <= OUTBOX_DAYS * DAY_MS);
  if (state.outbox.length > OUTBOX_MAX) state.outbox = state.outbox.slice(-OUTBOX_MAX);
}
export function dequeue(state, id) { const before = state.outbox.length; state.outbox = state.outbox.filter(x => x.id !== id); return before !== state.outbox.length; }

/** 가치 카드 응답을 확정: 슬롯을 닫고 문서를 outbox에 넣는다. */
export function recordValue(state, prompt, answer, { now = Date.now() } = {}) {
  const status = answer?.rating ? 'answered' : answer?.skipped ? 'skipped' : 'unanswered';
  const doc = valueDoc(state, { ...answer, rating: answer?.rating ?? null, category: prompt.category, slot: prompt.slot, occurrence: prompt.occurrence, status, now });
  if (!closeSlot(state, prompt.category, prompt.slot, status, { now })) return null;
  enqueue(state, valueDocId(state, prompt.category, prompt.slot), doc, now);
  return doc;
}
/** 의견 보내기: 문서를 outbox에 넣고 초안을 지운다. */
export function recordOpen(state, input, { now = Date.now(), random } = {}) {
  const doc = openDoc(state, { ...input, now });
  enqueue(state, openDocId(state, random), doc, now);
  state.openDraft = null;
  return doc;
}
