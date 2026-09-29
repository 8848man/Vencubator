# SPEC-016 — Vencubator 랜딩 v3.1 “뿌리 · 다음 층”

Revision 0.1 · AUTH-027 · 2026-09-29 · 기반 SPEC-010 r0.2(v3) · 정책 [POLICY](POLICY.md) · 작업 [WORKORDER](WORKORDER.md)

v3(SPEC-010)를 복사한 `landing-v3.1/`의 계약이다. **v3와 같은 부분은 그대로 두고, 이 문서에서 ★로 표시한 행·절만 새로 만들거나 바꾼다.** SPEC-010과 `landing-v3/`는 수정하지 않는다(POLICY PV-1).

## 1. 범위

| 포함 | 제외 |
|---|---|
| v3 전체(이름표 → 지층 4개 → 뿌리 지도 → 위와 아래 → 앞으로 자랄 모습 → 앱에서 심기) + ★다음 층 안내, ★앱 CTA 인지·반응, ★대상 공감(문제 첫 줄·고민 선택·예시별 관찰 답·층별 한 줄) | 서버 전송, 실제 AI, 만든 사람 이야기(DR-LG-07), 퀴즈 문항·7영역 변경, A/B 순환 |

## 2. 파일 계약

v3와 같은 구조, 폴더 `landing-v3.1/`: `src/content.mjs` · `src/state.mjs` · `src/render.mjs` · `src/interact.mjs` · `src/track.mjs`(site/shared 복사본) · `src/tokens.css` · `src/landing.css` · `scripts/build.mjs` · `scripts/serve.mjs`(★4177) · `scripts/qa.mjs`(★4197) · `start.cmd` · `tests/`.

★식별자(POLICY PV-3):

| 항목 | v3 | v3.1 |
|---|---|---|
| `SITE.variant` | `v3` | `v31` |
| `SITE.storageKey` | `vencubator.landing.v3` | `vencubator.landing.v31` |
| `SITE.links.prototype` | `./app/?from=v3` | `./app/?from=v31` |
| 앱 진입(`prototype/entry.mjs`) | `LANDING_KEYS.v3` | `LANDING_KEYS.v31` 추가, `FROM`에 `v31` |
| 개발 생성기 표기 | `landing-v3/scripts/build.mjs · SPEC-010` | `landing-v3.1/scripts/build.mjs · SPEC-016` |

`index.html` head의 Google Search Console 확인 메타(AUTH-025)는 그대로 둔다.

## 3. 섹션 계약

| ID | type | 지층·깊이 | 기억될 장면 (DP-10) | 상호작용 |
|---|---|---|---|---|
| L3S-00 | `topbar` | — | 브랜드, 처음부터, ★앱 시작하기(진행 점) | L3I-07, ★L3I-12 |
| L3S-01 | `surface` | 지상 | ★문제 한 줄 + 지평선 위 새싹과 크게 꽂힌 **이름표 입력**, ★앱 보조 링크 | L3I-01, L3I-02, ★L3I-10, ★L3I-12 |
| L3S-02 | `gauge` | 전체 | 왼쪽 가장자리 **깊이 눈금**과 **뿌리 줄기** | — |
| L3S-03 | `layerLearn` | 0–15cm 겉흙 | ★“이런 적 있나요?” + 개념 한 줄(큰 세리프) + 퀴즈 | ★L3I-11, L3I-03, ★L3I-10, ★L3I-12 |
| L3S-04 | `layerAsk` | 15–40cm 속흙 | 내 고객 이름(손글씨) + 질문 3개 | L3I-04, ★L3I-10, ★L3I-12 |
| L3S-05 | `layerObserve` | 40–70cm 깊은 흙 | ★고른 예시에 맞는 들은 답 3개, **방향을 트는 뿌리** | L3I-05, ★L3I-10, ★L3I-12 |
| L3S-06 | `layerDecide` | 70–100cm 깊은 흙 | 결정 선택지 3개 | L3I-06, ★L3I-10, ★L3I-12 |
| L3S-07 | `rootMap` | 100cm 아래 | **일곱 갈래 뿌리 지도**, 지금·다음 갈래 | ★L3I-10 |
| L3S-08 | `aboveBelow` | 지표 단면 | 위(줄기=부캐) / 아래(뿌리=본캐) 분할 | — |
| L3S-09 | `honest` | 지상 | “지금은 씨앗 단계예요.” 씨앗·새싹·나무 3단계 + 자주 묻는 질문(v3와 동일) | — |
| L3S-10 | `harvest` | 지상 | 자란 새싹과 **내 이름표**, 앱에서 심기(★본문 문구 변경) | L3I-08 |
| L3S-11 | `footer` | — | 고지, ★앱 시작하기 링크 | — |

