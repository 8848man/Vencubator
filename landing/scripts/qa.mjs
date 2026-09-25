// SPEC-006 AC-LP06 브라우저 검사 (Playwright 필요, 없으면 건너뜀).
// 사용: node landing/scripts/build.mjs && node landing/scripts/qa.mjs [--shots]
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
catch { try { const g = execSync('npm root -g').toString().trim(); chromium = createRequire(g + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }

const browser = await chromium.launch();
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok, info }); };
if (shots) await mkdir(resolve(DIR, 'qa-shots'), { recursive: true });

for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const reduced of [false, true]) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: reduced ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const tag = `${vp.name}${reduced ? '-reduced' : ''}`;
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll('h1').length,
      motion: document.documentElement.classList.contains('motion-on'),
      stickyPos: getComputedStyle(document.querySelector('.lp-story-stage')).position,
      height: document.documentElement.scrollHeight
    }));
    check(`${tag}: 가로 스크롤 없음`, r.overflow <= 0, `overflow=${r.overflow}`);
    check(`${tag}: h1 1개`, r.h1 === 1);
    check(`${tag}: 모션 모드`, r.motion === !reduced && (reduced ? r.stickyPos !== 'sticky' : r.stickyPos === 'sticky'), `motion=${r.motion} stage=${r.stickyPos}`);
    // 섹션별 스크롤 스냅샷 + 상태 검사
    const probes = ['hero', 'grow@0.1', 'grow@0.5', 'grow@0.9', 'principles', 'route', 'areas', 'bridge@0.1', 'bridge@0.8', 'story@0.05', 'story@0.5', 'story@0.95', 'growth', 'status', 'faq', 'start'];
    for (const pr of probes) {
      const [id, frac] = pr.split('@');
      const info = await page.evaluate(([id, frac]) => {
        const el = document.getElementById(id);
        const y = el.offsetTop + (frac ? (el.offsetHeight - innerHeight) * Number(frac) : -80);
        window.scrollTo(0, Math.max(0, y));
        return y;
      }, [id, frac]);
      await page.waitForTimeout(900);
      if (id === 'story' && !reduced) {
        const idx = await page.evaluate(() => document.getElementById('lp-story-index').textContent);
        const exp = { '0.05': '01', '0.5': '03', '0.95': '05' }[frac];
        check(`${tag}: story ${frac} → ${exp}`, idx === exp, `got ${idx}`);
      }
      if (id === 'grow' && frac === '0.9' && !reduced) {
        const idx = await page.evaluate(() => document.getElementById('lp-type-index').textContent);
        check(`${tag}: type index 03`, idx === '03', idx);
      }
      if (shots) await page.screenshot({ path: resolve(DIR, `qa-shots/${tag}-${pr.replace('@', '_')}.png`) });
    }
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.5) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } });
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.lp-reveal, .lp-card-reveal')].filter(e => !e.classList.contains('is-visible')).length);
    check(`${tag}: 전체 스크롤 후 reveal 모두 표시`, hidden === 0, `hidden=${hidden}`);
    const sticky = await page.evaluate(() => { window.scrollTo(0, document.getElementById('areas').offsetTop); return new Promise(r => setTimeout(() => r(document.querySelector('.lp-sticky').classList.contains('is-visible')), 400)); });
    check(`${tag}: sticky CTA 중간 구간 표시`, sticky);
    check(`${tag}: JS 오류 없음`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
}
await browser.close();
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? '  (' + r.info + ')' : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exitCode = fail ? 1 : 0;
