# ADR-004 — 분석 수집과 프로젝트 저장 분리

2026-09-26 · AUTH-015 · SPEC-011 r0.1

결정: 기존 공통 track 인터페이스에 GA4 전송 어댑터를 둔다. Firebase가 생성한 웹 스트림 measurementId로 Google tag를 연결한다. 현재 번들러 없는 정적 빌드에서는 Firebase SDK 전체 초기화가 필요하지 않다. SDK와 tag 중복 설치를 금지한다.

분석 저장은 Google Analytics, 사업 정보는 기존 localStorage에 남는다. 분석 이벤트는 백업·사업 원장·AI context의 데이터 출처가 아니다. MVP 인증/DB 선택을 이번 결정에 종속시키지 않는다.

원문·프로젝트 ID·사용자 이름을 보내지 않고 행동/고정 분류만 보낸다. 브라우저 식별은 GA가 담당하며 cross-device 식별은 이번 범위 제외. 로컬 통계 조회 도구는 추후 Data API 어댑터로 분리한다.

대안: Firestore 자체 이벤트 저장은 쿼리/집계/보안 운영을 별도로 만들어야 해 현재 제외. Firebase SDK는 다른 Firebase 제품을 도입할 때 검토하되 기존 스트림을 유지한다.
