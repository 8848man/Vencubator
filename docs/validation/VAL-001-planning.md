# VAL-001 — 기획 산출물 검증

Date: 2026-09-23 · Baseline: planning-v0.1 · 대상: Markdown 기획/SDD 문서 · 앱 코드 없음

## 검사 범위

문서 존재, 상대 링크 해석, 필수 항목, 명세/승인/상태 일관성, 기존 파일 보존. 앱의 실행 품질·AI 응답 품질·사용자 행동 가설은 이 검사로 검증되지 않는다.

## 결과

| 항목 | 상태 | 근거 |
|---|---|---|
| 사용자 지정 8개 섹션 | Pass | PRODUCT-BRIEF §1~8 |
| 원본 영역 비교·최종 6~8 스탯 | Pass | STAT-RESEARCH 26행, SPEC-002 7개 |
| 각 스탯 9개 요구 항목 | Pass | SPEC-002의 이름/의미 통합 행과 나머지 7행 |
| Screen 01~13, 각 8개 필드 | Pass | SPEC-003 |
| Q1~Q11 / 12주 / 검증 가설 | Pass | PRODUCT-BRIEF §6~8 |
| 첨부 §20-1~18 대응 | Pass | TRACEABILITY, ARCHITECTURE, SDD |
| 사용자 승인 허위 기재 없음 | Pass | APPROVALS 및 Spec/ADR 상태 |
| 컨텍스트 복원에 필요한 파일 | Pass(문서 수준) | README→CURRENT→HANDOFF→명세/ADR/승인/백로그 |
| 상대 링크와 파일 개수 | Pass | 신규 Markdown 22개, 로컬 링크 55개, 끊긴 링크 0개 |
| 화면·필드·스탯 개수 | Pass | Screen 제목 13개, 필수 화면 필드 104개(13×8), 고정 스탯 7개 |
| 기존 첨부 해시 보존 | Pass | 최초와 최종 SHA256 동일, REQUIREMENTS의 해시와 일치 |
| 실제 다른 모델 전환 | Not run | 체크리스트만 준비 |
| 앱 Unit/Integration/E2E/AI eval | Not run | 구현 없음 |
| 실제 사용자 H01~H09 | Not run | 연구 계획만 작성 |
| Git commit / 배포 | Not run | 요청 범위는 기획 문서 |

## 파일만으로 복원하는 정답

1. 제품/고객: 아이디어를 발전시키며 배우고 행동하는 코파일럿; 초기 1인 디지털 빌더 가설.
2. 7개 스탯: 고객/시장/제품/고객 확보·판매/수익·재무/실행·운영/전략·학습. 퀴즈는 본캐만.
3. 시뮬레이션은 실제 근거 조건을 충족하지 않음.
4. 기획 완료, 기능 구현·승인·commit·배포 없음.
5. TASK-003, APPROVALS 및 관련 Spec 검토. 구현 지시가 있으면 PLAN-001과 ADR-001.
6. DR-01~05: 대상·성장정책·플랫폼·운영조건·Android 일정.
7. 문서 점검과 기존 앱 일부 UI 관찰 수행. 기능 테스트·사용자 실험·실제 모델 전환은 미실행.

다른 모델로 교체한 뒤 이 질문을 이전 대화 없이 답하게 하여 실제 복원 성공/실패와 빠진 링크를 후속 VAL에 기록한다. 이 문서는 실험을 했다는 증거가 아니다.

## 실행 기록

Windows PowerShell에서 README/AGENTS와 docs의 Markdown을 열거하고 Markdown 상대 링크를 각 문서 디렉터리 기준으로 Test-Path 검사했다. 정규식으로 Screen 제목·8개 요구 필드·ST 스탯 제목을 계수했다. Get-FileHash SHA256으로 첨부 원문을 대조했다. 모든 명령 exit code 0. git status에서 신규 문서와 기존 미추적 파일을 확인했다. Git 전역 ignore 읽기 권한 경고가 있었지만 상태 조회는 성공했다. git log는 저장소에 commit이 없음을 보고했으며 이를 이력 유실로 해석하지 않았다.

문서의 정책·범위·상태 정합성은 작성 후 검토했다. 이 검사는 Markdown의 실제 렌더링이나 앱 테스트를 대신하지 않는다.
