// 진입점 (SPEC-016 §2)
import { renderPage } from './render.mjs';
import { bindLanding } from './interact.mjs';

const app = document.getElementById('app');
if (app && !app.dataset.prerendered) app.innerHTML = renderPage();
bindLanding(window);
