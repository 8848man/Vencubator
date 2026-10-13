# Vencubator 사이트 — 랜딩 → 앱

명세: [SPEC-018 r0.1](../docs/specs/SPEC-018-audience-landings.md) · 기존 기반 [SPEC-009](../docs/specs/SPEC-009-site.md) · 배포: [DEPLOY.md](DEPLOY.md)

```
/        넓은 화면: 첫 방문 선택창·재방문 선호 / 600px 이하: 앱 직접 진입
/beginner/  기존 v3.1 → /app/?from=v31 (이름표 문장만 인계)
/value/    가치 중심 컴팩트 랜딩 → /app/?from=value
/test/     제품 테스트·의견 안내 → /app/?from=test
/app/    앱(체험판)
/v3.3/  기존 v3.1 랜딩·독자 선택 재사용, 600px 이하 앱 직접 진입
/v3.3/reference/  마이루틴 54장 흐름 인터랙티브 시뮬레이션
```

600px 이하의 `/`와 `/v3.3/` 방문은 `/app/`으로 직접 이동합니다. 마이루틴 레퍼런스 체험 `/v3.3/reference/` 및 기존 독자별 경로는 직접 열 수 있습니다. 앱을 처음 실행할 때만 온보딩 질문이 보이고, 완료된 기존 사용자는 저장한 앱 화면으로 돌아갑니다. [SPEC-019](../docs/specs/SPEC-019-mobile-entry.md).

## 실행

- Windows: `site/start.cmd` 더블클릭 → 빌드 후 http://127.0.0.1:4180/ 이 열린다. PC 창에서 모바일 흐름을 보려면 브라우저 폭을 600px 이하로 조절하거나 `/app/`을 직접 연다.
- 직접: `node site/scripts/build.mjs && node site/scripts/serve.mjs`
- 앱 점검 도구(AI 응답 지연·실패, 저장 실패 재현): `http://127.0.0.1:4180/app/?lab=1` → 설정
- 쌓인 이벤트 보기: 개발자 도구 콘솔에서 `JSON.parse(localStorage.getItem('vencubator.events.v1'))`

## 검사

```
node --test site/tests/*.test.mjs      # 계측·빌드 (배정 함수 테스트는 보관용)
node site/scripts/qa.mjs --shots        # (선택) Playwright 시나리오
node site/scripts/qa-audience.mjs --shots # 선택창·독자 경로·모바일·저장 차단
```

## 유의

- 운영 호스트에서만 GA4 허용 이벤트를 전송한다. 로컬·preview·internal·lab·DNT는 제외한다. 자유 입력은 계측하지 않는다. 독자 선택은 A/B 무작위 배정이 아니다.
- `site/shared/track.mjs`가 원본이다. 고치면 `landing/src/`, `landing-v2/src/`, `landing-v3/src/`, `landing-v3.1/src/`, `landing-v3.2/src/`, `prototype/`의 `track.mjs`에 같은 내용으로 복사하고 독립 랜딩을 재빌드한다.
- `router.html`, `src/assign.mjs`, `src/router.mjs`는 A/B 실험용 보관 코드다. r0.3 빌드에는 쓰지 않는다.
- `_to_delete/`는 예전 빌드(v1·v2) 보관함이다. 확인 후 직접 지워도 된다.

## Windows 실행 파일 형식

`start.cmd`는 ASCII + CRLF로 유지한다. 한글 UTF-8/LF 배치 파싱 오류를 방지한다. `site/start.cmd --check`는 경로·Node·스크립트 문법만 확인하며 빌드/서버/브라우저를 실행하지 않는다.

L07-W01 / AUTH-029: 병합·배포 후 운영 루트(`/`)에 선택창이 추가됩니다. 입문 콘텐츠는 v3.1입니다. 직접 URL은 저장 선택보다 우선하며, 모든 경로에서 `다른 설명 보기`로 전환할 수 있습니다. 저장 키는 `vencubator.audience.v1`이며 기기 간 동기화하지 않습니다. 이 키를 localStorage/sessionStorage에서 지우면 첫 방문을 재현할 수 있습니다.

설치된 별도 Playwright를 사용할 때는 `QA_PLAYWRIGHT_MODULE`에 해당 `index.mjs`의 절대 경로를 지정합니다. QA는 라이브러리를 설치하지 않습니다. 캡처는 `site/qa-shots/`, 결과는 [VAL-018](../docs/validation/VAL-018-audience.md)에 기록합니다.
