// Presentation only: never writes project state or delays a user action.
export const MOTION = Object.freeze({enter:260, stagger:50, maxDelay:200, distance:10});
export function screenMotionKey(state,{variant=0,application=false,preview=false}={}){
 const p=state.projects.find(p=>p.id===state.route.projectId),r=state.route;
 const run=p?.learningRuns?.[`${p.scopeVersion}:${r.concept}`];
 return JSON.stringify([!!state.user,r.view,r.projectId,r.concept,run?.step,run?.variant,r.taskId,r.fieldTaskId,
  run?p?.uiDraft?.[`question:${run.scopeVersion}:${run.concept}:${run.step}:${run.variant}`]?.panel:null,
  r.view==='interview'?p?.step:null,r.view==='quiz'?[variant,application]:null,r.view==='evidence'?preview:null]);
}
export function orderedMotionGroups(items){
 return [...items].sort((a,b)=>a.top-b.top||a.left-b.left).map((item,i)=>({...item,delay:Math.min(i*MOTION.stagger,MOTION.maxDelay)}));
}
const containers='.narrow,.learn-layout,.learning-path,.journey-side,.guided-session,.lesson-paper,.dashboard-grid,.bottom-grid,.stats-grid,.projects-grid,.knowledge-grid,.history,.two-col,.lesson-finish';
function groups(root){
 return [...root.children].flatMap(el=>{
  if(el.matches('footer,script,style,.footer-note')||el.hidden)return [];
  if(el.matches(containers))return groups(el);
  return [el];
 });
}
export function createMotion(doc=document){
 let lastScreen=null,lastFeedback=null;
 return function paint(screen){
  const root=doc.querySelector('main');if(!root)return;
  const feedback=root.querySelector('.answer-feedback,.quiz-result');
  const feedbackKey=feedback?`${screen}:${feedback.textContent}`:null;
  if(screen!==lastScreen){
   const items=groups(root).map(el=>({el,top:el.getBoundingClientRect().top,left:el.getBoundingClientRect().left}));
   for(const {el,delay} of orderedMotionGroups(items)){
    el.style.setProperty('--enter-delay',`${delay}ms`);el.classList.add('motion-enter');
   }
  }else if(feedback&&feedbackKey!==lastFeedback)feedback.classList.add('motion-feedback');
  lastScreen=screen;lastFeedback=feedbackKey;
 };
}
export function installPressFeedback(doc=document,win=window){
 let pressed=null,origin=null,pointerId=null;
 const reset=()=>{pressed?.classList.remove('is-pressed');pressed=null;origin=null;pointerId=null;};
 const targetOf=target=>{
  const el=target.closest?.('button,.choice,summary,a.btn');
  return el&&!el.matches(':disabled,[aria-disabled="true"]')&&!el.querySelector('input:disabled')?el:null;
 };
 doc.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;reset();pressed=targetOf(e.target);
  if(pressed){origin=[e.clientX,e.clientY];pointerId=e.pointerId;pressed.classList.add('is-pressed');pressed.addEventListener('pointerleave',reset,{once:true});}
 });
 doc.addEventListener('pointermove',e=>{if(origin&&e.pointerId===pointerId&&Math.hypot(e.clientX-origin[0],e.clientY-origin[1])>10)reset();},{passive:true});
 for(const event of ['pointerup','pointercancel','dragstart','focusout'])doc.addEventListener(event,reset);
 doc.addEventListener('keydown',e=>{if(!e.repeat&&[' ','Enter'].includes(e.key)){reset();pressed=targetOf(e.target);pressed?.classList.add('is-pressed');}});
 doc.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key))reset();});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)reset();});win.addEventListener('blur',reset);
}
