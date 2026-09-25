// AC-L3-09 단일 파일 빌드
import test from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../scripts/build.mjs';

const noModules = out => !/^\s*import\s/m.test(out) && !/^export\s/m.test(out) && !out.includes('./src/');

test('dist: 사전 렌더, 인라인, 모듈 참조·개발용 이동 스크립트 없음', async () => {
  const out = await build();
  assert.ok(out.includes('data-prerendered="1"') && out.includes('<main id="main">'));
  assert.ok(noModules(out));
  assert.ok(!out.includes('LP:DEV') && !out.includes("location.replace('./dist/index.html')"));
  assert.ok(out.includes('bindLanding(window);') && out.includes("const VARIANTS = ['v1', 'v2', 'v3'];"));
  assert.ok(out.includes('href="./app/?from=v3"'));
});

test('공개 빌드: 내부 문서 링크 없음, 앱 상대 경로', async () => {
  const out = await build({ public: true, outFile: join(tmpdir(), `v3-public-${process.pid}.html`) });
  assert.ok(noModules(out));
  assert.ok(!/href="[^"]*(PRODUCT-BRIEF|SPEC-010|docs\/)/.test(out));
  assert.ok(out.includes('href="./app/?from=v3"'));
  assert.ok(!out.includes('generator') && !/SPEC-0\d\d|AC-L3|DR-G/.test(out), '공개 빌드에 개발 참조');
  assert.ok(!/\/\*/.test(out.match(/<style>[\s\S]*<\/style>/)[0]), 'CSS 주석');
});
