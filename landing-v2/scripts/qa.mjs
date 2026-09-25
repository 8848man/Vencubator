// SPEC-007 AC-L2-08 브라우저 시나리오 (Playwright 필요, 없으면 건너뜀)
// 사용: node landing-v2/scripts/build.mjs && node landing-v2/scripts/qa.mjs [--shots]
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(resolve(DIR, 'dist/index.html')).href;
const shots = process.argv.includes('--shots');
let chromium;
try { chromium = (await import('playwright')).chromium; }
catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
if (shots) await mkdir(resolve(DIR, 'qa-shots'), { recursive: true });

const browser = await chromium.launch();
const results = [];
const check = (name, ok, info = '') => results.push({ name, ok: !!ok, info });

for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const reduced of [false, true]) {
    const tag = `${vp.name}${reduced ? '-reduced' : ''}`;
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(url);
    await page.waitForTimeout(400);
    const shot = async n => { if (shots) await page.screenshot({ path: resolve(DIR, `qa-shots/${tag}-${n}.png`) }); };
    const mobile = vp.width < 960;
    const cardText = async key => page.$eval(`.l2-slot[data-slot="${key}"]`, el => ({ status: el.dataset.status, flag: el.dataset.flag || '', value: el.querySelector('[data-value]').textContent }));
    const openTray = async () => { if (mobile && (await page.getAttribute('.l2-tray-toggle', 'aria-expanded')) !== 'true') await page.click('.l2-tray-toggle'); };
    const closeTray = async () => { if (mobile && (await page.getAttribute('.l2-tray-toggle', 'aria-expanded')) === 'true') await page.keyboard.press('Escape'); };

    await shot('01-hero');
    const g = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth - innerWidth }));
    check(`${tag}: h1 1개`, g.h1 === 1);
    check(`${tag}: 가로 스크롤 없음 (시작)`, g.overflow <= 0, `overflow=${g.overflow}`);

    // 빈 제출 → 안내
    await page.click('.l2-idea-form button[type=submit]');
    check(`${tag}: 빈 입력 안내`, (await page.textContent('#idea-msg')).length > 0);
    // L2I-01
    const idea = '동네 헬스장 PT를 여럿이 나눠 받는 서비스';
    await page.fill('#idea-input', idea);
    await page.click('.l2-idea-form button[type=submit]');
    await page.waitForTimeout(reduced ? 300 : 2200);
    await shot('02-idea');
    let s = await cardText('idea');
    check(`${tag}: 아이디어 칸 = 입력 문장, 내 것`, s.value === idea && s.status === 'mine', JSON.stringify(s));
    check(`${tag}: 챕터 문장 반영`, (await page.textContent('#idea .l2-sentence p')) === idea);

    // L2I-03 오답 → 다른 문항 → 정답
    await page.locator('#learn').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    const q1 = await page.textContent('[data-bind="quiz-q"]');
    await page.click('.l2-option[data-choice="0"]'); // 1번 문항 정답은 1 → 오답
    const q2 = await page.textContent('[data-bind="quiz-q"]');
    check(`${tag}: 오답 후 다른 문항`, q1 !== q2, `${q1} → ${q2}`);
    await page.click('.l2-option[data-choice="0"]'); // 2번 문항 정답 0
    s = await cardText('learn');
    check(`${tag}: 배운 개념 칸 = 다시 풀어 이해`, s.status === 'mine' && s.value.includes('다시 풀어'), s.value);
    await shot('03-learn');

    // L2I-04 고객 입력 → 저장
    await page.locator('#apply').scrollIntoViewIfNeeded();
    await page.fill('#customer-input', '회사 근처 헬스장에 다니는 30대 직장인');
    check(`${tag}: 질문지 대상 반영`, (await page.textContent('#apply [data-bind="customer"]')) === '회사 근처 헬스장에 다니는 30대 직장인');
    await page.click('[data-action="save-questions"]');
    s = await cardText('ask');
    check(`${tag}: 내 질문 칸 내 것`, s.status === 'mine' && s.value.includes('30대 직장인'), s.value);
    await page.waitForTimeout(500);
    await shot('04-apply');

    // L2I-05 달랐어요 → 경로 재배치
    await page.locator('#observe').scrollIntoViewIfNeeded();
    await page.click('[data-observe="refuted"]');
    s = await cardText('observe');
    check(`${tag}: 관찰 칸 가설 재검토 표시`, s.status === 'mine' && s.flag === 'refuted');
    const order = await page.$$eval('.l2-node', ns => ns.map(n => n.dataset.key));
    check(`${tag}: 반박 시 경로 2번째 = 전략`, order[1] === 'strategy' && order[0] === 'customer', order.join(','));
    await page.waitForTimeout(500);
    await shot('05-observe');

    // L2I-06 결정
    await page.locator('#decide').scrollIntoViewIfNeeded();
    await page.click('[data-decide="reframe"]');
    await page.waitForTimeout(600);
    await shot('06-decide');
    const filled = await page.textContent('.l2-count [data-bind="filled"]');
    check(`${tag}: 카드 5/5`, filled === '5', filled);
    await page.locator('#path').scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await shot('07-path');

    // 모바일 트레이 / 데스크톱 카드 칸 이동
    if (mobile) {
      await openTray();
      check(`${tag}: 트레이 열림`, (await page.getAttribute('.l2-tray-toggle', 'aria-expanded')) === 'true' && await page.isVisible('.l2-card-panel'));
      await page.waitForTimeout(450); await shot('08-tray');
      await page.click('.l2-slot[data-slot="learn"]');
      await page.waitForTimeout(900);
      check(`${tag}: 칸 클릭 → 트레이 닫힘`, (await page.getAttribute('.l2-tray-toggle', 'aria-expanded')) === 'false');
    } else {
      await page.click('.l2-slot[data-slot="learn"]');
      await page.waitForTimeout(900);
    }
    const top = await page.evaluate(() => Math.round(document.getElementById('learn').getBoundingClientRect().top));
    check(`${tag}: 칸 클릭 → 해당 챕터로 이동`, top >= 0 && top < 200, `top=${top}`);

    // 새로고침 복원
    await page.reload(); await page.waitForTimeout(400);
    s = await cardText('decide');
    check(`${tag}: 새로고침 후 복원`, s.status === 'mine' && (await page.textContent('.l2-count [data-bind="filled"]')) === '5');
    await page.locator('#finish').scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await shot('09-finish');
    check(`${tag}: 마무리 제목 완성`, (await page.textContent('[data-bind="finish-title"]')).includes('완성'));
    const g2 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${tag}: 가로 스크롤 없음 (끝)`, g2 <= 0, `overflow=${g2}`);
    // 처음부터
    await closeTray();
    await page.click('.l2-top [data-action="reset"]'); await page.waitForTimeout(400);
    check(`${tag}: 처음부터 → 0/5`, (await page.textContent('.l2-count [data-bind="filled"]')) === '0');
    check(`${tag}: JS 오류 없음`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
}
await browser.close();
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? '  (' + r.info + ')' : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exitCode = fail ? 1 : 0;
