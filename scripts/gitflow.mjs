#!/usr/bin/env node
// SPEC-014 r0.2 §12 작업 단위 git 흐름: 요청 하나 = W 하나 = 브랜치 하나, 의미별 커밋, 작업 끝 push.
// 사용:
//   node scripts/gitflow.mjs start  <W-ID> <slug> [--base <ref>] [--title "<PR 제목>"] [--carry]
//   node scripts/gitflow.mjs commit <spec|feat|fix|test|docs|chore|cp> "<요약>" <경로…> [--spec ..] [--auth ..] [--validation ..] [--not-run ..] [--cp CP-00NN] [--agent ..] [--trailer "K: v"]…
//   node scripts/gitflow.mjs finish [--skip-checks] [--no-push] [--pr]
//   node scripts/gitflow.mjs handoff [--stack a,b,c]
//   node scripts/gitflow.mjs status | guard
// 기본 attribution 줄은 환경 변수 GITFLOW_TRAILERS(줄바꿈 구분)로 넣을 수 있다.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, renameSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KINDS = ['spec', 'feat', 'fix', 'test', 'docs', 'chore', 'cp'];
export const W_ID = /^[A-Z][A-Z0-9]{0,5}-W\d{2}$/;
export const SLUG = /^[a-z0-9][a-z0-9-]{1,39}$/;
const WORK_PREFIX = /^(w|sync|fix)\//;
const PROTECTED = new Set(['main', 'master']);
const COMMITTED_CP = /^docs\/execution\/checkpoints\/CP-\d{4}\.(md|manifest\.json)$/;

export class FlowError extends Error { constructor(msg, code = 2) { super(msg); this.code = code; } }

// ── 순수 함수 (테스트 대상) ──
export function branchName(w, slug) {
  if (!W_ID.test(w)) throw new FlowError(`W-ID 형식이 아니에요: ${w} (예: P05-W06, OPS-W01)`);
  if (!SLUG.test(slug)) throw new FlowError(`slug는 영문 소문자·숫자·하이픈 2~40자: ${slug}`);
  return `w/${w}-${slug}`;
}
export function wOf(branch) { const m = /^w\/([A-Z][A-Z0-9]{0,5}-W\d{2})-/.exec(branch || ''); return m ? m[1] : null; }
export function commitMessage({ w, kind, summary, spec, auth, validation, notRun, cp, agent, trailers = [] }) {
  if (!KINDS.includes(kind)) throw new FlowError(`커밋 종류는 ${KINDS.join('·')} 중 하나: ${kind}`);
  const s = String(summary || '').replace(/\s+/g, ' ').trim();
  if (!s) throw new FlowError('커밋 요약이 비어 있어요.');
  const subject = `[${w}] ${kind}: ${s}${cp && !s.includes(cp) ? ` (${cp})` : ''}`;
  const body = [`Kind: ${kind}`];
  if (spec) body.push(`Spec: ${spec}`);
  if (auth) body.push(`Auth: ${auth}`);
  if (validation) body.push(`Validation: ${validation}`);
  if (notRun) body.push(`Not-run: ${notRun}`);
  if (cp) body.push(`CP: ${cp}`);
  if (agent) body.push(`Agent: ${agent}`);
  const tail = trailers.filter(Boolean);
  return `${subject}\n\n${body.join('\n')}${tail.length ? `\n\n${tail.join('\n')}` : ''}\n`;
}
/** 기반 선택: 병합 안 된 작업 브랜치 위면 쌓고, 아니면 origin/main → main */
export function chooseBase({ current, currentMerged, hasOriginMain, explicit }) {
  if (explicit) return explicit;
  if (current && WORK_PREFIX.test(current) && !currentMerged) return current;
  return hasOriginMain ? 'origin/main' : 'main';
}
/** 쌓인 순서(가장 아래부터): base 기록을 따라 main에 닿을 때까지 */
export function stackOf(branch, baseOf) {
  const chain = []; let b = branch; const seen = new Set();
  while (b && WORK_PREFIX.test(b) && !seen.has(b)) { seen.add(b); chain.unshift(b); b = baseOf(b); }
  return chain;
}
export const prBaseOf = (branch, baseOf) => { const b = baseOf(branch); return !b || /^(origin\/)?(main|master)$/.test(b) ? 'main' : b.replace(/^origin\//, ''); };
const utf16Clip = text => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text.replace(/\r?\n/g, '\r\n'), 'utf16le')]);
const pctForCmd = s => s.replace(/%/g, '%%');

