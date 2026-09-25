// SPEC-009 §3 배정 규칙 (순수 함수). site/router.html 에 빌드 시 인라인된다.
export const WEIGHTS = { v1: 0.5, v2: 0.5 };

export function pickVariant(rand, weights = WEIGHTS) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let x = Math.min(Math.max(rand, 0), 0.999999) * total;
  for (const [k, w] of entries) { if (x < w) return k; x -= w; }
  return entries[entries.length - 1][0];
}

/** stored: readAssignment 결과(또는 null), search: location.search */
export function resolveVariant({ search = '', stored = null, rand = Math.random(), weights = WEIGHTS }) {
  const forced = new URLSearchParams(search).get('v');
  if (forced && Object.prototype.hasOwnProperty.call(weights, forced)) return { variant: forced, source: 'override', write: true };
  if (stored && Object.prototype.hasOwnProperty.call(weights, stored.variant)) return { variant: stored.variant, source: 'stored', write: false };
  return { variant: pickVariant(rand, weights), source: 'random', write: true };
}

export function targetUrl(variant, search = '', hash = '') {
  const q = new URLSearchParams(search); q.delete('v');
  const qs = q.toString();
  // 상대 경로: 사이트를 하위 경로에 배포해도 동작
  return `./${variant}/${qs ? '?' + qs : ''}${hash || ''}`;
}
