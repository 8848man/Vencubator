# VAL-016 — 피드백 Firestore 전송·보안 규칙·GA 이벤트

2026-09-27 · P08-W04 · AUTH-024 · SPEC-015 r0.4 (F06·F07·F08) · ADR-006

## 대상
`prototype/feedback-send.mjs`(REST 전송·게이트·재시도), `feedback-ui.mjs`(로드·응답 뒤 전송, GA 4종), `site/shared/track.mjs`와 복사본 4곳·`landing-v3/dist`(GA 허용 목록), `firestore.rules`(생성 전용), `scripts/feedback-rules-check.mjs`(실측), `site/DEPLOY.md` §3-1.

**현재 상태: `FIREBASE_CONFIG`가 비어 있어 운영에서도 전송하지 않는다(로컬 보관만).** projectId·apiKey를 받으면 값을 넣고 8번 실측을 실행한다.

## 자동 검사
| 명령 | 결과 |
|---|---|
| `node --test prototype/tests/feedback-send.test.mjs` | 8/8 |
| `node --test prototype/tests/*.test.mjs` | 74/74 |
| `node --test site/tests/*.test.mjs`(track 복사본 일치 포함) / `landing-v3/tests` | 18/18 / 41/41 |
| `node site/scripts/qa-feedback.mjs --shots` | 87/87 (로컬 주소에서 Firestore 요청 0건, 대기 안내 토스트 포함) |
| 회귀 `qa-tasks` / `qa-task-nav` | 83/83 / 26/26 |

근거:
- F06: 설정값 없음·로컬·http·미리보기 주소·`lab`·`internal=1`(주소/세션)에서는 요청 0건. DNT는 막지 않음. REST 필드 인코딩(정수·null·배열), 문서 URL. 200·409 → 제거, 400·403·404 → 3회 뒤 제거, 5xx·네트워크 → 이번 차례 중단·5회 뒤 제거, 동시 호출은 한 번만 실행.
- F07(계약): 규칙의 필드 17개 = 앱 문서 필드, 칩 ID 23개 = 앱 칩 ID, 카테고리·의견 유형·영역 열거값, 300/1000/5자 제한, `env` production|qa, 읽기·수정·삭제·다른 경로 거부 문구 존재.
- F08: GA 4종은 열거값·정수 범위만 통과, 자유 입력·칩 값은 버림. 5곳 track.mjs 동일(기존 site 테스트).

## 미실행·막힘
- **규칙 실측(F07 실제 동작) `[!]`**: 설정값 미수신. 또한 클라우드 작업 환경은 `firestore.googleapis.com`·Firestore 에뮬레이터 내려받기(storage.googleapis.com)가 모두 차단되어 여기서는 실행 불가. 설정값을 넣은 뒤 사용자 PC(또는 연결 폴더 셸)에서 `node scripts/feedback-rules-check.mjs <projectId> <apiKey>` 실행 → 10개 PASS 필요. 테스트 모드 규칙이 그대로면 읽기·수정·삭제 항목이 FAIL로 드러난다.
- 운영 주소에서 실제 문서 1건 저장·GA 이벤트 수신 확인은 배포 후.