// ── git 실행 ──
export function makeGit(cwd) {
  const run = (args, { allowFail = false, env = {} } = {}) => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
    if (r.status !== 0 && !allowFail) throw new FlowError(`git ${args.join(' ')} 실패\n${(r.stderr || r.stdout || '').trim()}`);
    return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
  };
  const read = args => run(args, { allowFail: true, env: { GIT_OPTIONAL_LOCKS: '0' } });
  return {
    run, read,
    root: () => read(['rev-parse', '--show-toplevel']).out,
    branch: () => read(['symbolic-ref', '--quiet', '--short', 'HEAD']).out,
    dirty: () => read(['status', '--porcelain']).out.split('\n').filter(Boolean),
    refExists: ref => read(['rev-parse', '--verify', '--quiet', ref]).ok,
    config: (key, value) => value === undefined ? read(['config', '--get', key]).out : run(['config', key, value]),
    merged: (b, into) => read(['merge-base', '--is-ancestor', b, into]).ok,
  };
}

/** 삭제가 막힌 환경(Cowork VM 등)에서는 git 쓰기가 .git/index.lock 을 남긴다 → 쓰기 전에 막는다 */
export function guard(root, { unlink = unlinkSync } = {}) {
  const probe = join(root, '.git', `gitflow-probe-${process.pid}`);
  try { writeFileSync(probe, 'x'); } catch { throw new FlowError('.git에 쓸 수 없어요. 이 환경에서는 git 쓰기 명령을 실행하지 마세요.', 3); }
  try { unlink(probe); } catch {
    try { renameSync(probe, `${probe}.stale`); } catch { /* 남은 파일은 보고만 */ }
    throw new FlowError('이 환경은 파일 삭제가 막혀 있어 git 쓰기 명령이 잠금 파일(.git/index.lock)을 남겨요. 클라우드의 깨끗한 클론이나 사용자 PC에서 실행해 주세요(SPEC-014 §12.5).', 3);
  }
}

function parseArgs(argv) {
  const pos = [], opt = { trailer: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const flag = ['carry', 'skipChecks', 'noPush', 'pr'].includes(k);
      const v = flag ? true : argv[++i];
      if (k === 'trailer') opt.trailer.push(v); else opt[k] = v;
    } else pos.push(a);
  }
  return { pos, opt };
}

// ── 명령 ──
export function start(git, { w, slug, base: explicit, title, carry, log = console.log }) {
  const name = branchName(w, slug), cur = git.branch();
  if (git.refExists(`refs/heads/${name}`)) throw new FlowError(`이미 있는 브랜치예요: ${name}`);
  const dirty = git.dirty();
  if (dirty.length && !carry) throw new FlowError(`커밋되지 않은 변경이 있어요(${dirty.length}개). 앞 작업을 commit/finish 하거나, 이번 작업에 포함하려면 --carry.\n${dirty.slice(0, 10).join('\n')}`);
  git.read(['fetch', '--quiet', 'origin']);
  const hasOriginMain = git.refExists('refs/remotes/origin/main');
  const mainRef = hasOriginMain ? 'origin/main' : 'main';
  const currentMerged = cur ? git.merged(cur, mainRef) : true;
  const base = chooseBase({ current: cur, currentMerged, hasOriginMain, explicit });
  git.run(['switch', '-c', name, base]);
  git.config(`branch.${name}.vencubatorBase`, base);
  git.config(`branch.${name}.vencubatorW`, w);
  git.config(`branch.${name}.vencubatorTitle`, title || `[${w}] ${slug.replace(/-/g, ' ')}`);
  log(`브랜치 ${name} (기반 ${base}${base === cur ? ' · 쌓기' : ''})`);
  return { name, base };
}

