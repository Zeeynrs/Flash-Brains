import {courseContentById} from './course-content.js';
import {aggregateLearningStats} from './learning-state.js';
import { isAnswerComplete, typeLabels } from './quiz-engine.js';
import { escape, icon, codeBlock, answerControls, feedbackMarkup, referenceMarkup } from './quiz-view.js';
import { brandMark, byteMascot } from './mascot.js';
import {courses,courseById,searchCourses} from './courses.js';
import {parseRoute,courseRoute,lessonRoute} from './navigation.js';
import {catalogMarkup,courseCardsMarkup,missionMarkup} from './catalog-view.js';
import {createSidebar} from './sidebar.js';
import {burst,rain,countUp,clearEffects} from './effects.js';
import {mountMatching} from './matching.js';
import {createLessonEntrance} from './lesson-entrance.js';

let storage;
try {storage=window.localStorage;} catch {storage=null;}
const loaded=Object.fromEntries(courses.map(course=>[course.id,courseContentById(course.id).learning.readProgress(storage)]));
const states=Object.fromEntries(Object.entries(loaded).map(([id,result])=>[id,result.state]));
const storageAvailableByCourse=Object.fromEntries(Object.entries(loaded).map(([id,result])=>[id,result.available]));
let activeCourseId='c',lastCourseId;
try {lastCourseId=storage?.getItem('flash-brains-last-course');} catch { /* Resume still works for the current visit. */ }
let content=courseContentById(activeCourseId),topics=content.topics,engine=content.learning,state=states[activeCourseId];
let screen='home',draft,showGuide=false,courseQuery='';
let disposeMatching=()=>{};
let lessonEntrance;
// Names the moment being rendered (correct, wrong, next, finish) so its animation plays once, not on reload.
let fx=null;
const activeCourse=()=>courseById(activeCourseId);
const exercisesForTopic=id=>content.exercisesForTopic(id);
const exerciseById=id=>content.exerciseById(id);
const isUnlocked=(value,id)=>engine.isUnlocked(value,id);
const topicComplete=(value,id)=>engine.topicComplete(value,id);
const startTopic=(value,id)=>engine.startTopic(value,id);
const setDraft=(value,input)=>engine.setDraft(value,input);
const submitAnswer=(value,input)=>engine.submitAnswer(value,input);
const advanceSession=value=>engine.advanceSession(value);
function selectCourse(id) {
  if(!courseContentById(id)) return false;
  states[activeCourseId]=state;
  activeCourseId=id;content=courseContentById(id);topics=content.topics;engine=content.learning;state=states[id];
  draft=engine.currentSession(state)?.pending?.input??engine.currentSession(state)?.draft;
  return true;
}
function rememberCourse() {
  lastCourseId=activeCourseId;
  try {storage?.setItem('flash-brains-last-course',activeCourseId);} catch { /* Learning remains available in memory. */ }
}
const main=document.querySelector('#main'), sidebar=document.querySelector('#sidebar');
const notice=document.querySelector('#storage-notice'), announcement=document.querySelector('#announcement');
notice.hidden=Object.values(storageAvailableByCourse).every(Boolean);
document.body.classList.toggle('storage-unavailable',!notice.hidden);
const mastered=topic=>state.solved[topic.id]?.length ?? 0;
const session=()=>engine.currentSession(state);
const currentTopic=()=>topics.find(t=>t.id===state.activeTopicId);
const currentExercise=()=>exerciseById(session()?.queue[0]);
const persist=()=> {
  states[activeCourseId]=state;
  storageAvailableByCourse[activeCourseId]=engine.saveProgress(storage,state);
  notice.hidden=Object.values(storageAvailableByCourse).every(Boolean);
  document.body.classList.toggle('storage-unavailable',!notice.hidden);
  const label=document.querySelector('.local-label');
  if(label) label.textContent=notice.hidden?'Progres tersimpan di browser ini':'Penyimpanan browser tidak tersedia';
};
const persistDraft=()=>{state=setDraft(state,draft);persist();};
const stats=()=>aggregateLearningStats({...states,[activeCourseId]:state});
const courseStats=()=>engine.learningStats(state);
const motionMedia=window.matchMedia('(prefers-reduced-motion: reduce)');
// The device setting is only the default. An explicit choice in the app wins either way.
let motionChoice=null;
try {const saved=storage?.getItem('flash-brains-motion');if(saved==='on' || saved==='paused') motionChoice=saved;} catch { /* Preference remains available in memory. */ }
const motionPaused=()=>motionChoice?motionChoice==='paused':motionMedia.matches;
function applyMotionPreference() {document.documentElement.dataset.motion=motionPaused()?'paused':'on';if(motionPaused()) lessonEntrance?.finish();}
applyMotionPreference();
motionMedia.addEventListener('change',()=>{applyMotionPreference();renderSidebar();});
document.querySelector('.mobile-header .brand-mark').innerHTML=brandMark();
const shell=createSidebar({sidebar,main,toggle:document.querySelector('#menu-toggle'),backdrop:document.querySelector('#sidebar-backdrop'),storage,onLayout:drawCourseRoute,motionPaused});
lessonEntrance=createLessonEntrance({motionPaused,
  getSurfaces:()=>[document.querySelector('.app-header'),sidebar,main],
  onComplete:()=>{shell.sync();(main.querySelector('#feedback-title')??main.querySelector('#question')??main.querySelector('h1'))?.focus({preventScroll:true});requestAnimationFrame(drawCourseRoute);}
});
function nextTopic() {
  return topics.find(t=>isUnlocked(state,t.id) && !topicComplete(state,t.id)) ?? topics.find(t=>mastered(t)<10 && isUnlocked(state,t.id)) ?? topics[0];
}
function closeMenu(restoreFocus=false) {shell.close(restoreFocus);}
function progressByCourse() {return Object.fromEntries(courses.map(c=>[c.id,courseContentById(c.id).learning.learningStats(c.id===activeCourseId?state:states[c.id])]));}
function renderCatalog() {
  const resumeCourse=[lastCourseId,...courses.map(c=>c.id)].find(id=>{
    const bundle=courseContentById(id);
    return bundle && bundle.learning.currentSession(states[id])?.phase!=='done' && bundle.learning.currentSession(states[id]);
  });
  const bundle=courseContentById(resumeCourse),saved=bundle?.learning.currentSession(states[resumeCourse]);
  const continueTopic=saved?{id:saved.topicId,title:bundle.topics.find(t=>t.id===saved.topicId).title,courseId:resumeCourse,courseTitle:courseById(resumeCourse).title,symbol:courseById(resumeCourse).symbol}:null;
  main.innerHTML=catalogMarkup({stats:stats(),rewards:rewardBar(),progressByCourse:progressByCourse(),continueTopic,query:courseQuery,showGuide});
}
function renderSidebar() {
  const paused=motionPaused();
  const inCourse=screen!=='home';
  const learnedCount=inCourse?courseStats().solvedCount:stats().solvedCount;
  const totalExercises=inCourse?activeCourse().exerciseCount:courses.reduce((sum,c)=>sum+c.exerciseCount,0);
  sidebar.innerHTML=`<div class="sidebar-heading"><span>Jelajahi</span><button type="button" class="sidebar-close" data-action="close-sidebar" aria-label="Tutup sidebar navigasi">${icon('close')}</button></div>
    <button class="nav-home ${screen==='home'?'selected':''}" data-action="home" ${screen==='home'?'aria-current="page"':''}>${icon('home')}<span>Beranda</span></button>
    <p class="nav-label">Pelajaran</p><nav aria-label="Pilihan pelajaran">${courses.filter(c=>c.status==='available').map(c=>`<a class="sidebar-course ${inCourse && c.id===activeCourseId?'selected':''}" href="${courseRoute(c.id)}" data-course="${c.id}" ${inCourse && c.id===activeCourseId?'aria-current="page"':''}><span class="sidebar-course-symbol" aria-hidden="true">${escape(c.symbol)}</span><span>${escape(c.title)}</span></a>`).join('')}</nav>
    ${inCourse?`<p class="nav-label">Topik</p><nav aria-label="Daftar topik ${escape(activeCourse().shortTitle)}">${topics.map((t,i)=>`<button class="nav-topic ${screen==='learn' && state.activeTopicId===t.id?'selected':''}" data-topic="${t.id}" ${!isUnlocked(state,t.id)?'disabled':''} ${screen==='learn' && state.activeTopicId===t.id?'aria-current="step"':''}><span class="nav-number ${topicComplete(state,t.id)?'done':''}">${topicComplete(state,t.id)?icon('check'):String(i+1).padStart(2,'0')}</span><span>${escape(t.title)}</span>${!isUnlocked(state,t.id)?icon('lock'):''}<span class="sr-only">${!isUnlocked(state,t.id)?', terkunci':topicComplete(state,t.id)?', selesai':', terbuka'}</span></button>`).join('')}</nav>`:''}
    <div class="sidebar-bottom"><button class="sidebar-help text-button" data-action="guide">${icon('help')} Cara belajar</button>
    <button id="motion-toggle" class="motion-toggle text-button" data-action="motion" aria-pressed="${!paused}" aria-label="${paused?'Animasi mati. Aktifkan animasi':'Animasi aktif. Matikan animasi'}">${icon(paused?'play':'pause')}<span>${paused?'Animasi mati':'Animasi aktif'}</span></button>
    <div class="mini-progress"><span>Latihanmu</span><strong>${learnedCount}/${totalExercises}</strong></div><progress max="${totalExercises}" value="${learnedCount}" aria-label="Total latihan dikuasai"></progress><span class="local-label">${notice.hidden?'Progres tersimpan di browser ini':'Penyimpanan browser tidak tersedia'}</span></div>`;
  shell.sync();
}
const rewardBar=({streak=true}={})=>`<div class="reward-bar" aria-label="Pencapaian belajar"><span class="reward-pill xp-pill" title="XP yang sudah kamu kumpulkan">${icon('gem')}<strong>${stats().xp}</strong><span>XP</span></span>${streak?`<span class="reward-pill streak-pill" title="Hari berturut-turut mencapai target">${icon('fire')}<strong>${stats().streak}</strong><span>hari</span></span>`:''}</div>`;
function renderCourse() {
  const active=session() && session().phase!=='done'?currentTopic():nextTopic();
  const finished=topics.filter(t=>topicComplete(state,t.id)).length;
  const solved=courseStats().solvedCount, total=activeCourse().exerciseCount;
  const allDone=solved===total, continuing=state.sessions[active.id] && state.sessions[active.id].phase!=='done';
  const legacy=Object.values(state.learned).some(ids=>ids.length);
  const unit=i=>String(i+1).padStart(2,'0');
  const colors=['green','violet','blue','orange','pink','teal','indigo','gold'];
  const glyphs=['code','gem','terminal','bolt','branch','repeat','layers','grid'];
  main.innerHTML=`<div class="page"><div class="page-top"><div class="course-chip"><span class="course-symbol" aria-hidden="true">${escape(activeCourse().symbol)}</span><div><h1 tabindex="-1">${escape(activeCourse().title)}</h1><span>${allDone?escape(activeCourse().finishLabel):`${solved}/${total} latihan dikuasai`}</span></div></div>${rewardBar()}</div>
    ${legacy?'<p class="legacy-notice">Progres kartu lamamu aman! Latihan baru sudah menunggu di topik yang terbuka.</p>':''}
    <section class="continue-panel" aria-label="Lanjutkan belajar"><div class="continue-copy"><span class="eyebrow">Unit ${unit(topics.indexOf(active))} · ${continuing?'lanjutkan langkahmu':allDone?'saatnya latihan ulang':'mulai di sini'}</span><h2>${escape(active.title)}</h2><p>${escape(active.description)}</p><button class="primary" data-topic="${active.id}">${continuing?'Lanjut belajar':allDone?'Main lagi':'Ayo, mulai!'} ${icon('arrow')}</button></div>${byteMascot('idle')}</section>
    ${missionMarkup(stats().todayCount)}
    <section class="curriculum" aria-labelledby="map-title"><div class="section-heading"><h2 id="map-title">Peta belajar</h2><span class="topic-count">${finished}/${topics.length} selesai</span></div>
      <div class="topic-grid" id="course-map"><svg id="course-route" class="course-route" aria-hidden="true"></svg>${topics.map((t,i)=>{
        const open=isUnlocked(state,t.id), done=topicComplete(state,t.id), legacyDone=state.legacyCompleted.includes(t.id) && mastered(t)<10;
        const status=!open?`Selesaikan unit ${i} untuk membuka`:legacyDone?`${mastered(t)}/10 latihan · progres lama tersimpan`:mastered(t)===10?'Tuntas':`${mastered(t)}/10 latihan`;
        return `<button class="topic-row unit-${colors[i]} ${done?'is-done':open?'is-open':'is-locked'} ${active.id===t.id?'is-next':''}" data-topic="${t.id}" ${!open?'disabled':''} style="--bend:${[0,1,2,1][i%4]}"><span class="path-node">${icon(done?'check':open?glyphs[i]:'lock')}<span class="node-unit" aria-hidden="true">${unit(i)}</span></span><span class="topic-content"><span class="topic-title"><span class="sr-only">Unit ${i+1}: </span>${escape(t.title)}${active.id===t.id && open?`<span class="next-badge">${continuing?'Lanjutkan':'Mulai di sini'}</span>`:''}</span><span class="topic-status">${status}</span>${open?`<span class="exercise-track" aria-hidden="true">${exercisesForTopic(t.id).map(ex=>`<span class="${state.solved[t.id]?.includes(ex.id)?'filled':''}"></span>`).join('')}</span>`:''}</span></button>`;
      }).join('')}</div><p class="path-finish">${icon('trophy')}<span>${allDone?'Petualangan tuntas! Terus asah logikamu.':escape(activeCourse().goalLabel)}</span></p></section>
    <footer class="page-footer"><span>Belajar. Coba. Paham. Ulangi.</span><button class="text-button" data-action="guide" aria-expanded="${showGuide}">Cara bermain ${showGuide?'−':'+'}</button></footer>
    ${showGuide?`<section class="guide" aria-label="Cara bermain"><h2>Jadi jago, satu soal dulu.</h2><ol><li>Pilih jawabanmu, lalu tekan <strong>Periksa jawaban</strong>.</li><li>Baca petunjuknya. Soal yang salah menunggu di putaran ulang setelah soal lain selesai.</li><li>Selesaikan 9 latihan dan tantangan akhir untuk membuka topik berikutnya.</li></ol><p>Setiap soal baru yang kamu jawab benar memberi 10 XP, sekali saja. Jawab lima soal berbeda dengan benar dari pelajaran mana saja dalam satu hari untuk mencapai misi dan menambah streak. Review dihitung untuk misi harian, tanpa menggandakan XP. Tanggal mengikuti perangkatmu. Progres tersimpan di browser ini dan tidak tersinkron antarperangkat. Kode menggunakan ${escape(activeCourse().codeStandard)} dan tidak dieksekusi di browser.</p></section>`:''}</div>`;
}
function renderLearn() {
  const s=session(), topic=currentTopic();
  if(!s || !topic) {screen='course';renderCourse();return;}
  if(s.phase==='done') {renderSummary(topic);return;}
  const ex=currentExercise(), pending=s.pending;
  // A correct answer counts right away, so the bar grows at the moment of success.
  const done=s.cleared.length+(pending?.correct?1:0), from=main.dataset.fx==='correct'?done-1:done;
  const phase=s.phase==='retry'?`<span class="phase-chip phase-retry">${icon('repeat')} Putaran ulang · ${s.queue.length+s.deferred.length} soal</span>`:s.phase==='challenge'?`<span class="phase-chip phase-challenge">${icon('star')} Tantangan akhir</span>`:`<span class="phase-chip">Unit ${String(topics.indexOf(topic)+1).padStart(2,'0')}</span>`;
  main.innerHTML=`<div class="page lesson-page"><div class="quiz-top"><button class="icon-button" data-action="course" aria-label="Kembali ke peta belajar">${icon('back')}</button><div class="quiz-bar" role="progressbar" aria-label="Latihan dituntaskan di sesi ini" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${done}"><span style="--from:${from*10}%;width:${done*10}%"></span></div><span class="quiz-count">${done}/10</span>${rewardBar({streak:false})}</div>
    <header class="lesson-heading"><h1 tabindex="-1">${escape(topic.title)}</h1>${phase}</header>
    <form id="answer-form" novalidate><article class="quiz-card"><span class="exercise-type">${icon(ex.challenge?'star':ex.type==='order'?'layers':'book')}${escape(typeLabels[ex.type])}</span><h2 id="question" tabindex="-1">${escape(ex.prompt)}</h2>${ex.code?codeBlock(ex.code):''}<div id="answer-controls">${answerControls(ex,draft,s.seed,pending)}</div></article>
    <div id="input-note" class="input-note" aria-live="polite"></div>
    ${pending?feedbackMarkup(ex,pending):''}
    <div class="quiz-actions">${pending?`<button type="button" class="primary check-button" data-action="continue">${s.phase==='challenge' && pending.correct?'Lihat hasil':'Lanjutkan'} ${icon('arrow')}</button>`:`<button type="submit" id="check-answer" class="primary check-button" ${!isAnswerComplete(ex,draft)?'disabled':''}>Periksa jawaban ${icon('check')}</button>`}</div></form>
    ${referenceMarkup(topic,state.learned[topic.id])}</div>`;
  refreshSubmit();
  setupMatching();
}
function renderSummary(topic) {
  const s=session(), next=topics[topics.indexOf(topic)+1], pct=Math.round((s.attempts-s.mistakes)/Math.max(1,s.attempts)*100);
  main.innerHTML=`<div class="page"><div class="page-top"><button class="text-button back-link" data-action="course">${icon('back')} Peta belajar</button>${rewardBar()}</div><section class="summary"><div class="summary-celebration"><span class="summary-rays" aria-hidden="true"></span>${byteMascot('celebrate')}</div><p class="eyebrow">Topik tuntas</p><h1 tabindex="-1">${next?'Satu topik lebih paham.':escape(activeCourse().finishLabel)}</h1><p class="summary-lead">Semua latihan di <strong>${escape(topic.title)}</strong> sudah kamu jawab benar.</p><div class="session-stats"><div><span data-count="${s.earned}" data-prefix="+">+${s.earned}</span><small>XP baru</small></div><div><span data-count="${pct}" data-suffix="%" data-delay="150">${pct}%</span><small>Ketepatan</small></div><div><span data-count="10" data-suffix="/10" data-delay="300">10/10</span><small>Latihan</small></div></div>${stats().todayCount>=5?'<div class="goal-complete">'+icon('target')+' Misi harian tercapai · '+stats().streak+' hari streak</div>':''}${next?`<button class="primary" data-topic="${next.id}">Lanjut: ${escape(next.title)} ${icon('arrow')}</button>`:`<button class="primary" data-action="course">Lihat perjalananmu ${icon('arrow')}</button>`}<button class="text-button summary-repeat" data-topic="${topic.id}">${icon('repeat')} Mainkan topik ini lagi</button></section></div>`;
}
function render(focus=false) {
  disposeMatching();disposeMatching=()=>{};
  main.dataset.screen=screen;
  main.dataset.course=screen==='home'?'':activeCourseId;
  main.dataset.fx=fx??'';fx=null;
  renderSidebar();
  if(screen==='home') renderCatalog();else if(screen==='course') renderCourse();else renderLearn();
  document.title=screen==='home'?'Flash Brains — Pilih pelajaranmu':screen==='course'?`${activeCourse().title} — Flash Brains`:`${currentTopic()?.title??'Belajar'} — Flash Brains`;
  document.querySelector('#header-context').textContent=screen==='home'?'Beranda':screen==='course'?`Pelajaran / ${activeCourse().title}`:`${activeCourse().title} / ${currentTopic()?.title??'Latihan'}`;
  shell.sync();requestAnimationFrame(drawCourseRoute);
  if(focus) (main.querySelector('#feedback-title')??main.querySelector('#question')??main.querySelector('h1'))?.focus({preventScroll:true});
}
function setRoute(hash) {
  if(location.hash!==hash) history.pushState(null,'',hash);
  applyRoute(true);
}
function openCourse(id,animate=true) {
  if(!courseById(id) || courseById(id).status!=='available') return;
  const enter=()=>{closeMenu();setRoute(courseRoute(id));};
  if(animate) lessonEntrance.play({course:courseById(id),topics:courseContentById(id).topics,enter});
  else enter();
}
function applyRoute(focus=false) {
  const route=parseRoute(location.hash);
  const course=route.courseId?courseById(route.courseId):null;
  showGuide=false;
  if(course?.status==='available' && courseContentById(course.id)) selectCourse(course.id);
  if(route.screen!=='home' && (!course || course.status!=='available' || !courseContentById(course.id))) {
    history.replaceState(null,'','#/');screen='home';
  } else if(route.screen==='learn') {
    if(!topics.some(t=>t.id===route.topicId) || !isUnlocked(state,route.topicId)) {
      history.replaceState(null,'',courseRoute(activeCourseId));screen='course';
      announcement.textContent='Topik belum tersedia. Selesaikan topik sebelumnya terlebih dahulu.';
    } else {
      state=state.sessions[route.topicId]?{...state,activeTopicId:route.topicId}:startTopic(state,route.topicId);
      draft=session()?.pending?.input??session()?.draft;persist();rememberCourse();screen='learn';
    }
  } else screen=route.screen;
  clearEffects();closeMenu();render(focus);window.scrollTo(0,0);
}
function navigateTopic(id,courseId=activeCourseId) {
  const bundle=courseContentById(courseId);
  if(!bundle || !bundle.learning.isUnlocked(states[courseId],id)) return;
  lessonEntrance.play({course:courseById(courseId),topic:bundle.topics.find(t=>t.id===id),topics:bundle.topics,enter:()=>{
    selectCourse(courseId);
    state=startTopic(state,id);draft=session()?.pending?.input??session()?.draft;persist();closeMenu();
    rememberCourse();setRoute(lessonRoute(activeCourseId,id));
  }});
}
function refreshSubmit() {
  const button=document.querySelector('#check-answer');
  if(button) button.disabled=!isAnswerComplete(currentExercise(),draft);
  if(currentExercise()?.type==='match' && !session()?.pending) {
    const values=Object.values(draft??{}).filter(Boolean);
    const duplicate=new Set(values).size!==values.length;
    const note=document.querySelector('#input-note');
    if(note) note.textContent=duplicate?'Setiap jawaban hanya boleh dipasangkan satu kali.':'';
  }
}
function renderControls() {
  disposeMatching();disposeMatching=()=>{};
  const ex=currentExercise(), s=session();
  document.querySelector('#answer-controls').innerHTML=answerControls(ex,draft,s.seed,s.pending);
  refreshSubmit();
  setupMatching();
}
function setupMatching() {
  disposeMatching=mountMatching(main.querySelector('.match-control'),{
    input:draft,motionPaused,
    onChange:input=>{draft=input;persistDraft();refreshSubmit();}
  });
}
function perform(action) {
  if(action==='motion') {
    motionChoice=motionPaused()?'on':'paused';
    try {storage?.setItem('flash-brains-motion',motionChoice);} catch { /* No effect on saved quiz progress. */ }
    applyMotionPreference();clearEffects();renderSidebar();
    document.querySelector('#motion-toggle')?.focus({preventScroll:true});
    announcement.textContent=motionPaused()?'Animasi dimatikan.':'Animasi diaktifkan.';
  }
  if(action==='home') {closeMenu();setRoute('#/');}
  if(action==='course') {openCourse(activeCourseId,false);}
  if(action==='close-sidebar') {shell.hide();}
  if(action==='guide') {if(screen==='learn'){history.pushState(null,'',courseRoute(activeCourseId));screen='course';showGuide=false;}closeMenu();showGuide=!showGuide;render();main.querySelector('.page-footer [data-action="guide"]')?.focus({preventScroll:true});if(showGuide)main.querySelector('.guide').scrollIntoView({block:'nearest'});}
  if(action==='continue' && session()?.pending) {
    const phase=session().phase;
    state=advanceSession(state);draft=undefined;persist();
    const finished=session().phase==='done';
    fx=finished?'finish':'next';clearEffects();render(true);window.scrollTo(0,0);
    if(finished) {rain();burst(main.querySelector('.summary-celebration'),{count:34,power:1.3});countUp(main);}
    if(session().phase==='retry' && phase!=='retry') announcement.textContent='Latihan utama selesai. Sekarang ulangi soal yang belum tepat.';
    if(session().phase==='challenge' && phase!=='challenge') announcement.textContent='Latihan selesai. Tantangan akhir terbuka.';
  }
}
document.addEventListener('click',event=> {
  if(lessonEntrance.playing) {event.preventDefault();return;}
  if(event.target.closest('.skip')) {
    event.preventDefault();closeMenu();main.focus({preventScroll:true});main.scrollIntoView({block:'start'});return;
  }
  const course=event.target.closest('a[data-course]');
  if(course && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button===0){event.preventDefault();openCourse(course.dataset.course);}
  const topic=event.target.closest('[data-topic]');
  if(topic && !topic.disabled) navigateTopic(topic.dataset.topic,topic.dataset.courseId??activeCourseId);
  const action=event.target.closest('[data-action]');
  if(action) perform(action.dataset.action);
  if(event.target.closest('a.brand') && !event.ctrlKey && !event.metaKey && !event.shiftKey) {event.preventDefault();perform('home');}
  const add=event.target.closest('[data-token-add]'), remove=event.target.closest('[data-token-remove]');
  if((add||remove) && screen==='learn' && currentExercise()?.type==='order' && !session().pending) {
    const ex=currentExercise();
    if(add && !add.disabled && ex.tokens.some(t=>t.id===add.dataset.tokenAdd)) draft=[...(Array.isArray(draft)?draft:[]),add.dataset.tokenAdd];
    if(remove) draft=(draft??[]).filter(id=>id!==remove.dataset.tokenRemove);
    persistDraft();renderControls();
    const target=remove?document.querySelector(`[data-token-add="${remove.dataset.tokenRemove}"]`):document.querySelector('[data-token-add]:not(:disabled)')??document.querySelector('#check-answer');
    target?.focus({preventScroll:true});
  }
});
document.addEventListener('submit',event=> {
  if(event.target.id!=='answer-form') return;
  event.preventDefault();
  if(session()?.pending || !isAnswerComplete(currentExercise(),draft)) return;
  const before=stats().todayCount;
  state=submitAnswer(state,draft);persist();
  const pending=session().pending;
  fx=pending?(pending.correct?'correct':'wrong'):null;render(true);
  if(pending) announcement.textContent=stats().todayCount>=5 && before<5?'Target harian tercapai!':pending.correct?`Jawaban benar. ${pending.xp?`Tambah ${pending.xp} XP.`:'Latihan ulang dicatat.'}`:'Jawaban belum tepat. Soal akan diulang di akhir putaran.';
  document.querySelector('#feedback')?.scrollIntoView({block:'nearest',behavior:'instant'});
  if(pending?.correct) burst(document.querySelector('.feedback-illustration'));
});
document.addEventListener('input',event=> {
  if(event.target.id==='course-search'){courseQuery=event.target.value;document.querySelector('#course-results').innerHTML=courseCardsMarkup(courseQuery,progressByCourse());document.querySelector('#course-result-count').textContent=`${searchCourses(courseQuery).length} pelajaran ditemukan`;return;}
  if(event.target.id==='fill-answer' && !session()?.pending) {draft=event.target.value;persistDraft();refreshSubmit();}
});
document.addEventListener('change',event=> {
  if(screen!=='learn' || session()?.pending) return;
  if(event.target.name==='choice') {draft=event.target.value;persistDraft();refreshSubmit();}
});
window.addEventListener('hashchange',()=>{lessonEntrance.cancel();applyRoute(true);});
window.addEventListener('resize',drawCourseRoute);
if(!location.hash) history.replaceState(null,'','#/');
applyRoute(false);

function drawCourseRoute() {
  const map=document.querySelector('#course-map'), route=document.querySelector('#course-route');
  if(!map || !route) return;
  const rect=map.getBoundingClientRect();
  if(!rect.width || !rect.height) return;
  const nodes=[...map.querySelectorAll('.path-node')].map(node=>{const r=node.getBoundingClientRect();return {x:r.left-rect.left+r.width/2,y:r.top-rect.top+r.height/2};});
  if(!nodes.length) return;
  let d=`M ${nodes[0].x} ${nodes[0].y}`;
  for(let i=1;i<nodes.length;i++) {const p=nodes[i-1], n=nodes[i], mid=(p.y+n.y)/2;d+=` C ${p.x} ${mid}, ${n.x} ${mid}, ${n.x} ${n.y}`;}
  route.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
  route.innerHTML=`<path d="${d}" fill="none" stroke="#e4eaf1" stroke-width="10" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="2 12" stroke-linecap="round"/>`;
}
document.fonts?.ready.then(drawCourseRoute);
