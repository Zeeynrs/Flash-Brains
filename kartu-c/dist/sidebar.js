import {icon} from './quiz-view.js';

export function createSidebar({sidebar,main,toggle,backdrop,storage,onLayout=()=>{}}) {
  const media=window.matchMedia('(max-width:760px)');
  let desktopCollapsed=false,mobileOpen=false;
  try {desktopCollapsed=storage?.getItem('flash-brains-sidebar-collapsed')==='true';} catch { /* Session preference remains usable. */ }
  function sync() {
    const modal=media.matches && mobileOpen;
    const expanded=media.matches?mobileOpen:!desktopCollapsed;
    document.body.classList.toggle('sidebar-collapsed',!media.matches && desktopCollapsed);
    document.body.classList.toggle('drawer-open',modal);
    sidebar.hidden=!expanded;sidebar.inert=!expanded;
    sidebar.classList.toggle('mobile-open',modal);
    main.inert=modal;backdrop.hidden=!modal;
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
      if(mobileOpen) sidebar.querySelector('button:not(:disabled),a[href]')?.focus();
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
