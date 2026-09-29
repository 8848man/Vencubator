# VAL-L31 — 랜딩 v3.1

2026-09-29 · L05-W01 · SPEC-016 r0.1 · AUTH-027 · 브랜치 w/L05-W01-landing-v31

## 단계 결과

1. 독립 폴더·식별자·앱 문장 인계·공통 계측. v31 41/41, v3 41/41, prototype 75/75, site 20/20. v3와 같은 렌더 구조·카피에서 시작; 단계 1 브라우저 비교는 미실행.
2. 순수 nextState, 6개 다음 버튼, 저장 강조, false→true 모션·복원. v31 43/43, v3 41/41.
3. 앱 CTA·5칸 진행·말풍선·유한 강조, 양 구간 대비 계산. v31 45/45, v3 41/41.
4. 확정 카피·고민 선택·예시별 관찰 답. 예정 ID 허용 제거, 21개 존재. v31 49/49, v3 41/41.
5. AC-L31-07 QA 시나리오 작성, 사이트 루트 v3.1 전환·검색 메타/보안 헤더 보존. 브라우저 QA는 Playwright 부재로 미실행. 설치하지 않음. main 병합·운영 배포·실제 고객 연구 미실행.

## 최종 검사

| 명령 | 통과 | 실패 | 비고 |
|---|---:|---:|---|
| `node --test landing-v3.1/tests/*.test.mjs` | 49 | 0 | 생략 0 |
| `node --test landing-v3/tests/*.test.mjs` | 41 | 0 | 생략 0 |
| `node --test prototype/tests/*.test.mjs` | 75 | 0 | 생략 0 |
| `node --test site/tests/*.test.mjs` | 20 | 0 | 생략 0 |
| `node --test scripts/tests/*.test.mjs` | 7 | 0 | 생략 0, 제한 환경의 지연 실행 2회 중단 후 비대화형 권한 실행에서 7/7 |
| `node scripts/verify-checkpoint.mjs` | 각 게시 CP 확인 | 0 | CP-0089~0093 통과, 최종 CP 게시 후 재검사 |
| `node landing-v3.1/scripts/build.mjs` | 1 | 0 | 112.7 KB (출력 문자 수 기준) |
| `node site/scripts/build.mjs` | 1 | 0 | 공개 랜딩 109.2 KB (출력 문자 수 기준), app 복사 |
| `node landing-v3.1/scripts/qa.mjs --shots` | — | — | `SKIP: playwright 없음` |
| `node site/scripts/qa.mjs --shots` | — | — | `SKIP: playwright 없음` |
| QA 스크립트 및 공개 인라인 JS `node --check` | 3 | 0 | 구문 검사만, DOM 실행 아님 |
| `git diff --check` | 1 | 0 | 공백 오류 없음 |

단위 검사 합계 192 통과 / 0 실패. 로그는 사용자 작업 폴더 `tmp/l31-final-*.log`에 보관(커밋 제외).
캡처: 생성 없음. Playwright가 준비된 환경에서 `--shots` 실행 시 `landing-v3.1/qa-shots/`와 `site/qa-shots/`에 생성된다. 390px 실제 가로 스크롤·CTA 첫 화면 노출·JS 오류 0을 실행 확인했다고 주장하지 않는다.

## AC 판정

| AC | 판정 | 근거·제한 |
|---|---|---|
| AC-L3-01 | 충족 | SPEC-016 섹션 및 21개 상호작용·모션 ID |
| AC-L3-02 | 충족 | 순수 상태·예시·기록·복원 검사 |
| AC-L3-03 | 충족 | h1·label·button type·실제 뜻 렌더 검사 |
| AC-L3-04 | 충족 | 금지 카피·가상 예시·고지 검사 |
| AC-L3-05 | 충족 | hex·sticky·시각 규칙 정적 검사 |
| AC-L3-06 | 충족 | 직접 네트워크 API 없음, 방문자 입력 textContent/value |
| AC-L3-07 | 충족 | 앱 LESSON·AREAS·STATE 일치 |
| AC-L3-08 | 미실행 | Playwright 없음, 브라우저 시나리오 미실행 |
| AC-L3-09 | 충족 | 독립/공개 단일 파일 빌드 |
| AC-L3-10 | 충족 | 내부 용어·개발 주석 제거 검사 |
| AC-L31-01 | 충족 | v31 식별자·앱 저장소 분리 검사 |
| AC-L31-02 | 충족 | nextState·pain·observationFor 전 조건·복원 검사 |
| AC-L31-03 | 충족 | 6개 버튼·5개 층 링크·hero·4개 고민·why·live 렌더 검사 |
| AC-L31-04 | 충족 | 명세 원문 카피·예시별 답·과장 인계 없음 |
| AC-L31-05 | 충족 | 양 구간 배경 ≥3:1, 글자 ≥4.5:1 계산; infinite 없음 |
| AC-L31-06 | 충족 | 새 enum·page·5곳 복사본 일치, 자유 텍스트 배제 |
| AC-L31-07 | 미실행 | QA 시나리오 추가·구문 검사만, Playwright 없음 |
| AC-L31-08 | 충족 | v3 41/41, origin/main 대비 허용 파일 2개만 변경 |
| AC-L31-09 | 미실행 | 사이트 자동 검사·빌드·readEntry는 통과; 실제 / → /app/?from=v31 브라우저 인계 미실행 |

## 보존·구현 판단

- `landing-v3/src/track.mjs`, `landing-v3/dist/index.html` 두 파일만 변경. 소스·카피·스타일·테스트·명세 불변.
- SPEC-016과 다르게 구현한 제품 요구·카피: 없음. 명세 revision 변경 없음.
- WORKORDER의 `rootState(state).mine`은 기존 코드에서 지하 4층만 센다. 명세의 이름표 포함 5칸은 기존 `deriveCard(state).filled`로 계산했다.
- 무한 모션 금지에 맞춰 기존 커서 깜빡임은 6회, 타이핑은 페이지당 한 바퀴로 제한했다.
- 사용자 선행 미추적 파일 보존. main 병합·운영 배포 없음.

## 병합 전 사용자 확인

이 PR을 병합하면 운영 루트(`/`)가 v3.1로 바뀐다.

1. GA4에서 v3 최근 2주 기준선(층별 도달·cta_click·app_open)을 기록한다.
2. Playwright가 있는 환경에서 두 QA 명령을 실행해 1440·390·모션 감소 및 문장 인계를 확인한다.
3. 사용성 5명: 아이디어 하나로 끝까지, 앱에서 이어하기. 앱 버튼 찾는 시간과 층별 멈춤 위치를 기록한다.
