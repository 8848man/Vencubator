import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4183);
http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const url=new URL(req.url,'http://127.0.0.1');const requestPath=decodeURIComponent(url.pathname);
 const file=path.resolve(root,'.'+(requestPath==='/'?'/index.html':requestPath));
 if(!file.startsWith(root)||!mime[path.extname(file)]||/[/\\](tests|server\.mjs)([/\\]|$)/.test(file)){res.writeHead(404);res.end('Not found');return;}
 if(!(await stat(file)).isFile())throw Error('missing');const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Vencubator prototype: http://127.0.0.1:${port}`));
