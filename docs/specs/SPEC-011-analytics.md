# SPEC-011 — 운영 행동 분석

Revision 0.1 · 2026-09-26 · AUTH-015 사용자 실제 연결·배포 요청

SPEC-009의 네트워크 전송 없음 규칙을 이번 범위에서 대체한다. 프로젝트 데이터 저장 계약은 변경하지 않는다.

- 공통 track(name, props, env)는 로컬 500건 버퍼를 유지하고 운영 전송 어댑터를 호출한다. 전송 오류는 제품 사용을 막지 않는다.
- Firebase에 연결된 웹 스트림 G-0GFT3M8ZG3에 Google tag(gtag.js)로 전송한다. Firebase SDK와 중복 설치하지 않는다. Firebase Hosting/Firestore 불필요.
- https://vencubator.vercel.app만 전송 허용. localhost, preview, internal=1, lab, DNT=1은 전송하지 않는다. internal=1은 세션에 유지하고 internal=0으로 해제한다.
- 페이지 URL은 origin + 고정 경로만 보내고 query/hash/원본 referrer/title은 보내지 않는다. 광고 개인화·Google signals 비활성화. 자동 page_view 대신 제어된 page_view를 1회 전송한다. GA4 관리 화면의 향상된 측정(폼/검색/외부클릭)은 비활성 권장; 콘솔 설정은 별도 확인 필요.
- 이벤트별 허용된 속성만 전송. 이름·아이디어·답안·프로젝트 ID·로컬 visitor ID·원문 UTM은 전송하지 않는다. GA가 익명 브라우저 식별을 관리한다. 학습 UI의 반복 시도는 반복 이벤트이며 성공 판정과 혼동하지 않는다.
- 공통 속성: schema_version=1, stage=prototype, environment=production, app_version=analytics-1, page=app/v3.
- 기존 이벤트: landing_view, idea_submit(source,len), card_progress(filled), cta_click(placement,filled), app_open(from), entry_import(from), project_create(from,imported), lesson_complete(count).
- 신규 이벤트: lesson_start(concept), lesson_step(concept,step), lesson_answer(concept), application_save(concept), field_task_plan(concept), evidence_save(kind). 성공적인 저장 후 발생. evidence_save는 사용자 입력 기록이며 실제 검증의 증거가 아니다.
- Firebase/GA4 콘솔로 우선 확인. 로컬 분석 대시보드와 Data API 인증은 이번 배포 범위 제외. MVP는 인증/서버 성공 이벤트, 고도화는 BigQuery/실험 비교를 별도 W에서 추가.

AC: 운영 호스트 제한/내부 트래픽 제외/PII allowlist/장애 격리/중복 초기화 방지 자동검사; 기존 회귀; 공개 빌드; Git push/Vercel 배포 및 공개 파일 확인. 콘솔 실제 보고서 수신은 권한이 없으면 미확인으로 남긴다.

근거: https://developers.google.com/analytics/devguides/collection/ga4/tag-options · https://firebase.google.com/docs/analytics/web/get-started
