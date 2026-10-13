// 제공된 54장 스크린샷의 순서/역할을 해석한 UX 연구용 시뮬레이션.
// 화면 내용은 Vencubator의 학습→적용→현장 확인 첫 루프로 번안하며 답변은 메모리 안에만 둔다.
const intro = [
  ['아이디어를 실험 가능한 질문으로', '떠오른 생각을 바로 사업 성과로 판단하지 않고, 확인할 가설 한 줄로 바꿉니다.', '💡', '❓'],
  ['배운 것을 내 프로젝트에 써 봐요', '짧은 개념 학습이 내 아이디어에 어떻게 적용되는지 보여 줍니다.', '📖', '✍️'],
  ['고객의 말로 다시 확인해요', 'AI가 만든 예시와 실제 사람에게 들은 답을 구분해 기록합니다.', '💬', '🧭'],
  ['오늘 할 수 있는 한 걸음부터', '큰 사업 계획보다 작은 확인 행동 하나를 제안합니다.', '📝', '↗'],
  ['가설이 틀려도 배움이 남아요', '반박된 가설 역시 다음 결정을 위한 근거가 됩니다.', '🔎', '🌱'],
  ['내가 결정한 이유가 쌓여요', '학습·적용·관찰·결정의 흔적을 한 프로젝트 안에서 이어 봅니다.', '📚', '🧩'],
  ['이제 당신의 시작점을 맞춰 볼게요', '제품 약속을 본 뒤, 필요한 질문만 짧게 묻는 전환입니다.', '✦', '→'],
].map(([title,desc,a,b])=>({kind:'intro',title,desc,icons:[a,b]}));

const q = (title,desc,options,key)=>({kind:'question',title,desc,options,key});
const explain = (title,desc,a,b)=>({kind:'explain',title,desc,icons:[a,b]});
const questions = [
  explain('지금부터 한 가지씩 물어볼게요','답은 첫 화면을 맞추는 데만 쓰입니다. 사업성 평가나 능력 점수가 아닙니다.','💡','?'),
  q('오늘 얼마나 살펴볼 수 있나요?','부담 없는 시작 속도를 고르세요.',['5분만 가볍게','10분쯤 집중해서','시간을 정하지 않을래요'],'time'),
  q('아이디어는 지금 어디쯤 있나요?','한 문장이 없어도 시작할 수 있습니다.',['한 문장으로 있어요','여러 생각을 비교 중이에요','아직 아이디어가 없어요'],'stage'),
  q('가장 막막한 지점은 무엇인가요?','첫 학습 주제를 고르는 데 참고합니다.',['누구의 문제인지','고객에게 무엇을 물을지','오늘 무엇을 할지','아직 모르겠어요'],'barrier'),
  q('이번에 얻고 싶은 것은?', '답을 기반으로 첫 행동의 표현을 맞춥니다.',['아이디어를 분명히 하기','고객의 경험 듣기','작은 실험 시작하기','일단 둘러보기'],'goal'),
  explain('질문은 곧 내 프로젝트로 이어져요','선택값을 확정된 사업 정보로 다루지 않고 첫 제안의 시작점으로만 씁니다.','❓','📝'),
  q('창업 학습 경험은 어느 쪽인가요?','설명의 깊이를 맞추는 자기 보고 질문입니다.',['처음이에요','조금 해 봤어요','이미 진행 중이에요'],'experience'),
  q('먼저 무엇을 해 보고 싶나요?','진입 후 안내할 첫 행동을 고릅니다.',['개념 하나 배우기','내 가설 쓰기','고객 질문 만들기','잘 모르겠어요'],'first'),
  q('관심 있는 문제 영역이 있나요?','아이디어의 주제는 나중에도 바꿀 수 있습니다.',['생활의 불편','일·생산성','배움·성장','아직 정하지 않음'],'area'),
  q('지금 가진 근거는 무엇인가요?','추측과 실제 관찰을 구분합니다.',['내 경험','주변 사람의 이야기','직접 들은 고객 답','아직 없어요'],'evidence'),
  q('고객에게 직접 물어본 적 있나요?','첫 현장 확인 과제의 난도를 맞춥니다.',['있어요','아직 없어요','누구에게 물어볼지 모르겠어요'],'interview'),
  q('어떤 도움부터 받으면 좋을까요?','내가 고른 시작점을 다시 확인합니다.',['짧은 설명','질문 예시','실행 과제','일단 직접 선택'],'support'),
];

