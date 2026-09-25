# 프로토타입 진행 — CURRENT

CP-0041 / STATE revision 41 / 2026-09-25T15:39:05.000Z

AUTH-008, SPEC-008 r0.1: 해당 프로토타입 작업. S1만 구현, 실제 AI/인증/푸시 없음.

현재 P06-W02: completed.

SPEC-008 r0.1 적용 완료. 38개 검사 통과, 브라우저 순차진입/결과만 등장/스켈레톤 정상·지연·실패/앱 모션 감소/390px 확인. VAL-005 참조. 물리 터치·OS 설정 실검사는 미실행. 다음 P05-W03은 VAL-004 미마감 검증을 실제 파일과 대조해 정리; P04 연구 대기 유지.

다음: P05-W03. STATE와 docs/execution/checkpoints/CP-0036.md 및 manifest(프로토타입 맥락은 CP-0035)를 대조하고 관련 Phase/Spec과 docs/validation/VAL-005-motion.md을 읽어 재개한다.

진행률은 STATE가 권위다. 기존 기획·연구는 보존. MVP 및 고도화 미착수. 사용자 연구는 아직 수행하지 않았으며 완료로 간주하지 않는다.

## 독립 트랙

랜딩 v1: landing/ (4174), v2: landing-v2/ (4175), 수요 검증 계획: growth/. 기존 산출물 보존. 프로토타입 기본 포트4183.

Growth 운영 콘솔: `growth/console.html`(CP-0036).

하나의 사이트(L03-W01, CP-0038): `site/` — `/` 배정 50:50 → `/v1/`·`/v2/` → `/app/`. 로컬 4180(`site/start.cmd`). 명세 SPEC-009, 검증 VAL-S01. prototype에 entry.mjs·track.mjs와 app.mjs 진입 훅 추가(저장 구조 불변).

실행 파일 수정(CP-0041): site/start.cmd ASCII/CRLF. --check 성공, VAL-006.
