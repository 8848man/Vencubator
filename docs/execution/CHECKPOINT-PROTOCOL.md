# 체크포인트·토큰 부족·중단 복구 프로토콜

Version 0.1 · 2026-09-23 · 적용: 모든 Stage/Phase의 구현·검증·연구 작업

## 1. 단일 상태와 필요한 파일

| 파일 | 역할 | 갱신 방식 |
|---|---|---|
| [STATE.json](STATE.json) | Stage/Phase/W 상태, active 작업, 다음 작업, 마지막 CP의 단일 권위 | revision을 올려 일괄 저장 |
| [WORKLOG.md](WORKLOG.md) | 시작/중단/재개/완료/재작업의 짧은 이력 | 기존 항목 수정 대신 뒤에 추가 |
| checkpoints/CP-NNNN.md | 특정 시점의 변경 파일·성공/실패·남은 작업·재개 행동 | 게시 후 내용 고정, 수정은 새 CP |
| checkpoints/CP-NNNN.manifest.json | 그 시점 관련 파일의 SHA256·존재 여부 | CP와 함께 고정 |
| work-items/W-ID.md | 해당 W의 고정 범위·AC·변경 예정 경로·검증 절차 | 착수 시 생성, 범위 변경 시 revision |
| validation/VAL-*.md | 실제 테스트·연구 결과와 대상 코드/명세 버전 | 검사 단위별 결과 |
| CURRENT / HANDOFF | 사람을 위한 짧은 현재 요약·재개 안내 | STATE와 같은 checkpoint ID 표기 |

작업 정의는 Stage 계획, 실시간 상태는 STATE, 실행 결과는 VAL, 저장 시점 증거는 CP로 분리한다. WORKLOG와 CURRENT는 STATE보다 우선하지 않는다. 상태 파일만 최신이고 실제 파일이 다르면 복구 점검 후 새 CP를 발행한다.

현재 등록: 3 Stage / 14 Phase / 42개 초기 W. 상세 W 파일은 착수 직전에만 생성하여 불필요한 빈 문서 복제를 피한다. [work-items 안내](work-items/README.md) 참조.

## 2. 상태 필드·상태 전이

STATE 필수 필드: schema_version, revision, plan_baseline, implementation_status, active(stage/phase/work_item/owner/run_state), next, checkpoint(id/path/manifest), stages, phases, work_items, updated_at.

미착수 W는 phase/status/validation_status와 필요한 의존성만 간결하게 저장한다. 생략한 kind는 work_item, children/validation_refs는 빈 배열, completed_checkpoint/definition_path/blocker는 null, needs_decomposition은 false다. 실제 전환 시 필요한 필드를 추가한다. 참조 도구는 이 기본값을 적용한다.

- W/Phase status: `not_started → in_progress → validating → completed`. `paused`, `blocked`, `waiting_external`, `deferred`로 분기 가능. 재개는 원래 작업 상태와 마지막 CP를 보고 결정한다.
- `paused`: 정상 중단/문맥 부족으로 파일을 저장하고 멈춘 상태. `blocked`: 필요한 결정·자격·외부 조건 없이는 수행 불가. `waiting_external`: 연구 관찰 기간·빌드 등 외부 결과 대기. 언제 다시 확인할지 기록한다.
- `validation_status`: `not_run / passed / failed / stale / not_applicable`. 완료하려면 필수 검증 passed와 evidence 링크가 필요하다. 문서 작업처럼 별도 테스트가 불필요하면 not_applicable의 이유가 필요하며 필수 제품 테스트에 사용하지 않는다.
- `gate_status`: `not_evaluated / passed / failed / blocked`. Phase W 완료와 Stage 게이트 통과는 별개다. 연구 분석 완료 뒤 가설이 실패하면 W는 completed, 게이트는 failed가 될 수 있다.
- 하나의 active W만 허용한다. owner는 충돌을 발견하기 위한 세션 표식이며 OS 파일 잠금이 아니다.
- 완료 W에는 `completed_checkpoint`와 `validation_refs`를 남긴다. completed 개수로 통과율을 보여줄 수 있지만 동일 난이도의 노력 비율이나 사업 완성률이라고 표시하지 않는다.

## 3. 시작과 작은 작업 분할

1. AGENTS → CURRENT → STATE → 마지막 CP를 읽는다. 충돌 시 STATE의 CP 링크와 실제 파일을 대조한다.
2. 해당 Stage의 Phase·관련 Spec/ADR/승인·W 파일만 읽는다. 이미 완료한 다른 Phase 전체 기록은 필요할 때만 읽는다.
3. 작업이 한 번의 제한된 문맥에서 검토하기 너무 크면 **착수 전 분할**한다. 예: M03-W03 → M03-W04~W10(7영역 콘텐츠), W11(채점 연결). 원래 W03은 집계용 container로 전환하고 children을 기록한다. 기존 ID를 다른 의미로 재사용하지 않는다.
4. STATE에 새 W·의존성·분할 이유·scope revision을 추가하고 Stage 계획/WORKLOG를 연결한다. container와 children을 완료 개수에 중복 집계하지 않는다.
5. W 문서에 목적·AC·예정 변경 파일·예상 검증을 적고 active와 시작 CP를 게시한 뒤 구현한다.

