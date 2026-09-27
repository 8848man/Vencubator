# OPS-W01 — 작업 단위 git 흐름 자동화

승인 AUTH-019 · 명세 SPEC-014 r0.2 §12 · 브랜치 `w/OPS-W01-gitflow-automation`(기반 `w/P05-W06-review-focus`)

- 요청: “스펙 변경이나 코드 구현에 대해서도 git flow를 적용하자. 명령 스텝이 실행되면 새로운 브랜치를 파고, 변경이나 구현이 실행되면 각 작업 의미별로 commit을 생성, 작업이 끝나면 해당 브랜치를 push하도록 워크플로우를 개선”.
- 변경: SPEC-014 r0.2, APPROVALS AUTH-019, `scripts/gitflow.mjs`·`gitflow.config.json`, `scripts/tests/gitflow.test.mjs`, AGENTS.md, CHECKPOINT-PROTOCOL §5-1.
- 이 작업 자체를 새 흐름으로 진행: 브랜치 생성 → spec/feat/test/docs/fix/cp 의미별 커밋 → finish(검사→push, 불가 시 handoff).
- 검사: gitflow 7/7(클라우드·Cowork VM 모두), Cowork VM에서 guard 실제 차단(exit 3), finish 필수 검사는 클라우드 클론에서 실행.
