// SPEC-017 §4: 순수 상태 모델. DOM·저장소 접근 없음 (테스트 대상).
// v2(SPEC-007 §4)의 액션·규칙을 계승. 차이: 칸 이름(ask), 예시 값은 “다 쓴 예시 기록”(DP-12), rootState 추가.
import { SITE, SAMPLES, SLOTS, LESSON, QUESTION_TEMPLATES, OBSERVATION, DECISIONS, AREAS, PAIN } from './content.mjs';

export const CHAPTERS = SLOTS.map(s => s.chapter); // ['surface','learn','ask','observe','decide']
const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function initialState() {
  const s = SAMPLES[0];
  return {
    v: 1,
    pain: null,
    idea: { text: s.idea, source: 'example', sample: s.key },
    learn: { variant: 0, tries: 0, result: null, last: null },
    ask: { customer: s.customer, source: 'example', saved: false },
    observe: null,
    decision: null,
    reached: []
  };
}

export function reduce(state, action) {
  const s = structuredClone(state);
  switch (action.type) {
    case 'SET_PAIN':
      if (!PAIN.options.some(p=>p.key===action.key) || state.pain===action.key) return state;
      s.pain=action.key; return s;
    case 'SET_IDEA': {
      const text = clean(action.text, SITE.limits.idea);
      if (!text) return state;
      const sample = SAMPLES.find(x => x.key === action.sample);
      s.idea = { text, source: action.source === 'mine' ? 'mine' : 'example', sample: sample?.key ?? null };
      if (sample && action.source === 'example' && !s.reached.includes('surface')) s.reached.push('surface');
      if (sample && s.ask.source !== 'mine') s.ask = { customer: sample.customer, source: 'example', saved: false };
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
      s.ask = { customer: text, source: 'mine', saved: false };
      return s;
    }
    case 'SAVE_QUESTIONS':
      if (s.ask.saved) return state;
      s.ask.saved = true;
      return s;
    case 'OBSERVE':
      if (!['supported', 'refuted'].includes(action.result) || s.observe === action.result) return state;
      s.decision = null;
      s.observe = action.result;
      return s;
    case 'DECIDE':
      if (!s.observe || !DECISIONS[s.observe].some(d => d.key === action.key) || s.decision === action.key) return state;
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

/**
 * 층 5개 계산. status: example | mine (빈 칸 없음 — DP-12 가만히 있어도 완성).
 * example 값은 SLOTS[i].example 의 다 쓴 예시 문장. 이름표·질문은 고른 예시에 맞춰진다.
 */
export function deriveCard(state) {
  const obs = OBSERVATION.choices.find(c => c.key === state.observe);
  const dec = state.observe ? DECISIONS[state.observe].find(d => d.key === state.decision) : null;
  const sampleCustomer = state.ask.source === 'example' ? state.ask.customer : null;
  const values = [
    { mine: state.idea.source === 'mine', value: state.idea.text, example: state.idea.text },
    { mine: !!state.learn.result, value: LESSON.cardValue[state.learn.result], example: SLOTS[1].example },
    { mine: state.ask.saved, value: `${state.ask.customer}에게 · 지난 행동을 묻는 질문 ${QUESTION_TEMPLATES.length}개`, example: sampleCustomer ? `${sampleCustomer}에게 지난 행동 묻기` : SLOTS[2].example },
    { mine: !!obs, value: obs?.card, example: SLOTS[3].example, flag: state.observe === 'refuted' ? 'refuted' : null },
    { mine: !!dec, value: dec?.t, example: SLOTS[4].example }
  ];
  const slots = SLOTS.map((def, i) => {
    const v = values[i];
    const out = { ...def, status: v.mine ? 'mine' : 'example', value: v.mine ? v.value : v.example };
    if (v.mine && v.flag) out.flag = v.flag;
    return out;
  });
  const filled = slots.filter(x => x.status === 'mine').length;
  return { slots, filled, total: slots.length, grow: filled / slots.length, complete: filled === slots.length };
}

/** 뿌리 상태: 층별 실선(mine)/점선(example), 방향 전환 여부. 그리기 규칙은 interact.mjs L3M-03·04 */
export function rootState(state) {
  const c = deriveCard(state);
  const layers = c.slots.slice(1).map(s => ({ key: s.key, chapter: s.chapter, status: s.status }));
  let depth = 0;
  for (const l of layers) { if (l.status === 'mine') depth += 1; else break; }
  return { layers, depth, mine: layers.filter(l => l.status === 'mine').length, turned: state.observe === 'refuted', idea: c.slots[0].status };
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
    const obs = ['supported', 'refuted'].includes(d.observe) ? d.observe : null;
    return {
      ...base,
      pain: PAIN.options.some(p=>p.key===d.pain) ? d.pain : null,
      idea: { ...base.idea, ...d.idea, text: clean(d.idea.text, SITE.limits.idea) || base.idea.text, source: d.idea.source === 'mine' ? 'mine' : 'example' },
      ask: { ...base.ask, ...d.ask, customer: clean(d.ask?.customer, SITE.limits.customer) || base.ask.customer, saved: d.ask?.saved === true },
      learn: { ...base.learn, ...d.learn },
      observe: obs,
      decision: obs && DECISIONS[obs].some(x => x.key === d.decision) ? d.decision : null,
      reached: d.reached.filter(c => CHAPTERS.includes(c))
    };
  } catch { return initialState(); }
}

// L3I-10: 표시 여부의 단일 출처. 저장된 reached로 재로드 복원.
export function nextState(state) {
  return {surface:!!state.idea.text && state.reached.includes('surface'),learn:!!state.learn.result,
    ask:!!state.ask.saved,observe:!!state.observe,decide:!!state.decision,roots:true};
}

// L3I-11: 임의 저장값은 범용 답으로 안전하게 복원한다.
export function observationFor(state) {
  return state.idea.source === 'example' && Object.hasOwn(OBSERVATION.quotesBySample,state.idea.sample)
    ? OBSERVATION.quotesBySample[state.idea.sample] : OBSERVATION.quotesGeneric;
}
