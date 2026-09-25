# Vencubator 랜딩 페이지

프로토타입의 컬러·새싹 부캐·카피 톤을 계승하고, TTJ(ttj.kr)의 스크롤 연출 기법(고정 스테이지, 문장 교차, 숫자 브리지, 프레임 스토리, 초점 행, 스티키 CTA, 챕터 내비)을 제품 의미에 맞게 다시 구현한 단일 페이지입니다.

## 실행

**Windows에서 가장 쉬운 방법:** `landing/start.cmd`를 더블클릭 → 랜딩(4174)과 프로토타입(4183) 서버 창이 열리고 브라우저가 뜹니다. 서버 없이 보려면 `landing/dist/index.html`을 더블클릭하세요(`landing/index.html`을 직접 열어도 자동으로 dist로 이동).

```bash
# 저장소 루트에서
node landing/scripts/serve.mjs          # http://127.0.0.1:4174/landing/
node landing/scripts/build.mjs          # landing/dist/index.html (단일 파일, 더블클릭으로 열림)
node --test landing/tests/*.test.mjs    # 명세 수용 기준 자동 검사
node landing/scripts/qa.mjs --shots     # (선택) Playwright 브라우저 검사 + 스크린샷
```

체험 CTA는 로컬 프로토타입(`node prototype/server.mjs`, 기본 4183 · `PORT=포트번호`로 변경 가능)으로 연결됩니다. 주소는 `src/content.mjs`의 `SITE.links.prototype` 한 곳만 바꾸면 됩니다.

## 구조 (SDD)

| 경로 | 역할 |
|---|---|
| [docs/SPEC-006-landing.md](docs/SPEC-006-landing.md) | **권위 명세** — 섹션(LS)·모션(LM)·토큰·카피 규칙·AC |
| [docs/ANALYSIS.md](docs/ANALYSIS.md) | 기존 Vencubator 기획/UI 분석, TTJ 기법 분석과 적용 매핑 |
| [docs/AI-IMPROVEMENT.md](docs/AI-IMPROVEMENT.md) | AI로 개선할 때의 절차·불변 조건·프롬프트 |
| [docs/VAL-L01.md](docs/VAL-L01.md) | 검증 기록 |
| `src/content.mjs` | 모든 카피·링크·섹션 순서 (문구 수정은 여기만) |
| `src/render.mjs` | 섹션 type → HTML (순수 함수) |
| `src/motion.mjs` | 모션 수식(순수) + DOM 바인딩 |
| `src/tokens.css` / `src/landing.css` | 디자인 토큰 / 컴포넌트 스타일 |
| `tests/` | AC-LP01~09 검사 |

섹션 흐름: 히어로 → 자라는 새싹(3문장) → 원칙 5 → 학습 루프 → 7개 영역 → 7→1 브리지 → 세션 5프레임 → 부캐·본캐 성장 → 진행 상황 → FAQ → 마지막 CTA.

`prefers-reduced-motion`이거나 JS가 없으면 고정 스테이지 없이 모든 내용이 순서대로 표시됩니다.
