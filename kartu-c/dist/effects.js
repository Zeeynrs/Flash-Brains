// Celebration effects drawn above the page. Every effect is skipped while animations are paused.
const COLORS=['#78d73e','#ffc84d','#62c9fa','#b89aef','#ff9ec4','#ffb067'];
const rand=(min,max)=>min+Math.random()*(max-min);
const motionOn=()=>document.documentElement.dataset.motion!=='paused';
let layer;
function fxLayer() {
  if(!layer?.isConnected) {
    layer=document.createElement('div');
    layer.className='fx-layer';
    layer.setAttribute('aria-hidden','true');
    document.body.append(layer);
  }
  return layer;
}
function piece(x,y) {
  const el=document.createElement('i'), size=rand(7,12), round=Math.random()<.3;
  el.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${round?size:size*1.5}px;border-radius:${round?'50%':'2px'};background:${COLORS[Math.floor(Math.random()*COLORS.length)]}`;
  fxLayer().append(el);
  return el;
}
function play(el,frames,options) {
  const animation=el.animate(frames,{fill:'both',...options});
  animation.onfinish=animation.oncancel=()=>el.remove();
}

// Confetti that pops out of an element, then falls. Used for a correct answer.
export function burst(origin,{count=26,power=1}={}) {
  if(!origin || !motionOn()) return;
  const rect=origin.getBoundingClientRect(), x=rect.left+rect.width/2, y=rect.top+rect.height/2;
  for(let i=0;i<count;i++) {
    const angle=rand(-Math.PI*.95,-Math.PI*.05), reach=rand(70,190)*power;
    const dx=Math.cos(angle)*reach, dy=Math.sin(angle)*reach, spin=rand(-540,540);
    play(piece(x,y),[
      {transform:'translate(-50%,-50%) scale(.3)',opacity:1},
      {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${spin*.6}deg) scale(1)`,opacity:1,offset:.4},
      {transform:`translate(calc(-50% + ${dx*1.3}px),calc(-50% + ${dy+rand(130,240)}px)) rotate(${spin}deg) scale(.8)`,opacity:0}
    ],{duration:rand(950,1500),easing:'cubic-bezier(.15,.7,.35,1)'});
  }
}

// Confetti falling across the whole screen. Used when a topic is finished.
export function rain({count=Math.round(Math.min(90,Math.max(36,window.innerWidth/13)))}={}) {
  if(!motionOn()) return;
  const width=window.innerWidth, height=window.innerHeight;
  for(let i=0;i<count;i++) {
    const sway=rand(-90,90), spin=rand(-720,720);
    play(piece(rand(0,width),-20),[
      {transform:'translate(-50%,0) rotate(0deg)',opacity:1},
      {transform:`translate(calc(-50% + ${sway}px),${height*.55}px) rotate(${spin*.55}deg)`,opacity:1,offset:.55},
      {transform:`translate(calc(-50% + ${sway*.4}px),${height+60}px) rotate(${spin}deg)`,opacity:.9}
    ],{duration:rand(2300,3900),delay:rand(0,1100),easing:'cubic-bezier(.3,.1,.6,1)'});
  }
}

// Counts numbers marked with data-count up from zero, e.g. the result stats.
export function countUp(root,duration=1000) {
  if(!root || !motionOn()) return;
  for(const el of root.querySelectorAll('[data-count]')) {
    const target=Number(el.dataset.count), prefix=el.dataset.prefix??'', suffix=el.dataset.suffix??'';
    if(!Number.isFinite(target)) continue;
    const begin=performance.now()+Number(el.dataset.delay??0);
    el.textContent=`${prefix}0${suffix}`;
    const step=now=> {
      if(!el.isConnected) return;
      const t=Math.min(1,Math.max(0,(now-begin)/duration));
      el.textContent=`${prefix}${Math.round(target*(1-(1-t)**3))}${suffix}`;
      if(t<1 && motionOn()) requestAnimationFrame(step);
      else el.textContent=`${prefix}${target}${suffix}`;
    };
    requestAnimationFrame(step);
  }
}

export function clearEffects() {layer?.replaceChildren();}
