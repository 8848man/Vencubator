// SPEC-018: audience choice is a navigation preference, not experiment assignment.
export const AUDIENCE_KEY = 'vencubator.audience.v1';
export const AUDIENCE_PATHS = { beginner: '/beginner/', experienced: '/value/', tester: '/test/' };
export function validChoice(value) {
  try { const d = JSON.parse(value); return d?.v === 1 && ['beginner','experienced','tester','dismissed'].includes(d.choice) ? d.choice : null; } catch { return null; }
}
export function readChoice(local, session) {
  for (const storage of [session, local]) {
    try { const choice = validChoice(storage?.getItem(AUDIENCE_KEY)); if (choice) return choice; } catch { /* storage may be blocked */ }
  }
  return null;
}
export function saveChoice(choice, local, session) {
  const data = JSON.stringify({ v: 1, choice });
  if (!validChoice(data)) return false;
  let saved = false;
  for (const storage of [local, session]) {
    try { if (storage) { storage.setItem(AUDIENCE_KEY, data); saved = true; } } catch { /* continue without persistence */ }
  }
  return saved;
}
export function safeSearch(search = '') {
  const out = new URLSearchParams(), input = new URLSearchParams(search);
  for (const k of ['utm_source','utm_medium','utm_campaign','utm_content']) {
    const v = input.get(k); if (v && /^[\p{L}\p{N}_.-]{1,40}$/u.test(v)) out.set(k, v);
  }
  if (['0','1'].includes(input.get('internal'))) out.set('internal', input.get('internal'));
  if (input.has('lab')) out.set('lab','1');
  return out.size ? '?' + out : '';
}
export function audienceRoute(pathname, hash = '', choice = null) {
  const current = Object.keys(AUDIENCE_PATHS).find(k => AUDIENCE_PATHS[k] === pathname) || 'beginner';
  if (pathname !== '/' || hash) return { current, redirect: null, prompt: false };
  return { current, redirect: ['experienced','tester'].includes(choice) ? AUDIENCE_PATHS[choice] : null, prompt: !choice };
}
export function browserStorage(win, name) { try { return win[name]; } catch { return null; } }