제약(v3와 같음): `<h1>` 1개, 지층 제목 옆 실제 뜻 병기, 테두리 있는 판은 조작 가능한 요소에만, sticky는 상단바만. ★추가: 한 층에 채워진 주 버튼(`.l3-btn` 채움형)은 “다음 층” 하나. 앱 링크는 텍스트 링크.

## 4. 상태 모델

v3 `state.mjs`와 같은 액션·파생 규칙. 차이:

- ★저장 키 `vencubator.landing.v31`.
- ★`state.pain: null | 'build' | 'praise' | 'interview' | 'late'`, 액션 `SET_PAIN { key }`(같은 값이면 상태 불변, 목록 밖 값 무시). `RESET` 시 null. 저장값에 `pain`이 없거나 잘못되면 null로 복원.
- ★`nextState(state)` (순수): 층별 다음 버튼 표시 여부.

  | 키 | true 조건 |
  |---|---|
  | `surface` | `idea.text` 있음 **그리고** 방문자가 이 세션에서 이름표를 심었거나 칩을 골랐음(`reached`에 `surface` 포함) |
  | `learn` | `learn.result` 있음 |
  | `ask` | `ask.saved` |
  | `observe` | `observe` 있음 |
  | `decide` | `decision` 있음 |
  | `roots` | 항상 true |

- ★`observationFor(state)` (순수): 관찰 답 3개. `idea.source === 'example'`이면 `OBSERVATION.quotesBySample[idea.sample]`, 아니면 `OBSERVATION.quotesGeneric`.
- ★`SET_IDEA`로 예시 칩을 고를 때 `REACH surface`도 함께 기록한다(칩 선택도 “지상 완료”).

## 5. 상호작용

| ID | 트리거 | 결과 |
|---|---|---|
| L3I-01 | 이름표 제출(“심기”) | SET_IDEA mine → 겉흙으로 스크롤, 이름표 흔들림 1회. ★첫 제출이면 앱 CTA 말풍선(L3M-09) |
| L3I-02 | 예시 칩 | SET_IDEA example+sample, 이름표에 반영. ★자동 스크롤 없음, 지상 “다음 층” 버튼 표시 |
| L3I-03 | 퀴즈 선택 | ANSWER, 즉시 피드백, 오답이면 다른 문항 |
| L3I-04 | 고객 입력 / 저장 | 질문 갱신 / SAVE_QUESTIONS. ★입력했는데 저장 전이면 저장 버튼 강조(`is-ready`) |
| L3I-05 | 같았어요/달랐어요 | OBSERVE. 달랐어요 → 뿌리 우회 + 전략 갈래 “다음” |
| L3I-06 | 결정 | DECIDE |
| L3I-07 | 처음부터 | RESET |
| L3I-08 | 앱에서 심기 | `./app/?from=v31` 같은 탭 이동. 앱은 `vencubator.landing.v31`의 **이름표 문장만** 가져온다 |
| L3I-09 | 모든 변경 | 로컬 저장, 새로고침 복원 |
| L3I-10 | ★“다음 층” 버튼 | `nextState`가 true인 층의 패널 아래 오른쪽에 표시. 클릭 → 다음 층으로 부드러운 스크롤 + 다음 층 `h2` 포커스. 이벤트 `next_click { layer }` |
| L3I-11 | ★“이런 적 있나요?” 선택 | SET_PAIN. 겉흙 도입 문장(`PAIN.options[i].line`)이 바뀜. 다시 누르면 다른 값으로 교체(해제 없음). 이벤트 `pain_select { pain }` |
| L3I-12 | ★앱 보조 링크(히어로·층·상단바·푸터) | `./app/?from=v31` 이동. 이벤트 `cta_click { placement, filled }`(placement = 가장 가까운 `data-spec` 소문자, 히어로 링크는 `hero`) |

### 5.1 ★다음 층 버튼 문구

