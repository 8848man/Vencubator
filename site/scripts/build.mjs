// SPEC-009 r0.3 사이트 조립: site/dist/{index.html(랜딩 v3), app/}
// 사용: node site/scripts/build.mjs  → site/dist 폴더를 그대로 정적 호스팅에 올리면 된다
import { mkdir, rm, readdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as buildLanding } from '../../landing-v3/scripts/build.mjs';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(SITE, '..');
const DIST = resolve(SITE, 'dist');
// 배포에 넣지 않는 개발용 파일
const APP_EXCLUDE = new Set(['tests', 'server.mjs', 'README.md', 'dist']);

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
  const index = await buildLanding({ public: true, outFile: resolve(DIST, 'index.html') });
  await copyDir(resolve(REPO, 'prototype'), resolve(DIST, 'app'));
  // 정적 호스팅(Netlify·Cloudflare Pages)용 기본 보안 헤더. 다른 호스트는 무시한다.
  await writeFile(resolve(DIST, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n');
  const leftovers = (await readdir(DIST)).filter(n => !['index.html', 'app', '_headers'].includes(n));
  return { index, leftovers };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await buildSite();
  console.log(`site/dist 생성: 랜딩 ${(r.index.length / 1024).toFixed(1)} KB · app 복사`);
  if (r.leftovers.length) console.warn(`주의: 이전 빌드 파일이 남아 있어요(${r.leftovers.join(', ')}). site/dist 를 지우고 다시 빌드한 뒤 배포하세요.`);
}
