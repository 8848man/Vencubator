# 재사용 SDD 양식

새 문서는 필요한 섹션을 복사해 별도 ID 파일로 만든다. 이 템플릿 자체를 승인 기록이나 구현 결과로 사용하지 않는다.

## Spec 양식

- ID / Title / Revision / Status / Owner / Updated
- Related requirements / hypotheses / ADRs
- Approval reference(없으면 없음)
- Intent
- Scope
- Non-goals
- User Flow
- Functional Requirements(안정적인 FR ID)
- Data Requirements(소유권·권위·revision·삭제)
- UI/UX Requirements(상태·접근성)
- API Requirements(권한·중복·충돌)
- Error Cases
- Analytics Events(정의·발생 주체)
- Acceptance Criteria(Given/When/Then, AC ID)
- Validation Method(단위·통합·E2E·수동 구분)
- Open decisions / Change impact

## ADR 양식

- ID / Title
- Status: Proposed / Accepted / Deprecated / Superseded
- Context
- Decision
- Alternatives
- Consequences
- Related Specs
- Accepted by / evidence / date
- Supersedes / replaced by

## Plan 양식

- Task / approved Spec revision / ADR
- 현재 상태와 영향 분석
- 작업 순서·예상 변경 파일
- 데이터/API migration·호환성
- 테스트와 성공 기준
- 실패/롤백 방법
- 범위 밖 발견 처리

## 승인 기록 양식

- 승인 주체 / 날짜 / 사용자 지시의 정확한 의미
- 대상 ID 및 revision
- 포함·제외 범위 / 조건
- 재검토가 필요한 변경

## Validation 양식

- ID / 대상 Spec revision / commit 또는 작업 트리 상태
- 환경·도구·실행 시각
- 실행 명령/절차와 실제 결과
- AC별 Pass / Fail / Not run / Not applicable
- 실패 원인·재현·미검증 위험
- 관련 로그/산출물
- 다음 조치

## Handoff 양식

- 기준 checkpoint ID / STATE revision
- 현재 목표 / 단계 / 작업 ID
- 이번에 완료한 것과 파일
- 승인·결정 상태
- 검증 결과·미실행 항목
- 진행 중 변경·기존 사용자 변경
- 막힌 점·필요 정보
- 다음 첫 행동과 읽을 파일
- commit/branch/배포 상태

## Release 양식

- 버전(Web/app/API/schema/policy, Android versionCode)
- commit / 승인 Spec·ADR revision
- artifact / release notes / migration
- 배포 전 테스트 결과
- 배포 시각·환경·결과
- smoke test / 관찰성 / rollback
- 알려진 한계와 후속 작업

## Stage / Phase 양식

- Stage/Phase ID, 목적·범위·비목표·제품 수준(가상/실제)
- 진입 조건·선행 Phase·승인 범위
- W 표: ID / 산출물 / 검증·관련 AC
- 변경 예정 영역 / 데이터·연동·플랫폼
- 종료 조건 / Stage gate / 실패 시 돌아갈 위치
- 중단 가능한 경계·필수 재개 정보
- 실시간 상태는 STATE 링크로 참조

## Work Item 양식

- W ID / Stage / Phase / revision / 부모·자식(분할 시)
- 목표 / 범위 / 비목표
- 관련 Spec/ADR revision / 승인 근거
- 선행조건 / 예정 변경 파일
- 수용 기준 / 실제 실행 가능한 검증 절차
- 저장 경계 / 외부 side effect 확인 절차
- 실시간 status: STATE 참조, 결과: CP/VAL 링크
- 규모 판단: 계획 선행 대상 여부와 근거 한 줄(CHECKPOINT-PROTOCOL §3-1)
- 대상이면 `## 실행 계획·체크리스트` (구현 전에 작성·커밋·시작 CP)

```
| # | 상태 | 할 일 | 파일 | 확인 방법 | 커밋 |
|---|---|---|---|---|---|
| 1 | [x] | 브랜치 시작, 계획·체크리스트 작성 | work-items/<W>.md | 파일 존재 | docs |
| 2 | [ ] | 명세 revision 기록 | docs/specs/... | AC 번호 | spec |
| 3 | [ ] | 구현 한 묶음 | ... | 단위 테스트 | feat |
| … | [ ] | 검증 기록(VAL) | docs/validation/... | 실행 결과 | docs |
| N-1 | [ ] | 완료 CP·STATE·요약 | checkpoints, STATE | verify-checkpoint | cp |
| N | [ ] | finish(push 또는 handoff), 연결 폴더 반영 | _handoff | 해시 일치 | — |
```
상태: `[ ]` 대기 · `[~]` 진행 중(1개) · `[x]` 완료 · `[!]` 막힘(사유). 항목 12개 초과·독립 산출물 2개 이상이면 W 분할.

## Checkpoint 양식

- CP ID / previous CP / target_state_revision / 날짜 / 이유
- active Stage/Phase/W / 관련 Spec·ADR·승인
- 완료 산출물 / 마지막 검증 성공 지점 / 진행 중 변경
- 실패·미실행 검사 / 실제 명령·결과 / VAL 링크
- changed_paths / 사용자 선행 변경 / manifest 경로
- branch·HEAD(없으면 null) / migration·배포·외부 job 상태
- 다음 첫 행동: 구체 파일·섹션·case와 확인/수정 내용
- 체크리스트 위치: `k/N 완료`, 다음 항목 번호(있는 W만)
- blocker 또는 waiting 조건 / 다음 확인 시점 / 저장하지 않은 변경

manifest: checkpoint_id, target_state_revision, algorithm=SHA256, files[{path, exists, sha256}]. 경로는 프로젝트 상대 경로. missing 파일은 exists=false, sha256=null. 비밀·개인정보 원문은 기록하지 않는다.
