# SPEC-006 — Vencubator 랜딩 페이지

Revision 0.2 · Implemented (L01-W01, L03-W01) · AUTH-005, AUTH-009 · 2026-09-25

사용자 요청(2026-09-24): “기존 벤큐베이터의 UI/UX, 그리고 기획을 분석하여 랜딩페이지를 설계… 컬러는 벤큐베이터 컨셉, TTJ 페이지의 섹션 애니메이션·설계 기믹을 응용… 루트에 landing 폴더… SDD 기반으로 추후 AI 기반 개선이 가능하도록 명세와 코드.”
설계 근거는 [ANALYSIS](ANALYSIS.md), 개선 절차는 [AI-IMPROVEMENT](AI-IMPROVEMENT.md), 검증은 [VAL-L01](VAL-L01.md).

## 1. 범위

| 포함 | 제외 (별도 승인 필요) |
|---|---|
| 정적 단일 페이지, 11개 섹션, 스크롤 모션, 반응형, 모션 감소, 단일 파일 빌드 | 실제 가입·대기 명단 저장, 분석 도구·추적 픽셀, 외부 배포/도메인, 실제 후기·수치, 결제 |

권위: 제품 의미·금지 표현은 PRODUCT-BRIEF·SPEC-002·SPEC-005가 우선한다. 이 문서는 **랜딩의 섹션·모션·토큰·카피 규칙**의 권위다.

## 2. 파일 계약

| 파일 | 책임 | 다른 파일에 두지 않을 것 |
|---|---|---|
| `src/content.mjs` | 모든 카피·링크·섹션 순서·섹션 데이터 (`SITE`, `SECTIONS`) | 마크업, 스타일 |
| `src/render.mjs` | 섹션 `type` → HTML 문자열 (순수 함수, DOM 없음) | 카피 문자열 하드코딩 (라벨 제외 금지) |
| `src/motion.mjs` | 순수 모션 수식(`clamp`, `smooth`, `*Frame`) + `bindMotion(window)` DOM 바인딩 | 카피 |
| `src/main.mjs` | 브라우저 진입점: 렌더 → 모션 바인딩 | 로직 |
| `src/tokens.css` | 디자인 토큰(§5) | 컴포넌트 규칙 |
| `src/landing.css` | 컴포넌트·섹션 스타일, 토큰만 참조 | 원시 색상 값(토큰 외) |
| `index.html` | 쉘, `<noscript>` 요약 | 섹션 마크업 |
| `scripts/build.mjs` | 사전 렌더 + CSS/JS 인라인 → `dist/index.html` 단일 파일 | — |
| `scripts/serve.mjs` | 로컬 서버 (기본 4174) | — |
| `tests/*.test.mjs` | §8 AC 자동 검사 | — |

## 3. 섹션 계약

`SECTIONS` 배열 순서가 페이지 순서다. 각 항목은 `{id, type, nav?, ...data}`. `id`는 아래 표와 1:1이며 재사용하지 않는다.

| ID | type | 목적 | 핵심 콘텐츠 | 모션 | 전환 요소 |
|---|---|---|---|---|---|
| LS-00 | `nav` | 위치 파악·이동 | 브랜드, 챕터 링크(`nav:true` 섹션), `NN / NN`, 진행 막대 | LM-01 | 헤더 CTA 1 |
| LS-01 | `hero` | 첫 3초 안에 제품 약속 전달 | h1 2행 “당신의 아이디어에, / 다음 한 걸음.”, 리드, 앱 목업+새싹 | LM-02 | Primary+Secondary |
| LS-02 | `typeStory` | 스크롤=성장 체감 | 3문장, `01/03`, 자라는 새싹 | LM-03 | 없음 |
| LS-03 | `proof` | 원칙으로 신뢰 | 5개 원칙 | LM-04 | 없음 |
| LS-04 | `route` | 학습 루프 한눈에 | LEARN·PRACTICE·APPLY·ACT | LM-04 | 단계→LS-07 앵커 |
| LS-05 | `areas` | 7개 영역 소개 | 앱과 같은 이름·색·질문 | LM-05 | 없음 |
| LS-06 | `bridge` | ‘하나만 안내’ 원칙 | 7 → 1 | LM-06 | 없음 |
| LS-07 | `story` | 세션 흐름 체험 | 5프레임 UI 목업 (SPEC-005 순서) | LM-07 | 없음 |
| LS-08 | `growth` | 성장 모델 이해 | 부캐·본캐·반박도 성장 + 주의문 | LM-04 | 없음 |
| LS-09 | `status` | 정직한 진행 공개 | S1·S2·S3 실제 상태 | LM-08 | 없음 |
| LS-10 | `faq` | 오해 방지 | 4~6개 질문 `<details>` | LM-04 | 없음 |
| LS-11 | `final` | 마지막 전환 | 한 줄 약속, 새싹 | LM-04 | Primary |
| LS-12 | `stickyCta` | 스크롤 중 전환 유지 | 짧은 요약+CTA | LM-09 | Primary |
| LS-13 | `footer` | 출처·고지 | 프로토타입 고지, 문서 링크 | — | — |