const middle = [
  explain('배움과 검증이 한 고리로 이어져요','개념을 읽고 끝내지 않고 내 가설에 적용해 현실에서 확인합니다.','📖','🔎'),
  explain('고객의 답은 내 추측과 달라도 좋아요','맞고 틀림보다 무슨 증거가 생겼는지 남기는 방식입니다.','💭','💬'),
  q('처음 고객에게 다가갈 때 어떤가요?','부담 정도에 따라 첫 질문의 크기를 조정합니다.',['해 볼 만해요','조금 막막해요','먼저 연습해 볼래요'],'confidence'),
  q('직접 관찰한 경험을 적을 수 있나요?','실제 관찰과 가상 예시를 분리합니다.',['네, 한 가지 있어요','아직 없어요'],'observation'),
  q('첫 프로젝트 주제를 정했나요?','없다면 빈 프로젝트에서 함께 시작합니다.',['네, 정했어요','몇 가지 후보가 있어요','아직 고민 중이에요'],'decided'),
  explain('완벽한 계획 없이도 시작할 수 있어요','한 문장 가설과 한 번의 고객 확인으로 첫 루프를 만듭니다.','💡','🧭'),
];

const bridge = [
  {kind:'summary',title:'내 첫 시작점을 정리했어요',desc:'선택을 요약하지만 사업성 평가나 자동 추천 결과는 아닙니다. 언제든 수정할 수 있습니다.'},
  q('어떤 방식이 편한가요?','원본의 추가 프로필 화면 자리에 제품에 필요한 학습 선호만 묻습니다.',['짧게 읽고 적용','예시부터 보기','직접 써 보며 배우기'],'learning'),
  q('함께 확인할 사람을 떠올렸나요?','민감한 개인 정보 대신 첫 고객 접점을 생각해 봅니다.',['한 명 떠올랐어요','어디서 만날지 고민 중','아직 모르겠어요'],'contact'),
  q('시작 전에 가장 필요한 것은?','설명과 실습 중 어느 쪽을 먼저 볼지 정합니다.',['개념 하나','질문 예시','프로젝트 입력','우선 둘러보기'],'start'),
  explain('시작점을 준비하고 있어요','사용자가 고른 답을 안전하게 되돌려주는 전환입니다.','💡','🧭'),
  explain('첫 프로젝트의 자리가 생겼어요','원본의 맞춤 결과 연출을 프로젝트 시작 카드로 바꿉니다.','🗂️','✨'),
  explain('정답보다 다음 질문이 중요해요','검증 전의 확신을 성과로 표현하지 않습니다.','❓','🔎'),
  explain('아이디어 한 문장부터 써 볼까요?','설명에서 실제 앱 행동으로 넘어갑니다.','✍️','→'),
  explain('오늘은 한 번 확인하면 충분해요','첫 프로젝트 만들기 직전의 작은 약속입니다.','📝','⚡'),
];

