# VAL-003 — S1 프로토타입 검증

AUTH-003 · SPEC-004 r0.1 · 현재 구현/검사 진행 중

- P01-W01: 네 시나리오/화면 매핑·실제/가상 의미 문서 검토 완료, PROTOTYPE-SCENARIOS 참조.
- 아래 기록은 작업 경계별 누적 결과다. 최신 기술 QA 결과를 우선한다.
- P01-W02: domain/content/storage/AI 대역 구현. `node --test prototype/tests/domain.test.mjs` 17개 통과 (0 실패). 가설/모름, 퀴즈 중복/전이, 시뮬레이션, 반박, 독립 관찰, 사전 기준, scope 변경, 저장 실패 원자성, draft 복원 검사.
- 실제 사용자 연구·다른 모델 교체 실험: 미실행.

기본 Node 22.18.0 실행 확인. npm wrapper는 npm-cli 경로 오류. ADR-003에 따라 외부 설치 없는 ESM 프로토타입 사용.

## 2026-09-23 기술 QA

대상: AUTH-003, SPEC-004 r0.1. 브라우저: Codex IAB, loopback 4173. 실제 연구 참가자 0명.

명령: `node --check prototype/app.mjs`, `node --test prototype/tests/domain.test.mjs prototype/tests/claims.test.mjs prototype/tests/adapters.test.mjs`. **21개 통과, 0 실패**. 실행 환경 Node 22.18.0.

| 작업 / AC | 실행 결과 |
|---|---|
| P01-W03 / AC-P01 | 서버 실행, 프로토타입 라벨, 로그인·빈 목록 직접 확인 |
| P02-W01 / AC-P01 | 가상 사용자 → TeamUp QA 생성 → 인터뷰 진입. 생성 중복 방지는 단위 테스트 |
| P02-W02 / AC-P02 | 6문항, 모름 → 이전에서 값 보존, 예시 입력·수정, 확정 전 초안 라벨 |
| P02-W03 / AC-P05 | 첫 답 입력 직후 reload로 복원. 요약 수정→확정→부캐 연출에서 reload→홈에 수정된 값/1단계 유지 |
| P03-W01 / AC-P03 | 7개 학습 카드. 고객 문항 오답0→다른 문제 정답10. reload에서 동일 문제·결과 복구, 추가 XP 없음. 적용/다른 프로젝트 중복 방지는 도메인 검사 |
| P03-W02 / AC-P03 | 반박 가상 관찰→확인→고객1→2와 가설 재검토 필요 동시 표시. Decision 저장→전략2 및 기록 확인 |
| P03-W03 / AC-P04 | Reward 다시 보기, Escape 닫기. 모션감소 설정 후 body.reduce-motion 확인. 연출은 commit 경로와 분리. 변화 이유/단계는 텍스트로 표시 |
| P03-W03 / AC-P06 | 알림 화·목 19:00 미리보기, 실제 미발송 문구. 사용자가 다음 행동/사전 기준 저장, 홈에 반영 |
| P04-W01 오류 | 저장실패 재현→폼 제출 실패→입력 상태 유지→실패 해제→같은 값 재시도 성공. AI 대역 오류 문구 후 모름/다음 질문 가능 |
| P04-W01 근거 | 동일 관찰 재입력은 추가 성장 없음. AI 시뮬레이션 저장은 프로젝트 성장 없음·검증 아님 안내. 다른 가설 간 관찰 합산 금지 검사 추가 |
| P04-W01 반응형 | 1365×960, 390×844 홈 screenshot 확인. 가로 넘침 없음: 각각 document width 1350/375 ≤ viewport. 검사 후 viewport override 해제 |
| P04-W01 리소스 | /, app.mjs, style.css 200. server.mjs, tests, README, docs/STATE 요청404. 정적 소스에서 외부 호출 없음, CSP self. 브라우저 콘솔 오류 로그0 |

수정한 이슈: 퀴즈 개념/변형/결과 복원, 전략 직접 관찰 보상 차단, 다른 영역 가설 필수, 다른 가설 독립 관찰 합산 방지, 저장실패 해제 버튼, 601~820px 소개 줄바꿈, 중복 저장 보상 문구, 성장 연출 재생/막대 애니메이션.

## 중단 복원

현재 요청에서 CP-0005를 읽고 신규 untracked app/style을 확인했다. CP 시점에 없던 파일을 검증 전 scaffold로 취급했고, 문법·정책 테스트·브라우저 진입 뒤 recovery 기록 CP-0006으로 이어갔다. 매 W 완료/착수에서 새 CP를 생성했다. `scripts/verify-checkpoint.mjs`는 STATE/CP revision, 파일 hash, active W 수, CURRENT/HANDOFF 포인터를 검사한다. 실제 모델 변경 실험이나 OS 강제 종료 테스트와 동일한 것으로 주장하지 않는다.

## 미실행·한계

P04-W02 실제 참가자 사용성/H01/H05, P04-W03 연구 이슈 수정/G-P 최종 판단은 미실행이다. 실제 AI·인증·DB·푸시, Android, 다중 탭/기기, NVDA 음성 검증, 28개 전체 성장 예제 검수는 포함하지 않는다. 핵심 화면 기술 QA를 사업성 검증으로 세지 않는다. MVP 차이는 PROTOTYPE-HANDOVER 참조.

서버: 이번 세션 exec session 98998에서 `node prototype/server.mjs` 실행. 재개 시 4173 응답 확인 후 필요할 때만 재시작한다. 외부 배포·commit 없음.

체크포인트 복원 검사: CP-0020 / revision20 / 22개 manifest 파일 / active=P04-W01 / errors=[] 확인. 새 요청에서 같은 명령으로 재현 가능.
