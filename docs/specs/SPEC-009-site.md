# SPEC-009 — 하나의 사이트: 랜딩 → 서비스 진입

2026-09-26 계측 개정: AUTH-015 / SPEC-011 r0.1이 아래의 ‘네트워크 전송 없음’ 계약을 대체한다. 운영 GA4 전송을 허용하며 로컬 버퍼·프로젝트 저장은 유지한다.

Revision 0.3 · Approved · AUTH-009 → 사용자 결정(2026-09-26) · 2026-09-26

## 0. r0.3 현행 계약 (아래 §2·§3·§5·§7의 v1/v2 A/B 내용보다 우선)

사용자 결정: “v3가 가장 좋다. v3 랜딩으로 고정하고 앱 배포를 진행하려고 해. 랜딩 페이지에서 유저가 알지 않아도 되는 정보는 제거”.

| 경로 | 내용 | 원본 |
|---|---|---|
| `/` | 랜딩 v3 “뿌리” 공개 빌드. 리디렉션·배정 없음 | `landing-v3/` (`build({public:true})`, SPEC-010 r0.2) |
| `/app/` | 앱(체험판) 정적 파일. 테스트·서버·README 제외 | `prototype/` |
| `/_headers` | 정적 호스팅용 기본 보안 헤더(nosniff, referrer, frame deny). 지원하지 않는 호스트는 무시 | `site/scripts/build.mjs` |

- A/B 순환은 종료한다. `site/router.html`, `site/src/assign.mjs`는 나중에 실험을 다시 열 때를 위해 저장소에만 남기고 빌드하지 않는다. `landing/`(v1)·`landing-v2/`는 배포하지 않는다.
- 랜딩 → 앱 링크는 `./app/?from=v3`. 앱은 `from=v3`일 때 `vencubator.landing.v3` 저장소의 **문장만** 새 프로젝트 입력칸에 채운다(`prototype/entry.mjs` `LANDING_KEYS`). v2 인계 규칙은 유지.
- 계측: `VARIANTS = ['v1','v2','v3']`. 랜딩 v3 첫 방문 시 배정 `{variant:'v3', source:'direct'}`가 기록되어 앱 이벤트까지 같은 방문자로 이어진다. 네트워크 전송 없음(DR-G02 그대로).
- 사용자 화면에 두지 않는 정보: 명세·기획서 링크, 내부 단계 코드, 개발 용어, 공개 빌드 소스의 주석·생성기 표기(SPEC-010 §8). 앱의 점검 도구(AI 응답 지연·실패 재현, 저장 실패 재현)는 `?lab=1`일 때만 설정 화면에 보인다. 앱 문구의 “프로토타입·데모”는 “체험판·기록”으로 바꾼다. 가상 예시·이 브라우저에만 저장·개인정보 입력 금지 안내는 유지한다.
- 배포: `node site/scripts/build.mjs` → `site/dist/` 폴더 전체를 정적 호스팅에 올린다([site/DEPLOY.md](../../site/DEPLOY.md)). 호스팅 계정·도메인·공개 시점은 사용자가 정한다(DR-G01).

| AC | 기준 | 검사 |
|---|---|---|
| AC-S03 r0.3 | dist = `index.html`(랜딩 v3) + `app/` + `_headers`, 링크 `./app/?from=v3`, 내부 문서 링크·로컬 주소·생성기 표기 없음, 앱에 테스트·서버 파일 없음, 앱 점검 도구는 `LAB` 조건부, 계측 사본 5개 동일 | site/tests/build.test.mjs |
| AC-S04 r0.3 | from=v3 → v3 저장소, from=v2 → v2 저장소, 섞지 않음, 알 수 없는 from은 direct | prototype/tests/entry.test.mjs |
| AC-S05 r0.3 | `/` = 랜딩(리디렉션 없음), UTM 보관, 화면에 개발자용 정보 없음, 이름표 → 앱 새 프로젝트 칸, 확인 제출 후에만 생성, 설정 점검 도구 숨김·`?lab=1` 표시, 이벤트 순서·입력 문장 미포함, 1440·390 가로 스크롤 0, JS 오류 0 | site/scripts/qa.mjs |

---

아래는 r0.1(A/B 운영) 기록이다.

