// SPEC-009 r0.3 AC-S05 브라우저 시나리오: / 랜딩 v3.1 → 이름표 → 앱 새 프로젝트 칸 (Playwright 필요, 없으면 건너뜀)
// 사용: node site/scripts/build.mjs && node site/scripts/qa.mjs [--shots]
// QA_FONT_ROUTE=<모듈 경로>: 웹폰트 CDN이 막힌 환경에서 폰트 요청을 대체하는 routeFonts(page) (선택)
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { startServer } from './serve.mjs';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv.includes('--shots');
let chromium;
try { chromium = (await import(process.env.QA_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.QA_PLAYWRIGHT_MODULE).href : 'playwright')).chromium; }
catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
const routeFonts = process.env.QA_FONT_ROUTE ? (await import(pathToFileURL(process.env.QA_FONT_ROUTE).href)).routeFonts : null;
if (shots) await mkdir(resolve(SITE, 'qa-shots'), { recursive: true });
const PORT = 4199, BASE = `http://127.0.0.1:${PORT}`;
const server = await startServer(PORT);
const browser = await chromium.launch();
const results = [];
const check = (name, ok, info = '') => results.push({ name, ok: !!ok, info });
const events = page => page.evaluate(() => JSON.parse(localStorage.getItem('vencubator.events.v1') || '[]'));

try {
  for (const vp of [{ n: 'desktop', width: 1440, height: 900 }, { n: 'mobile', width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    if (routeFonts) await routeFonts(page);
    const shot = async n => { if (shots) await page.screenshot({ path: resolve(SITE, `qa-shots/${vp.n}-${n}.png`) }); };

    // 1) / 는 곧바로 랜딩 v3.1 (리디렉션 없음), UTM 유지
    await page.goto(BASE + '/?utm_source=geeknews&utm_medium=community'); await page.waitForTimeout(700);
    // SPEC-018: optional first-visit chooser precedes the preserved beginner flow.
    await page.locator('[data-aud-close]').last().click();
    check(`${vp.n}: / = 랜딩 v3.1`, new URL(page.url()).pathname === '/' && await page.locator('form.l3-tag').count() === 1, page.url());
    const utm = await page.evaluate(() => sessionStorage.getItem('vencubator.utm.v1'));
    check(`${vp.n}: UTM 보관`, utm && utm.includes('geeknews'), utm);
    const text = await page.evaluate(() => document.body.innerText);
    check(`${vp.n}: 화면에 개발자용 정보 없음`, !/SPEC-|명세|기획서|\bMVP\b|\bS[123]\b|AI 개인화/.test(text), (text.match(/SPEC-|명세|기획서|\bMVP\b|\bS[123]\b|AI 개인화/) || [''])[0]);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${vp.n}: 랜딩 가로 스크롤 없음`, ov <= 0, `overflow=${ov}`);
    await shot('landing');

    // 2) 이름표 → 앱 → 새 프로젝트 칸에 문장
    const idea = '퇴근길 동네 헬스장 PT를 여럿이 나눠 받는 서비스';
    await page.fill('#idea-input', idea); await page.click('.l3-tag button[type=submit]'); await page.waitForTimeout(900);
    await page.locator('#harvest a[data-cta="prototype"]').scrollIntoViewIfNeeded();
    await page.locator('#harvest a[data-cta="prototype"]').click();
    await page.waitForURL(/\/app\/\?from=v31/); await page.waitForTimeout(400);
    await page.fill('#maker-name', 'QA'); await page.click('#login-form button[type=submit]'); await page.waitForTimeout(500); await shot('app-import');
    const d = await page.inputValue('#new-form textarea[name=description]').catch(() => 'NO-FORM');
    check(`${vp.n}: 랜딩 → 앱 새 프로젝트 칸에 문장`, d === idea, d);
    check(`${vp.n}: 가져오기 안내 표시`, await page.isVisible('.entry-hint'));
    const n0 = await page.evaluate(() => JSON.parse(localStorage.getItem('vencubator.prototype.v1')).projects.length);
    await page.click('#new-form button[type=submit]'); await page.waitForTimeout(500);
    const n1 = await page.evaluate(() => JSON.parse(localStorage.getItem('vencubator.prototype.v1')).projects.length);
    check(`${vp.n}: 확인 제출 후에만 프로젝트 생성`, n1 === n0 + 1, `${n0}→${n1}`);
    const appText = await page.evaluate(() => document.body.innerText);
    check(`${vp.n}: 앱 화면에 개발용 표기 없음`, !/프로토타입 실험실|데모 데이터|예시 문항|SPEC-/.test(appText));

    // 3) 설정: 점검 도구는 ?lab=1 에서만
    await page.click('[data-view="settings"]'); await page.waitForTimeout(300); await shot('app-settings');
    check(`${vp.n}: 설정에 점검 도구 숨김`, await page.locator('#ai-mode').count() === 0 && await page.locator('#save-fault').count() === 0);
    await page.goto(BASE + '/app/?lab=1'); await page.waitForTimeout(400);
    await page.click('[data-view="settings"]'); await page.waitForTimeout(300);
    check(`${vp.n}: ?lab=1 이면 점검 도구 표시`, await page.locator('#ai-mode').count() === 1);

    // 4) 이벤트 순서·자유 텍스트 없음
    const ev = await events(page), names = ev.map(e => e.name);
    const order = ['landing_view', 'idea_submit', 'cta_click', 'app_open', 'entry_import', 'project_create'];
    let idx = -1, ordered = true; for (const n of order) { const j = names.indexOf(n, idx + 1); if (j < 0) { ordered = false; break; } idx = j; }
    check(`${vp.n}: 이벤트 순서 기록`, ordered, names.join(','));
    check(`${vp.n}: 이벤트에 입력 문장 없음`, !JSON.stringify(ev).includes('헬스장'));
    const pc = ev.find(e => e.name === 'project_create' && e.props.from === 'v31');
    check(`${vp.n}: project_create 출처 v31·가져오기`, pc && pc.variant === 'v31' && pc.props.imported === true, JSON.stringify(pc?.props));
    const ovApp = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${vp.n}: 앱 가로 스크롤 없음`, ovApp <= 0, `overflow=${ovApp}`);
    check(`${vp.n}: JS 오류 없음`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
} finally { await browser.close(); server.close(); }
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? '  (' + r.info + ')' : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exitCode = fail ? 1 : 0;
