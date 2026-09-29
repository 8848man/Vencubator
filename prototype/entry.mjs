// SPEC-009 §5 랜딩 → 앱 진입 (순수 함수). 같은 사이트의 랜딩 저장소에서 아이디어 문장만 가져온다.
// 문장을 넘기는 랜딩: v2(아이디어 카드), v3(뿌리 — 공개 랜딩). v1은 문장 입력이 없다.
export const LANDING_KEYS = { v2: 'vencubator.landing.v2', v3: 'vencubator.landing.v3', v31: 'vencubator.landing.v31' };
export const LANDING_KEY = LANDING_KEYS.v2; // 하위 호환
const FROM = ['v1', 'v2', 'v3', 'v31'];
const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);

export function readEntry(search = '', storage) {
  const q = new URLSearchParams(search).get('from');
  const from = FROM.includes(q) ? q : 'direct';
  const key = LANDING_KEYS[from];
  if (!key) return { from, idea: null };
  let idea = null;
  try { const d = JSON.parse(storage?.getItem(key) || 'null'); idea = clean(d?.idea?.text) || null; } catch { idea = null; }
  return { from, idea };
}

/** 첫 렌더 전에 state를 바꾼다. 새 프로젝트 입력 초안만 채우고 프로젝트는 만들지 않는다. 반환: 가져왔는지 */
export function applyEntry(state, entry) {
  if (!entry?.idea) return false;
  state.forms = state.forms || {};
  if (state.forms.entry?.idea === entry.idea) return false;           // 이미 가져온 문장
  const draft = state.forms.new || {};
  if (draft.description && draft.description.trim() && draft.description !== entry.idea) return false; // 쓰던 초안 보존
  state.forms.new = { ...draft, description: entry.idea };
  state.forms.entry = { from: entry.from, idea: entry.idea, pending: true };
  if (state.user) state.route = { view: 'new', projectId: state.route?.projectId ?? null };
  return true;
}
