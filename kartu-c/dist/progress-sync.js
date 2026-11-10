const union=(a=[],b=[])=>[...new Set([...a,...b])];
export function mergeProgress(engine,local,remote,{dirtyTopics=[],importGuest=false}={}) {
  if(!engine.validate(local)||!engine.validate(remote)) throw Error('Data progres tidak valid; salinan lokal tetap disimpan.');
  const mergeMap=(a,b)=>Object.fromEntries(union(Object.keys(a),Object.keys(b)).map(k=>[k,union(a[k],b[k])]));
  const sessions={...remote.sessions};
  for(const [id,s] of Object.entries(local.sessions)) if(!sessions[id] || !importGuest && dirtyTopics.includes(id)) sessions[id]=s;
  const activeTopicId=(!importGuest && dirtyTopics.includes(local.activeTopicId)?local.activeTopicId:remote.activeTopicId)??local.activeTopicId;
  const result={version:2,learned:mergeMap(local.learned,remote.learned),solved:mergeMap(local.solved,remote.solved),
    legacyCompleted:union(local.legacyCompleted,remote.legacyCompleted),awarded:union(local.awarded,remote.awarded),
    activity:mergeMap(local.activity,remote.activity),sessions,activeTopicId};
  if(!engine.validate(result)) throw Error('Progres belum dapat digabungkan dengan aman.');
  return result;
}
export function createProgressSync({engines,read,write,onState=()=>{},onStatus=()=>{},onPending=()=>{}}) {
  let epoch=0,uid=null,locals={},pending={},revisions={},running=null;
  const emit=()=>onStatus(!uid?'guest':Object.keys(pending).length?'pending':'synced');
  function mark(id,state) {
    if(!uid)return;
    locals[id]=state;const prev=pending[id];
    pending[id]={serial:(prev?.serial??0)+1,topics:union(prev?.topics,state.activeTopicId?[state.activeTopicId]:[])};
    onPending(structuredClone(pending));emit();
  }
  async function flush() {
    if(!uid) return false;if(running)return running;
    const myEpoch=epoch,owner=uid;
    const work=async()=>{
      try {
        const rows=await read(owner);if(myEpoch!==epoch)return false;
        const remote=Object.fromEntries(rows.map(row=>[row.course_id,row]));
        for(const [id,engine] of Object.entries(engines)) {
          if(myEpoch!==epoch)return false;
          const row=remote[id],cloud=row?.state??engine.initialState();
          revisions[id]=row?.revision??0;
          const merged=mergeProgress(engine,locals[id],cloud,{dirtyTopics:pending[id]?.topics??[]});
          if(JSON.stringify(merged)!==JSON.stringify(cloud) && !pending[id]) pending[id]={serial:1,topics:[]};
          locals[id]=merged;onState(id,merged);
        }
        onPending(structuredClone(pending));
        for(const id of Object.keys(pending)) {
          for(let attempt=0;attempt<4 && pending[id];attempt++) {
            if(myEpoch!==epoch)return false;
            const sent=structuredClone(locals[id]),serial=pending[id].serial;
            try {
              const row=await write(owner,id,sent,revisions[id]);if(myEpoch!==epoch)return false;
              revisions[id]=row.revision;
              if(pending[id]?.serial===serial) delete pending[id];
              onPending(structuredClone(pending));
            } catch(error) {
              if(myEpoch!==epoch)return false;
              if(error.code!=='PT409')throw error;
              const rows=await read(owner);if(myEpoch!==epoch)return false;
              const row=rows.find(r=>r.course_id===id);
              locals[id]=mergeProgress(engines[id],locals[id],row?.state??engines[id].initialState(),{dirtyTopics:pending[id].topics});
              revisions[id]=row?.revision??0;onState(id,locals[id]);
            }
          }
        }
        emit();return !Object.keys(pending).length;
      } catch(error) {if(myEpoch===epoch) onStatus('error',error);return false;}
    };
    running=work();const mine=running;
    try {return await mine;}finally{if(myEpoch===epoch && running===mine)running=null;}
  }
  return {mark,flush,disconnect(){epoch++;uid=null;running=null;locals={};pending={};},
    connect(owner,states,savedPending={}) {
      epoch++;uid=owner;running=null;locals={...states};pending={};
      for(const id of Object.keys(engines)) {
        const value=savedPending?.[id];
        if(value && Number.isSafeInteger(value.serial) && value.serial>=0 && Array.isArray(value.topics)) pending[id]={serial:value.serial,topics:value.topics.filter(topic=>typeof topic==='string')};
      }
      onStatus('syncing');return flush();
    },
    importStates(values) {
      for(const [id,value] of Object.entries(values)) {locals[id]=mergeProgress(engines[id],value,locals[id],{importGuest:true});onState(id,locals[id]);mark(id,locals[id]);}
      return flush();
    }
  };
}
