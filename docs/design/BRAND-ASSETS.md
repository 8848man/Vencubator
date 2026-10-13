# 브랜드 자산 위치와 사용 규칙

S1/L08-W05 · AUTH-034 · SPEC-019 r0.6

| 자산 | 단일 원본 | 사용하는 화면 | 의미 |
|---|---|---|---|
| 새싹 창업 부캐 | [`prototype/assets/mascot.svg`](../../prototype/assets/mascot.svg) | 앱 프로젝트·환영 화면, `/v3.3/` 첫 안내 | 프로젝트의 작은 가능성. 성장 연출은 진행도 표시이며 점수 아님 |
| V 새싹 아이콘 | [`prototype/assets/brandmark.svg`](../../prototype/assets/brandmark.svg) | 앱 상단 브랜드, `/v3.3/` 패널·재방문 화면 | 제품 식별 |

정적 사이트 빌드가 `prototype/`을 `/app/`으로 복사하므로 첫 안내는 `/app/assets/…`로 같은 원본을 불러온다. SVG의 형태·색을 바꿀 때 이 두 파일을 수정하고 앱과 첫 안내를 함께 확인한다. 앱의 진입·피드백 모션은 [SPEC-008](../specs/SPEC-008-motion.md), [구현](../../prototype/motion.css); 첫 안내의 성장·진입 계약은 [SPEC-019 r0.6](../specs/SPEC-019-mobile-entry.md)에 있다.

## 발견성 평가

- 모션: README에 SPEC-008과 VAL-005 링크가 있고 파일명이 `motion.*`라 검색이 쉽다.
- 자산: 기존에는 SVG가 `prototype/app.mjs` 안의 `brand()`·`mascot()` 문자열에 묻혀 있었고 별도 `.svg` 파일이나 색인이 없어 자산 이름만으로 찾기 어려웠다. 이번 추출과 이 표로 원본·사용 화면·명세 링크를 한 곳에서 찾을 수 있다.
- 여전히 전체 제품 자산의 포괄적 레지스트리는 아니다. 새 로고·캐릭터를 추가할 때 이 표에 원본 경로와 소유 명세를 함께 등록해야 자산 중복을 막을 수 있다.
