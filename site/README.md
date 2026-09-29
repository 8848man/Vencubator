# Vencubator 사이트 — 랜딩 → 앱

명세: [SPEC-009 r0.3](../docs/specs/SPEC-009-site.md) · 배포: [DEPLOY.md](DEPLOY.md)

```
/        랜딩 v3.1 “뿌리”   → 이 이름표로 앱에서 심기 → /app/?from=v31 (문장 인계)
/app/    앱(체험판)
```

## 실행

- Windows: `site/start.cmd` 더블클릭 → 빌드 후 http://127.0.0.1:4180/ 이 열린다.
- 직접: `node site/scripts/build.mjs && node site/scripts/serve.mjs`
- 앱 점검 도구(AI 응답 지연·실패, 저장 실패 재현): `http://127.0.0.1:4180/app/?lab=1` → 설정
- 쌓인 이벤트 보기: 개발자 도구 콘솔에서 `JSON.parse(localStorage.getItem('vencubator.events.v1'))`

## 검사

```
node --test site/tests/*.test.mjs      # 계측·빌드 (배정 함수 테스트는 보관용)
node site/scripts/qa.mjs --shots        # (선택) Playwright 시나리오
```

## 유의

- 분석 도구 전송은 하지 않는다(DR-G02). 이벤트는 브라우저에만 쌓인다.
- `site/shared/track.mjs`가 원본이다. 고치면 `landing/src/`, `landing-v2/src/`, `landing-v3/src/`, `landing-v3.1/src/`, `prototype/`의 `track.mjs`에 같은 내용으로 복사한다(테스트가 검사).
- `router.html`, `src/assign.mjs`, `src/router.mjs`는 A/B 실험용 보관 코드다. r0.3 빌드에는 쓰지 않는다.
- `_to_delete/`는 예전 빌드(v1·v2) 보관함이다. 확인 후 직접 지워도 된다.

## Windows 실행 파일 형식

`start.cmd`는 ASCII + CRLF로 유지한다. 한글 UTF-8/LF 배치 파싱 오류를 방지한다. `site/start.cmd --check`는 경로·Node·스크립트 문법만 확인하며 빌드/서버/브라우저를 실행하지 않는다.

L05-W01 / AUTH-027: 이 PR을 병합하면 운영 루트(`/`)가 v3.1로 바뀝니다. v3 폴더는 저장소에 보존하고 배포하지 않습니다. 병합 전 GA4 v3 최근 2주 기준선 기록과 사용성 5명 확인이 필요합니다.
