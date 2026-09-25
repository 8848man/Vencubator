# 20. 지속 가능한 개발을 위한 기술 및 운영 명세

Vencubator는 단순한 프로토타입이 아니라 웹과 Android 앱으로 지속적으로 개발하고 배포할 제품을 목표로 한다.

따라서 제품 UX를 설계하는 동시에 이후 기능 추가와 유지보수가 가능한 기술 구조와 배포 체계를 함께 설계한다.

단, 이 단계에서는 실제 구현 코드를 작성하지 않는다.

---

## 20-1. 플랫폼 전략

Vencubator는 다음 두 플랫폼을 지원한다.

### Web

* 데스크톱 우선
* 모바일 Web 대응
* 최신 Chrome / Edge / Safari 기준
* 반응형 UI
* 동일한 계정과 프로젝트 데이터를 사용

### Android

* Android 앱 출시
* Web과 동일한 사용자 계정 및 Backend 사용
* Notification을 핵심 재방문 수단으로 활용
* Android 고유 기능은 필요한 경우에만 Native 기능으로 분리

Web과 Android에서 동일한 제품 경험과 데이터 모델을 유지할 수 있도록 설계한다.

---

## 20-2. 기술 아키텍처

다음 영역을 분리하여 설계한다.

```text
Presentation
    ↓
Application / Use Case
    ↓
Domain
    ↓
Infrastructure
    ↓
Backend / External Services
```

기술 스택을 제안할 때는 단순히 인기 있는 기술을 선택하지 말고 다음 기준으로 평가한다.

* 1인 또는 소규모 팀에서 유지 가능한가?
* Web + Android를 동시에 개발하기 쉬운가?
* AI 기능을 쉽게 교체할 수 있는가?
* 테스트하기 쉬운가?
* 배포 자동화가 가능한가?
* 비용이 초기 단계에서 감당 가능한가?
* 향후 사용자 증가에 대응할 수 있는가?

---

## 20-3. 코드 구조

코드 구조는 기능 중심으로 확장 가능해야 한다.

예시:

```text
src/
├─ app/
├─ features/
│  ├─ authentication/
│  ├─ projects/
│  ├─ ai-interview/
│  ├─ character/
│  ├─ learning/
│  ├─ notifications/
│  └─ dashboard/
│
├─ domain/
│  ├─ project/
│  ├─ business-context/
│  ├─ stats/
│  ├─ learning/
│  └─ user/
│
├─ infrastructure/
│  ├─ api/
│  ├─ database/
│  ├─ ai/
│  ├─ analytics/
│  └─ notifications/
│
└─ shared/
```

단, 실제 프로젝트의 기술 스택에 따라 구조를 조정한다.

기능 하나를 추가할 때 기존 기능을 과도하게 수정하지 않아도 되도록 설계한다.

---

## 20-4. 핵심 Domain Model

Vencubator의 핵심 데이터는 다음과 같이 분리한다.

### User

사용자 계정 및 본캐 정보

### Project

사용자가 만든 하나의 창업 아이디어

### BusinessContext

프로젝트에 축적되는 사업 정보

### ProjectStat

특정 프로젝트의 부캐 성장 상태

### UserStat

사용자의 창업 지식/역량 성장 상태

### LearningQuestion

창업 지식 질문

### ProjectQuestion

프로젝트를 구체화하기 위한 질문

### Evidence

프로젝트의 주장이나 가설을 뒷받침하는 근거

### Decision

사용자가 프로젝트에서 내린 결정

### Notification

사용자에게 재방문을 유도하는 알림

이 데이터들의 관계와 Source of Truth를 명확히 정의한다.

특히 AI가 생성한 결과와 사용자가 확정한 정보를 구분한다.

---

## 20-5. AI Architecture

AI Provider에 종속되지 않는 구조를 우선한다.

예:

```text
Application
    ↓
AI Service Interface
    ↓
Provider Adapter
    ├─ OpenAI
    ├─ Gemini
    └─ Other Provider
```

AI가 생성한 결과를 그대로 Source of Truth로 취급하지 않는다.

AI는 다음 역할을 수행할 수 있다.

* 질문 생성
* 정보 구조화
* 요약
* 설명
* 피드백
* 다음 행동 제안

