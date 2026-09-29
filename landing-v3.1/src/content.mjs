// SPEC-016 §2: 모든 카피·예시·템플릿·링크의 단일 출처. 마크업·로직 없음.
// 섹션 id(L3S-xx)는 SPEC-016 §3 표와 1:1, 배열 순서 = 페이지 순서.
// 퀴즈·질문·관찰·결정·7영역은 v2(SPEC-007)와 같은 내용 — prototype과의 일치는 테스트가 검사한다.

export const SITE = {
  lang: 'ko',
  title: 'Vencubator · 아이디어를 심으면 근거가 뿌리내려요',
  description: '아이디어 한 문장을 이름표에 적어 심어 보세요. 땅속으로 내려갈수록 오늘 배울 것, 물어볼 질문, 들은 답, 내린 결정이 뿌리가 되어 자라요. 1인 빌더를 위한 창업 학습 코파일럿 Vencubator(체험판).',
  brand: 'vencubator',
  variant: 'v31',
  storageKey: 'vencubator.landing.v31',
  limits: { idea: 120, customer: 60 },
  links: {
    // 사이트 루트(/)에 이 랜딩, /app/ 에 앱 (SPEC-009 r0.3). 문장은 같은 출처 저장소로 인계된다.
    prototype: './app/?from=v31'
  }
};

// SPEC-006/007/010 공통 금지 표현
export const CLAIM_BANNED = ['성공률', 'PMF', '% 완성', '보장', 'AI가 결정', 'AI가 대신', '검증 완료', '1위', '누적 사용자'];
export const REQUIRED_NOTICES = ['프로토타입', '가상 예시', '이 브라우저에만'];

export const SAMPLES = [
  {
    "key": "freelance",
    "label": "프리랜서 정산 도구",
    "idea": "프리랜서 개발자의 견적·세금계산서·정산을 한곳에서 처리하는 도구",
    "customer": "외주 3건 이상을 동시에 진행하는 1년 차 프리랜서 개발자"
  },
  {
    "key": "review",
    "label": "쇼핑몰 리뷰 답글",
    "idea": "1인 쇼핑몰 사장님의 리뷰 답글 작성을 도와주는 서비스",
    "customer": "하루 리뷰가 20개 넘게 달리는 1인 스마트스토어 운영자"
  },
  {
    "key": "teamup",
    "label": "팀플 동료 찾기",
    "idea": "시간과 역할이 맞는 대학생 팀플 동료를 찾아주는 서비스",
    "customer": "첫 전공 수업에서 팀원을 구하는 대학 신입생"
  }
];

