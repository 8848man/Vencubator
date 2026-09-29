# Vencubator 랜딩 v3.1 — 뿌리 · 다음 층

AUTH-027 / SPEC-016 r0.1. v3를 보존한 독립 개선판입니다. 다음 층 안내, 앱 CTA 진행 점, 고민 선택과 예시별 관찰 답을 제공합니다. 사이트 빌드의 루트(/)이며 운영 공개는 사용자 병합 후입니다.

- Windows: landing-v3.1/start.cmd
- 개발: node landing-v3.1/scripts/serve.mjs → http://127.0.0.1:4177/landing-v3.1/
- 빌드: node landing-v3.1/scripts/build.mjs → dist/index.html
- 검사: node --test landing-v3.1/tests/*.test.mjs
- 브라우저 QA: node landing-v3.1/scripts/qa.mjs --shots (4197, Playwright 없으면 미실행)
- 사이트: node site/scripts/build.mjs → node site/scripts/serve.mjs (4180)

[정책](docs/POLICY.md) · [명세](docs/SPEC-016-landing-v3.1.md) · [작업 지시](docs/WORKORDER.md) · [검증](docs/VAL-L31.md)

variant v31, 저장 키 vencubator.landing.v31. 앱은 ./app/?from=v31로 이름표 문장만 인계합니다. LESSON·AREAS는 앱과 일치하며, 방문자 입력은 textContent·value로만 반영합니다.
