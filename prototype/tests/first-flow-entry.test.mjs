import test from 'node:test';
import assert from 'node:assert/strict';
import {firstFlowDestination,isFirstFlowCompleted,FIRST_FLOW_MARK_KEY} from '../first-flow-entry.mjs';

const blank={user:null,projects:[],forms:{onboarding:{}}};
const storage=(value)=>({getItem:key=>key===FIRST_FLOW_MARK_KEY?value:null});
const args={pathname:'/app/',search:'',storage:storage(null),state:blank};
test('new /app/ visitor begins saved first flow',()=>{
 assert.equal(firstFlowDestination(args),'/v3.3/');
 assert.equal(firstFlowDestination({...args,pathname:'/app/index.html'}),'/v3.3/');
});
test('transfer, prior app data and completed marker bypass introduction',()=>{
 assert.equal(firstFlowDestination({...args,search:'?v33Explore=1'}),null);
 assert.equal(firstFlowDestination({...args,search:'?v33Guide=1'}),null);
 assert.equal(firstFlowDestination({...args,state:{...blank,user:{id:'old'}}}),null);
 assert.equal(firstFlowDestination({...args,state:{...blank,projects:[{id:'old'}]}}),null);
 assert.equal(firstFlowDestination({...args,state:{...blank,forms:{onboarding:{completed:true}}}}),null);
 assert.equal(firstFlowDestination({...args,storage:storage('{"completedVersion":1}')}),null);
  assert.equal(isFirstFlowCompleted(storage('{"completedVersion":1}')),true);
  assert.equal(isFirstFlowCompleted(storage(null)),false);
  assert.equal(firstFlowDestination({...args,storage:storage('{broken')}),'/v3.3/');
});
test('storage failure, failed app load and standalone prototype do not redirect',()=>{
 assert.equal(firstFlowDestination({...args,storage:{getItem(){throw Error('denied')}}}),null);
 assert.equal(firstFlowDestination({...args,loadError:'failed'}),null);
 assert.equal(firstFlowDestination({...args,pathname:'/'}),null);
});