사용자 요청: “하나의 사이트로 해서 랜딩 - 서비스 이용까지 자연스럽게 진입하도록 하자. 랜딩 페이지 자체는 v1과 v2를 둘 다 배포하고 확률적으로 보여주도록 설계”. 수요 검증 계획은 [growth/](../../growth/README.md), 랜딩 명세는 [SPEC-006](../../landing/docs/SPEC-006-landing.md)·[SPEC-007](../../landing-v2/docs/SPEC-007-landing-v2.md).

## 1. 범위

| 포함 | 제외 |
|---|---|
| 한 출처(origin) 아래 `/` 배정, `/v1/`·`/v2/` 랜딩, `/app/` 프로토타입. 50:50 고정 배정, 강제 지정, UTM 유지. v2 → 앱 문장 인계. 공통 이벤트 스키마와 **브라우저 내부 버퍼**. 사이트 빌드·로컬 서버 | 외부 공개 배포(DR-G01), 분석 도구 전송(DR-G02), 이메일 등 개인정보 수집(DR-G03), 서버 저장 |

## 2. 경로 계약

| 경로 | 내용 | 원본 |
|---|---|---|
| `/` | 배정 페이지. 변형을 정해 `/v1/` 또는 `/v2/`로 `location.replace` | `site/router.html` + `site/src/assign.mjs` |
| `/v1/` | 랜딩 v1 공개 빌드 | `landing/` (`build({public:true})`) |
| `/v2/` | 랜딩 v2 공개 빌드 | `landing-v2/` (`build({public:true})`) |
| `/app/` | 프로토타입 정적 파일(테스트·서버·README 제외) | `prototype/` |

- 모든 페이지는 **상대 경로**로 자기 파일을 부른다(프로토타입 `index.html` 포함). 루트 기준 경로(`/style.css`) 금지.
- 공개 빌드는 저장소 내부 문서(기획서·명세) 링크를 넣지 않는다.
- 두 랜딩의 서비스 진입 링크는 상대 경로 `../app/?from=v1`, `../app/?from=v2`. 같은 탭에서 이동한다.

## 3. 배정 규칙 (`site/src/assign.mjs`, 순수 함수)

| 순서 | 조건 | 결과 | source |
|---|---|---|---|
| 1 | 주소에 `?v=v1` 또는 `?v=v2` | 그 변형. 저장된 배정도 이 값으로 **덮어씀** | `override` |
| 2 | 저장된 배정이 있고 유효 | 그 변형 | `stored` |
| 3 | 그 외 | 가중치(기본 v1 0.5, v2 0.5)로 무작위 | `random` |

- 저장: `localStorage['vencubator.exp.v1'] = {v:1, visitor, variant, source, at}`. 방문자 ID는 무작위 UUID. 저장 실패 시 매 방문 무작위(`sticky:false`)로 동작한다.
- 이동 주소: `./{variant}/`(상대 경로) + 원래 쿼리(단 `v` 제거) + 해시. UTM은 그대로 넘긴다.
- 배정 없이 `/v1/`·`/v2/`에 직접 들어온 방문자는 보고 있는 변형으로 배정을 기록한다(`source: direct`). 이후 `/`로 와도 같은 변형을 본다.
- 스크립트가 없으면 두 랜딩 링크를 모두 보여준다.

## 4. 공통 이벤트 (`site/shared/track.mjs`)

같은 파일을 `landing/src/track.mjs`, `landing-v2/src/track.mjs`, `prototype/track.mjs`로 복사해 쓴다(테스트가 내용 동일성을 검사).

- 저장: `localStorage['vencubator.events.v1']` 최근 500건. **네트워크 전송 없음.** 전송 어댑터는 DR-G02 결정 후 이 모듈에만 추가한다.
- 모든 이벤트에 자동 첨부: `t`(시각), `visitor`, `variant`(배정), `page`(v1/v2/app/router), `utm`(세션 저장된 source·medium·campaign·content).
- 속성 값은 숫자·불리언, 또는 `[A-Za-z0-9_.-]` 32자 이하 문자열만 허용. 그 외 값은 **버린다**(자유 텍스트 차단). UTM 값은 한글 포함 문자·숫자·`_ . -` 40자 이하만 저장.

| 이벤트 | 페이지 | 속성 |
|---|---|---|
| `experiment_assigned` | router | source |
| `landing_view` | v1, v2 | — |
| `idea_submit` | v2 | source(mine/sample), len(0/10/30 구간) |
| `card_progress` | v2 | filled(1~5) |
| `cta_click` | v1, v2 | placement, filled(v2만) |
| `app_open` | app | from(v1/v2/direct) |
| `entry_import` | app | from |
| `project_create` | app | from, imported(bool) |
| `lesson_complete` | app | count |

