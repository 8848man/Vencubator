# PLAN-001 — 첫 구현 수직 흐름 계획 초안

Status: Superseded (planning-v0.2) · Related: SPEC-001 r0.1, ADR-001/002 Proposed

사용자 후속 요청에 따라 첫 구현 순서는 [프로토타입 P01~P04](stages/STAGE-01-prototype.md)로 변경되었다. 이 문서의 실제 계정·AI·Context 수직 흐름은 [MVP M01~M02](stages/STAGE-02-mvp.md)에 승계한다. 아래는 이전 계획의 근거 보존용이며 현재 착수 순서나 상태의 권위가 아니다.

## 목표

승인 후 첫 구현은 로그인→프로젝트→4개 핵심 질문→Context 확인→저장/복구까지 수행한다. 이는 전체 루프의 일부이며 SPEC-001 전체 완료가 아니다. 실제 보상·알림은 후속 TASK-007/009다.

## 선행 조건

대상 Spec revision과 플랫폼 선택에 대한 구현 지시를 기록한다. 유료 자원 생성 전 예산과 계정 연결을 확인한다. 기존 파일/git 상태를 재확인하고 사용자 변경을 보존한다. 현재 앱 코드와 package 설정은 없으므로 테스트 명령을 임의로 존재한다고 가정하지 않는다.

## 작업 분해

1. ADR 기술 검증: Web/Android 최소 인증 복귀·입력·동기화, 비용 요청량 측정.
2. Domain 계약과 상태 전이 fixture. 프로젝트/Context/AI draft 소유권·revision·중복 키부터 정의.
3. 데이터 migration과 접근 정책. 실제/테스트 환경 분리.
4. 서버 유스케이스 및 fake AI 어댑터로 정상/실패 경로.
5. 화면 01~05의 최소 UI. 06~07은 확정 요약과 다음 행동 안내 수준까지 연동.
6. 실제 공급자 한 개를 연결하되 AI 장애 시 정적 질문을 유지.
7. 권한·동시 요청·수정 보존·중단 복구·두 플랫폼 검증.
8. 검증 기록, 실제 변경 파일·미완료 범위·다음 TASK 갱신.

## 영향과 예상 경로

예상 신규 경로는 ARCHITECTURE §1의 app/features/domain/application/infrastructure다. 기존 output의 PDF·영상 생성 스크립트는 변경하지 않는다. 실제 파일 목록은 기술 선택 뒤 계획 revision에 구체화한다.

## Validation / Rollback

AC-F01~04/F09~10과 AI schema 계약. CI 최초 설정 후 실제 명령/출력/버전을 validation 기록에 남긴다. 실패 시 사용자 데이터 쓰기 경로를 비활성화하고 이전 호환 API를 유지한다. migration은 expand 방식으로 되돌릴 여지를 확보한다. 프로덕션 데이터가 없는 초기 개발 환경에서도 삭제 범위를 확인한다.

## 이후

TASK-007에서 Evidence→Decision→GrowthEvent→Reward→NextAction을 추가하고 SPEC-001 전체 AC를 평가한다. TASK-008 콘텐츠, TASK-009 알림·실기기, TASK-010 파일럿이 뒤따른다.
