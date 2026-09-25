// 브라우저 진입점 (SPEC-006 §2). 로직은 render/motion에 둔다.
import { renderPage } from './render.mjs';
import { bindMotion } from './motion.mjs';
import { bindAnalytics } from './analytics.mjs';

const app = document.getElementById('app');
// 빌드 산출물(dist)은 이미 사전 렌더되어 있으므로 다시 그리지 않는다.
if (app && !app.dataset.prerendered) app.innerHTML = renderPage();
bindMotion(window);
bindAnalytics(window);
