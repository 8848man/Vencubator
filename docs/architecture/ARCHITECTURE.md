# 기술·데이터·운영 설계

Revision 0.1 · Proposed · 제품 구현 없음 · [첨부 원칙](../../output/vencubator_develop_principle.md) §20-1~20-18 대응

## 1. 플랫폼 및 아키텍처

우선 제안: **TypeScript 기반 React Web + Capacitor Android + 관리형 PostgreSQL/Auth + 서버 API**. 구체 공급자 후보는 Supabase, 푸시는 FCM이다. 팀 숙련도와 1주 기술 검증으로 [ADR-001](../adr/ADR-001-platform.md)을 확정한다. 공급자를 이미 연결·설치한 상태가 아니다.

[Capacitor](https://capacitorjs.com/docs)는 웹 UI를 네이티브 컨테이너에서 사용하고 플랫폼 기능을 플러그인으로 연결하는 방식을 제공한다. [Flutter](https://docs.flutter.dev/platform-integration/web/faq)도 앱 중심 웹 경험을 지원하므로 대안으로 검토했다. 이 제품은 대화·폼·문서 확인이 중심이고 데스크톱 웹 우선이라는 이유로 웹 재사용 안을 우선 제안한다.

| 평가 기준 | Web+Capacitor | Flutter Web+Android | Web+별도 Android |
|---|---|---|---|
| 소규모 유지 | 웹 기술 숙련 가정에서 유리 | Dart 숙련 팀에 유리 | UI 두 벌 유지 부담 |
| 경험 공유 | UI/도메인 공유, 네이티브 인증·푸시는 별도 확인 | UI 공유와 연출 일관성 | 각 플랫폼 최적화, 일관성 관리 필요 |
| AI 교체·테스트 | 서버 포트로 동일하게 가능 | 서버 포트로 동일하게 가능 | 서버는 공유 가능 |
| 배포 | 웹 빌드+Android 패키지 두 경로 | 웹+Android 빌드 경로 | 파이프라인 두 세트 |
| 초기 비용 | 서버·DB·AI 비용과 관리 노력 중심 | 동일, 팀 학습 비용 차이 | 구현/회귀 인력 비용 증가 |
| 주요 검증 | Android 키보드, 딥링크, WebView 성능·접근성 | 데스크톱 텍스트·웹 접근성·번들 | 유지보수 시간 |

비용은 가격표 숫자를 고정하지 않는다. 월 비용 = 인증/DB·저장·트래픽 + 생성 요청×평균 토큰/단가 + 푸시·오류 관찰 비용 + 운영 인력. 초기 트래픽 100명/1,000명 시나리오의 요청량·한도를 기술 검증에서 측정한다. 예산은 미확정이며 유료 계약을 임의 체결하지 않는다.

의존성: Presentation → Application → Domain. Infrastructure는 Domain/Application에 선언한 포트를 구현하고 조립 지점에서 주입한다. Domain이 특정 DB·AI SDK를 import하지 않는다. 논리적 계층이며 초기부터 별도 마이크로서비스로 나누지 않는다.

계획 디렉터리(미생성): `src/app`, `src/features/{authentication,projects,interview,growth,learning,evidence,notifications}`, `src/domain/{project,context,growth,learning}`, `src/application`, `src/infrastructure/{api,db,ai,analytics,push}`, `src/shared`. 공유 Domain 정책은 서버에서 최종 판정한다. 클라이언트 미리보기는 권위 데이터가 아니다.

## 2. 핵심 데이터와 Source of Truth

[권위 분리 ADR](../adr/ADR-002-authority.md)에 따라 관계형 영속 저장소가 확인된 정보의 원본이다. 전체 이벤트 소싱을 도입하지 않고 중요한 변경 revision 및 보상 원장만 유지한다.

| Entity | 키·핵심 필드 | 관계·권위 |
|---|---|---|
| User | id, locale, timezone, displayName | 인증 주체, 본캐 소유자 |
| Project | id, ownerId, name, lifecycle, createdAt | User 1:N, 삭제/보류 상태 |
| BusinessContext | projectId, revision, schemaVersion, confirmedBy/At, 필드별 값·claimIds | 사용자 확정 snapshot. 프로젝트당 현재 revision 하나 |
| Claim | id, projectId, scopeVersion, type, statement, status, evidenceLinks | 가설/주장 단위. 사용자 확인과 외부 지지는 별개 |
| InterviewSession / AIDraft | projectId, messages, inputRevision, generatedPatch, provider/model/prompt/schemaVersion | 미확정 제안. Context와 분리 |
| ProjectQuestion / ProjectAnswer | id, targetClaim, questionVersion, answerType, actionId | 구조화/실제 관찰/시뮬레이션 구분 |
| Evidence | id, ownerId, projectId, kind, sourceRef, observedAt, method, scope, summary, limitations, reviewState | Claim N:M. 사람·조사자료·실사용·거래·simulation 등 출처 |
| Decision | id, projectId, claimIds, evidenceIds, options, chosen, rationale, decidedBy/At | 최종 사용자 결정. AI 제안은 별도 draft |
| ProjectStat | projectId, statId, highestMilestone, currentScope, currentEvidenceState, computedAt, policyVersion | Context·Evidence·Decision·원장에서 재생성 가능한 projection |
| LearningQuestion | id, conceptId, statId, contentVersion, sourceRefs, rubric, approvedAt | 검수 콘텐츠가 채점 기준 |
| LearningAttempt | userId, questionId/version, answer, outcome, assessedAt | 본캐 산정 입력; 원문 접근 제한 |
| UserStat / ConceptMastery | userId, statId/conceptId, masteryState, xp, lastCheckedAt, policyVersion | 학습 시도·GrowthEvent의 projection, Project와 독립 |
| GrowthEvent | 고유 키, 원인, 대상, 전후, 정책 revision, 정정 참조 | 보상 중복 방지 원장; 민감한 원문 저장 금지 |
| NextAction | id, projectId, contextRevision, claimId, reason, completionCriteria, status, dueAt | 사용자 선택 후 활성화 |
| Notification | id, userId, actionId, scheduledAt, timezone, consentVersion, state, deliveryKey | 계획/전송 시도/수신 가능 여부/열기 구분 |

BusinessContext 필드에는 이름·문제·고객·상황·해결책·핵심가치·경쟁대안·수익모델·현재단계·가설·근거 있는 주장·모르는 것·중요문제가 포함된다. 단순히 사용자가 확인한 문장을 `fact`로 바꾸지 않는다. `origin=user/ai/import`와 `epistemicStatus=unknown/hypothesis/supported/refuted/mixed/stale`는 독립 필드다. 지지/반박 판단의 주체·근거·대상 범위를 보관한다.

AI 시뮬레이션은 실제 Evidence와 같은 테이블에 출처 구분으로 보관 가능하지만 실제 관찰 수·검증 성장 조건에서 강제로 제외한다. 사용자가 타입을 실제로 바꾸려면 독립적인 실제 출처·관찰을 새로 등록해야 한다.

## 3. 유스케이스/API 계약 초안

엔드포인트는 기술 선택 뒤 최종화한다. 아래는 구현 가능한 의미 계약이며 API 서버가 인증 주체에서 ownerId를 결정한다.

| 작업 | 요청 | 성공 결과 | 핵심 실패 |
|---|---|---|---|
| CreateProject | 설명·가칭, idempotencyKey | projectId, draft 상태 | 422 입력, 429 한도 |
| SubmitInterviewAnswer | sessionId, expectedRevision, 답변, requestKey | 저장 답변, 다음 질문/정적 대체 | 409 revision, 503 AI 지연 |
| ProposeContext | projectId, 입력 revision | AIDraft, field provenance | 422 schema 불일치 |
| ConfirmContext | draftId, expectedRevision, 사용자 수정 patch, key | 새 revision, 변경 요약, growthEvents | 409 충돌, 403/404 접근 |
| SubmitLearningAttempt | questionId/version, 답변·이유, key | 판정·피드백·숙달·growthEvents | 구버전 문항 재평가 안내 |
| CommitProjectAction | actionId, expectedRevision, Evidence·해석·선택적 Decision, key | 새 Context/근거/원장 원자적 저장 | 422 근거 미충족, 409, 503 DB |
| ChooseNextAction | 추천 ID 또는 수정 내용, revision | 사용자 확정 NextAction | 오래된 추천 재검토 |
| UpdateNotificationPreference | 동의·시각·timezone | 설정 revision | 기기 권한 거부, 토큰 만료 |
| GetProject / GetUserLearning | 소유권 검증된 ID | 현재 snapshot+revision | 접근 불가/삭제됨 |

Read API도 매번 소유권을 검증한다. DB에서는 [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)를 방어 계층으로 사용하되 서버 서비스 권한 우회 경로는 별도 검증한다. 클라이언트의 ownerId·xp·검증 상태를 신뢰하지 않는다.

중복 키는 user+operation 범위의 unique 제약. 동일 키 다른 내용은 409. Context, 관련 산출물, GrowthEvent는 한 DB 트랜잭션으로 기록한다. Analytics·Notification enqueue는 transactional outbox로 후속 처리하고 재시도 시 eventId로 중복 제거한다. 공급자에게 정확히 한 번 전달된다고 가정하지 않는다.

## 4. AI 구조와 실패 대응

Application → Interview/Structuring/Explanation/Recommendation 포트 → 공급자 어댑터. MVP 실제 공급자 1개, fake 어댑터 1개로 계약 테스트. 여러 공급자 실연동은 나중에 한다.

입력에는 필요한 Context revision·확인된 근거 요약·허용 질문 범위를 명시한다. 출력은 정해진 schema와 출처 참조, unknown 필드를 요구한다. schema 검사 → 기존 값과 diff → 사용자 확인 → commit 순서다. AI confidence 숫자를 사업 확률로 표시하지 않는다.

AI는 근거를 발명하거나 Decision을 확정하거나 점수를 계산하지 않는다. 웹/첨부/인터뷰 본문 속 지시문은 데이터로 취급한다. 새 사업 사실을 원문 참조 없이 확정하지 못하게 한다. 오래된 revision의 응답은 보류한다.

타임아웃 초기 제안 20초, 재시도 최대 1회(동일 논리 요청), 이후 수동 질문으로 전환. 요청당 토큰·계정별 생성 한도와 경고 기준은 관측 비용으로 조정한다. 모델·프롬프트·schema revision을 기록하되 비밀키와 인터뷰 원문을 일반 로그에 쓰지 않는다.

평가셋 최소 30개: 모호한 아이디어, 모름, 상충 정보, 음성 아닌 텍스트 오류, 가짜 근거, 삽입 지시문, 늦은 응답, 공급자 오류. schema 준수·사실 미발명·한 질문·수정 보존을 검사한다. 미실행 상태다.

## 5. 추천·알림·오프라인

추천 규칙: 접근 권한/단계/선행조건으로 후보 필터 → 진행 중 행동 우선 → 현재 결정에 큰 영향을 주는 미확인 가설 → 가능한 시간 안의 행동 → 후보 없으면 정적 고객 질문. 동점일 때 고객 문제 가설을 우선하되 사용자가 이유를 보고 바꿀 수 있다. 정밀 점수식은 초기 학습 데이터 없이 만들지 않는다.

알림: 서버 예약 → 발송 직전 동의/프로젝트/행동 상태 재검사 → 기기별 [FCM](https://firebase.google.com/docs/cloud-messaging) → 검증된 앱 링크 → 인증 확인 후 원래 과제 복귀. 토큰 만료는 폐기하고 계정 로그아웃 시 기기 연결 해제. 중복 발송 키, 현지 시각/서머타임, 보류, 취소, OS 거부를 처리한다. 발송 성공 응답은 사용자가 읽었다는 뜻이 아니다.

MVP 오프라인: 저장된 읽기 화면과 입력 초안만. 성장 확정·Decision commit은 온라인 필요. 여러 기기 수정은 expectedRevision 충돌을 사용자에게 보여주며 마지막 저장으로 덮어쓰지 않는다.

## 6. Analytics와 실험

공통 envelope: eventId, schemaVersion, pseudonymousUserId, projectId(optional), sessionId, occurredAt, receivedAt, platform, appVersion, contextRevision(optional), experimentId(optional).

| Event | 발생 시점·권위 | 가설 연결 |
|---|---|---|
| project_created | 서버 생성 성공 | H02 |
| interview_started/completed | 첫 답/요약 준비 | 온보딩 이탈 |
| context_confirmed | 사용자 확인 commit | H02 |
| learning_attempt_completed / feedback_viewed | 채점 성공 / UI 열람 | H06; 열람≠숙달 |
| evidence_recorded | 서버 근거 저장, 실제/합성 enum | H03/H04 |
| decision_committed | 근거 참조한 사용자 결정 | 핵심 지표 |
| growth_committed / mastery_updated | 서버 정책 산정 | 무결성·H05/H08 |
| reward_presented | UI에 표시 | 보상 이해·실패 추적 |
| next_action_selected/started/completed | 각 상태 전이 | 행동 퍼널 |
| notification_sent/opened | 발송 시도 성공 / 딥링크 열기 | H07 |
| project_revisited / second_project_created | 의미 있는 재방문 / 2번째 생성 | H04/H08 |

실제 결정 루프 완료는 서버의 Evidence.kind, Decision.evidenceIds, NextAction 연결을 조인해 산출한다. UI 이벤트만으로 사업 발전을 세지 않는다. 프로젝트 이름·답변·고객 연락처·원문은 analytics payload에 포함하지 않는다. `subscription_started`는 결제 범위 제외로 수집하지 않는다. `project_completed`는 사업 완성을 오해하게 하므로 대신 action/experiment 완료를 쓴다.

## 7. 테스트와 릴리스

| 계층 | 검사 |
|---|---|
| Unit | 7축 단계 경계, XP 중복, 문제 채점, Context transformation, 추천 적격성/보류 |
| Integration | 인증→소유권, 인터뷰→확정, 근거/답변→원장 원자성, 동시 revision 충돌, outbox 재시도, 딥링크 소유권 |
| Contract / AI eval | 공급자 schema, fake/live 동일 계약, AI 미확정 보존, 근거 발명 방지 |
| E2E Web | 로그인→생성→인터뷰→확정→부캐→질문→변화→다음 행동, 중단/복구 |
| E2E Android | 동일 핵심 루프 + 실제 인증 복귀·푸시·뒤로가기·키보드·재시도 |
| 회귀·접근성 | 프로젝트 간 데이터 격리, 기존 XP 정책, 모션 감소, 초점, 확대, 삭제/정정 |

Web 환경: Local → Development → PR Preview → Production. production 실제 데이터는 Preview에 복제하지 않는다. 병합/배포 게이트: lint, typecheck, 정책 unit, integration, build, 주요 E2E, migration 검사. 초기에 pipeline 설정만으로 통과라고 간주하지 않고 실행 결과 링크를 기록한다.

Android: Development → Internal Testing → Closed Testing → Production. versionName은 제품 SemVer, versionCode는 단조 증가. AAB, 서명, changelog, release notes, commit/spec revision, 기기 검증 결과를 release 기록에 남긴다. 스토어 정책과 target SDK 요구는 출시 시 공식 문서로 재확인한다. 12주 출구 조건은 테스트 배포이며 공개 승인을 보장하지 않는다.

Secret은 개발자 로컬 비추적 환경 파일·CI secret store·서버 secret에만 둔다. `.env.example`에는 키 이름만. AI key, DB 관리자 키, OAuth secret, 푸시 서비스 자격, Android signing 정보는 Web/앱 번들에 넣지 않는다. Production 자격은 Preview와 분리한다.

버전: app SemVer, API contract version, Context schemaVersion, statPolicyVersion, questionContentVersion, AI prompt/schema version은 독립. 서버는 배포 중인 이전 Android 클라이언트를 지원하는 확장 변경을 우선한다.

Migration: expand → 신규/구 데이터 읽기 검증 → 배치 backfill과 수량 검증 → 새 쓰기 전환 → 구 앱 사용량 확인 후 contract. 백업 복원 연습을 수행하고 데이터 파괴적 down migration을 롤백 전략으로 삼지 않는다. 잘못된 배포는 앱 롤백+호환 schema 유지, 원장 정정은 명시적 correction. 스탯 정책 변경은 이전 원장 보존·재산정 preview·설명 가능 diff가 필요하다.

## 8. 관찰성·보안·운영 한계

requestId로 사용자 화면 오류→API→DB/AI/푸시를 연결한다. auth/api/db/ai/notification 실패율, p95 응답시간, 중복 보상 발생(0 목표), 원장 불일치(0 목표), 온보딩 퍼널, AI 호출비를 본다. 에러율·지연 경고 임계치는 베타 기준선을 보고 정하며 현재 SLO 달성을 주장하지 않는다.

계정·프로젝트 삭제는 접근 즉시 차단→개인정보 및 관련 저장 데이터 삭제 작업→파생 스탯 재산정으로 처리한다. 분석 ID 분리, 보존 기간·삭제 완료 기간·백업 잔존 정책은 배포 전 DR-04에서 확정한다. 인터뷰 참여자 연락처는 기본 수집하지 않는다. 교육 콘텐츠의 법률·세무 정보는 관할·기준일·공식 출처를 갖춘 별도 검수가 필요하다.

검증 완료 전 운영 릴리스 금지 조건: 사용자 간 접근 성공, 보상 이중 지급, 확인 전 AI 초안 자동 확정, 실제/합성 근거 혼동, 삭제 처리 실패. 이 문서는 설계이며 현재 어떤 보안·테스트·배포 검증도 앱 수준에서 수행되지 않았다.

## S1 학습 경로 확장 — AUTH-004

SPEC-005 적용. Project에 선택 필드 learningRuns(scopeVersion:concept 키), learningArtifacts(사용자 확정 준비물), fieldTasks(진행 과제 최대1)를 추가한다. 기존 schemaVersion1 데이터는 유지하며 필드는 사용 시 초기화한다. 숙달은 기존 사용자 mastery를 재사용하고 실행근거는 taskId로 연결한다. 준비물 확정과 Evidence 저장은 다른 명령이다. 새 프로젝트의 첫 적용은 최소 Context를 사용자 확인 후 생성하고 학습 범위 키를 새 scopeVersion으로 이동한다. 기존 확정 Context는 덮어쓰지 않는다. 서버용 schema/권한 설계는 S2에서 별도로 한다.

## AUTH-017 태스크/평가 계약
ADR-005와 SPEC-013이 프로토타입 태스크 연결의 권위. 부캐 미래 계약은 VENTURE-EVALUATION-CONTRACT.md(설계만).
