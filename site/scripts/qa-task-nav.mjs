// SPEC-013 r0.2 T04: '지금 할 일' 작업 상세 돌아가기 (앱 버튼·브라우저 뒤로·새로고침·목록 재선택) + 카드 강조 (Playwright 필요)
// 사용: node site/scripts/qa-task-nav.mjs
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
let chromium;
try { chromium = (await import('playwright')).chromium; } catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
const ROOT = process.env.ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '../../prototype');
const T = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.css': 'text/css' };
const srv = createServer(async (q, r) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; try { const b = await readFile(join(ROOT, p)); r.writeHead(200, { 'content-type': T[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } }).listen(4302);
const b = await chromium.launch();
const res = []; const check = (n, ok, i = '') => res.push([ok ? 'PASS' : 'FAIL', n, i]);
for (const vp of [{ n: 'm', width: 390, height: 844 }, { n: 'd', width: 1280, height: 800 }]) {
  const page = await (await b.newContext({ viewport: vp })).newPage();
  await page.route(/fonts\.googleapis|jsdelivr/, r => r.fulfill({ contentType: 'text/css', body: '' }));
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const route = () => page.evaluate(() => JSON.parse(localStorage.getItem('vencubator.prototype.v1'))?.route);
  const dlg = () => page.evaluate(() => !!document.querySelector('dialog[open]'));
  const W = t => page.waitForTimeout(t || 450);
  await page.goto('http://127.0.0.1:4302/'); await W();
  await page.click('[data-action="sample"]'); await W(700);
  
  // 1 in-app back from dashboard
  await page.click('.task-fab'); await W(); await page.click('.task-sheet [data-task="detail"]'); await W();
  let r = await route(); check(`${vp.n} 상세 진입 from=dashboard`, r.view === 'taskdetail' && r.from === 'dashboard', JSON.stringify(r));
  const label = await page.textContent('.task-back'); check(`${vp.n} 뒤로 버튼 이름`, label.includes('학습 길'), label);
  await page.click('.task-back'); await W();
  r = await route(); check(`${vp.n} 앱 뒤로 → 학습 길, 다이얼로그 없음`, r.view === 'dashboard' && !(await dlg()), JSON.stringify(r));
  // 2 browser back
  await page.click('.task-fab'); await W(); await page.click('.task-sheet [data-task="detail"]'); await W();
  await page.goBack(); await W();
  r = await route(); check(`${vp.n} 브라우저 뒤로 → 학습 길`, r.view === 'dashboard' && page.url().startsWith('http://127.0.0.1:4302/'), JSON.stringify(r) + ' ' + page.url());
  // 3 from details
  await page.evaluate(() => document.querySelector('[data-action="details"]')?.click()); await W();
  r = await route();
  if (r.view === 'details') {
    await page.click('.task-fab'); await W(); await page.click('.task-sheet [data-task="detail"]'); await W();
    check(`${vp.n} 프로젝트 상세에서 진입 라벨`, (await page.textContent('.task-back')).includes('프로젝트 상세'));
    await page.click('.task-back'); await W();
    r = await route(); check(`${vp.n} 앱 뒤로 → 프로젝트 상세`, r.view === 'details', JSON.stringify(r));
  } else check(`${vp.n} details 이동 가능`, false, JSON.stringify(r));
  // 4 list from detail, pick again, back keeps origin; bottom back button
  await page.click('.task-fab'); await W(); await page.click('.task-sheet [data-task="detail"]'); await W();
  await page.click('.task-detail-head [data-task="list"]'); await W(); check(`${vp.n} 상세에서 전체 작업 시트`, await dlg());
  await page.click('.task-sheet [data-task="detail"]'); await W();
  await page.click('.task-detail > .btn.link.wide[data-task="back"]'); await W();
  r = await route(); check(`${vp.n} 하단 돌아가기 → 원래 화면(프로젝트 상세)`, r.view === 'details' && !(await dlg()), JSON.stringify(r));
  // 5 resume then browser back -> origin
  await page.click('[data-view="dashboard"]').catch(() => page.evaluate(() => document.querySelector('[data-view="dashboard"]').click())); await W();
  await page.click('.task-fab'); await W(); await page.click('.task-sheet [data-task="detail"]'); await W();
  await page.click('.task-next-box [data-task="resume"]'); await W();
  const rv = (await route()).view;
  await page.goBack(); await W();
  r = await route(); check(`${vp.n} 상세→시작(${rv})→브라우저 뒤로 → 학습 길`, r.view === 'dashboard', JSON.stringify(r));
  // 6 reload on detail keeps origin
  await page.click('.task-fab'); await W(); await page.click('.task-sheet [data-task="detail"]'); await W();
  await page.reload(); await W(700);
  await page.click('.task-back'); await W();
  r = await route(); check(`${vp.n} 새로고침 후 앱 뒤로 → 학습 길`, r.view === 'dashboard', JSON.stringify(r));
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); check(`${vp.n} 가로 넘침 없음`, ov <= 0, ov);
  // contrast of preview
  const c = await page.evaluate(() => { const e = document.querySelector('.task-preview'); const s = getComputedStyle(e); return s.backgroundImage.slice(0, 40); });
  check(`${vp.n} 카드 강조 배경`, c.includes('gradient'), c);
  check(`${vp.n} JS 오류 없음`, errs.length === 0, errs.join('|'));
}
for (const x of res) console.log(x.join('  '));
console.log(res.filter(x => x[0] === 'PASS').length + '/' + res.length);
process.exitCode = res.some(x => x[0] === 'FAIL') ? 1 : 0;
await b.close(); srv.close();
