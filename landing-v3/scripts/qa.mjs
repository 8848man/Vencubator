// SPEC-010 AC-L3-08 브라우저 시나리오 (Playwright 필요, 없으면 건너뜀)
// 사용: node landing-v3/scripts/build.mjs && node landing-v3/scripts/qa.mjs [--shots]
// QA_FONT_ROUTE=<모듈 경로>: 웹폰트 CDN이 막힌 환경에서 폰트 요청을 대체하는 routeFonts(page)를 불러온다(선택).
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv.includes('--shots');
let chromium;
try { chromium = (await import('playwright')).chromium; }
catch { try { chromium = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright').chromium; } catch { console.log('SKIP: playwright 없음'); process.exit(0); } }
const routeFonts = process.env.QA_FONT_ROUTE ? (await import(pathToFileURL(process.env.QA_FONT_ROUTE).href)).routeFonts : null;
if (shots) await mkdir(resolve(DIR, 'qa-shots'), { recursive: true });

const html = await readFile(resolve(DIR, 'dist/index.html'));
const PORT = 4196, BASE = `http://127.0.0.1:${PORT}/landing-v3/`;
const server = createServer((req, res) => {
  if (new URL(req.url, 'http://x').pathname === '/landing-v3/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(html); }
  res.writeHead(404); res.end();
});
await new Promise(ok => server.listen(PORT, '127.0.0.1', ok));
const browser = await chromium.launch();
const results = [];
const check = (name, ok, info = '') => results.push({ name, ok: !!ok, info });

async function open(vp, reduced = false) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  if (routeFonts) await routeFonts(page);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE);
  await page.waitForTimeout(900);
  return { ctx, page, errors };
}
const note = (page, key) => page.evaluate(k => { const n = document.querySelector(`.l3-note[data-slot="${k}"]`); return { status: n.dataset.status, flag: n.dataset.flag || '', text: n.querySelector('[data-value]').textContent.trim(), stamp: n.querySelector('[data-stamp]').textContent }; }, key);
const rootInfo = page => page.evaluate(() => ({
  off: parseFloat(document.querySelector('[data-root-main]').style.strokeDashoffset || '1'),
  depth: document.querySelector('[data-tip-depth]').textContent,
  tipVisible: document.querySelector('[data-tip]').classList.contains('is-visible')
}));
const scrollToId = (page, id, off = 40) => page.evaluate(([id, off]) => { const el = document.getElementById(id); scrollTo(0, el.getBoundingClientRect().top + scrollY - off); }, [id, off]);

try {
  for (const vp of [{ n: 'desktop', width: 1440, height: 900 }, { n: 'mobile', width: 390, height: 844 }]) {
    const { ctx, page, errors } = await open(vp);
    const shot = async n => { if (shots) await page.screenshot({ path: resolve(DIR, `qa-shots/${vp.n}-${n}.png`) }); };
    const P = vp.n;

    // 가만히 있어도 완성 (DP-12)
    check(`${P}: h1 1개`, await page.locator('h1').count() === 1);
    const examples = await Promise.all(['learn', 'ask', 'observe', 'decide'].map(k => note(page, k)));
    check(`${P}: 기본 상태 = 다 쓴 예시 기록`, examples.every(e => e.status === 'example' && e.text.length > 4 && e.stamp === '예시 기록'), examples.map(e => e.text).join(' / '));
    check(`${P}: 이름표 손글씨 자동 쓰기 (L3M-05)`, await page.evaluate(() => document.querySelector('.l3-typing').classList.contains('is-on') && document.querySelector('.l3-typing').textContent.length > 0));
    await shot('01-surface');

    // L3I-01 이름표 심기
    const idea = '퇴근길 동네 헬스장 PT를 여럿이 나눠 받는 서비스';
    await page.fill('#idea-input', idea);
    check(`${P}: 입력 중 자동 쓰기 멈춤`, await page.evaluate(() => !document.querySelector('.l3-typing').classList.contains('is-on')));
    await page.click('.l3-tag button[type=submit]');
    await page.waitForTimeout(1400);
    const learnTop = await page.evaluate(() => document.getElementById('learn').getBoundingClientRect().top);
    check(`${P}: 심기 → 겉흙으로 이동`, Math.abs(learnTop) < 120, `learnTop=${Math.round(learnTop)}`);
    check(`${P}: 이름표 문장 반영`, (await page.textContent('.l3-harvest [data-bind="idea"]')).trim() === idea);

    // 스크롤 → 뿌리·깊이 (L3M-01·02)
    const r1 = await rootInfo(page);
    await scrollToId(page, 'observe', 200); await page.waitForTimeout(400);
    const r2 = await rootInfo(page);
    check(`${P}: 스크롤하면 뿌리가 길어짐`, r2.off < r1.off, `${r1.off.toFixed(3)} → ${r2.off.toFixed(3)}`);
    check(`${P}: 깊이 눈금 증가`, parseInt(r2.depth) > parseInt(r1.depth) && r2.tipVisible, `${r1.depth} → ${r2.depth}`);

    // L3I-03 퀴즈: 오답 → 다른 문항 → 정답
    await scrollToId(page, 'learn'); await page.waitForTimeout(300);
    const q1 = await page.textContent('[data-bind="quiz-q"]');
    await page.click('.l3-option[data-choice="0"]');
    const q2 = await page.textContent('[data-bind="quiz-q"]');
    check(`${P}: 오답 → 다른 문항`, q1 !== q2 && (await page.getAttribute('[data-bind="quiz-feedback"]', 'data-tone')) === 'retry');
    await page.click('.l3-option[data-choice="0"]');
    const nl = await note(page, 'learn');
    check(`${P}: 정답 → 배운 것 = 내 기록`, nl.status === 'mine' && nl.stamp === '내 기록', nl.text);
    await page.waitForTimeout(700); await shot('02-learn');

    // L3I-04 고객 → 질문
    await scrollToId(page, 'ask'); await page.waitForTimeout(300);
    await page.fill('#customer-input', '회사 근처에서 운동하는 3년차 직장인');
    check(`${P}: 고객 이름 반영`, (await page.textContent('.l3-customer [data-bind="customer"]')).includes('3년차 직장인'));
    await page.click('[data-action="save-questions"]');
    check(`${P}: 질문 저장 → 내 기록`, (await note(page, 'ask')).status === 'mine');
    await page.waitForTimeout(700); await shot('03-ask');

    // L3I-05 달랐어요 → 우회 뿌리 + 전략 다음
    await scrollToId(page, 'observe'); await page.waitForTimeout(300);
    await page.click('[data-observe="refuted"]');
    await page.waitForTimeout(800);
    const turn = await page.evaluate(() => ({
      turned: document.querySelector('[data-soil]').classList.contains('is-turned'),
      stub: document.querySelector('[data-root-stub]').getAttribute('d').length > 10,
      next: document.querySelector('.l3-area.is-next')?.dataset.key
    }));
    const no = await note(page, 'observe');
    check(`${P}: 달랐어요 → 뿌리 방향 전환`, turn.turned && turn.stub && no.flag === 'refuted' && no.stamp === '방향 전환', JSON.stringify(turn));
    check(`${P}: 뿌리 지도에서 전략·학습이 다음`, turn.next === 'strategy');
    await scrollToId(page, 'observe', 120); await page.waitForTimeout(600); await shot('04-observe-turned');

    // L3I-06 결정 → 완성
    await scrollToId(page, 'decide'); await page.waitForTimeout(300);
    await page.click('[data-decide]');
    check(`${P}: 결정 → 내 기록`, (await note(page, 'decide')).status === 'mine');
    await page.waitForTimeout(700); await shot('05-decide');
    await scrollToId(page, 'roots'); await page.waitForTimeout(700); await shot('06-roots');
    const ht = await page.textContent('[data-bind="harvest-title"]');
    check(`${P}: 다섯 층 완성 → 수확 제목`, ht.includes('뿌리가 다 내렸어요'), ht);
    await scrollToId(page, 'harvest'); await page.waitForTimeout(700); await shot('07-harvest');
    const cta = await page.getAttribute('.l3-harvest a[data-cta="prototype"]', 'href');
    check(`${P}: 앱 연결 링크 (from=v3)`, /app\/\?from=v3$/.test(cta), cta);

    // 계측 (SPEC-009 §4): 자유 텍스트 없음
    const ev = await page.evaluate(() => JSON.parse(localStorage.getItem('vencubator.events.v1') || '[]'));
    const names = ev.map(e => e.name);
    check(`${P}: 이벤트 기록 page=v3`, names.includes('landing_view') && names.includes('idea_submit') && names.includes('card_progress') && ev.every(e => e.page === 'v3'), names.join(','));
    check(`${P}: 이벤트에 입력 문장 없음`, !JSON.stringify(ev).includes('헬스장'));

    // L3I-09 새로고침 복원
    await page.reload(); await page.waitForTimeout(900);
    const kept = await Promise.all(['learn', 'ask', 'observe', 'decide'].map(k => note(page, k)));
    check(`${P}: 새로고침 복원`, kept.every(k => k.status === 'mine') && (await page.inputValue('#idea-input')) === idea);

    // 가로 스크롤·오류
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${P}: 가로 스크롤 없음`, ov <= 0, `overflow=${ov}`);

    // L3I-07 처음부터
    await page.click('.l3-harvest [data-action="reset"]'); await page.waitForTimeout(600);
    check(`${P}: 처음부터 → 예시 상태`, (await note(page, 'decide')).status === 'example' && (await page.inputValue('#idea-input')) === '');
    check(`${P}: JS 오류 없음`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // 모션 감소: 최종 상태
  {
    const { ctx, page, errors } = await open({ width: 1440, height: 900 }, true);
    const r = await rootInfo(page);
    const faded = await page.evaluate(() => [...document.querySelectorAll('.l3-rise, .l3-note, .l3-panel')].filter(el => parseFloat(getComputedStyle(el).opacity) < 1).length);
    check('reduced: 뿌리 전체·눈금 숨김', r.off === 0 && !r.tipVisible, JSON.stringify(r));
    check('reduced: 진입 효과 없음', faded === 0, `faded=${faded}`);
    check('reduced: 자동 쓰기 없음', await page.evaluate(() => !document.querySelector('.l3-typing').classList.contains('is-on')));
    if (shots) { await scrollToId(page, 'ask'); await page.waitForTimeout(200); await page.screenshot({ path: resolve(DIR, 'qa-shots/reduced-ask.png') }); }
    check('reduced: JS 오류 없음', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter(r => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? `  (${r.info})` : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} 통과`);
process.exit(failed.length ? 1 : 0);
