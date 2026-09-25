import test from 'node:test';
import assert from 'node:assert/strict';
import {blankStore,createProject} from '../domain.mjs';
import {screenMotionKey,orderedMotionGroups,installPressFeedback,createMotion} from '../motion.mjs';

test('screen identity ignores autosave and answers, but changes for lesson variant and step',()=>{
 const s=blankStore();createProject(s,{id:'motion',name:'Motion',description:'가상 모션 검사 프로젝트'});
 s.route={view:'session',projectId:'motion',concept:'customer'};const p=s.projects[0];
 p.learningRuns={[`${p.scopeVersion}:customer`]:{step:'question',variant:0,results:{}}};
 const key=screenMotionKey(s);p.uiDraft.note='입력 저장';p.learningRuns[`${p.scopeVersion}:customer`].results.question={correct:false};
 assert.equal(screenMotionKey(s),key);
 p.learningRuns[`${p.scopeVersion}:customer`].variant=1;assert.notEqual(screenMotionKey(s),key);
 const second=screenMotionKey(s);p.learningRuns[`${p.scopeVersion}:customer`].step='apply';assert.notEqual(screenMotionKey(s),second);
});
test('visual top-to-bottom order caps the total entrance delay',()=>{
 const groups=orderedMotionGroups([{id:'bottom',top:900,left:0},{id:'right',top:20,left:500},{id:'left',top:20,left:0},...Array.from({length:8},(_,i)=>({id:i,top:100+i,left:0}))]);
 assert.deepEqual(groups.slice(0,2).map(g=>g.id),['left','right']);assert.equal(groups.at(-1).id,'bottom');
 assert.equal(groups.at(-1).delay,200);assert.ok(groups.every((g,i)=>!i||g.delay>=groups[i-1].delay));
});
test('same-screen replacement does not replay groups; only a newly visible result animates',()=>{
 const classes=()=>({added:[],add(v){this.added.push(v);}});
 let feedback=null;const make=()=>({children:[],matches:()=>false,hidden:false,style:{setProperty(){}},classList:classes(),getBoundingClientRect:()=>({top:20,left:0})});
 const root={children:[make()],querySelector:()=>feedback},paint=createMotion({querySelector:()=>root});
 paint('question');assert.deepEqual(root.children[0].classList.added,['motion-enter']);
 root.children=[make()];feedback={textContent:'새 결과',classList:classes()};paint('question');
 assert.deepEqual(root.children[0].classList.added,[]);assert.deepEqual(feedback.classList.added,['motion-feedback']);
 feedback={textContent:'새 결과',classList:classes()};paint('question');assert.deepEqual(feedback.classList.added,[]);
 paint('apply');assert.deepEqual(root.children[0].classList.added,['motion-enter']);
});
test('press cancels on scrolling, pointercancel, keyup and window blur; disabled excluded',()=>{
 const handlers={},winHandlers={},set=new Set();let disabled=false;
 const control={matches:()=>disabled,querySelector:()=>null,classList:{add:x=>set.add(x),remove:x=>set.delete(x)},addEventListener(){}};
 const target={closest:()=>control};installPressFeedback({addEventListener:(n,f)=>handlers[n]=f},{addEventListener:(n,f)=>winHandlers[n]=f});
 const down=()=>handlers.pointerdown({target,isPrimary:true,button:0,clientX:0,clientY:0,pointerId:1});
 down();assert.ok(set.has('is-pressed'));handlers.pointermove({clientX:0,clientY:30,pointerId:1});assert.equal(set.size,0);
 down();handlers.pointercancel();assert.equal(set.size,0);
 handlers.keydown({target,key:' ',repeat:false});assert.ok(set.has('is-pressed'));handlers.keyup({key:' '});assert.equal(set.size,0);
 down();winHandlers.blur();assert.equal(set.size,0);
 disabled=true;down();assert.equal(set.size,0);
});
