import test from 'node:test';
import assert from 'node:assert/strict';
import {blankStore,seedSample,commitEvidence} from '../domain.mjs';
const obs={id:'a',stat:'customer',kind:'field',source:'A',date:'2026-01-01',method:'interview',summary:'note',limitations:'one source',interpretation:'meaning',assessment:'refuted'};
test('strategy requires a separate decision artifact',()=>{const s=blankStore(),p=seedSample(s);assert.throws(()=>commitEvidence(s,p.id,{...obs,stat:'strategy'}));assert.equal(p.stats.strategy.milestone,0);});
test('other business areas require a named claim',()=>{for(const stat of ['market','gtm','finance','operations']){const s=blankStore(),p=seedSample(s);assert.throws(()=>commitEvidence(s,p.id,{...obs,stat}));commitEvidence(s,p.id,{...obs,stat,claim:'specific hypothesis'});assert.equal(p.stats[stat].milestone,2);}});
test('different claims cannot be combined as repeated evidence',()=>{const s=blankStore(),p=seedSample(s);commitEvidence(s,p.id,{...obs,claim:'claim one'});commitEvidence(s,p.id,{...obs,id:'b',source:'B',claim:'claim two',comparison:'comparison'});assert.equal(p.stats.customer.milestone,2);});