W는 기본 30~90분 가이드지만 완료를 시간으로 판정하지 않는다. 특히 콘텐츠 묶음·성장 원장·Android 알림은 필요 시 여러 W로 나눈다. 기존 승인 범위 안의 기계적 분할은 새로운 사용자 승인을 요구하지 않는다.

## 4. 체크포인트 필수 내용

- checkpoint ID, 이전 CP, 대상 STATE revision, 날짜, 이유(start/boundary/pause/recovery/completion)
- Stage/Phase/W와 참조 Spec/ADR revision, 승인 근거
- 완료한 산출물, **마지막으로 검증된 지점**, 진행 중 변경, 실패한 검사, 아직 실행하지 않은 검사
- changed_paths, 신규 미추적 파일, 사용자 선행 변경, 삭제/이동 의도, 중요한 파일 manifest
- 실제 실행 명령/절차·결과·로그 위치. 명령이 아직 없으면 ‘미정/미실행’으로 기록
- branch/HEAD(없으면 null), migration·배포·외부 job 상태와 ID, 중복 재실행 위험
- 다음 첫 행동: 파일·함수/섹션·case ID와 무엇을 확인/수정할지. ‘계속 개발’ 금지
- blocked/waiting이면 조건·다음 확인 시점. 저장하지 않은 편집 여부

원문 채팅, 전체 도구 출력, 내부 추론을 복사하지 않는다. 결정·대안·근거만 ADR/Decision 링크로 남긴다. secret·실제 고객 원문을 CP에 저장하지 않는다.

## 5. 게시 순서와 도중 중단

여러 파일 변경은 하나의 원자적 트랜잭션이 아니다. 다음 순서로 불완전 저장을 구별한다.

1. 현재 작업 파일과 VAL 결과를 저장한다. 검증되지 않은 코드는 반드시 pending/failed로 표시한다.
2. 이전에 쓰지 않은 CP 번호로 CP 문서·manifest를 작성하고 경로·필수 필드·hash를 확인한다. CP는 `target_state_revision`을 가진다.
3. **STATE를 마지막에 새 revision으로 교체하여 CP를 게시한다.** JSON parse·CP 링크·revision을 즉시 확인한다. 새 CP가 존재해도 STATE가 가리키기 전에는 준비된 기록일 뿐이다.
4. WORKLOG 추가, CURRENT/HANDOFF의 checkpoint ID·요약 갱신. 요약 파일에 정책을 복제하지 않는다.

STATE 손상/부분 기록이면 파일을 보존한 채 가장 최근의 완전한 CP와 WORKLOG·이전 revision 증거를 찾아 검사한다. 번호가 가장 높다는 이유만으로 CP를 자동 채택하지 않는다. manifest와 실제 파일·참조 revision을 확인한 후 recovery CP와 새 STATE를 만든다. 일부 준비 CP는 채택 또는 미채택 사유를 WORKLOG에 남긴다.

manifest는 현재 W의 관련 소스/테스트/명세와 git 상태에서 식별한 변경 경로를 포함한다. STATE/CURRENT/HANDOFF/WORKLOG처럼 CP 게시 뒤 바뀌는 파일을 스스로 hash하는 순환 구조는 피한다. 이는 백업이 아니므로 실제 코드 유실을 복구해주지는 않는다. Git commit 또는 별도 백업은 독립적으로 관리한다.

## 5-1. git과의 연결 (SPEC-014 §12)

CP 게시(STATE 교체와 WORKLOG·CURRENT·HANDOFF 갱신) 직후 `node scripts/gitflow.mjs commit cp "<요약>" <CP·manifest·STATE·WORKLOG·CURRENT·HANDOFF> --cp CP-NNNN`으로 커밋한다. CP 본문과 STATE.git에는 작업 브랜치 이름을 적는다. 이미 커밋된 CP 파일은 고치지 않는다(도구가 거부). 요청이 끝나면 `gitflow finish`로 검사·push한다.

## 6. 토큰·문맥 부족 대응

모델마다 실제 남은 문맥/토큰 정보를 읽을 수 있는 것은 아니다. 정확한 잔여량을 안다고 가정하지 않는다. 다음 **작업 경계 기준**을 기본으로 한다.

