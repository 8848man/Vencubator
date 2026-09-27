// SPEC-014 r0.2 AC-G08~G12: scripts/gitflow.mjs (임시 저장소와 로컬 bare 원격으로 검사)
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { branchName, wOf, commitMessage, chooseBase, stackOf, prBaseOf, makeGit, start, commitWith, finish, handoff, guard, FlowError } from '../gitflow.mjs';

const hasGit = spawnSync('git', ['--version']).status === 0;
const sh = (cwd, ...args) => { const r = spawnSync('git', args, { cwd, encoding: 'utf8' }); if (r.status) throw Error(r.stderr); return r.stdout.trim(); };
const quiet = () => {};
function repo() {
  const d = mkdtempSync(join(tmpdir(), 'gitflow-')), remote = join(d, 'remote.git'), work = join(d, 'work');
  sh(d, 'init', '-q', '--bare', '-b', 'main', remote);
  sh(d, 'clone', '-q', remote, work);
  for (const [k, v] of [['user.name', 'T'], ['user.email', 't@example.com'], ['commit.gpgsign', 'false']]) sh(work, 'config', k, v);
  mkdirSync(join(work, 'docs/execution/checkpoints'), { recursive: true });
  writeFileSync(join(work, 'README.md'), 'hi\n');
  writeFileSync(join(work, 'docs/execution/checkpoints/CP-0001.md'), '# CP-0001\n');
  sh(work, 'add', '-A'); sh(work, 'commit', '-q', '-m', 'init'); sh(work, 'push', '-q', '-u', 'origin', 'main');
  return { d, remote, work, git: makeGit(work) };
}

test('이름·W-ID·메시지 형식 (순수 함수)', () => {
  assert.equal(branchName('P05-W06', 'review-focus'), 'w/P05-W06-review-focus');
  assert.throws(() => branchName('p5', 'x'), FlowError);
  assert.throws(() => branchName('OPS-W01', 'Bad Slug'), FlowError);
  assert.equal(wOf('w/OPS-W01-gitflow'), 'OPS-W01');
  assert.equal(wOf('main'), null);
  const m = commitMessage({ w: 'OPS-W01', kind: 'feat', summary: '  도구  추가 ', spec: 'SPEC-014 r0.2', validation: '12/12', cp: 'CP-0066', agent: 'a', trailers: ['Co-Authored-By: X <x@y>'] });
  assert.match(m, /^\[OPS-W01\] feat: 도구 추가 \(CP-0066\)\n\nKind: feat\nSpec: SPEC-014 r0.2\nValidation: 12\/12\nCP: CP-0066\nAgent: a\n\nCo-Authored-By: X <x@y>\n$/);
  assert.throws(() => commitMessage({ w: 'OPS-W01', kind: 'wip', summary: 'x' }), FlowError);
  assert.throws(() => commitMessage({ w: 'OPS-W01', kind: 'feat', summary: ' ' }), FlowError);
});

test('기반 선택·쌓인 순서·PR base', () => {
  assert.equal(chooseBase({ current: 'w/A-W01-x', currentMerged: false, hasOriginMain: true }), 'w/A-W01-x');
  assert.equal(chooseBase({ current: 'w/A-W01-x', currentMerged: true, hasOriginMain: true }), 'origin/main');
  assert.equal(chooseBase({ current: 'main', currentMerged: true, hasOriginMain: false }), 'main');
  assert.equal(chooseBase({ current: 'w/A-W01-x', explicit: 'main' }), 'main');
  const bases = { 'w/C-W01-c': 'w/B-W01-b', 'w/B-W01-b': 'sync/x', 'sync/x': 'origin/main' };
  assert.deepEqual(stackOf('w/C-W01-c', b => bases[b]), ['sync/x', 'w/B-W01-b', 'w/C-W01-c']);
  assert.equal(prBaseOf('sync/x', b => bases[b]), 'main');
  assert.equal(prBaseOf('w/B-W01-b', b => bases[b]), 'sync/x');
});

