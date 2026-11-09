import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLearningEngine,aggregateLearningStats} from '../dist/learning-state.js';
import {topics} from '../dist/curriculum.js';
import {exercisesForTopic,exerciseById} from '../dist/quizzes.js';
import * as c from '../dist/state.js';
const second=createLearningEngine({topics,exercisesForTopic,exerciseById,storageKey:'another-course',allowLegacyMigration:false});
const answer=ex=>ex.options?ex.answer:ex.type==='fill'?ex.accepted[0]:ex.type==='order'?ex.answer:Object.fromEntries(ex.pairs.map(p=>[p.id,p.id]));
test('configured engines use distinct storage keys and keep C progress unchanged',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const original=c.submitAnswer(c.startTopic(c.initialState(),topics[0].id,7),answer(exercisesForTopic(topics[0].id)[0]),'2026-11-09');
  assert.equal(c.saveProgress(storage,original),true);
  let other=second.startTopic(second.initialState(),topics[0].id,8);
  other=second.setDraft(other,'a');
  assert.equal(second.saveProgress(storage,other),true);
  assert.deepEqual(c.readProgress(storage).state,original);
  assert.deepEqual(second.readProgress(storage).state,other);
  assert.equal(second.learningStats(other).xp,0);
  assert.equal(second.readProgress(null).available,false);
});
test('factory preserves C wrapper behavior including legacy migration only where enabled',()=>{
  const legacy=JSON.stringify({version:1,learned:{[topics[0].id]:topics[0].cards.map(card=>card.id)},session:null});
  assert.equal(c.restore(legacy).legacyCompleted.length,1);
  assert.deepEqual(second.restore(legacy),second.initialState());
});
test('aggregate rewards combine course activity before evaluating goal and streak',()=>{
  const one={...c.initialState(),awarded:['same','b','c'],solved:{first:['same','b','c']},activity:{'2026-11-08':['same','b'],'2026-11-09':['same','b']}};
  const two={...c.initialState(),awarded:['same','d','e'],solved:{first:['same','d','e']},activity:{'2026-11-08':['same','d','e'],'2026-11-09':['same','d','e']}};
  assert.deepEqual(aggregateLearningStats({c:one,python:two},'2026-11-09'),{xp:60,todayCount:5,goal:5,streak:2,solvedCount:6});
  assert.equal(aggregateLearningStats({c:one,python:two},'2026-11-10').streak,2);
  assert.equal(aggregateLearningStats({c:one,python:two},'2026-11-11').streak,0);
  assert.equal(aggregateLearningStats({},'2026-11-09').xp,0);
});
