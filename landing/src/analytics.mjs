// SPEC-009 §4 v1 계측: 방문과 서비스 진입 클릭만 기록 (네트워크 전송 없음)
import { track, captureUtm, ensureAssignment } from './track.mjs';

export function bindAnalytics(win = window) {
  const env = { page: 'v1' };
  captureUtm(win.location.search);
  ensureAssignment('v1');
  track('landing_view', {}, env);
  win.document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[data-cta="prototype"]');
    if (!a) return;
    const place = (a.closest('[data-spec]')?.dataset.spec || 'page').toLowerCase();
    track('cta_click', { placement: place }, env);
  });
}
