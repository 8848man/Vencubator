# 배포 안내 — Vencubator 사이트 (랜딩 v3 + 앱)

`site/dist/`는 서버 코드가 없는 **정적 파일 묶음**입니다. 아무 정적 호스팅에나 폴더째 올리면 `/`에 랜딩, `/app/`에 앱이 열립니다.

## 1. 만들기

```bash
node site/scripts/build.mjs        # site/dist 생성
node --test site/tests/*.test.mjs  # 빌드 계약 확인
node site/scripts/serve.mjs        # http://127.0.0.1:4180/ 에서 마지막 확인
```

빌드가 “이전 빌드 파일이 남아 있어요”라고 알리면 `site/dist` 폴더를 지우고 다시 빌드한 뒤 올리세요(예전 v1·v2 파일이 같이 올라가지 않게).

## 2. 올리기 (하나만 고르면 됩니다)

| 호스팅 | 방법 | 비고 |
|---|---|---|
| Netlify Drop | app.netlify.com/drop 에 `site/dist` 폴더를 끌어 놓기 | 가장 빠름. `_headers` 적용됨 |
| Cloudflare Pages | Workers & Pages → Create → Pages → Upload assets → `site/dist` | `_headers` 적용됨 |
| GitHub Pages | `site/dist` 내용을 배포 브랜치/폴더에 올리기 | `_headers`는 무시됨(문제 없음) |
| Vercel | `site/dist`를 Output Directory로 지정 | 빌드 명령 없이 정적 배포 |

## 3. 올린 뒤 확인

- `/` 첫 화면, 이름표에 문장 → “이 이름표로 앱에서 심기” → 앱 새 프로젝트 칸에 문장이 들어오는지
- 휴대폰에서 가로 스크롤이 없는지
- `/app/?lab=1` 은 점검용 주소입니다. 공유하지 마세요.

## 4. 공개 전에 정할 것

- 주소(도메인) — DR-G01
- 분석 도구 연결 여부 — DR-G02. 지금은 이벤트가 방문자 브라우저에만 쌓이고 어디로도 전송되지 않습니다.
- 개인정보 수집 — DR-G03. 지금 사이트는 이름·연락처를 받지 않습니다. 신청 폼을 붙이면 개인정보 안내가 먼저 필요합니다.