test('AC-G08 start: 기반 자동 선택, 쌓기, 더러운 트리 거부·--carry', { skip: !hasGit }, () => {
  const { work, git } = repo();
  const a = start(git, { w: 'OPS-W01', slug: 'first', log: quiet });
  assert.equal(a.base, 'origin/main'); assert.equal(git.branch(), 'w/OPS-W01-first');
  assert.equal(git.config('branch.w/OPS-W01-first.vencubatorBase'), 'origin/main');
  writeFileSync(join(work, 'a.txt'), 'a');
  assert.throws(() => start(git, { w: 'OPS-W02', slug: 'second', log: quiet }), /커밋되지 않은 변경/);
  commitWith(git, { kind: 'feat', summary: 'a 추가', paths: ['a.txt'], log: quiet });
  const b = start(git, { w: 'OPS-W02', slug: 'second', log: quiet });
  assert.equal(b.base, 'w/OPS-W01-first', '병합 안 된 작업 위에 쌓음');
  writeFileSync(join(work, 'b.txt'), 'b');
  const c = start(git, { w: 'OPS-W03', slug: 'third', carry: true, log: quiet });
  assert.equal(c.base, 'w/OPS-W02-second'); assert.ok(existsSync(join(work, 'b.txt')));
  assert.throws(() => start(git, { w: 'OPS-W03', slug: 'third', log: quiet }), /이미 있는 브랜치/);
});

test('AC-G09 commit: 명시 경로만, main 거부, 빈 커밋 거부, 커밋된 CP 수정 거부, 메시지', { skip: !hasGit }, () => {
  const { work, git } = repo();
  writeFileSync(join(work, 'x.txt'), 'x');
  assert.throws(() => commitWith(git, { kind: 'feat', summary: 'x', paths: ['x.txt'], log: quiet }), /main에서는 커밋하지 않아요/);
  start(git, { w: 'P05-W09', slug: 'demo', carry: true, log: quiet });
  writeFileSync(join(work, 'y.txt'), 'y');
  assert.throws(() => commitWith(git, { kind: 'feat', summary: 'x', paths: [], log: quiet }), /경로를 적어/);
  const r = commitWith(git, { kind: 'feat', summary: 'x 추가', paths: ['x.txt'], spec: 'SPEC-1', trailers: ['T: 1'], log: quiet });
  assert.match(r.message, /^\[P05-W09\] feat: x 추가/);
  assert.equal(sh(work, 'show', '--name-only', '--format=', 'HEAD'), 'x.txt', 'y.txt는 포함되지 않음');
  assert.throws(() => commitWith(git, { kind: 'docs', summary: '빈', paths: ['x.txt'], log: quiet }), /커밋할 변경이 없어요/);
  writeFileSync(join(work, 'docs/execution/checkpoints/CP-0001.md'), '# 바꿈\n');
  assert.throws(() => commitWith(git, { kind: 'cp', summary: 'cp 수정', paths: ['docs/execution/checkpoints/CP-0001.md'], log: quiet }), /커밋된 체크포인트/);
  assert.equal(sh(work, 'diff', '--cached', '--name-only'), '', '거부한 파일은 스테이지에서 내림');
  writeFileSync(join(work, 'docs/execution/checkpoints/CP-0002.md'), '# CP-0002\n');
  commitWith(git, { kind: 'cp', summary: '새 CP', paths: ['docs/execution/checkpoints/CP-0002.md'], cp: 'CP-0002', log: quiet });
  assert.match(sh(work, 'log', '-1', '--format=%s'), /\[P05-W09\] cp: 새 CP \(CP-0002\)/);
});

test('AC-G10 finish: 더러운 트리 거부, 검사 실패 시 push 안 함, 검사 뒤 변경 감지, 쌓인 기반까지 push', { skip: !hasGit }, () => {
  const { work, remote, git } = repo();
  start(git, { w: 'OPS-W01', slug: 'base', log: quiet });
  writeFileSync(join(work, 'a.txt'), 'a'); commitWith(git, { kind: 'feat', summary: 'a', paths: ['a.txt'], log: quiet });
  start(git, { w: 'OPS-W02', slug: 'top', log: quiet });
  writeFileSync(join(work, 'b.txt'), 'b'); commitWith(git, { kind: 'feat', summary: 'b', paths: ['b.txt'], log: quiet });
  writeFileSync(join(work, 'dirty.txt'), 'd');
  assert.throws(() => finish(git, { log: quiet }), /커밋되지 않은 변경/);
  unlinkSync(join(work, 'dirty.txt'));
  mkdirSync(join(work, 'scripts'), { recursive: true });
  writeFileSync(join(work, 'scripts/gitflow.config.json'), JSON.stringify({ checks: [{ name: 'fail', run: ['node', '-e', 'process.exit(1)'] }] }));
  sh(work, 'add', 'scripts/gitflow.config.json'); sh(work, 'commit', '-q', '-m', 'cfg');
  assert.throws(() => finish(git, { log: quiet }), /검사가 실패/);
  assert.equal(sh(remote, 'branch', '--list', 'w/*'), '', '실패 시 push 없음');
  writeFileSync(join(work, 'scripts/gitflow.config.json'), JSON.stringify({ checks: [{ name: 'rewrite', run: ['node', '-e', "require('fs').writeFileSync('a.txt','changed')"] }] }));
  sh(work, 'commit', '-q', '-am', 'cfg2');
  assert.throws(() => finish(git, { log: quiet }), /추적 파일을 바꿨어요/);
  sh(work, 'checkout', '--', 'a.txt');
  writeFileSync(join(work, 'scripts/gitflow.config.json'), JSON.stringify({ checks: [{ name: 'ok', run: ['node', '-e', '1'] }] }));
  sh(work, 'commit', '-q', '-am', 'cfg3');
  const r = finish(git, { log: quiet });
  assert.equal(r.pushed, true);
  assert.deepEqual(r.stack, ['w/OPS-W01-base', 'w/OPS-W02-top']);
  assert.match(sh(remote, 'branch', '--list'), /w\/OPS-W01-base[\s\S]*w\/OPS-W02-top/);
  assert.equal(sh(remote, 'rev-parse', 'main'), sh(work, 'rev-parse', 'origin/main'), 'main 불변');
});

