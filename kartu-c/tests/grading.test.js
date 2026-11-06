import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeExercise, isAnswerComplete, correctAnswerText, shuffled } from '../dist/quiz-engine.js';
import { exerciseById } from '../dist/quizzes.js';

const choice = {type:'choice',options:[{id:'a',text:'int'},{id:'b',text:'char'}],answer:'a'};
test('choice-based exercises check stable option IDs rather than display order',()=> {
  for(const type of ['choice','output','bug','logic']) {
    const ex = {...choice,type};
    assert.equal(gradeExercise(ex,'a'),true);
    assert.equal(gradeExercise(ex,'b'),false);
    assert.equal(gradeExercise(ex,'int'),false);
    assert.equal(isAnswerComplete(ex,'unknown'),false);
    assert.equal(correctAnswerText(ex),'int');
  }
});
test('fill normalizes whitespace but preserves C case and symbols',()=> {
  const ex={type:'fill',accepted:['return 0;', 'return(0);']};
  assert.equal(gradeExercise(ex,'  return   0; \n'),true);
  assert.equal(gradeExercise(ex,'return(0);'),true);
  assert.equal(gradeExercise(ex,'Return 0;'),false);
  assert.equal(gradeExercise(ex,'return 1;'),false);
  assert.equal(isAnswerComplete(ex,' \n'),false);
  assert.equal(isAnswerComplete(ex,{}),false);
});
test('ordering requires every unique fragment in the right sequence',()=> {
  const ex={type:'order',tokens:[{id:'declare',text:'int x = 1;'}, {id:'update',text:'x++;'}, {id:'print',text:'printf("%d", x);'}],answer:['declare','update','print']};
  assert.equal(gradeExercise(ex,['declare','update','print']),true);
  assert.equal(gradeExercise(ex,['declare','print','update']),false);
  assert.equal(isAnswerComplete(ex,['declare','declare','print']),false);
  assert.equal(isAnswerComplete(ex,['declare']),false);
  assert.match(correctAnswerText(ex),/int x = 1;\nx\+\+;/);
});
test('matching checks all identities and disallows duplicate or inherited targets',()=> {
  const ex={type:'match',pairs:[{id:'int',left:'int',right:'bilangan bulat'},{id:'char',left:'char',right:'karakter'}]};
  assert.equal(gradeExercise(ex,{int:'int',char:'char'}),true);
  assert.equal(gradeExercise(ex,{int:'char',char:'int'}),false);
  assert.equal(isAnswerComplete(ex,{int:'int',char:'int'}),false);
  assert.equal(isAnswerComplete(ex,Object.create({int:'int',char:'char'})),false);
  assert.equal(isAnswerComplete(ex,{int:'int'}),false);
});
test('shuffle is reproducible across reload without mutating source',()=> {
  const source=['a','b','c','d','e','f'];
  assert.deepEqual(shuffled(source,'lesson-123'),shuffled(source,'lesson-123'));
  assert.deepEqual([...shuffled(source,'another')].sort(),source);
  assert.deepEqual(source,['a','b','c','d','e','f']);
  assert.notDeepEqual(shuffled(source,'one'),shuffled(source,'two'));
});
test('array loop accepts both comparison operators that visit exactly indices zero through four',()=> {
  const ex=exerciseById('array-1d-09');
  assert.equal(gradeExercise(ex,'<'),true);
  assert.equal(gradeExercise(ex,'!='),true);
  assert.equal(gradeExercise(ex,'<='),false);
});
