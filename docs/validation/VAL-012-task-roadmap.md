# VAL-012 — 학습 로드맵·작업 목록

2026-09-27 · P07-W04 · AUTH-020 · SPEC-013 r0.3, SPEC-003/005 명칭 보완.

## 실제 검증

- `node site/scripts/qa-tasks.mjs --shots`: 최초 50/50. 320/390/768/1280 가로 넘침·카드 단계 projection·휠 본문 스크롤·제목/버튼 고정·저장 불변 및 T01~T06 회귀.
- 상세 일치·터치 검사를 보강한 전체 실행: 53/55. 1280px 휠 입력이 정렬 select 위에서 적용되지 않았고 Chromium 합성 스크롤 제스처가 touch scrollTop=0으로 실패. 나머지 53개 통과. 제품 코드 변경 없이 검사 입력을 수정.
- `node site/scripts/qa-tasks.mjs --roadmap-only --shots`: 최종 26/26. 휠 위치를 본문 문구로 변경, touchStart/Move/End로 실제 드래그 입력. 4개 너비의 단계·상세 일치·본문 스크롤·고정 영역·저장 불변·명칭·가로 넘침·JS 오류 검사 통과. 터치 scrollTop=225, 모션 감소 animation=none. 기본 실행은 전체 검사를 유지하고 --roadmap-only는 영향 범위 재검증용.
- `node site/scripts/qa-task-nav.mjs`: 26/26. 모바일/데스크톱 진입·돌아가기·재로드·원래 화면 유지. 한국어 명칭 확인.
- `git diff --check`: 통과.
- 390/1280px 스크린샷을 직접 확인. 검사 이미지: `site/qa-shots/tasks/t01-{width}-sheet.png` (Git 제외). 최종 캡처는 Chromium의 기본 스크롤바 숨김 옵션을 해제.

브라우저: 번들 Playwright Chromium. NODE_PATH는 로컬 Codex 런타임 패키지 경로 사용. 전체 raw 로그는 `_handoff/p07-w04-browser.log`, 재검증은 `_handoff/p07-w04-focused.log` (로컬).

## 남은 경계

gitflow 필수 자동 검사·최종 CP 무결성은 마감 시 추가 기록한다. 물리 모바일·실제 스크린리더·다른 브라우저 엔진 사용자 연구 미실행. native scrollbar 표현은 OS 설정에 따라 다르며 강제로 숨기지 않는다. main 병합·배포 미실행.