제약: 페이지당 `<h1>` 1개(LS-01). 모든 섹션 `aria-labelledby`. 한 화면 Primary CTA는 1개(SPEC-005 원칙 계승). 모든 CTA href는 `SITE.links`에서만 가져온다.

## 4. 모션 계약

공통: 스크롤 이벤트는 passive + rAF 1회 스로틀. 진행률 `p ∈ [0,1]`, 이징 `smooth(v)=v²(3−2v)`. 모든 수식은 `motion.mjs`의 순수 함수로 두고 단위 테스트한다. `prefers-reduced-motion: reduce`이면 LM-02~LM-09의 스크롤 연동을 끄고 모든 콘텐츠를 최종 상태로 즉시 표시하며, sticky 스테이지는 일반 흐름으로 전개된다(`html.is-reduced`).

| ID | 대상 | 입력 | 출력(CSS 변수/클래스) | 규칙 |
|---|---|---|---|---|
| LM-01 | 진행 막대·챕터 | 문서 스크롤 비율, marker=scrollY+160 | `--page-progress`, `aria-current`, `NN` | 모바일에서 활성 링크 가로 스크롤 중앙 정렬 |
| LM-02 | Hero | p=(scrollY−top)/(h×0.62) | 1행 scale 1→0.8·흐려짐, 2행 0.94→1.1, 보조 페이드, 목업 scale↑ radius↓ | 보조 요소 불투명도 <0.05면 pointer-events none |
| LM-03 | Type story | 섹션 내 p (sticky 스테이지 100svh, 섹션 320svh) | 문장 i의 opacity/scale/y, `--grow`(새싹), 인덱스 01~03 | 구간: [.03,.32] [.18,.73] [.61,.95] 교차. 새싹 `--grow=smooth(p)` |
| LM-04 | Reveal | IntersectionObserver threshold .1, rootMargin 0 0 -40px | `.is-visible` 1회, 자식 `--i`×70ms stagger | IO 없으면 즉시 표시 |
| LM-05 | 영역 카드 | IO 개별 | `.is-visible`, 호버 -6px | 카드 색 = 영역 색 토큰 |
| LM-06 | Bridge | 섹션 내 p (230svh) | from scale 1→.82, opacity 1→.58 / to arrive=smooth((p−.08)/.7) scale .74→1 / 화살표 −12°→0 | — |
| LM-07 | Story | 섹션 내 p (n×100svh) | position=p(n−1), 전환점 .56, 현재 프레임 `.is-active`, 프레임마다 local 0~.28 정지 구간, 제목 blur 12→0(다음 .4~.76), 상세 지연(다음 .6~.84). 패널: 이전 1−smooth((l−.4)/.36), 다음 smooth((l−.34)/.4) | 점·`NN / 05`, 비활성 프레임 `aria-hidden`. 두 패널 동시 노출 구간 최소화 |
| LM-08 | Status 행 | 행 중심과 0.54vh 거리 | focus=1−|d|/(.58vh), `--focus`, 최대 focus 행 `.is-current`(>.28) | — |
| LM-09 | Sticky CTA | hero 하단 통과 && final top > .78vh && 고정 스테이지(LS-02·06·07) 밖 | `.is-visible` | 보이지 않을 때 `inert`. 스테이지 판정 구간 = [top−.5vh, bottom−.5vh] |

시그니처: 새싹 SVG는 `--grow`(0~1)로 줄기 `scaleY`, 잎 `scale`, 반짝임 opacity가 변한다. 히어로/마지막 CTA에서는 `--grow:1`, `bob` 부유.

## 5. 디자인 토큰 (`tokens.css`)

| 토큰 | 값 | 출처 |
|---|---|---|
| `--ink` | `#243b32` | prototype `--ink` |
| `--muted` | `#6f7c73` | prototype |
| `--paper` / `--bg` / `--soft` | `#ffffff` / `#f8f9f5` / `#eef3eb` | prototype |
| `--line` | `#e2e7de` | prototype |
| `--green` / `--green-deep` | `#2e5e47` / `#234c38` | prototype |
| `--lime` / `--sprout` / `--leaf` | `#d9ebbd` / `#8faa69` / `#b0c98a` | prototype, mascot |
| `--warm` / `--spark` | `#ca8f63` / `#d0b878` | prototype, mascot |
| `--forest` / `--forest-2` | `#12211a` / `#1b2e24` | 신규: TTJ 검정 스테이지의 녹색 치환 |
| `--on-forest` | `#eef3e6` | 신규 |
| `--c-customer` … `--c-strategy` | content.mjs STATS 색 | prototype |
| `--font` | Pretendard Variable → Inter → 시스템 | |
| `--mono` | JetBrains Mono | TTJ 인덱스 표기 기법 |
| `--ease` | `cubic-bezier(.2,.65,.2,1)` | TTJ reveal 곡선 |

