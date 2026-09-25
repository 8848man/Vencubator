# VAL-L01 — 랜딩 페이지 검증

대상: SPEC-006 r0.1 · L01-W01 · 2026-09-24

## 실행 결과

| 검사 | 환경 | 명령 | 결과 |
|---|---|---|---|
| 단위·명세 검사 (AC-LP01~05, 07~09) | 클라우드 작업공간 Node 22 | `node --test landing/tests/*.test.mjs` | 25 pass / 0 fail / 2 skip (저장소 밖이라 STATE·prototype 비교 생략) |
| 단위·명세 검사 (전체) | 사용자 PC 저장소 루트 Node 22.23 | 동일 | 27 pass / 0 fail / 0 skip (STATE.json·prototype STATS 일치 포함). 기존 `prototype/tests` 34 pass 회귀 없음 |
| 브라우저 검사 (AC-LP06) | Playwright Chromium, dist/index.html | `node landing/scripts/qa.mjs --shots` | 32/32 pass — 1440×900·390×844 × 일반/모션 감소: 가로 스크롤 0, h1 1개, sticky 스테이지 동작/해제, type 인덱스 03, story 01·03·05, 전체 스크롤 후 reveal 표시, 스티키 CTA, JS 오류 0 |
| 시각 검토 | 동일 스크린샷 64장 | 수동 | 섹션별 레이아웃 확인. 발견 후 수정: 섹션 클래스 충돌(`lp-areas`), 스토리 프레임 겹침·설명 조기 소멸, 스티키 CTA가 고정 스테이지를 가림, 모바일 CTA 줄바꿈 |

## 한계·미실행

- 클라우드 브라우저는 Pretendard/JetBrains Mono CDN을 불러오지 못해 대체 글꼴로 확인했다. 실제 글꼴 적용 화면은 사용자 환경에서 확인 필요.
- Safari/Firefox, 실제 모바일 기기, 스크린리더 수동 검사 미실행.
- 실제 사용자 반응(전환·이해도)은 검증하지 않았다. 프로토타입 연구(P04-W02)와 별도.
- 외부 배포 없음.

## 개선 이력

| 날짜 | 변경 ID/요약 | Spec revision | 실행한 검사 | 결과 | 미실행/한계 |
|---|---|---|---|---|---|
| 2026-09-24 | L01-W01 최초 구현 | r0.1 | 위 표 | 통과 | 위 한계 |
