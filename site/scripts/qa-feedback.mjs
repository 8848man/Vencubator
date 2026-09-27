// SPEC-015 r0.3 F03~F05 브라우저 검증 — 가치 카드·의견 보내기 (Playwright 필요, 없으면 건너뜀)
// 사용: node site/scripts/qa-feedback.mjs [--shots]
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = process.env.ROOT || resolve(HERE, '../../prototype');
const SHOTS = resolve(HERE, '../qa-shots/feedback');
const shots = process.argv.includes('--shots');
let chromium;
try { chromium = (await import('playwright')).chromium; } catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
const imp = f => import(pathToFileURL(join(APP, f)).href);
const { blankStore, createProject, confirmContext, commitEvidence } = await imp('domain.mjs');
const { startLesson, moveLesson, getRun, lessonContent, answerLesson, completeLesson, finishFieldTask } = await imp('guided.mjs');
const { planTaskField } = await imp('tasks.mjs');
const { FEEDBACK_KEY, QUESTIONS, SCALE, COPY } = await imp('feedback.mjs');
if (shots) await mkdir(SHOTS, { recursive: true });

// ── 상태 준비 (도메인 함수 사용) ──
const prep = { target: '팀플하는 대학생', artifact: '최근 팀원을 구한 경험을 물어보기', criterion: '문제가 다르면 가설 수정하기' };
const CONTEXT = { customer: '첫 전공 수업 신입생', problem: '팀원을 구하기 어렵다', alternative: '단톡방', solution: '시간표 매칭', value: '빠른 팀 구성' };
function toApply(s, p, c) { startLesson(s, p.id, c); if (getRun(p, c).step === 'concept') moveLesson(s, p.id); if (getRun(p, c).step === 'question') { const q = lessonContent(c); answerLesson(s, p.id, { choice: q.answer, reason: q.reason }); moveLesson(s, p.id); } const q = lessonContent(c, 0, true); answerLesson(s, p.id, { choice: q.answer, reason: q.reason }); moveLesson(s, p.id); }
function learn(s, p, c) { toApply(s, p, c); return completeLesson(s, p.id, prep); }
function base() { const s = blankStore(); s.user = { id: 'demo-user', name: 'QA' }; const p = createProject(s, { id: 'p1', description: '시간과 역할이 맞는 팀플 동료 찾기 서비스' }); confirmContext(s, p.id, CONTEXT); return { s, p }; }
const fake = (s, type, n) => { for (let i = 0; i < n; i++) s.events.push({ id: `event-fake-${type}-${i}`, key: `fake:${type}:${i}`, type, time: '2026-09-01T00:00:00.000Z' }); };
/** 학습: 2개 완료 + 세 번째 개념 응용 단계 → 화면에서 저장하면 3번째 */
function learningStore() { const { s, p } = base(); learn(s, p, 'customer'); learn(s, p, 'product'); toApply(s, p, 'market'); s.route = { view: 'session', projectId: 'p1', concept: 'market' }; return s; }
/** 결정: 실제 현장 기록 1건 + 과거 결정 이벤트 2개 → 화면에서 결정하면 3번째 */
function decisionStore() { const { s, p } = base(); const a = learn(s, p, 'customer'); const t = planTaskField(s, p.id, a.id);
  const input = { id: 'e1', taskId: t.id, kind: 'field', stat: 'customer', claim: a.text, source: '가상 고객 A', date: '2026-09-20', method: '가상 인터뷰', summary: '최근 경험 관찰', interpretation: '문제 가설 비교', limitations: '가상 사례 한 건', assessment: 'mixed' };
  commitEvidence(s, p.id, input); finishFieldTask(s, p.id, input); fake(s, 'decision_committed', 2); s.route = { view: 'decision', projectId: 'p1' }; return s; }
