// AC-L3-09: 사전 렌더 + CSS/JS 인라인 → landing-v3.2/dist/index.html (웹폰트 CDN 제외 외부 의존 없음)
// 사용: node landing-v3.2/scripts/build.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from '../src/render.mjs';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFile(resolve(DIR, p), 'utf8');
// 모듈 간 import/export를 제거하고 의존 순서대로 이어 붙인다 (외부 번들러 없이)
const strip = src => src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+(?=(const|function|let|class|async)\b)/gm, '');

// 공개 빌드: 사용자에게 필요 없는 개발 정보(주석, 명세 참조, 생성기 표기)를 페이지 소스에서도 뺀다
const dropCssComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n{2,}/g, '\n');
const dropJsLineComments = js => js.replace(/^\s*\/\*[\s\S]*?\*\/\s*$/gm, '').replace(/([;{,)])[ \t]+\/\/ [^'"`\n]*$/gm, '$1').split('\n').filter(l => !/^\s*\/\/(?!\/)/.test(l)).join('\n');

/** opts.public: 사이트 공개 빌드(SPEC-009 r0.3, 루트 배포) — 개발 주석 제거. opts.outFile: 출력 경로 */
export async function build(opts = {}) {
  const [html, tokens, css, track, content, state, interact] = await Promise.all(['index.html', 'src/tokens.css', 'src/landing.css', 'src/track.mjs', 'src/content.mjs', 'src/state.mjs', 'src/interact.mjs'].map(read));
  const body = renderPage({ public: !!opts.public });
  let js = [track, content, state, interact].map(strip).join('\n') + '\nbindLanding(window);';
  let style = `${tokens}\n${css}`;
  if (opts.public) { js = dropJsLineComments(js); style = dropCssComments(style); }
  const out = html
    .replace(/<!--LP:DEV-->[\s\S]*?<!--\/LP:DEV-->/, '')
    .replace('<!--LP:HEAD-->', opts.public ? '' : '<meta name="generator" content="landing-v3.2/scripts/build.mjs · SPEC-017">')
    .replace(/<!--LP:CSS-->[\s\S]*?<!--\/LP:CSS-->/, () => `<style>\n${style}\n</style>`)
    .replace('<div id="app"><!--LP:BODY--></div>', () => `<div id="app" data-prerendered="1">\n${body}\n</div>`)
    .replace(/<!--LP:JS-->[\s\S]*?<!--\/LP:JS-->/, () => `<script type="module">\n${js}\n</script>`)
    .replace(/\n\n+/g, '\n');
  const outFile = opts.outFile || resolve(DIR, 'dist/index.html');
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, out);
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = await build();
  console.log(`dist/index.html ${(out.length / 1024).toFixed(1)} KB`);
}