test('AC-G11 handoff: bundle·끝 SHA·PR base 순서·CRLF·UTF-16 클립보드, push 실패 시 자동 생성', { skip: !hasGit }, () => {
  const { work, git } = repo();
  start(git, { w: 'OPS-W01', slug: 'one', title: '[OPS-W01] 하나', log: quiet });
  writeFileSync(join(work, 'a.txt'), 'a'); commitWith(git, { kind: 'feat', summary: 'a', paths: ['a.txt'], log: quiet });
  start(git, { w: 'OPS-W02', slug: 'two', log: quiet });
  writeFileSync(join(work, 'b.txt'), 'b'); commitWith(git, { kind: 'test', summary: 'b', paths: ['b.txt'], log: quiet });
  sh(work, 'remote', 'set-url', 'origin', 'https://github.com/example/nope-repo-for-test.git');
  sh(work, 'config', 'credential.helper', ''); 
  const r = finish(git, { skipChecks: true, log: quiet });
  assert.equal(r.pushed, false); assert.ok(r.handoff);
  const dir = join(work, '_handoff'), cmd = readFileSync(join(dir, 'open-pr.cmd'), 'utf8');
  assert.ok(cmd.includes('\r\n') && !/[^\r]\n/.test(cmd), 'CRLF');
  assert.ok(cmd.includes('git fetch _handoff\\gitflow.bundle w/OPS-W01-one:w/OPS-W01-one w/OPS-W02-two:w/OPS-W02-two'));
  assert.ok(cmd.includes(sh(work, 'rev-parse', 'w/OPS-W02-two')) && cmd.includes(sh(work, 'rev-parse', 'w/OPS-W01-one')));
  assert.ok(cmd.includes('gh pr create --base main --head w/OPS-W01-one') && cmd.includes('gh pr create --base w/OPS-W01-one --head w/OPS-W02-two'));
  assert.ok(cmd.includes('compare/main...w/OPS-W01-one') && cmd.includes('%%'), '브라우저 주소의 %는 cmd용으로 이스케이프');
  const clip = readFileSync(join(dir, 'pr-body-w_OPS-W02-two.clip.txt'));
  assert.deepEqual([...clip.subarray(0, 2)], [0xff, 0xfe]);
  assert.equal(readFileSync(join(dir, 'pr-title-w_OPS-W01-one.txt'), 'utf8'), '[OPS-W01] 하나');
  assert.match(readFileSync(join(dir, 'pr-body-w_OPS-W02-two.md'), 'utf8'), /w\/OPS-W01-one` 위에 쌓았어요/);
  const v = spawnSync('git', ['bundle', 'verify', join(dir, 'gitflow.bundle')], { cwd: work, encoding: 'utf8' });
  assert.equal(v.status, 0, v.stderr);
});

test('AC-G12 guard: 삭제가 막힌 환경에서 쓰기 명령 거부, 탐침 파일을 남기지 않음', { skip: !hasGit }, () => {
  const { work } = repo();
  guard(work);
  assert.throws(() => guard(work, { unlink: () => { throw Error('EPERM'); } }), e => e.code === 3 && /잠금 파일/.test(e.message));
  assert.ok(!existsSync(join(work, '.git/index.lock')));
});
