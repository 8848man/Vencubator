# 랜딩 v3.2 작업 지시서 + GPT 프롬프트

기준일 2026-09-30 · 정책 [POLICY](POLICY.md) · 계약 [SPEC-017](SPEC-017-landing-v3.2.md) · W `L06-W01` · 승인 AUTH-028(아래 문안) · 브랜치 `w/L06-W01-landing-v32`

## 1. 승인 문안 (APPROVALS에 그대로 추가)

> **AUTH-028** (2026-09-30, 사용자) — 랜딩 v3.2 메시지 개정. v3.1 사용자 피드백 “누구를 위해, 어떤 가치를 제공하는지 모호하다”에 대응해, `landing-v3.1/`을 보존한 채 `landing-v3.2/`에서 첫 화면 카피 위계(대상·가치·결과물)와 층·버튼 문구를 평이한 말 우선으로 바꾼다. 범위는 SPEC-017 r0.1. 상호작용·상태·모션·새 이벤트 변경 없음. 운영 루트 전환은 5초 테스트 통과 후 사용자 main 병합으로.

## 2. 단계

### 단계 1 — 기반 (화면은 v3.1과 동일)

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | 시작 전 준비(§4 프롬프트 1절) 후 gitflow start `--carry`, work-item에 이 표 전체를 체크리스트로, STATE에 L06·L06-W01 active, APPROVALS에 AUTH-028 | docs/execution/*, docs/process/APPROVALS.md | verify-checkpoint | docs + cp |
| 2 | `landing-v3.2/docs/`에 이미 있는 POLICY·SPEC-017·WORKORDER를 그대로 커밋(내용 수정 없음) | landing-v3.2/docs | — | docs |
| 3 | `landing-v3.1/`의 index.html·src·scripts·tests·start.cmd·README를 `landing-v3.2/`로 복사(dist·qa-shots·docs 제외, 이미 있는 `landing-v3.2/docs/`는 덮어쓰지 않음) | landing-v3.2/* | — | chore |
| 4 | 식별자 교체(SPEC-017 §2): v32, 저장 키, `from=v32`, 4178/4198, 생성기 표기. 테스트가 SPEC-017을 읽게, L3I-13은 “예정 ID”로 임시 허용 | src/content.mjs, scripts/*, tests/* | node --test landing-v3.2/tests | feat + test |
| 5 | `prototype/entry.mjs`에 `LANDING_KEYS.v32`·FROM `v32` + 테스트(AC-L32-01) | prototype/entry.mjs, prototype/tests/entry.test.mjs | prototype 테스트 | feat + test |
| 6 | 계측(SPEC-017 §9): `site/shared/track.mjs` 원본에 `from: v32`, `VARIANTS v32`, page 매핑 `['app','v31','v32']` → 모든 복사본 동기화(landing, landing-v2, landing-v3, landing-v3.1, landing-v3.2, prototype) + 테스트 | site/shared/track.mjs, */src/track.mjs, site/tests/* | site·각 랜딩 테스트 | feat + test |
| 7 | gitflow.config.json 필수 검사에 `landing-v3.2/tests/*.test.mjs` 추가 | scripts/gitflow.config.json | scripts 테스트 | chore |
| 8 | dist 빌드, 단계 CP | landing-v3.2/dist, v3·v3.1 dist 재빌드 | 전체 테스트 | chore + cp |

### 단계 2 — 메시지 개정 (SPEC-017 §3·§7·§8)

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | content: `HEADLINES`(a/b/c), `SITE.headline='a'`, `SITE.title·description`, surface(`hook` 삭제, eyebrow·badge·tagLabel·submit·empty·samplesLabel·down), `gets` 3개, 층 title 5개·observe/roots body, `NEXT`·`NEXT_COPY`·`CTA_COPY`, aboveBelow title·tag, honest S3 name, harvest 전부, `METAPHOR_TERMS` | src/content.mjs | content.test | feat |
| 2 | render: 첫 화면 순서 eyebrow(+badge) → h1(`HEADLINES[SITE.headline]`) → lead → `ol.l3-gets` → 입력…, `.l3-hook` 제거, 층 보조 라벨을 제목 앞 작은 라벨로 | src/render.mjs | render.test | feat + test |
| 3 | CSS: eyebrow 15–16px, `gets`(테두리 없음, 층 색 점, ≤480px에서 d 숨김), 층 보조 라벨 작게·대비 ≥ 4.5:1 | src/landing.css, src/tokens.css | content.test(hex·sticky) | feat |
| 4 | 테스트: AC-L32-02(§7 표 일치), AC-L32-03(은유어 금지 구역), AC-L32-04(렌더 구조), AC-L32-06(금지 표현·수치). v3.1 테스트 중 hook·옛 문구 기대값을 SPEC-017로 갱신 | tests/content.test.mjs, render.test.mjs, spec.test.mjs | node --test | test |
| 5 | dist, 단계 CP | — | 전체 테스트 | chore + cp |

완료 조건: 첫 화면만 보고 “사이드 프로젝트·1인 창업 준비자용 / 만들기 전에 확인할 것·질문 3개·다음 한 걸음을 얻는다”가 읽힌다. 첫 읽기 자리에 은유어 0개.

### 단계 3 — 후보 미리보기 `?h=` (L3I-13)

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | interact: 로드 시 `?h` 값이 `HEADLINES`에 있고 기본값과 다르면 h1 두 줄·lead를 `textContent`로 교체. 계측 없음 | src/interact.mjs | qa | feat |
| 2 | spec 테스트에서 L3I-13 “예정 ID” 해제 | tests/spec.test.mjs | node --test | test |
| 3 | dist, 단계 CP | — | 전체 테스트 | chore + cp |

### 단계 4 — 검증과 5초 테스트 자료

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | `landing-v3.2/scripts/qa.mjs`: AC-L32-05·08 시나리오(1440·390·모션 감소·가로 스크롤 0·JS 오류 0·앱 인계 `from=v32`) | scripts/qa.mjs | qa 실행 | test |
| 2 | `--shots`: 390×844 첫 화면을 `?h=a`, `?h=b`, `?h=c`와 v3.1 현재안으로 각각 캡처(`qa-shots/5sec-v31.png`, `5sec-a.png`, `5sec-b.png`, `5sec-c.png`) — 사용자가 휴대폰으로 5초 테스트에 쓰는 자료 | scripts/qa.mjs, qa-shots/ | 파일 4개 존재 | test |
| 3 | `landing-v3.2/docs/VAL-L32.md`: 검사 결과·캡처 경로·5초 테스트 진행법(POLICY §6.1)과 결과 기록 칸(비움) | docs/VAL-L32.md | — | docs |
| 4 | 단계 CP | — | — | cp |

### 단계 5 — 사이트 전환 (병합 = 운영 반영)

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | `site/scripts/build.mjs`가 루트 index.html을 v3.2 공개 빌드로. Search Console 메타·sitemap·robots·_headers 유지 | site/scripts/build.mjs, site/* | site 테스트 | feat |
| 2 | `site/scripts/qa.mjs`의 v31 기대값을 v32로(첫 화면 → 앱 → `project_create(from=v32, imported=true)`) | site/scripts/qa.mjs | site qa | test |
| 3 | 문서: site/DEPLOY.md·README의 운영 랜딩 표기 v3.2. STATE에서 L06 완료 처리 | 문서 | verify-checkpoint | docs |
| 4 | 마지막 CP → gitflow finish --pr | — | 전체 검사 | cp |

## 3. PR 본문 틀

```
## 무엇을
랜딩 v3.2 — 메시지 개정(SPEC-017 r0.1, AUTH-028). 첫 화면을 “누가 / 무엇을 얻나” 평이한 말로, 층·버튼 문구를 실제 뜻 먼저로. 상호작용·모션·이벤트 변화 없음.

## 왜
v3.1 사용자 피드백: “누구를 위해, 어떤 가치를 제공하는지 모호하다.” 원인 M1~M6(POLICY §1).

## 병합하면
운영 루트(/)가 v3.2로 바뀐다. landing-v3.1/은 보존(변경: track.mjs 동기화, dist 재빌드뿐).

## 병합 전 사용자 확인
- [ ] 5초 테스트 5~8명(landing-v3.2/qa-shots/5sec-*.png), 통과 기준 5명 중 4명 (POLICY §6.1). 기본안 a 미달 시 SITE.headline만 바꿔 재빌드
- [ ] GA4에서 v3.1 기간(2026-09-29~) 기준선 기록: landing_view, idea_submit, cta_click(hero), app_open(v31), project_create(v31)
- [ ] project_create가 GA4에 실제로 들어오는지 확인(2026-09-29 기준 0건)

## 검사
(명령별 통과/실패 수)

## SPEC-017과 다르게 한 점
(없으면 “없음”)
```

## 4. GPT 프롬프트 (저장소를 연 GPT에 이 블록 하나만)

```text
너는 Vencubator 저장소에서 공개 랜딩 v3.1을 그대로 두고, 새 폴더 landing-v3.2/에 메시지 개정판 v3.2를 만드는 작업을 처음부터 끝까지 한 번에 수행한다. 이 메시지가 구현 지시이며 승인 근거는 AUTH-028이다. 단계 사이에 내 확인을 기다리지 말고 끝까지 진행해라. 계속할 수 없는 문제(아래 “멈출 때”)가 생길 때만 멈춘다.

## 0. 먼저 읽을 것 (이 순서로)
1. AGENTS.md — 작업 규칙의 권위. “매 작업 시작” 절차대로 README.md, docs/context/CURRENT.md, docs/execution/STATE.json, 마지막 checkpoint, docs/process/APPROVALS.md, docs/execution/CHECKPOINT-PROTOCOL.md 확인.
2. landing-v3.2/docs/POLICY.md — 메시지 원칙 MP-1~6, 불변 규칙 PM-1~5, 결정 기본값 DR-LM-01~05.
3. landing-v3.2/docs/SPEC-017-landing-v3.2.md — 계약. ★ 표시가 v3.1과 다른 부분. 화면 문장은 전부 §7에 확정돼 있다.
4. landing-v3.2/docs/WORKORDER.md — 단계 1~5 체크리스트, AUTH-028 문안, PR 본문 틀.
5. 기준 코드: landing-v3.1/ (src, scripts, tests), landing-v3.1/docs의 SPEC-016, prototype/entry.mjs, site/shared/track.mjs와 복사본, site/scripts/build.mjs·qa.mjs, scripts/gitflow.config.json.

## 1. 작업 방식
- 작업 루트는 C:\Users\LG\Documents\ChatGPT\Vencubator 이다. 명세 문서 3개는 이미 landing-v3.2/docs/에 있고 아직 git에 추적되지 않은 상태다.
- 시작 전 준비: git status --porcelain 을 확인한다. "Claude outputs/" 아래의 추적되지 않은 파일(이번 작업과 무관한 산출물)은 커밋하지 말고, .git/info/exclude에 한 줄 "Claude outputs/"를 추가해 로컬에서만 제외한다(.gitignore는 건드리지 않는다). 그 밖에 커밋되지 않은 변경이 있으면 멈추고 보고한다.
- W 하나 L06-W01, 브랜치 하나, PR 하나. 파일을 바꾸기 전 첫 명령(landing-v3.2/docs를 이번 작업에 포함하므로 --carry):
  node scripts/gitflow.mjs start L06-W01 landing-v32 --carry --title "랜딩 v3.2: 평이한 첫 화면(메시지 개정)"
- start는 현재 브랜치(w/L05-W01-landing-v31)가 main에 병합되지 않았으면 그 위에 쌓는다. 어느 쪽이든 새 브랜치에 landing-v3.1/이 있는지 확인하고, 없으면 멈추고 보고한다.
- 곧바로 docs/execution/work-items/L06-W01.md에 WORKORDER 단계 1~5 표를 하나의 “실행 계획·체크리스트”로 옮기고 docs 커밋 + 시작 CP.
- 커밋은 의미 단위, 명시한 파일만:
  node scripts/gitflow.mjs commit <spec|feat|fix|test|docs|chore|cp> "<요약>" <파일…> --spec "SPEC-017 r0.1" --auth AUTH-028 --validation "<실행한 검사와 결과>"
- 각 단계 끝마다: 테스트 통과 → 체크리스트 갱신 → CP(“체크리스트 k/N”) → cp 커밋. 중단되면 첫 미완료 항목부터 이어간다.
- 단계 5가 끝난 뒤 한 번만 gitflow finish --pr. push가 안 되면 handoff를 만들고 위치를 알려라.
- main 병합·운영 배포는 하지 않는다.

## 2. 단계 (세부는 WORKORDER가 권위)
단계 1 — 기반(화면 변화 없음): STATE·APPROVALS(AUTH-028 문안 그대로), landing-v3.2/docs/의 문서 3개를 그대로 커밋, landing-v3.1 복사(dist·qa-shots·docs 제외), 식별자 교체(SPEC-017 §2), prototype/entry.mjs v32 + 테스트, track.mjs 원본 수정 후 모든 복사본 동기화 + 테스트, gitflow 필수 검사 추가. 이 단계 끝에 v3.2 화면은 v3.1과 같아야 한다.
단계 2 — 메시지 개정: SPEC-017 §3·§7·§8. content → render → CSS → 테스트(AC-L32-02·03·04·06).
단계 3 — 후보 미리보기 ?h=a|b|c (§5 L3I-13), textContent로만, 계측 없음.
단계 4 — 검증: qa.mjs에 AC-L32-05·08, --shots로 390×844 첫 화면 4장(v3.1 현재안은 landing-v3.1/dist/index.html을 같은 방식으로 띄워서, a, b, c)을 qa-shots/5sec-*.png로(qa-shots는 .gitignore 대상이므로 커밋하지 않고 경로만 보고), docs/VAL-L32.md 기록.
단계 5 — 사이트 전환: site 루트를 v3.2 공개 빌드로, site qa 기대값 v32, 문서·STATE 갱신.

## 3. 반드시 지킬 것
- landing-v3.1/은 src/track.mjs 동기화와 dist/index.html 재빌드 말고 절대 수정하지 않는다(PM-1). 매 단계 끝에 node --test landing-v3.1/tests/*.test.mjs 통과, 마지막에 git diff --stat origin/main -- landing-v3.1 가 두 파일뿐인지 확인.
- 이번 작업은 메시지 개정만이다(PM-5). 상호작용·상태 모델·모션·LESSON·AREAS·SAMPLES·관찰 답·PAIN은 바꾸지 않는다. 새 이벤트를 만들지 않는다.
- 화면 문장은 SPEC-017 §7을 글자 그대로 쓴다. 새 문장을 지어내지 않는다. 바꿔야 할 이유가 있으면 먼저 SPEC-017(landing-v3.2/docs)을 고쳐 spec 커밋하고 PR 본문에 적는다.
- 첫 읽기 자리(§7.7 적용 구역)에 METAPHOR_TERMS가 하나도 없어야 한다. 은유는 그림과 작은 보조 라벨, FAQ, ‘위와 아래’ 본문에만.
- 금지 표현(CLAIM_BANNED)·필수 고지(프로토타입, 가상 예시, 이 브라우저에만) 유지. 백분율·가짜 수치·구체적 시간 약속 금지(“몇 분”만 허용).
- gets 목록은 테두리 없음(조작 요소가 아님), 링크 아님. 챕터 번호 n/N 표기 금지 유지.
- <h1>은 1개. 방문자 입력과 후보 교체는 textContent로만. 새 hex 색은 tokens.css에만. sticky는 상단바만. infinite 애니메이션 금지. 390px 가로 스크롤 0.
- 이미 커밋된 CP 파일은 고치지 않는다. 실행하지 않은 검사를 완료라고 쓰지 않는다. Playwright가 없으면 설치하지 말고 qa를 “미실행”으로 기록.

## 4. 끝내기 전 검사 (전부 실행하고 결과 수를 기록)
node --test landing-v3.2/tests/*.test.mjs
node --test landing-v3.1/tests/*.test.mjs
node --test landing-v3/tests/*.test.mjs
node --test prototype/tests/*.test.mjs
node --test site/tests/*.test.mjs
node --test scripts/tests/*.test.mjs
node scripts/verify-checkpoint.mjs
node landing-v3.2/scripts/build.mjs && node site/scripts/build.mjs
node landing-v3.2/scripts/qa.mjs --shots   (Playwright 있을 때)
그다음 마지막 CP → gitflow finish --pr. PR 본문은 WORKORDER §3 틀을 쓴다.

## 5. 멈출 때
- 명세끼리 충돌하거나 SPEC-017만으로 정할 수 없는 제품 결정이 필요할 때
- 필수 검사가 고칠 수 없는 이유로 실패할 때
- landing-v3.1/을 PM-1 범위 밖에서 바꿔야만 진행할 수 있을 때
멈출 때는 CP를 남기고 원인·선택지·추천을 짧게 보고한다.

## 6. 마지막 보고 (이 형식으로)
1. 브랜치와 PR(또는 handoff) 위치
2. 단계 1~5별 결과 한 줄씩
3. AC-L32-01~10 각각: 충족 / 미충족 / 미실행(사유)
4. 검사별 통과·실패 수, 5초 테스트 캡처 4장 경로
5. landing-v3.1 변경 파일 목록(두 개뿐인지)
6. SPEC-017과 다르게 한 점과 이유(없으면 “없음”)
7. 병합 전에 내가 할 일
```
