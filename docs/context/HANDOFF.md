# HANDOFF

CP-0084 / STATE revision 84

P08-W04 blocked — 체크리스트 8/10 중 9번까지(8번 막힘) 완료: 전송 어댑터·GA 4종·생성 전용 규칙·실측 스크립트 구현. feedback-send 8/8, prototype 74, site 18, landing-v3 41, qa-feedback 87, 회귀 tasks 83·nav 26. 막힘: 설정값 미수신(전송 꺼짐, 로컬 보관만), 규칙 실측 미실행, 사용자 콘솔에서 테스트 모드 규칙 교체 필요.

다음 첫 행동: 사용자에게 projectId·apiKey 받기 → prototype/feedback-send.mjs FIREBASE_CONFIG 입력 → 사용자 PC에서 node scripts/feedback-rules-check.mjs 10/10 확인(체크리스트 8번) → 완료 CP

AUTH-024 / SPEC-015 r0.4 · ADR-006. 브랜치 w/P08-W04-feedback-send. main 병합·운영 배포 없음. 사용자 선행 미추적 파일 보존.
