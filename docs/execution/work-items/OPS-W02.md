# OPS-W02 — 중단 대비 계획·체크리스트 선행 규칙

AUTH-023 · OPS(작업 방식) · CHECKPOINT-PROTOCOL r0.2 §3-1, SDD r0.3, AGENTS.md. 문서 작업, 제품·도구 코드 변경 없음.
브랜치 `w/OPS-W02-plan-first-checklist` (기반 `w/P08-W01-value-feedback-spec`, 미병합 쌓기).

요청: “중간에 토큰이 부족할 가능성이 있으니까, 작업을 시작하기 전에 AI가 판단했을 때 중단될 수 있는 규모의 작업이면 먼저 계획 및 체크리스트를 생성하고, 해당 계획을 바탕으로 구현하도록 구현 명세를 개선해줘.”

## 규모 판단
예정 변경 문서 6개(AGENTS·CHECKPOINT-PROTOCOL·SDD·SDD-TEMPLATES·APPROVALS·STATE 계열) + CP·커밋·handoff 연쇄 → 새 규칙의 ‘계획 선행’ 대상. 이 W부터 규칙을 적용한다.

## 실행 계획·체크리스트
상태 표기: `[ ]` 대기 · `[~]` 진행 중 · `[x]` 완료 · `[!]` 막힘(사유).

| # | 상태 | 할 일 | 파일 | 확인 방법 | 커밋 |
|---|---|---|---|---|---|
| 1 | [x] | 브랜치 시작, 이 계획·체크리스트 작성 | work-items/OPS-W02.md | 파일 존재 | docs |
| 2 | [x] | 승인 기록 AUTH-023 | docs/process/APPROVALS.md | 요청 원문·범위 | docs |
| 3 | [x] | 시작 CP 게시(체크리스트 위치 2/9) | checkpoints, STATE, WORKLOG, CURRENT, HANDOFF | verify-checkpoint 통과 | cp |
| 4 | [x] | 규모 판단 기준·체크리스트 형식·갱신·이탈 규칙 신설 | docs/execution/CHECKPOINT-PROTOCOL.md §3-1, §4, §6 | 기존 §3 분할 규칙과 충돌 없음 | spec |
| 5 | [x] | 작업 시작 절차에 계획 선행 단계 추가 | AGENTS.md | 진입 순서 1~5 일관 | spec |
| 6 | [x] | Plan 상태·완료 정의에 체크리스트 반영 | docs/process/SDD.md | 상태 전이 문구 일치 | spec |
| 7 | [x] | Work Item·Checkpoint 양식에 체크리스트 칸 추가 | docs/templates/SDD-TEMPLATES.md | 양식이 §3-1과 같은 열 구성 | docs |
| 8 | [~] | 교차 검토: 용어·버전·링크, gitflow 필수 검사 | 위 파일 | 검사 통과, 문서 간 모순 없음 | — |
| 9 | [ ] | 완료 CP·STATE·요약, finish(push 불가 시 handoff), 연결 폴더 반영 | checkpoints 등 | verify-checkpoint, 반영 파일 해시 일치 | cp |

범위 밖: gitflow/verify-checkpoint 도구의 체크리스트 자동 검사(필요 시 별도 W).
