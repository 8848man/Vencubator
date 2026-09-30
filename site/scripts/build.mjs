// SPEC-009 r0.3 사이트 조립: site/dist/{index.html(랜딩 v3.1), app/}
// 사용: node site/scripts/build.mjs  → site/dist 폴더를 그대로 정적 호스팅에 올리면 된다
import { mkdir, rm, readdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as buildLanding } from '../../landing-v3.1/scripts/build.mjs';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(SITE, '..');
const DIST = resolve(SITE, 'dist');
// 배포에 넣지 않는 개발용 파일
const APP_EXCLUDE = new Set(['tests', 'server.mjs', 'README.md', 'dist']);
// L04-W09: 검색엔진 제출용. 운영 주소 기준 절대 URL(사이트맵 규칙).
export const SITE_ORIGIN = 'https://vencubator.vercel.app';
/** 공개 페이지: 랜딩(/)과 체험 앱(/app/). */
export const SITEMAP_PATHS = ['/', '/app/'];
export function sitemapXml(date = new Date().toISOString().slice(0, 10)) {
  const urls = SITEMAP_PATHS.map(p => `  <url>\n    <loc>${SITE_ORIGIN}${p}</loc>\n    <lastmod>${date}</lastmod>\n  </url>\n`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>\n`;
}
/** 검색엔진 소유확인 메타. 어느 랜딩 버전을 루트로 빌드해도 사이트 빌드가 붙인다. 삭제하면 확인이 풀린다. */
export const VERIFICATION_METAS = [
  // L04-W08 Google Search Console (URL 접두어 속성 https://vencubator.vercel.app)
  '<meta name="google-site-verification" content="jwvBptKaMeO5PcMdZK0uI49if4qb5t_4OxF00X-FMJ8" />',
  // 네이버 서치어드바이저
  '<meta name="naver-site-verification" content="aed7135a527e86d697bfe5a53a86112012033673" />',
];
/** head에 없는 확인 메타만 head 앞쪽(charset 메타 다음, 없으면 <head> 다음)에 넣는다. 이미 있으면 그대로. */
export function withVerificationMetas(html) {
  const end = html.indexOf('</head>');
  if (end < 0) throw new Error('index.html에 </head>가 없어요');
  const head = html.slice(0, end);
  const missing = VERIFICATION_METAS.filter(m => !head.includes(m.match(/name="([^"]+)"/)[0]));
  if (!missing.length) return html;
  const m = head.match(/<meta charset[^>]*>/i) || head.match(/<head[^>]*>/i);
  const at = m ? m.index + m[0].length : end;
  return html.slice(0, at) + '\n' + missing.join('\n') + html.slice(at);
}
export const robotsTxt = () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;

async function copyDir(from, to) {
  await mkdir(to, { recursive: true });
  for (const e of await readdir(from, { withFileTypes: true })) {
    if (APP_EXCLUDE.has(e.name)) continue;
    const a = join(from, e.name), b = join(to, e.name);
    if (e.isDirectory()) await copyDir(a, b); else await copyFile(a, b);
  }
}

export async function buildSite() {
  // 이전 산출물을 지우고 다시 만든다. 삭제가 막힌 환경이면 남은 파일을 알려 준다.
  try { await rm(DIST, { recursive: true, force: true }); } catch { /* 덮어쓰기 */ }
  await mkdir(DIST, { recursive: true });
  const index = withVerificationMetas(await buildLanding({ public: true, outFile: resolve(DIST, 'index.html') }));
  await writeFile(resolve(DIST, 'index.html'), index);
  await copyDir(resolve(REPO, 'prototype'), resolve(DIST, 'app'));
  // 정적 호스팅(Netlify·Cloudflare Pages)용 기본 보안 헤더. 다른 호스트는 무시한다.
  await writeFile(resolve(DIST, 'sitemap.xml'), sitemapXml());
  await writeFile(resolve(DIST, 'robots.txt'), robotsTxt());
  await writeFile(resolve(DIST, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n');
  const leftovers = (await readdir(DIST)).filter(n => !['index.html', 'app', '_headers', 'sitemap.xml', 'robots.txt'].includes(n));
  return { index, leftovers };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await buildSite();
  console.log(`site/dist 생성: 랜딩 ${(r.index.length / 1024).toFixed(1)} KB · app 복사`);
  if (r.leftovers.length) console.warn(`주의: 이전 빌드 파일이 남아 있어요(${r.leftovers.join(', ')}). site/dist 를 지우고 다시 빌드한 뒤 배포하세요.`);
}
