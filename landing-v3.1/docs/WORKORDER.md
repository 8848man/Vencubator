# 작업 지시서 — 랜딩 v3.1 (L05-W01, 원스텝)

기준일 2026-09-29 · AUTH-027 · 계약 [SPEC-016](SPEC-016-landing-v3.1.md) · 정책 [POLICY](POLICY.md) · 실행: GPT(사용자 PC, 저장소 작업 폴더)

## 0. 공통 지시

1. 시작 전 `AGENTS.md`의 “매 작업 시작” 절차를 따른다(README, CURRENT, STATE, 마지막 CP, APPROVALS).
2. **한 번의 요청으로 끝까지 수행한다(원스텝).** 작업 단위는 W 하나 `L05-W01`, 브랜치 하나 `w/L05-W01-landing-v31`, PR 하나(SPEC-014 §12). 첫 명령: `node scripts/gitflow.mjs start L05-W01 landing-v31 --title "랜딩 v3.1: 다음 층 안내·앱 CTA·대상 공감"`. 아래 단계 1~5를 순서대로 진행하고, 단계 사이에 사용자 확인을 기다리지 않는다.
3. 규모가 크므로 시작 직후 `docs/execution/work-items/L05-W01.md`에 단계 1~5의 표를 **하나의 실행 계획·체크리스트**로 옮기고 `docs` 커밋, 시작 CP를 남긴다(CHECKPOINT-PROTOCOL §3-1). 각 단계 끝마다 체크 갱신 + CP(`체크리스트 k/N`) + `cp` 커밋. 중단되면 첫 미완료 항목부터 재개한다.
4. 커밋은 의미 단위로, 명시한 파일만: `gitflow commit <spec|feat|fix|test|docs|chore|cp> "<요약>" <파일…> --spec "SPEC-016 r0.1" --auth AUTH-027 --validation "<실행한 검사와 결과>"`.
5. 끝(단계 5 뒤 한 번만): 필수 검사 → `gitflow finish --pr`. push가 안 되면 handoff(`_handoff/open-pr.cmd`)를 만들고 사용자에게 알린다. **main 병합·배포는 하지 않는다.**
6. `landing-v3/`는 POLICY PV-1 예외(`src/track.mjs`, `dist/index.html`) 외에 건드리지 않는다.
7. SPEC-016과 다르게 구현해야 하면 멈추고 SPEC-016을 먼저 고친 뒤(`spec` 커밋) PR 본문에 이유를 적는다. 문구는 SPEC-016 §7을 그대로 쓴다.
8. 구현하지 않은 것·실행하지 않은 검사를 완료라고 쓰지 않는다. Playwright가 없으면 qa를 “미실행”으로 기록.
9. 매 W 끝에 `node --test landing-v3/tests/*.test.mjs`도 실행해 v3가 그대로인지 확인한다.

## 1. 준비물 위치

이 지시서 묶음은 작업 폴더의 `Claude outputs/landing-v3.1/`에 있다: `POLICY.md`, `SPEC-016-landing-v3.1.md`, `WORKORDER.md`(이 문서), `PROMPTS.md`. 단계 1에서 저장소 정식 위치로 옮긴다.

## 2. 작업 목록

| 단계 | 제목 | 해결 |
|---|---|---|
| 1 | v3.1 기반: 폴더·명세·식별자·계측 (화면 변화 없음) | 기반 |
| 2 | 다음 층 안내 | F1 |
| 3 | 앱 CTA 인지·반응 | F3, 요청 B |
| 4 | 대상 공감 | F2 |
| 5 | 브라우저 검증·사이트 전환 | 전체 |

모두 같은 브랜치 `w/L05-W01-landing-v31`에서 진행한다. 각 단계 표의 “start, 체크리스트”·“finish” 항목은 단계 1의 시작과 단계 5의 끝에서 한 번만 수행하고, 나머지 단계에서는 “체크 갱신·CP”로 읽는다.

---

## 단계 1 — v3.1 기반 (동작 변화 없음)

