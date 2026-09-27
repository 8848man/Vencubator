# HANDOFF

CP-0085 / STATE revision 85

P08-W04 blocked — 체크리스트 8-1까지(8번 진행 중) 완료: 설정값 저장 확인 결과 이전에는 어디에도 없었음(빈 값). 이번에 projectId·apiKey 입력. 앱 브라우저 점검: 목록 읽기 200 → 테스트 모드 규칙 게시 상태, 다른 사이트에서도 키 허용 → 키 제한 없음. 클라우드·연결 폴더 셸은 Firestore 차단이라 실측은 사용자 PC 필요.

다음 첫 행동: 사용자가 콘솔에서 firestore.rules 게시(필수, W04 병합 전)·키 사용 제한(권장) → 사용자 PC에서 node scripts/feedback-rules-check.mjs 10/10 → 체크리스트 8번 완료·완료 CP

AUTH-024 / SPEC-015 r0.4 · ADR-006. 브랜치 w/P08-W04-feedback-send. main 병합·운영 배포 없음. 사용자 선행 미추적 파일 보존.