하지만 중요한 사업 정보는 사용자의 확인/행동/검증을 통해 Context에 반영한다.

---

## 20-6. Analytics

Vencubator의 핵심 행동을 Event로 정의한다.

예:

```text
project_created
ai_interview_started
ai_interview_completed
business_context_updated
project_question_answered
learning_question_answered
learning_feedback_viewed
project_stat_increased
user_stat_increased
notification_opened
next_action_started
project_completed
project_revisited
second_project_created
subscription_started
```

Analytics 설계는 UI 구현과 분리한다.

핵심 제품 가설을 검증할 수 있는 Event만 우선적으로 수집한다.

---

# 20-7. 테스트 전략

최소한 다음 계층의 테스트 전략을 정의한다.

### Unit Test

* Stat calculation
* XP calculation
* Question scoring
* Business Context transformation
* Next Action selection

### Integration Test

* Project creation
* AI interview → Context 저장
* Question → Answer → Stat update
* Notification → Deep Link
* Authentication → Project access

### E2E Test

핵심 사용자 흐름을 검증한다.

```text
회원가입
→ 프로젝트 생성
→ AI 인터뷰
→ 프로젝트 생성 완료
→ 부캐 생성
→ 질문 답변
→ 스탯 상승
→ 다음 행동 확인
```

Web과 Android의 핵심 플로우가 모두 정상적으로 동작하는지 검증한다.

---

# 20-8. Web 배포 파이프라인

Web은 다음과 같은 환경을 구분한다.

```text
Local
 ↓
Development
 ↓
Preview
 ↓
Production
```

Pull Request 생성 시 자동 Preview 배포를 고려한다.

Production 배포 전 다음을 자동 검증한다.

* lint
* type check
* unit test
* integration test
* build
* 주요 E2E test

Production 배포 이후에는 다음을 확인할 수 있어야 한다.

* 배포 성공 여부
* runtime error
* API error
* 주요 사용자 흐름 오류

---

# 20-9. Android 배포 파이프라인

Android는 다음 환경을 고려한다.

```text
Development
 ↓
Internal Testing
 ↓
Closed Testing
 ↓
Production
```

Release에는 반드시 다음 정보가 포함되어야 한다.

* version name
* version code
* changelog
* build artifact
* release notes

가능하면 Android 빌드와 배포를 CI/CD로 자동화한다.

Google Play의 Internal Testing을 이용하여 Production 배포 전에 실제 기기에서 검증한다.

---

# 20-10. 환경 변수와 Secret 관리

다음 정보는 코드에 직접 저장하지 않는다.

* API Key
* AI Provider Key
* Database credentials
* OAuth Secret
* Firebase credentials
* signing credentials
* deployment secrets

환경별로 분리한다.

```text
.env.local
.env.development
.env.production
```

단, 실제 Secret은 Git에 commit하지 않는다.

---

# 20-11. Versioning

Web과 Android가 서로 다른 배포 주기를 가질 수 있으므로 versioning 전략을 정의한다.

예:

```text
Major.Minor.Patch
```

Android는 추가적으로 Google Play용 version code를 관리한다.

Breaking Change가 발생하는 경우 migration 전략을 함께 정의한다.

---

# 20-12. Database Migration

Database schema를 변경할 때 기존 사용자의 데이터를 손상시키지 않아야 한다.

모든 schema 변경은 migration으로 관리한다.

다음 변경은 특히 migration 전략을 요구한다.

* UserStat 변경
* ProjectStat 변경
* BusinessContext 구조 변경
* LearningQuestion 구조 변경
* AI response schema 변경

---

# 20-13. Observability

Production에서는 최소한 다음을 관찰할 수 있어야 한다.

* application error
* API failure
* AI failure
* notification failure
* authentication failure
* database failure
* 주요 사용자 행동 funnel

문제가 발생했을 때

> "사용자에게 어떤 문제가 발생했는가?"

를 추적할 수 있어야 한다.

---

20-14. SDD 개발 방법론

Vencubator의 기능 개발은 Specification Driven Development(SDD)를 따른다.

기본 개발 흐름:

Requirement
↓
Spec
↓
Review Gate
↓
Plan
↓
Implementation
↓
Validation
↓
Commit
↓
Release

