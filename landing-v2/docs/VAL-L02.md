# VAL-L02 — 랜딩 v2 검증

대상: SPEC-007 r0.1 · L02-W01 · 2026-09-24

## 실행 결과

| 검사 | 환경 | 명령 | 결과 |
|---|---|---|---|
| 단위·명세 (AC-L2-01~07, 09) | 클라우드 작업공간 Node 22 | `node --test landing-v2/tests/*.test.mjs` | 27 pass / 0 fail / 3 skip (저장소 밖이라 STATE·prototype 비교 생략) |
| 단위·명세 (전체) | 사용자 PC 저장소 루트 Node 22.23 | 동일 | 30 pass / 0 fail / 0 skip (STATE·prototype STATS·PATH·LESSONS 일치 포함). 회귀: landing(v1) 27 pass, prototype 34 pass |
| 브라우저 시나리오 (AC-L2-08) | Playwright Chromium, dist/index.html, 1440×900·390×844 × 일반/모션 감소 | `node landing-v2/scripts/qa.mjs --shots` | 76/76 pass — 빈 입력 안내, 입력→카드·챕터 반영, 오답→다른 문항→정답, 고객 입력→질문 반영·저장, 달랐어요→가설 재검토·경로 2번째 전략, 결정→5/5, 칸 클릭 이동, 모바일 트레이 열기/닫기, 새로고침 복원, 처음부터, 가로 스크롤 0, JS 오류 0 |
| 시각 검토 | 스크린샷 36장 | 수동 | 발견 후 수정: 히어로 강조 밑줄이 줄바꿈 시 박스 전체에 깔림(→ inline mark + box-decoration-break), 카드 “내 질문” 값이 너무 김(→ 요약 표기) |

## 한계·미실행

- 웹폰트(Pretendard·Gowun Batang) 미로딩 상태로 검토. 실제 글꼴 화면은 사용자 환경에서 확인 필요.
- Safari/Firefox, 실기기, 스크린리더 수동 검사 미실행.
- v1 대비 실제로 더 나은지는 사용자 비교 연구 전(DR-L2-02). 위 결과는 기능·접근성 검증이다.
- 클립보드 복사는 브라우저 권한에 따라 실패할 수 있으며 실패 안내만 자동 확인하지 않았다.

## 개선 이력

| 날짜 | 변경 ID/요약 | Spec revision | 실행한 검사 | 결과 | 미실행/한계 |
|---|---|---|---|---|---|
| 2026-09-24 | L02-W01 최초 구현 | r0.1 | 위 표 | 통과 | 위 한계 |
