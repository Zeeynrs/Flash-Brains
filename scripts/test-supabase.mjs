// Run only against the dedicated project, with a private credentials file outside Git.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {url,publicKey,adminKey}=JSON.parse(await readFile(process.env.FLASH_BRAINS_TEST_CONFIG,'utf8'));
assert.equal(url,'https://bklsebahfuazpbhyuslh.supabase.co');
const users=[];
async function request(path,key=publicKey,token=key,method='GET',body) {
  const response=await fetch(url+path,{method,signal:AbortSignal.timeout(20000),headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  const value=await response.json().catch(()=>null);
  return {ok:response.ok,status:response.status,value};
}
try {
  const actors=[];
  for(const label of ['a','b']) {
    const email=`flashbrains-qa-${Date.now()}-${label}@example.invalid`,password=crypto.randomUUID()+'aA1!';
    const created=await request('/auth/v1/admin/users',adminKey,adminKey,'POST',{email,password,email_confirm:true,user_metadata:{display_name:'QA '+label}});
    assert.equal(created.ok,true,'create controlled fixture user'); users.push(created.value.id);
    const login=await request('/auth/v1/token?grant_type=password',publicKey,publicKey,'POST',{email,password});
    assert.equal(login.ok,true,'fixture sign in');actors.push({id:created.value.id,token:login.value.access_token});
  }
  const [a,b]=actors;
  const own=await request('/rest/v1/profiles?select=*',publicKey,a.token);
  assert.equal(own.ok,true,'profile table and owner policy must exist');
  assert.equal(own.value.length,1);assert.equal(own.value[0].id,a.id);
  const cross=await request(`/rest/v1/profiles?id=eq.${b.id}`,publicKey,a.token);
  assert.deepEqual(cross.value,[]);
  const anon=await request('/rest/v1/profiles?select=*'); assert.equal(anon.ok,false);
  assert.equal((await request(`/rest/v1/profiles?id=eq.${a.id}`,publicKey,a.token,'PATCH',{display_name:'Updated',avatar_id:'knight'})).ok,true);
  assert.equal((await request(`/rest/v1/profiles?id=eq.${a.id}`,publicKey,a.token,'PATCH',{id:b.id})).ok,false);
  assert.equal((await request(`/rest/v1/profiles?id=eq.${a.id}`,publicKey,a.token,'PATCH',{display_name:'x'.repeat(61)})).ok,false);
  const empty={version:2,learned:{},solved:{},legacyCompleted:[],awarded:[],activity:{},sessions:{},activeTopicId:null};
  const save=(actor,revision,state=empty)=>request('/rest/v1/rpc/save_course_progress',publicKey,actor.token,'POST',{p_course_id:'c',p_state:state,p_expected_revision:revision});
  const first=await save(a,0); assert.equal(first.ok,true,'CAS insert');assert.equal(first.value[0].revision,1);
  assert.equal((await save(a,0)).ok,false,'stale revision fails');
  const race=await Promise.all([save(a,1),save(a,1)]);assert.equal(race.filter(r=>r.ok).length,1,'exactly one concurrent revision wins');
  assert.deepEqual((await request('/rest/v1/course_progress?select=*',publicKey,b.token)).value,[]);
  assert.equal((await request('/rest/v1/course_progress?select=*')).ok,false);
  assert.equal((await save(a,2,{version:1})).ok,false,'malformed state fails');
  assert.equal((await save(a,2,{version:2,activeTopicId:null})).ok,false,'missing required state fields fail');
  assert.equal((await request('/rest/v1/course_progress',publicKey,b.token,'POST',{user_id:a.id,course_id:'python',state:empty,revision:1})).ok,false,'direct writes forbidden');
  assert.equal((await request('/rest/v1/rpc/save_course_progress',publicKey,publicKey,'POST',{p_course_id:'c',p_state:empty,p_expected_revision:0})).ok,false);
  assert.equal((await save(b,0)).ok,true,'second user isolated progress');
  console.log('PASS: real Supabase owner RLS, anonymous denial, profile constraints, CAS conflicts/concurrency, invalid state and account isolation');
} finally {
  for(const id of users) assert.equal((await request('/auth/v1/admin/users/'+id,adminKey,adminKey,'DELETE')).ok,true,'remove only controlled fixture');
  console.log(`Removed ${users.length} controlled fixture users.`);
}
