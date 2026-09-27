# Vencubator — 제품 기획 및 SDD 작업공간

기준일: 2026-09-23 · 문서 기준선: planning-v0.2 · 구현 상태는 [STATE](docs/execution/STATE.json) 참조

Vencubator는 자신의 아이디어를 발전시키며 배우고 행동하는 **창업 부캐 양성 코파일럿**입니다.

## 프로토타입 실행

프로젝트 루트에서 `node prototype/server.mjs`를 실행하고 [로컬 앱](http://127.0.0.1:4183)을 엽니다. 설치나 API key가 필요 없습니다.

가상 로그인 → 한 문장 프로젝트 → 학습 로드맵 → 개념 → 문제 → 내 프로젝트에 응용 → 실제 실행 과제 → 회고를 체험할 수 있습니다. 홈에서는 다음 학습 하나를 안내하고 스탯은 프로젝트 상세에 둡니다. 실제 AI·인증·푸시는 연결하지 않았습니다. 브라우저별 로컬 저장이므로 주소와 브라우저가 다르면 기록도 분리됩니다.

- [체험 및 실행 안내](prototype/README.md)
- [학습 중심 UX 명세](docs/specs/SPEC-005-guided-learning.md)
- [공통 애니메이션 명세](docs/specs/SPEC-008-motion.md) / [모션 검증](docs/validation/VAL-005-motion.md)
- [최신 검증 결과](docs/validation/VAL-004-guided-learning.md) / [이전 기술 검증](docs/validation/VAL-003-prototype.md)
- [사용성 검증 진행표](docs/validation/PROTOTYPE-RESEARCH-KIT.md)
- [MVP 인계 준비](docs/plans/PROTOTYPE-HANDOVER.md)

자동 검사: `node --test prototype/tests/*.test.mjs`. 작업 재개 시 `node scripts/verify-checkpoint.mjs`로 마지막 저장 시점과 실제 파일을 대조합니다.

## 랜딩 페이지

`node landing/scripts/serve.mjs` → http://127.0.0.1:4174/landing/ · 단일 파일은 `landing/dist/index.html`. 명세 [SPEC-006](landing/docs/SPEC-006-landing.md), 안내 [landing/README](landing/README.md).

**랜딩 v2 (아이디어 카드):** `landing-v2/start.cmd` 또는 `node landing-v2/scripts/serve.mjs` → http://127.0.0.1:4175/landing-v2/ · 명세 [SPEC-007](landing-v2/docs/SPEC-007-landing-v2.md), 설계 원리 [PRINCIPLES](landing-v2/docs/PRINCIPLES.md).

**수요 검증 계획:** [growth/README](growth/README.md) — 채널·메시지·성공 기준·피벗. 실행 전 DR-G01~G06 결정 필요.

**하나의 사이트(랜딩 A/B → 서비스):** `site/start.cmd` 또는 `node site/scripts/build.mjs && node site/scripts/serve.mjs` → http://127.0.0.1:4180/ · 명세 [SPEC-009](docs/specs/SPEC-009-site.md).

## 먼저 읽을 문서

이번 후속 요청의 결과: [프로토타입 → MVP → 고도화 로드맵](docs/plans/IMPLEMENTATION-ROADMAP.md). 3단계·14 Phase·42개 초기 작업과 단계 전환 조건을 정의했습니다.

1. [제품 기획서](docs/product/PRODUCT-BRIEF.md) — 요청한 8개 항목 순서로 읽는 기획안
2. [현재 상태](docs/context/CURRENT.md) — 완료·미완료·다음 작업
3. [SDD 운영 규칙](docs/process/SDD.md) — 명세, 승인, 구현, 검증, 인계
4. [스탯 명세](docs/specs/SPEC-002-growth.md) / [13개 화면 UX](docs/specs/SPEC-003-ux.md)
5. [기술·데이터·운영 설계](docs/architecture/ARCHITECTURE.md)

## 모델을 바꿀 때 그대로 사용할 프롬프트

> AGENTS.md와 docs/context/CURRENT.md, docs/execution/STATE.json 및 해당 checkpoint를 읽어라. 활성 작업과 다음 W를 실제 파일/git 상태에 대조해라. 관련 Phase·Spec·ADR·승인 범위 안에서 다음 한 작업부터 이어라. W 정의 파일에 체크리스트가 있으면 첫 번째 미완료 항목부터 이어라. 종료 전에 체크포인트와 상태를 저장하라. 완료하지 않은 작업을 완료로 추정하지 마라.

파일을 읽지 않는 도구까지 컨텍스트 지속을 보장하지는 않습니다. [중단 복구 프로토콜](docs/execution/CHECKPOINT-PROTOCOL.md)과 [검증 기록](docs/validation/VAL-002-staged-plan.md)을 통해 필요한 상태를 복구하도록 설계했습니다. 실제 다른 모델 전환·실행 중 강제 종료 실험은 수행하지 않았습니다. 자동 저장 프로그램을 설치한 것이 아니라 작업자가 경계마다 기록하는 SDD 운영 구조입니다.

## 문서 지도

| 영역 | 문서 |
|---|---|
| 사용자 요구와 원문 경계 | [요구사항 기록](docs/context/REQUIREMENTS.md) |
| 조사 근거 | [자료 비교](docs/research/STAT-RESEARCH.md), [실제 앱 관찰](docs/research/PRODUCT-OBSERVATIONS.md) |
| 제품·검증 | [기획서](docs/product/PRODUCT-BRIEF.md) |
| 기능 명세 | [SPEC-001](docs/specs/SPEC-001-first-loop.md), [SPEC-002](docs/specs/SPEC-002-growth.md), [SPEC-003](docs/specs/SPEC-003-ux.md) |
| 기술 제안 | [아키텍처](docs/architecture/ARCHITECTURE.md), [ADR-001](docs/adr/ADR-001-platform.md), [ADR-002](docs/adr/ADR-002-authority.md) |
| 실행 관리 | [백로그](docs/process/BACKLOG.md), [추적표](docs/process/TRACEABILITY.md), [승인](docs/process/APPROVALS.md) |
| 구현 단계 | [로드맵](docs/plans/IMPLEMENTATION-ROADMAP.md), [프로토타입](docs/plans/stages/STAGE-01-prototype.md), [MVP](docs/plans/stages/STAGE-02-mvp.md), [고도화](docs/plans/stages/STAGE-03-enhancement.md) |
| 프로토타입 명세 | [SPEC-004](docs/specs/SPEC-004-prototype.md) |
| 진행·복구 | [STATE 및 최신 CP 포인터](docs/execution/STATE.json), [프로토콜](docs/execution/CHECKPOINT-PROTOCOL.md), [작업 이력](docs/execution/WORKLOG.md) |
| 이전 계획 | [PLAN-001](docs/plans/PLAN-001.md) — Superseded, MVP M01~M02로 승계 |
| 인계·기록 | [인계](docs/context/HANDOFF.md), [변경 기록](docs/context/CHANGELOG.md), [검증](docs/validation/VAL-001-planning.md) |
| 재사용 양식 | [SDD 양식](docs/templates/SDD-TEMPLATES.md) |

기존 output 및 생성 스크립트는 선행 자료로 보존했습니다. 로컬 프로토타입을 구현했으며, 운영 DB·실제 AI·외부 배포 및 기존 PDF/영상 갱신은 포함하지 않습니다. 실제 참가자 연구와 MVP 전환 게이트는 별도입니다.
