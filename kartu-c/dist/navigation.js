const safeSegment=value=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export const courseRoute=id=>`#/pelajaran/${encodeURIComponent(id)}`;
export const lessonRoute=(courseId,topicId)=>`${courseRoute(courseId)}/topik/${encodeURIComponent(topicId)}`;
export function parseRoute(hash='') {
  try {
    const path=String(hash).replace(/^#/,'').replace(/\/+$/,'');
    if(!path || path==='/home') return {screen:'home'};
    const parts=path.split('/').filter(Boolean).map(decodeURIComponent);
    const accounts={login:'login',daftar:'register',profil:'profile','lupa-password':'forgot','reset-password':'recovery'};
    if(parts.length===1 && Object.hasOwn(accounts,parts[0])) return {screen:accounts[parts[0]]};
    if(parts[0]==='pelajaran' && safeSegment(parts[1]??'')) {
      if(parts.length===2) return {screen:'course',courseId:parts[1]};
      if(parts.length===4 && parts[2]==='topik' && safeSegment(parts[3])) return {screen:'learn',courseId:parts[1],topicId:parts[3]};
    }
    return {screen:'home'};
  } catch {return {screen:'home'};}
}
