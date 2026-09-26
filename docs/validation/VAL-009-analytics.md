# VAL-009 — Analytics

2026-09-26 / AUTH-015 / SPEC-011 r0.1

- node --test prototype/tests/*.test.mjs site/tests/*.test.mjs: 61/61 passed. 빌드 검사 포함.
- 운영 호스트 제한, internal 세션 유지, DNT/lab 제외, 이벤트 속성 allowlist, URL 정제, 1회 초기화, SDK 로드 실패 격리 확인.
- node --check prototype/app.mjs 및 guided-ui.mjs 성공. git diff --check 성공.
- 콘솔 GA4 수신·실제 브라우저·배포: 아직 미실행. 자동 테스트는 가짜 window 대상으로 전송 계약을 검증했으며 원격 수신 증거가 아니다.
- 선행 CP0046 변경 보존. 로컬 분석 대시보드는 이번 범위 제외.
