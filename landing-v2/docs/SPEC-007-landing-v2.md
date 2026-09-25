# SPEC-007 — Vencubator 랜딩 v2 “아이디어 카드”

Revision 0.2 · Implemented (L02-W01, L03-W01) · AUTH-006, AUTH-009 · 2026-09-25

사용자 요청(2026-09-24): “너무 기존 페이지의 구성이 너무 똑같은게 문제야. 분석 → 설계 원리 추출 → 독립적인 표현으로 재구성 방향으로 진행해야 하고, ‘더 나은 UI/UX를 제공할 수 있다면, 구현한다’를 목표로… 기존 랜딩 폴더는 내버려두고, 랜딩 v2를 작성해줘.”
근거는 [PRINCIPLES](PRINCIPLES.md)(DP-1~8), 개선 절차는 [AI-IMPROVEMENT](AI-IMPROVEMENT.md), 검증은 [VAL-L02](VAL-L02.md). v1(`landing/`, SPEC-006)은 수정하지 않는다.

## 1. 범위

| 포함 | 제외 (별도 결정) |
|---|---|
| 정적 단일 페이지, 한 문장 입력 → 5칸 아이디어 카드 체험, 퀴즈·질문 생성·관찰·결정 조작, 7영역 경로 재배치, 반응형, 모션 감소, 로컬 저장(브라우저 한정), 단일 파일 빌드 | 서버 전송·대기 명단, 실제 AI 생성, 프로토타입으로 카드 자동 인계(DR-L2-01), 분석 도구, 외부 배포 |

권위: 제품 의미·금지 표현은 PRODUCT-BRIEF·SPEC-002·SPEC-005. 퀴즈·질문 원문은 `prototype/content.mjs LESSONS.customer`, `prototype/guided.mjs QUESTS`와 같은 의미를 유지한다.

## 2. 파일 계약

| 파일 | 책임 |
|---|---|
| `src/content.mjs` | 모든 카피·예시·템플릿·링크·섹션 순서 (`SITE`, `SAMPLES`, `QUIZ`, `SECTIONS` 등) |
| `src/state.mjs` | **순수** 상태 모델: `initialState`, `reduce`, `deriveCard`, `pathOrder`, `questionsFor`, `serialize/deserialize` |
| `src/render.mjs` | 섹션 type → HTML 문자열 (순수). 방문자 입력은 렌더하지 않음(런타임에 textContent로만) |
| `src/interact.mjs` | DOM 바인딩: 이벤트 → `reduce` → 화면 반영, 관찰자(IO), 모션 |
| `src/main.mjs` | 진입점 |
| `src/tokens.css` / `src/landing.css` | 토큰 / 컴포넌트 (원시 색은 tokens에만) |
| `scripts/build.mjs` `serve.mjs`(4175) `qa.mjs` | 단일 파일 빌드 / 로컬 서버 / 브라우저 시나리오 |
| `start.cmd` | Windows 더블클릭 실행 |

## 3. 섹션 계약

| ID | type | 목적 (원리) | 핵심 요소 | 상호작용 | 모션 |
|---|---|---|---|---|---|
| L2S-00 | `topbar` | 최소 내비 | 브랜드, “처음부터”, 체험 CTA | L2I-09 | — |
| L2S-01 | `hero` | 5초 안에 “내 아이디어로 해본다” 이해 (DP-1,4) | h1, 한 문장 입력(최대 120자), 예시 칩 3개, 개인정보 안내 | L2I-01, L2I-02 | L2M-04 |
| L2S-02 | `card` | 위치=진척, 결과물, 전환 (DP-3,5) | 5칸 카드, 새싹, `n/5`, CTA. 데스크톱 우측 sticky, 모바일 하단 트레이 | L2I-07, L2I-08 | L2M-02, 03, 07 |
| L2S-03 | `chapterIdea` | 막연함 → 한 문장 (DP-2) | 걱정 태그 구름이 한 문장으로 수렴 | — | L2M-05 |
| L2S-04 | `chapterLearn` | 개념 하나를 풀어서 이해 (DP-6) | 개념 한 줄 + 퀴즈 1문항(변형 2개) | L2I-03 | L2M-01 |
| L2S-05 | `chapterApply` | 내 프로젝트 결과물 (DP-4) | “누구에게” 입력 + 질문 3개 즉석 생성 + 저장 | L2I-04 | L2M-01 |
| L2S-06 | `chapterObserve` | 근거·반박도 성장 (DP-6,7) | **예시** 관찰 2건 + 같았어요/달랐어요 | L2I-05 | L2M-01 |
| L2S-07 | `chapterDecide` | 결정은 내가 | 관찰 결과에 따른 선택지 3개 | L2I-06 | L2M-01 |
| L2S-08 | `path` | 7개 중 오늘 하나 (DP-2) | 7영역 경로, 현재·다음 강조, 반박 시 전략 앞당김 설명 | (L2I-05 결과 반영) | L2M-06 |
| L2S-09 | `grow` | 부캐/본캐 | 두 칼럼 비교 | — | L2M-01 |
| L2S-10 | `honest` | 정직한 안내 (DP-7) | S1~S3 상태, FAQ | — | L2M-01 |
| L2S-11 | `finish` | 카드로 이어가기 (DP-5) | 방문자 문장, 문장 복사+프로토타입 열기, 다시 하기 | L2I-09 | — |
| L2S-12 | `footer` | 고지 | 프로토타입·가상 예시·저장 범위 | — | — |

