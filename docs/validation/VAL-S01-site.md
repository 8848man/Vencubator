# VAL-S01 — 하나의 사이트 (SPEC-009 r0.1)

L03-W01 · AUTH-009 · 2026-09-25

| 검사 | 환경 | 명령 | 결과 |
|---|---|---|---|
| 사이트 단위·빌드 (AC-S01~03) | 사용자 PC 저장소, Node 22 | `node --test site/tests/*.test.mjs` | 12 pass / 0 fail |
| 앱 인계 (AC-S04) + 회귀 | 동일 | `node --test prototype/tests/*.test.mjs` | 43 pass / 0 fail (기존 38 + entry 5) |
| 랜딩 회귀 (AC-S06) | 동일 | `node --test landing/tests/*.test.mjs`, `landing-v2/tests` | 27 pass, 30 pass |
| 브라우저 (AC-S05) | 클라우드 작업공간 Playwright Chromium, `site/dist` HTTP 제공 | `node site/scripts/qa.mjs --shots` | 31/31 pass — 새 컨텍스트 200회 배정 v1 103 / v2 97, UTM 유지·`v` 제거, 재방문 동일 변형, v1→앱 빈 칸, v2 입력→앱 새 프로젝트 칸에 같은 문장·안내 표시, 제출 전 프로젝트 미생성, 새로고침 시 재가져오기 없음, 이벤트 순서(landing_view→idea_submit→cta_click→app_open→entry_import→project_create), 이벤트에 입력 문장 없음, 1440·390 가로 스크롤 0, JS 오류 0 |

수정 이력: QA 1차에서 `entry_import`가 `app_open`보다 먼저 기록됨 → 앱 진입 기록을 먼저 하도록 순서 변경 후 재검사 통과.

## 한계·미실행

- 외부 공개 배포, 실제 분석 도구 전송 미실행(DR-G01·G02). 이벤트는 브라우저 버퍼에만 있음.
- 실제 웹폰트 화면, Safari/Firefox, 실기기 미확인.
- 배정 분포는 모의 방문 200회 기준이며 실제 트래픽 분포 검증 아님.
- 사용자 PC 가상 환경에서는 파일 삭제가 막혀 `site/dist`를 덮어쓰기로 갱신함(Windows 정상 환경에서는 삭제 후 재생성).
