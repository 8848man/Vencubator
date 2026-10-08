// SPEC-009 AC-S04 랜딩 → 앱 진입
import test from 'node:test';
import assert from 'node:assert/strict';
import { readEntry, applyEntry, LANDING_KEY, LANDING_KEYS } from '../entry.mjs';
import { blankStore } from '../domain.mjs';

const mem = obj => ({ getItem: k => (k in obj ? obj[k] : null) });
const landing = text => mem({ [LANDING_KEY]: JSON.stringify({ v: 1, idea: { text, source: 'mine' } }) });

test('from=v2일 때만 랜딩 문장을 읽는다', () => {
  assert.deepEqual(readEntry('?from=v2', landing('  동네   반찬 구독 ')), { from: 'v2', idea: '동네 반찬 구독' });
  assert.deepEqual(readEntry('?from=v1', landing('x')), { from: 'v1', idea: null });
  assert.deepEqual(readEntry('', landing('x')), { from: 'direct', idea: null });
  assert.equal(readEntry('?from=v2', mem({ [LANDING_KEY]: '{broken' })).idea, null);
  assert.equal(readEntry('?from=v2', landing('a'.repeat(500))).idea.length, 120);
});

test('from=v3는 v3 랜딩 저장소에서 읽고, v2 저장소와 섞지 않는다', () => {
  const both = mem({ [LANDING_KEYS.v2]: JSON.stringify({ idea: { text: 'v2 문장' } }), [LANDING_KEYS.v3]: JSON.stringify({ v: 1, idea: { text: ' 뿌리   문장 ' } }) });
  assert.deepEqual(readEntry('?from=v3', both), { from: 'v3', idea: '뿌리 문장' });
  assert.deepEqual(readEntry('?from=v2', both), { from: 'v2', idea: 'v2 문장' });
  assert.deepEqual(readEntry('?from=v3', mem({})), { from: 'v3', idea: null });
  assert.deepEqual(readEntry('?from=v9', both), { from: 'direct', idea: null });
});

test('입력 초안만 채우고 프로젝트는 만들지 않는다', () => {
  const s = blankStore();
  const before = JSON.stringify(s.projects);
  assert.equal(applyEntry(s, { from: 'v2', idea: '내 아이디어' }), true);
  assert.equal(s.forms.new.description, '내 아이디어');
  assert.equal(s.forms.entry.pending, true);
  assert.equal(JSON.stringify(s.projects), before);
});

test('같은 문장은 다시 가져오지 않고, 쓰던 초안은 덮어쓰지 않는다', () => {
  const s = blankStore();
  applyEntry(s, { from: 'v2', idea: '첫 문장' });
  s.forms.entry.pending = false; s.forms.new = {};
  assert.equal(applyEntry(s, { from: 'v2', idea: '첫 문장' }), false);
  const t = blankStore(); t.forms.new = { description: '사용자가 쓰던 글' };
  assert.equal(applyEntry(t, { from: 'v2', idea: '다른 문장' }), false);
  assert.equal(t.forms.new.description, '사용자가 쓰던 글');
});

test('로그인한 사용자는 새 프로젝트 화면으로 이동', () => {
  const s = blankStore(); s.user = { id: 'u', name: 'n' };
  applyEntry(s, { from: 'v2', idea: '문장' });
  assert.equal(s.route.view, 'new');
});

test('index.html은 상대 경로로 파일을 부른다 (SPEC-009 §2)', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(!/(href|src)="\/(?!\/)/.test(html), '루트 기준 경로가 남아 있음');
});

test('AC-L31-01 v31 독립 저장소에서 이름표만 인계',()=>{
 const st=mem({[LANDING_KEYS.v3]:JSON.stringify({idea:{text:'v3'}}),[LANDING_KEYS.v31]:JSON.stringify({idea:{text:'v31'},learn:{result:'first'},decision:'keep'})});
 assert.deepEqual(readEntry('?from=v31',st),{from:'v31',idea:'v31'});
 assert.deepEqual(readEntry('?from=v3',st),{from:'v3',idea:'v3'});
 assert.deepEqual(readEntry('?from=v31',mem({[LANDING_KEYS.v3]:JSON.stringify({idea:{text:'v3'}})})),{from:'v31',idea:null});
});

test('AC-L32-01 v32 독립 저장소에서 아이디어 문장만 인계',()=>{
 const st=mem({[LANDING_KEYS.v31]:JSON.stringify({idea:{text:'v31'}}),[LANDING_KEYS.v32]:JSON.stringify({idea:{text:'v32'},learn:{result:'first'},decision:'keep'})});
 assert.deepEqual(readEntry('?from=v32',st),{from:'v32',idea:'v32'});
 assert.deepEqual(readEntry('?from=v32',mem({[LANDING_KEYS.v31]:JSON.stringify({idea:{text:'v31'}})})),{from:'v32',idea:null});
});
test('SPEC-018 새 랜딩 유입은 과거 이름표를 가져오지 않고 초안도 보존',()=>{
  for (const from of ['value','test']) {
    const entry=readEntry('?from='+from,{getItem(){throw Error('must not read old label');}});
    assert.deepEqual(entry,{from,idea:null});
    const s=blankStore();s.forms.new={description:'쓰던 문장'};
    assert.equal(applyEntry(s,entry),false);
    assert.equal(s.forms.new.description,'쓰던 문장');
  }
});
