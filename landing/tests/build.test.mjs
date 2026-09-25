// AC-LP09: 단일 파일 빌드
import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../scripts/build.mjs';

test('AC-LP09 dist/index.html: 사전 렌더, CSS/JS 인라인, 로컬 모듈 참조 없음', async () => {
  const out = await build();
  assert.ok(out.includes('data-prerendered="1"'));
  assert.ok(out.includes('<main id="main">'));
  assert.ok(!out.includes('./src/'), '로컬 src 참조 남음');
  assert.ok(!/^\s*import\s/m.test(out), 'import 문 남음');
  assert.ok(!/^export\s/m.test(out), 'export 문 남음');
  assert.ok(out.includes('bindMotion(window);'));
  assert.ok(!out.includes('LP:DEV') && !out.includes("location.replace('./dist/index.html')"), 'dist에 file:// 리다이렉트가 남으면 무한 이동');
  assert.ok(out.includes('href="../../docs/product/PRODUCT-BRIEF.md"'), 'dist 기준 문서 링크 보정');
});
