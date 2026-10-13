import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildSite} from '../scripts/build.mjs';

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
  assert.match(reference,/마이루틴의/);
  assert.match(reference,/flow\.mjs/);
  assert.match(app,/onboarding\.css/);
  assert.match(app,/first-project-guide\.css/);
});
