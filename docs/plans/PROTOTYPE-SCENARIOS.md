# P01 시나리오와 데이터 계약

AUTH-003 · SPEC-004 r0.1 · 대표 샘플 TeamUp, 모든 관찰은 가상

| ID | 진입/행동 | 기대 결과 | Screen |
|---|---|---|---|
| SC-01 | 데모 진입→한 문장→6문답→요약 수정→확정→다음 행동 | 가설만 정리, 성공률 없음 | 01~07,13 |
| SC-02 | 학습 오답→설명→새 문제→정답 및 이유→재시도 | 최초 개념 이해 +10, 반복 +0, 부캐 변화 없음 | 08,09,11,12 |
| SC-03 | 가상 현장 관찰과 반박 해석→확인→사용자 결정 | 탐구 이력 성장과 refuted 상태 병기; 합성 반응만으로 현장 단계 없음 | 07,10~13 |
| SC-04 | 인터뷰 타이핑→재로드, 확정 뒤 재로드, 저장 실패 | draft/확정 구별·입력 복원, 실패 시 미저장 안내와 보상 없음 | 03~07 |

추가: 7축 모두 학습 가능, 본캐 다른 프로젝트에도 유지, 화면 축소/키보드/모션 감소, 지연·실패 AI 대역, 알림 설정 미리보기.

Domain: Store(schemaVersion,user,projects,mastery,events,preferences,route). Project(id,name,description,draft,context,revision,scopeVersion,stats,evidence,decisions,nextAction,uiDraft). Evidence(kind=field/simulation,stat,scopeVersion,source,date,method,summary,limitations,interpretation,assessment). GrowthEvent(key,subject,stat,before,after,delta,policyVersion).

Storage port: load/commit, 불일치 schema는 덮어쓰지 않음. commit 실패 시 메모리 Domain과 UI 보상을 확정하지 않음. AI port: deterministic question + error/delay simulation, 네트워크 전송 없음. 시나리오의 field는 가상 관찰이라는 전역 라벨을 유지.

정책: 최초 이해10/적용20 개념당 한 번; 원장 key로 중복 방지. 프로젝트 단계1은 범위/가설/확인방법 확정, 단계2는 적격 관찰, 단계3은 독립 자료와 대안 해석, 단계4는 사전 기준·반복 비교·결정·다음 행동. 범위 변경 시 현재 근거 초기화, 과거 성장 이력 유지.
