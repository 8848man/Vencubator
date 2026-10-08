import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsPayload,analyticsAllowed,sendAnalytics,MEASUREMENT_ID} from '../shared/track.mjs';
import {PATH} from '../../prototype/guided.mjs';
test('all shipped learning concepts retain their identifiers',()=>{
 for(const concept of PATH)assert.equal(analyticsPayload({name:'lesson_start',page:'app',props:{concept}}).concept,concept);
});
function browser(host='vencubator.vercel.app',search=''){
 const m=new Map(),scripts=[];
 return {location:{protocol:'https:',hostname:host,pathname:'/app/',search},navigator:{},sessionStorage:{getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)},document:{createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},scripts};
}
test('production only; internal sticky, lab and DNT exclusion',()=>{
 assert.equal(analyticsAllowed(browser()),true);
 for(const host of ['localhost','127.0.0.1','preview.vercel.app','vencubator.vercel.app.evil.com'])assert.equal(analyticsAllowed(browser(host)),false);
 const w=browser(undefined,'?internal=1');assert.equal(analyticsAllowed(w),false);w.location.search='';assert.equal(analyticsAllowed(w),false);
 w.location.search='?internal=0';assert.equal(analyticsAllowed(w),true);w.location.search='?lab=1';assert.equal(analyticsAllowed(w),false);
 w.location.search='';w.navigator.doNotTrack='1';assert.equal(analyticsAllowed(w),false);
});
test('allowlist drops free text, ids, arbitrary enum values and unknown events',()=>{
 const p=analyticsPayload({name:'project_create',page:'app',visitor:'secret',utm:{source:'name'},props:{from:'v3',imported:true,name:'Alice',project_id:'123'}});
 assert.deepEqual(p,{schema_version:1,stage:'prototype',environment:'production',app_version:'analytics-1',page:'app',from:'v3',imported:true});
 assert.equal(analyticsPayload({name:'private_event'}),null);
 assert.equal(analyticsPayload({name:'lesson_start',props:{concept:'Alice'}}).concept,undefined);
});
test('single script, safe URL and one page view, failures never escape',()=>{
 const w=browser(undefined,'?idea=secret#secret'),ev={name:'app_open',page:'app',props:{from:'v3'}};
 assert.equal(sendAnalytics(ev,w),true);assert.equal(sendAnalytics(ev,w),true);
 assert.equal(w.scripts.length,1);assert.ok(w.scripts[0].src.endsWith(MEASUREMENT_ID));
 const commands=w.dataLayer.map(x=>Array.from(x));assert.equal(commands.filter(x=>x[1]==='page_view').length,1);
 assert.equal(commands[1][2].page_location,'https://vencubator.vercel.app/app/');assert.ok(!JSON.stringify(commands).includes('secret'));
 w.scripts[0].onerror();assert.equal(sendAnalytics(ev,w),false);
 const broken=browser();broken.document.head.appendChild=()=>{throw Error('blocked');};assert.doesNotThrow(()=>sendAnalytics(ev,broken));
 assert.equal(sendAnalytics(ev,browser('localhost')),false);
});

test('AC-L31-06 새 enum·v31 페이지, 자유 텍스트 폐기',()=>{
 for(const [name,key,values] of [['next_click','layer',['surface','learn','ask','observe','decide','roots']],['pain_select','pain',['build','praise','interview','late']]]){
  for(const value of values)assert.equal(analyticsPayload({name,page:'v31',props:{[key]:value}})[key],value);
  const p=analyticsPayload({name,page:'v31',props:{[key]:'private text',text:'secret'}});assert.equal(p[key],undefined);assert.equal(p.text,undefined);assert.equal(p.page,'v31');
 }
 assert.equal(analyticsPayload({name:'app_open',page:'app',props:{from:'v31'}}).from,'v31');
 assert.equal(analyticsPayload({name:'landing_view',page:'v3'}).page,'v3');
});
test('SPEC-018 audience events whitelist per event and safe route attribution',()=>{
 for(const audience of ['beginner','experienced','tester'])assert.equal(analyticsPayload({name:'audience_view',page:'value',props:{audience}}).audience,audience);
 for(const audience of ['dismissed','unknown','private text'])assert.equal(analyticsPayload({name:'audience_view',props:{audience}}).audience,undefined);
 assert.equal(analyticsPayload({name:'audience_select',props:{audience:'dismissed'}}).audience,'dismissed');
 assert.equal(analyticsPayload({name:'audience_prompt',props:{placement:'first'}}).placement,'first');
 assert.equal(analyticsPayload({name:'audience_cta',props:{placement:'first'}}).placement,undefined);
 const w=browser(undefined,'?idea=private');w.location.pathname='/test/';
 sendAnalytics({name:'audience_view',page:'test',props:{audience:'tester',text:'private'}},w);
 assert.ok(JSON.stringify(w.dataLayer).includes('https://vencubator.vercel.app/test/'));
 assert.ok(!JSON.stringify(w.dataLayer).includes('private'));
});
