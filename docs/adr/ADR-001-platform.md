# ADR-001 — Web 우선 UI와 Android 공유 전략

## Status

Proposed · 2026-09-23 · 승인 없음

## Context

첨부 원칙은 Web 데스크톱 우선·모바일 반응형·Android·공통 Backend를 요구한다. 12주 MVP는 대화·폼·학습·근거·작은 성장 연출이 중심이다. 현재 앱 소스나 확정된 팀 기술 역량은 없다.

## Decision

제안: TypeScript/React Web UI + Capacitor Android, 서버 Application/Domain과 관리형 PostgreSQL/Auth. Supabase 후보, 푸시 FCM 후보. 이 결정의 수락은 1주 이내 기술 검증과 사용자 선택 뒤 기록한다.

## Alternatives

- Flutter Web/Android: 앱 경험 공유에 적합. 팀이 Dart에 익숙하거나 모바일 연출을 최우선으로 삼으면 재평가.
- React Native/Expo와 Web 공유: 모바일 비중이 커지면 후보. 현재 폼 중심 데스크톱 UX의 공유 범위를 별도로 검증해야 함.
- 별도 Web/Android: 최적화 여지 있으나 소규모 MVP 유지비 증가.
- PWA만: 초기 검증에는 간단하지만 Android 앱 출시 요구 전체를 충족하는 선택으로 간주하지 않음.

## Consequences

웹 UI와 도메인 재사용을 늘릴 수 있지만 네이티브 인증 복귀·키보드·푸시·딥링크·접근성은 실제 Android에서 따로 테스트해야 한다. 단일 코드베이스라고 플랫폼 QA가 없어지지 않는다. UI 재사용의 실질적 시간 이익과 기기 성능을 측정한 뒤 확정한다.

## Acceptance evidence needed

Android 인증→과제 딥링크, 푸시 거부/수신, 긴 텍스트 입력, 모션 감소, Web Chrome/Edge/Safari 핵심 화면, 동일 계정 동기화, 비용 시나리오. 계획된 검증이며 수행 전이다.

## Related Specs / Sources

[SPEC-001](../specs/SPEC-001-first-loop.md), [SPEC-003](../specs/SPEC-003-ux.md), [아키텍처](../architecture/ARCHITECTURE.md), [Capacitor 공식 문서](https://capacitorjs.com/docs), [Flutter Web FAQ](https://docs.flutter.dev/platform-integration/web/faq).
