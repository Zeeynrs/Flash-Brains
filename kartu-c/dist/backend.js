import {safeReturnRoute} from './account-model.js';
export async function createBackend({onAuth,onRecovery,onError}) {
  let config;
  try {const response=await fetch('./backend-config.json',{cache:'no-store'});if(!response.ok)throw Error();config=await response.json();}
  catch {return null;}
  const {createClient}=await import('./vendor/supabase.js');
  const client=createClient(config.url,config.publicKey,{auth:{flowType:'pkce',detectSessionInUrl:false,autoRefreshToken:true,persistSession:true},global:{fetch:(url,options)=>fetch(url,{...options,signal:options?.signal??AbortSignal.timeout(20000)})}});
  const callback=()=>location.origin+'/';
  const check=result=>{if(result.error)throw result.error;return result.data;};
  async function privateRequest(owner,path,body,method=body?'POST':'GET') {
    const session=check(await client.auth.getSession()).session;
    if(!session || session.user.id!==owner)throw Error('Account changed');
    const response=await fetch(config.url+path,{method,signal:AbortSignal.timeout(20000),headers:{apikey:config.publicKey,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
    const result=await response.json();if(!response.ok)throw result;return result;
  }
  // Never await another SDK call while its auth-state lock is held.
  client.auth.onAuthStateChange((event,session)=>setTimeout(()=>{if(event==='PASSWORD_RECOVERY')onRecovery(session?.user.id);onAuth(session,event);},0));
  const query=new URL(location.href).searchParams;
  let recovery=false;
  if(query.has('code')) {
    const result=await client.auth.exchangeCodeForSession(query.get('code'));
    if(result.error)onError(result.error);
    recovery=result.data?.redirectType==='recovery';
    history.replaceState(null,'',location.pathname+(result.error?'#/login':recovery?'#/reset-password':safeReturnRoute(sessionStorage.getItem('flash-brains-auth-return'))));
    sessionStorage.removeItem('flash-brains-auth-return');
    if(recovery)onRecovery(result.data?.session?.user.id);
  } else if(query.has('error')) {
    onError({code:query.get('error_code')});history.replaceState(null,'',location.pathname+'#/login');
  }
  return {client,config,
    session:async()=>check(await client.auth.getSession()).session,
    login:async(email,password)=>check(await client.auth.signInWithPassword({email,password})),
    register:async(email,password,name)=>check(await client.auth.signUp({email,password,options:{data:{display_name:name.trim()},emailRedirectTo:callback()}})),
    google:async()=>{if(!config.googleEnabled)throw {code:'provider_disabled'};sessionStorage.setItem('flash-brains-auth-return',safeReturnRoute(location.hash));return check(await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:callback()}}));},
    forgot:async email=>check(await client.auth.resetPasswordForEmail(email,{redirectTo:callback()})),
    recover:(owner,password)=>privateRequest(owner,'/auth/v1/user',{password},'PUT'),
    logout:async owner=>{const session=check(await client.auth.getSession()).session;if(session?.user.id!==owner)throw Error('Account changed');return check(await client.auth.signOut({scope:'local'}));},
    profile:async()=>check(await client.from('profiles').select('*').single()),
    updateProfile:async(id,fields)=>check(await client.from('profiles').update(fields).eq('id',id).select('*').single()),
    read:owner=>privateRequest(owner,'/rest/v1/course_progress?select=course_id,state,revision'),
    write:async(owner,id,state,revision)=>(await privateRequest(owner,'/rest/v1/rpc/save_course_progress',{p_course_id:id,p_state:state,p_expected_revision:revision}))[0]
  };
}
