import {icon} from './quiz-view.js';

export function createSidebar({sidebar,main,toggle,backdrop,storage,onLayout=()=>{},motionPaused=()=>false}) {
  const media=window.matchMedia('(max-width:760px)');
  let desktopCollapsed=false,mobileOpen=false;
  let previousExpanded,previousMobile,slide,fade,gust,layoutFrame=0;
  const duration=440,easing='cubic-bezier(.22,1,.36,1)';
  const wind=document.createElement('div');
  wind.className='sidebar-wind';wind.hidden=true;wind.setAttribute('aria-hidden','true');wind.inert=true;
  wind.innerHTML=`<svg viewBox="0 0 180 520" fill="none" aria-hidden="true" preserveAspectRatio="none"><g class="wind-lines"><path d="M12 58h70c27 0 27-26 10-26-13 0-15 15-6 18"/><path d="M38 91h94"/><path d="M8 183h96c25 0 25 25 9 25-11 0-14-12-6-17"/><path d="M49 222h99"/><path d="M18 328h68c29 0 29-31 9-31-15 0-17 18-6 21"/><path d="M36 362h105"/><path d="M15 455h97c25 0 25 25 8 25"/></g><g class="wind-leaves"><path d="M130 126q21-15 26 1-15 13-26-1Z"/><path d="M105 397q19-16 25-1-13 13-25 1Z"/></g></svg>`;
  document.body.append(wind);
  try {desktopCollapsed=storage?.getItem('flash-brains-sidebar-collapsed')==='true';} catch { /* Session preference remains usable. */ }
  function stopMotion() {
    if(slide) {slide.onfinish=null;slide.cancel();slide=null;}
    fade?.cancel();fade=null;
    if(gust) {gust.onfinish=null;gust.cancel();gust=null;}
    wind.hidden=true;
    cancelAnimationFrame(layoutFrame);
    document.body.classList.remove('sidebar-moving');
  }
  function followLayout() {
    onLayout();
    if(slide?.playState==='running') layoutFrame=requestAnimationFrame(followLayout);
  }
  function blowWind(expanded) {
    const width=sidebar.getBoundingClientRect().width,direction=expanded?1:-1;
    const start=expanded?-110:width-50,end=expanded?width-35:-150;
    wind.hidden=false;wind.dataset.direction=expanded?'open':'close';
    gust=wind.querySelector('svg').animate([
      {transform:`translateX(${start}px) scaleX(${direction})`,opacity:0},
      {opacity:.85,offset:.2},
      {opacity:.65,offset:.6},
      {transform:`translateX(${end}px) scaleX(${direction})`,opacity:0}
    ],{duration:520,easing});
    gust.onfinish=()=>{wind.hidden=true;gust=null;};
  }
  function sync() {
    const modal=media.matches && mobileOpen;
    const expanded=media.matches?mobileOpen:!desktopCollapsed;
    const changed=expanded!==previousExpanded;
    const snap=previousExpanded===undefined || previousMobile!==media.matches || motionPaused();
    const animate=changed && !snap;
    const from=sidebar.hidden?'translateX(-100%)':getComputedStyle(sidebar).transform;
    const opacity=backdrop.hidden?'0':getComputedStyle(backdrop).opacity;
    if(changed || snap) stopMotion();
    if(animate) document.body.classList.add('sidebar-moving');
    document.body.classList.toggle('sidebar-collapsed',!media.matches && desktopCollapsed);
    document.body.classList.toggle('drawer-open',modal);
    sidebar.inert=!expanded;sidebar.setAttribute('aria-hidden',String(!expanded));
    sidebar.dataset.expanded=String(expanded);
    sidebar.classList.toggle('mobile-open',modal);
    main.inert=modal;
    backdrop.inert=!modal;backdrop.dataset.expanded=String(modal);
    if(changed || snap) {
      sidebar.hidden=animate?false:!expanded;
      backdrop.hidden=animate && media.matches?false:!modal;
      if(animate) {
        slide=sidebar.animate([{transform:from},{transform:expanded?'translateX(0)':'translateX(-100%)'}],{duration,easing});
        if(media.matches) fade=backdrop.animate([{opacity},{opacity:modal?1:0}],{duration,easing});
        slide.onfinish=()=> {
          sidebar.hidden=!expanded;backdrop.hidden=!modal;slide=null;fade=null;
          document.body.classList.remove('sidebar-moving');onLayout();
        };
        blowWind(expanded);layoutFrame=requestAnimationFrame(followLayout);
      }
    }
    previousExpanded=expanded;previousMobile=media.matches;
    document.querySelector('.app-header .brand').inert=modal;
    toggle.setAttribute('aria-expanded',String(expanded));
    toggle.setAttribute('aria-label',expanded?'Tutup sidebar navigasi':'Buka sidebar navigasi');
    toggle.innerHTML=`${icon(expanded?'close':'menu')}<span>Menu</span>`;
    if(modal) {sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');}
    else {sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');}
    requestAnimationFrame(onLayout);
  }
  function close(restoreFocus=false) {
    const wasOpen=mobileOpen;
    mobileOpen=false;sync();
    if(wasOpen && restoreFocus) toggle.focus({preventScroll:true});
  }
  function hide() {
    if(media.matches) close(true);
    else {
      desktopCollapsed=true;
      try {storage?.setItem('flash-brains-sidebar-collapsed','true');} catch { /* No learning data is changed. */ }
      sync();toggle.focus({preventScroll:true});
    }
  }
  function toggleMenu() {
    if(media.matches) {
      mobileOpen=!mobileOpen;sync();
      if(mobileOpen) sidebar.querySelector('button:not(:disabled),a[href]')?.focus({preventScroll:true});
      else toggle.focus({preventScroll:true});
    } else {
      desktopCollapsed=!desktopCollapsed;
      try {storage?.setItem('flash-brains-sidebar-collapsed',String(desktopCollapsed));} catch { /* No learning data is changed. */ }
      sync();
    }
  }
  toggle.addEventListener('click',toggleMenu);
  backdrop.addEventListener('click',()=>close(true));
  document.addEventListener('keydown',event=> {
    if(!media.matches || !mobileOpen) return;
    if(event.key==='Escape') {event.preventDefault();close(true);return;}
    if(event.key!=='Tab') return;
    const controls=[...sidebar.querySelectorAll('button:not(:disabled),a[href],summary,input,select,[tabindex="0"]')].filter(el=>el.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(!first) {event.preventDefault();return;}
    if(event.shiftKey && (document.activeElement===first || !sidebar.contains(document.activeElement))) {event.preventDefault();last.focus();}
    else if(!event.shiftKey && (document.activeElement===last || !sidebar.contains(document.activeElement))) {event.preventDefault();first.focus();}
  });
  media.addEventListener('change',()=> {
    const focusWasInside=sidebar.contains(document.activeElement);
    mobileOpen=false;sync();
    if(focusWasInside && sidebar.hidden) toggle.focus({preventScroll:true});
  });
  sync();
  return {sync,close,hide,toggle:toggleMenu};
}
