# SPEC-001 — 첫 아이디어에서 첫 근거 기반 결정까지

Revision 0.1 · Status Review-ready · Approval 없음 · Priority P0

## Intent

초보 1인 빌더가 인터뷰로 아이디어를 정리하고, 필요한 지식 하나를 배우고, 실제 행동 결과를 기록하여 다음 결정을 할 수 있게 한다. 한 번의 채팅 답변이나 퀴즈 완료를 성공으로 삼지 않는다.

## Scope

로그인, 프로젝트 초안, AI 인터뷰, Context 확인, 부캐, 최소 학습·질문·Evidence·Decision·보상·다음 행동, 중단 복구. 7개 축 정책은 SPEC-002, 화면은 SPEC-003에 위임한다.

## Non-goals

기존 앱 import, AI 페르소나 엔진, 결제, 협업, 투자 추천, 자동 개발·배포, 랭킹, 완전 오프라인. 본 명세는 실제 연동을 포함하는 MVP 계약이다. 먼저 [SPEC-004](SPEC-004-prototype.md)의 프로토타입을 검증하고 [MVP Phase 계획](../plans/stages/STAGE-02-mvp.md)으로 본 명세를 구현한다. 프로토타입 통과와 본 명세 전체 완료를 구분한다.

## User Flow

01→02→03→04→05→06→07→13→필요 시 09→10→사용자 변경 확인→11/12→13. 외부 인터뷰 수행 시간은 앱 세션과 분리한다. 08은 선택 방문.

## Functional Requirements

| ID | 요구 |
|---|---|
| FR-01 | 인증 계정은 자기 프로젝트만 조회·수정한다 |
| FR-02 | 한 문장으로 프로젝트 생성, 중복 요청은 한 프로젝트만 생성 |
| FR-03 | 핵심 질문 4~6개를 기본으로 모름·나중에·수정을 지원한다 |
| FR-04 | AI는 초안을 제안하고 사용자가 확인할 때만 Context 새 revision이 생성된다 |
| FR-05 | 같은 답변 재시도와 뒤로가기가 중복 보상을 만들지 않는다 |
| FR-06 | 실제 근거와 가설·시뮬레이션을 구분하고 변경 근거를 추적한다 |
| FR-07 | 본캐와 부캐를 독립 산정하고 결과를 하나의 화면에서 구별해 설명한다 |
| FR-08 | 현재 중요한 미확인 사항에 맞는 행동 하나를 사용자 선택으로 확정한다 |
| FR-09 | 관찰 결과가 부정적이어도 정직하게 기록하고 새 결정을 할 수 있다 |
| FR-10 | 중단·재로그인·네트워크 실패·동시 수정에서 저장한 내용을 잃지 않는다 |

## Data Requirements

User → Project → BusinessContext/Claim/Evidence/Decision/NextAction, User → LearningAttempt/ConceptMastery, 양쪽 변화 → GrowthEvent. 필드와 권위는 [ARCHITECTURE §2](../architecture/ARCHITECTURE.md)에 정의한다. 사용자가 ‘모름’을 선택하면 값 없음과 그 상태가 보존된다. AI의 추측으로 채우지 않는다.

## UI/UX Requirements

첫 홈에는 주요 행동 1개, 관련 스탯 최대 3개. 모든 확정 성장에는 이유·전후·본캐/부캐 구분. 단순 저장이나 복습도 시각 피드백을 주되 거짓 성장을 표시하지 않는다. 숫자 성공률 금지, 모션 감소·키보드·화면 읽기 접근성 지원.

## API Requirements

CreateProject / SubmitInterviewAnswer / ProposeContext / ConfirmContext / SubmitLearningAttempt / CommitProjectAction / ChooseNextAction 의미 계약을 따른다. Mutation마다 인증·소유권·idempotency key·필요한 expectedRevision을 검증한다. 클라이언트에 공급자 관리자 키를 넣지 않는다.

## Error Cases

AI 지연/잘못된 schema→답 보존+정적 질문. revision 충돌→양쪽 차이를 보여주고 재확정. 로그인 만료→원래 작업 복귀. 쓰기 실패→보상 없음+동일 키 재시도. 근거 누락→저장 가능한 draft와 성장 불가 이유. 삭제 프로젝트 알림→목록 안내. 공급자 중단이 사용자 데이터 접근 실패로 이어지지 않게 한다.

## Analytics Events

project_created → interview_started/completed → context_confirmed → next_action_selected → learning_attempt_completed(optional) → evidence_recorded → decision_committed → growth_committed → next_action_selected. 분자/분모와 H02/H03 연결은 기획서 §8, 상세 payload는 아키텍처 §6.

## Acceptance Criteria / Validation Method

| ID | Given / When / Then | 검증 |
|---|---|---|
| AC-F01 | 사용자 A가 B의 프로젝트 ID로 조회/수정하면 내용은 반환되지 않는다 | API 통합·RLS 검사 |
| AC-F02 | 동일 생성 요청이 두 번 도착하면 프로젝트 하나를 반환한다 | 동시 요청 통합 |
| AC-F03 | AI 초안에 틀린 내용이 있어 수정·모름으로 확정하면 그 값과 출처가 유지된다 | 통합·E2E |
| AC-F04 | 답변 저장 뒤 종료·재로그인하면 같은 저장 지점에서 재개한다 | Web/Android E2E |
| AC-F05 | 퀴즈를 통과하면 본캐만, 실제 적격 근거·판단이 있으면 부캐가 각각 바뀐다 | 정책·통합·E2E |
| AC-F06 | 같은 행동 재시도와 모달 재생에서 보상이 추가되지 않는다 | 원장/UX 통합 |
| AC-F07 | 기존 가설에 반하는 인터뷰 저장 시 반박 상태와 후속 결정이 유지된다 | 통합·시각 |
| AC-F08 | 실제 Evidence를 참조한 Decision과 다음 행동이 있어야 핵심 루프 완료로 집계한다 | 분석 쿼리 fixture |
| AC-F09 | Web과 Android에서 동일 계정으로 확정 revision과 본캐를 조회한다 | 실기기 교차 검증 |
| AC-F10 | AI 실패·offline·revision 충돌에 초안 보존 및 명시적 미확정 상태가 있다 | 실패 주입 테스트 |

검증 상태: 문서 수용 기준만 작성. 구현·테스트·사용성 실험은 아직 수행하지 않았다. SPEC-001 승인만으로 미정 ADR의 대규모 선택을 자동 승인한 것으로 보지 않는다. 사용자가 특정 스택과 함께 구현을 요청하면 그 범위를 함께 기록한다.

## 2026-09-23 학습 중심 개정 — AUTH-004

진입/홈/학습/적용 흐름은 SPEC-005 r0.1이 우선한다. 한 문장 프로젝트 생성 직후 학습 길에 진입하며, 6문답과 전체 Context 작성은 선행 필수가 아니다. 홈은 다음 학습 한 개를 안내한다. 스탯/근거/결정은 프로젝트 상세에서 확인한다. 개념→문제→내 프로젝트 적용→실행→회고를 연결하며 학습 완료와 현장검증을 분리한다. 기존 데이터 및 SPEC-002 성장 원칙은 유지한다.