function readChecks(root) {
  const p = join(root, 'scripts', 'gitflow.config.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).checks : [];
}
function expand(root, args) {
  return args.flatMap(a => {
    const m = /^(.*)\/\*(\.[\w.]+)$/.exec(a);
    if (!m) return [a];
    const dir = join(root, m[1]);
    return existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(m[2])).sort().map(f => `${m[1]}/${f}`) : [];
  });
}
export function runChecks(root, checks, log = console.log) {
  const results = [];
  for (const c of checks) {
    const [cmd, ...args] = expand(root, c.run);
    const r = spawnSync(cmd === 'node' ? process.execPath : cmd, args, { cwd: root, encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    const pass = /^# pass (\d+)/m.exec(out)?.[1], fail = /^# fail (\d+)/m.exec(out)?.[1];
    const ok = r.status === 0;
    results.push({ name: c.name, ok, summary: pass !== undefined ? `pass ${pass} / fail ${fail}` : ok ? 'ok' : out.trim().split('\n').slice(-3).join(' ') });
    log(`${ok ? 'PASS' : 'FAIL'}  ${c.name}  ${results.at(-1).summary}`);
  }
  return results;
}

export function finish(git, { skipChecks, noPush, pr, log = console.log }) {
  const root = git.root(), b = git.branch();
  if (!b || PROTECTED.has(b)) throw new FlowError('작업 브랜치에서 실행해 주세요.');
  const dirty = git.dirty();
  if (dirty.length) throw new FlowError(`커밋되지 않은 변경이 있어요. 의미별로 commit 한 뒤 finish 하세요.\n${dirty.slice(0, 10).join('\n')}`);
  let checks = [];
  if (!skipChecks) {
    checks = runChecks(root, readChecks(root), log);
    const after = git.dirty();
    if (after.length) throw new FlowError(`검사가 추적 파일을 바꿨어요. 확인 후 chore 커밋하고 다시 finish 하세요.\n${after.join('\n')}`);
    if (checks.some(c => !c.ok)) throw new FlowError('필수 검사가 실패해 push하지 않았어요.');
  }
  mkdirSync(join(root, '.git', 'gitflow'), { recursive: true });
  writeFileSync(join(root, '.git', 'gitflow', `checks-${b.replace(/\//g, '_')}.json`), JSON.stringify({ at: new Date().toISOString(), head: git.read(['rev-parse', 'HEAD']).out, checks }, null, 2));
  if (noPush) { log('검사 완료(--no-push).'); return { pushed: false, checks }; }
  const baseOf = x => git.config(`branch.${x}.vencubatorBase`);
  const stack = stackOf(b, baseOf);
  const push = git.run(['push', '-u', 'origin', ...stack], { allowFail: true });
  if (!push.ok) {
    log(`push 실패 → handoff를 만듭니다.\n${push.err.split('\n').slice(-2).join('\n')}`);
    const h = handoff(git, { stack, log });
    return { pushed: false, handoff: h, checks };
  }
  log(`push 완료: ${stack.join(', ')}`);
  if (pr) {
    const gh = spawnSync('gh', ['pr', 'create', '--base', prBaseOf(b, baseOf), '--head', b, '--title', git.config(`branch.${b}.vencubatorTitle`) || b, '--body', prBody(git, b, baseOf)], { cwd: root, encoding: 'utf8' });
    log(gh.status === 0 ? gh.stdout.trim() : `PR은 GitHub에서 만들어 주세요: ${compareUrl(git, b, baseOf)}`);
  }
  return { pushed: true, stack, checks };
}

function repoSlug(git) { const u = git.read(['remote', 'get-url', 'origin']).out; const m = /github\.com[:/](.+?)(\.git)?$/.exec(u); return m ? m[1] : null; }
function compareUrl(git, b, baseOf, title) {
  const slug = repoSlug(git); if (!slug) return '';
  return `https://github.com/${slug}/compare/${prBaseOf(b, baseOf)}...${b}?expand=1${title ? `&title=${encodeURIComponent(title)}` : ''}`;
}
export function prBody(git, b, baseOf) {
  const base = prBaseOf(b, baseOf), root = git.root();
  const from = git.refExists(base) ? base : git.refExists(`origin/${base}`) ? `origin/${base}` : base;
  const log = git.read(['log', '--reverse', '--format=- `%h` %s', `${from}..${b}`]).out;
  const cf = join(root, '.git', 'gitflow', `checks-${b.replace(/\//g, '_')}.json`);
  const checks = existsSync(cf) ? JSON.parse(readFileSync(cf, 'utf8')).checks : [];
  return [
    `## 커밋 (${base} 이후)`, '', log || '- (없음)', '',
    '## 검사', '', checks.length ? checks.map(c => `- [${c.ok ? 'x' : ' '}] ${c.name} — ${c.summary}`).join('\n') : '- [ ] finish 검사 기록 없음', '',
    '## 병합', '', base === 'main' ? '- main 병합 = Vercel Production 배포. 병합은 사용자가 결정해요.' : `- 이 PR은 \`${base}\` 위에 쌓았어요. 앞 PR을 먼저 병합한 뒤 base를 main으로 바꿔 주세요.`,
    '', '🤖 Generated with [Claude Code](https://claude.com/claude-code)', ''
  ].join('\n');
}

/** push할 수 없을 때: 쌓인 브랜치를 bundle로 묶고, 사용자 PC에서 한 번 실행할 open-pr.cmd 를 만든다 */
export function handoff(git, { stack, outDir, log = console.log } = {}) {
  const root = git.root(), baseOf = x => git.config(`branch.${x}.vencubatorBase`);
  const b = git.branch();
  stack = stack?.length ? stack : stackOf(b, baseOf);
  const dir = outDir || join(root, '_handoff'); mkdirSync(dir, { recursive: true });
  const bottom = baseOf(stack[0]) || 'main';
  const bundle = 'gitflow.bundle';
  git.run(['bundle', 'create', join(dir, bundle), ...stack.map(x => `${bottom}..${x}`)]);
  const tips = stack.map(x => git.read(['rev-parse', x]).out);
  const items = stack.map((x, i) => {
    const safe = x.replace(/[^\w-]+/g, '_'), title = git.config(`branch.${x}.vencubatorTitle`) || x;
    const bodyFile = `pr-body-${safe}.md`;
    if (!existsSync(join(dir, bodyFile))) writeFileSync(join(dir, bodyFile), prBody(git, x, baseOf));
    writeFileSync(join(dir, `pr-body-${safe}.clip.txt`), utf16Clip(readFileSync(join(dir, bodyFile), 'utf8')));
    writeFileSync(join(dir, `pr-title-${safe}.txt`), title);
    return { branch: x, base: prBaseOf(x, baseOf), tip: tips[i], safe, url: compareUrl(git, x, baseOf, title) };
  });
  const L = [];
  L.push('@echo off', 'chcp 65001 >nul', 'setlocal EnableDelayedExpansion',
    'rem SPEC-014 §12.4 handoff: 에이전트가 만든 커밋(bundle)을 받아 브랜치를 push하고 PR을 연다. main은 건드리지 않는다.',
    'cd /d "%~dp0\\.."',
    'where git >nul 2>nul || (echo [중단] git이 필요합니다. & pause & exit /b 1)',
    'if exist .git\\index.lock (echo [중단] .git\\index.lock 이 있어요. 다른 git 작업이 끝났는지 확인한 뒤 지우고 다시 실행해 주세요. & pause & exit /b 1)',
    'for %%f in (.git\\index.lock.stale-*) do del "%%f"',
    'echo [1/4] 커밋 묶음 확인',
    `git bundle verify _handoff\\${bundle} || (echo [중단] 묶음 파일이 올바르지 않아요. & pause & exit /b 1)`,
    `git fetch _handoff\\${bundle} ${items.map(i => `${i.branch}:${i.branch}`).join(' ')} || (echo [중단] 가져오기 실패. 이미 같은 이름의 브랜치가 있으면 확인해 주세요. & pause & exit /b 1)`);
  for (const i of items) L.push(`for /f %%i in ('git rev-parse ${i.branch}') do if not "%%i"=="${i.tip}" (echo [중단] ${i.branch} 끝이 예상과 달라요: %%i & pause & exit /b 1)`);
  L.push('echo [2/4] GitHub에 브랜치 올리기 (main은 건드리지 않음)',
    `git push -u origin ${items.map(i => i.branch).join(' ')} || (echo [중단] push 실패. GitHub 로그인 상태를 확인해 주세요. & pause & exit /b 1)`,
    `echo [3/4] 작업 폴더를 파일 변경 없이 ${items.at(-1).branch} 로 옮기기`,
    `git symbolic-ref HEAD refs/heads/${items.at(-1).branch}`, 'git reset -q', 'git checkout -- .gitattributes .gitignore 2>nul', 'git status --short',
    'echo [4/4] PR 만들기', 'where gh >nul 2>nul && (');
  items.forEach((i, n) => L.push(`  set /p T${n}=<_handoff\\pr-title-${i.safe}.txt`, `  gh pr create --base ${i.base} --head ${i.branch} --title "!T${n}!" --body-file _handoff\\pr-body-${i.safe}.md`));
  L.push(') || (');
  items.forEach((i, n) => { L.push(`  clip < _handoff\\pr-body-${i.safe}.clip.txt`, `  echo [PR ${n + 1}/${items.length}] ${i.branch} → ${i.base}: 본문을 클립보드에 복사했어요. 열리는 화면에 붙여넣고 "Create pull request"를 누르세요.`, `  start "" "${pctForCmd(i.url)}"`); if (n < items.length - 1) L.push('  pause'); });
  L.push(')', 'echo.', `echo 완료. 병합 순서: ${items.map((i, n) => `${n + 1}) ${i.branch}`).join('  ')}. 앞 PR 병합 뒤 다음 PR의 base를 main으로 바꿔 주세요.`, 'echo main 병합은 Vercel 배포예요.', 'pause', '');
  writeFileSync(join(dir, 'open-pr.cmd'), L.join('\r\n'));
  log(`handoff 생성: ${dir} (브랜치 ${stack.join(' → ')}) — 사용자 PC에서 _handoff\\open-pr.cmd 실행`);
  return { dir, stack, tips };
}

export function status(git, log = console.log) {
  const b = git.branch(), baseOf = x => git.config(`branch.${x}.vencubatorBase`);
  const stack = stackOf(b, baseOf);
  log(`브랜치: ${b}\n기반: ${baseOf(b) || '-'}\n쌓인 순서: ${stack.join(' → ') || '-'}\n커밋 안 된 변경: ${git.dirty().length}`);
  return { branch: b, stack };
}

/** 의미별 커밋: 명시한 경로만, main 금지, 커밋된 CP 수정 금지. 메시지는 stdin으로 넘긴다 */
export function commitWith(git, opts) {
  const b = git.branch();
  if (!b || PROTECTED.has(b)) throw new FlowError(`${b || '(분리된 HEAD)'}에서는 커밋하지 않아요. 먼저 gitflow start.`);
  const w = wOf(b) || git.config(`branch.${b}.vencubatorW`);
  if (!w) throw new FlowError(`작업 브랜치(w/<W-ID>-…)가 아니에요: ${b}`);
  const { kind, summary, paths, allChanges } = opts;
  if (!KINDS.includes(kind)) throw new FlowError(`커밋 종류는 ${KINDS.join('·')} 중 하나: ${kind}`);
  if (!paths?.length && !allChanges) throw new FlowError('커밋할 경로를 적어 주세요(명시한 파일만 커밋).');
  if (paths?.length) git.run(['add', '--', ...paths]);
  else git.run(['add', '-A']);
  const staged = git.read(['diff', '--cached', '--name-status']).out.split('\n').filter(Boolean).map(l => l.split('\t'));
  if (!staged.length) throw new FlowError('커밋할 변경이 없어요.');
  const headHas = p => git.read(['cat-file', '-e', `HEAD:${p}`]).ok;
  const cp = staged.filter(([st, p]) => st !== 'A' && COMMITTED_CP.test(p) && headHas(p)).map(x => x[1]);
  if (cp.length) { git.run(['reset', '-q', '--', ...cp]); throw new FlowError(`이미 커밋된 체크포인트는 고치지 않아요(새 CP로 정정): ${cp.join(', ')}`); }
  const envTrailers = (process.env.GITFLOW_TRAILERS || '').split(/\r?\n/).filter(Boolean);
  const msg = commitMessage({ ...opts, w, trailers: [...(opts.trailers || []), ...envTrailers] });
  const r = spawnSync('git', ['commit', '-q', '-F', '-'], { cwd: git.root(), input: msg, encoding: 'utf8' });
  if (r.status !== 0) throw new FlowError(`git commit 실패\n${r.stderr}`);
  const sha = git.read(['rev-parse', '--short', 'HEAD']).out;
  (opts.log || console.log)(`${sha} ${msg.split('\n')[0]}`);
  return { sha, message: msg };
}

export function main(argv = process.argv.slice(2), cwd = process.cwd(), log = console.log) {
  const [cmd, ...rest] = argv; const { pos, opt } = parseArgs(rest);
  const git = makeGit(cwd); const root = git.root();
  if (!root) throw new FlowError('git 저장소가 아니에요.');
  if (['start', 'commit', 'finish', 'handoff'].includes(cmd)) guard(root);
  if (cmd === 'guard') { guard(root); log('git 쓰기 가능'); return; }
  if (cmd === 'start') return start(git, { w: pos[0], slug: pos[1], base: opt.base, title: opt.title, carry: opt.carry, log });
  if (cmd === 'commit') return commitWith(git, { kind: pos[0], summary: pos[1], paths: pos.slice(2), allChanges: opt.allChanges === 'yes', spec: opt.spec, auth: opt.auth, validation: opt.validation, notRun: opt.notRun, cp: opt.cp, agent: opt.agent || process.env.GITFLOW_AGENT, trailers: opt.trailer, log });
  if (cmd === 'finish') return finish(git, { skipChecks: opt.skipChecks, noPush: opt.noPush, pr: opt.pr, log });
  if (cmd === 'handoff') return handoff(git, { stack: opt.stack ? opt.stack.split(',') : null, log });
  if (cmd === 'status') return status(git, log);
  throw new FlowError('명령: start | commit | finish | handoff | status | guard (scripts/gitflow.mjs 머리말 참고)');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error(`[gitflow] ${e.message}`); process.exit(e.code || 1); }
}
