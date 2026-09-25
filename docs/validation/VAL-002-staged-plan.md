# VAL-002 — 단계별 계획·중단 복구 구조 검증

2026-09-23 · planning-v0.2 · CP-0001 / STATE revision 1 · 문서 작업 검증

## 검증 대상과 구분

R15: 프로토타입/MVP/고도화 계획, R16: Phase·토큰 부족·작업 중단 복원. 이번 결과는 문서와 상태 데이터 구조의 검사다. 앱 기능 테스트·실제 사용자 연구·다른 모델 전환·프로세스 강제 종료 실험이 아니다.

## 구조 검사 결과

| 검사 | 상태 | 결과 |
|---|---|---|
| 3개 Stage 계획·14개 Phase·42 초기 W | Pass | 문서 정의 수와 STATE 등록 수 일치, ID 중복 없음 |
| STATE JSON·ID 참조·의존성 순환 없음 | Pass | JSON 파싱, 참조 오류 0, Phase 14개/W 42개 그래프 순환 없음 |
| active 없음·모든 구현 미착수·다음 P01-W01 | Pass | status 전부 not_started, next S1/P01/P01-W01 부모 관계 일치 |
| 내부 문서 링크·CP 경로 | Pass | Markdown 32개·로컬 링크 87개, 끊긴 링크 0, CP 경로 존재 |
| CP target revision·manifest hash | Pass | STATE/CP/manifest revision 1 일치, 대상 14개 파일 hash 불일치 0 |
| 원문 첨부 보존 | Pass | REQUIREMENTS에 기록된 SHA256과 동일 |
| 기존 계획 정합성 | Pass(문서 검토) | PLAN-001 Superseded, SPEC-001 실제 MVP, SPEC-004 가상 프로토타입, 12주 배분 일치 |
| 토큰 부족 시 작은 저장 경계 | Pass(설계 검토) | 수정/검증 경계 CP, 남은 토큰 정확도 가정 없음 |
| 실제 앱 테스트·모델 교체·강제 종료 | Not run | 앱 구현 없음, 프로토콜만 작성 |

## 복구 사례 검토 — 시나리오 점검, 실행 실험 아님

| 중단 상황 | 복구 동작 | 완료로 오인하지 않는 조건 |
|---|---|---|
| 파일 수정 후 테스트 전 | hash/diff 대조, 영향 검사 stale, 다음 최소 검사 | 코드가 있다는 이유로 completed 금지 |
| 테스트 실행 도중 | 프로세스/로그 확인, 결과 불명확이면 unknown/not_run | 성공 출력·대상 revision 없는 passed 금지 |
| CP 작성 후 STATE 전 | 준비 CP와 게시된 CP 구별, 실제 파일과 대조 | CP 번호가 크다고 자동 최신 판정 금지 |
| STATE 게시 후 요약 전 | STATE 참조 CP 기준으로 요약 갱신 | 오래된 CURRENT로 되돌리지 않음 |
| commit 없는 저장소의 untracked 추가 | status·파일 목록·manifest·내용 비교 | tracked git diff만으로 ‘변경 없음’ 판정 금지 |
| 완료 뒤 Spec/정책 변경 | 영향 W/검증 stale, 이전 VAL 보존, rework 기록 | 이전 테스트를 변경 후 통과 증거로 재사용 금지 |
| migration/import/배포 도중 | 외부 실제 상태/job 확인 후 재시도 판단 | 멱등성 확인 없는 중복 실행 금지 |

## 다음 실제 실험

P04-W01에서 프로토타입의 입력 중단 복구와 **개발 작업**의 CP 복원을 각각 검사한다. 다른 모델 테스트를 수행할 때에는 채팅을 보지 않고 현재 Stage/Phase/W·마지막 성공 검사·다음 행동을 복원하게 한다. 실제 관찰 결과는 새 VAL에 기록한다.

## 실행 기록 및 한계

PowerShell로 Markdown 경로·Phase/W 정의·상태 참조·SHA256을 검사했다. 최초 그래프 검사에서 생략한 depends_on을 null로 처리하는 검사식 오류가 발생했으므로 그 결과는 채택하지 않았다. JSON을 다시 읽고 생략값을 빈 배열로 처리하는 깊이 우선 탐색으로 재검사하여 14 Phase/42 W에 순환이 없음을 확인했다. 앱 코드나 STATE 결함이 아닌 검사식의 기본값 처리 오류였다.

git status는 성공했으며 전역 ignore 읽기 권한 경고가 있었다. 앱 파일·commit·배포 결과는 생성하지 않았다. 고정 계획 파일 hash는 변경 탐지용이며 파일 백업 또는 외부 작업 자동 복구 기능은 아니다.
