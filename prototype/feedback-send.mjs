// SPEC-015 r0.4 §7 · ADR-006 — outbox를 Cloud Firestore `feedback` 컬렉션으로 보낸다(REST, SDK 없음).
// 설정값이 비어 있거나 운영 호스트가 아니면 요청하지 않고 로컬 보관만 한다.

// Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹)의 firebaseConfig 값. 웹 페이지에 공개되는 값이며 접근 통제는 firestore.rules가 한다.
export const FIREBASE_CONFIG = { projectId: '', apiKey: '' };
export const FEEDBACK_HOST = 'vencubator.vercel.app';
export const COLLECTION = 'feedback';
export const MAX_TRIES = { rejected: 3, transient: 5 };

export const configured = (cfg = FIREBASE_CONFIG) => /^[a-z0-9-]{4,40}$/.test(cfg?.projectId || '') && /^[A-Za-z0-9_-]{20,60}$/.test(cfg?.apiKey || '');

/** 운영 호스트 + 내부 트래픽(internal=1)·점검(lab) 제외. 사용자가 직접 보낸 의견이라 DNT는 막지 않는다(SPEC-015 DR-FB-05). */
export function sendAllowed(win = globalThis.window) {
  try {
    if (win?.location?.protocol !== 'https:' || win.location.hostname !== FEEDBACK_HOST) return false;
    const q = new URLSearchParams(win.location.search);
    return !q.has('lab') && q.get('internal') !== '1' && win.sessionStorage?.getItem('vencubator.analytics.internal') !== '1';
  } catch { return false; }
}

/** JS 값 → Firestore REST Value */
export function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Number.isInteger(v)) return { integerValue: String(v) };
  if (typeof v === 'number') return { doubleValue: v };
  return { stringValue: String(v) };
}
export const toFields = doc => Object.fromEntries(Object.entries(doc).map(([k, v]) => [k, toValue(v)]));

export function createUrl(id, cfg = FIREBASE_CONFIG) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(cfg.projectId)}/databases/(default)/documents/${COLLECTION}?documentId=${encodeURIComponent(id)}&key=${encodeURIComponent(cfg.apiKey)}`;
}

/** 한 건 전송. 결과: 'sent' | 'exists' | 'rejected' | 'transient' */
export async function sendOne(item, { fetchImpl = globalThis.fetch, cfg = FIREBASE_CONFIG } = {}) {
  try {
    const res = await fetchImpl(createUrl(item.id, cfg), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fields: toFields(item.doc) }), keepalive: true });
    if (res.ok) return 'sent';
    if (res.status === 409) return 'exists';
    if (res.status === 400 || res.status === 403 || res.status === 404) return 'rejected';
    return 'transient';
  } catch { return 'transient'; }
}

/**
 * outbox를 순서대로 보낸다. 상태(state.outbox)를 바꾸고 결과 요약을 돌려준다. 한 번에 하나만 실행.
 * 네트워크 오류가 나면 이번 차례는 멈춘다(다음 로드에 재시도).
 */
let running = null;
export function flushOutbox(state, opts = {}) {
  if (running) return running;
  const { win = globalThis.window, cfg = FIREBASE_CONFIG, allowed = sendAllowed(win) } = opts;
  if (!allowed || !configured(cfg) || !state?.outbox?.length) return Promise.resolve({ skipped: true, sent: 0, left: state?.outbox?.length || 0 });
  running = (async () => {
    let sent = 0, dropped = 0;
    for (const item of [...state.outbox]) {
      const r = await sendOne(item, { ...opts, cfg });
      if (r === 'sent' || r === 'exists') { state.outbox = state.outbox.filter(x => x.id !== item.id); sent++; continue; }
      item.tries = (item.tries || 0) + 1;
      const limit = r === 'rejected' ? MAX_TRIES.rejected : MAX_TRIES.transient;
      if (item.tries >= limit) { state.outbox = state.outbox.filter(x => x.id !== item.id); dropped++; }
      if (r === 'transient') break;
    }
    return { skipped: false, sent, dropped, left: state.outbox.length };
  })().finally(() => { running = null; });
  return running;
}