const coach = (title,desc,action)=>({kind:'coach',title,desc,action});
const guided = [
  coach('첫 프로젝트를 시작해요','빈 프로젝트의 시작 화면을 엽니다.','프로젝트 만들기'),
  coach('아이디어를 한 문장으로 써요','아직 없다면 가상의 예시를 보고 넘어갈 수 있습니다.','아이디어 적기'),
  coach('이 문장이 가설이 됩니다','누구의 어떤 문제인지 임시로 적습니다.','가설 초안 보기'),
  coach('누구에게 확인할까요?','가설의 대상이 되는 사람 한 명을 떠올립니다.','대상 정하기'),
  coach('개념 하나만 배워요','지금 필요한 개념을 짧게 살펴봅니다.','학습 카드 열기'),
  coach('내 말로 이해해 봐요','개념 확인 질문에 직접 답해 봅니다.','이해 확인하기'),
  coach('내 아이디어에 적용해요','배운 개념을 프로젝트 문장에 연결합니다.','적용 메모 쓰기'),
  coach('고객에게 물을 질문을 만들어요','의견이 아닌 최근 실제 경험을 묻는 질문을 만듭니다.','질문 예시 보기'),
  coach('연습 답과 실제 답을 나눠요','AI 예시는 연습용이며 고객 증거가 아닙니다.','증거 구분하기'),
  coach('오늘의 현장 과제를 정해요','누구에게 언제 물어볼지 작은 행동으로 적습니다.','확인 과제 만들기'),
  coach('들은 말을 그대로 기록해요','기억 대신 관찰한 사실을 남깁니다.','관찰 기록 열기'),
  coach('추측을 따로 표시해요','내 해석과 상대의 말을 분리합니다.','추측 구분하기'),
  coach('새로 알게 된 점은?', '예상과 다른 답도 배움으로 남깁니다.','회고 한 줄 쓰기'),
  coach('다음 결정을 고릅니다','유지·수정·다시 확인 중 다음 행동을 정합니다.','다음 결정 보기'),
  coach('로드맵으로 돌아와요','내 프로젝트의 다음 학습을 확인합니다.','로드맵 열기'),
  coach('진행은 근거와 함께 남아요','점수보다 어떤 행동을 했는지 살펴봅니다.','진행 기록 보기'),
  coach('프로젝트 카드에 모입니다','가설·배움·고객 확인·결정을 한 곳에서 봅니다.','프로젝트 보기'),
  coach('언제든 이어서 할 수 있어요','저장한 첫 프로젝트로 돌아오는 위치를 알려 줍니다.','홈으로 가기'),
  coach('다음 한 걸음이 보여요','첫 실행 코치마크를 마칩니다.','안내 마치기'),
  {kind:'complete',title:'첫 프로젝트의 시작을 체험했어요',desc:'마이루틴의 흐름 구조를 벤큐베이터의 핵심 행동인 학습·적용·실제 고객 확인으로 바꾼 시뮬레이션입니다.'},
];

export const screens = [...intro,...questions,...middle,...bridge,...guided];
if (screens.length !== 54) throw new Error(`reference flow expected 54 screens, got ${screens.length}`);
export function phaseFor(index){return index<7?0:index<19?1:index<25?2:index<34?3:4}
export const phaseNames=['왜 시작하나요','내 아이디어의 지금','배움과 확인의 관계','맞춤 시작점','첫 프로젝트 실습'];

