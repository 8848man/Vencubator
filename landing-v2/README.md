# Vencubator 랜딩 v2 — 아이디어 카드

v1(`landing/`)이 참고 사이트의 섹션 구성을 그대로 따랐던 문제를 바로잡은 버전입니다. **분석 → 설계 원리 추출 → 독립 표현**으로 다시 설계했고, “더 나은 UI/UX를 줄 수 있다면 구현한다”를 기준으로 삼았습니다.

방문자가 **한 문장**을 적으면, 페이지를 내려가는 동안 자기 아이디어의 **첫 번째 카드 5칸**(아이디어 · 배운 개념 · 내 질문 · 관찰 · 결정)이 채워집니다. 카드는 목차이자 진행 표시이고, 마지막에 그 카드로 프로토타입을 시작합니다.

## 실행

- **Windows:** `landing-v2/start.cmd` 더블클릭 → 랜딩 v2(4175)와 프로토타입(4183)이 열립니다.
- 서버 없이: `landing-v2/dist/index.html` 더블클릭 (`landing-v2/index.html`을 열어도 dist로 이동).
- 직접: `node landing-v2/scripts/serve.mjs` → http://127.0.0.1:4175/landing-v2/

```bash
node --test landing-v2/tests/*.test.mjs          # 명세 AC 검사
node landing-v2/scripts/build.mjs                # dist 단일 파일 생성
node landing-v2/scripts/qa.mjs --shots           # (선택) Playwright 시나리오
```

## 문서

| 문서 | 내용 |
|---|---|
| [PRINCIPLES](docs/PRINCIPLES.md) | v1 회고, 분석, 설계 원리 DP-1~8, v1 대비 독립 표현 매핑 |
| [SPEC-007](docs/SPEC-007-landing-v2.md) | 섹션·상태 모델·상호작용·모션·AC (권위 명세) |
| [AI-IMPROVEMENT](docs/AI-IMPROVEMENT.md) | AI로 개선할 때의 판단 기준·절차·프롬프트 |
| [VAL-L02](docs/VAL-L02.md) | 검증 기록 |

## 코드

`src/content.mjs`(카피·템플릿) → `src/state.mjs`(순수 상태) → `src/render.mjs`(정적 마크업) → `src/interact.mjs`(이벤트·관찰자·모션). 입력은 서버로 보내지 않고 이 브라우저에만 저장합니다.
