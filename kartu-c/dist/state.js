import { topics } from './curriculum.js';

export const STORAGE_KEY = 'kartu-c-progress-v1';
export const initialState = () => ({ version: 1, learned: {}, session: null });
const topicById = id => topics.find(t => t.id === id);
export const isUnlocked = (state, id) => {
  const index = topics.findIndex(t => t.id === id);
  return index >= 0 && topics.slice(0,index).every(t => (state.learned[t.id]?.length ?? 0) === t.cards.length);
};

export function startTopic(state, id) {
  if (!isUnlocked(state, id)) return state;
  if (state.session?.topicId === id && state.session.queue.length) return state;
  const topic = topicById(id);
  const learned = state.learned[id] ?? [];
  const remaining = topic.cards.filter(c => !learned.includes(c.id)).map(c => c.id);
  return { ...state, session: { topicId: id, queue: remaining.length ? remaining : topic.cards.map(c => c.id), reviewed: 0, again: 0 } };
}

export function rateCard(state, remembered) {
  if (!state.session?.queue.length) return state;
  const [id, ...rest] = state.session.queue;
  const session = { ...state.session, queue: remembered ? rest : [...rest,id], reviewed: state.session.reviewed + 1, again: state.session.again + (remembered ? 0 : 1) };
  const learned = { ...state.learned };
  if (remembered) learned[session.topicId] = [...new Set([...(learned[session.topicId] ?? []), id])];
  return { ...state, learned, session };
}

export function restore(raw) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !value.learned || typeof value.learned !== 'object' || Array.isArray(value.learned)) return initialState();
    const state = initialState();
    for (const [id, ids] of Object.entries(value.learned)) {
      const topic = topicById(id);
      if (!topic || !Array.isArray(ids) || new Set(ids).size !== ids.length || ids.some(c => !topic.cards.some(card => card.id === c))) return initialState();
      state.learned[id] = ids;
    }
    for (const id of Object.keys(state.learned)) if (!isUnlocked(state,id)) return initialState();
    if (value.session !== null) {
      const s = value.session;
      const topic = topicById(s?.topicId);
      if (!topic || !isUnlocked(state,s.topicId) || !Array.isArray(s.queue) || new Set(s.queue).size !== s.queue.length || s.queue.some(id => !topic.cards.some(c => c.id === id)) || !Number.isSafeInteger(s.reviewed) || s.reviewed < 0 || !Number.isSafeInteger(s.again) || s.again < 0 || s.again > s.reviewed) return initialState();
      const missing = topic.cards.filter(c => !(state.learned[topic.id] ?? []).includes(c.id));
      if (missing.some(c => !s.queue.includes(c.id))) return initialState();
      state.session = {topicId:s.topicId,queue:[...s.queue],reviewed:s.reviewed,again:s.again};
    }
    return state;
  } catch { return initialState(); }
}

export function readProgress(storage) {
  try { return {state:restore(storage.getItem(STORAGE_KEY)),available:true}; }
  catch { return {state:initialState(),available:false}; }
}
export function saveProgress(storage,state) {
  try { storage.setItem(STORAGE_KEY,JSON.stringify(state)); return true; }
  catch { return false; }
}
