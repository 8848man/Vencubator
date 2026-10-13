# HANDOFF

CP-0107 / STATE revision 107

L08-W02 설계 완료, 체크리스트 5/5. AUTH-031에 따라 SPEC-019 r0.3에 첫 흐름 완료×인증 상태별 화면과 별도 로그인 게이트를, ADR-007에 비밀 아닌 기기 표시와 서버 인증 권위를 적었다. VAL-020은 설계 검토 통과이며 실제 기능 테스트는 미실행이다. 현재 S1 앱은 `demo-user` 자동 생성 방식 그대로다.

브랜치 `w/L08-W02-first-flow-login-gate`는 미병합 L08-W01 PR #16 위 스택. 기존 `site/audience/render.mjs` 사용자 수정과 선행 미추적 파일은 커밋하지 않았다. 다음 첫 행동: `node scripts/verify-checkpoint.mjs`로 CP-0107을 확인하고, W02 변경 커밋만 push/PR 또는 `_handoff/open-pr.cmd`로 전달한다. 이후 사용자가 실제 인증·계정 저장 구현을 요청하면 새 W와 승인 근거를 만든다. main 병합·운영 배포는 사용자 몫이다.
