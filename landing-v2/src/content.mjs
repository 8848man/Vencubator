// SPEC-007 §2: 모든 카피·예시·템플릿·링크의 단일 출처. 마크업·로직 없음.
// 섹션 id(L2S-xx)는 SPEC-007 §3 표와 1:1, 배열 순서 = 페이지 순서.

export const SITE = {
  lang: 'ko',
  title: 'Vencubator · 한 문장으로 시작하는 아이디어 카드',
  description: '아이디어 한 문장을 적으면 페이지를 내려가는 동안 첫 번째 아이디어 카드가 채워져요. 배우고, 내 아이디어에 쓰고, 결정하는 Vencubator의 방식을 1분 안에 체험해 보세요.',
  brand: 'vencubator',
  variant: 'v2',
  storageKey: 'vencubator.landing.v2',
  limits: { idea: 120, customer: 60 },
  links: {
    // 로컬 프로토타입 (node prototype/server.mjs, 기본 4183). 배포 주소가 생기면 여기만 바꾼다.
    // 같은 사이트의 서비스 (SPEC-009). 문장은 같은 출처 저장소로 인계된다.
    prototype: '../app/?from=v2',
    brief: '../docs/product/PRODUCT-BRIEF.md',
    roadmap: '../docs/plans/IMPLEMENTATION-ROADMAP.md',
    spec: './docs/SPEC-007-landing-v2.md',
    v1: '../landing/'
  }
};

// SPEC-006/007 공통 금지 표현
export const CLAIM_BANNED = ['성공률', 'PMF', '% 완성', '보장', 'AI가 결정', 'AI가 대신', '검증 완료', '1위', '누적 사용자'];
export const REQUIRED_NOTICES = ['프로토타입', '가상 예시', '이 브라우저에만'];

export const SAMPLES = [
  { key: 'teamup', label: '팀플 동료 찾기', idea: '시간과 역할이 맞는 대학생 팀플 동료를 찾아주는 서비스', customer: '첫 전공 수업에서 팀원을 구하는 대학 신입생' },
  { key: 'banchan', label: '동네 반찬 구독', idea: '퇴근길에 동네 반찬을 조금씩 나눠 사는 구독 서비스', customer: '평일 저녁을 혼자 해결하는 1인 가구 직장인' },
  { key: 'plant', label: '반려식물 케어', idea: '초보 식물 집사에게 물 주기 시점을 알려주는 앱', customer: '식물을 두 번 이상 말려 본 초보 집사' }
];

// 카드 5칸 (SPEC-007 §4). hint = 비어 있을 때 안내
export const SLOTS = [
  { key: 'idea', label: '아이디어', chapter: 'idea', hint: '한 문장을 적으면 채워져요' },
  { key: 'learn', label: '배운 개념', chapter: 'learn', hint: '퀴즈 한 문항을 풀면 채워져요' },
  { key: 'ask', label: '내 질문', chapter: 'apply', hint: '물어볼 사람을 정하면 채워져요' },
  { key: 'observe', label: '관찰', chapter: 'observe', hint: '들은 답을 해석하면 채워져요' },
  { key: 'decide', label: '결정', chapter: 'decide', hint: '다음 방향을 고르면 채워져요' }
];
export const STAMPS = { empty: '비어 있음', example: '예시', mine: '내 것', refuted: '가설 재검토' };

// prototype/content.mjs LESSONS.customer 와 같은 개념·문항 (AC-L2-07)
export const LESSON = {
  title: '좋다는 말보다, 지난 행동',
  summary: '고객에게 아이디어가 괜찮은지 묻기보다, 최근에 실제로 어떻게 했는지를 물어보세요. 칭찬은 쉽게 나오지만 지난 행동은 거짓말을 잘 하지 않아요.',
  source: 'NSF I-Corps 고객 발견 방식',
  variants: [
    { question: '고객의 실제 문제를 알아보기에 더 좋은 질문은?', options: ['이 앱이 있으면 쓰고 싶으세요?', '최근 팀원을 찾았을 때 어떻게 하셨나요?', '제 아이디어가 괜찮지 않나요?'], answer: 1, why: '최근 행동을 물으면 현재 대안과 불편을 구체적으로 알 수 있어요.' },
    { question: '“좋은 아이디어네요”라는 답 다음에 무엇을 물을까요?', options: ['마지막으로 이 문제를 겪었던 상황을 알려주세요.', '그럼 고객 검증이 끝났다고 봐도 될까요?', '친구도 다 좋아하겠죠?'], answer: 0, why: '구체적인 과거 사례를 확인해야 호의적인 말과 실제 필요를 구별해요.' }
  ],
  feedback: {
    first: '정답이에요. 한 번에 맞혔어요.',
    retry: '정답이에요. 다시 풀어서 이해했어요.',
    wrong: '아쉬워요. 다른 문항으로 한 번 더 해볼게요.',
    helped: '괜찮아요, 정답을 함께 볼게요. 학습은 여기서 막히지 않아요.'
  },
  cardValue: { first: '좋다는 말보다, 지난 행동 · 한 번에 이해', retry: '좋다는 말보다, 지난 행동 · 다시 풀어 이해', helped: '좋다는 말보다, 지난 행동 · 설명과 함께 확인' }
};