AI Coding Agent는 Spec이 승인되기 전에는 기능 구현을 시작하지 않는다.

각 Spec은 다음을 명확하게 정의한다.

- Intent
- Scope
- Non-goals
- User Flow
- Functional Requirements
- Data Requirements
- UI/UX Requirements
- API Requirements
- Error Cases
- Analytics Events
- Acceptance Criteria
- Validation Method

Spec은 구현 방법 자체보다
"무엇을 만들어야 하고 어떤 상태를 만족해야 하는가"를 정의한다.

구현 방법에 대한 중요한 기술적 결정은 ADR로 분리한다.

---

20-15. ADR 관리

ADR(Architecture Decision Record)은
Vencubator의 중요한 기술적 의사결정을 기록한다.

Spec은 "무엇을 만들어야 하는가"를 정의하고,
ADR은 "왜 이 기술적 결정을 선택했는가"를 기록한다.

ADR이 필요한 대표적인 경우:

- Web + Android 플랫폼 전략
- Flutter / React / 기타 프레임워크 선택
- Backend 선택
- Database 선택
- Authentication 방식
- AI Provider abstraction
- Notification architecture
- Analytics architecture
- 상태 관리 방식
- Offline strategy
- File / asset storage
- CI/CD 방식
- Release strategy
- 보안 관련 구조
- 대규모 데이터 migration

ADR 형식:

# ADR-XXXX — Decision Title

## Status
Proposed / Accepted / Deprecated / Superseded

## Context
왜 이 결정이 필요한가?

## Decision
무엇을 선택했는가?

## Alternatives
검토한 다른 선택지는 무엇인가?

## Consequences
이 선택으로 얻는 것과 잃는 것은 무엇인가?

## Related Specs
관련 Spec

---

20-16. AI Coding Agent 규칙

Vencubator는 AI Coding Agent를 주요 개발 도구로 사용한다.

따라서 AI Agent가 임의로 제품 요구사항이나 아키텍처를 변경하지 못하도록 한다.

기본 원칙:

1. Spec 없는 기능 구현 금지
2. 승인되지 않은 요구사항 추가 금지
3. 기존 API / 데이터 구조 변경 시 영향도 분석
4. Architecture 변경 시 ADR 작성
5. Spec 범위를 벗어난 리팩터링 금지
6. 테스트 없이 완료 처리 금지
7. Validation 결과를 기록
8. 기존 동작을 변경하는 경우 Regression 검증
9. 불확실한 요구사항은 임의로 결정하지 않고 질문 또는 Decision Request 생성
10. 구현 중 발견한 구조적 문제는 즉시 임의 수정하지 않고 적절한 Spec/ADR 변경 여부를 판단

AI Agent의 기본 실행 단위:

```text
Read Context
↓
Read Spec
↓
Read Related ADR
↓
Analyze Existing Code
↓
Plan
↓
Implement
↓
Test
↓
Validate
↓
Report

---

# 20-17. Git 및 개발 Workflow

기능 개발은 다음 흐름을 따른다.

```text
Issue
 ↓
Spec
 ↓
Plan
 ↓
Implementation
 ↓
Test
 ↓
Review
 ↓
Commit
 ↓
Preview
 ↓
Production
```

제품 요구사항과 기술 구현 결정을 분리한다.

제품 요구사항이 변경되면 관련 Spec을 먼저 변경하고 구현한다.

AI Coding Agent를 사용할 경우에도

> Spec 없는 구현을 허용하지 않는다.

는 원칙을 유지한다.

---

# 20-18. 지속 가능한 개발의 우선순위

기술적으로 복잡한 구조를 만드는 것이 목표가 아니다.

우선순위는 다음과 같다.

1. 빠르게 검증할 수 있는가?
2. 기존 기능을 깨뜨리지 않고 수정할 수 있는가?
3. Web과 Android를 지속적으로 배포할 수 있는가?
4. 데이터가 안전하게 유지되는가?
5. AI Provider를 교체할 수 있는가?
6. 사용자 행동을 측정할 수 있는가?
7. 팀이 커져도 코드 구조를 이해할 수 있는가?

MVP 단계에서는 과도한 추상화나 인프라 구축을 피한다.

단,

> 나중에 바꾸기 어려운 결정

은 초기에 명확하게 문서화한다.
