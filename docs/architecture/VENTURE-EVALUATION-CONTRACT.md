# 부캐 평가 계약 — 설계만

r0.1 · AUTH-017 · 2026-09-27. 이번 승인 범위는 구조·명세이며 평가 코드/점수/그래프 미구현.

본캐 7축 유지. 부캐 후보 ID: problem(문제의 중요성), solution(해결의 효과), market(시장의 가능성), acquisition(고객을 만나는 힘), economics(수익의 지속성), delivery(약속을 지키는 힘).

Task→Evidence/Decision→Assessment→ProjectStat→추천 흐름. 완료 버튼이 스탯에 직접 값을 더하는 API 금지. 읽기 모델과 평가 공급자 분리.

AssessmentInput: projectId, contextRevision, scopeVersion, statId, claimIds, evidenceIds, decisionIds, policyVersion. 원본 참조에는 출처/시점/가설/실제-시뮬레이션 구분 필수.
AssessmentResult: id, 입력 revision, policyVersion, assessor(rule/ai_proposal/human_review), assessedAt, state(unknown/supported/mixed/refuted/stale), depth(hypothesis/observation/behavior/repeated), rationale, usedEvidenceIds, missingInformation, nextActionProposal. 미평가 수치=null. confidence를 사업 성공 확률로 변환하지 않는다.

재평가: 입력 변경 시 기존 결과 이력 보존, 최신 revision과 맞지 않으면 stale. 같은 입력+정책 요청 중복 방지. 승인된 규칙만 계산하며 AI 제안은 확정 결과와 분리. 사용자 근거 수정·판정 검토 경로 마련.

기존 stats 7축은 legacy 정책과 이력 그대로 보존. 6축 단순 환산/덮어쓰기 없음. 그래프는 미확인/평가불가와 낮은 평가를 구별하고 설명 가능한 척도 확정 후 구현.

본캐 연결: 태스크별 competencyIds/assessmentRefs로 실행·회고 평가의 원인을 추적. 본캐 숙련도는 질문 지원 수준에만 영향, 프로젝트 근거를 대체하지 않음. 동일 근거의 순환 보상 금지. 프로젝트 평가와 본캐 평가 결과는 독립.

S1 이번: 계약만. 후속 명세 승인: 한 축의 규칙 정의/검증→제한된 평가 구현. MVP: 서버 평가·권한·입력 revision. 고도화: 업종별 기준/AI 개인화·평가 보정. 미실행을 완료로 승격하지 않음.
