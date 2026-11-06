import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../dist/curriculum.js';
import { initialState, restore, startTopic, rateCard, isUnlocked, readProgress, saveProgress } from '../dist/state.js';

test('curriculum contains 8 ordered topics with 5 unique, explained cards each', () => {
  assert.equal(topics.length, 8);
  const ids = topics.flatMap(t => { assert.equal(t.cards.length, 5); return t.cards.map(c => {
    assert.ok(c.question && c.answer && c.explanation); return c.id;
  }); });
  assert.equal(new Set(ids).size, 40);
});

test('fresh learner can only open first topic', () => {
  const state = initialState();
  assert.equal(isUnlocked(state, topics[0].id), true);
  for (const t of topics.slice(1)) assert.equal(isUnlocked(state, t.id), false);
  assert.deepEqual(startTopic(state, topics[1].id), state);
});

test('forgotten card moves to end and reload preserves its position', () => {
  let state = startTopic(initialState(), topics[0].id);
  const first = state.session.queue[0];
  state = rateCard(state, false);
  assert.equal(state.session.queue.length, 5);
  assert.equal(state.session.queue.at(-1), first);
  assert.equal(state.learned[topics[0].id]?.length ?? 0, 0);
  assert.deepEqual(restore(JSON.stringify(state)), state);
});

test('completion requires every card and opens only the next topic', () => {
  let state = startTopic(initialState(), topics[0].id);
  for (let i = 0; i < 4; i++) state = rateCard(state, true);
  assert.equal(isUnlocked(state, topics[1].id), false);
  state = rateCard(state, true);
  assert.equal(state.session.queue.length, 0);
  assert.equal(state.learned[topics[0].id].length, 5);
  assert.equal(isUnlocked(state, topics[1].id), true);
  assert.equal(isUnlocked(state, topics[2].id), false);
});

test('review never revokes completion and can be resumed', () => {
  let state = startTopic(initialState(), topics[0].id);
  for (let i = 0; i < 5; i++) state = rateCard(state, true);
  state = startTopic(state, topics[0].id);
  assert.equal(state.session.queue.length, 5);
  state = rateCard(state, false);
  assert.equal(isUnlocked(state, topics[1].id), true);
  assert.deepEqual(restore(JSON.stringify(state)), state);
});

test('starting a partial topic resumes remaining cards instead of resetting', () => {
  let state = startTopic(initialState(), topics[0].id);
  state = rateCard(state, true);
  assert.equal(startTopic(state, topics[0].id).session.queue.length, 4);
});

test('corrupt, incompatible or impossible saved data safely starts fresh', () => {
  for (const raw of [null, 'bad json', 'null', '{}', '{"version":9}', JSON.stringify({version:1,learned:{bogus:['x']},session:{topicId:'bogus',queue:['x']}})]) {
    assert.deepEqual(restore(raw), initialState());
  }
  const state = initialState();
  state.learned[topics[1].id] = topics[1].cards.map(c => c.id);
  assert.deepEqual(restore(JSON.stringify(state)), initialState());
});

test('unavailable storage is explicit without losing in-memory state', () => {
  const storage = {getItem(){throw new Error('blocked');},setItem(){throw new Error('full');}};
  assert.equal(readProgress(storage).available, false);
  assert.deepEqual(readProgress(storage).state, initialState());
  assert.equal(saveProgress(storage, initialState()), false);
});

test('all eight topics can be completed without invalid transitions', () => {
  let state = initialState();
  for (const t of topics) {
    assert.equal(isUnlocked(state,t.id), true);
    state = startTopic(state,t.id);
    for(let i = 0; i < 5; i++) state = rateCard(state,true);
    assert.deepEqual(restore(JSON.stringify(state)),state);
  }
  assert.equal(Object.values(state.learned).flat().length,40);
});
