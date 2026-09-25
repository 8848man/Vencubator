// 로컬 미리보기 서버. 저장소 루트를 서빙하므로 ../docs 링크도 열린다.
// 사용: node landing/scripts/serve.mjs [port]  → http://127.0.0.1:4174/landing/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = Number(process.argv[2] || process.env.PORT || 4174);
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') { res.writeHead(302, { location: '/landing/' }); return res.end(); }
  // SPEC-009: 같은 사이트처럼 /app/ 을 프로토타입으로 연결
  if (path === '/app') { res.writeHead(302, { location: '/app/' + new URL(req.url, 'http://x').search }); return res.end(); }
  const mapped = path.startsWith('/app/') ? '/prototype/' + path.slice(5) : path;
  let file = normalize(join(ROOT, mapped));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(PORT, '127.0.0.1', () => console.log(`Landing: http://127.0.0.1:${PORT}/landing/`));
