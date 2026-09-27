// SPEC-005 r0.3 AC-L07 잠긴 학습 안내: 토스트로 여는 방법 + 지금 단계 강조 (Playwright 필요, 없으면 건너뜀)
// 사용: node site/scripts/qa-locked-path.mjs [--shots]
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = process.env.ROOT || resolve(HERE, '../../prototype');
const SHOTS = resolve(HERE, '../qa-shots/locked');
const shots = process.argv.includes('--shots');
let chromium;
try { chromium = (await import('playwright')).chromium; } catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
if (shots) await mkdir(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = createServer(async (q, r) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; try { const b = await readFile(join(APP, p)); r.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise(ok => server.listen(4306, '127.0.0.1', ok));
const browser = await chromium.launch();
const results = [];
const check = (name, ok, info = '') => results.push({ name, ok: !!ok, info: String(info ?? '') });
const KEY = 'vencubator.prototype.v1';

try {
  for (const [label, vp, reduced] of [['390', { width: 390, height: 844 }, false], ['1280', { width: 1280, height: 800 }, false], ['390-reduced', { width: 390, height: 844 }, true]]) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    await page.route(/fonts\.googleapis|jsdelivr/, r => r.fulfill({ contentType: 'text/css', body: '' }));
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4306/'); await page.waitForTimeout(400);
    await page.click('[data-action="sample"]'); await page.waitForTimeout(600);
    const locked = await page.$$eval('.path-stop.locked .path-node', es => es.map(e => ({ disabled: e.disabled, aria: e.getAttribute('aria-disabled'), label: e.getAttribute('aria-label') })));
    check(`${label}: 잠긴 학습 버튼은 누를 수 있고 안내 이름`, locked.length > 0 && locked.every(l => !l.disabled && l.aria === null && l.label.includes('여는 방법')), JSON.stringify(locked[0]));
    const before = await page.evaluate(k => localStorage.getItem(k), KEY);
    const evBefore = await page.evaluate(() => (JSON.parse(localStorage.getItem('vencubator.events.v1') || '[]')).length);
    // 마지막 잠긴 학습(화면 아래)을 누르면 현재 학습으로 스크롤·강조
    await page.locator('.path-stop.locked .path-node').last().scrollIntoViewIfNeeded();
    await page.locator('.path-stop.locked .path-node').last().click();
    await page.waitForTimeout(reduced ? 150 : 700);
    const st = await page.evaluate(() => { const cur = document.querySelector('.path-stop.current'), node = cur.querySelector('.path-node'), r = node.getBoundingClientRect(); const cs = getComputedStyle(node); return { nudge: cur.classList.contains('is-nudge'), focus: document.activeElement === node, inView: r.top >= 0 && r.bottom <= innerHeight, anim: cs.animationName, outline: cs.outlineColor, tag: getComputedStyle(cur.querySelector(':scope>div'), '::before').content, toast: document.querySelector('#toast').textContent, toastOn: document.querySelector('#toast').classList.contains('show'), route: JSON.parse(localStorage.getItem('vencubator.prototype.v1')).route.view }; });
    if (shots) await page.screenshot({ path: join(SHOTS, `${label}-nudge.png`) });
    check(`${label}: 토스트로 여는 방법 안내`, st.toastOn && /는 아직 열리지 않았어요/.test(st.toast) && /먼저 .*시작해 주세요/.test(st.toast), st.toast);
    check(`${label}: 현재 학습 강조·화면 안·포커스`, st.nudge && st.inView && st.focus && /여기부터/.test(st.tag) && st.outline.includes('240, 199, 94'), JSON.stringify({ nudge: st.nudge, inView: st.inView, focus: st.focus, tag: st.tag, outline: st.outline }));
    check(`${label}: ${reduced ? '모션 감소 시 움직임 없음' : '강조 움직임 있음'}`, reduced ? st.anim === 'none' : st.anim === 'path-nudge', st.anim);
    const after = await page.evaluate(k => localStorage.getItem(k), KEY);
    const evAfter = await page.evaluate(() => (JSON.parse(localStorage.getItem('vencubator.events.v1') || '[]')).length);
    check(`${label}: 학습 시작·저장·이벤트 변화 없음`, after === before && evAfter === evBefore && st.route === 'dashboard', `${evBefore}→${evAfter}, ${st.route}`);
    await page.waitForTimeout(2800);
    check(`${label}: 강조는 잠시 뒤 사라짐`, !(await page.evaluate(() => document.querySelector('.path-stop.current').classList.contains('is-nudge'))));
    // 글씨 영역을 눌러도 같은 안내, 반복하면 다시 강조
    await page.locator('.path-stop.locked > div').first().click(); await page.waitForTimeout(200);
    check(`${label}: 옆 글씨를 눌러도 안내·재강조`, await page.evaluate(() => document.querySelector('.path-stop.current').classList.contains('is-nudge') && document.querySelector('#toast').classList.contains('show')));
    // 진행 상태에 맞춘 할 일: 개념을 시작한 뒤에는 “개념부터 이어서 읽어요”
    await page.click('.path-stop.current .path-node'); await page.waitForTimeout(500);
    await page.click('[data-guide="home"]'); await page.waitForTimeout(500);
    await page.locator('.path-stop.locked .path-node').first().click(); await page.waitForTimeout(250);
    const t2 = await page.textContent('#toast');
    check(`${label}: 진행 중이면 이어서 할 일로 안내`, /개념부터 이어서 읽어요/.test(t2), t2);
    // 키보드: Enter로도 동작
    await page.locator('.path-stop.locked .path-node').nth(1).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(250);
    check(`${label}: 키보드 Enter로 안내·현재 학습으로 포커스 이동`, await page.evaluate(() => document.activeElement === document.querySelector('.path-stop.current .path-node')));
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${label}: 가로 넘침 없음·JS 오류 없음`, ov <= 0 && errors.length === 0, `${ov} ${errors.join('|')}`);
    await ctx.close();
  }
} finally { await browser.close(); server.close(); }
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? '  (' + r.info.slice(0, 260) + ')' : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exitCode = fail ? 1 : 0;
