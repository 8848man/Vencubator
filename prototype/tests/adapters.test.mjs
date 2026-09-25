import test from 'node:test';
import assert from 'node:assert/strict';
import {interviewAdapter} from '../adapters.mjs';
test('fake AI responds after delay and reports recoverable failure',async()=>{assert.ok((await interviewAdapter(0,{mode:'slow'})).question);await assert.rejects(()=>interviewAdapter(0,{mode:'error'}),/기본 질문/);});
