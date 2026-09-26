# VAL-007 — 모바일 내비게이션 / 이름 예시

AUTH-012 · 2026-09-26 · L04-W04

- 기존 Unicode 문자 아이콘의 normal line-height를 동일 viewBox SVG로 교체. 600px 이하 버튼44×44, 아이콘20×20.
- 브라우저390/320 세 버튼44×44, 768 높이44, 1280 높이46으로 각 행 균일. 내 프로젝트/학습 길/나의 성장 이동 성공.
- 320px 학습 경로 grid 최소 폭 보완 후 scrollWidth305 <= innerWidth320.
- 로그인 placeholder 메이커 확인. 원본 앱/빌드에서 기존 실명 예시 제거. 기존 사용자 저장 이름은 변경하지 않음.
- node --check prototype/app.mjs, site 빌드 성공. node --test prototype/tests/*.test.mjs site/tests/*.test.mjs:58 통과. 콘솔 오류0. 물리 모바일 미검사.
- GitHub push 및 Vercel 결과 확인 대기.

## 배포 완료

커밋 04dfc73b229b94c9d6f11b4167ef8b5e986d71d0 main push 성공. GitHub deployment6667665789 / Production success, Vercel Deployment has completed. 공개 https://vencubator.vercel.app/app/app.mjs HTTP200: 새 이름·SVG 포함, 이전 이름 예시 없음. style.css 44px 규칙 반영 확인. 개별 배포 URL은 Vercel 로그인 보호, 공개 운영 도메인으로 확인했다.
