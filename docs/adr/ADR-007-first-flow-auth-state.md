# ADR-007 — 첫 흐름 완료 표시와 인증 상태의 저장 권위

2026-10-13 · 제안 설계(구현 전) · L08-W02 · AUTH-031 · SPEC-019 r0.3

## 맥락

사용자는 브라우저/모바일 저장소에 첫 흐름 완료 표시를 두어 재표시 여부를 제어하고, 표시가 있으나 로그아웃 상태일 때 별도 로그인 화면을 원한다. 현재 S1 프로토타입은 `prototype/app.mjs`가 온보딩 완료 시 `demo-user`를 자동 만들고 전체 데모 상태를 브라우저 로컬 저장소에 둔다. 실제 인증과 계정 간 권한은 없다([SPEC-004](../specs/SPEC-004-prototype.md)). L08-W02는 목표 계약을 정하지만 이 코드를 바꾸지 않는다.

기기 표시 하나를 로그인 자격처럼 쓰면 저장소 수정·삭제 또는 공유 기기에서 계정 데이터가 섞일 수 있다. 반대로 매번 설명을 보여 주면 재방문자의 시작을 방해한다. 두 상태를 분리한다.

## 결정

1. **완료 표시는 UX 선호만 나타낸다.** 제품 명칭은 `firstFlowCompletedVersion`; 인증 토큰이라 부르지 않는다. 브라우저 Web/PWA/모바일 브라우저는 동일 origin의 `localStorage`에 작은 비밀이 아닌 기록을 둔다. 목표 예시:

   ```json
   {"schemaVersion":1,"completedVersion":1,"completedAt":"2026-10-13T00:00:00Z"}
   ```

   키 예시는 `vencubator.first_flow.v1`. 자유 입력·이메일·제공자 ID·계정 ID·액세스 토큰은 이 값에 넣지 않는다. 저장 실패·파손·구버전 값은 `unknown`으로 읽고, 첫 흐름에서 `이미 계정이 있어요 · 로그인`으로 바로 이동할 수 있게 한다. 로그아웃은 이 표시를 지우지 않는다.

2. **인증은 별도 권위다.** 웹의 로그인 여부와 사용자 ID는 서버가 검증한 세션에서 결정한다. 향후 웹 세션은 `HttpOnly; Secure; SameSite` 쿠키 기반을 기본안으로 하고 CSRF·OAuth state/PKCE·세션 갱신은 인증 구현 W에서 확정한다. 액세스/리프레시 토큰·세션 ID를 `localStorage`나 `sessionStorage`에 저장하지 않는다. 클라이언트 완료 표시를 바꿔도 계정 API 권한이 생기지 않는다. OWASP는 인증 토큰과 세션 ID를 Web Storage에 넣지 말 것을 권한다([HTML5 보안](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [세션 관리](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)).

3. **로그인 후 계정 완료 버전이 우선한다.** MVP에서 `userId + firstFlowCompletedVersion`은 서버 프로필의 필드 또는 별도 계정 온보딩 기록으로 둔다. 로그인 계정이 완료한 버전은 기기 표시보다 우선한다. 같은 세션에서 방금 첫 흐름을 완료하고 인증에 성공한 경우에만 그 계정에 완료 버전을 기록한다. 오래된 기기 표시를 다른 계정에 무조건 복사하지 않는다. 로그인 전 답변·아이디어는 익명 초안이며, 사용자가 확인한 뒤에만 해당 계정의 프로젝트 초안으로 옮긴다. 이 확인/이전의 세부 API는 MVP 데이터 계약에서 정의한다.

4. **네이티브 앱은 저장 성격에 따라 분리한다.** Android 네이티브 앱을 만들면 비밀이 아닌 완료 버전은 Preferences DataStore 같은 앱 설정 저장소의 후보가 된다([Android DataStore](https://developer.android.com/topic/libraries/architecture/datastore)). iOS 앱을 만들면 같은 성격의 값에 UserDefaults가 후보이며, Apple도 민감 정보는 UserDefaults에 두지 말라고 안내한다([UserDefaults](https://developer.apple.com/documentation/foundation/userdefaults)). 네이티브 인증 비밀은 OS 보안 저장소/서버 세션 계약으로 별도 설계한다. 현재 모바일 웹에는 별도 ‘모바일 스토리지’가 없고 브라우저 origin의 저장소를 사용한다.

5. **버전은 흐름 계약 변경에만 올린다.** 카피 수정이나 시각 변경은 완료 버전을 갱신하지 않는다. 사용자에게 새 필수 행동이 생기면 변경 화면만 소개할지, 전체 흐름을 다시 보일지 제품 명세 revision에서 판단한다. `처음 안내 다시 보기`는 언제나 가능하며 계정 완료 버전·로그인 상태는 유지한다.

## 진입 규칙과 실패 처리

세션 확인이 `checking`인 동안은 진입 화면을 잠깐 노출하지 않는다. `signedOut + deviceCompleted`는 로그인 게이트, `signedOut + 미완료/unknown`은 첫 흐름(즉시 로그인 선택 가능), `signedIn + accountCompleted`는 앱, `signedIn + accountIncomplete`는 첫 흐름이다. 로그인 취소·실패는 같은 게이트에서 재시도한다. 세션 만료는 저장된 앱 화면을 잠시 숨기고 로그인 게이트로 이동한다. 저장소가 지워지거나 사생활 보호 모드가 끝나면 기기 완료 표시가 없어질 수 있으므로 계정 권위와 재방문 로그인 링크가 필요하다([MDN 저장 수명](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)).

## 대안과 이유

| 대안 | 판단 |
|---|---|
| 완료 표시 하나로 로그인 상태까지 추정 | 배제. UX 선호를 권한으로 오인하고 공유 기기·저장소 조작에서 계정 데이터가 섞인다. |
| 모든 사용자의 완료 여부를 기기에만 저장 | 배제. 기기 교체·저장 삭제 시 일관성이 없고 로그인 계정의 복귀 상태를 알 수 없다. |
| 첫 흐름 전에 무조건 로그인 | 이번 요구와 맞지 않는다. 로그인 이유를 1~4구간의 가치·맞춤 시작점 뒤에 제시한다. |
| 인증 비밀을 Web Storage에 저장 | 배제. 브라우저 스크립트가 읽을 수 있다. |

## 영향과 구현 경계

- SPEC-019 r0.3의 4상태 표와 별도 로그인 게이트를 따른다. 현재 S1 프로토타입의 데모 저장 데이터는 실제 계정 데이터로 자동 이관하지 않는다.
- MVP 구현 시 서버 프로필 필드/계약, 실제 제공자 인증, 로그아웃·세션 만료, 계정 전환, 익명 초안 이전의 사용자 확인, 저장 실패를 별도 W에서 구현·검증한다.
- 이 ADR의 `HttpOnly` 웹 세션과 네이티브 저장소 이름은 구현 방향이다. 선택한 인증 백엔드와 플랫폼에서 요구하는 세부 사항은 그때 확인한다. 이 ADR 작성은 인증 기능 완료를 뜻하지 않는다.
