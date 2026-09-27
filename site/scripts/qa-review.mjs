// SPEC-012 r0.2 AC-D05 나의 성장 ‘작은 배움’ 집중형 흐름 (Playwright 필요, 없으면 건너뜀)
// 사용: node site/scripts/qa-review.mjs [--shots]
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = process.env.ROOT || resolve(HERE, '../../prototype');
const SHOTS = resolve(HERE, '../qa-shots/review');
const shots = process.argv.includes('--shots');
let chromium;
try { chromium = (await import('playwright')).chromium; } catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
const { LESSONS } = await import(pathToFileURL(join(APP, 'content.mjs')).href);
if (shots) await mkdir(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = createServer(async (q, r) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; try { const b = await readFile(join(APP, p)); r.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(ok => server.listen(4307, '127.0.0.1', ok));
const browser = await chromium.launch();
const results = [];
const check = (name, ok, info = '') => results.push({ name, ok: !!ok, info: String(info ?? '') });
const L = LESSONS.find(l => l.id === 'customer'), V0 = L.variants[0], V1 = L.variants[1], AP = L.application;
const wrong = q => (q.answer + 1) % q.options.length;

try {
  for (const [label, vp] of [['390', { width: 390, height: 844 }], ['1280', { width: 1280, height: 800 }]]) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
    await page.route(/fonts\.googleapis|jsdelivr/, r => r.fulfill({ contentType: 'text/css', body: '' }));
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const W = (t = 350) => page.waitForTimeout(t);
    const S = () => page.evaluate(() => JSON.parse(localStorage.getItem('vencubator.prototype.v1')));
    const shot = async n => { if (shots) await page.screenshot({ path: join(SHOTS, `${label}-${n}.png`) }); };
    const dlg = () => page.evaluate(() => { const d = document.querySelector('dialog[open]'); return d ? { title: d.querySelector('h2')?.textContent, body: d.textContent, action: d.querySelector('footer .btn')?.textContent } : null; });
    const ui = () => page.evaluate(() => ({ labels: [...document.querySelectorAll('.review-session .session-labels span')].map(s => (s.className.includes('active') ? '*' : '') + s.textContent), meter: document.querySelector('.review-session .session-meter')?.getAttribute('aria-label'), choice: document.querySelectorAll('input[name=choice]').length, reason: document.querySelectorAll('input[name=reason]').length, h1: document.querySelector('.review-session h1')?.textContent, eyebrow: document.querySelector('.review-session .eyebrow')?.textContent }));
    await page.goto('http://127.0.0.1:4307/'); await W();
    await page.click('[data-action="sample"]'); await W(500);
    await page.click('[data-view="learning"]'); await W();
    await page.click('[data-action="lesson"][data-concept="customer"]'); await W(500);
    let u = await ui(); await shot('1-concept');
    check(`${label}: 진입 → 개념 단계(문제·선택지 숨김, 1/3)`, u.labels[0] === '*개념' && u.meter.includes('1 / 3') && u.choice === 0 && u.reason === 0 && u.h1 === L.title, JSON.stringify(u));
    await page.click('[data-review="next"]'); await W();
    u = await ui(); await shot("2-choice");
    check(`${label}: 답 고르기 단계에 답만 (2/3, 이유 숨김)`, u.labels[1] === '*문제' && u.meter.includes('2 / 3') && u.choice === 3 && u.reason === 0, JSON.stringify(u));
    await page.click('#review-answer button[type=submit]'); await W(200);
    check(`${label}: 선택 없이 다음으로 가지 않음`, (await ui()).choice === 3);
    await page.check(`input[name=choice][value="${wrong(V0)}"]`); await page.click('#review-answer button[type=submit]'); await W();
    u = await ui(); await shot('3-reason');
    check(`${label}: 이유 고르기 단계에 고른 답 요약과 이유만`, u.reason === 3 && u.choice === 0 && (await page.textContent('.answer-summary')).includes(V0.options[wrong(V0)]), JSON.stringify(u));
    await page.reload(); await W(600);
    check(`${label}: 새로고침해도 이유 단계 복원`, (await ui()).reason === 3);
    await page.click('[data-review="back"]'); await W();
    check(`${label}: 답 바꾸기 → 고른 답 유지`, await page.isChecked(`input[name=choice][value="${wrong(V0)}"]`));
    await page.click('#review-answer button[type=submit]'); await W();
    await page.click('[data-review="hint"]'); await W(250);
    const hint = await dlg(); check(`${label}: 힌트는 창으로`, hint && hint.title === '생각을 돕는 힌트', JSON.stringify(hint));
    await page.keyboard.press('Escape'); await W(200);
    const ev0 = (await S()).events.length;
    await page.check(`input[name=reason][value="${wrong({ answer: V0.reason, options: V0.reasons })}"]`); await page.click('#review-answer button[type=submit]'); await W(500);
    let d = await dlg(); await shot('4-result-wrong');
    check(`${label}: 채점 결과 창(답·이유 각각, 해설, 다른 문제로)`, d && /괜찮아요/.test(d.title) && /답 선택/.test(d.body) && /이유 선택/.test(d.body) && d.body.includes(V0.why) && /다른 문제로/.test(d.action), JSON.stringify(d));
    check(`${label}: 별도 보상 창 없음·이벤트 1건`, !(await page.$('#reward')) && (await S()).events.length === ev0 + 1);
    await page.keyboard.press('Escape'); await W(250);
    u = await ui(); await shot('5-done');
    check(`${label}: 닫으면 확인 단계(3/3)·해설 다시 보기`, u.labels[2] === '*확인' && u.meter.includes('3 / 3') && !!(await page.$('[data-review="feedback"]')), JSON.stringify(u));
    await page.click('[data-review="feedback"]'); await W(250);
    check(`${label}: 해설 다시 보기는 채점을 다시 하지 않음`, (await dlg()) && (await S()).events.length === ev0 + 1);
    await page.click('dialog[open] footer .btn'); await W(500);
    u = await ui(); check(`${label}: 결과 창 주 행동 → 두 번째 문제`, u.choice === 3 && /문제 2/.test(u.eyebrow), JSON.stringify(u));
    const xp0 = (await S()).mastery.customer?.xp || 0;
    await page.check(`input[name=choice][value="${V1.answer}"]`); await page.click('#review-answer button[type=submit]'); await W();
    await page.check(`input[name=reason][value="${V1.reason}"]`); await page.click('#review-answer button[type=submit]'); await W(500);
    d = await dlg(); const st = await S();
    check(`${label}: 정답 → XP 결과를 같은 창에, 새 상황으로`, d && /맞아요/.test(d.title) && /\+10 XP/.test(d.body) && /새 상황에 적용하기/.test(d.action) && (st.mastery.customer.xp - xp0) === 10 && st.mastery.customer.understood, JSON.stringify(d));
    await page.click('dialog[open] footer .btn'); await W(500);
    u = await ui(); await shot('6-application');
    check(`${label}: 새 상황 적용은 개념 없이 바로 (새 상황 1/2)`, u.labels.join() === '*새 상황,확인' && u.meter.includes('1 / 2') && u.choice === 3 && /새로운 상황/.test(u.eyebrow), JSON.stringify(u));
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await page.click('[data-review="exit"]'); await W();
    check(`${label}: × → 나의 성장`, (await S()).route.view === 'learning');
    await page.click('[data-action="lesson"][data-concept="customer"]'); await W(400);
    await page.click('[data-review="next"]'); await W();
    check(`${label}: 이미 푼 문제로 다시 들어오면 확인 단계(재채점 없음)`, !!(await page.$('[data-review="feedback"]')) && (await S()).events.length === st.events.length);
    check(`${label}: 가로 넘침 없음·JS 오류 없음`, ov <= 0 && errors.length === 0, `${ov} ${errors.join('|')}`);
    await ctx.close();
  }
  { // 320px 개념·답·이유 단계 가로 넘침
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } }); const page = await ctx.newPage();
    await page.route(/fonts\.googleapis|jsdelivr/, r => r.fulfill({ contentType: 'text/css', body: '' }));
    await page.goto('http://127.0.0.1:4307/'); await page.waitForTimeout(300); await page.click('[data-action="sample"]'); await page.waitForTimeout(400);
    await page.click('[data-view="learning"]'); await page.waitForTimeout(300); await page.click('[data-action="lesson"][data-concept="market"]'); await page.waitForTimeout(400);
    const o = []; o.push(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    await page.click('[data-review="next"]'); await page.waitForTimeout(300); o.push(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    const tap = await page.$$eval('.review-session .btn, .review-session .choice, .review-session .iconbtn', es => es.map(e => Math.round(e.getBoundingClientRect().height)));
    check('320: 가로 넘침 없음·조작 높이 44px 이상', o.every(v => v <= 0) && tap.every(h => h >= 44), JSON.stringify({ o, tap }));
    await ctx.close();
  }
} finally { await browser.close(); server.close(); }
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? '  (' + r.info.slice(0, 260) + ')' : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exitCode = fail ? 1 : 0;
