const ROOT='flash-brains-accounts-v1:';
export function createAccountStore(raw) {
  let uid=null,generation='legacy';
  const journal=()=>JSON.parse(raw?.getItem(ROOT+'journal-v2')??'{"current":"legacy","claims":[]}');
  const save=value=>{if(!raw)throw Error('Penyimpanan tidak tersedia');raw.setItem(ROOT+'journal-v2',JSON.stringify(value));};
  const current=()=>journal().current;
  const physical=(key,gen=generation)=>uid?`${ROOT}user:${uid}:${key}`:gen==='legacy'?key:`${ROOT}guest:${gen}:${key}`;
  const enterGuest=()=>{generation=current();};
  async function locked(work) {
    if(!globalThis.navigator?.locks)throw Error('Impor memerlukan browser dengan Web Locks.');
    return navigator.locks.request(ROOT+'guest-import',async()=>work());
  }
  try{enterGuest();}catch { /* Existing guest data remains readable. */ }
  return {
    storage:{
      getItem:key=>{if(!raw)throw Error('Penyimpanan tidak tersedia');return raw.getItem(physical(key));},
      setItem(key,value) {
        if(!raw)throw Error('Penyimpanan tidak tersedia');
        if(!uid && generation!==current())throw Error('Sesi tamu berubah. Muat ulang halaman.');
        raw.setItem(physical(key),value);
        if(!uid && generation!==current())throw Error('Sesi tamu berubah saat menyimpan. Muat ulang halaman.');
      },
      removeItem:key=>raw?.removeItem(physical(key))
    },
    switchUser(id){uid=id;if(!uid)enterGuest();},
    guestAvailable(keys) {
      const gen=current();
      return keys.some(key=>{const value=raw?.getItem(gen==='legacy'?key:`${ROOT}guest:${gen}:${key}`);try{const s=JSON.parse(value);return s&&(s.awarded?.length||Object.keys(s.sessions??{}).length||Object.keys(s.learned??{}).length);}catch{return false;}});
    },
    async reserveGuest(owner,keys) {
      if(!owner)throw Error('Login diperlukan');
      return locked(()=>{
        const data=journal(),prior=data.claims.find(c=>c.owner===owner&&!c.completed);
        if(prior)return prior;
        const gen=data.current,values=Object.fromEntries(keys.map(key=>[key,raw?.getItem(gen==='legacy'?key:`${ROOT}guest:${gen}:${key}`)??null]));
        const backup={owner,generation:gen,values,completed:false};
        // Backup, owner claim and next generation are ONE atomic localStorage write.
        save({current:crypto.randomUUID(),claims:[...data.claims,backup]});return backup;
      });
    },
    pendingImport(owner){return journal().claims.find(c=>c.owner===owner&&!c.completed)??null;},
    async completeImport(owner,generation){return locked(()=>{const data=journal(),claim=data.claims.find(c=>c.owner===owner&&c.generation===generation);if(!claim)throw Error('Cadangan impor tidak ditemukan');if(claim.completed)return;claim.completed=true;save(data);});}
  };
}
