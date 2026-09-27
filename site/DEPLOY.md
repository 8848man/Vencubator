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

## 3-1. 피드백 저장소(Firestore) 설정 — SPEC-015 · ADR-006

앱의 가치 카드·‘의견 보내기’ 응답은 운영 주소(https://vencubator.vercel.app)에서만 Cloud Firestore `feedback` 컬렉션으로 보냅니다. 설정 전에는 방문자 브라우저에만 쌓입니다.

1. **보안 규칙 교체(필수)**: Firebase 콘솔 → Firestore Database → 규칙 탭 → 저장소 루트의 `firestore.rules` 내용을 전부 붙여넣고 [게시]. 테스트 모드 규칙은 누구나 읽고 지울 수 있으므로 그대로 두면 안 됩니다.
2. **설정값**: `prototype/feedback-send.mjs`의 `FIREBASE_CONFIG`에 `projectId`·`apiKey`만 둡니다(2026-09-27 입력 완료: `vencubator-18a95`). 웹 API 키는 비밀번호가 아니라 프로젝트 식별자라 배포된 JS에 그대로 보입니다. 안전은 아래 두 가지가 지킵니다.
   - 보안 규칙(1번): 누가 키를 알아도 새 피드백 문서 생성만 가능하고, 읽기·수정·삭제·다른 경로는 불가.
   - **키 사용 제한(권장)**: Google Cloud 콘솔 → API 및 서비스 → 사용자 인증 정보 → 이 브라우저 키(자동 생성된 "Browser key") →
     애플리케이션 제한사항 **웹사이트** `https://vencubator.vercel.app/*`, API 제한사항 **키 제한** → `Cloud Firestore API`(나중에 Firebase 인증 등 다른 제품을 쓰면 그때 추가). 이러면 다른 사이트나 스크립트가 이 키로 다른 Google API를 쓰는 것도 막힙니다. GA(gtag)는 이 키를 쓰지 않아 영향 없음.
   - 저장소에는 서비스 계정 키(JSON)·관리자 비밀번호 같은 **진짜 비밀 값은 절대 두지 않습니다.**
3. **실측**(규칙 게시 뒤, 사용자 PC 명령창): `node scripts/feedback-rules-check.mjs` → 생성 200·중복 409·읽기/목록/수정/삭제/잘못된 문서/다른 컬렉션 403이 모두 PASS여야 합니다. 이때 `env='qa'` 문서가 1건 생기며, 분석 때 제외합니다.
4. **응답 보기**: 콘솔 → Firestore Database → 데이터 → `feedback`. `env`가 `qa`인 문서는 무시합니다. 효용 곡선 내보내기 도구는 후속 작업(P08-W05)입니다.

## 4. 공개 전에 정할 것

- 주소(도메인) — DR-G01
- 분석 도구 연결 여부 — DR-G02. 지금은 이벤트가 방문자 브라우저에만 쌓이고 어디로도 전송되지 않습니다.
- 개인정보 수집 — DR-G03. 지금 사이트는 이름·연락처를 받지 않습니다. 신청 폼을 붙이면 개인정보 안내가 먼저 필요합니다.
