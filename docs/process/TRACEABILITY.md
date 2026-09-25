# 요구 → 명세 → 검증 추적

| 요구 | 권위/관련 문서 | 수용/검증 연결 | 상태 |
|---|---|---|---|
| R01 철학·사용자 결정 | PRODUCT-BRIEF §1, ADR-002 | AC-F03, F07 | 기획됨 |
| R02 기존 제품 | PRODUCT-OBSERVATIONS | 실제 관찰 경로·한계 | 확인 범위 완료 |
| R03 폭넓은 조사 | STAT-RESEARCH | 10개 자료·26행 통합 | 조사 완료 |
| R04 6~8 스탯 | SPEC-002 §1~2 | AC-G08 | 7개 설계, 정책 테스트 미실행 |
| R05 이중 성장 | SPEC-002 §3~4 | AC-G02~05, F05 | 설계 |
| R06 대화 Context | SPEC-001, SPEC-003 03~05 | AC-F03~04, U04 | 설계 |
| R07 시각 보상 | SPEC-003 06/11/12 | AC-G07, U05 | 설계 |
| R08 13개 화면 | SPEC-003 | AC-U01~06 | 문서 정의 완료 |
| R09 알림·추천 | PRODUCT-BRIEF §5, ARCHITECTURE §5 | AC-U06, H07 | 설계 |
| R10 MVP·Q1~11 | PRODUCT-BRIEF §6~8 | H01~09 | 검증 계획 |
| R11 Web/Android | ADR-001, ARCHITECTURE §1/7 | AC-F09, TASK-005 | 기술 제안 |
| R12 Domain/AI | ARCHITECTURE §2~4, ADR-002 | AC-F01/03/10, G01/03 | 설계 |
| R13 운영·테스트 | ARCHITECTURE §6~8 | 회귀/CI/릴리스 게이트 | 계획, 미실행 |
| R14 SDD·모델 지속 | AGENTS, SDD, CURRENT/HANDOFF | VAL-001 복원 질문 | 파일 구조 구축 |
| R15 3단계 구현 | IMPLEMENTATION-ROADMAP, Stage 계획 3개, SPEC-004 | G-P/G-M/G-E, AC-P01~06 | 순서 사용자 지정·세부 계획 작성 |
| R16 Phase·중단 복원 | STATE, CHECKPOINT-PROTOCOL, CP-0001 | VAL-002 파일/ID/hash·복구 사례 점검 | 구조 작성, 실제 중단 실험 미실행 |

첨부 대응: §20-1~3 → ARCHITECTURE §1; §20-4~5 → §2~4; §20-6~7 → §6~7; §20-8~12 → §7; §20-13 → §8; §20-14~17 → SDD·APPROVALS·ADR·PLAN; §20-18 → MVP·ADR 대안/복잡도 선택.

가설→이벤트: H02=context_confirmed+next_action_selected; H03/H04=evidence_recorded+decision_committed+next_action_selected; H05=사용성 인터뷰; H06=learning_attempt_completed+지연 적용 평가; H07=실험 배정+notification_opened+실제 행동; H08=두 번째 프로젝트 적용 평가; H01/H09=사용자 조사. 단일 이벤트만으로 가설 통과를 판단하지 않는다.

## AUTH-004 / 학습 중심 개정

R17: 선택 부담을 줄이고 게임처럼 학습하기를 중심으로 전환. SPEC-005 AC-L01~06 → P05-W01~03 → prototype/guided.mjs, guided-ui.mjs, guided.css → tests/guided.test.mjs 및 VAL-004. 이전 화면흐름은 SPEC-005 대체 규칙 참조.
# 모션 추적 추가 (AUTH-008)

R18 → SPEC-008 r0.1 AC-M01~05 → P06-W01/W02 → prototype/motion.mjs·motion.css·app.mjs → motion.test.mjs / VAL-005-motion.md.
