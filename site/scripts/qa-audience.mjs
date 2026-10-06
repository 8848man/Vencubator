// SPEC-018 browser evidence. Uses an installed Playwright only; never installs dependencies.
// QA_PLAYWRIGHT_MODULE may point to an existing Playwright index.mjs in a bundled runtime.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { startServer } from './serve.mjs';
let chromium;
try { ({chromium}=await import(process.env.QA_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.QA_PLAYWRIGHT_MODULE).href : 'playwright')); }
catch { console.log('SKIP: installed Playwright unavailable; no browser checks or captures executed');process.exit(0); }
const results=[],out=resolve('site/qa-shots'),shots=process.argv.includes('--shots');
await mkdir(out,{recursive:true});
const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});if(!ok)console.error('FAIL',name,detail);};
const server=await startServer(4201),base='http://127.0.0.1:4201';
let browser;
const events=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('vencubator.events.v1')||'[]'));
try {
  browser=await chromium.launch({headless:true});
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const shot=async label=>{if(shots)await page.screenshot({path:resolve(out,`audience-${name}-${label}.png`),fullPage:label!=='dialog'});};
    const noOverflow=async label=>check(`${name} ${label} overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.goto(base+'/?utm_source=qa');await page.locator('.aud-dialog[open]').waitFor();
    check(`${name} initial focus`,await page.locator('#aud-title').evaluate(e=>e===document.activeElement));
    check(`${name} view deferred`,!(await events(page)).some(e=>e.name==='audience_view'));
    await noOverflow('dialog');await shot('dialog');
    for(let i=0;i<9;i++)await page.keyboard.press('Tab');
    check(`${name} focus trapped`,await page.evaluate(()=>!!document.activeElement.closest('dialog')));
    await page.keyboard.press('Escape');
    check(`${name} escape/return focus`,await page.locator('[data-aud-open]').evaluate(e=>e===document.activeElement)&&await page.locator('dialog[open]').count()===0);
    check(`${name} dismissed stored`,await page.evaluate(()=>JSON.parse(localStorage.getItem('vencubator.audience.v1')).choice)==='dismissed');
    await page.reload();await page.locator('[data-aud-open]').waitFor();
    check(`${name} dismiss persists`,await page.locator('dialog[open]').count()===0);
    await page.locator('[data-aud-open]').click();await page.locator('[data-aud-choice="experienced"]').click();await page.waitForURL('**/value/**');
    await page.locator('[data-aud-open]').waitFor();await noOverflow('value');await shot('value');
    check(`${name} value one h1`,await page.locator('h1').count()===1);
    check(`${name} UTM forwarded`,new URL(page.url()).searchParams.get('utm_source')==='qa');
    await page.locator('[data-aud-open]').click();await page.keyboard.press('Escape');
    check(`${name} reopen cancel retains choice`,await page.evaluate(()=>JSON.parse(localStorage.getItem('vencubator.audience.v1')).choice)==='experienced');
    const before=(await events(page)).filter(e=>e.name==='landing_view').length;
    await page.goto(base+'/');await page.waitForURL('**/value/');await page.locator('[data-aud-open]').waitFor();
    check(`${name} remembered redirect without beginner view`,(await events(page)).filter(e=>e.name==='landing_view').length===before);
    await page.goto(base+'/test/');await page.locator('[data-aud-open]').waitFor();
    check(`${name} direct path wins`,new URL(page.url()).pathname==='/test/'&&await page.locator('dialog[open]').count()===0);
    await noOverflow('test');await shot('test');
    check(`${name} single audience view per rendered page`,(await events(page)).filter(e=>e.name==='audience_view'&&e.props.audience==='tester').length===1);
    await page.evaluate(()=>localStorage.setItem('vencubator.landing.v31',JSON.stringify({idea:{text:'PRIVATE OLD LABEL'}})));
    await page.locator('[data-aud-cta="hero"]').click();await page.waitForURL('**/app/?from=test');await page.locator('#maker-name').waitFor();
    const ev=await events(page);
    check(`${name} tester app attribution/no import`,ev.some(e=>e.name==='app_open'&&e.props.from==='test'&&e.props.audience==='tester')&&!ev.some(e=>e.name==='entry_import'));
    check(`${name} no label in events`,!JSON.stringify(ev).includes('PRIVATE OLD LABEL'));
    // Beginner direct route retains the existing name-tag handoff.
    await page.goto(base+'/beginner/');await page.locator('[data-aud-open]').waitFor();
    check(`${name} beginner direct overrides stored experienced`,await page.locator('dialog[open]').count()===0);
    await page.fill('#idea-input','검사용 점심 선택 기록');await page.click('.l3-tag button[type=submit]');
    await page.locator('#harvest a[data-cta="prototype"]').click();await page.waitForURL('**/app/?from=v31');
    await page.fill('#maker-name','QA');await page.click('#login-form button[type=submit]');
    await page.locator('#new-form textarea[name=description]').waitFor();
    check(`${name} beginner sentence handoff`,await page.inputValue('#new-form textarea[name=description]')==='검사용 점심 선택 기록');
    check(`${name} beginner CTA audience`,(await events(page)).some(e=>e.name==='audience_cta'&&e.props.audience==='beginner'&&e.props.placement==='footer'));
    await shot('app-import');
    check(`${name} runtime errors`,errors.length===0,errors.join('\n'));await context.close();
  }
  const blocked=await browser.newContext({viewport:{width:390,height:680}});
  await blocked.addInitScript(()=>{for(const k of ['localStorage','sessionStorage'])Object.defineProperty(window,k,{get(){throw new Error('storage blocked');}});});
  const p=await blocked.newPage();await p.goto(base+'/');await p.locator('.aud-dialog[open]').waitFor();await p.locator('[data-aud-close]').last().click();
  check('blocked storage: close works and live notice',await p.locator('dialog[open]').count()===0&&await p.locator('.aud-live').textContent()==='선택을 기억하지 못했어요. 지금은 계속 둘러볼 수 있어요.');
  await p.locator('[data-aud-open]').click();await p.locator('[data-aud-choice="experienced"]').click();await p.waitForURL('**/value/');
  check('blocked storage: navigation works',new URL(p.url()).pathname==='/value/');await blocked.close();
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),n=await nojs.newPage();
  for(const path of ['/','/beginner/','/value/','/test/']) {
    const response=await n.goto(base+path);
    check(`noJS ${path} static content/links`,response.status()===200&&await n.locator('h1').count()===1&&await n.locator('noscript nav a').count()===3&&await n.locator('a[href*="/app/?from="]').count()>0);
  }
  await nojs.close();
  const extra=await browser.newContext({viewport:{width:390,height:568}}),x=await extra.newPage();
  await x.goto(base+'/');await x.locator('dialog[open]').waitFor();
  await x.locator('[data-aud-choice="tester"]').click();await x.waitForURL('**/test/');
  check('short viewport: third choice reachable',new URL(x.url()).pathname==='/test/');
  await x.goto(base+'/');await x.waitForURL('**/test/');
  check('tester preference remembered',await x.locator('dialog[open]').count()===0);
  await x.goto(base+'/#ask');await x.locator('[data-aud-open]').waitFor();
  check('root hash overrides stored tester',new URL(x.url()).pathname==='/'&&await x.locator('dialog[open]').count()===0);
  await x.goto(base+'/value/');await x.locator('[data-aud-cta="footer"]').click();await x.waitForURL('**/app/?from=value');await x.locator('#maker-name').waitFor();
  check('value footer app attribution', (await events(x)).some(e=>e.name==='app_open'&&e.props.audience==='experienced'&&e.props.from==='value'));
  await x.goto(base+'/');await x.waitForURL('**/test/');await x.locator('[data-aud-open]').click();await x.locator('[data-aud-choice="beginner"]').click();await x.waitForURL('**/beginner/');
  check('beginner selection stored',await x.evaluate(()=>JSON.parse(localStorage.getItem('vencubator.audience.v1')).choice)==='beginner');
  await x.goto(base+'/');await x.locator('[data-aud-open]').waitFor();
  check('beginner preference stays at root',new URL(x.url()).pathname==='/'&&await x.locator('dialog[open]').count()===0);
  await extra.close();
} catch(e) { check('scenario execution',false,e.stack); }
finally { if(browser)await browser.close();await new Promise(r=>server.close(r)); }
await writeFile(resolve(out,'audience-results.json'),JSON.stringify({at:new Date().toISOString(),results},null,2));
const passed=results.filter(r=>r.ok).length,failed=results.length-passed;
console.log(JSON.stringify({passed,failed,captures:shots?out:null},null,2));
if(failed)process.exitCode=1;