제약: `<h1>` 1개(L2S-01). 챕터(L2S-03~07)는 `<section>`, 카드는 `<aside>`. 화면 고정 스크롤(100svh 초과 높이 + sticky 스테이지) 금지. 한 챕터의 Primary 행동은 1개.

## 4. 상태 모델 (`state.mjs`)

```
State = {
  v: 1,
  idea:      { text, source: 'mine'|'example', sample },       // 기본: SAMPLES[0], example
  learn:     { variant: 0|1, tries, result: null|'first'|'retry'|'helped' },
  apply:     { customer, source: 'mine'|'example', saved: bool },
  observe:   null | 'supported' | 'refuted',
  decision:  null | key,
  reached:   [chapterIndex...]                                   // IO로 도달한 챕터 0~4
}
```

| Action | 효과 |
|---|---|
| `SET_IDEA {text, source, sample?}` | 공백 제거, 120자 제한. 빈 문자열이면 무시. 샘플이면 고객 기본값도 샘플로(사용자가 고객을 직접 쓴 경우 유지) |
| `ANSWER {choice}` | 정답이면 result = tries==0 ? `first` : `retry`. 오답이면 tries+1, 변형 전환. tries≥2 이후 오답이면 `helped`(정답 공개, 막히지 않음) |
| `SET_CUSTOMER {text}` | 60자 제한, source=mine, saved=false |
| `SAVE_QUESTIONS` | saved=true |
| `OBSERVE {result}` | supported/refuted. 결과가 바뀌면 decision 초기화 |
| `DECIDE {key}` | 현재 관찰 결과의 선택지 중 하나일 때만 |
| `REACH {chapter}` | reached에 추가(중복 없음) |
| `RESET` | 초기 상태 |

`deriveCard(state)` → 5칸 `{key,label,value,status,flag?}`. status: `empty`(미도달·미입력) / `example`(도달했지만 방문자 행동 없음, 예시 값) / `mine`. 관찰이 refuted면 관찰 칸 flag=`refuted`. `filled` = mine 칸 수, 새싹 `grow = filled/5`.
`pathOrder(state)` → 7영역 순서. refuted면 `strategy`를 2번째로 이동(SPEC-005 nextConcept 규칙과 일치). `current`=customer, `next`=순서상 2번째.
저장: `localStorage['vencubator.landing.v2']`에 serialize. 읽기·쓰기 실패는 무시하고 기본 상태로 동작.

## 5. 상호작용 계약

| ID | 트리거 | 결과 | 접근성 |
|---|---|---|---|
| L2I-01 | 히어로 폼 제출 | SET_IDEA mine → L2M-04 → L2S-03으로 스크롤 | label 연결, 빈 입력 시 안내 문구(aria-live) |
| L2I-02 | 예시 칩 클릭 | SET_IDEA example+sample, 입력칸에 반영 | `aria-pressed` |
| L2I-03 | 퀴즈 선택지 | ANSWER, 즉시 피드백 | 선택지는 button, 피드백 aria-live |
| L2I-04 | 고객 입력 / 저장 버튼 | 질문 3개 즉시 갱신 / SAVE_QUESTIONS | 질문 목록 aria-live=polite |
| L2I-05 | 같았어요/달랐어요 | OBSERVE, 경로 재배치 | `aria-pressed` |
| L2I-06 | 결정 선택지 | DECIDE | `aria-pressed` |
| L2I-07 | 카드 칸 클릭 | 해당 챕터로 스크롤 + 챕터 제목 포커스 | 칸은 button |
| L2I-08 | 모바일 트레이 버튼 | 카드 펼치기/접기, Esc로 닫기 | `aria-expanded`, `aria-controls` |
| L2I-09 | 문장 복사하고 열기 / 처음부터 | 클립보드 복사(실패 시 선택 가능한 텍스트 표시) 후 링크 / RESET | 결과 안내 aria-live |
| L2I-10 | 모든 상태 변경 | 로컬 저장, 새로고침 후 복원 | — |

## 6. 모션 계약

스크롤은 **상태를 트리거**할 뿐, 스크롤 양에 비례해 요소를 변형하지 않는다. 모든 모션은 `prefers-reduced-motion: reduce`에서 즉시 최종 상태.

