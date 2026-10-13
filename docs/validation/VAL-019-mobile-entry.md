# VAL-019 — 모바일 진입과 첫 사용 UX

2026-10-13 · L08-W01 · SPEC-019 r0.1 · 로컬 검사

## 실행 결과

| 확인 | 방법 | 결과 |
|---|---|---|
| 앱 전체 | `node --test prototype/tests/*.test.mjs` | 80/80 통과 |
| 사이트 전체 | `node --test site/tests/*.test.mjs` | 31/31 통과 |
| 신규 경계 검사 | `node --test prototype/tests/onboarding.test.mjs site/tests/mobile-entry.test.mjs` | 4/4 통과 |
| 빌드·구문 | `node site/scripts/build.mjs`, `node --check` 3개 JS, 랜딩 인라인 JS 구문 | 통과 |
| 랜딩 v3.3 | 로컬 IAB에서 세 질문 선택 → 맞춤 요약 | 문구 변경 확인, JS 오류를 수정한 뒤 재확인 |
| 앱 첫 실행 | 새 포트의 빈 로컬 저장소에서 온보딩 → 선택 → 새로고침 → 아이디어 입력 → 완료 | 3/6 단계로 복구, 추천·아이디어가 새 프로젝트 화면에 표시, 재방문 시 튜토리얼 미노출 |
| 모바일 `/` | IAB 뷰포트 390×844 및 320×700 | 390px에서 `/app/` 이동; 320px 문서 scrollWidth 305px, 하단 버튼 가시 |
| 넓은 화면 `/` | 뷰포트 기본값에서 새 포트 방문 | 기존 독자 선택창 표시 |
| 기존 앱 사용자 | 저장된 사용자가 `/app/` 방문 | 기존 로드맵으로 진입, 튜토리얼 미노출 |
| 독립 랜딩·gitflow 회귀 | `node --test landing-v3/tests/*.test.mjs`, `landing-v3.1/tests/*.test.mjs`, `landing-v3.2/tests/*.test.mjs`, `scripts/tests/*.test.mjs` | 각각 41/41, 49/49, 55/55, 7/7 통과 |
| 체크포인트 | `node scripts/verify-checkpoint.mjs` | CP-0102 해시 오류 0 |

## 한계

브라우저 확인은 로컬 IAB의 에뮬레이트 뷰포트에서 수행했다. 실제 Android/iOS 기기·스크린리더·스토리지 차단 환경·운영 분석 수신·사용자 연구는 미실행이다. 온보딩 답변은 첫 제안 문구와 아이디어 초안에만 쓰이며 실제 추천 엔진이나 고객 검증으로 취급하지 않는다. 모바일 진입 효과 수치는 아직 없다. 운영 배포·main 병합은 하지 않았다.