- W 시작 전, 의미 있는 파일 수정 묶음 뒤, 테스트 결과 직후, 범위/결정 변경 직후, migration/배포 전후에는 CP를 남긴다.
- 문맥 경고나 사용자 중단 요청이 오면 새 W·대규모 리팩터링·긴 외부 작업을 시작하지 않는다.
- 먼저 코드/초안 저장 → CP에 미완료와 다음 행동 기록 → STATE paused → 짧은 인계 순서로 마친다. 테스트를 못 끝냈으면 완료 대신 not_run/failed를 남긴다.
- 종료할 여유가 매우 작으면 최소한 active ID, changed_paths, 마지막 성공 검사, 실패/미검사, next_action을 새 CP에 먼저 저장한다. 미완성 정식 VAL은 다음 세션에서 보완한다.
- 문맥이 충분해도 한 Stage를 채팅 기억에만 의존해 끝까지 수행하지 않는다. 파일을 작은 묶음으로 읽고 CP 중심으로 교체 가능하게 한다.

매 작업 전에 저장하므로 강제 종료로 ‘마지막 한 작업 묶음’이 기록에서 빠질 수 있다. 이를 완전한 무손실 보장으로 표현하지 않는다. 다음 복구 절차가 누락을 탐지한다.

## 7. 예고 없는 종료·모델 교체 후 복구

1. STATE가 in_progress여도 이전 프로세스가 실행 중인지 확인한다. 소유자가 다르다는 이유로 프로세스를 임의 종료하지 않는다. 같은 폴더 동시 쓰기는 피한다.
2. `git status`와 tracked diff뿐 아니라 **신규 untracked 파일**도 조사한다. 현재 저장소처럼 commit이 없으면 git diff만으로 복원하지 못하므로 manifest·파일 존재·내용 대조를 사용한다.
3. CP manifest와 실제 관련 파일 hash가 다르면 어떤 수정이 들어왔는지 읽는다. AI 미완료 수정/사용자 수정인지 모르면 덮어쓰거나 reset하지 않는다.
4. 변경과 연결된 validation을 stale로 표시한다. 영향 없는 과거 Phase 테스트까지 무조건 재실행하지 않는다.
5. 실행 중 test/build/job은 프로세스/결과를 확인한다. 완료 출력이 없으면 결과 unknown/not_run이고 ‘아마 통과’를 쓰지 않는다. migration/결제/발송/import는 외부 상태 확인 전 재시도하지 않는다.
6. 기존 범위와 실제 상태를 맞춘 recovery CP를 발행한다. 다음 필요한 최소 검사부터 실행한다.
7. 한 W가 완료되어도 선행 Phase 게이트와 승인 범위를 확인하고 다음 W로 이동한다. ‘계속해’는 허용된 단계 안의 재개이며 후보 고도화 전체를 자동 승인하지 않는다.

## 8. 변경·재작업·검증 연결

승인 Spec의 동작 변경은 scope revision과 영향 W를 기록한다. 완료된 W를 다시 열면 과거 CP/VAL은 보존하고 현재 검증을 stale로 바꾸며 이유를 기록한다. 이후 Phase가 이전 계약에 의존했다면 그 부분만 재검증한다. 단순 문구 변경은 코드 검증을 전부 무효화하지 않는다.

완료 체크: 관련 AC 충족, 실제 검증 기록, 관련 파일·원문 수정 보존, CP와 STATE 일치, 다음 작업 지정. Stage 완료는 게이트 판단과 릴리스/연구 증거까지 요구한다. commit을 아직 하지 않은 completed W는 가능하지만 commit/release 상태는 별도 null로 유지한다.

## 9. 재개 프롬프트

> AGENTS.md와 docs/context/CURRENT.md, docs/execution/STATE.json 및 해당 checkpoint를 읽어라. 활성 작업과 다음 W를 실제 파일/git 상태에 대조해라. 변경된 파일의 기존 검증은 필요한 범위에서 stale로 처리하고, 관련 Phase·Spec·ADR·승인 범위 안에서 다음 한 작업부터 이어라. 종료 전에 체크포인트와 상태를 저장하라. 완료하지 않은 작업을 완료로 추정하지 마라.

## 10. 수동 검증 기준

1. 14 Phase/42 초기 W의 ID·의존성·첫 다음 작업이 일치한다.
2. STATE JSON이 파싱되고 active 참조·CP 경로·revision이 유효하다.
3. CP manifest의 관련 파일과 hash가 맞는다.
4. 가상의 중단 사례: 수정 후 미검증 / 테스트 도중 / CP만 저장 / STATE 게시 후 요약 미갱신 / untracked 추가 / spec 변경을 각각 안전하게 복구할 수 있는 절차가 있다.
5. 실제 다른 모델·프로세스 종료 실험은 구현 후 별도 VAL로 기록한다. 이 프로토콜이 자동 저장 데몬이나 자동 감시를 설치하는 것은 아니다.
