# AI 기반 개선 절차 — 랜딩 v2

프로젝트 공통 규칙(`AGENTS.md`, `docs/process/SDD.md`)이 우선한다. v1(`landing/`)은 건드리지 않는다.

## 1. 진입 순서

1. [PRINCIPLES](PRINCIPLES.md)의 DP-1~8 확인 — **개선안이 어떤 원리를 더 잘 실현하는지** 한 줄로 쓸 수 있어야 한다.
2. [SPEC-007](SPEC-007-landing-v2.md)에서 대상 L2S/L2I/L2M과 AC 확인.
3. 명세 먼저 수정 → 코드 → `node --test landing-v2/tests/*.test.mjs` → `node landing-v2/scripts/build.mjs && node landing-v2/scripts/qa.mjs` → [VAL-L02](VAL-L02.md)에 결과 추가.

## 2. “더 나은 UX”인지 판단하는 질문

변경 전에 아래 중 하나 이상에 “예”여야 한다. 모두 “아니요”면 구현하지 않는다.

- 방문자가 **더 빨리** 자기 아이디어에 적용된 모습을 보는가? (5초 이해, 1분 내 3칸)
- 방문자의 **조작 수나 읽을 양**이 줄어드는가?
- 예시와 실제, 가능과 불가능의 **구분**이 더 분명해지는가?
- 접근성(키보드·스크린리더·모션 감소·모바일)이 **나빠지지 않는가**?
- 다른 사이트의 구성을 **옮겨 오는 것**이 아니라 원리를 제품 흐름으로 표현하는가?

## 3. 변경 유형별 위치

| 요청 예시 | 수정 파일 | 명세 |
|---|---|---|
| 문구·예시 아이디어·FAQ | `src/content.mjs` | 불필요(§7 카피 규칙) |
| 퀴즈·질문 템플릿 | `src/content.mjs` + prototype과 일치 확인(AC-L2-07) | 불필요, 단 prototype 변경 시 함께 |
| 카드 칸·상태 규칙 | §4 → `src/state.mjs` → `tests/state.test.mjs` | revision 올림 |
| 새 챕터/섹션 | §3에 새 L2S-ID → content → render → (필요시) state·interact | revision 올림, ID 재사용 금지 |
| 모션 | §6 L2M → `landing.css`/`interact.mjs` | revision 올림. 스크롤 고정·스크롤 비례 변형 금지(DP-8) |
| 카드 프로토타입 인계, 대기 명단, 분석 | DR-L2-01/03 결정 후 | 사용자 승인 필요 |

## 4. 불변 조건 (테스트로 보호)

- 카피는 `content.mjs`에만, 원시 색은 `tokens.css`에만.
- 상태 변화는 `state.mjs`의 순수 `reduce`로만. 방문자 입력은 `textContent`로만 화면에 넣는다.
- 네트워크 전송 코드 금지. 저장은 이 브라우저의 localStorage만.
- 스크롤 고정 스테이지 금지, sticky는 상단바·카드만.
- 금지 표현·필수 고지·예시 표기, 진행 상태 = STATE.json, 7영역·퀴즈 = prototype.

## 5. 그대로 쓸 수 있는 프롬프트

> `landing-v2/docs/AI-IMPROVEMENT.md`, `PRINCIPLES.md`, `SPEC-007-landing-v2.md`를 읽어라. 요청: “〈변경 요청〉”. §2 질문으로 UX 개선 근거를 한 줄로 쓰고, 근거가 없으면 구현하지 말고 이유를 답하라. 근거가 있으면 SPEC-007을 먼저 고친 뒤 `landing-v2/src`만 수정하고, 테스트와 QA를 실행해 `VAL-L02.md`에 기록하라. `landing/`(v1)과 다른 폴더는 수정하지 마라.