원시 색 값은 `tokens.css`에만 둔다(테스트 AC-LP07).

## 6. 카피 규칙 (Claim guard)

- 해요체, 문장 짧게, 제목 최대 2행. 대상: 아이디어는 있지만 검증 경험이 적은 1인 빌더.
- **금지**(테스트로 검사, `CLAIM_BANNED`): `성공률`, `PMF`, `% 완성`, `보장`, `AI가 결정`, `AI가 대신`, `검증 완료`, `매출 보장`, `수익 보장`, `1위`, `누적 사용자`.
- 필수 고지: 프로토타입 단계, 실제 AI 대화·고객 관찰은 가상 예시(푸터·FAQ).
- 후기·수치·로고는 실제 근거가 생기기 전 추가하지 않는다.
- LS-09 상태 문구는 `docs/execution/STATE.json`의 stage status와 일치해야 한다(AC-LP08).

## 7. 개선 백로그 (AI 개선 후보)

| ID | 후보 | 선행 조건 |
|---|---|---|
| LI-01 | 실제 앱 스크린샷으로 목업 교체 | 스크린샷 확정 |
| LI-02 | 대기 명단 폼 | DR-L01 결정, 개인정보 고지 |
| LI-03 | 실제 연구 결과 인용 섹션 | P04-W02 연구 완료, 동의 |
| LI-04 | A/B 카피 실험 | 분석 도구 결정(DR-L02) |
| LI-05 | 다크 모드 | 토큰 이중화 |
| LI-06 | 영문 버전 | `content.en.mjs` 추가, 렌더 불변 |

## 8. 수용 기준

| AC | 기준 | 검사 |
|---|---|---|
| AC-LP01 | `SECTIONS`의 id·type이 §3 표와 1:1, 순서 일치 | tests/spec.test.mjs |
| AC-LP02 | 렌더 결과 h1 1개, 모든 section aria-labelledby 대상 존재, img/svg 대체 텍스트 | tests/render.test.mjs |
| AC-LP03 | 모션 수식 경계(0,1), 단조성, 구간 교차, story 프레임 인덱스 | tests/motion.test.mjs |
| AC-LP04 | 카피 금지 표현 없음, 필수 고지 존재 | tests/content.test.mjs |
| AC-LP05 | 모든 CTA href가 `SITE.links` 값 | tests/render.test.mjs |
| AC-LP06 | 데스크톱 1440·모바일 390에서 가로 스크롤 없음, sticky 스테이지 동작, reduced-motion에서 전 콘텐츠 표시 | scripts/qa.mjs (Playwright) + VAL-L01 |
| AC-LP07 | `landing.css`에 hex 색상 리터럴 없음 | tests/content.test.mjs |
| AC-LP08 | LS-09 단계 상태가 STATE.json과 일치 | tests/spec.test.mjs |
| AC-LP09 | `node scripts/build.mjs`가 외부 모듈 없이 단일 `dist/index.html` 생성 | tests/build.test.mjs |

## 9. Decision Requests

| ID | 질문 | 권고 | 상태 |
|---|---|---|---|
| DR-L01 | 대기 명단을 받을 것인가, 어디에 저장하나 | 개인정보 고지와 저장소 결정 후 LI-02 | 미정 |
| DR-L02 | 분석 도구(예: Amplitude) 부착 | 이벤트 명세를 먼저 SPEC-006 r0.2에 | 미정 |
| DR-L03 | 공개 도메인·배포 | S1 게이트 이후 | 미정 |

## r0.2 변경 (2026-09-25, AUTH-009, SPEC-009)

| 항목 | 변경 |
|---|---|
| 서비스 진입 | `SITE.links.prototype` = `../app/?from=v1` (같은 사이트의 `/app/`). 같은 탭 이동 |
| 공개 빌드 | `build({ public: true, outFile })` — 내부 문서 링크(`brief·roadmap·spec`) 제외, 링크 보정 없음. `site/`가 `/v1/`로 사용 |
| 계측 | `src/track.mjs`(site/shared 복사본), `src/analytics.mjs`: `landing_view`, `cta_click{placement}`. 브라우저 버퍼만, 전송 없음 |
| 단독 서버 | `scripts/serve.mjs`가 `/app/`을 `prototype/`으로 연결 |
| 테스트 | AC-LP05: 진입 링크가 상대 경로(`../app/?from=v1`)이며 dist에서 보정됨 |
