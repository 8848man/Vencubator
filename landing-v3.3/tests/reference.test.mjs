import test from 'node:test';
import assert from 'node:assert/strict';
import { screens, phaseFor } from '../reference/flow.mjs';

test('54 reference positions map to five Vencubator phases and end in a first project', () => {
  assert.equal(screens.length, 54);
  assert.deepEqual([0, 7, 19, 25, 34, 53].map(phaseFor), [0, 1, 2, 3, 4, 4]);
  assert.equal(screens[8].kind, 'question');
  assert.equal(screens[25].kind, 'summary');
  assert.equal(screens[34].kind, 'coach');
  assert.equal(screens[53].kind, 'complete');
  assert.match(screens[53].title, /프로젝트/);
  assert.ok(screens.some(s => /고객/.test(s.title)));
  assert.ok(screens.some(s => /가설/.test(s.title)));
});
