// SPEC-009 §4 공통 이벤트 — 원본은 site/shared/track.mjs. landing/src, landing-v2/src, prototype 에 같은 내용으로 복사해 쓴다.
// 네트워크 전송 없음: 브라우저 저장소 버퍼에만 기록한다. 전송 어댑터는 DR-G02 결정 후 이 파일에만 추가한다.
export const EXP_KEY = 'vencubator.exp.v1';
export const EVENTS_KEY = 'vencubator.events.v1';
export const UTM_KEY = 'vencubator.utm.v1';
export const MAX_EVENTS = 500;
export const VARIANTS = ['v1', 'v2', 'v3'];

const SAFE_VALUE = /^[A-Za-z0-9_.-]{0,32}$/;
const SAFE_UTM = /^[\p{L}\p{N}_.-]{1,40}$/u;
const store = s => s ?? (typeof localStorage !== 'undefined' ? localStorage : null);
const session = s => s ?? (typeof sessionStorage !== 'undefined' ? sessionStorage : null);
const readJSON = (st, key, fallback) => { try { const raw = st?.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const writeJSON = (st, key, value) => { try { st?.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
export const uuid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36));

/** 허용 값만 남긴다: 숫자·불리언·짧은 식별자 문자열. 자유 텍스트는 버린다. */
export function cleanProps(props = {}) {
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    if (!/^[a-z][a-z0-9_]{0,23}$/.test(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string' && SAFE_VALUE.test(v)) out[k] = v;
  }
  return out;
}

/** 저장된 배정. 형식이 틀리면 null */
export function readAssignment(storage) {
  const a = readJSON(store(storage), EXP_KEY, null);
  return a && a.v === 1 && VARIANTS.includes(a.variant) && typeof a.visitor === 'string' ? a : null;
}
export function writeAssignment(storage, a) { return writeJSON(store(storage), EXP_KEY, a); }

/** 랜딩에 직접 들어온 경우 보고 있는 변형으로 배정을 기록 (SPEC-009 §3) */
export function ensureAssignment(page, storage) {
  const cur = readAssignment(storage);
  if (cur) return cur;
  const a = { v: 1, visitor: uuid(), variant: VARIANTS.includes(page) ? page : 'none', source: 'direct', at: Date.now() };
  if (VARIANTS.includes(page)) writeAssignment(storage, a);
  return a;
}

/** 주소의 UTM을 이번 세션에 보관(허용 문자만) */
export function captureUtm(search = '', sessionStore) {
  const q = new URLSearchParams(search), utm = {};
  for (const k of ['source', 'medium', 'campaign', 'content']) { const v = q.get('utm_' + k); if (v && SAFE_UTM.test(v)) utm[k] = v; }
  if (Object.keys(utm).length) writeJSON(session(sessionStore), UTM_KEY, utm);
  return readJSON(session(sessionStore), UTM_KEY, {});
}

export function track(name, props = {}, env = {}) {
  if (!/^[a-z][a-z0-9_]{1,31}$/.test(name)) return null;
  const st = store(env.storage), a = readAssignment(st);
  const ev = { t: Date.now(), name, page: env.page || 'unknown', visitor: a?.visitor || null, variant: a?.variant || null, utm: readJSON(session(env.session), UTM_KEY, {}), props: cleanProps(props) };
  const list = readJSON(st, EVENTS_KEY, []);
  const next = (Array.isArray(list) ? list : []).concat(ev).slice(-MAX_EVENTS);
  writeJSON(st, EVENTS_KEY, next);
  return ev;
}
export const readEvents = storage => { const l = readJSON(store(storage), EVENTS_KEY, []); return Array.isArray(l) ? l : []; };
