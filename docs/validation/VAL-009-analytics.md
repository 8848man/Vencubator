# VAL-009 — Analytics

2026-09-26 / AUTH-015 / SPEC-011 r0.1

- node --test prototype/tests/*.test.mjs site/tests/*.test.mjs: 61/61 passed. 빌드 검사 포함.
- 운영 호스트 제한, internal 세션 유지, DNT/lab 제외, 이벤트 속성 allowlist, URL 정제, 1회 초기화, SDK 로드 실패 격리 확인.
- node --check prototype/app.mjs 및 guided-ui.mjs 성공. git diff --check 성공.
- 콘솔 GA4 수신·실제 브라우저·배포: 아직 미실행. 자동 테스트는 가짜 window 대상으로 전송 계약을 검증했으며 원격 수신 증거가 아니다.
- 선행 CP0046 변경 보존. 로컬 분석 대시보드는 이번 범위 제외.

운영 검증: 5ef5ac7 main push, Vercel success, 공개 /app/track.mjs HTTP200 및 측정 ID 확인. Edge에서 랜딩/앱 렌더링 성공·콘솔 오류 0. Firebase Realtime 활성 사용자 1, landing_view 수신 확인. 학습 영역 gtm 허용 목록 누락 발견 후 수정, 실제 PATH 전체를 검사하는 회귀 추가. 해당 7개 검사(analytics+build) 통과.

Firebase 실시간에서 app_open, cta_click, lesson_start도 수신 확인. 운영 앱 로그 errors=[] 확인. 콘솔 GA4 속성 ID 556036077. 원격 향상된 측정 설정은 변경하지 않음.
최종 1d600fc main push 및 Vercel success 확인. 운영 track.mjs HTTP200, gtm 수정 반영 확인. 명세/공통 인터페이스/배포 완료. GA4 자동 향상된 측정 설정 및 실제 사용자 전환율 연구는 미실행.