// 지층 5개 (이름표 + 4개 층). example = 조작하지 않은 방문자에게 보여 줄 “다 쓴 예시 기록” (DP-12)
export const SLOTS = [
  { key: 'idea', label: '이름표', chapter: 'surface', depth: '지상', example: '견적·정산을 한곳에서 끝내는 프리랜서 도구' },
  { key: 'learn', label: '배운 것', chapter: 'learn', depth: '0–15cm', example: '좋다는 말보다 지난 행동을 묻는다' },
  { key: 'ask', label: '물어볼 질문', chapter: 'ask', depth: '15–40cm', example: '프리랜서 3명에게 지난달 정산을 어떻게 했는지' },
  { key: 'observe', label: '들은 답', chapter: 'observe', depth: '40–70cm', example: '정산보다 다음 일감 찾기가 더 급했다' },
  { key: 'decide', label: '결정', chapter: 'decide', depth: '70–100cm', example: '대상을 좁혀 다시 묻기로 했다' }
];
export const STAMPS = { example: '예시 기록', mine: '내 기록', refuted: '방향 전환' };

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
  quotesBySample: {"freelance":["“지난달 정산 때 엑셀 세 개를 오가다 하루를 날렸어요.”","“불편하긴 한데, 세무사한테 한 번에 맡기니까 그럭저럭 돼요.”","“솔직히 정산보다 다음 일감 찾는 게 더 급해요.”"],"review":["“어제도 밤 11시까지 답글 달았어요. 복붙하면 티가 나서요.”","“답글은 그냥 짧게 달고 말아요. 그걸로 문제는 없었어요.”","“답글보다 악성 리뷰 대응이 제일 스트레스예요.”"],"teamup":["“지난달에도 겪었어요. 그때는 아는 사람한테 물어서 겨우 해결했죠.”","“불편하긴 한데, 지금 방법으로도 그럭저럭 돼요.”","“저는 사실 다른 게 더 급해요. 시간 맞추는 게 제일 힘들어요.”"]},
  quotesGeneric: ["“지난달에도 이 문제를 겪었어요. 그때는 아는 사람한테 물어서 겨우 해결했죠.”","“불편하긴 한데, 지금 방법으로도 그럭저럭 돼요.”","“사실 저한테는 다른 게 더 급해요.”"],
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
  { id: 'L3S-00', type: 'topbar', anchor: 'top',
    reset: '처음부터', cta: { label: '앱 시작하기', href: 'prototype' } },

  { id: 'L3S-01', type: 'surface', anchor: 'surface',
    hook: '아이디어는 있는데, 뭘 먼저 확인해야 할지 몰라 멈춰 있나요?',
    eyebrow: '1인 빌더를 위한 창업 학습 코파일럿 · 체험판',
    lines: ['아이디어를 심으면,', '근거가 뿌리내려요.'],
    lead: '떠오른 아이디어를 이름표에 한 문장으로 적어 심어 보세요. 아래로 내려갈수록 오늘 배울 것, 물어볼 질문, 들은 답, 내린 결정이 뿌리가 되어 자라요.',
    tagLabel: '이름표에 적을 아이디어 한 문장',
    placeholder: '예: 시간과 역할이 맞는 팀플 동료를 찾아주는 서비스',
    submit: '심기',
    empty: '이름표에 한 문장을 적거나 아래 예시를 골라 주세요.',
    samplesLabel: '예시로 심어 보기',
    appLink: '가입 없이 바로 앱에서 시작하기 →',
    privacy: '적은 내용은 서버로 보내지 않고 이 브라우저에만 저장돼요.',
    down: '땅속으로 내려가 보기',
    typing: ['견적·정산을 한곳에서 끝내는 프리랜서 도구', '리뷰 답글을 도와주는 1인 쇼핑몰 서비스', '시간과 역할이 맞는 팀플 동료 찾기'] },

  { id: 'L3S-02', type: 'gauge', anchor: 'gauge',
    label: '깊이', unit: 'cm', ground: '지상',
    legendMine: '실선 · 내가 채운 뿌리', legendExample: '점선 · 예시 기록' },

  { id: 'L3S-03', type: 'layerLearn', why: "주변에서 “좋다”고 했는데 아무도 쓰지 않았다면, 이 개념 하나로 설명돼요.", anchor: 'learn', depth: '0–15cm', stratum: '겉흙', meaning: '오늘 배울 것',
    title: '뿌리가 처음 닿는 곳에는\n개념이 하나 있어요.',
    body: '지금 아이디어에 가장 먼저 필요한 개념 한 가지. 읽고 끝내지 않고 한 문항으로 바로 확인해요.' },

  { id: 'L3S-04', type: 'layerAsk', why: "인터뷰가 막막한 건 용기가 없어서가 아니라, 물어볼 질문이 없어서예요.", anchor: 'ask', depth: '15–40cm', stratum: '속흙', meaning: '물어볼 질문',
    title: '배운 걸 내 아이디어에 대면\n질문이 생겨요.',
    body: '누구에게 물어볼지만 정하면, 방금 배운 방식으로 질문 세 개가 준비돼요.',
    inputLabel: '누구에게 물어볼까요?',
    inputHint: '모든 사람보다, 이번 주에 만날 수 있는 한 사람.',
    listLabel: '물어볼 질문',
    avoidLabel: '이런 질문은 피해요',
    save: '이 질문으로 기록',
    saved: '뿌리에 기록했어요' },

  { id: 'L3S-05', type: 'layerObserve', why: "예상과 다른 답은 실패가 아니라, 헛수고를 줄여 주는 신호예요.", anchor: 'observe', depth: '40–70cm', stratum: '깊은 흙', meaning: '들은 답',
    title: '예상과 다른 답을 만나면,\n뿌리는 방향을 틀어요.',
    body: '좋은 답만 골라 적지 않아요. 막힌 쪽으로 뻗었던 뿌리도 기록으로 남고, 다음 방향을 정하는 근거가 돼요.',
    turnNote: '뿌리가 방향을 틀었어요. 막힌 쪽 뿌리도 그대로 남아요.' },

  { id: 'L3S-06', type: 'layerDecide', why: "틀려도 괜찮아요. 방향을 바꾼 기록도 뿌리로 남아요.", anchor: 'decide', depth: '70–100cm', stratum: '깊은 흙', meaning: '결정',
    title: '어디로 뻗을지는\n당신이 정해요.',
    body: 'AI는 선택지를 정리해 줄 뿐이에요. 들은 답을 근거로 다음 방향을 직접 골라요.',
    waiting: '먼저 바로 위 층에서 들은 답을 해석해 주세요. 결과에 따라 갈 수 있는 방향이 달라져요.' },

  { id: 'L3S-07', type: 'rootMap', anchor: 'roots', depth: '100cm 아래', stratum: '부엽토', meaning: '앞으로 자랄 영역',
    title: '일곱 갈래 중,\n지금 자라는 건 한 갈래.',
    body: '창업에 필요한 일곱 가지 질문이 뿌리 갈래처럼 뻗어 있어요. 한 번에 다 키우지 않고, 지금 필요한 갈래 하나만 자라요.',
    nowLabel: '지금 자라는 갈래', nextLabel: '다음 갈래',
    ruleDefault: '기본 순서는 고객 이해에서 시작해 전략·학습으로 이어져요.',
    ruleRefuted: '들은 답이 예상과 달라서, 방향을 바꿀 기준을 세우는 전략·학습 갈래가 다음으로 당겨졌어요.',
    ruleNote: '들은 답에 따라 다음 갈래는 달라질 수 있어요. 어느 쪽으로 뻗을지는 언제나 직접 정해요.',
    areas: AREAS },

  { id: 'L3S-08', type: 'aboveBelow', anchor: 'grow',
    title: '위로는 아이디어가, 아래로는 내가 자라요.',
    above: { tag: '땅 위 · 부캐', t: '줄기와 잎은 프로젝트예요', d: '가설·질문·관찰·결정이 쌓여 프로젝트가 자라요. 새 프로젝트를 심으면 새 줄기가 올라와요. 근거는 옮겨 심지 않아요.', stages: ['가설 정리', '현장 확인', '반복 검토', '의사결정 반영'] },
    below: { tag: '땅속 · 본캐', t: '뿌리는 나의 학습이에요', d: '이해하고 새 상황에 적용한 개념은 뿌리처럼 남아요. 다른 프로젝트를 심어도 이미 뻗은 뿌리는 그대로예요.', stages: ['이해 확인', '새 상황 적용', '다시 확인'] },
    note: '뿌리의 깊이는 알아보고 판단한 과정이에요. 사업이 잘될 가능성을 숫자로 약속하지 않아요.' },

  { id: 'L3S-09', type: 'honest', anchor: 'honest',
    title: '지금은 씨앗 단계예요.',
    lead: '서두르지 않고, 먼저 써 보는 분들의 이야기를 들으며 한 단계씩 키우고 있어요. 날짜를 약속하기보다 준비된 것부터 열어 둘게요.',
    // stage·status 는 화면에 쓰지 않는다. 진행 상태가 STATE.json 과 어긋나지 않는지 테스트가 확인한다(AC-L3-07)
    rows: [
      { stage: 'S1', status: 'in_progress', when: '지금', name: '체험판', label: '지금 여기', plant: 'seed',
        t: '가입 없이 바로 써 봐요',
        items: ['아이디어 한 문장으로 첫 프로젝트 시작', '짧은 개념 퀴즈로 배우고 내 아이디어에 바로 적용', '물어볼 질문 만들기, 들은 답 기록, 다음 방향 정하기'],
        note: 'AI 대화와 고객 반응은 아직 가상 예시예요. 기록은 이 브라우저에만 남아요.' },
      { stage: 'S2', status: 'not_started', when: '다음', name: '첫 정식 버전', label: '준비 중', plant: 'sprout',
        t: '내 기록을 어디서든 이어서',
        items: ['계정으로 휴대폰과 PC 어디서든 이어 쓰기', '실제 AI와 함께 인터뷰 질문 다듬기', '들은 답과 내린 결정을 한눈에 정리', '안드로이드 앱 시범 운영'],
        note: '체험판을 써 본 분들의 이야기를 먼저 반영해요.' },
      { stage: 'S3', status: 'not_started', when: '그다음', name: '더 똑똑한 코파일럿', label: '계획 중', plant: 'tree',
        t: '나에게 맞춰 자라요',
        items: ['내 속도와 관심에 맞춘 학습 길', '잊지 않도록 다음 할 일 알림', '두 번째 아이디어에도 배운 것을 그대로'],
        note: '뿌리(배운 것)는 새 프로젝트를 심어도 그대로 이어져요.' }
    ],
    faqTitle: '자주 묻는 질문',
    faq: [
      { q: '이름표에 쓴 문장은 어디에 저장되나요?', a: '이 브라우저에만 저장돼요. 서버로 보내지 않고, “처음부터”를 누르면 지워져요. 앱으로 넘어가면 문장만 첫 입력칸에 미리 채워지고, 퀴즈·관찰·결정은 앱에서 직접 해야 기록돼요.' },
      { q: 'AI가 사업 방향을 정해주나요?', a: '아니요. AI는 질문하고 정리하고 선택지를 설명하는 역할이에요. 방향은 언제나 직접 확정해요. 이 페이지의 질문과 선택지는 AI가 아니라 정해진 템플릿이에요.' },
      { q: '들은 답 예시는 실제 인터뷰인가요?', a: '아니요, 가상 예시예요. 실제로는 직접 만난 사람의 답을 기록하고, 그 기록이 근거가 돼요.' },
      { q: '뿌리가 깊으면 사업이 준비된 건가요?', a: '아니요. 뿌리는 첫 한 바퀴를 돈 기록이에요. 다음 갈래로 넘어가며 같은 방식이 반복돼요.' },
      { q: '매일 해야 하나요?', a: '아니요. 벌점이나 순위 경쟁이 없어요. 할 수 있을 때 한 층씩 내려가면 돼요.' }
    ] },

  { id: 'L3S-10', type: 'harvest', anchor: 'harvest',
    eyebrow: '다시 지상으로',
    titleDone: '뿌리가 다 내렸어요. 이제 진짜로 심어 볼까요?',
    titlePartial: '뿌리가 {n}층까지 내렸어요.',
    titleNone: '예시 뿌리를 따라 끝까지 내려왔어요.',
    body: '같은 이름표로 앱에서 시작해요. 첫 프로젝트 입력칸에 이 문장이 미리 채워져요. 앱에서는 가상 예시가 아니라 내 진짜 고객과 한 바퀴를 돌기 때문에, 퀴즈·관찰·결정은 거기서 새로 기록해요.',
    cta: '이 이름표로 앱에서 심기',
    again: '다른 아이디어 심기' },

  { id: 'L3S-11', type: 'footer', anchor: 'footer',
    notice: 'Vencubator는 지금 체험판(프로토타입)이에요. 이 페이지의 들은 답과 선택지는 가상 예시이고, 적은 내용은 서버로 보내지 않고 이 브라우저에만 저장돼요.',
    links: [ { label: '앱 시작하기', href: 'prototype' } ],
    copy: '© 2026 Vencubator' }
];

