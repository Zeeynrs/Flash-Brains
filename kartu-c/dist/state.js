import { topics } from './curriculum.js';
import { exercisesForTopic, exerciseById } from './quizzes.js';
import { gradeExercise, isAnswerComplete } from './quiz-engine.js';

// Keep the existing key so a browser's original flashcard progress can migrate.
export const STORAGE_KEY = 'kartu-c-progress-v1';
export const DAILY_GOAL = 5;
export const XP_PER_EXERCISE = 10;
export const initialState = () => ({version:2,learned:{},solved:{},legacyCompleted:[],awarded:[],activity:{},sessions:{},activeTopicId:null});
const topicById = id => topics.find(t=>t.id===id);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = value => Number.isSafeInteger(value) && value >= 0;
const unique = array => Array.isArray(array) && new Set(array).size===array.length;
const exerciseIds = id => exercisesForTopic(id).map(e=>e.id);
export const currentSession = state => state.sessions[state.activeTopicId] ?? null;
export const topicComplete = (state,id) => state.legacyCompleted.includes(id) || (state.solved[id]?.length ?? 0)===exercisesForTopic(id).length && exercisesForTopic(id).length>0;
export function isUnlocked(state,id) {
  const index=topics.findIndex(t=>t.id===id);
  return index>=0 && topics.slice(0,index).every(t=>topicComplete(state,t.id));
}
export function localDateKey(date=new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
const validDay = day => typeof day==='string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day+'T00:00:00Z')) && new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day;
function previousDay(day) {
  const date=new Date(day+'T00:00:00Z');
  date.setUTCDate(date.getUTCDate()-1);
  return date.toISOString().slice(0,10);
}
export function learningStats(state,day=localDateKey()) {
  let cursor=(state.activity[day]?.length ?? 0)>=DAILY_GOAL ? day : previousDay(day);
  let streak=0;
  while((state.activity[cursor]?.length ?? 0)>=DAILY_GOAL) {streak++;cursor=previousDay(cursor);}
  return {xp:state.awarded.length*XP_PER_EXERCISE,todayCount:state.activity[day]?.length ?? 0,goal:DAILY_GOAL,streak,solvedCount:Object.values(state.solved).reduce((sum,ids)=>sum+ids.length,0)};
}
function withSession(state,session) {
  return {...state,sessions:{...state.sessions,[session.topicId]:session}};
}
export function startTopic(state,id,seed=Math.floor(Math.random()*0x7fffffff)) {
  if(!isUnlocked(state,id)) return state;
  const existing=state.sessions[id];
  if(existing && existing.phase!=='done') return {...state,activeTopicId:id};
  const queue=exerciseIds(id).slice(0,-1);
  if(!queue.length) return state;
  const session={topicId:id,seed,phase:'lesson',round:1,queue,deferred:[],cleared:[],draft:null,pending:null,attempts:0,mistakes:0,earned:0};
  return withSession({...state,activeTopicId:id},session);
}
function validDraft(ex,input) {
  if(input===null) return true;
  if(!ex) return false;
  if(ex.options) return typeof input==='string' && ex.options.some(o=>o.id===input);
  if(ex.type==='fill') return typeof input==='string' && input.length<=1000;
  if(ex.type==='order') return unique(input) && input.length<=ex.tokens.length && input.every(id=>ex.tokens.some(t=>t.id===id));
  if(ex.type==='match') return object(input) && Object.entries(input).every(([id,target])=>ex.pairs.some(p=>p.id===id) && (target==='' || ex.pairs.some(p=>p.id===target)));
  return false;
}
export function setDraft(state,input) {
  const session=currentSession(state);
  if(!session || session.pending || session.phase==='done' || !validDraft(exerciseById(session.queue[0]),input)) return state;
  return withSession(state,{...session,draft:structuredClone(input)});
}
export function submitAnswer(state,input,day=localDateKey()) {
  const session=currentSession(state);
  if(!session || session.pending || session.phase==='done' || !validDay(day)) return state;
  const exercise=exerciseById(session.queue[0]);
  if(!isAnswerComplete(exercise,input)) return state;
  const correct=gradeExercise(exercise,input);
  const fresh=correct && !state.awarded.includes(exercise.id);
  const xp=fresh ? XP_PER_EXERCISE : 0;
  const solved=correct ? {...state.solved,[session.topicId]:[...new Set([...(state.solved[session.topicId] ?? []),exercise.id])]} : state.solved;
  const activity=correct ? {...state.activity,[day]:[...new Set([...(state.activity[day] ?? []),exercise.id])]} : state.activity;
  const next={...state,solved,activity,awarded:fresh ? [...state.awarded,exercise.id] : state.awarded};
  return withSession(next,{...session,draft:structuredClone(input),attempts:session.attempts+1,mistakes:session.mistakes+(correct ? 0:1),earned:session.earned+xp,pending:{exerciseId:exercise.id,correct,input:structuredClone(input),xp,day}});
}
export function advanceSession(state) {
  const session=currentSession(state);
  if(!session?.pending) return state;
  const pending=session.pending;
  let queue=session.queue.slice(1);
  let deferred=pending.correct ? [...session.deferred] : [...session.deferred,pending.exerciseId];
  const cleared=pending.correct ? [...session.cleared,pending.exerciseId] : [...session.cleared];
  let phase=session.phase, round=session.round;
  if(queue.length===0) {
    if(deferred.length) {
      queue=deferred;deferred=[];round++;
      phase=session.phase==='challenge' ? 'challenge' : 'retry';
    } else {
      const challenge=exerciseIds(session.topicId).at(-1);
      if(!cleared.includes(challenge)) {queue=[challenge];phase='challenge';round=1;}
      else phase='done';
    }
  }
  return withSession(state,{...session,queue,deferred,cleared,phase,round,draft:null,pending:null});
}

function validLearned(learned) {
  return object(learned) && Object.entries(learned).every(([id,ids])=>topicById(id) && unique(ids) && ids.every(cardId=>topicById(id).cards.some(c=>c.id===cardId)));
}
function migrateLegacy(value) {
  if(!validLearned(value.learned)) return initialState();
  const state=initialState();
  state.learned=value.learned;
  state.legacyCompleted=topics.filter(t=>(value.learned[t.id]?.length ?? 0)===t.cards.length).map(t=>t.id);
  if(Object.keys(state.learned).some(id=>!isUnlocked(state,id))) return initialState();
  if(value.session!==null) {
    const s=value.session, t=topicById(s?.topicId);
    if(!t || !isUnlocked(state,t.id) || !unique(s.queue) || s.queue.some(id=>!t.cards.some(c=>c.id===id)) || !integer(s.reviewed) || !integer(s.again) || s.again>s.reviewed) return initialState();
    if(t.cards.some(c=>!state.learned[t.id]?.includes(c.id) && !s.queue.includes(c.id))) return initialState();
  }
  return state;
}
function validateSession(state,id,s) {
  const ids=exerciseIds(id), firstNine=ids.slice(0,-1), challenge=ids.at(-1);
  if(!object(s) || s.topicId!==id || !isUnlocked(state,id) || !integer(s.seed) || !integer(s.round) || s.round<1 || !integer(s.attempts) || !integer(s.mistakes) || s.mistakes>s.attempts || !integer(s.earned) || s.earned%10!==0 || s.earned>100) return false;
  if(!['lesson','retry','challenge','done'].includes(s.phase)) return false;
  if(![s.queue,s.deferred,s.cleared].every(a=>unique(a) && a.every(e=>ids.includes(e)))) return false;
  if(!validDraft(exerciseById(s.queue[0]),s.draft)) return false;
  const all=[...s.queue,...s.deferred,...s.cleared];
  if(new Set(all).size!==all.length || s.cleared.some(e=>!state.solved[id]?.includes(e))) return false;
  if(s.phase==='lesson' || s.phase==='retry') {
    if(all.length!==9 || all.some(e=>!firstNine.includes(e)) || !s.queue.length) return false;
  } else if(s.phase==='challenge') {
    if(s.queue.length!==1 || s.queue[0]!==challenge || s.deferred.length || s.cleared.length!==9 || firstNine.some(e=>!s.cleared.includes(e))) return false;
  } else if(s.queue.length || s.deferred.length || s.cleared.length!==10 || s.pending!==null) return false;
  if(s.pending!==null) {
    const p=s.pending, ex=exerciseById(s.queue[0]);
    if(!object(p) || p.exerciseId!==ex?.id || typeof p.correct!=='boolean' || !validDay(p.day) || ![0,10].includes(p.xp) || !isAnswerComplete(ex,p.input) || gradeExercise(ex,p.input)!==p.correct) return false;
    if(!p.correct && p.xp!==0) return false;
    if(p.correct && (!state.solved[id]?.includes(ex.id) || !state.awarded.includes(ex.id) || !state.activity[p.day]?.includes(ex.id))) return false;
  }
  const successes=s.attempts-s.mistakes;
  if(successes!==s.cleared.length+(s.pending?.correct ? 1:0) || s.earned>successes*10) return false;
  return true;
}
export function restore(raw) {
  try {
    const value=JSON.parse(raw);
    if(!object(value)) return initialState();
    if(value.version===1) return migrateLegacy(value);
    if(value.version!==2 || !validLearned(value.learned) || !object(value.solved) || !object(value.activity) || !object(value.sessions) || !unique(value.legacyCompleted) || !unique(value.awarded)) return initialState();
    const state={version:2,learned:value.learned,solved:value.solved,legacyCompleted:value.legacyCompleted,awarded:value.awarded,activity:value.activity,sessions:value.sessions,activeTopicId:value.activeTopicId};
    if(state.legacyCompleted.some(id=>!topicById(id) || state.learned[id]?.length!==5)) return initialState();
    for(const [id,ids] of Object.entries(state.solved)) {
      if(!topicById(id) || !unique(ids) || ids.some(e=>!exerciseIds(id).includes(e)) || !isUnlocked(state,id)) return initialState();
    }
    if(state.legacyCompleted.some(id=>!isUnlocked(state,id)) || Object.keys(state.learned).some(id=>!isUnlocked(state,id))) return initialState();
    const mastered=new Set(Object.values(state.solved).flat());
    if(state.awarded.length!==mastered.size || state.awarded.some(id=>!mastered.has(id))) return initialState();
    for(const [day,ids] of Object.entries(state.activity)) if(!validDay(day) || !unique(ids) || ids.some(id=>!mastered.has(id))) return initialState();
    for(const [id,s] of Object.entries(state.sessions)) if(!topicById(id) || !validateSession(state,id,s)) return initialState();
    if(state.activeTopicId!==null && !Object.hasOwn(state.sessions,state.activeTopicId)) return initialState();
    return state;
  } catch {return initialState();}
}
export function readProgress(storage) {
  try {return {state:restore(storage.getItem(STORAGE_KEY)),available:true};}
  catch {return {state:initialState(),available:false};}
}
export function saveProgress(storage,state) {
  try {storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}
  catch {return false;}
}
