import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildSite} from '../scripts/build.mjs';
import {SCREENS,readDraft,entryPath,summaryFor,DRAFT_KEY} from '../../landing-v3.3/experience/flow.mjs';

test('reference-inspired first flow keeps fifteen screens and optional idea entry',()=>{
  assert.equal(SCREENS.length,15);
  assert.deepEqual(SCREENS.map(s=>s.phase).filter((v,i,a)=>i===0||v!==a[i-1]),[0,1,2,3]);
  assert.equal(SCREENS.at(-2).kind,'idea');
  assert.equal(SCREENS.at(-1).kind,'summary');
  assert.equal(entryPath('guide',''),'/app/?v33Explore=1');
  assert.equal(entryPath('explore','아이디어'),'/app/?v33Explore=1');
  assert.equal(entryPath('guide','아이디어'),'/app/?v33Guide=1');
  const old={stage:'new',need:'learning',time:'five',idea:''};
  const restored=readDraft({getItem:key=>key===DRAFT_KEY?JSON.stringify({...old,step:3}):null});
  assert.equal(restored.step,0);
  assert.deepEqual(summaryFor(restored).map(([,value])=>value),['아직 아이디어가 없어요','개념 하나를 배워 보기','아직 정하지 않았어요','5분만 가볍게']);
});

test('root redirects mobile; v3.3 ships saved tutorial and actual app guide',async()=>{
  await buildSite();
  const root=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const v33=await readFile(new URL('../dist/v3.3/index.html',import.meta.url),'utf8');
  const reference=await readFile(new URL('../dist/v3.3/reference/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../dist/app/index.html',import.meta.url),'utf8');
  assert.match(root,/matchMedia\('\(max-width: 600px\)'\)/);
  assert.match(root,/location\.replace\('\/app\/'\+safeSearch/);
  assert.match(v33,/나의 첫 시작/);
  assert.match(v33,/flow\.mjs/);
  assert.doesNotMatch(v33,/matchMedia\('\(max-width: 600px\)'\)/);
  const flow=await readFile(new URL('../dist/v3.3/flow.mjs',import.meta.url),'utf8');
  assert.match(flow,/vencubator\.v33\.draft\.v1/);
  assert.match(flow,/vencubator\.firstFlow\.v1/);
  assert.match(flow,/\/app\/\?v33Guide=1/);
  assert.match(flow,/\/app\/\?v33Explore=1/);
  assert.match(reference,/마이루틴의/);
  assert.match(reference,/flow\.mjs/);
  assert.match(app,/onboarding\.css/);
  assert.match(app,/first-project-guide\.css/);
});