if (typeof document !== 'undefined') {
  let index=0, draftIdea='';
  const answers=new Map(), done=new Set();
  const $=id=>document.getElementById(id);
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
  function art(s){const box=el('div','illustration');for(const icon of s.icons){box.append(el('span',icon==='↗'||icon==='→'?'arrow':'',icon))}return box}
  function render(){
    const s=screens[index], phase=phaseFor(index), screen=$('screen');screen.replaceChildren();screen.scrollTop=0;
    $('phase-label').textContent=phaseNames[phase];$('frame-count').textContent=`${String(index+1).padStart(2,'0')} / 54`;
    $('progress-bar').style.width=`${((index+1)/54)*100}%`;
    document.querySelectorAll('[data-jump]').forEach((b,i)=>{b.classList.toggle('active',i===phase);b.setAttribute('aria-current',i===phase?'step':'false')});
    screen.append(el('p','kicker',`REFERENCE FLOW · ${String(index+1).padStart(2,'0')}`),el('h2','',s.title),el('p','desc',s.desc));
    if(s.kind==='intro'||s.kind==='explain'){
      if(index===6||index===29){const mascot=el('div','mascot');mascot.append(el('i'),el('b','', '✦'));screen.append(mascot)}
      screen.append(art(s));
      const insight=el('div','insight',s.kind==='intro'?'관찰: 가치를 먼저 보여 준 뒤, 맞춤 질문의 이유를 만듭니다.':'관찰: 질문 사이에 설명을 넣어 응답이 어디에 쓰이는지 이해시킵니다.');screen.append(insight);
    }
    if(s.kind==='question'){
      const mascot=el('div','mascot');mascot.append(el('i'),el('b','', '✦'));screen.append(mascot);
      const list=el('div','options');s.options.forEach((option)=>{const button=el('button','',option);button.type='button';button.classList.toggle('selected',answers.get(s.key)===option);button.setAttribute('aria-pressed',String(answers.get(s.key)===option));button.addEventListener('click',()=>{answers.set(s.key,option);render()});list.append(button)});screen.append(list);
    }
    if(s.kind==='summary'){
      const grid=el('div','summary-grid');for(const [label,value] of [['내가 쓸 수 있는 시간',answers.get('time')||'아직 선택하지 않음'],['아이디어의 지금',answers.get('stage')||'아직 선택하지 않음'],['먼저 할 행동',answers.get('first')||answers.get('goal')||'아직 선택하지 않음'],['막막한 지점',answers.get('barrier')||'아직 선택하지 않음']]){const row=el('div','summary-row');row.append(el('b','',label),el('span','',value));grid.append(row)}screen.append(grid,el('div','insight','선택은 시작 문구를 맞추는 데만 씁니다. 사업성 진단이나 검증된 추천은 아닙니다.'));
    }
    if(s.kind==='coach'){
      screen.append(el('div','coach',s.desc));const app=el('div','demo-app');const top=el('div','demo-top');top.append(el('strong','','내 프로젝트'),el('span','','＋'));app.append(top);const week=el('div','demo-week');for(const word of ['생각','배움','적용','확인'])week.append(el(word==='적용'?'b':'span','',word));app.append(week);for(const name of [draftIdea?`💡  ${draftIdea}`:'💡  문제 가설 한 줄','📖  필요한 개념 하나','🔎  고객에게 확인할 질문']){const row=el('div','demo-routine');row.append(el('span','',name));app.append(row)}screen.append(app);const actions=el('div','action-list');const action=el('button','',`☝  ${s.action}`);action.type='button';action.addEventListener('click',()=>{done.add(index);next()});actions.append(action);if(index===35){const field=el('input','field');field.placeholder='예: 혼자 일하는 사람이 고객 인터뷰를 시작하기 어렵다';field.maxLength=100;field.value=draftIdea;field.setAttribute('aria-label','아이디어 한 문장');field.addEventListener('input',()=>{draftIdea=field.value.trim()});actions.prepend(field)}screen.append(actions);
    }
    if(s.kind==='complete'){
      const mascot=el('div','mascot');mascot.append(el('i'),el('b','', '✦'));screen.append(mascot,el('div','insight','벤큐베이터 적용 포인트: 가치 약속 → 한 화면 한 질문 → 내 선택 요약 → 첫 프로젝트·학습·현장 확인. 실제 앱 온보딩은 이 54장 구조를 짧은 6단계로 압축했습니다.'));
      const app=el('a','back-link','벤큐베이터 앱 열기 ↗');app.href='/app/';app.style.display='block';app.style.marginTop='22px';screen.append(app);
    }
    $('prev').disabled=index===0;
    $('next').disabled=s.kind==='question'&&!answers.has(s.key)||s.kind==='coach'&&!done.has(index);
    $('next').textContent=index===53?'처음부터 다시':'다음 →';
  }
  function next(){if(index===53){index=0;answers.clear();done.clear();draftIdea=''}else index++;render()}
  $('prev').addEventListener('click',()=>{if(index>0){index--;render()}});
  $('next').addEventListener('click',()=>{if(!$('next').disabled)next()});
  $('reset').addEventListener('click',()=>{index=0;answers.clear();done.clear();draftIdea='';render()});
  document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{index=Number(b.dataset.jump);render();$('phone').focus()}));
  document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowLeft'&&index>0){index--;render()}if(e.key==='ArrowRight'&&!$('next').disabled)next()});
  render();
}
