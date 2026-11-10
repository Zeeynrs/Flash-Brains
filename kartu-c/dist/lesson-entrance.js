import {escape,icon} from './quiz-view.js';
import {brandMark} from './mascot.js';

const sceneMarkup=({course,topic,topics})=> {
  const index=topics.findIndex(t=>t.id===topic?.id);
  const start=topic?Math.max(0,Math.min(index-1,topics.length-3)):0;
  const preview=topics.slice(start,start+3);
  return `
  <div class="entrance-stage" aria-hidden="true"><div class="entrance-camera">
    <div class="entrance-desk"></div><div class="entrance-light"></div>
    <div class="entrance-mat"></div>
    <div class="entrance-notebook"><div class="notebook-binding"></div><span>satu ide,<br>satu langkah.</span><div class="notebook-lines"></div></div>
    <div class="entrance-pencil pencil-one"></div><div class="entrance-pencil pencil-two"></div>
    <div class="entrance-books"><i></i><i></i><i></i></div>
    <div class="entrance-cup"><span></span></div>
    <div class="entrance-lamp"><svg viewBox="0 0 240 310" fill="none"><path d="M171 273q39 7 62 30" stroke="#222925" stroke-width="4"/><ellipse cx="139" cy="274" rx="65" ry="20" fill="#18251f"/><ellipse cx="139" cy="266" rx="65" ry="18" fill="#4c5d4e" stroke="#839079" stroke-width="2"/><path d="m137 257 41-102-70-80" stroke="#1c2b24" stroke-width="15" stroke-linecap="round"/><path d="m137 257 41-102-70-80" stroke="#78816b" stroke-width="7" stroke-linecap="round"/><circle cx="177" cy="155" r="12" fill="#344b3e" stroke="#9b9c7c" stroke-width="3"/><circle cx="108" cy="76" r="10" fill="#344b3e" stroke="#9b9c7c" stroke-width="3"/><path d="M110 61q-35-32-64 7L20 111q42 28 89 3Z" fill="#3e5848" stroke="#98a084" stroke-width="2"/><ellipse cx="65" cy="113" rx="47" ry="12" fill="#d9bf83"/><ellipse cx="65" cy="112" rx="31" ry="7" fill="#fff0bc"/></svg></div>
    <div class="entrance-card-shadow"></div>
    <div class="entrance-card" data-tone="${escape(course.tone)}">
      <div class="entrance-face entrance-front"><span class="entrance-brand">${brandMark()} Flash Brains</span><div class="entrance-emblem">${icon('code')}</div><span class="entrance-front-title">Satu kartu.<br>Dunia baru.</span><span class="entrance-card-foot">BELAJAR · COBA · PAHAM</span></div>
      <div class="entrance-face entrance-back"><span class="entrance-card-kicker">${topic?'LANGKAH BERIKUTNYA':'PELAJARAN PILIHANMU'}</span><span class="entrance-course-symbol">${escape(course.symbol)}</span><h2>${escape(course.title)}</h2><p>${escape(topic?.title??course.rangeLabel)}</p><div class="entrance-mini-lessons">${preview.map((t,i)=>`<div class="${t.id===topic?.id?'is-current':''}"><span>${String(start+i+1).padStart(2,'0')}</span><span>${escape(t.title)}</span>${icon(t.id===topic?.id || !topic && i===0?'play':'book')}</div>`).join('')}</div><span class="entrance-card-foot">${course.topicCount} TOPIK · ${course.exerciseCount} LATIHAN</span></div>
    </div>
    <svg class="entrance-breeze" viewBox="0 0 600 360" fill="none"><path d="M35 102h230q55 0 55-35t-36-35q-33 0-30 29"/><path d="M85 144h335q62 0 62-35"/><path d="M18 204h265q53 0 53 32t-34 33q-29 0-29-24"/><path d="M120 296h350"/></svg>
    <div class="entrance-dust">${Array.from({length:8},(_,i)=>`<i style="--dust:${i}"></i>`).join('')}</div>
  </div></div><div class="entrance-vignette" aria-hidden="true"></div>
  <div class="entrance-origin" aria-hidden="true"></div><div class="entrance-reveal" aria-hidden="true"></div>
  <div class="entrance-caption" aria-hidden="true"><span>SEBUAH LANGKAH KECIL</span><p>Petualangan belajarmu dimulai.</p></div>
  <button type="button" class="entrance-skip" data-entrance-skip>Lewati animasi ${icon('arrow')}</button>`;
};

// Snapshot DOM stays inert and loses IDs so it cannot interfere with the live lesson.
function snapshot(surfaces) {
  const result=document.createElement('div');
  result.className='entrance-snapshot';result.inert=true;
  for(const surface of surfaces.filter(el=>el && !el.hidden)) {
    const rect=surface.getBoundingClientRect();
    if(!rect.width || !rect.height) continue;
    const clone=surface.cloneNode(true);
    for(const node of [clone,...clone.querySelectorAll('[id]')]) node.removeAttribute('id');
    Object.assign(clone.style,{position:'absolute',inset:'auto',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:'0',transform:'none'});
    result.append(clone);
  }
  return result;
}

