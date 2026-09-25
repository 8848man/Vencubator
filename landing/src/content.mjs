// SPEC-006 §2: 모든 카피·링크·섹션 데이터의 단일 출처. 마크업/스타일을 두지 않는다.
// 섹션 id(LS-xx)는 SPEC-006 §3 표와 1:1. 순서 = 페이지 순서.

export const SITE = {
  lang: 'ko',
  title: 'Vencubator · 아이디어에 다음 한 걸음',
  description: '막연한 아이디어를 나만의 창업 부캐로. 오늘 배울 것 하나, 해볼 것 하나로 아이디어를 한 단계 더 분명하게 만드는 창업 학습 코파일럿.',
  themeColor: '#f8f9f5',
  brand: 'vencubator',
  variant: 'v1',
  links: {
    // 로컬 프로토타입 (node prototype/server.mjs). 배포 주소가 생기면 여기만 바꾼다.
    // 같은 사이트의 서비스 (SPEC-009). 상대 경로라 /v1/ 과 /landing/ 어디서든 /app/ 으로 간다.
    prototype: '../app/?from=v1',
    howItWorks: '#route',
    story: '#story',
    brief: '../docs/product/PRODUCT-BRIEF.md',
    roadmap: '../docs/plans/IMPLEMENTATION-ROADMAP.md',
    spec: './docs/SPEC-006-landing.md'
  },
  cta: {
    primary: { label: '프로토타입 체험하기', href: 'prototype' },
    secondary: { label: '어떻게 자라는지 보기', href: 'howItWorks' }
  }
};

// SPEC-006 §6 — 테스트가 전체 카피에서 검사한다.
export const CLAIM_BANNED = ['성공률', 'PMF', '% 완성', '보장', 'AI가 결정', 'AI가 대신', '검증 완료', '1위', '누적 사용자'];
export const REQUIRED_NOTICES = ['프로토타입', '가상 예시'];

// SPEC-005 기본 경로 순서와 prototype/content.mjs STATS의 이름·색을 따른다.
export const AREAS = [
  { key: 'customer', name: '고객 이해', icon: '◎', q: '누가, 언제, 무엇 때문에 불편할까?', subs: ['세분화', '문제 상황', '인터뷰', '현재 대안'] },
  { key: 'product', name: '제품 가치', icon: '◇', q: '쓰고 나면 무엇이 더 좋아질까?', subs: ['가치제안', 'MVP', '사용성', '반복사용'] },
  { key: 'market', name: '시장 기회', icon: '◈', q: '이 문제를 어디서 먼저 해결할까?', subs: ['경쟁·대체재', '시장 범위', '접근성', '차별 기회'] },
  { key: 'gtm', name: '고객 확보·판매', icon: '↗', q: '어떻게 만나서 쓰거나 사게 할까?', subs: ['포지셔닝', '메시지', '채널', '전환·유지'] },
  { key: 'finance', name: '수익·재무', icon: '₩', q: '돈이 어떻게 들어오고 얼마나 남을까?', subs: ['가격', '수익모델', '원가', '단위경제'] },
  { key: 'operations', name: '실행·운영', icon: '▦', q: '약속한 가치를 계속 전달할 수 있을까?', subs: ['일정·역할', '파트너', '품질', '계약·개인정보'] },
  { key: 'strategy', name: '전략·학습', icon: '✧', q: '지금 무엇을 확인하고 어떤 결정을 할까?', subs: ['병목', '실험 기준', '회고', '피벗'] }
];

