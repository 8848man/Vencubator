# AI 기반 랜딩 개선 절차 (SDD)

이 문서는 어떤 모델/도구든 이전 대화 없이 랜딩을 안전하게 고치기 위한 절차다. 프로젝트 공통 규칙(`AGENTS.md`, `docs/process/SDD.md`)이 우선한다.

## 1. 진입 순서

1. `landing/docs/SPEC-006-landing.md` → 대상 섹션(LS-xx)·모션(LM-xx)·AC 확인
2. `landing/docs/VAL-L01.md` 최신 결과 확인
3. 변경 유형 판단 (아래 표)
4. **명세 먼저** 수정 → 코드 → `node --test landing/tests/*.test.mjs` → `node landing/scripts/qa.mjs`(가능 시) → VAL 추가 → 루트 체크포인트 규칙

## 2. 변경 유형별 수정 위치

| 요청 예시 | 변경 유형 | 수정 파일 | 명세 개정 |
|---|---|---|---|
| “히어로 문구 바꿔줘” | 카피 | `src/content.mjs`의 해당 LS 데이터 | 불필요(§6 규칙 준수). VAL에 기록 |
| “FAQ 하나 추가” | 데이터 추가 | `content.mjs` | 불필요 |
| “색을 더 따뜻하게” | 토큰 | `src/tokens.css` | §5 값 갱신 (patch revision) |
| “새 섹션 추가(후기 등)” | 구조 | §3 표에 새 LS-ID → `content.mjs` → `render.mjs`에 type 렌더러 → 필요시 CSS | **revision 올림**, 새 ID. 기존 ID 재사용 금지 |
| “스토리 전환을 더 빠르게” | 모션 | §4 LM 수식 → `motion.mjs` 순수 함수 → 테스트 기대값 | revision 올림 |
| “가입 폼 붙여줘” | 범위 확장 | 먼저 DR-L01 해결, 개인정보 고지 | 사용자 승인 필요 |

## 3. 불변 조건 (깨면 테스트 실패)

- 카피는 `content.mjs`에만. 렌더러는 데이터만 읽는다.
- 원시 색상은 `tokens.css`에만.
- 모든 모션은 `motion.mjs` 순수 함수로 계산하고 `prefers-reduced-motion`에서 정적 표시.
- h1 1개, 섹션 aria-labelledby, CTA href는 `SITE.links`.
- 금지 표현(`CLAIM_BANNED`)과 필수 고지. 실제 근거 없는 수치/후기 금지.
- LS-09 상태 = `docs/execution/STATE.json`.

## 4. 새 섹션 추가 레시피

```js
// 1) SPEC-006 §3 표에 LS-14 | testimonial | ... 추가, revision 0.2
// 2) content.mjs SECTIONS에 삽입
{ id:'LS-14', type:'testimonial', nav:false, eyebrow:'...', title:'...', items:[...] }
// 3) render.mjs RENDERERS에 추가
testimonial: (s) => `<section ${sectionAttrs(s)}>...</section>`
// 4) tests/spec.test.mjs의 SPEC_SECTIONS에 추가 → 테스트 실행
```

## 5. 모델에 그대로 줄 수 있는 프롬프트

> `landing/docs/AI-IMPROVEMENT.md`와 `SPEC-006-landing.md`를 읽어라. 요청: “〈변경 요청〉”. 변경 유형을 판단하고, 필요하면 SPEC-006을 먼저 개정한 뒤 `landing/src`만 수정해라. `node --test landing/tests/*.test.mjs`를 실행해 결과를 `VAL-L01.md`에 추가하라. 금지 표현·실제 근거 없는 수치·다른 폴더 수정은 하지 마라.

## 6. 개선 결과 기록 형식 (VAL-L01에 추가)

| 날짜 | 변경 ID/요약 | Spec revision | 실행한 검사 | 결과 | 미실행/한계 |