export function createLessonEntrance({motionPaused,getSurfaces,onComplete=()=>{}}) {
  let active=null;
  function clean(focus=true) {
    const scene=active;
    if(!scene) return;
    active=null;
    scene.events.abort();cancelAnimationFrame(scene.frame);
    for(const animation of scene.animations) {animation.onfinish=null;animation.cancel();}
    for(const [el,inert] of scene.inert) el.inert=inert;
    scene.root.remove();document.body.classList.remove('entrance-active');document.body.style.removeProperty('--entrance-scrollbar');
    if(focus) onComplete();
  }
  function play({course,topic,topics,enter}) {
    if(active) return;
    if(motionPaused()) {enter();return;}
    const origin=snapshot(getSurfaces());
    const root=document.createElement('section');
    root.className='lesson-entrance';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
    root.setAttribute('aria-label',`Membuka ${course.title}${topic?` — ${topic.title}`:''}`);
    root.innerHTML=sceneMarkup({course,topic,topics});root.querySelector('.entrance-origin').append(origin);
    const scene={root,events:new AbortController(),animations:[],inert:[],frame:0};
    active=scene;
    document.body.append(root);
    // Navigate beneath the scene now: Skip, Back and reload never lose a selected lesson.
    try {enter();} catch(error) {clean(false);throw error;}
    scene.inert=getSurfaces().map(el=>[el,el.inert]);
    for(const [el] of scene.inert) el.inert=true;
    document.body.style.setProperty('--entrance-scrollbar',`${innerWidth-document.documentElement.clientWidth}px`);
    document.body.classList.add('entrance-active');
    const skip=root.querySelector('[data-entrance-skip]');skip.focus({preventScroll:true});
    skip.addEventListener('click',()=>clean(),{signal:scene.events.signal});
    document.addEventListener('keydown',event=> {
      if(event.key==='Escape') {event.preventDefault();event.stopPropagation();clean();}
      else if(event.key==='Tab') {event.preventDefault();skip.focus({preventScroll:true});}
    },{capture:true,signal:scene.events.signal});
    window.addEventListener('resize',()=>clean(),{signal:scene.events.signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden) clean();},{signal:scene.events.signal});
    scene.frame=requestAnimationFrame(()=> {
      if(active!==scene) return;
      root.querySelector('.entrance-reveal').append(snapshot(getSurfaces()));
      const width=innerWidth,height=innerHeight;
      const card=root.querySelector('.entrance-card'),rect=card.getBoundingClientRect();
      const zoom=Math.max(width/rect.width,height/rect.height)*1.12;
      const animate=(selector,frames,options)=> {
        const animation=root.querySelector(selector).animate(frames,{fill:'both',...options});
        scene.animations.push(animation);return animation;
      };
      const ease='cubic-bezier(.4,0,.15,1)',duration=3000;
      animate('.entrance-camera',[
        {transform:`scale(${zoom}) rotateX(0deg)`,offset:0,easing:ease},
        {transform:'scale(1) rotateX(7deg)',offset:.25,easing:'ease-in-out'},
        {transform:'scale(1) rotateX(4deg)',offset:.66,easing:ease},
        {transform:`scale(${zoom}) rotateX(0deg)`,offset:1}
      ],{duration,easing:'linear'});
      const liftScale=height<600?.5:1;
      const pose=(y,z,lift)=>`translate(-50%,-50%) translateY(${lift*liftScale}px) translateZ(${100-lift*2*liftScale}px) rotateY(${y}deg) rotateZ(${z}deg)`;
      animate('.entrance-card',[
        {transform:pose(0,-6,0),offset:0},
        {transform:pose(0,-6,0),offset:.26,easing:'ease-in-out'},
        {transform:pose(-13,-9,-12),offset:.34,easing:'cubic-bezier(.45,0,.25,1)'},
        {transform:pose(92,4,-52),offset:.49,easing:'cubic-bezier(.15,.5,.3,1)'},
        {transform:pose(187,3,-16),offset:.63,easing:'ease-out'},
        {transform:pose(180,0,0),offset:.72},
        {transform:pose(180,0,0),offset:1}
      ],{duration,easing:'linear'});
      animate('.entrance-origin',[
        {transform:'scale(1)',opacity:1,borderRadius:'0'},
        {transform:'scale(.38)',opacity:.7,borderRadius:'38px',offset:.65},
        {transform:'scale(.22) rotate(-6deg)',opacity:0,borderRadius:'50px'}
      ],{duration:640,easing:ease});
      animate('.entrance-card-shadow',[
        {transform:'translate(-50%,-50%) scale(1)',opacity:.5},
        {transform:'translate(-50%,-40%) scale(.76)',opacity:.28,offset:.49},
        {transform:'translate(-50%,-50%) scale(1)',opacity:.5}
      ],{duration,easing:'ease-in-out'});
      animate('.entrance-breeze',[
        {transform:'translate(-75%,-35%) rotate(-8deg)',opacity:0},
        {opacity:.55,offset:.35},
        {transform:'translate(-15%,-60%) rotate(5deg)',opacity:0}
      ],{duration:1200,delay:800,easing:'ease-in-out'});
      animate('.entrance-caption',[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none',offset:.3},{opacity:1,offset:.75},{opacity:0}],{duration:1900,delay:500,easing:'ease'});
      const reveal=animate('.entrance-reveal',[
        {transform:`scale(${rect.width/width},${rect.height/height})`,opacity:0,borderRadius:'32px'},
        {opacity:1,offset:.32},
        {transform:'scale(1)',opacity:1,borderRadius:'0'}
      ],{duration:850,delay:2150,easing:'cubic-bezier(.55,0,.15,1)'});
      reveal.onfinish=()=>{if(active===scene) clean();};
    });
  }
  return {play,finish:()=>clean(),cancel:()=>clean(false),get playing(){return Boolean(active);}};
}