| 층 | 문구 | 이동 |
|---|---|---|
| 지상 | 이 이름표로 내려가기 · 오늘 배울 것 ↓ | `#learn` |
| 겉흙 | 더 깊이 뿌리 뻗기 · 물어볼 질문 만들기 ↓ | `#ask` |
| 속흙 | 더 깊이 뿌리 뻗기 · 들은 답 해석하기 ↓ | `#observe` |
| 깊은 흙(관찰) | 더 깊이 뿌리 뻗기 · 다음 방향 정하기 ↓ | `#decide` |
| 깊은 흙(결정) | 뿌리 지도 보기 · 앞으로 자랄 영역 ↓ | `#roots` |
| 부엽토 | 다시 지상으로 · 앱에서 이어가기 ↓ | `#harvest` |

각 버튼 옆(좁은 화면은 아래)에 텍스트 링크 “여기까지 하고 앱에서 이어하기 →”(부엽토 층은 생략). 버튼이 처음 나타날 때 `aria-live="polite"` 영역에 “다음 층이 열렸어요” 1회.

## 6. 모션

| ID | 대상 | 규칙 |
|---|---|---|
| L3M-01 | 뿌리 줄기 | v3와 동일 |
| L3M-02 | 깊이 눈금 | v3와 동일 |
| L3M-03 | 층 뿌리 | v3와 동일 |
| L3M-04 | 우회 뿌리 | v3와 동일 |
| L3M-05 | 이름표 입력 | v3와 동일(★손글씨 문장은 새 예시로) |
| L3M-06 | 층 진입 | v3와 동일 |
| L3M-07 | 새싹 | v3와 동일 |
| L3M-08 | ★다음 층 버튼 “뿌리 뻗기” | 세션 중 false→true가 될 때만. 500ms 지연 후 ① 패널에서 버튼으로 짧은 연두 곁뿌리 `stroke-dashoffset` 1→0(400ms) ② 버튼 `clip-path: inset(0 100% 0 0)`→`inset(0)` + 12px 상승 + 불투명 0→1(600ms, `--ease`) ③ 화살표 ↓ 4px 내려갔다 오르기 2회. 새로고침 복원·모션 감소 시 즉시 최종 상태 |
| L3M-09 | ★앱 CTA 반응 | 층 완료(내가 채운 층 수 증가)마다 상단바 CTA에 빛 한 번 지나감(700ms, 반복 없음) + 진행 점 5개 중 채운 수 표시. 5개 모두 채우면 `m-spark` 모양 반짝임 1회 + 말풍선 “이 이름표로 앱에서 이어갈 수 있어요”(3초). 첫 “심기” 때 말풍선 “언제든 여기서 앱으로 옮겨 심을 수 있어요”(3초, 페이지당 1회). 말풍선은 클릭하면 닫힘, `aria-live="polite"`. 모션 감소 시 빛·반짝임 없이 진행 점과 말풍선만 |

`prefers-reduced-motion`: 뿌리·눈금은 최종 상태, 타이핑·흔들림·빛 없음, 진입 효과 없음.

## 7. 카피 (★변경·추가, 나머지는 v3와 같음)

### 7.1 첫 화면 L3S-01

- ★`hook`(h1 위, h1 아님): “아이디어는 있는데, 뭘 먼저 확인해야 할지 몰라 멈춰 있나요?”
- eyebrow·h1·lead: v3와 같음.
- ★`appLink`: “가입 없이 바로 앱에서 시작하기 →”(개인정보 문구 아래).
- ★`typing`: [“견적·정산을 한곳에서 끝내는 프리랜서 도구”, “리뷰 답글을 도와주는 1인 쇼핑몰 서비스”, “시간과 역할이 맞는 팀플 동료 찾기”]

### 7.2 예시 SAMPLES (★2개 교체, 순서 = 표 순서)

| key | label | idea | customer |
|---|---|---|---|
| `freelance` | 프리랜서 정산 도구 | 프리랜서 개발자의 견적·세금계산서·정산을 한곳에서 처리하는 도구 | 외주 3건 이상을 동시에 진행하는 1년 차 프리랜서 개발자 |
| `review` | 쇼핑몰 리뷰 답글 | 1인 쇼핑몰 사장님의 리뷰 답글 작성을 도와주는 서비스 | 하루 리뷰가 20개 넘게 달리는 1인 스마트스토어 운영자 |
| `teamup` | 팀플 동료 찾기 | 시간과 역할이 맞는 대학생 팀플 동료를 찾아주는 서비스 | 첫 전공 수업에서 팀원을 구하는 대학 신입생 |

★SLOTS 예시 기록(기본 예시 = `freelance`):