/** 아이디어 갱신: 확정 1회 + 과거 1개 → 요약 수정 저장이 3번째(학습 로드맵) */
function ideaUpdateStore() { const { s, p } = base(); p.draft = { ...CONTEXT }; fake(s, 'context_confirmed', 1); s.route = { view: 'review', projectId: 'p1' }; return s; }
/** 첫 정리(born): 다른 프로젝트 확정 2회 + 새 프로젝트 초안 */
function bornStore() { const { s } = base(); fake(s, 'context_confirmed', 1); const q = createProject(s, { id: 'p2', description: '동네 반찬을 조금씩 나눠 사는 구독' }); q.draft = { customer: '1인 가구 직장인', problem: '반찬을 사면 남는다', alternative: '편의점', solution: '소분 구독', value: '적게 사기' }; s.route = { view: 'review', projectId: 'p2' }; return s; }
/** 실행 기록: 과거 기록 이벤트 2개 → 화면 기록이 3번째 */
function evidenceStore() { const { s } = base(); fake(s, 'evidence_recorded', 2); s.route = { view: 'evidence', projectId: 'p1' }; return s; }

const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = createServer(async (q, r) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; try { const b = await readFile(join(APP, p)); r.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(ok => server.listen(4306, '127.0.0.1', ok));
const BASE = 'http://127.0.0.1:4306/';
const browser = await chromium.launch();
const results = [];
const check = (id, name, ok, info = '') => results.push({ id, name, ok: !!ok, info: String(info ?? '') });
const KEY = 'vencubator.prototype.v1';
async function open(width, store, height = 844) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.route(/fonts\.googleapis|jsdelivr|googletagmanager/, r => r.fulfill({ contentType: 'text/css', body: '' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  page.firestore = 0; page.on('request', r => { if (r.url().includes('firestore.googleapis.com')) page.firestore++; });
  await page.goto(BASE + 'index.html?seed'); await page.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [KEY, JSON.stringify(store)]);
  await page.goto(BASE); await page.waitForTimeout(450);
  return { ctx, page, errors };
}
const W = (page, t = 400) => page.waitForTimeout(t);
const fbState = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), FEEDBACK_KEY);
const project = page => page.evaluate(k => localStorage.getItem(k), KEY);
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
const shot = async (page, n, el) => { if (shots) await (el ? page.locator(el).first() : page).screenshot({ path: join(SHOTS, n + '.png') }); };
async function saveApplication(page) {
  await page.fill('#guided-apply [name=target]', prep.target); await page.fill('#guided-apply [name=artifact]', '시장 규모를 가늠할 질문 세 가지 정리하기'); await page.fill('#guided-apply [name=criterion]', '답이 모이지 않으면 대상 좁히기');
  await page.click('#guided-apply [type=submit]'); await W(page, 600);
}

try {
  // ── learning: 학습 완료 화면, 폭별 배치·크기·넘침 ──
  for (const w of [320, 390, 768, 1280]) {
    const { ctx, page, errors } = await open(w, learningStore());
    const fresh = await fbState(page);
    check('F01', `${w}px 도입 시 기준선 = 현재 횟수(소급 없음)`, fresh?.baseline?.learning === 2, JSON.stringify(fresh?.baseline));
    await saveApplication(page);
    const card = await page.evaluate(() => { const c = document.querySelector('.vf-card'); if (!c) return null; const inv = document.querySelector('.lesson-finish .field-invitation'); return {
      beforeInvitation: !!inv && c.nextElementSibling === inv, focusInside: c.contains(document.activeElement), dialogs: document.querySelectorAll('dialog[open]').length,
      legend: c.querySelector('legend')?.textContent, labels: [...c.querySelectorAll('.vf-opt')].map(l => l.textContent.replace(/\s+/g, ' ').trim()),
      optH: Math.min(...[...c.querySelectorAll('.vf-opt')].map(l => l.getBoundingClientRect().height)), submit: !!c.querySelector('[type=submit]'),
      closeSize: (() => { const r = c.querySelector('.vf-close').getBoundingClientRect(); return [r.width, r.height]; })(), cardW: c.getBoundingClientRect().right <= innerWidth + 0.5 }; });
    check('F03', `${w}px 학습 완료 화면에 카드 표시(실행 안내 앞)·포커스 이동 없음·다이얼로그 없음`, card && card.beforeInvitation && !card.focusInside && card.dialogs === 0, JSON.stringify(card));
    check('F03', `${w}px 처음엔 질문·척도·다음에만`, card && card.legend === QUESTIONS.learning && !card.submit && card.labels.length === 5 && card.labels.every((l, i) => l.includes(String(i + 1)) && l.includes(SCALE[i])), JSON.stringify(card?.labels));
    check('F05', `${w}px 척도 선택지 48px·닫기 44px`, card && card.optH >= 48 && card.closeSize[0] >= 44 && card.closeSize[1] >= 44, JSON.stringify(card && [card.optH, card.closeSize]));
    const st1 = await fbState(page);
    check('F01', `${w}px 표시 순간 slot1(n=3) shown 기록`, st1.slots.learning?.['1']?.status === 'shown' && st1.slots.learning['1'].n === 3 && !!st1.lastPromptAt, JSON.stringify(st1.slots.learning));
    const beforeProject = await project(page);
    await page.check('.vf-card input[name=vf-rating][value="2"]'); await W(page, 150);
    const step2 = await page.evaluate(() => { const c = document.querySelector('.vf-card'); return { chips: [...c.querySelectorAll('.vf-chip')].map(x => x.textContent.trim()), chipH: Math.min(...[...c.querySelectorAll('.vf-chip')].map(x => x.getBoundingClientRect().height)), legend2: c.querySelectorAll('legend')[1]?.textContent, text: !!c.querySelector('#vf-text'), textFont: parseFloat(getComputedStyle(c.querySelector('#vf-text')).fontSize), privacy: c.querySelector('.vf-privacy')?.textContent, submit: !!c.querySelector('[type=submit]'), focus: document.activeElement?.value }; });
    check('F03', `${w}px 1~3점 → 아쉬운 점 칩·의견·안내·보내기, 포커스 유지`, step2.legend2?.startsWith(COPY.frictionTitle) && step2.chips.length === 4 && step2.text && step2.privacy === COPY.privacy && step2.submit && step2.focus === '2', JSON.stringify(step2));
    check('F05', `${w}px 칩 44px·입력 16px`, step2.chipH >= 44 && step2.textFont >= 16, JSON.stringify([step2.chipH, step2.textFont]));
    await page.check('.vf-card input[name=vf-chip][value=long]'); await page.fill('#vf-text', '  문제 해설이 조금 길었어요 ');
    await shot(page, `learning-${w}-answering`, '.vf-card');
    check('F05', `${w}px 카드 표시 중 가로 넘침 없음`, (await overflow(page)) <= 0 && card.cardW, await overflow(page));
    await page.click('.vf-card [type=submit]'); await W(page, 200);
    const done = await page.evaluate(() => ({ status: document.querySelector('.vf-card.vf-done')?.getAttribute('role'), text: document.querySelector('.vf-done p')?.textContent.trim() }));
    const st2 = await fbState(page), doc = st2.outbox.at(-1)?.doc;
    check('F03', `${w}px 보내기 → 감사 문구(role=status)·answered·outbox 문서`, done.status === 'status' && done.text === COPY.thanks && st2.slots.learning['1'].status === 'answered' && doc?.rating === 2 && JSON.stringify(doc.friction) === '["long"]' && doc.text === '문제 해설이 조금 길었어요' && doc.view === 'session' && doc.concept === 'market', JSON.stringify(doc));
    check('F02', `${w}px 카드 응답은 프로젝트 저장소를 바꾸지 않음`, beforeProject === await project(page));
    await page.click('[data-guide="home"],[data-view="dashboard"]'); await W(page);
    check('F03', `${w}px 화면을 떠나면 카드 사라짐·재질문 없음`, !(await page.$('.vf-card')) && (await fbState(page)).outbox.length === 1);
    check('F05', `${w}px JS 오류 없음`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ── decision: 보상 다이얼로그가 닫힌 뒤 표시, ‘다음에’ ──
  {
    const { ctx, page, errors } = await open(390, decisionStore());
    await page.fill('#f-rationale', '현장 관찰이 가설과 일부 달랐어요'); await page.fill('#f-nextAction', '역할 합의 방법 확인하기');
    await page.click('#decision-form [type=submit]'); await W(page, 500);
    const during = await page.evaluate(k => ({ dialog: !!document.querySelector('dialog[open]'), card: !!document.querySelector('.vf-card'), slots: JSON.parse(localStorage.getItem(k)).slots.decision }), FEEDBACK_KEY);
    check('F03', '결정: 보상 다이얼로그가 열려 있는 동안 카드 없음·기록 없음', during.dialog && !during.card && Object.keys(during.slots).length === 0, JSON.stringify(during));
    await page.click('[data-action="close-reward"]'); await W(page, 400);
    const after = await page.evaluate(() => ({ view: document.querySelector('.page-heading h1')?.textContent, card: !!document.querySelector('.vf-card'), afterHeading: document.querySelector('.page-heading')?.nextElementSibling?.classList.contains('vf-card'), legend: document.querySelector('.vf-card legend')?.textContent }));
    check('F03', '결정: 다이얼로그를 닫으면 기록 화면 제목 뒤에 카드', after.card && after.afterHeading && after.legend === QUESTIONS.decision, JSON.stringify(after));
    await shot(page, 'decision-390', '.vf-card');
    await page.click('.vf-card .btn.link[data-fb="skip"]'); await W(page, 200);
    const st = await fbState(page);
    check('F03', '결정: ‘다음에’ → 카드 제거·skipped·점수 없는 문서·포커스는 본문', !(await page.$('.vf-card')) && st.slots.decision['1'].status === 'skipped' && st.outbox.at(-1).doc.rating === null && st.outbox.at(-1).doc.status === 'skipped' && await page.evaluate(() => document.activeElement?.id === 'main'), JSON.stringify(st.slots.decision));
    check('F05', '결정 흐름 JS 오류 없음', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ── idea(갱신): 다이얼로그 뒤 학습 로드맵, 점수 없이 떠나면 unanswered ──
  {
    const { ctx, page, errors } = await open(1280, ideaUpdateStore());
    await page.fill('#review-problem', '팀원을 구하는 것보다 역할 합의가 더 어렵다'); await page.click('#review-form [type=submit]'); await W(page, 500);
    await page.click('[data-action="close-reward"]'); await W(page, 400);
    const on = await page.evaluate(() => ({ view: document.querySelector('.breadcrumb strong')?.textContent, legend: document.querySelector('.vf-card legend')?.textContent, afterPreview: document.querySelector('.task-preview')?.nextElementSibling?.classList.contains('vf-card') || document.querySelector('.page-heading')?.nextElementSibling?.classList.contains('vf-card') }));
    check('F03', '아이디어 갱신: 학습 로드맵에 아이디어 질문', on.view === '학습 로드맵' && on.legend === QUESTIONS.idea && on.afterPreview, JSON.stringify(on));
    await shot(page, 'idea-1280', '.vf-card');
    await page.click('.nav [data-view="projects"]'); await W(page);
    const st = await fbState(page);
    check('F03', '아이디어 갱신: 아무것도 고르지 않고 떠나면 unanswered로 닫고 전송 대기', st.slots.idea['1'].status === 'unanswered' && st.outbox.at(-1).doc.status === 'unanswered', JSON.stringify(st.slots.idea));
    check('F05', '아이디어 흐름 JS 오류 없음', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ── idea(첫 정리): born 화면 버튼 줄 앞, 4·5점이면 좋았던 점 ──
  {
    const { ctx, page, errors } = await open(390, bornStore());
    await page.click('#review-form [type=submit]'); await W(page, 500);
    const on = await page.evaluate(() => ({ born: !!document.querySelector('.born'), beforeButtons: document.querySelector('.born .vf-card')?.nextElementSibling?.classList.contains('button-row') }));
    check('F03', '첫 정리: born 화면 버튼 줄 앞에 카드', on.born && on.beforeButtons, JSON.stringify(on));
    await page.check('.vf-card input[name=vf-rating][value="5"]'); await W(page, 150);
    const legend = await page.evaluate(() => document.querySelectorAll('.vf-card legend')[1]?.textContent);
    check('F03', '4·5점 → 좋았던 점 칩', legend?.startsWith(COPY.helpedTitle), legend);
    await shot(page, 'born-390');
    await page.click('.born [data-action="dashboard"]'); await W(page);
    const st = await fbState(page);
    check('F03', '점수만 고르고 떠나도 answered로 확정', st.slots.idea['1'].status === 'answered' && st.outbox.at(-1).doc.rating === 5, JSON.stringify(st.outbox.at(-1)?.doc));
    check('F05', '첫 정리 흐름 JS 오류 없음', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ── evidence: 기록 확인 → 보상 → 학습 로드맵 ──
  {
    const { ctx, page, errors } = await open(768, evidenceStore());
    const fill = await page.$('[data-action="fill-evidence"]');
    if (fill) { await fill.click(); await W(page); }
    await page.click('#evidence-form [type=submit]').catch(() => {}); await W(page, 400);
    await page.click('[data-action="confirm-evidence"]').catch(() => {}); await W(page, 500);
    const dialog = await page.$('dialog[open]'); if (dialog) { await page.click('[data-action="close-reward"]'); await W(page, 400); }
    const on = await page.evaluate(() => ({ view: document.querySelector('.breadcrumb strong')?.textContent, legend: document.querySelector('.vf-card legend')?.textContent }));
    check('F03', '실행 기록: 학습 로드맵에 기록 질문', on.view === '학습 로드맵' && on.legend === QUESTIONS.evidence, JSON.stringify(on));
    check('F05', '실행 기록 흐름 JS 오류 없음', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ── 로드당 1개 제한: 같은 로드에서 두 번째 가치 순간(다른 카테고리)은 묻지 않고 슬롯도 남겨 둔다 ──
  {
    const s = learningStore(); fake(s, 'evidence_recorded', 2);
    const { ctx, page, errors } = await open(390, s);
    await saveApplication(page); await page.click('.vf-card .btn.link[data-fb="skip"]'); await W(page, 150);
    // 24시간 제한은 풀어 두고(과거 시각) 같은 로드의 제한만 확인
    await page.evaluate(k => { const x = JSON.parse(localStorage.getItem(k)); x.lastPromptAt = '2000-01-01T00:00:00.000Z'; localStorage.setItem(k, JSON.stringify(x)); }, FEEDBACK_KEY);
    await page.click('.nav [data-view="dashboard"]').catch(() => {}); await W(page);
    await page.evaluate(() => document.querySelector('[data-action="evidence"]')?.click()); await W(page);
    if (!(await page.$('#evidence-form'))) { await page.evaluate(() => { const b = document.createElement('button'); b.dataset.action = 'evidence'; document.body.append(b); b.click(); b.remove(); }); await W(page); }
    const fill = await page.$('[data-action="fill-evidence"]'); if (fill) { await fill.click(); await W(page); }
    await page.click('#evidence-form [type=submit]').catch(() => {}); await W(page, 400);
    await page.click('[data-action="confirm-evidence"]').catch(() => {}); await W(page, 500);
    if (await page.$('dialog[open]')) { await page.click('[data-action="close-reward"]'); await W(page, 400); }
    const st = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), FEEDBACK_KEY);
    const counted = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).events.filter(e => e.type === 'evidence_recorded').length, KEY);
    check('F01', '같은 로드의 두 번째 가치 순간: 카드 없음·슬롯 기록 없음(다음 방문 때 판단)', counted === 3 && !(await page.$('.vf-card')) && Object.keys(st.slots.evidence).length === 0, JSON.stringify({ counted, evidence: st.slots.evidence }));
    check('F05', '연속 흐름 JS 오류 없음', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ── 의견 보내기: 진입점·검증·초안·복귀 ──
  for (const w of [320, 1280]) {
    const { ctx, page, errors } = await open(w, (() => { const { s } = base(); s.route = { view: 'dashboard', projectId: 'p1' }; return s; })());
    const entries = await page.evaluate(() => [...document.querySelectorAll('[data-fb="open"]')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return [e.className.split(' ').find(c => c.endsWith('-feedback')), Math.round(r.height)]; }));
    check('F04', `${w}px 진입점 노출(${w > 820 ? '사이드바+하단' : '하단'})·44px`, entries.some(([c]) => c === 'footer-feedback') && (w > 820 ? entries.some(([c]) => c === 'side-feedback') : !entries.some(([c]) => c === 'side-feedback')) && entries.every(([, h]) => h >= 44), JSON.stringify(entries));
    await page.click('.footer-feedback'); await W(page);
    const pg = await page.evaluate(() => ({ h1: document.querySelector('main h1')?.textContent, crumb: document.querySelector('.breadcrumb strong')?.textContent, types: document.querySelectorAll('#vf-open [name=openType]').length, font: parseFloat(getComputedStyle(document.querySelector('#vf-open-text')).fontSize), privacy: document.querySelector('#vf-open .vf-privacy')?.textContent, dialogs: document.querySelectorAll('dialog[open]').length }));
    check('F04', `${w}px 전용 페이지(다이얼로그 아님)·유형 4개·입력 16px·안내`, pg.h1 === COPY.openTitle && pg.crumb === '의견 보내기' && pg.types === 4 && pg.font >= 16 && pg.privacy === COPY.privacy && pg.dialogs === 0, JSON.stringify(pg));
    await page.click('#vf-open [type=submit]'); await W(page, 200);
    check('F04', `${w}px 유형 없이 보내면 안내·이동 없음`, (await page.textContent('#toast')).includes('유형') && (await page.textContent('main h1')) === COPY.openTitle);
    await page.check('#vf-open [name=openType][value=friction]'); await page.fill('#vf-open-text', '짧음'); await page.click('#vf-open [type=submit]'); await W(page, 200);
    check('F04', `${w}px 5자 미만 안내`, (await page.textContent('#toast')).includes('5자'));
    await page.fill('#vf-open-text', '실행 기록에서 무엇을 적을지 헷갈렸어요'); await page.reload(); await W(page, 500);
    const draft = await page.evaluate(() => ({ text: document.querySelector('#vf-open-text')?.value, type: document.querySelector('#vf-open [name=openType]:checked')?.value }));
    check('F04', `${w}px 새로고침 뒤 초안 유지`, draft.text === '실행 기록에서 무엇을 적을지 헷갈렸어요' && draft.type === 'friction', JSON.stringify(draft));
    await shot(page, `open-${w}`);
    check('F05', `${w}px 의견 페이지 가로 넘침 없음`, (await overflow(page)) <= 0, await overflow(page));
    const before = JSON.parse(await project(page));
    await page.click('#vf-open [type=submit]'); await W(page, 400);
    const st = await fbState(page), d = st.outbox.at(-1)?.doc, after = JSON.parse(await project(page));
    check('F04', `${w}px 보내면 대기 안내 토스트(운영 주소 아님 → 전송 안 함)·들어온 화면 복귀·문서·초안 삭제`, (await page.textContent('#toast')) === '의견을 받았어요. 연결되면 보낼게요.' && (await page.textContent('.breadcrumb strong')) === '학습 로드맵' && d?.kind === 'open' && d.openType === 'friction' && d.view === 'dashboard' && st.openDraft === null, JSON.stringify(d));
    check('F06', `${w}px 운영 주소가 아니면 Firestore 요청 0건`, page.firestore === 0, page.firestore);
    delete before.route; delete after.route;
    check('F02', `${w}px 의견 보내기는 프로젝트 기록을 바꾸지 않음(화면 위치 제외)`, JSON.stringify(before) === JSON.stringify(after));
    await page.click('[data-view="settings"]'); await W(page);
    check('F04', `${w}px 설정 화면 진입점`, !!(await page.$('.settings-feedback')));
    await page.click('.settings-feedback'); await W(page); await page.click('#vf-open [data-fb="back"]'); await W(page);
    check('F04', `${w}px 돌아가기 → 설정`, (await page.textContent('.breadcrumb strong')) === '설정');
    check('F05', `${w}px JS 오류 없음`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
} finally {
  await browser.close(); server.close();
}
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  ${r.name}${r.info && !r.ok ? '  ' + r.info.slice(0, 400) : ''}`);
const passed = results.filter(r => r.ok).length;
console.log(`\n${passed}/${results.length} passed`);
process.exitCode = passed === results.length ? 0 : 1;
