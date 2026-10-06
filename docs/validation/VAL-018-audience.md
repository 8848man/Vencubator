# VAL-018 — 독자별 랜딩 검증

2026-10-07 · L07-W01 · SPEC-018 r0.1 · AUTH-029

대상: w/L07-W01-audience-landings, origin/main 1b7dfea 기준. 명세를 9b09309에 먼저 커밋한 뒤 구현했다. 명세 보완 3b0150b는 재선택 취소 시 선호 보존과 브라우저 뒤로가기 예외를 명확히 했다.

## 자동 검사

| 명령 | 통과 | 실패 | 건너뜀 |
|---|---:|---:|---:|
| node --test prototype/tests/*.test.mjs | 77 | 0 | 0 |
| node --test landing-v3/tests/*.test.mjs | 41 | 0 | 0 |
| node --test landing-v3.1/tests/*.test.mjs | 49 | 0 | 0 |
| node --test landing-v3.2/tests/*.test.mjs | 55 | 0 | 0 |
| node --test site/tests/*.test.mjs | 30 | 0 | 0 |
| node --test scripts/tests/*.test.mjs | 7 | 0 | 0 |
| 합계 | 259 | 0 | 0 |

기록: tmp/audience-{prototype,landing-v3,landing-v3.1,landing-v3.2,site,scripts}-tests.log (로컬 보조 기록, 커밋 제외). Gitflow 검사는 임시 저장소를 생성하므로 Git 쓰기 권한으로 실행했다.

- 독립 랜딩 5개 build() 성공(landing/v2/v3/v31/v32). 계측 사본 변경만 반영.
- `node site/scripts/build.mjs` 성공, 루트·beginner·value·test·공용 자원·앱 생성.
- `git diff --check` 오류 0.
- `node scripts/verify-checkpoint.mjs`: CP0096~0099 게시 시 각각 오류 0. 이후 파일 변경에 대한 최종 무결성은 완료 CP 및 finish 검사 기록에서 확인한다.

## 브라우저

설치돼 있던 Codex 번들 런타임 Playwright와 Chromium 사용. 새 설치 없음. QA_PLAYWRIGHT_MODULE에 기존 playwright/index.mjs 경로를 지정했다. 로컬 서버만 사용했고 의견 전송·운영 데이터 생성 없음.

| 명령 | 통과 | 실패 |
|---|---:|---:|
| node site/scripts/qa-audience.mjs --shots | 54 | 0 |
| node site/scripts/qa.mjs --shots | 30 | 0 |

새 QA: 1440×900/390×844, 추가 390×568. 첫 선택창·Escape·포커스 격리/복귀·선택 저장·재선택 취소·직접 링크·기억한 경로·해시 우선·건너뛰기 복원·뷰 중복 방지·두 신규 앱 from·과거 이름표 미인계·입문 이름표 인계·저장 완전 차단·JS 비활성 경로를 확인했다. 기존 QA: 입문 입력→앱 프로젝트 생성·설정·이벤트 순서·자유 텍스트 미포함·모바일 회귀를 확인했다.

캡처: site/qa-shots/ (Git 제외)

- audience-desktop-dialog.png / audience-mobile-dialog.png
- audience-desktop-value.png / audience-mobile-value.png
- audience-desktop-test.png / audience-mobile-test.png
- audience-desktop-app-import.png / audience-mobile-app-import.png
- desktop-landing.png / mobile-landing.png, desktop-app-import.png / mobile-app-import.png, desktop-app-settings.png / mobile-app-settings.png (기존 QA)
- audience-results.json: 54개 항목별 결과

화면 검토: 선택창 문구·세 선택지·건너뛰기 노출, 경험자 4구간과 가상 예시, 테스터의 짙은 hero·의견 질문을 확인했다. 모바일 질문 번호 줄바꿈을 수정하고 재캡처했다. 가로 넘침 0. 신규 색 대비 조합 8개 모두 4.5:1 이상. 새 애니메이션 없음.

## 수용 기준

| ID | 판정 | 근거 |
|---|---|---|
| AC-A01 | 충족 | 첫 선택창 세 링크·건너뛰기·Escape 브라우저 검사 |
| AC-A02 | 충족 | 직접 URL이 선호보다 우선; 세 경로 실측 |
| AC-A03 | 충족 | 저장/손상/예외 순수 함수·재방문/해시/차단 브라우저 |
| AC-A04 | 충족 | 모든 페이지 공용 선택창·재선택/포커스 검사 |
| AC-A05 | 충족 | 명세 카피 대조·4구간·h1·예시/테스트 안내 |
| AC-A06 | 충족 | value/test 앱 진입 실측·이름표 저장소 미접근 테스트 |
| AC-A07 | 충족 | v3/v31/v32 회귀·입문 이름표→앱→프로젝트 생성 |
| AC-A08 | 충족 | enum/운영 차단 단위·자유 문장 미계측·뷰 중복 브라우저 |
| AC-A09 | 충족 | 화면 캡처·수평 넘침0·키보드·대비·reduced-motion |
| AC-A10 | 충족 | JS 꺼진 4경로의 200/본문/직접 링크/앱 링크 |
| AC-A11 | 충족 | 검색 메타·canonical·사이트맵·헤더 빌드 검사 |
| AC-A12 | 충족 | 단위259·브라우저84 통과 및 결과 기록; 최종 CP/finish 연계 |

## 보존과 제한

- `git diff --name-only origin/main -- landing-v3`: src/track.mjs, dist/index.html 두 파일만. v1/v2/v31/v32도 계측 사본과 dist만 변경했다. 기존 문구·학습·AREAS·LESSON·스탯 변경 없음.
- 변경한 신규 내용은 SPEC-018과 일치. SPEC-016 화면 계약 자체의 개정은 없음; 사이트 외곽 선택창/직접 경로를 SPEC-018에서 추가했다.
- 운영 GA4 실제 수신, 실제 피드백 서버 전송, 사용자 5명 사용성, 기획의 전환 효과는 미실행. 실제 전송을 QA가 증명한다고 주장하지 않는다. 기존 P08-W04 외부 검증 대기 상태를 유지한다.
- 병합·운영 배포 미실행. PR은 검토용이며 main 병합은 사용자가 결정한다. 병합 전 기존 v3.1 최근 기준선과 독자별 사용성(총 5명 이상 권장)을 확인한다. 사용자 선택을 무작위 A/B 실험으로 분석하지 않는다.
