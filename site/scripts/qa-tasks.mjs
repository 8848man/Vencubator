// SPEC-013 T01~T06 브라우저 통합검증 — 모바일 우선 '지금 할 일' (Playwright 필요, 없으면 건너뜀)
// 사용: node site/scripts/qa-tasks.mjs [--shots]   (도메인 함수로 만든 상태를 브라우저 저장소에 넣고 화면을 검사한다)
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = process.env.ROOT || resolve(HERE, '../../prototype');
const SHOTS = resolve(HERE, '../qa-shots/tasks');
const shots = process.argv.includes('--shots');
let chromium;
try { chromium = (await import('playwright')).chromium; } catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
const imp = f => import(pathToFileURL(join(APP, f)).href);
const { blankStore, createProject, confirmContext } = await imp('domain.mjs');
const { startLesson, moveLesson, getRun, lessonContent, answerLesson, completeLesson } = await imp('guided.mjs');
const { projectTasks, planTaskField, saveTaskMeta } = await imp('tasks.mjs');
if (shots) await mkdir(SHOTS, { recursive: true });

// ── 상태 준비: 현장 실행 대기 1, 외부 대기 1(중요도 높음), 새 학습 진행 1, 두 번째 프로젝트 ──
const prep = { target: '팀플하는 대학생', artifact: '최근 팀원을 구한 경험을 물어보기', criterion: '문제가 다르면 가설 수정하기' };
function learn(s, p, c) { startLesson(s, p.id, c); if (getRun(p, c).step === 'concept') moveLesson(s, p.id); if (getRun(p, c).step === 'question') { const q = lessonContent(c); answerLesson(s, p.id, { choice: q.answer, reason: q.reason }); moveLesson(s, p.id); } const q = lessonContent(c, 0, true); answerLesson(s, p.id, { choice: q.answer, reason: q.reason }); moveLesson(s, p.id); return completeLesson(s, p.id, prep); }
function rich({ staleScope = false } = {}) {
  const s = blankStore(); s.user = { id: 'demo-user', name: 'QA' };
  const p = createProject(s, { id: 'p1', description: '시간과 역할이 맞는 팀플 동료 찾기 서비스' });
  if (!p.context) confirmContext(s, p.id, { customer: '첫 전공 수업 신입생', problem: '팀원을 구하기 어렵다', alternative: '단톡방', solution: '시간표 매칭', value: '빠른 팀 구성' });
  const a = learn(s, p, 'customer'); planTaskField(s, p.id, a.id);
  const b = learn(s, p, 'product'); const t2 = planTaskField(s, p.id, b.id);
  const f2 = projectTasks(p).find(t => t.field?.id === t2.id);
  saveTaskMeta(s, p.id, f2.id, { status: 'waiting', priority: 'high', dueAt: '2026-10-03', minutes: 30 });
  startLesson(s, p.id, 'market');
  if (staleScope) confirmContext(s, p.id, { ...p.context, customer: '편입생' });
  createProject(s, { id: 'p2', description: '동네 반찬을 조금씩 나눠 사는 구독' });
  s.route = { view: 'dashboard', projectId: 'p1' };
  return s;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = createServer(async (q, r) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; try { const b = await readFile(join(APP, p)); r.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(ok => server.listen(4305, '127.0.0.1', ok));
const BASE = 'http://127.0.0.1:4305/';
const browser = await chromium.launch();
const results = [];
const check = (id, name, ok, info = '') => results.push({ id, name, ok: !!ok, info: String(info ?? '') });
const KEY = 'vencubator.prototype.v1';

async function open(width, height = 844, store = rich(), search = '', ctx) {
  ctx = ctx || await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.route(/fonts\.googleapis|jsdelivr/, r => r.fulfill({ contentType: 'text/css', body: '' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  if (store) { await page.goto(BASE + 'index.html?seed'); await page.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [KEY, JSON.stringify(store)]); }
  await page.goto(BASE + search); await page.waitForTimeout(450);
  return { ctx, page, errors };
}
const W = (page, t = 420) => page.waitForTimeout(t);
const route = page => page.evaluate(k => JSON.parse(localStorage.getItem(k))?.route, KEY);
const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
const shot = async (page, n) => { if (shots) await page.screenshot({ path: join(SHOTS, n + '.png') }); };
const go = async (page, sel) => { await page.click(sel); await W(page); };
const openSheet = page => go(page, '.task-fab');
const firstActiveDetail = async page => { await openSheet(page); await go(page, '.task-sheet .task-card [data-task="detail"]'); };

try {
  // ── T01 가로 넘침·상태 문구 ──
  for (const w of [320, 390, 768, 1280]) {
    const { ctx, page, errors } = await open(w);
    const seen = {};
    seen.dashboard = await overflow(page); await shot(page, `t01-${w}-dashboard`);
    await openSheet(page); seen.sheet = await overflow(page); await shot(page, `t01-${w}-sheet`);
    const beforeScroll = await saved(page);
    const expected = projectTasks(beforeScroll.projects.find(p => p.id === 'p1')).filter(t => t.status === 'active');
    const cards = await page.locator('.task-card:has(.task-progress)').evaluateAll(cards => cards.map(c => ({
      id:c.querySelector('[data-task-id]').dataset.taskId,
      current:[...c.querySelectorAll('.task-progress-track li')].findIndex(n=>n.getAttribute('aria-current')==='step'),
      done:[...c.querySelectorAll('.task-progress-track li')].map(n=>n.classList.contains('done')),
      overflow:c.scrollWidth>c.clientWidth,
      focusable:c.querySelectorAll('.task-progress button,.task-progress a,.task-progress [tabindex]').length,
      label:c.querySelector('.task-stage').textContent
    })));
    check('T07', `${w}px 카드 5단계·현재 단계 projection 일치`, cards.length===expected.length && cards.every(c=>{
      const t=expected.find(t=>t.id===c.id);return t && JSON.stringify(t.stages)===JSON.stringify(c.done) && c.current===t.stages.indexOf(false) && c.label===t.label && !c.overflow && !c.focusable;
    }), JSON.stringify(cards));
    const measure=()=>page.evaluate(()=>{const d=document.querySelector('.task-sheet'),b=d.querySelector('.focus-dialog-body');return {head:d.querySelector('header').getBoundingClientRect().top,foot:d.querySelector('footer').getBoundingClientRect().top,top:b.scrollTop,max:b.scrollHeight-b.clientHeight,outer:d.scrollTop};});
    const initial=await measure();
    await page.locator('.task-sort').hover();await page.mouse.wheel(0,600);await W(page,180);
    const scrolled=await measure();
    check('T08', `${w}px 휠로 본문만 스크롤·헤더/버튼 고정`, initial.max>0 && scrolled.top>0 && scrolled.outer===0 && Math.abs(scrolled.head-initial.head)<1 && Math.abs(scrolled.foot-initial.foot)<1,JSON.stringify(scrolled));
    await page.locator('.task-sheet .task-card [data-task="detail"]').last().focus();
    const keyboard=await measure();
    check('T08', `${w}px 아래 카드 키보드 포커스·저장 불변·명칭`,keyboard.top>0 && JSON.stringify(beforeScroll)===JSON.stringify(await saved(page)) && (await page.locator('.nav').textContent()).includes('학습 로드맵') && !(await page.locator('body').textContent()).includes('학습 길'));
    await page.locator('.task-sheet .focus-dialog-body').evaluate(b=>b.scrollTop=0);
    await go(page, '.task-sheet .task-card [data-task="detail"]'); seen.detail = await overflow(page);
    const detailStages=await page.locator('.task-timeline li').evaluateAll(nodes=>nodes.map(n=>({done:n.classList.contains('done'),current:n.getAttribute('aria-current')==='step'})));
    check('T07', `${w}px 카드와 상세 진행 표시 동일`,JSON.stringify(detailStages.map(n=>n.done))===JSON.stringify(cards[0].done) && detailStages.findIndex(n=>n.current)===cards[0].current);
    await page.click('.task-settings summary'); await W(page, 200); seen.settings = await overflow(page); await shot(page, `t01-${w}-detail`);
    await go(page, '.task-back'); await go(page, '[data-action="details"]'); seen.details = await overflow(page);
    await go(page, '.task-preview [data-task="resume"]'); seen.resume = await overflow(page);
    check('T01', `${w}px 가로 넘침 없음 (학습 로드맵·시트·상세·설정·프로젝트 상세·이어하기)`, Object.values(seen).every(v => v <= 0), JSON.stringify(seen));
    check('T01', `${w}px JS 오류 없음`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  {
    const { ctx, page } = await open(390);
    await openSheet(page);
    const states = await page.$$eval('.task-sheet .task-state', e => e.map(x => x.textContent.trim()));
    check('T01', '상태는 색과 함께 문구로 표시', states.length >= 3 && states.every(Boolean), states.join(','));
    await ctx.close();
  }

  // ── T02 터치 크기·입력 글꼴·FAB 여백 ──
  {
    const { ctx, page } = await open(390);
    const size = sel => page.$$eval(sel, es => es.filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), e.textContent.trim().slice(0, 14)]; }));
    const core = [...await size('.task-preview .btn.primary'), ...await size('.task-fab')];
    const aux = await size('.task-preview .btn.link');
    await openSheet(page);
    core.push(...await size('.task-sheet .task-card .btn'), ...await size('.task-sheet footer .btn'));
    aux.push(...await size('.task-sheet .focus-dialog-head .iconbtn'));
    const sortFont = await page.$eval('.task-sheet select', e => parseFloat(getComputedStyle(e).fontSize));
    await go(page, '.task-sheet .task-card [data-task="detail"]');
    core.push(...await size('.task-next-box .btn'));
    aux.push(...await size('.task-detail-head .btn'), ...await size('.task-settings summary'));
    await page.click('.task-settings summary'); await W(page, 200);
    const fields = await page.$$eval('.task-settings input, .task-settings select', es => es.map(e => [parseFloat(getComputedStyle(e).fontSize), Math.round(e.getBoundingClientRect().height)]));
    check('T02', '핵심 조작 최소 48px 높이', core.every(([, h]) => h >= 48), JSON.stringify(core));
    check('T02', '보조 조작 최소 44px', aux.every(([w, h]) => h >= 44 && w >= 44), JSON.stringify(aux));
    check('T02', '입력 글꼴 16px 이상·입력 높이 48px', sortFont >= 16 && fields.every(([f, h]) => f >= 16 && h >= 48), JSON.stringify({ sortFont, fields }));
    await go(page, '.task-back');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await W(page, 300);
    const gap = await page.evaluate(() => { const fab = document.querySelector('.task-fab').getBoundingClientRect(); const items = [...document.querySelectorAll('main button, main a, main p, main h2, main h3')].filter(e => e.offsetParent && e.closest('.footer-note') === null); const last = items.reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0); return Math.round(fab.top - last); });
    check('T02', '맨 아래까지 내리면 FAB가 본문을 가리지 않음', gap >= 0, `여백 ${gap}px`);
    const hoverOnly = await page.evaluate(() => [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } }).filter(r => /\.task[^{]*:hover/.test(r.selectorText || '') && /display|visibility|opacity/.test(r.cssText)).length);
    check('T02', 'hover에만 나타나는 조작 없음', hoverOnly === 0, hoverOnly);
    await ctx.close();
  }

  // ── T03 시트: 높이·내부 스크롤·닫기·Escape·포커스 복귀·주 행동 1개·중첩 없음, FAB 노출 범위 ──
  for (const w of [390, 1280]) {
    const { ctx, page } = await open(w, w > 800 ? 800 : 844);
    await page.focus('.task-fab'); await page.keyboard.press('Enter'); await W(page);
    const m = await page.evaluate(() => { const d = document.querySelector('dialog.task-sheet'); return { h: d.getBoundingClientRect().height, vh: innerHeight, over:getComputedStyle(d.querySelector('.focus-dialog-body')).overflowY, outer:getComputedStyle(d).overflowY, primary: d.querySelectorAll('.btn.primary').length, dialogs: document.querySelectorAll('dialog[open]').length, focus: document.activeElement?.id }; });
    check('T03', `${w}px 시트 높이 85% 이하·본문 스크롤·외곽 스크롤 없음`, m.h <= m.vh * 0.85 + 1 && /auto|scroll/.test(m.over) && m.outer === 'hidden', JSON.stringify(m));
    check('T03', `${w}px 시트 주 행동 1개·중첩 없음·제목에 포커스`, m.primary === 1 && m.dialogs === 1 && m.focus === 'focus-dialog-title', JSON.stringify(m));
    await page.click('.task-sheet [data-task="list"]').catch(() => {}); // 목록 안에서 다시 열어도 중첩되지 않아야 함
    check('T03', `${w}px 다시 열기 요청에도 시트 1개`, await page.evaluate(() => document.querySelectorAll('dialog[open]').length) === 1);
    await page.keyboard.press('Escape'); await W(page, 250);
    const after = await page.evaluate(() => ({ open: !!document.querySelector('dialog[open]'), focus: document.activeElement?.className || '', overflow: document.body.style.overflow }));
    check('T03', `${w}px Escape로 닫고 FAB로 포커스 복귀·스크롤 잠금 해제`, !after.open && after.focus.includes('task-fab') && after.overflow !== 'hidden', JSON.stringify(after));
    await openSheet(page); await go(page, '.task-sheet .focus-dialog-head .iconbtn');
    check('T03', `${w}px 닫기 버튼으로 닫힘`, !(await page.evaluate(() => !!document.querySelector('dialog[open]'))));
    const fabOn = {};
    fabOn.dashboard = !!await page.$('.task-fab');
    await firstActiveDetail(page); fabOn.detail = !!await page.$('.task-fab');
    await go(page, '.task-next-box [data-task="resume"]'); fabOn.resumed = !!await page.$('.task-fab'); fabOn.view = (await route(page)).view;
    check('T03', `${w}px FAB는 학습 로드맵·프로젝트 상세에만 (상세·실행·학습 중 없음)`, fabOn.dashboard && !fabOn.detail && !fabOn.resumed, JSON.stringify(fabOn));
    await ctx.close();
  }

  // ── T04 두 진입점·새로고침·프로젝트 전환·가설 변경·반복 클릭·저장 실패·다른 탭 ──
  {
    const { ctx, page, errors } = await open(390);
    // 진입점 1: 카드에서 바로 이어하기
    const cardTask = await page.getAttribute('.task-preview [data-task="resume"]', 'data-task-id');
    await go(page, '.task-preview [data-task="resume"]'); const r1 = await route(page);
    await go(page, '[data-view="dashboard"]').catch(async () => { await page.evaluate(() => document.querySelector('[data-guide="home"],[data-view="dashboard"]')?.click()); await W(page); });
    if ((await route(page)).view !== 'dashboard') { await page.evaluate(() => document.querySelector('[data-guide="home"]')?.click()); await W(page); }
    // 진입점 2: 목록 → 상세 → 이어하기 (같은 작업)
    await openSheet(page);
    await go(page, `.task-sheet [data-task="detail"][data-task-id="${cardTask}"]`);
    await go(page, '.task-next-box [data-task="resume"]'); const r2 = await route(page);
    check('T04', '두 진입점이 같은 작업·같은 화면으로 이어짐', r1.view === r2.view && JSON.stringify(r1) === JSON.stringify(r2), `${JSON.stringify(r1)} / ${JSON.stringify(r2)}`);
    await page.reload(); await W(page, 500);
    check('T04', '새로고침해도 이어하던 화면 유지', JSON.stringify(await route(page)) === JSON.stringify(r2), JSON.stringify(await route(page)));
    // 반복 클릭: 같은 작업을 여러 번 눌러도 기록이 늘지 않음
    await page.goto(BASE); await W(page);
    if ((await route(page)).view !== 'dashboard') { await page.evaluate(() => document.querySelector('[data-guide="home"]')?.click()); await W(page); }
    const before = await saved(page);
    const runsBefore = Object.keys(before.projects[0].learningRuns).length, evBefore = before.events.length;
    await page.evaluate(() => { const b = document.querySelector('.task-preview [data-task="resume"]'); b.click(); });
    await W(page, 150);
    for (let i = 0; i < 3; i++) { await page.goto(BASE); await W(page, 250); const home = await page.$('[data-guide="home"]'); if (home) { await home.click(); await W(page, 250); } const b = await page.$('.task-preview [data-task="resume"]'); if (b) { await b.click(); await b.click().catch(() => {}); await W(page, 200); } }
    const afterRep = await saved(page);
    check('T04', '반복 클릭해도 학습 기록·이벤트가 늘지 않음', Object.keys(afterRep.projects[0].learningRuns).length === runsBefore && afterRep.events.length === evBefore, `runs ${runsBefore}→${Object.keys(afterRep.projects[0].learningRuns).length}, events ${evBefore}→${afterRep.events.length}`);
    // 프로젝트 전환
    await page.goto(BASE); await W(page);
    await page.evaluate(() => document.querySelector('[data-guide="home"]')?.click()); await W(page);
    await go(page, '[data-view="projects"]');
    await go(page, '[data-action="open-project"][data-id="p2"]');
    const p2 = await route(page);
    let p2List = [];
    if (await page.$('.task-fab')) { await openSheet(page); p2List = await page.$$eval('.task-sheet [data-task="detail"]', e => e.map(x => x.dataset.taskId)); await page.keyboard.press('Escape'); await W(page, 200); }
    const p2Head = await page.textContent('.task-sheet .task-project').catch(() => '');
    await go(page, '[data-view="projects"]'); await go(page, '[data-action="open-project"][data-id="p1"]');
    if ((await route(page)).view !== 'dashboard') await go(page, '[data-view="dashboard"]');
    const n1 = await page.textContent('.task-fab strong').catch(() => '');
    check('T04', '프로젝트 전환: 다른 프로젝트 작업이 섞이지 않음', p2.projectId === 'p2' && p2List.every(id => !id.includes(':p1:')) && n1 === '3', `p2 route=${JSON.stringify(p2)}, p2 작업=${p2List.join(',')}, p1 개수=${n1}`);
    check('T04', 'JS 오류 없음 (진입·반복·전환)', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  {
    // 가설 변경: 이전 범위 작업은 기록으로 보이고 재개 불가
    const { ctx, page } = await open(390, 844, rich({ staleScope: true }));
    await openSheet(page);
    const groups = await page.$$eval('.task-sheet .task-group-title', e => e.map(x => x.textContent));
    await go(page, '.task-sheet .task-card:last-of-type [data-task="detail"]');
    const detail = await page.evaluate(() => ({ state: document.querySelector('.task-detail .task-state')?.textContent, resume: !!document.querySelector('.task-next-box [data-task="resume"]') }));
    check('T04', '가설 변경 뒤 이전 작업은 “이전 가설의 기록”·재개 버튼 없음', groups.includes('이전 가설의 기록') && detail.state === '이전 가설' && !detail.resume, JSON.stringify({ groups, detail }));
    await ctx.close();
  }
  {
    // 저장 실패: 진도·화면 불변
    const { ctx, page } = await open(390, 844, rich(), '?lab=1');
    await go(page, '[data-view="settings"]'); await page.check('#save-fault'); await W(page, 200);
    await go(page, '[data-view="dashboard"]');
    const before = await saved(page), rBefore = await route(page);
    await page.click('.task-preview [data-task="resume"]'); await W(page, 400);
    const after = await saved(page), toast = await page.textContent('#toast');
    check('T04', '저장 실패 시 화면 이동·진도 변경 없음, 안내 표시', JSON.stringify(after) === JSON.stringify(before) && (await route(page)).view === rBefore.view && /저장/.test(toast), toast);
    await ctx.close();
  }
  {
    // 다른 탭 충돌: 덮어쓰지 않음
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const A = await open(390, 844, rich(), '', ctx);
    const B = await open(390, 844, null, '', ctx);
    await B.page.evaluate(() => document.querySelector('[data-guide="home"]')?.click()); await W(B.page);
    await firstActiveDetail(B.page); await B.page.click('.task-settings summary'); await B.page.selectOption('#task-priority', 'low'); await B.page.click('#task-settings button[type=submit]'); await W(B.page);
    const afterB = await saved(B.page);
    await A.page.click('.task-preview [data-task="resume"]'); await W(A.page, 400);
    const afterA = await saved(A.page), toast = await A.page.textContent('#toast');
    check('T04', '다른 탭이 바꾼 기록을 덮어쓰지 않고 새로고침 안내', JSON.stringify(afterA) === JSON.stringify(afterB) && /다른 탭/.test(toast), toast);
    await ctx.close();
  }

  // ── T05 대기 작업과 새 학습 동시 보관, 추천순 ──
  {
    const { ctx, page } = await open(390);
    await openSheet(page);
    const groups = await page.$$eval('.task-sheet .task-group-title', e => e.map(x => x.textContent));
    const order = await page.$$eval('.task-sheet .task-state', e => e.map(x => x.textContent));
    check('T05', '진행 중 작업이 대기 작업보다 먼저, 대기 작업도 목록에 보관', groups.indexOf('이어서 할 일') === 0 && groups.includes('외부 결과를 기다리는 일') && order.lastIndexOf('진행 중') < order.indexOf('외부 대기'), JSON.stringify({ groups, order }));
    const waitingMeta = st => Object.entries(st.projects[0].taskMeta || {}).filter(([, m]) => m.status === 'waiting');
    const waitingBefore = waitingMeta(await saved(page));
    await page.keyboard.press('Escape'); await W(page, 200);
    await go(page, '.task-preview [data-task="resume"]');
    const s = await saved(page);
    check('T05', '새 학습을 이어가도 대기 작업 설정·현장 작업이 바뀌지 않음', waitingBefore.length === 1 && JSON.stringify(waitingMeta(s)) === JSON.stringify(waitingBefore) && s.projects[0].fieldTasks.length === 2 && s.projects[0].fieldTasks.every(t => t.status === 'planned'), JSON.stringify(s.projects[0].fieldTasks.map(t => t.status)));
    await ctx.close();
  }

  // ── T06 새 보상·점수·육각형·AI 평가 없음 ──
  {
    const { ctx, page } = await open(390);
    await openSheet(page); const sheet = await page.textContent('.task-sheet');
    await page.keyboard.press('Escape'); await W(page, 200);
    await firstActiveDetail(page); const detail = await page.textContent('main');
    const text = await page.evaluate(() => document.querySelector('.task-preview')?.textContent || '') + sheet + detail;
    check('T06', '작업 화면에 XP·점수·육각형·AI 평가 표현 없음', !/XP|점수|육각형|AI (평가|판정)|성공률 \d/.test(text), (text.match(/XP|점수|육각형|AI (평가|판정)/) || [''])[0]);
    const evBefore = (await saved(page)).events.length;
    await go(page, '.task-next-box [data-task="resume"]');
    const rewardOpen = await page.evaluate(() => !!document.querySelector('#reward[open], dialog#reward'));
    check('T06', '작업 재개는 보상·이벤트를 만들지 않음', !rewardOpen && (await saved(page)).events.length === evBefore, `events ${evBefore}→${(await saved(page)).events.length}`);
    await ctx.close();
  }
  // T08: touch scrolling and reduced motion use the same body and modal contract.
  {
    const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    const {page}=await open(390,844,rich(),'',ctx);
    await page.locator('.task-fab').tap();await W(page,100);
    const body=page.locator('.task-sheet .focus-dialog-body'),box=await body.boundingBox();
    const cdp=await ctx.newCDPSession(page);
    await cdp.send('Input.synthesizeScrollGesture',{x:Math.round(box.x+box.width/2),y:Math.round(box.y+box.height-35),yDistance:-240,gestureSourceType:'touch'});
    await W(page,200);
    check('T08','터치 스크롤 및 모션 감소',await body.evaluate(b=>b.scrollTop>0) && await page.locator('.task-sheet').evaluate(d=>getComputedStyle(d).animationName==='none'));
    await ctx.close();
  }
} finally {
  await browser.close(); server.close();
}
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  ${r.name}${r.info ? '  (' + r.info.slice(0, 300) + ')' : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exitCode = fail ? 1 : 0;
