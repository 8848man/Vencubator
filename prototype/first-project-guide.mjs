// S1 local walkthrough over real app controls.
export const V33_DRAFT_KEY='vencubator.v33.draft.v1';
export const V33_MARK_KEY='vencubator.firstFlow.v1';
export function readV33Transfer(storage,search){
 if(!new URLSearchParams(search).has('v33Guide'))return null;
 try{const mark=JSON.parse(storage.getItem(V33_MARK_KEY)),draft=JSON.parse(storage.getItem(V33_DRAFT_KEY));if(mark?.completedVersion!==1||!draft)return null;return {stage:['sentence','exploring','new'].includes(draft.stage)?draft.stage:'',need:['customer','learning','action'].includes(draft.need)?draft.need:'',time:['five','ten','slow'].includes(draft.time)?draft.time:'',idea:String(draft.idea||'').trim().slice(0,120)};}catch{return null;}
}
export function createFirstProjectGuide({getState,update,go,storage=localStorage,search=location.search}){
 const transfer=readV33Transfer(storage,search);let step=transfer?0:-1,target=null,overlay=null;
 const configs=[
  {selector:'.panel.empty [data-action="new"], .page-heading [data-action="new"]',title:'첫 프로젝트를 시작해요',body:'밝게 표시된 버튼을 눌러 내 아이디어를 프로젝트로 만들어 볼게요.'},
  {selector:'#f-description',title:'아이디어를 한 문장으로',body:'떠오르는 생각을 자유롭게 적어주세요. 앞에서 쓴 문장이 있다면 가져왔어요.'},
  {selector:'#new-form button[type="submit"]',title:'나의 학습 로드맵 열기',body:'이 버튼을 누르면 프로젝트가 실제로 이 브라우저에 저장되고 첫 배움으로 이어져요.'}
 ];
 function clear(){overlay?.remove();overlay=null;target?.classList.remove('v33-guide-target');target=null;}
 function end(){step=-1;clear();const u=new URL(location.href);u.searchParams.delete('v33Guide');history.replaceState(null,'',u.pathname+u.search+u.hash);}
 function position(){if(!overlay||!target)return;const r=target.getBoundingClientRect(),pad=7,W=innerWidth,H=innerHeight,l=Math.max(0,r.left-pad),t=Math.max(0,r.top-pad),right=Math.min(W,r.right+pad),bottom=Math.min(H,r.bottom+pad);const boxes=[[0,0,W,t],[0,bottom,W,H-bottom],[0,t,l,bottom-t],[right,t,W-right,bottom-t]];overlay.querySelectorAll('.v33-guide-scrim').forEach((el,i)=>{const [x,y,w,h]=boxes[i];Object.assign(el.style,{left:`${x}px`,top:`${y}px`,width:`${w}px`,height:`${h}px`});});const card=overlay.querySelector('.v33-guide-card'),cw=card.getBoundingClientRect().width,cl=Math.min(W-cw-14,Math.max(14,r.left+r.width/2-cw/2));card.style.left=`${cl}px`;card.style.transform='none';card.style.setProperty('--pointer-left',`${Math.max(24,Math.min(cw-38,r.left+r.width/2-cl))}px`);card.style.top=bottom+190<H?`${Math.min(bottom+18,H-190)}px`:`${Math.max(12,t-185)}px`;}
 function mount(){clear();if(step<0)return;const c=configs[step];target=step===0?document.querySelector('.panel.empty [data-action="new"]')||document.querySelector('.page-heading [data-action="new"]'):document.querySelector(c.selector);if(!target)return;target.scrollIntoView({block:'center',behavior:'instant'});target.classList.add('v33-guide-target');overlay=document.createElement('div');overlay.id='v33-coach';overlay.setAttribute('aria-label','첫 프로젝트 실습 안내');overlay.innerHTML=`${Array.from({length:4},()=>'<div class="v33-guide-scrim" aria-hidden="true"></div>').join('')}<div class="v33-guide-card" role="status"><span class="v33-guide-count">첫 프로젝트 실습 · ${step+1}/3</span><h2>${c.title}</h2><p>${c.body}</p><div class="v33-guide-actions">${step===1?'<button type="button" data-v33-guide="next">입력했어요 →</button>':''}<button type="button" data-v33-guide="exit">안내 종료</button></div></div>`;document.body.append(overlay);position();target.focus({preventScroll:true});}
 function start(){if(!transfer)return false;const r=update(x=>{if(!x.user){x.user={id:'demo-user',name:'메이커'};x.forms.onboarding={...x.forms.onboarding,completed:true};}x.route={view:'projects',projectId:x.route.projectId};if(transfer.idea&&!x.forms.new?.description)x.forms.new={...x.forms.new,description:transfer.idea};x.forms.onboarding={...x.forms.onboarding,stage:transfer.stage,need:transfer.need,time:transfer.time};});if(!r.ok){step=-1;return false;}return true;}
 function onNew(){if(step!==0)return;step=1;go('new');}
 function onCreated(){if(step===2)end();}
 function afterRender(){if(step>=0)requestAnimationFrame(mount);}
 function captureClick(e){if(step<0)return;const b=e.target.closest('[data-v33-guide]');if(b){e.preventDefault();e.stopImmediatePropagation();if(b.dataset.v33Guide==='exit')end();else if(step===1){const field=document.querySelector('#f-description');if(!field?.value.trim()){field?.focus();return;}step=2;mount();}return;}if(target&&(e.target===target||target.contains(e.target)))return;e.preventDefault();e.stopImmediatePropagation();}
 function captureKey(e){if(step<0)return;if(e.key==='Escape'){e.preventDefault();end();return;}if(e.key==='Tab'){const controls=[target,...overlay.querySelectorAll('button')].filter(Boolean);const i=controls.indexOf(document.activeElement);const n=(i+(e.shiftKey?-1:1)+controls.length)%controls.length;e.preventDefault();controls[n].focus();return;}if((e.key==='Enter'||e.key===' ')&&!((target===document.activeElement||target?.contains(document.activeElement))||overlay?.contains(document.activeElement))){e.preventDefault();e.stopImmediatePropagation();}}
 function captureSubmit(e){if(step<0)return;if(step!==2||e.target.id!=='new-form'){e.preventDefault();e.stopImmediatePropagation();}}
 document.addEventListener('click',captureClick,true);document.addEventListener('keydown',captureKey,true);document.addEventListener('submit',captureSubmit,true);addEventListener('resize',position);addEventListener('scroll',position,true);
 return {start,afterRender,onNew,onCreated,end,get active(){return step>=0;},get step(){return step;}};
}
