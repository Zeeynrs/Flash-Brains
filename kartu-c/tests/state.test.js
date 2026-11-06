import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../dist/curriculum.js';
import { exercisesForTopic } from '../dist/quizzes.js';
import { STORAGE_KEY, initialState, restore, startTopic, setDraft, submitAnswer, advanceSession, currentSession, isUnlocked, topicComplete, readProgress, saveProgress, learningStats, localDateKey } from '../dist/state.js';

const day='2026-11-06', first=topics[0].id;
function canonical(ex) {
  if(ex.type === 'fill') return ex.accepted[0];
  if(ex.type === 'order') return ex.answer;
  if(ex.type === 'match') return Object.fromEntries(ex.pairs.map(p=>[p.id,p.id]));
  return ex.answer;
}
function answer(state, correct=true, date=day) {
  const session=currentSession(state);
  const ex=exercisesForTopic(session.topicId).find(e=>e.id===session.queue[0]);
  let input=canonical(ex);
  if(!correct) {
    if(ex.type==='fill') input='jawaban salah';
    else if(ex.type==='order') input=[...ex.answer].reverse();
    else if(ex.type==='match') {const ids=ex.pairs.map(p=>p.id);input=Object.fromEntries(ids.map((id,i)=>[id,ids[(i+1)%ids.length]]));}
    else input=ex.options.find(o=>o.id!==ex.answer).id;
  }
  return submitAnswer(state,input,date);
}
const tick=(s,correct=true,date=day)=>advanceSession(answer(s,correct,date));
test('fresh learner can open only first topic',()=> {
  const state=initialState();
  assert.equal(isUnlocked(state,first),true);
  assert.equal(isUnlocked(state,topics[1].id),false);
  assert.deepEqual(startTopic(state,topics[1].id),state);
});
test('unchecked choice, fill, order and match drafts survive reload and reopening a topic',()=> {
  for(const type of ['choice','fill','order','match']) {
    let s=startTopic(initialState(),first,123);
    let ex=exercisesForTopic(first)[0];
    while(ex.type!==type) {s=tick(s);ex=exercisesForTopic(first).find(e=>e.id===currentSession(s).queue[0]);}
    const input=type==='choice'?ex.options[0].id:type==='fill'?'std':type==='order'?[ex.tokens[0].id]:{[ex.pairs[0].id]:ex.pairs[1].id};
    s=setDraft(s,input);
    assert.deepEqual(currentSession(s).draft,input);
    assert.deepEqual(restore(JSON.stringify(s)),s);
    assert.deepEqual(currentSession(startTopic(restore(JSON.stringify(s)),first)).draft,input);
    assert.equal(currentSession(s).pending,null);
  }
});
test('draft is cleared on advance and invalid draft data is rejected',()=> {
  let s=startTopic(initialState(),first,123);
  assert.deepEqual(setDraft(s,'unknown-option'),s);
  s=setDraft(s,exercisesForTopic(first)[0].answer);
  s=tick(s);
  assert.equal(currentSession(s).draft,null);
  const invalid=structuredClone(s);invalid.sessions[first].draft={bad:'answer'};
  assert.deepEqual(restore(JSON.stringify(invalid)),initialState());
});
test('wrong answers wait until round ends; final challenge waits for retries',()=> {
  let s=startTopic(initialState(),first,123);
  const ids=exercisesForTopic(first).map(e=>e.id);
  s=tick(s,false);
  assert.equal(currentSession(s).queue[0],ids[1]);
  assert.deepEqual(currentSession(s).deferred,[ids[0]]);
  for(let i=0;i<8;i++) s=tick(s);
  assert.equal(currentSession(s).phase,'retry');
  assert.deepEqual(currentSession(s).queue,[ids[0]]);
  s=tick(s,false);
  assert.equal(currentSession(s).phase,'retry');
  s=tick(s);
  assert.equal(currentSession(s).phase,'challenge');
  assert.deepEqual(currentSession(s).queue,[ids[9]]);
  s=tick(s,false);
  assert.equal(currentSession(s).phase,'challenge');
  assert.equal(topicComplete(s,first),false);
  s=tick(s);
  assert.equal(currentSession(s).phase,'done');
  assert.equal(isUnlocked(s,topics[1].id),true);
  assert.equal(isUnlocked(s,topics[2].id),false);
});
test('feedback survives reload; duplicate submits cannot inflate XP or attempts',()=> {
  let s=startTopic(initialState(),first,123);
  s=answer(s);
  assert.ok(currentSession(s).pending.correct);
  assert.deepEqual(answer(s),s);
  assert.deepEqual(restore(JSON.stringify(s)),s);
  assert.equal(learningStats(s,day).xp,10);
  assert.equal(currentSession(advanceSession(s)).attempts,1);
});
test('incorrect feedback and deferred order survive reload',()=> {
  let s=startTopic(initialState(),first,123);
  s=answer(s,false);
  assert.deepEqual(restore(JSON.stringify(s)),s);
  s=advanceSession(restore(JSON.stringify(s)));
  s=tick(s,false);
  assert.deepEqual(restore(JSON.stringify(s)),s);
  assert.equal(currentSession(s).deferred.length,2);
});
test('switching topics retains sessions; review never revokes completed access',()=> {
  let s=startTopic(initialState(),first,123);
  for(let i=0;i<10;i++) s=tick(s);
  s=startTopic(s,first,456);
  s=tick(s,false);
  const old=currentSession(s);
  s=startTopic(s,topics[1].id,789);
  s=tick(s);
  s=startTopic(s,first);
  assert.deepEqual(currentSession(s),old);
  assert.equal(isUnlocked(s,topics[1].id),true);
  assert.deepEqual(restore(JSON.stringify(s)),s);
});
test('XP is lifetime unique; daily goal counts distinct correct exercises including reviews',()=> {
  let s=startTopic(initialState(),first,123);
  for(let i=0;i<10;i++) s=tick(s);
  assert.equal(learningStats(s,day).xp,100);
  assert.equal(learningStats(s,day).todayCount,10);
  s=startTopic(s,first,456);
  for(let i=0;i<10;i++) s=tick(s);
  assert.equal(learningStats(s,day).xp,100);
  assert.equal(learningStats(s,day).todayCount,10);
  s=startTopic(s,first,789);
  for(let i=0;i<5;i++) s=tick(s,true,'2026-11-07');
  assert.equal(learningStats(s,'2026-11-07').xp,100);
  assert.equal(learningStats(s,'2026-11-07').todayCount,5);
  assert.equal(learningStats(s,'2026-11-07').goal,5);
  assert.equal(learningStats(s,'2026-11-07').streak,2);
});
test('streak requires goal; yesterday is active, gaps reset and month changes work',()=> {
  let s=startTopic(initialState(),first,123);
  for(let i=0;i<4;i++) s=tick(s,true,'2026-10-31');
  assert.equal(learningStats(s,'2026-10-31').streak,0);
  s=tick(s,true,'2026-10-31');
  assert.equal(learningStats(s,'2026-11-01').streak,1);
  assert.equal(learningStats(s,'2026-11-02').streak,0);
  for(let i=0;i<5;i++) s=tick(s,true,'2026-11-01');
  assert.equal(learningStats(s,'2026-11-01').streak,2);
  assert.equal(localDateKey(new Date(2026,10,6,23,59)),'2026-11-06');
});
test('v1 migration keeps learned cards/access but gives no unearned quiz mastery or XP',()=> {
  const old={version:1,learned:{[first]:topics[0].cards.map(c=>c.id),[topics[1].id]:[topics[1].cards[0].id]},session:null};
  const s=restore(JSON.stringify(old));
  assert.equal(s.version,2);
  assert.deepEqual(s.learned,old.learned);
  assert.equal(topicComplete(s,first),true);
  assert.equal(isUnlocked(s,topics[1].id),true);
  assert.equal(isUnlocked(s,topics[2].id),false);
  assert.equal(learningStats(s,day).xp,0);
  assert.equal(learningStats(s,day).solvedCount,0);
  assert.deepEqual(restore(JSON.stringify(s)),s);
});
test('incomplete answers or advancing before checking do not change state',()=> {
  const s=startTopic(initialState(),first,123);
  for(const input of [undefined,null,'',{},[]]) assert.deepEqual(submitAnswer(s,input,day),s);
  assert.deepEqual(advanceSession(s),s);
});
test('malformed or impossible states reset safely',()=> {
  for(const raw of [null,'bad json','null','{}','{"version":9}']) assert.deepEqual(restore(raw),initialState());
  const s=startTopic(initialState(),first,123), invalids=[];
  let c=structuredClone(s);c.sessions[first].queue.push('unknown');invalids.push(c);
  c=structuredClone(s);c.sessions[first].queue.push(c.sessions[first].queue[0]);invalids.push(c);
  c=structuredClone(s);c.activity['2026-02-31']=['bad'];invalids.push(c);
  c=structuredClone(s);c.activeTopicId='unknown';invalids.push(c);
  c=structuredClone(s);c.awarded=['not-an-exercise'];invalids.push(c);
  c=structuredClone(s);c.sessions[first].phase='done';invalids.push(c);
  for(const value of invalids) assert.deepEqual(restore(JSON.stringify(value)),initialState());
});
test('blocked storage is explicit and existing key remains compatible',()=> {
  assert.equal(STORAGE_KEY,'kartu-c-progress-v1');
  const storage={getItem(){throw Error('blocked')},setItem(){throw Error('full')}};
  assert.equal(readProgress(storage).available,false);
  assert.equal(saveProgress(storage,initialState()),false);
  const s=startTopic(initialState(),first,123);
  assert.deepEqual(readProgress({getItem:()=>JSON.stringify(s)}).state,s);
});
test('all 80 exercises complete, with restorable state after every check and advance',()=> {
  let s=initialState();
  for(const t of topics) {
    s=startTopic(s,t.id,123);
    for(let i=0;i<10;i++) {
      s=answer(s);assert.deepEqual(restore(JSON.stringify(s)),s);
      s=advanceSession(s);assert.deepEqual(restore(JSON.stringify(s)),s);
    }
    assert.equal(topicComplete(s,t.id),true);
  }
  assert.equal(learningStats(s,day).xp,800);
  assert.equal(learningStats(s,day).solvedCount,80);
});
