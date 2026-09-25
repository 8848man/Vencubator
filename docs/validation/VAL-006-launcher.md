# VAL-006 — Windows launcher

2026-09-26. 수정 전 start.cmd: CRLF 0, LF 9, non-ASCII bytes 84. Node 실제 경로 C:/Program Files/nodejs/node.exe.

수정: ASCII+CRLF, chcp 제거, 실패 분기 분리, 비파괴 --check.

실검사: cmd.exe /d /c site/start.cmd --check → v22.18.0 / Launcher check passed / exit0. C:/Windows를 시작 디렉터리로 절대경로 호출도 같은 결과. 빌드·서버 재실행/브라우저 자동열기는 수행하지 않음. 사용자 오류 원문은 배치 인코딩/줄바꿈 파싱 문제와 일치하나 원본 전체 실행 재현은 생략.
