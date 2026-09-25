// 사이트 로컬 서버 (SPEC-009 §6). site/dist 를 제공한다. 먼저 node site/scripts/build.mjs
// 사용: node site/scripts/serve.mjs [port]  → http://127.0.0.1:4180/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 4180);
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

export function startServer(port = PORT) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const path = decodeURIComponent(url.pathname);
    let file = normalize(join(DIST, path));
    if (file !== DIST && !file.startsWith(DIST + sep)) { res.writeHead(403); return res.end(); }
    try {
      const st = await stat(file);
      if (st.isDirectory()) {
        if (!path.endsWith('/')) { res.writeHead(301, { location: path + '/' + url.search }); return res.end(); }
        file = join(file, 'index.html');
      }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Not found — node site/scripts/build.mjs 로 먼저 빌드했는지 확인해 주세요.'); }
  });
  return new Promise((ok, fail) => server.listen(port, '127.0.0.1', () => ok(server)).on('error', fail));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().then(() => console.log(`Vencubator 사이트: http://127.0.0.1:${PORT}/  (/ 랜딩 · /app/ 앱)`))
    .catch(e => { console.error(e.code === 'EADDRINUSE' ? `포트 ${PORT}가 사용 중이에요. 다른 포트로: node site/scripts/serve.mjs 4190` : e.message); process.exit(1); });
}