**변형 비교의 공통 지표**(v1에는 입력칸이 없으므로): 방문 → `cta_click` → `app_open` → `project_create` → `lesson_complete`. v2 내부 지표(SPEC-007, growth/METRICS)는 보조로 본다.

## 5. v2 → 앱 인계 (DR-L2-01 결정: 같은 출처 저장소)

- 앱은 `?from=v2`로 열리면 `localStorage['vencubator.landing.v2']`의 아이디어 문장만 읽는다. 문장이 비어 있거나 이미 가져온 문장이면 무시한다.
- 가져온 문장은 **새 프로젝트 입력칸을 미리 채울 뿐** 저장·확정하지 않는다. 사용자가 확인하고 제출해야 프로젝트가 생긴다. 안내 문구로 가져온 사실과 고쳐 써도 된다는 점을 알린다.
- 퀴즈 결과·고객·관찰·결정은 넘기지 않는다. 랜딩 체험은 앱의 학습·성장 기록(SPEC-002)으로 인정하지 않는다.
- 로그인(가상) 전이면 이름 입력 후 새 프로젝트 화면으로 간다. 이미 프로젝트가 있어도 가져온 문장이 있으면 새 프로젝트 화면을 연다.
- 앱의 기존 저장 구조(`vencubator.prototype.v1`)는 바꾸지 않는다. 입력 초안(`forms.new`)과 표시용 표식(`forms.entry`)만 쓴다.

## 6. 빌드·실행

- `node site/scripts/build.mjs` → `site/dist/{index.html, v1/, v2/, app/}`. 두 랜딩 빌드를 공개 모드로 다시 생성하고 프로토타입 파일을 복사한다.
- `node site/scripts/serve.mjs` → `http://127.0.0.1:4180/` (dist 제공). Windows: `site/start.cmd`.
- 기존 개별 서버(랜딩 4174·4175)도 `/app/`을 프로토타입으로 연결해 단독 실행에서 진입 링크가 동작한다. 프로토타입 단독 서버(4183)는 그대로.

## 7. 수용 기준

| AC | 기준 | 검사 |
|---|---|---|
| AC-S01 | 배정: 강제 지정 우선·저장 덮어씀, 저장 유효성, 가중 무작위, 잘못된 저장 무시, 이동 주소가 UTM 유지·`v` 제거 | site/tests/assign.test.mjs |
| AC-S02 | 계측: 자유 텍스트 차단, 500건 상한, 배정·UTM 첨부, 저장 실패 시 예외 없음, 네트워크 코드 없음, 복사본 3개 내용 동일 | site/tests/track.test.mjs |
| AC-S03 | 빌드: dist 4경로 존재, 랜딩 진입 링크 `/app/?from=`, 공개 빌드에 내부 문서 링크 없음, 앱에 테스트·서버 파일 없음, 앱 경로 상대 | site/tests/build.test.mjs |
| AC-S04 | 인계: from=v2일 때만 문장 가져오기, 중복 가져오기 없음, 저장된 프로젝트 불변, 입력 초안만 채움 | prototype/tests/entry.test.mjs |
| AC-S05 | 브라우저: `/` 배정 후 재방문 동일, `?v=` 강제, 1,000회 모의 배정 50%±5%p, v2 입력 → 앱 새 프로젝트 칸에 문장, v1 → 앱 빈 칸, 이벤트 순서 기록, JS 오류 0, 모바일 가로 스크롤 0 | site/scripts/qa.mjs |
| AC-S06 | 회귀: landing·landing-v2·prototype 기존 테스트 통과 | 각 tests |

## 8. 실험 해석 주의

- 변형별 공통 지표는 서비스 쪽 행동이다. 10%↔20% 차이는 변형당 약 200명, 10%↔15%는 약 680명(유의수준 5%, 검정력 80%)이 필요하다. 미달이면 방향 참고로만 쓴다.
- 결과는 변형 × 채널로 나눠 본다. 강제 지정(`?v=`)으로 들어온 방문은 비교에서 제외한다.
- 저장소를 지우면 재배정될 수 있다. 방문자 ID 기준으로 첫 배정만 분석에 쓴다.
