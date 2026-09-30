# VAL-L32 — 랜딩 v3.2 검증 기록

기준일 2026-09-30 · SPEC-017 r0.1 · 실행: Claude(Cowork), 사용자 PC(node 22) + 클라우드 Chromium

## 1. 자동 검사

| 명령 | 결과 |
|---|---|
| node --test landing-v3.2/tests/*.test.mjs | 55 통과 / 0 실패 |
| node --test landing-v3.1/tests/*.test.mjs | 49 / 0 (track.mjs 동기화·dist 재빌드 후) |
| node --test landing-v3/tests/*.test.mjs | 41 / 0 |
| node --test landing/tests, landing-v2/tests | 27 / 0, 30 / 0 |
| node --test prototype/tests/*.test.mjs | 76 / 0 (AC-L32-01 v32 인계 추가) |
| node --test site/tests/*.test.mjs | 20 / 0 |
| node --test scripts/tests/*.test.mjs | 7 / 0 |
| landing-v3.2/scripts/qa.mjs | **미실행** — 사용자 PC에 Playwright 없음 |

## 2. 브라우저 확인 (클라우드 Chromium, dist/index.html)

| 항목 | 결과 |
|---|---|
| JS 오류 | 0 (모든 화면) |
| 가로 스크롤 | 0 (390·1440) |
| 390×844 첫 화면 | eyebrow·h1(2줄)·lead·가치 3줄·예시 칩·앱 보조 링크 보임, 입력칸 윗부분 보임(top 787px) |
| 1440×900 첫 화면 | h1·lead·가치 3줄·입력칸·앱 보조 링크 모두 보임 |
| ?h=b / ?h=c | h1·lead 교체됨. ?h=x → 기본 a |
| 예시 칩 → 다음 버튼 | 문구 “다음 · 오늘 확인할 개념 ↓”, 클릭 시 learn 제목에 포커스 |
| 저장·인계 | 저장 키 vencubator.landing.v32, 하베스트 링크 ./app/?from=v32 |

캡처(qa-shots/, git 제외): 5sec-v31.png, 5sec-a.png, 5sec-b.png, 5sec-c.png, desktop-a.png

## 3. 명세와 다르게 한 점

- SPEC-017에 부록 A(v3.1에서 이어받는 섹션·상호작용·모션·관찰 답·고민·why 표)를 추가했다. v3.1 테스트가 명세 문서를 계약으로 읽기 때문이며, 본문이 우선한다.
- 층 “보조 라벨”은 새로 만들지 않고 기존 왼쪽 열(깊이·지층·실제 뜻)을 그대로 쓴다. DOM에서 제목보다 앞에 있어 AC-L32-04를 만족한다.
- 모바일(≤480px) h1 32px, 첫 화면 위 여백 축소 — 후보 a가 3줄로 넘치지 않게.

## 4. 5초 테스트 결과 (사용자 기록)

| 참가자 | 본 안 순서 | ① 누구를 위한 | ② 무엇을 얻나 | 통과 |
|---|---|---|---|---|
| | | | | |

통과 기준: 5명 중 4명 이상이 ①②를 모두 맞힘(POLICY §6.1).