// prototype/guided.mjs QUESTS.customer 의 “최근 행동·현재 해결 방법” 질문 틀
export const QUESTION_TEMPLATES = [
  '마지막으로 이 문제를 겪은 건 언제였나요? 그때 상황을 들려주세요.',
  '그때는 어떻게 해결하셨어요? 지금도 그 방법을 쓰세요?',
  '그 방법에서 가장 번거롭거나 아쉬웠던 점은 무엇이었나요?'
];
export const AVOID_QUESTION = '이런 서비스가 있으면 쓰실 건가요?';

export const OBSERVATION = {
  label: '가상 예시',
  setup: '같은 질문을 세 명에게 물어봤다고 해볼게요. 이런 답을 들었어요.',
  quotes: [
    '“지난달에도 겪었어요. 그때는 아는 사람한테 물어서 겨우 해결했죠.”',
    '“불편하긴 한데, 지금 방법으로도 그럭저럭 돼요.”',
    '“저는 사실 다른 게 더 급해요. 시간 맞추는 게 제일 힘들어요.”'
  ],
  ask: '당신의 예상과 비교하면 어땠나요?',
  choices: [
    { key: 'supported', label: '예상과 같았어요', card: '예상한 불편이 실제로 있었어요' },
    { key: 'refuted', label: '예상과 달랐어요', card: '예상과 다른 불편이 더 컸어요' }
  ],
  note: {
    supported: '지지하는 단서가 생겼어요. 그래도 세 명은 시작일 뿐이에요.',
    refuted: '가설은 “다시 살펴보기”로 바뀌지만, 알아보고 판단한 경험은 그대로 쌓여요. 반박도 성장이에요.'
  }
};

export const DECISIONS = {
  supported: [
    { key: 'keep', t: '가설을 유지하고 다음 칸으로', d: '불편이 확인됐어요. 가장 작은 첫 버전을 생각해 볼 차례예요.' },
    { key: 'more', t: '두 명 더 들어보기', d: '세 명은 아직 적어요. 같은 질문으로 조금 더 확인해요.' },
    { key: 'narrow', t: '고객을 더 좁히기', d: '가장 크게 불편해한 사람의 공통점으로 대상을 좁혀요.' }
  ],
  refuted: [
    { key: 'narrow', t: '대상을 좁혀 다시 묻기', d: '불편을 크게 느낀 한 사람의 조건으로 대상을 다시 정해요.' },
    { key: 'reframe', t: '문제를 다시 정의하기', d: '사람들이 실제로 말한 더 큰 불편을 새 가설로 세워요.' },
    { key: 'criteria', t: '바꿀 기준부터 정하기', d: '어떤 결과가 나오면 방향을 바꿀지, 전략 학습으로 먼저 정해요.' }
  ]
};

// SPEC-005 기본 경로. 이름·색은 prototype/content.mjs STATS 와 일치 (AC-L2-07)
export const AREAS = [
  { key: 'customer', name: '고객 이해', icon: '◎', q: '누가, 언제, 무엇 때문에 불편할까?' },
  { key: 'product', name: '제품 가치', icon: '◇', q: '쓰고 나면 무엇이 더 좋아질까?' },
  { key: 'market', name: '시장 기회', icon: '◈', q: '이 문제를 어디서 먼저 해결할까?' },
  { key: 'gtm', name: '고객 확보·판매', icon: '↗', q: '어떻게 만나서 쓰거나 사게 할까?' },
  { key: 'finance', name: '수익·재무', icon: '₩', q: '돈이 어떻게 들어오고 얼마나 남을까?' },
  { key: 'operations', name: '실행·운영', icon: '▦', q: '약속한 가치를 계속 전달할 수 있을까?' },
  { key: 'strategy', name: '전략·학습', icon: '✧', q: '지금 무엇을 확인하고 어떤 결정을 할까?' }
];

