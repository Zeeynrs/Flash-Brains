import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courses} from '../dist/courses.js';
import {courseContentById} from '../dist/course-content.js';
import {aggregateLearningStats} from '../dist/learning-state.js';
import {catalogMarkup,courseCardsMarkup} from '../dist/catalog-view.js';
const answer=ex=>ex.options?ex.answer:ex.type==='fill'?ex.accepted[0]:ex.type==='order'?ex.answer:Object.fromEntries(ex.pairs.map(p=>[p.id,p.id]));
test('both courses complete and restore after every answer without modifying the other course',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const states=Object.fromEntries(courses.map(c=>[c.id,courseContentById(c.id).learning.initialState()]));
  for(const course of courses){
    const content=courseContentById(course.id),engine=content.learning;
    let state=states[course.id];
    for(const topic of content.topics){
      state=engine.startTopic(state,topic.id,42);
      while(engine.currentSession(state).phase!=='done'){
        const exercise=content.exerciseById(engine.currentSession(state).queue[0]);
        state=engine.submitAnswer(state,answer(exercise),'2026-11-09');
        assert.equal(engine.currentSession(state).pending.correct,true,exercise.id);
        assert.deepEqual(engine.restore(JSON.stringify(state)),state);
        state=engine.advanceSession(state);
        assert.deepEqual(engine.restore(JSON.stringify(state)),state);
      }
    }
    states[course.id]=state;
    engine.saveProgress(storage,state);
    assert.equal(engine.learningStats(state).xp,800);
  }
  for(const course of courses) assert.deepEqual(courseContentById(course.id).learning.readProgress(storage).state,states[course.id]);
  assert.deepEqual(aggregateLearningStats(states,'2026-11-09'),{xp:1600,todayCount:160,goal:5,streak:1,solvedCount:160});
  assert.equal(courseContentById('__proto__'),undefined);
});
test('Python wrong answers wait until the end and cannot award duplicate XP',()=>{
  const content=courseContentById('python'),engine=content.learning,topic=content.topics[0];
  let state=engine.startTopic(engine.initialState(),topic.id,3);
  const first=content.exerciseById(engine.currentSession(state).queue[0]);
  const wrong=first.options.find(o=>o.id!==first.answer).id;
  state=engine.advanceSession(engine.submitAnswer(state,wrong,'2026-11-09'));
  assert.deepEqual(engine.currentSession(state).deferred,[first.id]);
  while(engine.currentSession(state).phase==='lesson'){
    const ex=content.exerciseById(engine.currentSession(state).queue[0]);
    state=engine.advanceSession(engine.submitAnswer(state,answer(ex),'2026-11-09'));
  }
  assert.equal(engine.currentSession(state).phase,'retry');
  assert.equal(engine.currentSession(state).queue[0],first.id);
  state=engine.submitAnswer(state,answer(first),'2026-11-09');
  const before=JSON.stringify(state);
  assert.equal(JSON.stringify(engine.submitAnswer(state,answer(first),'2026-11-09')),before);
  state=engine.advanceSession(state);
  assert.equal(engine.currentSession(state).phase,'challenge');
});
test('catalog renders separate cards, progress and a course-aware Python resume',()=>{
  const cards=courseCardsMarkup('',{c:{solvedCount:10},python:{solvedCount:3}});
  assert.match(cards,/10\/80/);assert.match(cards,/3\/80/);
  assert.match(cards,/data-course="python"/);assert.match(cards,/data-tone="blue"/);
  const markup=catalogMarkup({stats:{todayCount:0},rewards:'',progressByCourse:{},continueTopic:{id:'py-mulai',title:'Kenalan dengan Python',courseId:'python',courseTitle:'Pemrograman Python',symbol:'Py'}});
  assert.match(markup,/data-course-id="python"/);
  assert.match(markup,/Pemrograman Python · jawaban/);
  assert.doesNotMatch(markup,/Pemrograman C · jawaban/);
});
