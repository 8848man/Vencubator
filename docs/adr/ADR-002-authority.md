# ADR-002 — 사용자 확인·근거·보상 권위 분리

## Status

Proposed · 2026-09-23 · 승인 없음

## Context

AI 출력, 사용자가 동의한 가설, 실제로 뒷받침되는 주장, 학습 점수가 혼재하면 사업성을 과대평가한다. 앱 재시도와 Web/Android 동시 사용은 보상 중복·기록 손실 위험이 있다.

## Decision

AI draft는 별도 저장하고 사용자 확인 뒤 revision을 만든다. 확인은 사실 검증과 별개다. Evidence 출처를 엄격히 분리하고 점수는 서버의 버전 고정 정책으로 산정한다. Context/Evidence/Decision과 GrowthEvent를 원자적으로 저장한다. ProjectStat/UserStat은 재생성 가능한 파생값이다. 전체 Domain 이벤트 소싱 대신 확인 snapshot·변경 이력·보상 원장만 둔다.

## Alternatives

- AI가 0~100 점수를 매번 생성: 구현은 쉬우나 재현·설명·공급자 교체에 취약.
- 질문 횟수별 무조건 XP: 참여를 사업 발전으로 혼동.
- 전체 event sourcing: 강력한 재생성이 가능하지만 MVP 복잡도 과다.
- 클라이언트 저장만: 초기 속도는 빠르지만 계정 간 기기 동기화·권한·원자성 요구에 불충분.

## Consequences

버전·중복 키·정정 정책이 필요하다. 대신 모델이 바뀌어도 사업 사실과 보상은 흔들리지 않는다. 원장에는 개인정보 원문을 넣지 않고 삭제 요청과 복원 가능한 계산 기록의 범위를 분리한다.

## Related Specs

[SPEC-001](../specs/SPEC-001-first-loop.md), [SPEC-002](../specs/SPEC-002-growth.md), [아키텍처](../architecture/ARCHITECTURE.md).