// SPEC-016 §5.1 — L3I-10
export const NEXT = [
  {layer:'surface',to:'learn',label:'이 이름표로 내려가기 · 오늘 배울 것 ↓'},
  {layer:'learn',to:'ask',label:'더 깊이 뿌리 뻗기 · 물어볼 질문 만들기 ↓'},
  {layer:'ask',to:'observe',label:'더 깊이 뿌리 뻗기 · 들은 답 해석하기 ↓'},
  {layer:'observe',to:'decide',label:'더 깊이 뿌리 뻗기 · 다음 방향 정하기 ↓'},
  {layer:'decide',to:'roots',label:'뿌리 지도 보기 · 앞으로 자랄 영역 ↓'},
  {layer:'roots',to:'harvest',label:'다시 지상으로 · 앱에서 이어가기 ↓'}
];
export const NEXT_COPY = {app:'여기까지 하고 앱에서 이어하기 →',live:'다음 층이 열렸어요'};

export const CTA_COPY = {first:'언제든 여기서 앱으로 옮겨 심을 수 있어요',complete:'이 이름표로 앱에서 이어갈 수 있어요',progress:'내가 채운 층 {n}/5'};

export const PAIN = {title:'이런 적 있나요?',hint:'가장 가까운 하나를 골라 주세요. 고르지 않아도 계속할 수 있어요.',lineDefault:SECTIONS.find(s=>s.anchor==='learn').body,options:[
  {
    "key": "build",
    "label": "주말마다 기능은 늘었는데, 쓸 사람이 있는지는 모르겠어요",
    "line": "만들기 전에 “누가, 언제 불편한지”부터 확인하는 방법이에요."
  },
  {
    "key": "praise",
    "label": "주변에선 다 좋다는데, 막상 쓰는 사람이 없어요",
    "line": "그 “좋아요”가 왜 믿기 어려운지부터 볼게요."
  },
  {
    "key": "interview",
    "label": "고객 인터뷰를 하라는데, 뭘 물어야 할지 모르겠어요",
    "line": "좋은 질문의 기준 하나만 알면, 질문은 금방 만들어져요."
  },
  {
    "key": "late",
    "label": "다 만들고 나서야 “이거 누가 쓰지?”가 떠올랐어요",
    "line": "다음 아이디어는 순서를 바꿔, 묻고 나서 만들어 봐요."
  }
]};