목표: `landing-v3.1/`이 v3와 **똑같이 보이고 동작**하되, 식별자·명세·계측 준비가 v3.1 것이 된다.

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | gitflow start, W 정의·전체 체크리스트(단계 1~5), `docs/execution/STATE.json`에 phase `L05`(stage S1, “랜딩 v3.1 — 다음 층 안내·앱 CTA·공감”)와 L05-W01 active 등록, `docs/process/APPROVALS.md`에 AUTH-027 추가(아래 문안) | work-items/L05-W01.md, STATE, APPROVALS | 파일 | docs |
| 2 | 명세 반입: `Claude outputs/landing-v3.1/`의 POLICY·SPEC-016·WORKORDER를 `landing-v3.1/docs/POLICY.md`, `landing-v3.1/docs/SPEC-016-landing-v3.1.md`, `landing-v3.1/docs/WORKORDER.md`로 복사 | landing-v3.1/docs/* | 파일 | spec |
| 3 | `landing-v3/`의 `index.html`, `src/`, `scripts/`, `tests/`, `start.cmd`, `README.md`를 `landing-v3.1/`로 복사(`dist/`, `qa-shots/`, `docs/` 제외) | landing-v3.1/** | diff | chore |
| 4 | 식별자 교체(SPEC-016 §2 표): content `SITE`, 빌드 생성기 표기, serve 4177 / qa 4197·경로 `/landing-v3.1/`, start.cmd, README(v3.1 소개·실행법). 테스트는 `docs/SPEC-016-landing-v3.1.md`를 읽도록, AC-L3-01 ID 개수는 이 단계에선 **SPEC-016 표 기준 21개 중 코드에 없는 5개(L3I-10~12, L3M-08~09)는 단계 2~4에서 채운다** → 이 단계에서는 해당 5개를 “예정 ID” 목록으로 임시 허용하고 TODO 주석에 단계 번호를 남긴다 | landing-v3.1/src/content.mjs, scripts/*, tests/*, start.cmd, README.md | `node --test landing-v3.1/tests/*.test.mjs` | feat |
| 5 | 앱 진입: `prototype/entry.mjs` `LANDING_KEYS.v31`, `FROM`에 `v31`. 테스트 추가(v31은 v31 저장소만 읽음, v3와 섞이지 않음) | prototype/entry.mjs, prototype/tests/entry.test.mjs | `node --test prototype/tests/*.test.mjs` | feat + test |
| 6 | 계측(SPEC-016 §9): `site/shared/track.mjs`에 필드·enum·VARIANTS·page 규칙 추가, 모든 복사본 동기화, 사이트 계측 테스트 보강. `landing-v3/dist`, `landing-v3.1/dist` 재빌드 | site/shared/track.mjs, 복사본 5곳, site/tests/*, 두 dist | site·prototype·landing-v3·landing-v3.1 테스트 | feat + test + chore |
| 7 | `scripts/gitflow.config.json` 필수 검사에 `landing-v3.1 단위` 추가 | scripts/gitflow.config.json | finish 검사 | chore |
| 8 | 단계 1 CP | CP, STATE, WORKLOG/CURRENT/HANDOFF | verify-checkpoint | cp |

AUTH-027 문안(APPROVALS.md 끝에 추가):

> ## AUTH-027 — 랜딩 v3.1 (다음 층 안내·앱 CTA·공감)
> 2026-09-29 사용자: “기존 v3은 내버려두고 v3.1으로 개선하자. 개선 정책을 작성해줘. 실제 작업은 GPT를 통해 개선하려고 해.” 테스터 피드백 3건(다음 행동 모름, 대상 공감 부족, ‘앱 열기’ 미인지)과 요청(층 완료 시 다음 층 버튼, 행동마다 앱 버튼 강조). 범위: `landing-v3.1/` 신설, SPEC-016 r0.1(결정 기본값 DR-LG-01~08), 앱 진입 `from=v31`, 공통 계측 복사본 동기화, L05-W01 한 브랜치·의미별 커밋·PR 1개. `landing-v3/` 동작·카피 변경 금지. main 병합·운영 배포는 사용자.

완료 조건: v3.1 dist를 열면 v3와 화면이 같다(카피 차이 없음). 모든 테스트 통과. `git diff --stat origin/main -- landing-v3`는 `src/track.mjs`, `dist/index.html`만.

---

## 단계 2 — 다음 층 안내 (F1)

SPEC-016 §4 `nextState`, §5 L3I-10·L3I-04 강조, §5.1 문구, §6 L3M-08, §8 버튼 시각 규칙.

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | 체크리스트에서 단계 2 시작 표시 | work-items/L05-W01.md | — | (다음 커밋에 포함) |
| 2 | content: `NEXT` 문구 6개, 앱 텍스트 링크 문구, live 알림 문구 | src/content.mjs | 테스트 | feat |
| 3 | state: `nextState(state)` 순수 함수, 칩 선택 시 `REACH surface` | src/state.mjs | state.test | feat + test |
| 4 | render: 층별 `<div class="l3-next" data-next="<층>" hidden>` (버튼 `type="button" data-goto="<다음 앵커>"` + 앱 텍스트 링크 `data-cta="prototype"`), 곁뿌리 SVG 한 줄, 공용 `aria-live` 영역 1개. 위치 = 패널 바로 아래 오른쪽(모바일 오른쪽 정렬 유지, 링크는 아래 줄) | src/render.mjs | render.test | feat + test |
| 5 | interact: paint에서 `nextState` 반영, false→true일 때만 `is-growing` 클래스(500ms 지연) + live 알림 1회, 복원 시 즉시 표시. `data-goto` 클릭 → `goTo(id)` + `track('next_click',{layer})`. 고객 입력 후 미저장이면 저장 버튼 `is-ready`. 관찰 변경 → 결정 버튼 숨김 | src/interact.mjs | 수동 + qa | feat |
| 6 | CSS: L3M-08(곁뿌리 dash, clip-path 등장, 화살표 2회), 짙은 흙 층 버튼 색, `is-ready`, 모션 감소 | src/landing.css, src/tokens.css | content.test(hex·sticky·infinite) | feat |
| 7 | spec 테스트: L3I-10·L3M-08 “예정 ID” 해제 | tests/spec.test.mjs | node --test | test |
| 8 | dist 빌드, 단계 CP | dist, CP 등 | 모든 테스트 | chore + cp |

완료 조건: 각 층 행동 → 약 0.5초 뒤 패널 아래 오른쪽에 버튼이 뿌리처럼 뻗어 나타나고, 누르면 다음 층 제목으로 이동. 새로고침 후에도 완료 층 버튼 유지(애니메이션 없이).

---

## 단계 3 — 앱 CTA 인지·반응 (F3, 요청 B)

SPEC-016 §5 L3I-12, §6 L3M-09, §7.1 `appLink`, §7.6, §8 상단바 CTA.

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | 체크리스트에서 단계 3 시작 표시 | work-items/L05-W01.md | — | (다음 커밋에 포함) |
| 2 | content: 상단바 “앱 시작하기”, 푸터 “앱 시작하기”, 히어로 `appLink`, 말풍선 2종, 진행 점 라벨 | src/content.mjs | content.test | feat |
| 3 | render: 상단바 CTA(아이콘 + 라벨 + 진행 점 5개 `aria-label`), 말풍선 요소(`aria-live`), 히어로 보조 링크(`data-cta="prototype" data-placement="hero"`) | src/render.mjs | render.test | feat + test |
| 4 | interact: 내가 채운 층 수(`rootState(state).mine`) 증가 시 CTA 빛 1회, 진행 점 갱신, 5개 완료 시 반짝임 + 말풍선, 첫 심기 시 말풍선(페이지당 1회), 말풍선 클릭 닫기. `cta_click` placement: `data-placement` 우선, 없으면 가장 가까운 `data-spec` | src/interact.mjs | qa | feat |
| 5 | CSS: CTA 16px·패딩, `.l3-top.is-dark` 연두 배경/짙은 글자, 빛(1회 keyframes), 반짝임, 말풍선, 480px 이하 진행 점 숨김, 모션 감소 | src/landing.css, src/tokens.css | content.test | feat |
| 6 | 테스트: 대비 계산(토큰 hex로 CTA/상단바 두 구간 ≥ 3:1, 글자 ≥ 4.5:1), `infinite` 금지, L3I-12·L3M-09 예정 ID 해제 | tests/content.test.mjs, spec.test.mjs | node --test | test |
| 7 | dist, 단계 CP | — | 모든 테스트 | chore + cp |

완료 조건: 짙은 흙 구간에서도 상단 CTA가 또렷함. 층 완료마다 CTA가 한 번 반응(무한 반복 없음), 5층 완료 시 크게 한 번. 첫 화면에서 스크롤 없이 앱 보조 링크가 보임(1440·390).

---

## 단계 4 — 대상 공감 (F2)

SPEC-016 §4 `pain`·`observationFor`, §5 L3I-11, §7.1 hook·typing, §7.2~7.6.

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | 체크리스트에서 단계 4 시작 표시 | work-items/L05-W01.md | — | (다음 커밋에 포함) |
| 2 | content: `hook`, `typing`, SAMPLES 3개(순서 §7.2), SLOTS 예시, `OBSERVATION.quotesBySample`·`quotesGeneric`(기존 `quotes` 제거), `PAIN`, 층별 `why`, 하베스트 body | src/content.mjs | content.test | feat |
| 3 | state: `pain`, `SET_PAIN`, 저장값 복원, `observationFor` | src/state.mjs | state.test | feat + test |
| 4 | render: hook(h1 위 `<p>`), 겉흙 맨 위 고민 선택(칩 4개 `aria-pressed`, 도입 문장 `data-bind="pain-line"`), 층별 why, 관찰 답 목록을 `data-bind`로 | src/render.mjs | render.test | feat + test |
| 5 | interact: 고민 선택 → SET_PAIN + `track('pain_select',{pain})` + 도입 문장 교체, 관찰 답 = `observationFor(state)`(textContent로 교체) | src/interact.mjs | qa | feat |
| 6 | CSS: hook·고민 칩·why 스타일(모바일 390px 줄바꿈 확인) | src/landing.css | content.test | feat |
| 7 | 테스트: 예시 3개 모두 관찰 답 존재, 과장 인계 표현 없음, L3I-11 예정 ID 해제(이제 21개 전부 코드에 존재) | tests/* | node --test | test |
| 8 | dist, 단계 CP | — | 모든 테스트 | chore + cp |

완료 조건: 첫 화면 첫 줄이 문제 공감 문장. 고민을 고르면 겉흙 도입 문장이 바뀜. 리뷰 예시를 고르면 관찰 층 답이 리뷰 이야기로 바뀜. 내 문장이면 공통 답.

---

## 단계 5 — 브라우저 검증·사이트 전환

| # | 할 일 | 파일 | 확인 | 커밋 |
|---|---|---|---|---|
| 1 | 체크리스트에서 단계 5 시작 표시 | work-items/L05-W01.md | — | (다음 커밋에 포함) |
| 2 | `landing-v3.1/scripts/qa.mjs`: SPEC-016 AC-L31-07 시나리오 전부 + v3 시나리오 유지. `--shots`로 1440·390 캡처 | scripts/qa.mjs | `node landing-v3.1/scripts/qa.mjs --shots` | test |
| 3 | 검증 기록 `landing-v3.1/docs/VAL-L31.md`(실행 명령, 결과 수, 캡처 목록, 미실행 항목) | docs/VAL-L31.md | 파일 | docs |
| 4 | 사이트 전환: `site/scripts/build.mjs`가 `landing-v3.1/scripts/build.mjs`로 루트 `index.html`을 만든다. 사이트 빌드 테스트(`site/tests/build.test.mjs`)의 v3 기대값을 v3.1로(검색 확인 메타 유지, sitemap·robots 유지). `site/README.md`·`DEPLOY.md`의 랜딩 설명 갱신 | site/scripts/build.mjs, site/tests/*, site/*.md | `node --test site/tests/*.test.mjs`, `node site/scripts/build.mjs` | feat + test + docs |
| 5 | 사이트 QA: `node site/scripts/serve.mjs` → `/`에서 이름표 입력 → “이 이름표로 앱에서 심기” → `/app/?from=v31`에서 문장 인계 확인 | site/scripts/qa.mjs(시나리오 추가) | qa | test |
| 6 | 프로젝트 문서: 저장소 README의 랜딩 설명을 v3.1로, `landing-v3/README.md`는 **수정하지 않음** | README.md | — | docs |
| 7 | CP(L05 완료), finish. PR 본문에 “병합 = 운영 루트가 v3.1로 바뀜”, 사용자 확인 항목(GA4 기준선 기록, 사용성 5명) 명시 | CP 등 | 모든 검사 | cp |

완료 조건: AC-L31-01~09 충족 또는 미실행 사유 기록. main 병합은 사용자가 한다.

## 3. PR 본문 공통 틀

1. L05-W01, SPEC-016 r0.1, AUTH-027, CP 범위, 단계 1~5 결과
2. 사용자에게 보이는 변화(스크린샷 경로가 있으면 함께)
3. 실행한 검사와 결과 수(`landing-v3.1`, `landing-v3`, `prototype`, `site`, `scripts/tests`, verify-checkpoint, qa)
4. 미실행 검사·알려진 위험
5. 배포 영향: 이 PR을 병합하면 운영 루트(`/`)가 v3.1로 바뀐다
