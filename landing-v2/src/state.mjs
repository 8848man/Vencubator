// SPEC-007 §4: 순수 상태 모델. DOM·저장소 접근 없음 (테스트 대상).
import { SITE, SAMPLES, SLOTS, LESSON, QUESTION_TEMPLATES, OBSERVATION, DECISIONS, AREAS } from './content.mjs';

export const CHAPTERS = SLOTS.map(s => s.chapter); // ['idea','learn','apply','observe','decide']
const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function initialState() {
  const s = SAMPLES[0];
  return {
    v: 1,
    idea: { text: s.idea, source: 'example', sample: s.key },
    learn: { variant: 0, tries: 0, result: null, last: null },
    apply: { customer: s.customer, source: 'example', saved: false },
    observe: null,
    decision: null,
    reached: []
  };
}

export function reduce(state, action) {
  const s = structuredClone(state);
  switch (action.type) {
    case 'SET_IDEA': {
      const text = clean(action.text, SITE.limits.idea);
      if (!text) return state;
      const sample = SAMPLES.find(x => x.key === action.sample);
      s.idea = { text, source: action.source === 'mine' ? 'mine' : 'example', sample: sample?.key ?? null };
      if (sample && s.apply.source !== 'mine') s.apply = { customer: sample.customer, source: 'example', saved: false };
      return s;
    }
    case 'ANSWER': {
      if (s.learn.result) return state; // 이미 끝난 문항은 다시 보상하지 않음
      const v = LESSON.variants[s.learn.variant];
      if (action.choice === v.answer) { s.learn.result = s.learn.tries === 0 ? 'first' : 'retry'; s.learn.last = 'right'; return s; }
      s.learn.tries += 1;
      s.learn.last = 'wrong';
      if (s.learn.tries >= LESSON.variants.length) { s.learn.result = 'helped'; s.learn.last = 'helped'; }
      else s.learn.variant = s.learn.tries % LESSON.variants.length;
      return s;
    }
    case 'SET_CUSTOMER': {
      const text = clean(action.text, SITE.limits.customer);
      if (!text) return state;
      s.apply = { customer: text, source: 'mine', saved: false };
      return s;
    }
    case 'SAVE_QUESTIONS':
      s.apply.saved = true;
      return s;
    case 'OBSERVE':
      if (!['supported', 'refuted'].includes(action.result)) return state;
      if (s.observe !== action.result) s.decision = null;
      s.observe = action.result;
      return s;
    case 'DECIDE':
      if (!s.observe || !DECISIONS[s.observe].some(d => d.key === action.key)) return state;
      s.decision = action.key;
      return s;
    case 'REACH':
      if (!CHAPTERS.includes(action.chapter) || s.reached.includes(action.chapter)) return state;
      s.reached.push(action.chapter);
      return s;
    case 'RESET':
      return initialState();
    default:
      return state;
  }
}

export const questionsFor = () => QUESTION_TEMPLATES.slice();

/** 카드 5칸 계산. status: empty | example | mine */
export function deriveCard(state) {
  const reached = c => state.reached.includes(c);
  const slot = (i, value, mine, exampleValue, extra = {}) => {
    const def = SLOTS[i];
    if (mine) return { ...def, value, status: 'mine', ...extra };
    if (reached(def.chapter) || (i === 0)) return { ...def, value: exampleValue, status: 'example' };
    return { ...def, value: '', status: 'empty' };
  };
  const obs = OBSERVATION.choices.find(c => c.key === state.observe);
  const dec = state.observe ? DECISIONS[state.observe].find(d => d.key === state.decision) : null;
  const slots = [
    slot(0, state.idea.text, state.idea.source === 'mine', state.idea.text),
    slot(1, LESSON.cardValue[state.learn.result], !!state.learn.result, LESSON.title),
    slot(2, `${state.apply.customer}에게 · 지난 행동을 묻는 질문 ${QUESTION_TEMPLATES.length}개`, state.apply.saved, `${state.apply.customer}에게 지난 행동 묻기`),
    slot(3, obs?.card, !!obs, '세 명의 답을 듣고 예상과 비교', state.observe === 'refuted' ? { flag: 'refuted' } : {}),
    slot(4, dec?.t, !!dec, '근거를 보고 다음 방향 고르기')
  ];
  const filled = slots.filter(x => x.status === 'mine').length;
  return { slots, filled, total: slots.length, grow: filled / slots.length, complete: filled === slots.length };
}

/** 7영역 경로: 반박되면 전략을 2번째로 (SPEC-005 nextConcept 규칙) */
export function pathOrder(state) {
  const keys = AREAS.map(a => a.key);
  if (state.observe === 'refuted') { keys.splice(keys.indexOf('strategy'), 1); keys.splice(1, 0, 'strategy'); }
  return { order: keys, current: keys[0], next: keys[1] };
}

export const serialize = state => JSON.stringify(state);
/** 손상·다른 버전 데이터는 기본 상태로 */
export function deserialize(raw) {
  try {
    const d = JSON.parse(raw);
    if (!d || d.v !== 1 || typeof d.idea?.text !== 'string' || !Array.isArray(d.reached)) return initialState();
    const base = initialState();
    return {
      ...base, ...d,
      idea: { ...base.idea, ...d.idea, text: clean(d.idea.text, SITE.limits.idea) || base.idea.text },
      apply: { ...base.apply, ...d.apply, customer: clean(d.apply?.customer, SITE.limits.customer) || base.apply.customer },
      learn: { ...base.learn, ...d.learn },
      reached: d.reached.filter(c => CHAPTERS.includes(c))
    };
  } catch { return initialState(); }
}
