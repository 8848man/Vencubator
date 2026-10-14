# VAL-024 — 첫 안내 메인 라우트와 랜딩 분리

2026-10-14 · L08-W06 · AUTH-035 · SPEC-019 r0.7 · 상태: 정적 빌드·자동 검사 통과, 브라우저 직접 조작 미실행

## 확인한 경로

- `site/dist/index.html`은 15화면 첫 안내의 HTML을 제공하고 `/v3.3/style.css`·`/v3.3/flow.mjs`를 절대 경로로 불러온다. 모바일 `/app/` 자동 이동 스크립트가 없다.
- 기존 v3.1 독자 선택 랜딩은 `site/dist/landing/index.html`에 있으며 모바일 폭 강제 이동을 사용하지 않는다. `/landing` → `/landing/` 정규화는 `site/scripts/serve.mjs`의 디렉터리 처리 규칙을 따른다. `/beginner/`, `/value/`, `/test/`은 유지한다.
- 새 데모 `/app/` 첫 실행의 `firstFlowDestination`은 `/`를 반환한다. 완료 표시·기존 사용자/프로젝트·명시적 안내 인계 URL·저장 오류의 기존 예외는 회귀 검사로 확인했다.
- `/v3.3/` 호환 경로와 `/v3.3/reference/`의 별도 HTML·모듈·CSS가 빌드에 남는다. 사용자 추가 요청에 따라 루트와 호환 경로의 튜토리얼 하단에서 `54장 흐름 레퍼런스 살펴보기` 링크를 제거했다. 별도 소개 랜딩 링크는 유지했다.
- 루트와 `/landing/` canonical, sitemap 공개 경로와 소유권 확인 메타를 검사했다. 기존 사용자 변경 `site/audience/render.mjs`는 수정·커밋에서 제외했다.

## 실행 결과

| 명령 | 결과 |
|---|---|
| `node --test --test-concurrency=1 site/tests/*.test.mjs` | 32/32 통과 |
| `node --test --test-concurrency=1 prototype/tests/*.test.mjs` | 87/87 통과 |
| `node --test landing-v3.3/tests/reference.test.mjs` | 1/1 통과 |
| `node site/scripts/build.mjs` | 성공, `/`, `/landing/`, `/app/`, `/v3.3/` 생성 |
| `node --check site/scripts/qa.mjs`, `node --check site/scripts/qa-audience.mjs` | 구문 검사 통과 |

첫 사이트 테스트 실행은 31/32였다. 새 랜딩에 `matchMedia` 문자열이 없다고 검사했으나, 기존 랜딩 자체의 화면 크기 처리 코드에도 이 문자열이 있었다. 실제 모바일 **강제 이동** 스크립트만 없어야 하므로 검사를 해당 `location.replace('/app/'...)` 패턴으로 좁히고 다시 실행해 32/32 통과했다.

## 미실행·경계

4180 브라우저 직접 조작·실기기 시각 확인·운영 배포는 실행하지 않았다. 이전 작업에서 해당 로컬 브라우저 접근이 보안 정책으로 거부되어 우회하지 않았다. 사용자에게는 빌드 후 `/`와 `/landing/`을 새로고침해 체험할 수 있는 상태를 제공한다. Playwright QA 스크립트는 새 경로로 갱신하고 구문만 확인했으며 실행 결과라고 주장하지 않는다.
