import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { topics } from '../dist/python-curriculum.js';
import { exercisesByTopic, exercisesForTopic, exerciseById } from '../dist/python-quizzes.js';
import { gradeExercise } from '../dist/quiz-engine.js';

const topicIds = ['py-mulai', 'py-variabel', 'py-input', 'py-operator', 'py-kondisi', 'py-perulangan', 'py-list', 'py-list-lanjutan'];
const types = ['choice', 'output', 'fill', 'order', 'bug', 'match', 'logic'];
const run = (code, id) => {
  const result = spawnSync('python3', ['-c', code], { encoding: 'utf8', input: '7\n', timeout: 1000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${id}: ${result.stderr}`);
  return result.stdout;
};

test('Python reference covers the progression with forty distinct complete cards', () => {
  assert.deepEqual(topics.map(t => t.id), topicIds);
  const ids = new Set();
  for (const topic of topics) {
    for (const field of ['title', 'description', 'symbol']) assert.ok(topic[field]?.trim());
    assert.equal(topic.cards.length, 5);
    for (const card of topic.cards) {
      assert.ok(card.id.startsWith('py-'));
      assert.ok(!ids.has(card.id)); ids.add(card.id);
      for (const field of ['kind', 'question', 'answer', 'explanation']) assert.ok(card[field]?.trim(), `${card.id}: ${field}`);
      assert.equal(typeof card.code, 'string');
    }
  }
  assert.equal(ids.size, 40);
});

test('eighty exercises have usable schemas, all formats, valid grading keys and one final challenge per topic', () => {
  assert.deepEqual(Object.keys(exercisesByTopic), topicIds);
  const ids = new Set();
  const answerIds = new Set();
  for (const topicId of topicIds) {
    const exercises = exercisesForTopic(topicId);
    assert.equal(exercises.length, 10);
    assert.deepEqual([...new Set(exercises.map(e => e.type))].sort(), [...types].sort());
    assert.ok(exercises.some(e => typeof e.expectedOutput === 'string'));
    exercises.forEach((e, index) => {
      assert.equal(e.id, `${topicId}-${String(index + 1).padStart(2, '0')}`);
      assert.ok(!ids.has(e.id)); ids.add(e.id);
      assert.equal(exerciseById(e.id), e);
      assert.equal(Boolean(e.challenge), index === 9);
      assert.ok(e.prompt?.trim()); assert.ok(e.explanation?.trim());
      let key;
      if (['choice', 'output', 'bug', 'logic'].includes(e.type)) {
        assert.equal(e.options.length, 4);
        assert.equal(new Set(e.options.map(o => o.id)).size, 4);
        assert.equal(new Set(e.options.map(o => o.text)).size, 4);
        assert.ok(e.options.every(o => typeof o.text === 'string' && o.text.length));
        assert.ok(e.options.some(o => o.id === e.answer));
        key = e.answer; answerIds.add(key);
      } else if (e.type === 'fill') {
        assert.equal(e.code.split('___').length, 2);
        assert.ok(e.accepted.length);
        for (const accepted of e.accepted) {
          assert.ok(accepted.trim());
          assert.equal(gradeExercise(e, accepted), true);
          run(e.code.replace('___', accepted), e.id);
        }
        key = e.accepted[0];
      } else if (e.type === 'order') {
        assert.ok(e.tokens.length >= 3);
        assert.equal(new Set(e.tokens.map(t => t.id)).size, e.tokens.length);
        assert.equal(new Set(e.tokens.map(t => t.text)).size, e.tokens.length);
        assert.deepEqual([...e.answer].sort(), e.tokens.map(t => t.id).sort());
        run(e.answer.map(id => e.tokens.find(t => t.id === id).text).join('\n'), e.id);
        key = e.answer;
      } else {
        assert.ok([3, 4].includes(e.pairs.length));
        for (const field of ['id', 'left', 'right']) assert.equal(new Set(e.pairs.map(p => p[field])).size, e.pairs.length);
        key = Object.fromEntries(e.pairs.map(p => [p.id, p.id]));
      }
      assert.equal(gradeExercise(e, key), true, e.id);
    });
  }
  assert.equal(ids.size, 80);
  assert.equal(answerIds.size, 4);
});

test('all runnable output examples match both their literal output and selected option including newlines', () => {
  for (const e of Object.values(exercisesByTopic).flat()) {
    if (e.expectedOutput === undefined) continue;
    assert.notEqual(e.type, 'bug');
    assert.equal(run(e.code, e.id), e.expectedOutput, e.id);
    assert.equal(e.options.find(o => o.id === e.answer).text, e.expectedOutput, e.id);
  }
});

test('unknown and prototype-like IDs cannot expose inherited values', () => {
  for (const id of ['unknown', '__proto__', 'constructor', 'toString', null, undefined]) {
    assert.deepEqual(exercisesForTopic(id), []);
    assert.equal(exerciseById(id), undefined);
  }
});
