import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAccountStore} from '../dist/account-store.js';
import {mergeProgress,createProgressSync} from '../dist/progress-sync.js';
import {courseContentById} from '../dist/course-content.js';
import {parseRoute} from '../dist/navigation.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
const engine=courseContentById('c').learning;
const key=engine.STORAGE_KEY;
test('guest snapshots stay intact, reserved imports rotate guest and isolate accounts',async()=>{
  const raw=memory();raw.setItem(key,'original');
  const store=createAccountStore(raw);
  assert.equal(store.storage.getItem(key),'original');
  store.switchUser('A');assert.equal(store.storage.getItem(key),null);
  const source=await store.reserveGuest('A',[key]);assert.equal(source.values[key],'original');
  store.storage.setItem(key,'account A');store.switchUser(null);
  assert.equal(store.storage.getItem(key),null);store.storage.setItem(key,'new guest');
  store.switchUser('B');assert.equal(store.storage.getItem(key),null);
  assert.equal((await store.reserveGuest('B',[key])).values[key],'new guest');
  store.switchUser('A');assert.equal(store.storage.getItem(key),'account A');
  assert.equal(raw.getItem(key),'original');
  assert.equal((await store.reserveGuest('A',[key])).values[key],'original','retry reservation belongs to A');
});
test('storage failure prevents claiming a guest generation',async()=>{
  const raw=memory(),store=createAccountStore(raw);raw.setItem=()=>{throw Error('quota');};
  await assert.rejects(async()=>store.reserveGuest('A',[key]));
});
test('completed import allows a later guest generation for the same owner',async()=>{
  const raw=memory(),store=createAccountStore(raw);store.storage.setItem(key,'first');
  const first=await store.reserveGuest('A',[key]);await store.completeImport('A',first.generation);
  store.switchUser(null);store.storage.setItem(key,'second');
  assert.equal((await store.reserveGuest('A',[key])).values[key],'second');
});
test('stale import completion cannot complete a later generation',async()=>{
  const raw=memory(),store=createAccountStore(raw);store.storage.setItem(key,'first');
  const first=await store.reserveGuest('A',[key]);await store.completeImport('A',first.generation);
  store.switchUser(null);store.storage.setItem(key,'second');const second=await store.reserveGuest('A',[key]);
  await store.completeImport('A',first.generation);
  assert.equal(store.pendingImport('A').generation,second.generation);
});
test('atomic guest reservation cannot be split by quota failure or competing tabs',async()=>{
  const raw=memory(),a=createAccountStore(raw),b=createAccountStore(raw);a.storage.setItem(key,'original');
  const set=raw.setItem;raw.setItem=(k,v)=>{if(k.includes('journal'))throw Error('quota');set(k,v);};
  await assert.rejects(async()=>await a.reserveGuest('A',[key]));raw.setItem=set;
  const [first,second]=await Promise.all([a.reserveGuest('A',[key]),b.reserveGuest('B',[key])]);
  assert.equal(first.values[key],'original');assert.equal(second.values[key],null);
  assert.equal((await a.reserveGuest('A',[key])).values[key],'original');
  assert.throws(()=>b.storage.setItem(key,'stale tab'));
});
test('cloud validation distinguishes corruption from valid empty progress',()=>{
  assert.equal(engine.validate({version:2}),false);
  assert.equal(engine.validate(engine.initialState()),true);
});
test('merge preserves achievements without duplicate XP, and remote session on guest import',()=>{
  let a=engine.startTopic(engine.initialState(),'intro',1);
  // Each source is validated by the real learning engine.
  const topic=courseContentById('c').topics[0].id;
  a=engine.startTopic(engine.initialState(),topic,1);
  const b=engine.startTopic(engine.initialState(),topic,2);
  assert.equal(mergeProgress(engine,a,b,{importGuest:true}).sessions[topic].seed,2);
  assert.equal(mergeProgress(engine,a,b,{dirtyTopics:[topic]}).sessions[topic].seed,1);
  assert.throws(()=>mergeProgress(engine,a,{version:2}));
});
test('account routes are explicit and do not accept external redirect segments',()=>{
  assert.deepEqual(parseRoute('#/login'),{screen:'login'});
  assert.deepEqual(parseRoute('#/daftar'),{screen:'register'});
  assert.deepEqual(parseRoute('#/profil'),{screen:'profile'});
  assert.deepEqual(parseRoute('#/reset-password'),{screen:'recovery'});
  assert.deepEqual(parseRoute('#/login/https://evil.test'),{screen:'home'});
});
test('sync discards delayed reads after account switch',async()=>{
  let resolve;const results=[];
  const sync=createProgressSync({engines:{c:engine},read:()=>new Promise(r=>resolve=r),write:async()=>{},onState:(...args)=>results.push(args)});
  const start=sync.connect('A',{c:engine.initialState()});
  sync.disconnect();resolve([]);await start;
  assert.deepEqual(results,[]);
});
test('corrupt pending metadata does not prevent learning or sync',async()=>{
  let status;
  const sync=createProgressSync({engines:{c:engine},read:async()=>[],write:async()=>({revision:1}),onStatus:s=>status=s});
  assert.equal(await sync.connect('A',{c:engine.initialState()},null),true);
  sync.mark('c',engine.initialState());assert.equal(await sync.flush(),true);assert.equal(status,'synced');
});
test('sync retries CAS with latest remote mastery and keeps edits made during a write',async()=>{
  const topic=courseContentById('c').topics[0].id,base=engine.startTopic(engine.initialState(),topic,1);
  let cloud=base,revision=0,first=true,release,writes=0,seen;
  const sync=createProgressSync({engines:{c:engine},read:async()=>[{course_id:'c',state:cloud,revision}],
    write:async(owner,id,state,expected)=>{writes++;if(first){first=false;await new Promise(r=>release=r);} assert.equal(expected,revision);cloud=state;return {revision:++revision};},onState:(id,s)=>seen=s});
  await sync.connect('A',{c:base});
  sync.mark('c',{...base,sessions:{[topic]:{...base.sessions[topic],seed:2}}});
  const flushing=sync.flush();while(!release)await new Promise(r=>setTimeout(r,0));
  sync.mark('c',{...base,sessions:{[topic]:{...base.sessions[topic],seed:3}}});release();await flushing;
  assert.equal(cloud.sessions[topic].seed,3);assert.equal(writes,2);
  let conflict=true;
  const retry=createProgressSync({engines:{c:engine},read:async()=>[{course_id:'c',state:cloud,revision}],write:async(owner,id,state,expected)=>{if(conflict){conflict=false;revision++;throw Object.assign(Error('conflict'),{code:'PT409'});}assert.equal(expected,revision);cloud=state;return {revision:++revision};},onState:(id,s)=>seen=s});
  await retry.connect('A',{c:cloud});retry.mark('c',base);assert.equal(await retry.flush(),true);assert.equal(seen.sessions[topic].seed,1);
});
