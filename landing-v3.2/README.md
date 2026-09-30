# Vencubator 랜딩 v3.2 — 평이한 첫 화면

AUTH-028 / SPEC-017 r0.1. v3.1(뿌리·다음 층)의 체험은 그대로 두고 메시지만 고친 판입니다. 첫 화면이 “누구를 위해(사이드 프로젝트·1인 창업을 준비하는 메이커) / 무엇을 얻나(오늘 확인할 것 하나·질문 3개·다음 한 걸음)”를 평이한 말로 먼저 말하고, 뿌리 은유는 그림과 작은 라벨로 물러났습니다.

- Windows: landing-v3.2/start.cmd (더블클릭)
- 개발: node landing-v3.2/scripts/serve.mjs → http://127.0.0.1:4178/landing-v3.2/
- 빌드: node landing-v3.2/scripts/build.mjs → dist/index.html (단일 파일, 더블클릭으로도 열림)
- 검사: node --test landing-v3.2/tests/*.test.mjs
- 5초 테스트 후보 미리보기: 주소 뒤에 ?h=b&internal=1 또는 ?h=c&internal=1 (기본은 a, 계측 제외)

운영 루트(/)는 아직 v3.1입니다. 5초 테스트 통과 뒤 site/scripts/build.mjs를 v3.2로 바꿉니다(WORKORDER 단계 5).

[정책](docs/POLICY.md) · [명세](docs/SPEC-017-landing-v3.2.md) · [작업 지시](docs/WORKORDER.md) · [검증](docs/VAL-L32.md)

variant v32, 저장 키 vencubator.landing.v32. 앱은 ./app/?from=v32로 아이디어 문장만 인계합니다.