| key | example |
|---|---|
| idea | 견적·정산을 한곳에서 끝내는 프리랜서 도구 |
| learn | 좋다는 말보다 지난 행동을 묻는다 |
| ask | 프리랜서 3명에게 지난달 정산을 어떻게 했는지 |
| observe | 정산보다 다음 일감 찾기가 더 급했다 |
| decide | 대상을 좁혀 다시 묻기로 했다 |

### 7.3 ★관찰 답 OBSERVATION

`quotes`를 아래 두 필드로 바꾼다(label·setup·ask·choices·note는 v3와 같음).

| 대상 | 응답 1 | 응답 2 | 응답 3 |
|---|---|---|---|
| `freelance` | “지난달 정산 때 엑셀 세 개를 오가다 하루를 날렸어요.” | “불편하긴 한데, 세무사한테 한 번에 맡기니까 그럭저럭 돼요.” | “솔직히 정산보다 다음 일감 찾는 게 더 급해요.” |
| `review` | “어제도 밤 11시까지 답글 달았어요. 복붙하면 티가 나서요.” | “답글은 그냥 짧게 달고 말아요. 그걸로 문제는 없었어요.” | “답글보다 악성 리뷰 대응이 제일 스트레스예요.” |
| `teamup` | “지난달에도 겪었어요. 그때는 아는 사람한테 물어서 겨우 해결했죠.” | “불편하긴 한데, 지금 방법으로도 그럭저럭 돼요.” | “저는 사실 다른 게 더 급해요. 시간 맞추는 게 제일 힘들어요.” |
| 내 아이디어(`quotesGeneric`) | “지난달에도 이 문제를 겪었어요. 그때는 아는 사람한테 물어서 겨우 해결했죠.” | “불편하긴 한데, 지금 방법으로도 그럭저럭 돼요.” | “사실 저한테는 다른 게 더 급해요.” |

### 7.4 ★고민 선택 PAIN (겉흙 층 맨 위)

- title: “이런 적 있나요?” · hint: “가장 가까운 하나를 골라 주세요. 고르지 않아도 계속할 수 있어요.”
- 선택 전 도입 문장(`lineDefault`): v3 층 본문과 같음.

| key | 선택지 | 고른 뒤 도입 문장(line) |
|---|---|---|
| `build` | 주말마다 기능은 늘었는데, 쓸 사람이 있는지는 모르겠어요 | 만들기 전에 “누가, 언제 불편한지”부터 확인하는 방법이에요. |
| `praise` | 주변에선 다 좋다는데, 막상 쓰는 사람이 없어요 | 그 “좋아요”가 왜 믿기 어려운지부터 볼게요. |
| `interview` | 고객 인터뷰를 하라는데, 뭘 물어야 할지 모르겠어요 | 좋은 질문의 기준 하나만 알면, 질문은 금방 만들어져요. |
| `late` | 다 만들고 나서야 “이거 누가 쓰지?”가 떠올랐어요 | 다음 아이디어는 순서를 바꿔, 묻고 나서 만들어 봐요. |

### 7.5 ★층별 한 줄 `why` (층 본문 아래, 작은 글씨)

| 층 | why |
|---|---|
| 겉흙 | 주변에서 “좋다”고 했는데 아무도 쓰지 않았다면, 이 개념 하나로 설명돼요. |
| 속흙 | 인터뷰가 막막한 건 용기가 없어서가 아니라, 물어볼 질문이 없어서예요. |
| 깊은 흙(관찰) | 예상과 다른 답은 실패가 아니라, 헛수고를 줄여 주는 신호예요. |
| 깊은 흙(결정) | 틀려도 괜찮아요. 방향을 바꾼 기록도 뿌리로 남아요. |

### 7.6 ★앱 CTA·하베스트

- 상단바 CTA: “앱 시작하기”, 진행 점 `aria-label` “내가 채운 층 {n}/5”. 480px 이하에서 진행 점 숨김.
- 푸터 링크: “앱 시작하기”.
- 하베스트 body: “같은 이름표로 앱에서 시작해요. 첫 프로젝트 입력칸에 이 문장이 미리 채워져요. 앱에서는 가상 예시가 아니라 내 진짜 고객과 한 바퀴를 돌기 때문에, 퀴즈·관찰·결정은 거기서 새로 기록해요.”
- 하베스트 cta·again·titles: v3와 같음.

## 8. 시각 규칙 (★)

