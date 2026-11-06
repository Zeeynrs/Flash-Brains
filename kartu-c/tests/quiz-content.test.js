import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { topics } from '../dist/curriculum.js';
import { exercisesByTopic, exercisesForTopic, exerciseById } from '../dist/quizzes.js';

const kinds = ['choice', 'output', 'fill', 'order', 'bug', 'match', 'logic'];
const multipleChoice = ['choice', 'output', 'bug', 'logic'];
const unique = values => new Set(values).size === values.length;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const allExercises = Object.values(exercisesByTopic).flat();
const compilerAvailable = spawnSync('gcc', ['--version']).status === 0;

test('every curriculum topic has ten identifiable exercises and all seven interaction types', () => {
  assert.deepEqual(Object.keys(exercisesByTopic).sort(), topics.map(topic => topic.id).sort());
  assert.equal(allExercises.length, 80);
  assert.ok(unique(allExercises.map(exercise => exercise.id)));
  for (const topic of topics) {
    const exercises = exercisesForTopic(topic.id);
    assert.equal(exercises.length, 10, topic.id);
    assert.deepEqual([...new Set(exercises.map(exercise => exercise.type))].sort(), [...kinds].sort(), topic.id);
    assert.ok(exercises.some(exercise => typeof exercise.expectedOutput === 'string'), topic.id);
    exercises.forEach((exercise, index) => {
      assert.equal(exercise.id, `${topic.id}-${String(index + 1).padStart(2, '0')}`);
      assert.equal(exerciseById(exercise.id), exercise);
      assert.equal(Boolean(exercise.challenge), index === 9, exercise.id);
      assert.ok(nonempty(exercise.prompt), exercise.id);
      assert.ok(nonempty(exercise.explanation), exercise.id);
    });
  }
  assert.deepEqual(exercisesForTopic('missing'), []);
  assert.equal(exerciseById('missing'), undefined);
  assert.deepEqual(exercisesForTopic('__proto__'), []);
  assert.equal(exerciseById('__proto__'), undefined);
});

test('exercise fields give each interaction an unambiguous, renderable answer key', () => {
  for (const exercise of allExercises) {
    const label = exercise.id;
    if (multipleChoice.includes(exercise.type)) {
      assert.equal(exercise.options.length, 4, label);
      assert.ok(unique(exercise.options.map(option => option.id)), label);
      assert.ok(unique(exercise.options.map(option => option.text)), label);
      assert.ok(exercise.options.every(option => nonempty(option.id) && nonempty(option.text)), label);
      assert.ok(exercise.options.some(option => option.id === exercise.answer), label);
      if (exercise.type === 'output') assert.ok(nonempty(exercise.code), label);
    } else if (exercise.type === 'fill') {
      assert.equal(exercise.code.split('___').length, 2, label);
      assert.ok(exercise.accepted.length > 0 && exercise.accepted.every(nonempty), label);
      assert.ok(unique(exercise.accepted.map(answer => answer.trim().replace(/\s+/g, ' '))), label);
    } else if (exercise.type === 'order') {
      const ids = exercise.tokens.map(token => token.id);
      assert.ok(ids.length >= 3 && unique(ids), label);
      assert.ok(unique(exercise.tokens.map(token => token.text)), label);
      assert.ok(exercise.tokens.every(token => nonempty(token.id) && nonempty(token.text)), label);
      assert.deepEqual([...exercise.answer].sort(), [...ids].sort(), label);
      assert.ok(unique(exercise.answer), label);
    } else if (exercise.type === 'match') {
      assert.ok([3, 4].includes(exercise.pairs.length), label);
      for (const key of ['id', 'left', 'right']) {
        assert.ok(exercise.pairs.every(pair => nonempty(pair[key])), label);
        assert.ok(unique(exercise.pairs.map(pair => pair[key])), label);
      }
    }
    if (exercise.expectedOutput !== undefined) {
      assert.ok(['output', 'logic'].includes(exercise.type), label);
      assert.ok(nonempty(exercise.code), label);
      assert.equal(exercise.options.find(option => option.id === exercise.answer).text, exercise.expectedOutput || '(tidak ada output)', label);
    }
  }
  assert.ok(new Set(allExercises.filter(exercise => multipleChoice.includes(exercise.type)).map(exercise => exercise.answer)).size >= 3);
});

for (const exercise of allExercises.filter(exercise => exercise.expectedOutput !== undefined)) {
  test(`C99 quiz ${exercise.id} compiles cleanly and prints its keyed answer`, { skip: !compilerAvailable }, () => {
    const directory = mkdtempSync(join(tmpdir(), 'quiz-c-'));
    try {
      const source = join(directory, 'quiz.c');
      const binary = join(directory, 'quiz');
      writeFileSync(source, exercise.fullProgram ? exercise.code : `#include <stdio.h>\nint main(void) {\n${exercise.code}\nreturn 0;\n}\n`);
      const compilation = spawnSync('gcc', ['-std=c99', '-Wall', '-Wextra', '-Werror', source, '-o', binary], { encoding: 'utf8', timeout: 5000 });
      assert.equal(compilation.status, 0, compilation.stderr);
      const run = spawnSync(binary, [], { encoding: 'utf8', timeout: 1000 });
      assert.equal(run.status, 0, run.stderr);
      assert.equal(run.stdout, exercise.expectedOutput);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}

test('every accepted fill and ordering key forms valid C99 code', {skip:!compilerAvailable},()=> {
  const directory=mkdtempSync(join(tmpdir(),'quiz-keys-c-'));
  try {
    for(const exercise of allExercises.filter(ex=>['fill','order'].includes(ex.type))) {
      const snippets=exercise.type==='fill' ? exercise.accepted.map(answer=>exercise.code.replace('___',answer)) : [exercise.answer.map(id=>exercise.tokens.find(t=>t.id===id).text).join('\n')];
      for(const [index,code] of snippets.entries()) {
        const full=/\bint\s+main\s*\(/.test(code);
        const source=join(directory,`${exercise.id}-${index}.c`);
        writeFileSync(source,`#include <stdio.h>\n${full?code:`int main(void) {\n${code}\nreturn 0;\n}`}`);
        const compilation=spawnSync('gcc',['-std=c99','-Wall','-Wextra','-Werror','-Wno-unused-variable','-Wno-unused-but-set-variable','-fsyntax-only',source],{encoding:'utf8',timeout:5000});
        assert.equal(compilation.status,0,`${exercise.id}: ${compilation.stderr}`);
      }
    }
  } finally {rmSync(directory,{recursive:true,force:true});}
});
