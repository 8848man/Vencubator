# ADR-003 — 프로토타입 실행 환경

Status: Accepted for S1 only · 2026-09-23 · AUTH-003의 구현 선택

## Context

기존 앱 소스가 없고 로컬 Node 22 실행 가능. 기본 npm wrapper는 npm-cli 경로 오류로 실행되지 않는다. S1은 가상 데이터·브라우저 저장·결정형 AI 대역의 검증이 목적이다.

## Decision

prototype/에 의존성 없는 브라우저 ES module, HTML/CSS/SVG UI와 Node 기본 HTTP 서버·node:test를 사용한다. domain과 storage/AI adapter를 UI에서 분리한다. 별도 패키지 설치 없이 `node prototype/server.mjs`로 실행한다. 인프라 설치 문제를 해결하기 위해 전역 환경을 수정하지 않는다.

## Alternatives / Consequences

React 빌드 체인은 MVP 후보로 유지한다. 이번에는 별도 build 없이 시작할 수 있는 웹 표준 모듈을 선택한다. MVP에서 domain/fixture/test는 재사용 후보, DOM view는 React로 이전 시 재구현이 필요하다. ADR-001의 production 선택을 확정하지 않는다. 실제 인증/AI/푸시 없음.