- 상단바 CTA: 글자 16px, 패딩 10px 18px, 새싹 아이콘(기존 `mark()` 재사용 가능). 밝은 구간 = 녹색 배경/흰 글자, `.l3-top.is-dark` = 연두(`--root`) 배경/짙은 글자(`--ink` 또는 `--humus`). CTA 배경과 상단바 배경 대비 ≥ 3:1, 글자 대비 ≥ 4.5:1 (두 구간 모두).
- 다음 층 버튼: 채움형 `.l3-btn`, 짙은 흙 층에서는 연두 배경/짙은 글자. 앱 텍스트 링크는 밑줄 텍스트.
- 고민 선택지: 테두리 있는 칩(조작 가능), 선택 시 `aria-pressed="true"`.
- 새 색은 `tokens.css`에만(AC-L3-05 규칙 유지).

## 9. 계측 (★)

`site/shared/track.mjs`(원본)에 추가하고 모든 복사본(`landing/src`, `landing-v2/src`, `landing-v3/src`, `landing-v3.1/src`, `prototype`)을 같은 내용으로 맞춘다.

| 항목 | 추가 |
|---|---|
| `ANALYTICS_FIELDS` | `next_click: ['layer']`, `pain_select: ['pain']` |
| `ANALYTICS_ENUMS` | `from`에 `v31`, `layer: ['surface','learn','ask','observe','decide','roots']`, `pain: ['build','praise','interview','late']` |
| `VARIANTS` | `v31` 추가 |
| `page` 값 | `app`·`v31`은 그대로, 그 밖은 `v3`(v3 결과 불변) |

자유 텍스트 금지 규칙 유지.

## 10. 수용 기준

v3의 AC-L3-01~10은 `landing-v3.1/tests`에서 SPEC-016 기준으로 그대로 통과해야 한다(AC-L3-01의 ID 개수는 21로 갱신). 추가:

| AC | 기준 | 검사 |
|---|---|---|
| AC-L31-01 | 식별자: variant `v31`, 저장 키, `from=v31`, 앱 `readEntry('?from=v31')`가 v31 저장소의 문장만 읽고 v3와 섞지 않음 | landing-v3.1/tests/spec.test.mjs, prototype/tests/entry.test.mjs |
| AC-L31-02 | `nextState` 표(§4) 전 조건, `SET_PAIN`·`RESET`·잘못된 저장값 복원, `observationFor` 예시별·내 아이디어 | tests/state.test.mjs |
| AC-L31-03 | 렌더: 다음 층 버튼 6개(`type="button"`, 문구 = §5.1, 초기 `hidden`), 앱 보조 링크(히어로 1 + 층 5), 고민 선택지 4개(`aria-pressed`), `hook` 문장, 층별 `why` 4개, aria-live 영역 | tests/render.test.mjs |
| AC-L31-04 | 카피: 금지 표현 없음, “기록이 모두”·“전부 옮겨” 같은 과장 인계 표현 없음, 예시 3개 모두 `quotesBySample` 존재 | tests/content.test.mjs |
| AC-L31-05 | CSS: 상단바 CTA 대비(밝은·어두운 구간) ≥ 3:1, 무한 반복 애니메이션(`infinite`) 없음, hex는 tokens에만 | tests/content.test.mjs(토큰 값으로 대비 계산) |
| AC-L31-06 | 계측: 새 이벤트·enum이 원본과 모든 복사본에 동일, 자유 텍스트 없음 | site/tests/track.test.mjs, analytics.test.mjs |
| AC-L31-07 | 브라우저(qa.mjs): 칩 → 지상 다음 버튼 표시·클릭 시 겉흙 도달 / 퀴즈 정답 → 버튼 / 저장 → 버튼 / 관찰 → 버튼, 관찰 변경 시 결정 버튼 숨김 / 결정 → 버튼 / 새로고침 후 버튼 유지 / 앱 CTA 진행 점 증가 / 고민 선택 → 도입 문장 변경 / 예시 칩을 바꾸면 관찰 답 변경, 내 문장이면 공통 답 / 1440·390·모션 감소 / 가로 스크롤 0 / JS 오류 0 | landing-v3.1/scripts/qa.mjs |
| AC-L31-08 | v3 불변: `landing-v3/` 변경 파일은 `src/track.mjs`·`dist/index.html`뿐, `landing-v3` 테스트 통과 | `git diff --stat origin/main -- landing-v3` |
| AC-L31-09 | 사이트 전환(단계 5): `site/dist/index.html` = v3.1 공개 빌드, 사이트 테스트 통과, `/app/?from=v31` 진입 시 문장 인계 | site/tests, site/scripts/qa.mjs |