| ID | 대상 | 규칙 |
|---|---|---|
| L2M-01 | 챕터 진입 | IO(threshold .25) 1회 `.is-in`: opacity/translateY 16px, 600ms. 화면 중앙 챕터에 `.is-active`(카드 칸 강조 연동) |
| L2M-02 | 카드 칸 값 변경 | 글자 드러내기 clip-path 좌→우 520ms, 도장 찍힘 scale 1.3→1 |
| L2M-03 | 새싹 | `--grow` = filled/5, 줄기·잎·몸·반짝임 단계 변화 700ms |
| L2M-04 | 문장 → 카드 | 입력칸 위치에서 카드 1번 칸으로 복제 텍스트가 이동(WAAPI 700ms). 카드가 화면 밖이면 생략 |
| L2M-05 | 걱정 구름 | 챕터 활성 시 흩어진 태그가 중앙으로 모이며 사라지고 문장이 나타남 |
| L2M-06 | 경로 재배치 | FLIP 600ms |
| L2M-07 | 모바일 트레이 | 진척 막대 `scaleX(filled/5)`, 새 칸이 채워지면 트레이 1회 흔들림 |

## 7. 토큰·카피

- 토큰은 v1 계열(prototype 유래)을 쓰되 v2 전용 추가: `--paper-grid`, `--stamp-*`, `--serif`(Gowun Batang).
- 방문자 문장·고객은 `--serif`로 표시한다.
- 금지 표현(`CLAIM_BANNED`)은 v1과 동일. 예시 관찰에는 반드시 `예시` 표기. 입력 안내에 “서버로 전송되지 않고 이 브라우저에만 저장” 표기.
- LS-10 상태 행은 `docs/execution/STATE.json` stage status와 일치.

## 8. 수용 기준

| AC | 기준 | 검사 |
|---|---|---|
| AC-L2-01 | §3 표 ↔ `SECTIONS` id·type·순서 일치, L2I/L2M ID가 코드에 존재 | tests/spec.test.mjs |
| AC-L2-02 | 상태 모델: 기본값, 예시/내 것 구분, 오답이 막지 않음, refuted 시 경로 변경·결정 초기화, 5/5 완성, 길이 제한, 직렬화 복원·손상 데이터 무시 | tests/state.test.mjs |
| AC-L2-03 | 렌더: h1 1개, 모든 입력 label, 모든 button type, aria-live 영역, 카드 칸 5개 button, section aria-labelledby | tests/render.test.mjs |
| AC-L2-04 | 금지 표현 없음, 필수 고지(프로토타입·가상 예시·브라우저 저장), 예시 관찰 `예시` 표기 | tests/content.test.mjs |
| AC-L2-05 | landing.css hex 없음, 100svh 초과 높이·스크롤 고정 스테이지 없음 | tests/content.test.mjs |
| AC-L2-06 | 네트워크 전송 코드 없음(fetch/XMLHttpRequest/sendBeacon/WebSocket) | tests/content.test.mjs |
| AC-L2-07 | 상태 행 = STATE.json, 7영역 이름·색 = prototype STATS, 퀴즈 정답 = prototype LESSONS | tests/spec.test.mjs |
| AC-L2-08 | 1440·390 × 일반/모션감소: 입력→카드 반영, 퀴즈 오답→다른 문항→정답, 고객 입력→질문 반영, 달랐어요→경로 2번째=전략, 결정→5/5, 새로고침 복원, 트레이 열기/닫기, 가로 스크롤 0, JS 오류 0 | scripts/qa.mjs |
| AC-L2-09 | 단일 파일 빌드, dist에 로컬 모듈 참조 없음 | tests/build.test.mjs |

## 9. 결정 요청·검증 과제

| ID | 내용 | 상태 |
|---|---|---|
| DR-L2-01 | 카드를 프로토타입으로 인계(같은 도메인 배포 또는 URL 파라미터 수신)할지 | **결정(AUTH-009)**: 같은 출처 저장소로 아이디어 문장만 인계. SPEC-009 §5 |
| DR-L2-02 | v1/v2 중 기본 랜딩 선택 기준 | 미정. 권고: 5명 비교 과제(5초 이해, 1분 내 카드 3칸 이상, 신뢰 질문) |
| DR-L2-03 | 대기 명단·분석 도구 | 미정 (v1 DR-L01·L02와 동일) |

## r0.2 변경 (2026-09-25, AUTH-009, SPEC-009)

| 항목 | 변경 |
|---|---|
| 서비스 진입 | `SITE.links.prototype` = `../app/?from=v2`. 마무리 섹션의 “문장 복사하고 열기”를 **“이 문장으로 프로토타입 시작”**(같은 탭)으로 대체. 복사 메시지 영역 제거 |
| 인계 | 앱이 같은 출처의 `vencubator.landing.v2`에서 아이디어 문장만 읽어 새 프로젝트 입력칸을 채운다. 퀴즈·관찰·결정은 넘기지 않음(FAQ 문구 갱신) |
| 계측 (AC-L2-06 개정) | `src/track.mjs`로 `landing_view`, `idea_submit{source,len}`, `card_progress{filled}`, `cta_click{placement,filled}`만 **브라우저 버퍼에** 기록. 네트워크 전송 코드는 여전히 금지, 자유 텍스트 금지 |
| 공개 빌드 | `build({ public: true, outFile })` — 내부 문서·v1 링크 제외. `site/`가 `/v2/`로 사용 |
| 단독 서버 | `scripts/serve.mjs`가 `/app/`을 `prototype/`으로 연결 |
