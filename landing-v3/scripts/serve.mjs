// 로컬 미리보기 서버. 저장소 루트를 서빙. 랜딩의 ./app/ 링크가 동작하도록 /landing-v3/app/ 을 prototype/ 으로 연결한다.
// 사용: node landing-v3/scripts/serve.mjs [port]  → http://127.0.0.1:4176/landing-v3/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = Number(process.argv[2] || process.env.PORT || 4176);
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let path = decodeURIComponent(url.pathname);
  if (path === '/') { res.writeHead(302, { location: '/landing-v3/' }); return res.end(); }
  if (path === '/landing-v3/app') { res.writeHead(301, { location: '/landing-v3/app/' + url.search }); return res.end(); }
  if (path.startsWith('/landing-v3/app/')) path = '/prototype/' + path.slice('/landing-v3/app/'.length);
  let file = normalize(join(ROOT, path));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403); return res.end(); }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(PORT, '127.0.0.1', () => console.log(`Landing v3: http://127.0.0.1:${PORT}/landing-v3/  (앱: /landing-v3/app/)`))
  .on('error', e => { console.error(e.code === 'EADDRINUSE' ? `포트 ${PORT}가 사용 중이에요. 다른 포트로: node landing-v3/scripts/serve.mjs 4186` : e.message); process.exit(1); });
