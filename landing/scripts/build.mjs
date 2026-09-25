// SPEC-006 AC-LP09: 사전 렌더 + CSS/JS 인라인 → landing/dist/index.html (외부 의존 없는 단일 파일, 폰트 CDN 제외)
// 사용: node landing/scripts/build.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from '../src/render.mjs';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFile(resolve(DIR, p), 'utf8');

// import/export 제거 후 이어 붙이기 (번들러 없이)
const strip = src => src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+(?=(const|function|let|class|async)\b)/gm, '');

/** opts.public: 사이트 공개 빌드(SPEC-009) — 내부 문서 링크 제외, 링크 보정 없음. opts.outFile: 출력 경로 */
export async function build(opts = {}) {
  const [html, tokens, css, track, motion, analytics] = await Promise.all([read('index.html'), read('src/tokens.css'), read('src/landing.css'), read('src/track.mjs'), read('src/motion.mjs'), read('src/analytics.mjs')]);
  // dist/는 landing/ 한 단계 아래이므로 상대 링크를 보정한다. 공개 빌드는 /v1/ 에 놓이므로 보정하지 않는다.
  const body = renderPage(opts.public ? { public: true } : { linkPrefix: '../' });
  const js = [track, motion, analytics].map(strip).join('\n') + '\nbindMotion(window);\nbindAnalytics(window);';
  const out = html
    .replace(/<!--LP:CSS-->[\s\S]*?<!--\/LP:CSS-->/, () => `<style>\n${tokens}\n${css}\n</style>`)
    .replace('<div id="app"><!--LP:BODY--></div>', () => `<div id="app" data-prerendered="1">\n${body}\n</div>`)
    .replace(/<!--LP:JS-->[\s\S]*?<!--\/LP:JS-->/, () => `<script type="module">\n${js}\n</script>`)
    .replace(/<!--LP:DEV-->[\s\S]*?<!--\/LP:DEV-->/, '')
    .replace('<!--LP:HEAD-->', '<meta name="generator" content="landing/scripts/build.mjs · SPEC-006">');
  const outFile = opts.outFile || resolve(DIR, 'dist/index.html');
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, out);
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = await build();
  console.log(`dist/index.html ${(out.length / 1024).toFixed(1)} KB`);
}
