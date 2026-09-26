# VAL-008 — 모바일 페이지별 상단 행 높이

AUTH-013 · 2026-09-26 · L04-W05

원인: 모바일에서 layout이 한 열 grid가 되면서 min-height:100vh의 여분 높이가 auto 행에 배분됨. 본문이 짧은 프로젝트 화면에서 sidebar가 늘어남. 이전 VAL-007은 버튼 규격만 확인하여 행 늘어남을 놓쳤음.

수정: 820px 이하 grid-template-rows:max-content minmax(0,1fr), workspace min-width0.

실제 IAB 탭별 측정(학습 길/내 프로젝트/나의 성장 모두 동일):
- 390: sidebar77, nav44, topbar57, mainTop134px
- 320: sidebar69, nav44, topbar57, mainTop126px
- 768: sidebar83, nav44, topbar57, mainTop140px
- 1280: desktop sidebar844, nav152, topbar77, mainTop77px
- 모든 조합 가로 넘침 없음. 프로젝트 짧은 페이지 screenshot 확인. 임시 viewport 복원.
- node site/scripts/build.mjs 성공. CSS만 변경하여 도메인 테스트 반복하지 않음.
- 사용자 지시로 commit/push/배포 안 함. 운영은04dfc73 그대로. 로컬4180에서 수정 확인 가능.

## AUTH-014 운영 배포 완료

사용자 로컬 확인 후 배포 승인. 커밋43b6b49 main push 성공. GitHub Vercel status success / Deployment has completed. https://vencubator.vercel.app/app/style.css HTTP200, grid-template-rows:max-content minmax(0,1fr) 포함 확인.
