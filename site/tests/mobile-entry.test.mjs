import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildSite} from '../scripts/build.mjs';

test('site ships the mobile root redirect and a directly accessible v3.3 landing',async()=>{
  await buildSite();
  const root=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const v33=await readFile(new URL('../dist/v3.3/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../dist/app/index.html',import.meta.url),'utf8');
  assert.match(root,/matchMedia\('\(max-width: 600px\)'\)/);
  assert.match(root,/location\.replace\('\/app\/'\+safeSearch/);
  assert.match(v33,/id="demo-content"/);
  assert.match(v33,/href="\/app\/"/);
  assert.match(app,/onboarding\.css/);
});