export const SECTIONS = [
  {
    id: 'LS-00', type: 'nav', anchor: 'top',
    headerCta: { label: '체험하기', href: 'prototype' }
  },
  {
    id: 'LS-01', type: 'hero', anchor: 'hero', nav: false,
    eyebrow: 'A SMALL IDEA · A NEXT STEP',
    lines: ['당신의 아이디어에,', '다음 한 걸음.'],
    lead: '막연했던 생각을 나만의 창업 부캐로. 오늘 배울 것 하나, 해볼 것 하나로 아이디어를 한 단계 더 분명하게 만들어요.',
    assurance: '가입 없이 체험 · 한 문장이면 시작 · 결정은 언제나 내가',
    mock: {
      project: 'TeamUp',
      oneLiner: '첫 전공 수업에서 팀원을 구하는 대학 신입생',
      nextLabel: '오늘의 한 걸음',
      nextTitle: '좋다는 말보다, 지난 행동을 물어보기',
      nextMeta: ['◷ 약 3분', '고객 이해'],
      cta: '이어서 배우기',
      path: ['고객', '제품', '시장', '확보', '재무', '운영', '전략']
    },
    caption: '프로토타입 화면을 재구성한 예시예요.'
  },
  {
    id: 'LS-02', type: 'typeStory', anchor: 'grow', nav: true, navLabel: '성장 방식',
    eyebrow: 'ONE IDEA · ONE STEP · ONE DECISION',
    lines: ['작게 배우고', '직접 확인하고', '더 분명하게'],
    note: '스크롤할수록 새싹이 자라요. 아이디어도 이렇게, 한 번에 하나씩 자랍니다.',
    cue: 'SCROLL TO GROW'
  },
  {
    id: 'LS-03', type: 'proof', anchor: 'principles', nav: false,
    eyebrow: 'OUR PRINCIPLES',
    title: '거창한 계획 대신,\n오늘 할 수 있는 것부터.',
    items: [
      { k: '01', t: '한 문장으로 시작', d: '이름도 수익모델도 몰라도 괜찮아요. 떠오른 한 문장이면 학습 길이 열려요.' },
      { k: '02', t: '하루 한 단계', d: '홈에는 다음 학습 하나만. 무엇부터 할지 고민하는 시간을 줄여요.' },
      { k: '03', t: '배운 걸 내 프로젝트에', d: '개념을 익히면 바로 내 아이디어에 적용한 결과물이 남아요.' },
      { k: '04', t: '행동은 근거로', d: '실제로 물어보고 관찰한 결과를 기록해 다음 결정의 근거로 삼아요.' },
      { k: '05', t: '점수보다 바뀐 결정', d: '성장은 “무엇을 새로 알고 무엇을 바꿨는지”로 보여줘요.' }
    ]
  },
  {
    id: 'LS-04', type: 'route', anchor: 'route', nav: true, navLabel: '학습 루프',
    eyebrow: 'ONE CONNECTED LOOP · VENCUBATOR',
    title: '배우고, 풀어보고,\n내 아이디어에 쓰고, 해본다.',
    steps: [
      { k: '01', en: 'LEARN', t: '개념', d: '상황 예시와 짧은 설명으로 지금 필요한 개념 하나' },
      { k: '02', en: 'PRACTICE', t: '문제·응용', d: '정답과 이유를 고르고, 새로운 상황에 적용' },
      { k: '03', en: 'APPLY', t: '내 프로젝트', d: '대상과 확인 기준을 내 말로 적어 결과물로 저장' },
      { k: '04', en: 'ACT', t: '실행·회고', d: '작은 실행 하나, 결과는 근거로 남기고 다음 결정' }
    ],
    link: { label: '세션 흐름 자세히 보기', href: 'story' }
  },
  {
    id: 'LS-05', type: 'areas', anchor: 'areas', nav: true, navLabel: '7개 영역',
    eyebrow: '7 AREAS OF A VENTURE',
    title: '창업에 필요한 일곱 가지 질문,\n필요한 순간에 하나씩.',
    lead: '고객부터 전략까지. 모든 걸 한 번에 배우지 않아요. 내 프로젝트의 지금 단계에 맞는 영역이 먼저 열려요.',
    areas: AREAS,
    filler: { t: '그리고 여덟 번째 칸은,\n당신의 아이디어', link: { label: '한 문장으로 시작하기', href: 'prototype' } }
  },
  {
    id: 'LS-06', type: 'bridge', anchor: 'bridge', nav: false,
    fromLabel: '7 AREAS TO LEARN', toLabel: '1 STEP FOR TODAY',
    from: '7', to: '1',
    title: ['알아야 할 건 일곱,', '오늘 할 일은 하나.'],
    body: '전부 알아야 시작할 수 있는 건 아니에요. Vencubator는 지금 내 아이디어에 가장 필요한 한 걸음만 안내해요.'
  },
  {
    id: 'LS-07', type: 'story', anchor: 'story', nav: true, navLabel: '세션 흐름',
    eyebrow: 'ONE SESSION · FIVE MOMENTS',
    intro: '한 번의 세션, 다섯 개의 순간',
    frames: [
      { k: '01', en: 'CONCEPT', t: '필요한 개념을\n짧게 만나고', d: '“좋다는 말보다, 지난 행동을 물어보세요.” 상황 예시와 함께 왜 지금 배우는지 알려줘요.',
        mock: { kind: 'speech', label: '개념', text: '“이 앱 쓰실 거예요?”보다 “지난번엔 팀원을 어떻게 구하셨어요?”가 더 많은 걸 알려줘요.' } },
      { k: '02', en: 'QUESTION', t: '문제로\n이해를 확인하고', d: '정답과 이유를 함께 골라요. 틀려도 다른 문항으로 다시, 학습이 막히지 않아요.',
        mock: { kind: 'quiz', label: '문제', text: '고객의 실제 불편을 확인하기 좋은 질문은?', choices: ['앱이 있으면 쓰실 건가요?', '지난 학기엔 어떻게 해결하셨어요?'], answer: 1 } },
      { k: '03', en: 'TRANSFER', t: '새로운 상황에\n응용해 보고', d: '비슷하지만 다른 상황에서 스스로 판단해요. 이미 아는 개념은 바로 여기서 시작할 수 있어요.',
        mock: { kind: 'transfer', label: '응용', text: '카페 예약 앱이라면, 어떤 “지난 행동”을 물어볼까요?' } },
      { k: '04', en: 'APPLY', t: '내 프로젝트의\n결과물로 남기고', d: '누구에게, 무엇을, 어떻게 확인할지 내 말로 적어요. AI 제안은 참고일 뿐, 확정은 내가 해요.',
        mock: { kind: 'artifact', label: '내 프로젝트', text: '신입생 3명에게 “지난 학기 팀원을 구한 방법”을 묻는다', meta: '확인 기준 · 2명 이상이 단톡방 외 방법을 썼는지' } },
      { k: '05', en: 'FIELD', t: '작게 해보고\n다음을 결정해요', d: '실행 과제는 하나만. 결과를 관찰로 기록하면 근거가 되고, 그 근거로 다음 방향을 직접 선택해요.',
        mock: { kind: 'field', label: '실행·회고', text: '관찰 2건 기록 · 가설 일부 반박', meta: '다음 결정 · 대상을 “복학생”으로 좁혀 다시 확인' } }
    ]
  },
  {
    id: 'LS-08', type: 'growth', anchor: 'growth', nav: true, navLabel: '성장 기록',
    eyebrow: 'WHAT GROWS',
    title: '자라는 건 점수가 아니라\n나와 내 아이디어예요.',
    cards: [
      { tag: '부캐 · 내 프로젝트', t: '아이디어가 자라요', d: '모호한 생각이 확인 가능한 가설이 되고, 실제 관찰과 결정이 쌓여요. 프로젝트마다 따로 자라요.', stages: ['가설 정리', '현장 확인', '반복 검토', '의사결정 반영'] },
      { tag: '본캐 · 나의 학습', t: '내가 자라요', d: '개념을 이해하고 새 상황에 적용한 경험은 프로젝트가 바뀌어도 남아요. 아는 내용은 건너뛸 수 있어요.', stages: ['이해 확인', '적용', '재확인'] },
      { tag: '반박도 성장', t: '틀린 가설도 배움이에요', d: '예상과 다른 답을 들었다면 탐구 경험은 쌓이고, 가설은 “다시 살펴보기”로 정직하게 표시돼요.', stages: ['기존 가설', '반박된 단서', '방향 전환'] }
    ],
    note: '탐구 단계는 알아보고 판단한 과정이에요. 사업 성공 가능성이나 시장 반응을 숫자로 약속하지 않아요.'
  },
  {
    id: 'LS-09', type: 'status', anchor: 'status', nav: true, navLabel: '진행 상황',
    eyebrow: 'WHERE WE ARE',
    title: '지금 어디까지 왔는지,\n있는 그대로 알려드려요.',
    rows: [
      { stage: 'S1', name: '프로토타입', status: 'in_progress', label: '진행 중', d: '학습 길 · 개념/문제/응용 · 내 프로젝트 결과물 · 실행 1개. 실제 AI·로그인 없이 브라우저에서 체험' },
      { stage: 'S2', name: 'MVP', status: 'not_started', label: '준비 중', d: '계정과 서버 저장, 실제 AI 인터뷰, 근거·결정 기록, Android 테스트' },
      { stage: 'S3', name: '고도화', status: 'not_started', label: '예정', d: '개인화된 학습 경로, 알림, 두 번째 프로젝트로의 학습 이전' }
    ],
    note: '일정은 사용자 연구 결과에 따라 바뀔 수 있어요.'
  },
  {
    id: 'LS-10', type: 'faq', anchor: 'faq', nav: true, navLabel: '자주 묻는 질문',
    eyebrow: 'FAQ',
    title: '시작 전에 궁금한 것들',
    items: [
      { q: 'AI가 사업 방향을 정해주나요?', a: '아니요. AI는 질문하고 정리하고 선택지를 설명하는 역할이에요. 무엇을 믿고 어떤 방향으로 갈지는 언제나 직접 확정해요.' },
      { q: '스탯이 높으면 사업이 잘된다는 뜻인가요?', a: '아니요. 탐구 단계는 얼마나 체계적으로 알아보고 판단했는지를 보여줄 뿐, 성공 가능성을 뜻하지 않아요.' },
      { q: '지금 바로 쓸 수 있나요?', a: '현재는 프로토타입 단계예요. 로컬에서 흐름을 체험할 수 있고, AI 대화와 고객 관찰은 가상 예시예요. 기록은 이 브라우저에만 저장돼요.' },
      { q: '아이디어가 아직 막연해도 괜찮나요?', a: '네. 한 문장이면 충분해요. 이름이나 수익모델이 없어도 학습 길이 바로 열려요.' },
      { q: '매일 해야 하나요?', a: '아니요. 생명 소모나 벌점, 순위 경쟁이 없어요. 할 수 있을 때 한 단계씩 이어가면 돼요.' }
    ]
  },
  {
    id: 'LS-11', type: 'final', anchor: 'start', nav: false,
    eyebrow: 'YOUR NEXT SMALL STEP',
    title: ['생각만 하던 아이디어,', '오늘은 한 걸음만.'],
    body: '작게 배우고, 직접 확인하며, 아이디어와 함께 자라보세요.'
  },
  {
    id: 'LS-12', type: 'stickyCta', anchor: 'sticky', nav: false,
    title: '아이디어 한 문장이면 시작',
    sub: '프로토타입 · 가입 없이 브라우저에서 체험'
  },
  {
    id: 'LS-13', type: 'footer', anchor: 'footer', nav: false,
    notice: '현재 Vencubator는 프로토타입 단계입니다. 화면 속 AI 대화·고객 관찰·프로젝트는 가상 예시이며, 실제 성과를 뜻하지 않습니다.',
    links: [
      { label: '제품 기획서', href: 'brief' },
      { label: '구현 로드맵', href: 'roadmap' },
      { label: '랜딩 명세', href: 'spec' }
    ],
    copy: '© 2026 Vencubator'
  }
];
