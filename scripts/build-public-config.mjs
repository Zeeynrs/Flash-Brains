import {writeFile} from 'node:fs/promises';
const url=process.env.SUPABASE_URL,publicKey=process.env.SUPABASE_PUBLISHABLE_KEY;
if(!url||!publicKey)throw Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before building.');
if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))throw Error('Invalid Supabase project URL');
const isAnon=()=>{try{return JSON.parse(Buffer.from(publicKey.split('.')[1],'base64url')).role==='anon';}catch{return false;}};
if(!publicKey.startsWith('sb_publishable_')&&!isAnon())throw Error('Only a publishable or anon key may reach the browser');
await writeFile(new URL('../kartu-c/dist/backend-config.json',import.meta.url),JSON.stringify({url,publicKey,googleEnabled:process.env.SUPABASE_GOOGLE_ENABLED==='true',emailDeliveryReady:process.env.SUPABASE_EMAIL_DELIVERY_READY==='true'})+'\n');
console.log('Generated public backend configuration (no server secrets).');
