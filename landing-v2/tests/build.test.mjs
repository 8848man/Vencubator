// AC-L2-09 단일 파일 빌드
import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../scripts/build.mjs';

test('dist: 사전 렌더, 인라인, 모듈 참조·개발용 이동 스크립트 없음', async () => {
  const out = await build();
  assert.ok(out.includes('data-prerendered="1"') && out.includes('<main id="main">'));
  assert.ok(!out.includes('./src/'));
  assert.ok(!/^\s*import\s/m.test(out) && !/^export\s/m.test(out));
  assert.ok(!out.includes('LP:DEV') && !out.includes("location.replace('./dist/index.html')"));
  assert.ok(out.includes('bindLanding(window);'));
  assert.ok(out.includes('href="../../docs/product/PRODUCT-BRIEF.md"'));
});