export const SECTIONS = [
  { id: 'L2S-00', type: 'topbar', anchor: 'top',
    reset: '처음부터', cta: { label: '프로토타입 열기', href: 'prototype' } },

  { id: 'L2S-01', type: 'hero', anchor: 'start',
    eyebrow: '창업 학습 코파일럿 · 프로토타입',
    lines: ['당신의 아이디어,', '한 문장으로 시작해요.'],
    lead: '한 문장을 적어보세요. 페이지를 내려가는 동안 그 문장으로 첫 번째 아이디어 카드를 함께 채워요. 1분이면 충분해요.',
    inputLabel: '어떤 아이디어가 있나요?',
    placeholder: '예: 시간과 역할이 맞는 팀플 동료를 찾아주는 서비스',
    submit: '카드 만들기',
    empty: '한 문장을 적거나 아래 예시 중 하나를 골라주세요.',
    samplesLabel: '예시로 해보기',
    privacy: '입력한 내용은 서버로 전송되지 않고 이 브라우저에만 저장돼요.',
    scrollHint: '아래로 내려가며 카드를 채워요' },

  { id: 'L2S-02', type: 'card', anchor: 'card',
    title: '나의 아이디어 카드',
    progress: '칸 채움',
    trayOpen: '카드 펼치기', trayClose: '카드 접기',
    cta: { label: '이 카드로 프로토타입 시작', href: 'prototype' },
    legend: '흐린 글씨는 예시, 진한 글씨는 내가 채운 칸이에요.',
    announce: '{label} 칸을 채웠어요. {n}/{total}' },

  { id: 'L2S-03', type: 'chapterIdea', anchor: 'idea', no: '01', kicker: '한 문장',
    title: '걱정은 많아도,\n시작은 한 문장이면 돼요.',
    body: '시장 규모, 투자, 이름, 기능 목록… 처음부터 다 정할 필요는 없어요. Vencubator는 한 문장에서 출발해 지금 필요한 것 하나만 꺼내요.',
    worries: ['시장 규모는?', '투자는 언제?', '이름부터 지어야 하나', '앱? 웹?', '경쟁사가 이미 있을까', '기능은 몇 개?', '사업자 등록?', '가격은 얼마로?', '마케팅은 어떻게?'],
    resultLabel: '오늘의 출발점' },

  { id: 'L2S-04', type: 'chapterLearn', anchor: 'learn', no: '02', kicker: '오늘 배울 것',
    title: '오늘 배울 개념은\n딱 하나예요.',
    body: '지금 아이디어에 가장 먼저 필요한 개념부터. 읽고 끝내지 않고, 한 문항으로 바로 확인해요.' },

  { id: 'L2S-05', type: 'chapterApply', anchor: 'apply', no: '03', kicker: '내 아이디어에',
    title: '배운 걸 바로\n내 아이디어에 써봐요.',
    body: '누구에게 물어볼지만 정하면, 방금 배운 방식으로 질문 세 개가 준비돼요.',
    inputLabel: '누구에게 물어볼까요?',
    inputHint: '모든 사람보다, 이번 주에 만날 수 있는 한 사람을 떠올려 보세요.',
    listLabel: '물어볼 질문',
    avoidLabel: '이런 질문은 피해요',
    save: '이 질문으로 저장',
    saved: '카드에 저장했어요' },

  { id: 'L2S-06', type: 'chapterObserve', anchor: 'observe', no: '04', kicker: '해보고 기록',
    title: '물어보고 나면,\n들은 그대로 기록해요.',
    body: '좋은 답만 골라 적지 않아요. 예상과 달랐던 답이 오히려 다음 결정을 쉽게 만들어요.' },

  { id: 'L2S-07', type: 'chapterDecide', anchor: 'decide', no: '05', kicker: '결정',
    title: '다음 방향은\n당신이 정해요.',
    body: 'AI는 선택지를 정리해 줄 뿐이에요. 무엇을 믿고 어디로 갈지는 근거를 보고 직접 골라요.',
    waiting: '먼저 04에서 들은 답을 해석해 주세요. 결과에 따라 선택지가 달라져요.' },

  { id: 'L2S-08', type: 'path', anchor: 'path', kicker: '그다음은',
    title: '알아야 할 건 일곱 가지,\n열리는 건 지금 필요한 하나.',
    body: '고객 이해부터 시작해 한 칸씩 열려요. 방금 관찰에서 “예상과 달랐어요”를 골랐다면 순서가 바뀐 걸 확인해 보세요.',
    currentLabel: '지금', nextLabel: '다음',
    ruleDefault: '기본 순서: 고객 → 제품 → 시장 → 고객 확보 → 수익 → 운영 → 전략',
    ruleRefuted: '고객 가설이 반박되어, 방향을 바꿀 기준을 세우는 전략 학습이 앞당겨졌어요.',
    ruleNote: '이 순서 변경은 정해진 규칙이에요. AI 개인화라고 부르지 않아요.',
    areas: AREAS },

  { id: 'L2S-09', type: 'grow', anchor: 'grow', kicker: '무엇이 자라나',
    title: '자라는 건 점수가 아니라,\n아이디어와 나예요.',
    cols: [
      { tag: '부캐 · 내 프로젝트', t: '아이디어가 자라요', d: '방금 채운 카드처럼 가설·질문·관찰·결정이 쌓여요. 프로젝트마다 따로 자라고, 새 프로젝트에 근거를 복사하지 않아요.', stages: ['가설 정리', '현장 확인', '반복 검토', '의사결정 반영'] },
      { tag: '본캐 · 나의 학습', t: '내가 자라요', d: '이해하고 새 상황에 적용한 개념은 프로젝트가 바뀌어도 남아요. 이미 아는 개념은 건너뛸 수 있어요.', stages: ['이해 확인', '새 상황 적용', '다시 확인'] }
    ],
    note: '탐구 단계는 알아보고 판단한 과정이에요. 사업이 잘될 가능성을 숫자로 약속하지 않아요.' },

  { id: 'L2S-10', type: 'honest', anchor: 'honest', kicker: '솔직한 안내',
    title: '지금은 여기까지 왔어요.',
    rows: [
      { stage: 'S1', name: '프로토타입', status: 'in_progress', label: '진행 중', d: '학습 길, 개념·문제·응용, 내 프로젝트 결과물, 실행 1개. 실제 AI·로그인 없이 브라우저에서 체험' },
      { stage: 'S2', name: 'MVP', status: 'not_started', label: '준비 중', d: '계정과 서버 저장, 실제 AI 인터뷰, 근거·결정 기록, Android 테스트' },
      { stage: 'S3', name: '고도화', status: 'not_started', label: '예정', d: '개인화된 학습 경로, 알림, 두 번째 프로젝트로의 학습 이전' }
    ],
    faqTitle: '자주 묻는 질문',
    faq: [
      { q: '방금 만든 카드는 어디에 저장되나요?', a: '이 브라우저에만 저장돼요. 서버로 보내지 않고, “처음부터”를 누르면 지워져요. 프로토타입으로 넘어가면 아이디어 문장만 첫 입력칸에 미리 채워지고, 퀴즈·관찰·결정은 프로토타입에서 직접 해야 기록돼요.' },
      { q: 'AI가 사업 방향을 정해주나요?', a: '아니요. AI는 질문하고 정리하고 선택지를 설명하는 역할이에요. 방향은 언제나 직접 확정해요. 이 페이지의 질문과 선택지는 AI가 아니라 정해진 템플릿이에요.' },
      { q: '관찰 예시는 실제 인터뷰인가요?', a: '아니요, 가상 예시예요. 실제로는 직접 만난 사람의 답을 기록하고, 그 기록이 근거가 돼요.' },
      { q: '카드가 다 채워지면 사업이 준비된 건가요?', a: '아니요. 카드는 첫 한 바퀴를 돈 기록이에요. 다음 영역으로 넘어가며 같은 방식이 반복돼요.' },
      { q: '매일 해야 하나요?', a: '아니요. 벌점이나 순위 경쟁이 없어요. 할 수 있을 때 한 칸씩 이어가면 돼요.' }
    ] },

  { id: 'L2S-11', type: 'finish', anchor: 'finish', kicker: '이어가기',
    titleDone: '카드 한 장을 완성했어요.',
    titlePartial: '카드가 {n}칸 채워졌어요.',
    body: '같은 문장으로 프로토타입에서 이어가 보세요. 첫 프로젝트 입력칸에 이 문장이 미리 채워져요. 퀴즈·관찰·결정은 프로토타입에서 직접 해야 기록으로 남아요.',
    startApp: '이 문장으로 프로토타입 시작',
    again: '다른 아이디어로 다시 하기' },

  { id: 'L2S-12', type: 'footer', anchor: 'footer',
    notice: 'Vencubator는 현재 프로토타입 단계예요. 이 페이지의 관찰·선택지는 가상 예시와 정해진 템플릿이며, 입력한 내용은 이 브라우저에만 저장돼요.',
    links: [ { label: '제품 기획서', href: 'brief' }, { label: '구현 로드맵', href: 'roadmap' }, { label: '랜딩 v2 명세', href: 'spec' }, { label: '랜딩 v1', href: 'v1' } ],
    copy: '© 2026 Vencubator' }
];
