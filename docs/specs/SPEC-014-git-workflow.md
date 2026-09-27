# SPEC-014 — Git·배포 작업 흐름

Revision 0.2 · **Approved (AUTH-018, r0.2 AUTH-019)** · 2026-09-27 · 작성: landing-site-session

r0.2 변경: 사용자 요청 “스펙 변경이나 코드 구현에 대해서도 git flow를 적용하자. 명령 스텝이 실행되면 새로운 브랜치를 파고, 변경이나 구현이 실행되면 각 작업 의미별로 commit을 생성, 작업이 끝나면 해당 브랜치를 push하도록 워크플로우를 개선”에 따라 §12 **작업 단위 자동 흐름**과 도구 `scripts/gitflow.mjs`를 추가하고 DR-GIT-02를 확정한다.

사용자 요청: “git 작업에 대한 Spec 명세 부탁해.” 이 문서는 저장소 `origin = https://github.com/8848man/Vencubator.git`의 브랜치·커밋·병합·배포 규칙과 SDD 체크포인트(STATE/CP)와의 연결을 정한다. AUTH-018로 이번 정리 PR에 적용한다. main 병합·배포는 계속 사용자 승인 대상이다.

## 0. 현황 (2026-09-27 조사, 읽기 전용)

| 항목 | 사실 | 영향 |
|---|---|---|
| 원격·흐름 | `main` 7커밋, 마지막 `872ad40`(PR #1 `feat/fix_ux_spec_and_problem` 병합). GitHub Actions 없음 | 브랜치+PR 흐름을 한 번 사용함 |
| 배포 | `main` push → Vercel Production 자동 배포(L04-W04·W06·W07, SPEC-011) | **main에 들어가는 것 = 운영 공개** |
| 미커밋 변경 | 추적 파일 40개 수정, 신규 37개. CP-0053~0062(P05-W04, P07-W01~03, P05-W05 등) 여러 W가 한 작업 트리에 섞임. `STATE.git.committed=false` | 어떤 변경이 어느 W인지 커밋으로 복원 불가 |
| 줄바꿈 | 수정 40개 중 **19개는 줄바꿈(LF↔CRLF)만 다름**(CP-0052/0053 파일, start.cmd 4개, 테스트 등) | 의미 없는 대량 diff, 커밋된 체크포인트가 “바뀐 것처럼” 보임 |
| 무시 규칙 | 루트 `.gitignore`·`.gitattributes` 없음. 폴더별 `.gitignore`(landing*, site)만 | `tmp/`, `Claude outputs/`, `thumb/`, 백업·정리 폴더가 쉽게 섞임 |
| 추적 중인 산출물 | `landing*/dist/index.html`(의도: 더블클릭 실행), `output/*.pdf·gif`, `tmp/*.png`, `Claude outputs/landing-v3.zip` | 저장소 비대, 재생성 가능한 파일이 이력에 남음 |
| 여러 에이전트 | Claude 세션·GPT 세션이 같은 작업 트리를 번갈아 수정(CP-0032 번호 충돌 전례) | 동시 git 쓰기 시 충돌·덮어쓰기 위험 |
| 삭제가 막힌 VM | Cowork VM은 파일 삭제 불가. 이번 조사에서 `git status`가 만든 `.git/index.lock`을 지우지 못해 남음 → `.git/index.lock.stale-claude-20260927`로 이름 변경해 해소 | 에이전트의 git 쓰기 명령이 저장소를 잠글 수 있음 |
| 공개 식별자 | `site/shared/track.mjs`에 GA4 측정 ID(공개용) | 비밀은 아님. 비밀 키 규칙은 별도 필요 |

## 1. 목표와 비목표

- 목표: ① W 하나 = 브랜치 하나 = PR 하나로 추적 ② main은 항상 검증된 운영본 ③ CP·커밋·배포가 서로 가리킴 ④ 여러 에이전트가 안전하게 교대 ⑤ 줄바꿈·산출물로 인한 잡음 제거.
- 비목표: CI 서비스 도입, Git LFS 전환, 과거 커밋 재작성(force push)은 이번 범위가 아니다(§9 결정 요청).

## 2. 브랜치

| 브랜치 | 용도 | 규칙 |
|---|---|---|
| `main` | 운영(Vercel Production) | 직접 커밋·push 금지. PR 병합만. force push 금지 |
| `w/<W-ID>-<짧은-이름>` | 작업 단위(W) 하나 | 예: `w/P05-W05-locked-path`. 최신 `main`에서 만든다. 한 브랜치에 W 하나 |
| `fix/<짧은-이름>` | 운영 긴급 수정 | 사용자 요청·APPROVALS 기록 후. 병합 뒤 해당 Spec·VAL에 반영 |
| `sync/<YYYYMMDD>-<주제>` | 과거 미커밋 변경 정리(§8) | 1회성 |

- 브랜치 수명: 병합 후 원격 브랜치 삭제(GitHub 설정). 장기 브랜치 없음.
- 한 작업 트리에서 동시에 체크아웃된 W는 하나(STATE `active`). 병렬 작업이 필요하면 `git worktree add ../Vencubator-<W-ID> w/<W-ID>-…`로 폴더를 분리한다.

## 3. 커밋

- 경계: CP를 게시하는 시점 = 커밋 시점. 완료 CP는 반드시 커밋 1개 이상에 포함된다. 진행 중 CP도 코드가 바뀌었으면 커밋한다.
- 메시지 형식(제목 72자 이내, 한국어 허용):

  ```
  [P05-W05] 잠긴 학습 탭 시 할 일 안내·현재 단계 강조 (CP-0062)

  Spec: SPEC-005 r0.3 AC-L07
  Auth: USER-2026-09-27
  Validation: site/scripts/qa-locked-path.mjs 30/30, prototype 54
  Agent: landing-site-session
  ```

  - 제목 대괄호 = W-ID(W가 없는 정리 작업은 `[chore]`, `[sync]`). 끝에 CP 번호.
  - 본문: 관련 Spec revision, 승인 근거(AUTH-xxx), 실행한 검사와 결과, 작업한 세션/모델. 미실행 검사가 있으면 `Not-run:` 줄.
- 한 커밋에 서로 다른 W를 섞지 않는다. 줄바꿈만 바꾸는 정리는 별도 `[chore]` 커밋.
- **체크포인트 불변**: 커밋된 `CP-NNNN.md`·manifest는 수정하지 않는다. 정정은 새 CP로 한다(CHECKPOINT-PROTOCOL과 동일).
- push된 커밋의 amend·rebase·force push 금지. 로컬 미push 커밋만 정리 가능.

## 4. SDD와의 연결

- 상태 전이 매핑(SDD.md): Validated → **Committed**(W 브랜치에 커밋, CP에 SHA 기록) → **Released**(main 병합 + Vercel Production 성공 확인).
- `STATE.git` 필드 확장:

  ```json
  "git": { "branch": "w/P05-W05-locked-path", "head": "<sha>", "dirty": false,
           "pr": 2, "merged_sha": null, "deploy": { "target": "vercel-production", "status": "not_started", "checked_at": null } }
  ```

- CP 본문에 `HEAD: <sha>`와 `dirty: yes/no`를 적는다(CP-0058 형식 계승). CP 게시 후 커밋했다면 다음 CP에 커밋 SHA를 남긴다.
- `scripts/verify-checkpoint.mjs` 확장(승인 후 구현): STATE.git.head가 실제 HEAD와 다르면 경고, 완료 CP 뒤 작업 트리가 dirty면 경고, 커밋된 CP 파일이 작업 트리에서 바뀌면 오류.

## 5. PR·병합·배포 게이트

PR은 W 하나. 제목 = 커밋 제목 형식. 본문(`.github/pull_request_template.md`):

1. W-ID, Spec revision, 승인(AUTH), 관련 CP 범위
2. 사용자에게 보이는 변화 요약
3. 검사 결과 (아래 필수 검사 체크)
4. 미실행 검사·알려진 위험
5. 배포 영향(운영 공개 여부, 데이터 스키마 변화)

필수 검사(병합 전, `scripts/pre-merge.mjs`로 한 번에 실행 — 승인 후 구현):

| 검사 | 명령 |
|---|---|
| 단위·명세 | `node --test prototype/tests/*.test.mjs`, `site/tests`, `landing-v3/tests` (+ 변경한 폴더의 tests) |
| 사이트 빌드 | `node site/scripts/build.mjs` 성공, 남은 이전 빌드 경고 없음 |
| 체크포인트 | `node scripts/verify-checkpoint.mjs` 오류 0 |
| 브라우저 | Playwright가 있으면 `site/scripts/qa*.mjs` 전부. 없으면 PR에 “미실행” 기록 |
| 위생 | 충돌 표시(`<<<<<<<`) 없음, 비밀 패턴 없음(§7), 5MB 초과 신규 파일 없음 |

- **병합 = 운영 배포**이므로 main 병합은 사용자 승인(APPROVALS에 “배포” 범위가 명시된 AUTH)이 있어야 한다. 에이전트는 PR 생성·검사까지, 병합은 사용자 또는 사용자가 지시한 경우에만.
- 병합 방식: **Squash merge**(W당 커밋 1개가 main 이력에 남음). 브랜치의 세부 커밋은 PR에 보존.
- 병합 뒤: Vercel Production 성공과 공개 파일 반영을 확인해 해당 VAL에 `Released: <merged_sha> · <배포 시각>` 기록, STATE.git.deploy 갱신. 실패 시 `git revert <merged_sha>` PR로 되돌린다(force push 아님).

## 6. 여러 에이전트·도구 교대

- 시작 전: `AGENTS.md` 절차 + `git status`(읽기 전용은 `GIT_OPTIONAL_LOCKS=0 git status`)로 작업 트리 확인. dirty 파일이 현재 active W의 manifest에 없으면 작업을 멈추고 사용자에게 보고.
- 담당 이전: 이전 담당의 변경을 먼저 커밋(또는 이전 담당 이름으로 WIP 커밋 `[P07-W03] WIP handoff (CP-0060)`) 후 이어받는다. 커밋 없이 이어받은 경우 CP에 명시.
- **삭제가 막힌 환경(Cowork VM 등)**: git 쓰기 명령(add/commit/checkout/merge/stash)은 잠금 파일을 지우지 못해 저장소를 잠글 수 있다. 이런 환경에서는 읽기 명령만 `GIT_OPTIONAL_LOCKS=0`으로 실행하고, 커밋·브랜치 작업은 사용자 PC의 git(또는 삭제가 허용된 세션)에서 수행한다. 잠금 파일이 남으면 지우지 말고 `*.stale-<세션>-<날짜>`로 이름을 바꾼 뒤 보고한다.
- 서로 다른 세션이 같은 W 브랜치에 동시에 커밋하지 않는다.

## 7. 저장소 위생·보안

- 루트 `.gitattributes`(승인 후 추가):

  ```
  * text=auto eol=lf
  *.cmd text eol=crlf
  *.bat text eol=crlf
  *.png binary
  *.gif binary
  *.pdf binary
  *.zip binary
  *.woff2 binary
  ```

  추가 직후 `git add --renormalize .`을 단독 `[chore]` 커밋으로 올려 줄바꿈 diff 19개를 없앤다.
- 루트 `.gitignore`(승인 후 추가): `node_modules/`, `**/qa-shots/`, `**/_to_delete/`, `tmp/`, `Claude outputs/`, `*.stale-*`, `.DS_Store`, `Thumbs.db`, `.env*`, `*.log`.
- 추적 대상 결정: `site/dist/`는 추적하지 않는다(Vercel이 빌드). `landing*/dist/index.html`은 더블클릭 실행용으로 추적 유지(빌드 후 함께 커밋). `output/` 미디어·`tmp/`·`Claude outputs/`는 추적 해제 제안(§9).
- 비밀: API 키·토큰·비밀번호·개인정보를 커밋하지 않는다. GA4 측정 ID·Firebase 웹 설정처럼 공개를 전제로 한 식별자만 ADR-004에 적힌 범위에서 허용. `pre-merge.mjs`가 `AKIA`, `-----BEGIN`, `ghp_`, `sk-`, `password=` 등 패턴과 `.env` 파일을 검사한다.

## 8. 지금 쌓인 미커밋 변경 정리 계획 (승인 시 1회)

1. `.git/index.lock.stale-*` 확인·삭제(사용자 PC에서).
2. `sync/20260927-backlog` 브랜치 생성.
3. 커밋 순서:
   1. `[chore] .gitattributes 추가·줄바꿈 정규화` — 줄바꿈만 다른 19개가 여기서 정리됨
   2. `[chore] 루트 .gitignore`
   3. CP manifest 기준으로 W별 커밋: P05-W04(CP-0053) → P07-W01 → P07-W02 → P07-W03(CP-0058~0061) → P05-W05(CP-0062). 한 파일이 여러 W에 걸치면 마지막 W 커밋에 포함하고 PR 본문에 적는다.
4. 필수 검사(§5) 실행 → PR → 사용자 승인 후 squash 대신 **merge commit**(정리용 W별 커밋을 main에 남기기 위해 이 PR만 예외) → Vercel 확인.
5. 새 CP에 병합 SHA·배포 결과 기록, STATE.git 갱신.

## 9. 결정 요청

| ID | 질문 | 제안 |
|---|---|---|
| DR-GIT-01 | main 병합 방식 | Squash(정리 PR만 예외) |
| DR-GIT-02 | 에이전트의 권한 | **결정(r0.2)**: 브랜치 생성·의미별 커밋·작업 끝 push·PR 생성까지 에이전트가 수행. main 병합·배포는 사용자 |
| DR-GIT-03 | GitHub 브랜치 보호 | main: PR 필수, force push 금지, 병합 후 브랜치 자동 삭제(사용자가 GitHub에서 설정) |
| DR-GIT-04 | `output/`·`tmp/`·`Claude outputs/` 추적 | 추적 해제(파일은 로컬에 유지). 과거 이력 재작성은 하지 않음 |
| DR-GIT-05 | 커밋 작성자 | 사람 계정으로 커밋하고 본문 `Agent:`로 세션 표기 |

## 10. 수용 기준 (승인 후 구현 W의 AC)

| AC | 기준 | 검사 |
|---|---|---|
| AC-G01 | `.gitattributes`·루트 `.gitignore` 존재, renormalize 후 줄바꿈만 다른 파일 0 | `git diff --ignore-cr-at-eol` 비교 스크립트 |
| AC-G02 | `.github/pull_request_template.md`가 §5 다섯 항목 포함 | 파일 검사 |
| AC-G03 | `scripts/pre-merge.mjs`가 §5 필수 검사 실행, 실패 시 종료 코드 1 | 스크립트 테스트(일부러 실패시키는 fixture) |
| AC-G04 | `verify-checkpoint.mjs`가 HEAD 불일치·dirty·커밋된 CP 변경을 보고 | 단위 테스트 |
| AC-G05 | cp_helper/체크포인트 게시가 `HEAD`·`dirty`를 CP와 STATE.git에 기록 | CP 샘플 검사 |
| AC-G06 | §8 정리 PR 병합 후 `git status` 깨끗, STATE.git.committed=true, Vercel 성공 기록 | 수동 확인 + VAL |
| AC-G07 | 삭제 불가 환경에서 git 쓰기 명령 없이 작업, 잠금 파일 0 | 세션 기록 확인 |

## 11. 실행 기록

- 2026-09-27 AUTH-018: 에이전트 환경 두 곳 모두 GitHub push 자격 증명이 없다(클라우드: 저장소 미허용, Cowork VM: 인증 없음). 그래서 커밋은 클라우드의 깨끗한 클론에서 만들고 git bundle로 전달, **push와 PR 생성은 사용자 PC에서 `scripts\\open-pr.cmd` 한 번 실행**으로 한다. 스크립트는 push 후 로컬 작업 트리를 파일 변경 없이 새 브랜치로 옮긴다(`symbolic-ref` + `reset`).

## 12. 작업 단위 자동 흐름 (r0.2)

사용자 요청 하나(명령 스텝)는 W 하나이고, W 하나는 브랜치 하나다. 스펙 변경만 있는 요청도, 코드 구현도 같은 흐름을 따른다.

```
요청 접수 ─ gitflow start <W-ID> <slug>     새 브랜치 w/<W-ID>-<slug> (파일을 바꾸기 전에)
   │
   ├─ 명세 변경  → gitflow commit spec  "<요약>" <파일…>
   ├─ 구현       → gitflow commit feat|fix "<요약>" <파일…>   (의미 단위마다 반복)
   ├─ 검사 추가  → gitflow commit test  "<요약>" <파일…>
   ├─ 문서·안내  → gitflow commit docs  "<요약>" <파일…>
   └─ CP 게시    → gitflow commit cp    "<요약>" <CP·STATE·WORKLOG·CURRENT·HANDOFF>
   │
작업 끝 ─ gitflow finish                      필수 검사 → push → (가능하면) PR
```

### 12.1 시작 (`start`)

- 파일을 하나라도 바꾸기 전에 실행한다. 이름 `w/<W-ID>-<slug>`: W-ID는 `P05-W06`·`OPS-W01` 형식, slug는 영문 소문자·숫자·하이픈 2~40자.
- 기반(base): 현재 브랜치가 아직 main에 병합되지 않은 작업 브랜치(`w/*`, `sync/*`, `fix/*`)면 **그 위에 쌓는다**(stack). 아니면 `origin/main`(없으면 `main`). `--base`로 직접 지정 가능.
- 기반과 제목은 로컬 git 설정(`branch.<이름>.vencubatorBase`, `…vencubatorW`, `…vencubatorTitle`)에 기록해 finish·handoff가 PR base를 안다.
- 작업 트리에 커밋되지 않은 변경이 있으면 멈춘다. 사용자가 미리 고친 파일을 이번 작업에 포함하려면 `--carry`.

### 12.2 의미별 커밋 (`commit`)

| 종류 | 담는 것 | 제목 예 |
|---|---|---|
| `spec` | Spec·ADR·승인 기록 | `[P05-W06] spec: SPEC-012 r0.2 작은 배움 집중형` |
| `feat` | 새 동작 구현 | `[P05-W06] feat: review-ui 집중형 흐름` |
| `fix` | 결함 수정 | `[P07-W03] fix: 작업 상세 돌아가기` |
| `test` | 자동 검사·QA 스크립트 | `[P05-W06] test: qa-review 35건` |
| `docs` | README·안내·검증 기록(VAL) | `[OPS-W01] docs: AGENTS.md git 흐름` |
| `chore` | 빌드 산출물·설정·정리 | `[OPS-W01] chore: dist 재빌드` |
| `cp` | 체크포인트 게시 파일 | `[P05-W06] cp: CP-0065 완료` |

- 한 커밋 = 한 의미. 파일은 **명시한 경로만** 넣는다(`git add -A` 금지). 다른 W의 파일이 섞이면 멈춘다.
- 본문 줄: `Kind`, `Spec`, `Auth`, `Validation`, `Not-run`, `CP`, `Agent`와 도구가 요구하는 attribution 줄.
- `main`(및 `master`)에서는 커밋하지 않는다. 이미 커밋된 CP 파일을 바꾸는 커밋은 거부한다(§3 체크포인트 불변).
- CP는 기존 규칙대로 “파일 수정 묶음·검증 결과 경계”마다 게시하고, 게시 직후 `cp` 커밋으로 남긴다. CP 본문과 STATE.git에는 브랜치 이름을 적는다.

### 12.3 종료 (`finish`)

1. 작업 트리가 깨끗한지 확인(커밋 안 된 변경이 있으면 멈춤).
2. 필수 검사(`scripts/gitflow.config.json`): 폴더별 `node --test`, `verify-checkpoint`, 사이트 빌드. 검사가 추적 파일을 바꾸면(예: dist 재생성) 멈추고 목록을 보여 준다 → `chore` 커밋 후 다시 finish.
3. 결과를 `.git/gitflow/checks-<브랜치>.json`에 저장(PR 본문에 사용).
4. `git push -u origin <브랜치>`. 쌓인 기반 브랜치가 원격에 없으면 함께 push.
5. push가 인증 문제로 실패하면 **handoff**를 자동 생성한다(아래). `--pr`이면 `gh pr create`(base = 기록된 기반).

### 12.4 push할 수 없는 환경 (`handoff`)

- `_handoff/`에 git bundle(쌓인 브랜치 전체), PR 제목·본문(커밋 목록·검사 결과·병합 순서), Windows용 `open-pr.cmd`를 만든다. 사용자는 한 번 실행으로 fetch → 브랜치 끝 검증 → push → 작업 폴더를 파일 변경 없이 마지막 브랜치로 이동 → PR 생성(`gh` 없으면 클립보드+브라우저)까지 한다.
- 에이전트가 GitHub에 직접 push하게 하려면: 로컬 PC에서 작업하는 도구는 사용자 git 로그인 그대로, Claude 클라우드 세션은 **세션 소스(연결된 저장소)에 `8848man/Vencubator`를 추가**하면 된다. 그 경우 handoff는 쓰이지 않는다.

### 12.5 환경별 실행 위치

| 환경 | 파일 수정 | git 실행 |
|---|---|---|
| 사용자 PC의 에이전트(Codex·Claude Code 등) | 작업 폴더 | 작업 폴더에서 `node scripts/gitflow.mjs …` |
| Claude Cowork(클라우드+폴더 연결) | 연결된 폴더 | **클라우드의 깨끗한 클론**에서 실행하고, 같은 파일을 폴더에 반영. 끝에 handoff 또는 직접 push |
| 파일 삭제가 막힌 VM | — | git 쓰기 금지. `gitflow`가 시작 시 삭제 가능 여부를 검사해 막는다. 읽기는 `GIT_OPTIONAL_LOCKS=0` |

### 12.6 수용 기준 (r0.2)

| AC | 기준 | 검사 |
|---|---|---|
| AC-G08 | start: 이름 검증, 기반 자동 선택(병합 안 된 작업 브랜치 위 stack / origin/main), 더러운 트리 거부(`--carry` 예외), 기반 기록 | `scripts/tests/gitflow.test.mjs` |
| AC-G09 | commit: 종류·제목 형식, 명시 경로만, main 거부, 빈 커밋 거부, 커밋된 CP 수정 거부, 본문 줄 | 같은 파일 |
| AC-G10 | finish: 더러운 트리 거부, 검사 실패 시 push 안 함, 검사 뒤 추적 파일 변경 감지, push(쌓인 기반 포함) | 같은 파일(로컬 bare 원격) |
| AC-G11 | handoff: 쌓인 브랜치 bundle·끝 SHA 검증 스크립트·PR base 순서·본문 생성, CRLF·UTF-16 클립보드 | 같은 파일 |
| AC-G12 | guard: 파일 삭제가 막힌 환경에서 쓰기 명령 거부, 잠금 파일을 남기지 않음 | 같은 파일(모의) + 세션 기록 |

