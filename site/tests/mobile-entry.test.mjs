import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildSite} from '../scripts/build.mjs';

test('root and v3.3 keep the existing landing, redirect mobile widths, and ship a separate reference flow',async()=>{
  await buildSite();
  const root=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const v33=await readFile(new URL('../dist/v3.3/index.html',import.meta.url),'utf8');
  const reference=await readFile(new URL('../dist/v3.3/reference/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../dist/app/index.html',import.meta.url),'utf8');
  assert.match(root,/matchMedia\('\(max-width: 600px\)'\)/);
  assert.match(root,/location\.replace\('\/app\/'\+safeSearch/);
  assert.match(v33,/matchMedia\('\(max-width: 600px\)'\)/);
  assert.match(v33,/location\.replace\('\/app\/'\+safeSearch/);
  assert.match(v33,/vencubator\.audience\.v1/);
  assert.match(v33,/href="\/app\/\?from=v31"/);
  assert.doesNotMatch(v33,/href="\.\/app\/\?from=v31"/);
  assert.match(reference,/마이루틴의/);
  assert.match(reference,/flow\.mjs/);
  assert.match(app,/onboarding\.css/);
});
