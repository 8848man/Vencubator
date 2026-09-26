// SPEC-009 §4 공통 이벤트 — 원본은 site/shared/track.mjs. landing/src, landing-v2/src, prototype 에 같은 내용으로 복사해 쓴다.
// SPEC-011: 로컬 버퍼 + 운영 GA4 어댑터. Firebase 연결 웹 스트림, SDK 중복 설치 없음.
export const MEASUREMENT_ID = 'G-0GFT3M8ZG3';
const ANALYTICS_HOST = 'vencubator.vercel.app';
const ANALYTICS_FIELDS = {
  landing_view: [], idea_submit: ['source','len'], card_progress: ['filled'],
  cta_click: ['placement','filled'], app_open: ['from'], entry_import: ['from'],
  project_create: ['from','imported'], lesson_complete: ['count'],
  lesson_start: ['concept'], lesson_step: ['concept','step'], lesson_answer: ['concept'],
  application_save: ['concept'], field_task_plan: ['concept'], evidence_save: ['kind']
};
const ANALYTICS_ENUMS = {
  source: ['mine','sample'], from: ['v1','v2','v3','direct'],
  concept: ['customer','market','product','marketing','sales','finance','operations','strategy'],
  step: ['concept','question','transfer','apply','application','complete'], kind: ['field','simulation','desk']
};
export function analyticsPayload(ev) {
  if (!Object.hasOwn(ANALYTICS_FIELDS, ev.name)) return null;
  const props = {};
  for (const key of ANALYTICS_FIELDS[ev.name]) {
    const value = ev.props?.[key];
    if (ANALYTICS_ENUMS[key]?.includes(value) || (key === 'imported' && typeof value === 'boolean') ||
        (['len','filled','count'].includes(key) && Number.isInteger(value) && value >= 0 && value <= 10000) ||
        (key === 'placement' && /^(page|hero|footer|l[123]s-\d{1,2}|s\d{1,2})$/.test(value))) props[key] = value;
  }
  return {schema_version:1,stage:'prototype',environment:'production',app_version:'analytics-1',page:ev.page==='app'?'app':'v3',...props};
}
export function analyticsAllowed(win) {
  try {
    if (win?.location?.protocol !== 'https:' || win.location.hostname !== ANALYTICS_HOST) return false;
    const q = new URLSearchParams(win.location.search);
    if(q.get('internal')==='1')win.sessionStorage?.setItem('vencubator.analytics.internal','1');
    if(q.get('internal')==='0')win.sessionStorage?.removeItem('vencubator.analytics.internal');
    return !q.has('lab') && q.get('internal')!=='1' && win.sessionStorage?.getItem('vencubator.analytics.internal')!=='1' && win.navigator?.doNotTrack!=='1';
  } catch { return false; }
}
export function sendAnalytics(ev, win = globalThis.window) {
  try {
    const payload = analyticsPayload(ev);
    if (!payload || !analyticsAllowed(win)) return false;
    // One initializer per document. No replay of historical local buffer.
    if (!win.__vencubatorAnalytics) {
      const layer = win.dataLayer = win.dataLayer || [];
      const tag = function(){layer.push(arguments);};
      const page = win.location.pathname.startsWith('/app') ? '/app/' : '/';
      const safeUrl = 'https://' + ANALYTICS_HOST + page;
      tag('js',new Date());
      tag('config',MEASUREMENT_ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
        page_location:safeUrl,page_referrer:'',page_title:page==='/app/'?'Vencubator App':'Vencubator',ignore_referrer:true});
      const script = win.document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
      script.onerror = () => { win.__vencubatorAnalytics.failed = true; layer.length = 0; };
      win.__vencubatorAnalytics = {tag,failed:false};
      win.document.head.appendChild(script);
      tag('event','page_view',{send_to:MEASUREMENT_ID,page_location:safeUrl,page_referrer:'',page_title:page==='/app/'?'Vencubator App':'Vencubator'});
    }
    if (win.__vencubatorAnalytics.failed || win.dataLayer.length > 500) return false;
    win.__vencubatorAnalytics.tag('event',ev.name,{send_to:MEASUREMENT_ID,...payload});
    return true;
  } catch { return false; }
}
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
  sendAnalytics(ev);
  return ev;
}
export const readEvents = storage => { const l = readJSON(store(storage), EVENTS_KEY, []); return Array.isArray(l) ? l : []; };
