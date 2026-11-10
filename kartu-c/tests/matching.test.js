import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectPair, recoilPoint} from '../dist/matching.js';
import {answerControls} from '../dist/quiz-view.js';
import {exercisesByTopic as cExercises} from '../dist/quizzes.js';
import {exercisesByTopic as pythonExercises} from '../dist/python-quizzes.js';

test('reconnecting a rope frees both its previous answer and the occupied target without mutating saved input',()=> {
  const draft={a:'a',b:'b',c:'c'};
  assert.equal(typeof connectPair,'function','matching supports reconnecting ropes');
  assert.deepEqual(connectPair(draft,'a','b'),{a:'b',c:'c'});
  assert.deepEqual(draft,{a:'a',b:'b',c:'c'});
  assert.deepEqual(connectPair(draft,'b',null),{a:'a',c:'c'});
});

test('released rubber snaps back, overshoots, and settles at its anchor',()=> {
  const anchor={x:100,y:80},tip={x:300,y:200};
  assert.equal(typeof recoilPoint,'function','matching provides elastic recoil');
  assert.deepEqual(recoilPoint(anchor,tip,0),tip);
  const early=recoilPoint(anchor,tip,.06), overshoot=recoilPoint(anchor,tip,.13);
  assert.ok(Math.hypot(early.x-100,early.y-80)<80,'rope retracts sharply within 60ms');
  assert.ok(overshoot.x<100,'spring overshoots the anchor');
  assert.deepEqual(recoilPoint(anchor,tip,.7),anchor);
});

test('every C and Python matching variant renders two keyboard-operable columns and saved connections',()=> {
  for(const ex of [...Object.values(cExercises).flat(),...Object.values(pythonExercises).flat()].filter(ex=>ex.type==='match')) {
    const input={[ex.pairs[0].id]:ex.pairs[1].id};
    const markup=answerControls(ex,input,123,null);
    assert.equal((markup.match(/data-match-source=/g)??[]).length,ex.pairs.length,ex.id);
    assert.equal((markup.match(/data-match-target=/g)??[]).length,ex.pairs.length,ex.id);
    assert.match(markup,/class="match-ropes"/);
    assert.match(markup,/aria-pressed="true"/);
    assert.doesNotMatch(markup,/<select/);
    assert.equal(answerControls(ex,input,123,{correct:false}).includes('<fieldset class="match-control result-wrong" disabled>'),true);
  }
});
