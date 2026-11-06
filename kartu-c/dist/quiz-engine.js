export const typeLabels = {choice:'Pilihan ganda',output:'Tebak output',fill:'Lengkapi kode',order:'Susun kode',bug:'Cari bug',match:'Pasangkan konsep',logic:'Teka-teki logika'};
const normalize = value => value.trim().replace(/\s+/g,' ');
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function isAnswerComplete(ex,input) {
  if(!ex) return false;
  switch(ex.type) {
    case 'choice': case 'output': case 'bug': case 'logic':
      return typeof input === 'string' && ex.options.some(o=>o.id === input);
    case 'fill': return typeof input === 'string' && input.trim().length > 0 && input.length <= 1000;
    case 'order': return Array.isArray(input) && input.length === ex.tokens.length && new Set(input).size === input.length && input.every(id=>ex.tokens.some(t=>t.id===id));
    case 'match': return plainObject(input) && Object.keys(input).length === ex.pairs.length && ex.pairs.every(p=>Object.hasOwn(input,p.id) && ex.pairs.some(target=>target.id===input[p.id])) && new Set(Object.values(input)).size===ex.pairs.length;
    default: return false;
  }
}
export function gradeExercise(ex,input) {
  if(!isAnswerComplete(ex,input)) return false;
  if(ex.type==='fill') return ex.accepted.some(answer=>normalize(answer)===normalize(input));
  if(ex.type==='order') return ex.answer.every((id,i)=>id===input[i]);
  if(ex.type==='match') return ex.pairs.every(p=>input[p.id]===p.id);
  return input===ex.answer;
}
export function correctAnswerText(ex) {
  if(ex.type==='fill') return ex.accepted[0];
  if(ex.type==='order') return ex.answer.map(id=>ex.tokens.find(t=>t.id===id).text).join('\n');
  if(ex.type==='match') return ex.pairs.map(p=>`${p.left} → ${p.right}`).join('\n');
  return ex.options.find(o=>o.id===ex.answer).text;
}
export function shuffled(items,seed) {
  let hash=2166136261;
  for(const ch of String(seed)) hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const random=()=> {hash+=0x6D2B79F5;let t=hash;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  const result=[...items];
  for(let i=result.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
