# 실행 백로그

상태 기준: 기획/명세 완료와 기능 구현 완료는 별도다. 의존성의 ‘검토’는 승인이 아니다. planning-v0.2부터 실제 구현의 상태는 [STATE](../execution/STATE.json)가 권위다. 아래 TASK는 기획/요구 추적용 상위 묶음이며 W와 완료 개수를 합산하지 않는다.

| ID | 작업 | 현재 상태 | 의존성 | 완료 근거/예정 검증 |
|---|---|---|---|---|
| TASK-001 | 실제 제품 및 스탯 조사 | Done | AUTH-001 | research 두 문서, 관찰 한계 명시 |
| TASK-002 | 제품·스탯·UX·기술·SDD 기획 | Done | TASK-001 | planning-v0.1, VAL-001 문서 검사 |
| TASK-003 | 사용자 기획 피드백 반영과 Spec/ADR 범위 확정 | Ready for review | TASK-002 | APPROVALS에 수락/수정 근거 기록 |
| TASK-004 | 문제 인터뷰·용어·스탯 오해 테스트 | Planned | 모집 동의·대상 결정 | H01/H05 결과, 사용성 관찰 |
| TASK-005 | 플랫폼 기술 검증 및 ADR 확정 | Not started | 구현 요청·DR-03, M01 | Web/Android 인증/입력/푸시/비용 결과 |
| TASK-006 | 계정·프로젝트·인터뷰·Context 수직 구현 | Not started | 승인 Spec/ADR, M01~M02 | AC-F01~04, F09~10 |
| TASK-007 | 근거·결정·이중 성장 구현 | Not started | TASK-006, SPEC-002 승인 | AC-G01~08, AC-F05~08 |
| TASK-008 | 21개 개념·42개 문항 및 적용 rubric 검수 | Not started | 7축·콘텐츠 책임자 | 정답/근거/재검사·편향 검수 |
| TASK-009 | 추천·알림·접근성·Android 테스트 | Not started | TASK-007~008 | AC-U02~06, 실기기 |
| TASK-010 | 4주 파일럿·가설 판단·베타 | Not started | TASK-009, DR-04 | H02~H09 결과, 릴리스 게이트 |
| TASK-011 | 3단계·14 Phase·체크포인트 설계 | Done | AUTH-002 | planning-v0.2, VAL-002 |
| TASK-012 | 프로토타입 구현 및 사용자 이해 검증 | Not started | SPEC-004 범위 구현 요청 | P01~P04, G-P |

다음은 사용자 후속 요청 범위에 맞는 검토/구현이다. 구현 시작의 첫 작업은 S1/P01/P01-W01이다. 계획 목록만으로 앱 구현·모집 연락·공개 배포를 시작하지 않는다.

기존 TASK 매핑: TASK-004→P04, TASK-005→M01, TASK-006→M01~M02, TASK-007/008→M03, TASK-009→M04~M05, TASK-010→M06. 고도화 E01~E04는 결과 기반 후보이며 현재 제품 약속을 자동 확대하지 않는다.
