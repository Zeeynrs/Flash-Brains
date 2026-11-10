const {chromium}=require(process.env.FLASH_BRAINS_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cfg=JSON.parse(fs.readFileSync(process.env.FLASH_BRAINS_TEST_CONFIG,'utf8').replace(/^\uFEFF/,''));
const fixtures=[];
async function api(path,key,body,method='POST'){
 const r=await fetch(cfg.url+path,{method,signal:AbortSignal.timeout(20000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const data=await r.json();assert.ok(r.ok,'fixture API '+r.status);return data;
}
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const suffix of ['a','b']){
  const email=`fb-browser-${Date.now()}-${suffix}@example.invalid`,password=crypto.randomUUID()+'Aa1!';
  const user=await api('/auth/v1/admin/users',cfg.adminKey,{email,password,email_confirm:true,user_metadata:{display_name:'Browser '+suffix}});
  fixtures.push({id:user.id,email,password});
 }
 const context=await browser.newContext({viewport:{width:1280,height:960},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const goto=async hash=>{await page.goto('http://127.0.0.1:5173/'+hash);};
 async function login(actor){await goto('#/login');await page.locator('input[name=email]').fill(actor.email);await page.locator('input[name=password]').fill(actor.password);await page.locator('.account-submit').click();await page.locator('.profile-identity h2').waitFor();await page.waitForFunction(()=>document.querySelector('[data-sync-status]')?.textContent==='Progres tersinkron ke akun');}
 async function logout(){await goto('#/profil');await page.locator('[data-account=logout]').click();await page.waitForURL(/#\/$/);}
 await goto('#/pelajaran/chess/topik/ch-papan');await page.locator('[data-square=a1]').click();await page.locator('#check-answer').click();await page.locator('.feedback-correct').waitFor();
 const guest=await page.evaluate(()=>localStorage.getItem('flash-brains-chess-progress-v1'));
 await login(fixtures[0]);assert.equal(await page.locator('.profile-stats strong').first().textContent(),'0');
 await page.locator('[data-account=import]').click();await page.waitForFunction(()=>document.querySelector('#account-message')?.textContent.includes('berhasil digabungkan'));
 assert.equal(await page.locator('.profile-stats strong').first().textContent(),'10');
 await page.locator('input[name=name]').fill('Pelajar QA');await page.locator('input[name=avatar][value=knight]').check();await page.locator('#account-form button').click();await page.waitForFunction(()=>document.querySelector('#account-message')?.textContent.includes('Profil berhasil'));
 await page.reload();await page.waitForFunction(()=>document.querySelector('.profile-identity h2')?.textContent==='Pelajar QA');
 assert.equal(await page.locator('.profile-stats strong').first().textContent(),'10');
 assert.equal(await page.evaluate(()=>localStorage.getItem('flash-brains-chess-progress-v1')),guest);
 await page.screenshot({path:require('node:os').tmpdir()+'/flash-brains-accounts-profile.png',fullPage:true});
 console.log('PASS real login, profile edit/avatar/reload, explicit guest import, 10XP without overwriting original');
 await goto('#/pelajaran/c/topik/pengenalan');
 // Derive the first valid topic and answer from the actual course; answer through UI.
 const first=await page.evaluate(async()=>{const c=(await import('./course-content.js')).courseContentById('c');return {topic:c.topics[0].id,ex:c.exercisesForTopic(c.topics[0].id)[0]};});
 await goto('#/pelajaran/c/topik/'+first.topic);await page.locator('#answer-form').waitFor();
 await context.setOffline(true);
 await page.locator(`label:has(input[name=choice][value="${first.ex.answer}"])`).click();await page.locator('#check-answer').click();await page.locator('.feedback-correct').waitFor();
 await page.waitForTimeout(1100);await context.setOffline(false);
 await goto('#/profil');await page.locator('[data-account=sync]').click();await page.waitForFunction(()=>document.querySelector('[data-sync-status]')?.textContent==='Progres tersinkron ke akun');
 assert.equal(await page.locator('.profile-stats strong').first().textContent(),'20');
 await logout();await goto('#/pelajaran/chess');assert.match(await page.locator('.course-chip').textContent(),/0\/80/);
 await login(fixtures[1]);assert.equal(await page.locator('.profile-stats strong').first().textContent(),'0');assert.equal(await page.locator('[data-account=import]').count(),0);
 await logout();await login(fixtures[0]);assert.equal(await page.locator('.profile-stats strong').first().textContent(),'20');
 console.log('PASS offline learning/reconnect sync, logout fresh guest, B isolation, A resume');
 await page.evaluate(async cfg=>{const {createClient}=await import('./vendor/supabase.js');window.qaClient=createClient(cfg.url,cfg.publicKey,{auth:{flowType:'pkce'}});},{url:cfg.url,publicKey:cfg.publicKey});
 let releaseRead,held=false;
 await page.route('**/rest/v1/course_progress?*',async route=>{if(!held){held=true;await new Promise(r=>releaseRead=r);}await route.continue();});
 await page.locator('[data-account=logout]').click();while(!releaseRead)await page.waitForTimeout(20);
 await page.evaluate(async actor=>{const r=await qaClient.auth.signInWithPassword(actor);if(r.error)throw Error(r.error.message);},fixtures[1]);
 await page.waitForTimeout(500);releaseRead();await page.waitForTimeout(700);
 assert.equal(await page.locator('.profile-identity p').textContent(),fixtures[1].email,'old logout cannot sign out new account');
 await page.unroute('**/rest/v1/course_progress?*');console.log('PASS delayed logout account guard');
 await page.evaluate(async actor=>{await qaClient.auth.signInWithPassword(actor);},fixtures[0]);await page.waitForTimeout(500);
 const link=await api('/auth/v1/admin/generate_link',cfg.adminKey,{type:'recovery',email:fixtures[0].email});
 await page.evaluate(async({cfg,hash})=>{const {createClient}=await import('./vendor/supabase.js');window.qaClient=createClient(cfg.url,cfg.publicKey,{auth:{flowType:'pkce'}});const r=await qaClient.auth.verifyOtp({token_hash:hash,type:'recovery'});if(r.error)throw Error(r.error.message);},{cfg:{url:cfg.url,publicKey:cfg.publicKey},hash:link.hashed_token??link.properties?.hashed_token});
 await page.locator('form[data-mode=recovery]').waitFor();
 await page.evaluate(async actor=>{const r=await qaClient.auth.signInWithPassword(actor);if(r.error)throw Error(r.error.message);},fixtures[1]);
 await page.waitForTimeout(700);
 assert.equal(await page.locator('form[data-mode=recovery]').count(),0,'recovery permission must not survive A to B');
 console.log('PASS recovery identity switch guard');
 const fresh=await browser.newContext({viewport:{width:360,height:800},reducedMotion:'reduce'}),mobile=await fresh.newPage();
 await mobile.goto('http://127.0.0.1:5173/#/login');await mobile.locator('#account-form').waitFor();await mobile.screenshot({path:require('node:os').tmpdir()+'/flash-brains-accounts-login-mobile.png',fullPage:true});
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await mobile.goto('http://127.0.0.1:5173/#/reset-password');await mobile.getByText('Buka tautan pemulihan dari email',{exact:false}).waitFor();assert.equal(await mobile.locator('input[name=password]').count(),0);
 await mobile.goto('http://127.0.0.1:5173/?code=invalid-qa-code');await mobile.locator('#account-form').waitFor({timeout:5000});assert.equal(new URL(mobile.url()).search,'');assert.ok(await mobile.locator('#account-message').textContent());
 assert.deepEqual(errors,[]);console.log('PASS mobile layout, recovery guard and no page exceptions');
} finally {await browser.close();for(const u of fixtures)await api('/auth/v1/admin/users/'+u.id,cfg.adminKey,undefined,'DELETE');console.log('Cleaned browser fixture accounts');}
})().catch(e=>{console.error(e);process.exitCode=1;});
