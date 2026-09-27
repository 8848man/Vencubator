// SPEC-009 r0.3 AC-S03 사이트 빌드: / = 랜딩 v3, /app/ = 앱
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { buildSite } from '../scripts/build.mjs';

const D = p => new URL('../dist/' + p, import.meta.url);

test('dist: 루트 랜딩 + 앱, 개발용 파일 제외', async () => {
  const { index } = await buildSite();
  for (const p of ['index.html', 'app/index.html', 'app/app.mjs', 'app/entry.mjs', 'app/track.mjs', '_headers']) assert.ok(existsSync(D(p)), p);
  for (const p of ['app/tests', 'app/server.mjs', 'app/README.md']) assert.ok(!existsSync(D(p)), `${p}가 배포에 포함됨`);
  assert.ok(index.includes('href="./app/?from=v3"'), '랜딩 → 앱 링크');
  assert.ok(!/href="[^"]*(docs\/|\.md")/.test(index), '공개 빌드에 내부 문서 링크');
  assert.ok(!/http:\/\/127\.0\.0\.1/.test(index), '로컬 주소가 남음');
  assert.ok(!/^\s*import\s/m.test(index) && !/^export\s/m.test(index));
  assert.ok(!index.includes('generator'), '생성기 표기');
  // L04-W08: Google Search Console URL 접두어 속성(https://vencubator.vercel.app) 소유권 확인. 삭제하면 확인이 풀린다.
  assert.match(index.slice(0, index.indexOf('</head>')), /<meta name="google-site-verification" content="jwvBptKaMeO5PcMdZK0uI49if4qb5t_4OxF00X-FMJ8">/, '루트 head에 Search Console 확인 태그');
  const app = readFileSync(D('app/index.html'), 'utf8');
  assert.ok(!/(href|src)="\/(?!\/)/.test(app), '앱에 루트 기준 경로');
});

test('L04-W09 sitemap.xml·robots.txt: 운영 절대 URL, 공개 첫 페이지만, robots에 사이트맵 위치', async () => {
  const { sitemapXml, SITE_ORIGIN } = await import('../scripts/build.mjs');
  assert.equal(SITE_ORIGIN, 'https://vencubator.vercel.app');
  const xml = readFileSync(D('sitemap.xml'), 'utf8');
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(locs, ['https://vencubator.vercel.app/']);
  assert.match(xml, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.ok(!xml.includes('/app/'), '체험 앱은 사이트맵에서 제외');
  assert.match(sitemapXml('2026-01-02'), /<lastmod>2026-01-02<\/lastmod>/);
  const robots = readFileSync(D('robots.txt'), 'utf8');
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.match(robots, /^Sitemap: https:\/\/vencubator\.vercel\.app\/sitemap\.xml$/m);
  assert.ok(!/Disallow: \/\s*$/m.test(robots), '전체 차단 금지');
});

test('앱 화면에 점검 도구는 ?lab=1 에서만', () => {
  const app = readFileSync(D('app/app.mjs'), 'utf8');
  assert.match(app, /const LAB=/);
  assert.match(app, /\$\{LAB\?`<details class="screen-help" open><summary>점검 도구<\/summary>/);
  assert.ok(!/프로토타입 실험실|데모 데이터 초기화|예시 문항/.test(app));
});

test('계측 모듈 사본이 원본과 같다', () => {
  const src = readFileSync(new URL('../shared/track.mjs', import.meta.url), 'utf8');
  for (const p of ['../../prototype/track.mjs', '../../landing-v3/src/track.mjs', '../../landing/src/track.mjs', '../../landing-v2/src/track.mjs']) assert.equal(readFileSync(new URL(p, import.meta.url), 'utf8'), src, p);
});
