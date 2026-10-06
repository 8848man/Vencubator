import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AUDIENCE_KEY, AUDIENCE_PATHS, validChoice, readChoice, saveChoice, audienceRoute, safeSearch, browserStorage } from '../audience/state.mjs';
import { renderChooser, renderAudiencePage } from '../audience/render.mjs';
import { COMMON, PAGES, CHOICES } from '../audience/content.mjs';
import { withAudienceShell } from '../scripts/build.mjs';
const memory = () => { const m=new Map(); return {getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)}; };
const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};

test('AC-A01~03: first/remembered/dismissed/direct/hash routing matrix',()=>{
  assert.deepEqual(audienceRoute('/'),{current:'beginner',redirect:null,prompt:true});
  for(const choice of ['beginner','experienced','tester','dismissed']) {
    const root=audienceRoute('/','',choice);
    assert.equal(root.prompt,false);
    assert.equal(root.redirect,['experienced','tester'].includes(choice)?AUDIENCE_PATHS[choice]:null);
    assert.equal(audienceRoute('/','#ask',choice).redirect,null);
    for(const [current,path] of Object.entries(AUDIENCE_PATHS)) assert.deepEqual(audienceRoute(path,'',choice),{current,redirect:null,prompt:false});
  }
});
test('AC-A03: storage version/enum corruption and blocked storage never prevent navigation',()=>{
  for(const value of ['null','{}','{oops','{"v":2,"choice":"tester"}','{"v":1,"choice":"https://evil"}']) assert.equal(validChoice(value),null);
  const local=memory(),session=memory();
  assert.equal(saveChoice('experienced',local,session),true);
  assert.equal(readChoice(local,session),'experienced');
  assert.equal(saveChoice('tester',blocked,session),true);
  assert.equal(readChoice(local,session),'tester');
  assert.equal(readChoice(blocked,blocked),null);
  assert.equal(saveChoice('dismissed',blocked,blocked),false);
  assert.equal(saveChoice('invalid',local,session),false);
  assert.equal(browserStorage({get localStorage(){throw Error();}},'localStorage'),null);
  assert.deepEqual(JSON.parse(local.getItem(AUDIENCE_KEY)),{v:1,choice:'experienced'});
});
test('AC-A03/08: URL forwarding whitelist excludes text, redirect and unknown parameters',()=>{
  assert.equal(safeSearch('?utm_source=community&utm_campaign=한글&internal=1&lab=0&idea=secret&redirect=https://evil'),'?' + new URLSearchParams({utm_source:'community',utm_campaign:'한글',internal:'1',lab:'1'}));
  assert.equal(safeSearch('?utm_source=hello%20world&internal=9&text=private'),'');
});
test('AC-A04/05/10: semantic dialog, real links, one h1 and fixed copy without unsupported claims',()=>{
  const spec=readFileSync(new URL('../../docs/specs/SPEC-018-audience-landings.md',import.meta.url),'utf8');
  const strings=v=> typeof v==='string'?[v]:Object.values(v).flatMap(strings);
  for(const s of [...strings(COMMON),...strings(PAGES)].filter(s=>/[가-힣]/.test(s))) assert.ok(spec.includes(s),s);
  for(const audience of ['experienced','tester']) {
    const html=renderAudiencePage(audience);
    assert.equal((html.match(/<h1>/g)||[]).length,1);
    assert.equal((html.match(/<section /g)||[]).length,4);
    assert.match(html,/aria-labelledby="aud-title" aria-describedby="aud-intro"/);
    assert.match(html,/<noscript><nav/);
    for(const c of CHOICES) assert.ok(html.includes(`href="${c.href}"`));
    assert.ok([...html.matchAll(/<button\b[^>]*>/g)].every(([s])=>s.includes('type="button"')));
    assert.ok(!/성공률|PMF|% 완성|보장|AI가 결정|AI가 대신|검증 완료|1위|누적 사용자/.test(html));
    assert.ok(html.includes(`href="/app/?from=${PAGES[audience].from}"`));
  }
  assert.ok(renderAudiencePage('experienced').includes('가상 예시'));
  assert.ok(renderChooser('beginner').includes('aria-live="polite"'));
});
test('AC-A07/11: composition preserves content and guards redirect initialization',async()=>{
  const original='<html><head></head><body><h1>preserved</h1><script>bindLanding(window);</script></body></html>';
  const root=await withAudienceShell(original,{root:true}),direct=await withAudienceShell(original);
  assert.match(root,/if \(!window\.__audienceRedirect\) bindLanding\(window\)/);
  assert.match(root,/back_forward/);
  assert.ok(root.includes('<h1>preserved</h1>'));
  assert.ok(!direct.includes('location.replace'));
});
test('AC-A09: text/CTA contrast and motion constraints',()=>{
  const css=readFileSync(new URL('../audience/tokens.css',import.meta.url),'utf8');
  const tokens=Object.fromEntries([...css.matchAll(/--aud-([a-z-]+):(#\w{6})(?!\w)/g)].map(m=>[m[1],m[2]]));
  const lum=hex=>{const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  for(const [fg,bg] of [['ink','paper'],['muted','paper'],['muted','surface'],['green','paper'],['surface','green'],['ink','lime'],['paper','dark'],['ink','soft']]) {
    const a=lum(tokens[fg]),b=lum(tokens[bg]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);
  }
  const style=readFileSync(new URL('../audience/style.css',import.meta.url),'utf8');
  assert.ok(!/#[0-9a-f]{3,8}\b|infinite|position:\s*sticky/i.test(style));
  assert.ok(style.includes('prefers-reduced-motion'));
});
