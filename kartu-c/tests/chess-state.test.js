import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courseContentById} from '../dist/course-content.js';
import {gradeExercise,isAnswerComplete} from '../dist/quiz-engine.js';
import {aggregateLearningStats} from '../dist/learning-state.js';
const canonical=ex=>ex.answer;

test('chess is registered and a selected square persists without touching C/Python',()=> {
  const content=courseContentById('chess');
  assert.ok(content,'chess has a real content provider');
  const {learning:engine}=content;
  let state=engine.startTopic(engine.initialState(),content.topics[0].id,42);
  const exercise=content.exerciseById(engine.currentSession(state).queue[0]);
  state=engine.setDraft(state,exercise.answer);
  assert.equal(engine.currentSession(state).draft,'a1');
  assert.deepEqual(engine.restore(JSON.stringify(state)),state);
  assert.notEqual(engine.STORAGE_KEY,courseContentById('c').learning.STORAGE_KEY);
  assert.notEqual(engine.STORAGE_KEY,courseContentById('python').learning.STORAGE_KEY);
  assert.equal(isAnswerComplete(exercise,'a1'),true);
  assert.equal(gradeExercise(exercise,'a1'),true);
  assert.equal(gradeExercise(exercise,'b1'),false);
});
test('all eighty chess answers, drafts and checked feedback survive reload and award XP once',()=> {
  const content=courseContentById('chess');assert.ok(content);
  const engine=content.learning;
  let state=engine.initialState();
  for(const topic of content.topics) {
    state=engine.startTopic(state,topic.id,123);
    while(engine.currentSession(state).phase!=='done') {
      const exercise=content.exerciseById(engine.currentSession(state).queue[0]);
      const input=canonical(exercise);
      assert.equal(isAnswerComplete(exercise,input),true,exercise.id);
      state=engine.setDraft(state,input);
      assert.deepEqual(engine.restore(JSON.stringify(state)),state,exercise.id+' draft');
      state=engine.submitAnswer(state,input,'2026-11-10');
      assert.equal(engine.currentSession(state).pending.correct,true,exercise.id);
      assert.deepEqual(engine.restore(JSON.stringify(state)),state,exercise.id+' feedback');
      assert.deepEqual(engine.submitAnswer(state,input,'2026-11-10'),state);
      state=engine.advanceSession(state);
    }
  }
  assert.equal(engine.learningStats(state).xp,800);
  assert.equal(aggregateLearningStats({chess:state},'2026-11-10').todayCount,80);
  state=engine.startTopic(state,content.topics[0].id,42);
  state=engine.submitAnswer(state,'a1','2026-11-10');
  assert.equal(engine.currentSession(state).pending.xp,0);
});
test('illegal moves cannot become drafts or attempts, and wrong legal answers wait for retry',()=> {
  const content=courseContentById('chess');assert.ok(content);
  const engine=content.learning;
  let state=engine.startTopic(engine.initialState(),content.topics[0].id,42);
  state=engine.submitAnswer(state,'b1','2026-11-10');
  assert.equal(engine.currentSession(state).pending.correct,false);
  state=engine.advanceSession(state);
  assert.equal(engine.currentSession(state).deferred[0],'ch-papan-01');
  while(engine.currentSession(state).phase==='lesson') {
    const exercise=content.exerciseById(engine.currentSession(state).queue[0]);
    state=engine.advanceSession(engine.submitAnswer(state,exercise.answer,'2026-11-10'));
  }
  assert.equal(engine.currentSession(state).phase,'retry');
  assert.equal(engine.currentSession(state).queue[0],'ch-papan-01');
  const move=content.exerciseById('ch-garis-01');
  assert.equal(isAnswerComplete(move,'a1b2'),false);
  assert.equal(isAnswerComplete(content.exerciseById('ch-pion-08'),'a7a8'),false);
  while(engine.currentSession(state).phase!=='done') {
    const exercise=content.exerciseById(engine.currentSession(state).queue[0]);
    state=engine.advanceSession(engine.submitAnswer(state,exercise.answer,'2026-11-10'));
  }
  state=engine.startTopic(state,'ch-garis',12);
  assert.deepEqual(engine.setDraft(state,'a1b2'),state);
  assert.deepEqual(engine.submitAnswer(state,'a1b2','2026-11-10'),state);
  const corrupt=structuredClone(state);corrupt.sessions['ch-garis'].draft='a1b2';
  assert.deepEqual(engine.restore(JSON.stringify(corrupt)),engine.initialState());
});
