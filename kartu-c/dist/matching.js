const COLORS=['#8b69c6','#388cb2','#d08b36','#c36393'];
const SVG_NS='http://www.w3.org/2000/svg';

export function connectPair(input,source,target) {
  const next=Object.fromEntries(Object.entries(input??{}).filter(([id,value])=>id!==source && (!target || value!==target)));
  if(target) next[source]=target;
  return next;
}

// A damped spring: fast contraction, a small overshoot, then rest.
export function recoilPoint(anchor,tip,seconds) {
  if(seconds>=.65) return {...anchor};
  const scale=Math.exp(-13*seconds)*Math.cos(23*seconds);
  return {x:anchor.x+(tip.x-anchor.x)*scale,y:anchor.y+(tip.y-anchor.y)*scale};
}

export function mountMatching(fieldset,{input,onChange,motionPaused=()=>false}) {
  if(!fieldset) return ()=>{};
  const board=fieldset.querySelector('.match-board'),svg=board.querySelector('.match-ropes');
  const sources=[...board.querySelectorAll('[data-match-source]')];
  const targets=[...board.querySelectorAll('[data-match-target]')];
  const status=fieldset.querySelector('.match-status');
  const sourceFor=id=>sources.find(node=>node.dataset.matchSource===id);
  const targetFor=id=>targets.find(node=>node.dataset.matchTarget===id);
  let value={...(input??{})},selected=null,drag=null,recoil=null,frame=0,disposed=false,ignorePointerClick=false;
  const events=new AbortController(),options={signal:events.signal};
  const label=node=>node.querySelector('.match-label').textContent;
  const color=id=>COLORS[sources.indexOf(sourceFor(id))%COLORS.length];
  const announce=text=>{status.textContent=text;};
  const point=node=> {
    const rect=node.querySelector('.match-port').getBoundingClientRect(),base=board.getBoundingClientRect();
    return {x:rect.left+rect.width/2-base.left,y:rect.top+rect.height/2-base.top};
  };
  const pointer=event=> {
    const rect=board.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  };
  function shape(start,end,bend=0) {
    const dx=end.x-start.x,dy=end.y-start.y;
    const slack=Math.min(24,Math.abs(dx)*.1);
    return `M ${start.x} ${start.y} C ${start.x+dx*.38} ${start.y+dy*.12+slack+bend}, ${start.x+dx*.65} ${end.y+slack-bend}, ${end.x} ${end.y}`;
  }
  function rope(start,end,stroke,extra='',bend=0) {
    const path=document.createElementNS(SVG_NS,'path');
    path.setAttribute('d',shape(start,end,bend));
    path.setAttribute('stroke',stroke);
    path.setAttribute('class',`match-rope ${extra}`);
    svg.append(path);
  }
  function draw(now=performance.now()) {
    frame=0;
    if(disposed) return;
    const rect=board.getBoundingClientRect();
    svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
    svg.replaceChildren();
    for(const [id,target] of Object.entries(value)) {
      const source=sourceFor(id),answer=targetFor(target);
      if(!source || !answer || drag?.moved && drag.source===id) continue;
      const stroke=fieldset.disabled?(id===target?'#609e3d':'#c08a35'):color(id);
      rope(point(source),point(answer),stroke);
    }
    if(drag?.moved) {
      const anchor=point(sourceFor(drag.source));
      const distance=Math.hypot(drag.tip.x-anchor.x,drag.tip.y-anchor.y);
      // Slack straightens as the rubber stretches; pointer velocity bends the middle.
      const bend=motionPaused()?0:Math.max(-42,Math.min(42,(drag.tip.y-drag.lag.y)*.55));
      rope(anchor,drag.tip,color(drag.source),'is-dragging',bend+Math.max(0,20-distance*.07));
      drag.lag.x+=(drag.tip.x-drag.lag.x)*.24;
      drag.lag.y+=(drag.tip.y-drag.lag.y)*.24;
      const tip=document.createElementNS(SVG_NS,'circle');
      tip.setAttribute('cx',drag.tip.x);tip.setAttribute('cy',drag.tip.y);tip.setAttribute('r','5');tip.setAttribute('fill',color(drag.source));
      svg.append(tip);
      if(!motionPaused() && Math.hypot(drag.tip.x-drag.lag.x,drag.tip.y-drag.lag.y)>.5) schedule();
    }
    if(recoil) {
      const seconds=(now-recoil.started)/1000;
      if(seconds>=.65 || motionPaused()) recoil=null;
      else {
        const anchor=point(sourceFor(recoil.source));
        const tip=recoilPoint(anchor,recoil.tip,seconds);
        const curl=Math.sin(seconds*34)*Math.exp(-8*seconds)*Math.min(70,recoil.length*.3);
        rope(anchor,tip,color(recoil.source),'is-recoiling',curl);
        schedule();
      }
    }
  }
  function schedule() {if(!frame && !disposed) frame=requestAnimationFrame(draw);}
  function sync() {
    for(const node of sources) {
      const id=node.dataset.matchSource,target=targetFor(value[id]);
      node.classList.toggle('is-active',selected===id);
      node.classList.toggle('is-connected',Boolean(target));
      node.style.setProperty('--rope-color',color(id));
      node.setAttribute('aria-pressed',String(selected===id || Boolean(target)));
      node.setAttribute('aria-label',`${label(node)}${target?`. Terhubung ke ${label(target)}.`:''}`);
    }
    for(const node of targets) {
      const id=node.dataset.matchTarget,source=Object.keys(value).find(key=>value[key]===id);
      node.classList.toggle('is-connected',Boolean(source));
      node.style.setProperty('--rope-color',source?color(source):'#bba6d6');
      node.setAttribute('aria-pressed',String(Boolean(source)));
      node.setAttribute('aria-label',`${label(node)}${source?`. Terhubung dari ${label(sourceFor(source))}.`:''}`);
    }
    schedule();
  }
  function commit(source,target) {
    value=connectPair(value,source,target);
    selected=null;
    onChange({...value});
    announce(target?`${label(sourceFor(source))} dipasangkan dengan ${label(targetFor(target))}.`:`Pasangan ${label(sourceFor(source))} dilepas.`);
    sync();
  }
  function hoverTarget(event) {
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-match-target]');
    return target && board.contains(target)?target:null;
  }
  function clearHover() {targets.forEach(node=>node.classList.remove('is-over'));}
  function release(event,cancelled=false) {
    if(!drag || event.pointerId!==drag.pointerId) return;
    const previous=drag;
    drag=null;clearHover();board.classList.remove('is-dragging');
    const source=sourceFor(previous.source);
    if(source.hasPointerCapture(event.pointerId)) source.releasePointerCapture(event.pointerId);
    if(!previous.moved) {if(cancelled){selected=null;sync();}return;}
    ignorePointerClick=true;
    if(cancelled) {
      selected=null;sync();announce('Tarikan dibatalkan. Pasangan sebelumnya tetap tersimpan.');return;
    }
    const target=hoverTarget(event);
    if(target) commit(previous.source,target.dataset.matchTarget);
    else {
      if(!motionPaused()) recoil={source:previous.source,tip:previous.tip,started:performance.now(),length:Math.hypot(previous.tip.x-previous.anchor.x,previous.tip.y-previous.anchor.y)};
      if(value[previous.source]) commit(previous.source,null);
      else {selected=null;announce('Tali kembali. Tarik sampai ke salah satu jawaban.');sync();}
    }
  }
  board.addEventListener('pointerdown',event=> {
    const source=event.target.closest('[data-match-source]');
    if(!source || fieldset.disabled || event.button!==0 || drag) return;
    const anchor=point(source);
    recoil=null;ignorePointerClick=false;selected=source.dataset.matchSource;
    drag={source:selected,pointerId:event.pointerId,anchor,tip:pointer(event),lag:{...anchor},moved:false,clientX:event.clientX,clientY:event.clientY};
    source.setPointerCapture(event.pointerId);sync();
  },options);
  board.addEventListener('pointermove',event=> {
    if(!drag || event.pointerId!==drag.pointerId) return;
    if(!drag.moved && Math.hypot(event.clientX-drag.clientX,event.clientY-drag.clientY)<5) return;
    drag.moved=true;drag.tip=pointer(event);board.classList.add('is-dragging');
    clearHover();hoverTarget(event)?.classList.add('is-over');schedule();
  },options);
  board.addEventListener('pointerup',event=>release(event),options);
  board.addEventListener('pointercancel',event=>release(event,true),options);
  board.addEventListener('lostpointercapture',event=>release(event,true),options);
  board.addEventListener('click',event=> {
    if(fieldset.disabled) return;
    if(ignorePointerClick && event.detail>0) {ignorePointerClick=false;return;}
    const source=event.target.closest('[data-match-source]'),target=event.target.closest('[data-match-target]');
    if(source) {selected=source.dataset.matchSource;announce(`${label(source)} dipilih. Pilih jawabannya, atau tekan Delete untuk melepas pasangan.`);sync();}
    if(target && selected) commit(selected,target.dataset.matchTarget);
    else if(target) announce('Pilih konsep di sebelah kiri terlebih dahulu.');
  },options);
  fieldset.addEventListener('keydown',event=> {
    if(fieldset.disabled) return;
    const source=event.target.closest('[data-match-source]');
    if((event.key==='Delete' || event.key==='Backspace') && source) {event.preventDefault();commit(source.dataset.matchSource,null);}
    if(event.key==='Escape') {
      if(drag) release({pointerId:drag.pointerId},true);
      selected=null;sync();announce('Pemilihan dibatalkan.');
    }
  },options);
  const observer=new ResizeObserver(schedule);
  observer.observe(board);
  document.fonts?.ready.then(()=>{if(!disposed) schedule();});
  sync();
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();events.abort();};
}
