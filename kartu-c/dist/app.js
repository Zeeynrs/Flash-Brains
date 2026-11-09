import { topics } from './curriculum.js';
import { exercisesForTopic, exerciseById } from './quizzes.js';
import { isAnswerComplete, typeLabels } from './quiz-engine.js';
import { isUnlocked, topicComplete, startTopic, setDraft, submitAnswer, advanceSession, currentSession, readProgress, saveProgress, learningStats } from './state.js';
import { escape, icon, codeBlock, answerControls, feedbackMarkup, referenceMarkup } from './quiz-view.js';
import { brandMark, byteMascot, confetti } from './mascot.js';
import {courses,courseById,searchCourses} from './courses.js';
import {parseRoute,courseRoute,lessonRoute} from './navigation.js';
import {catalogMarkup,courseCardsMarkup} from './catalog-view.js';
import {createSidebar} from './sidebar.js';

let storage;
try {storage=window.localStorage;} catch {storage=null;}
const loaded=readProgress(storage);
let state=loaded.state, screen='home', draft, showGuide=false, courseQuery='';
const main=document.querySelector('#main'), sidebar=document.querySelector('#sidebar');
const notice=document.querySelector('#storage-notice'), announcement=document.querySelector('#announcement');
notice.hidden=loaded.available;
document.body.classList.toggle('storage-unavailable',!notice.hidden);
const mastered=topic=>state.solved[topic.id]?.length ?? 0;
const session=()=>currentSession(state);
const currentTopic=()=>topics.find(t=>t.id===state.activeTopicId);
const currentExercise=()=>exerciseById(session()?.queue[0]);
const persist=()=> {
  notice.hidden=saveProgress(storage,state);
  document.body.classList.toggle('storage-unavailable',!notice.hidden);
  const label=document.querySelector('.local-label');
  if(label) label.textContent=notice.hidden?'Progres tersimpan di browser ini':'Penyimpanan browser tidak tersedia';
};
const persistDraft=()=>{state=setDraft(state,draft);persist();};
const stats=()=>learningStats(state);
const motionMedia=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=false;
try {motionPaused=storage?.getItem('flash-brains-motion')==='paused';} catch { /* Preference remains available in memory. */ }
function applyMotionPreference() {document.documentElement.dataset.motion=motionPaused||motionMedia.matches?'paused':'on';}
applyMotionPreference();
motionMedia.addEventListener('change',()=>{applyMotionPreference();renderSidebar();});
document.querySelector('.mobile-header .brand-mark').innerHTML=brandMark();
const shell=createSidebar({sidebar,main,toggle:document.querySelector('#menu-toggle'),backdrop:document.querySelector('#sidebar-backdrop'),storage,onLayout:drawCourseRoute});
function nextTopic() {
  return topics.find(t=>isUnlocked(state,t.id) && !topicComplete(state,t.id)) ?? topics.find(t=>mastered(t)<10 && isUnlocked(state,t.id)) ?? topics[0];
}
function closeMenu(restoreFocus=false) {shell.close(restoreFocus);}
function progressByCourse() {return {c:{solvedCount:stats().solvedCount}};}
function renderCatalog() {
  const active=session();
  const continueTopic=active && active.phase!=='done'?{id:active.topicId,title:currentTopic().title}:null;
  main.innerHTML=catalogMarkup({stats:stats(),rewards:rewardBar(),progressByCourse:progressByCourse(),continueTopic,query:courseQuery,showGuide});
}
function renderSidebar() {
  const paused=motionPaused||motionMedia.matches;
  const inCourse=screen!=='home';
  sidebar.innerHTML=`<div class="sidebar-heading"><span>Jelajahi</span><button type="button" class="sidebar-close" data-action="close-sidebar" aria-label="Tutup sidebar navigasi">${icon('close')}</button></div>
    <button class="nav-home ${screen==='home'?'selected':''}" data-action="home" ${screen==='home'?'aria-current="page"':''}>${icon('home')}<span>Beranda</span>${screen==='home'?'<span class="nav-current-dot" aria-hidden="true"></span>':''}</button>
    <p class="nav-label">Pelajaranmu</p><nav aria-label="Pilihan pelajaran">${courses.filter(c=>c.status==='available').map(c=>`<a class="sidebar-course ${inCourse?'selected':''}" href="${courseRoute(c.id)}" data-course="${c.id}" ${inCourse?'aria-current="page"':''}><span class="sidebar-course-symbol" aria-hidden="true">${escape(c.symbol)}</span><span>${escape(c.title)}</span>${icon('arrow')}</a>`).join('')}</nav>
    ${inCourse?`<p class="nav-label">Topik pemrograman C</p><nav aria-label="Daftar topik C">${topics.map((t,i)=>`<button class="nav-topic ${screen==='learn' && state.activeTopicId===t.id?'selected':''}" data-topic="${t.id}" ${!isUnlocked(state,t.id)?'disabled':''} ${screen==='learn' && state.activeTopicId===t.id?'aria-current="step"':''}><span class="nav-number ${topicComplete(state,t.id)?'done':''}">${topicComplete(state,t.id)?icon('check'):String(i+1).padStart(2,'0')}</span><span>${escape(t.title)}</span>${!isUnlocked(state,t.id)?icon('lock'):''}<span class="sr-only">${!isUnlocked(state,t.id)?', terkunci':topicComplete(state,t.id)?', selesai':', terbuka'}</span></button>`).join('')}</nav>`:`<div class="sidebar-catalog-note">${icon('layers')}<p>Semua pelajaranmu ada di satu tempat. Pilih yang bikin kamu penasaran.</p></div>`}
    <button class="sidebar-help text-button" data-action="guide">${icon('help')} Cara belajar</button>
    <button id="motion-toggle" class="motion-toggle text-button" data-action="motion" aria-pressed="${paused}" aria-label="${motionMedia.matches?'Animasi mengikuti preferensi kurangi gerakan perangkat':paused?'Aktifkan animasi':'Jeda animasi'}" ${motionMedia.matches?'disabled':''}>${icon(paused?'play':'pause')}<span>${motionMedia.matches?'Gerakan dikurangi':paused?'Animasi dijeda':'Animasi aktif'}</span></button>
    <div class="sidebar-bottom"><div class="mini-progress"><span>Latihanmu</span><strong>${stats().solvedCount}/80</strong></div><progress max="80" value="${stats().solvedCount}" aria-label="Total latihan dikuasai"></progress><p>Pelan-pelan juga sampai.<br>Yang penting, terus coba.</p><span class="local-label">${notice.hidden?'Progres tersimpan di browser ini':'Penyimpanan browser tidak tersedia'}</span></div>`;
  shell.sync();
}
const rewardBar=()=>`<div class="reward-bar" aria-label="Pencapaian belajar"><span class="reward-pill xp-pill" title="XP yang sudah kamu kumpulkan">${icon('gem')}<strong>${stats().xp}</strong><span>XP</span></span><span class="reward-pill streak-pill" title="Hari berturut-turut mencapai target">${icon('fire')}<strong>${stats().streak}</strong><span>hari</span></span></div>`;
function renderCourse() {
  const active=session() && session().phase!=='done'?currentTopic():nextTopic();
  const finished=topics.filter(t=>topicComplete(state,t.id)).length;
  const allDone=stats().solvedCount===80, continuing=state.sessions[active.id] && state.sessions[active.id].phase!=='done';
  const legacy=Object.values(state.learned).some(ids=>ids.length);
  const colors=['green','violet','blue','orange','pink','teal','indigo','gold'];
  const glyphs=['code','gem','terminal','bolt','branch','repeat','layers','grid'];
  main.innerHTML=`<div class="page-top"><span class="course-chip"><span class="course-symbol" aria-hidden="true">C</span><span>Bahasa C <small>Dari nol sampai array</small></span></span>${rewardBar()}</div>
    <header class="page-heading"><h1 tabindex="-1">${allDone?'Dari nol, sekarang jago array!':'Siap bikin otakmu naik level?'}</h1><p>Latihan kecil hari ini. Skill besar buat nanti.</p></header>
    ${legacy?'<p class="legacy-notice">Progres kartu lamamu aman! Latihan baru sudah menunggu di topik yang terbuka.</p>':''}
    <div class="home-layout overview-grid">
      <section class="continue-panel quiz-continue" aria-label="Lanjutkan belajar"><div class="continue-copy"><span class="eyebrow hero-eyebrow">${icon('flag')} ${continuing?'Lanjutkan petualangan':allDone?'Saatnya latihan ulang':'Petualangan dimulai di sini'}</span><h2>${escape(active.title)}</h2><p>${escape(active.description)}</p><div class="lesson-meta"><span>Unit ${String(topics.indexOf(active)+1).padStart(2,'0')}</span><span>10 latihan seru</span></div><button class="primary" data-topic="${active.id}">${continuing?'Lanjut belajar':allDone?'Main lagi':'Ayo, mulai!'} ${icon('arrow')}</button></div><div class="hero-character">${byteMascot('idle')}<span class="floating-code code-bubble-one" aria-hidden="true">&lt;/&gt;</span><span class="floating-code code-bubble-two" aria-hidden="true">{ C }</span><span class="hero-character-name">Hai, aku Byte!</span></div></section>
      <aside class="journey-panel daily-panel"><div class="panel-title">${icon('target')}<h2>Misi harian</h2></div><div class="daily-count"><span class="big-number">${Math.min(stats().todayCount,5)}<span>/5</span></span><span>soal benar<br>hari ini</span><span class="goal-trophy" aria-hidden="true">${icon('trophy')}</span></div><progress max="5" value="${Math.min(stats().todayCount,5)}" aria-label="Target harian lima soal benar"></progress><p class="goal-status">${stats().todayCount>=5?'Misi selesai. Kamu keren!':`Tinggal ${5-stats().todayCount} soal lagi. Bisa, yuk!`}</p><p class="journey-note">Capai misi hari ini untuk menambah streak. Latihan ulang juga dihitung.</p></aside>
      <section class="curriculum"><div class="section-heading"><div><span class="section-kicker">Langkah demi langkah</span><h2>Peta petualanganmu</h2><p>Tak perlu buru-buru. Nikmati setiap levelnya.</p></div><span class="topic-count">${finished}/8 selesai</span></div><div class="path-course-banner"><span class="course-symbol" aria-hidden="true">C</span><div><strong>Dasar pemrograman C</strong><span>8 topik · 80 tantangan · banyak momen “oh, paham!”</span></div>${icon('book')}</div>
      <div class="topic-grid quiz-topic-grid" id="course-map"><svg id="course-route" class="course-route" aria-hidden="true"></svg>${topics.map((t,i)=>{
        const open=isUnlocked(state,t.id), done=topicComplete(state,t.id), legacyDone=state.legacyCompleted.includes(t.id) && mastered(t)<10;
        return `<button class="topic-row quiz-topic-row unit-${colors[i]} ${done?'is-done':open?'is-open':'is-locked'} ${active.id===t.id?'is-next':''}" data-topic="${t.id}" ${!open?'disabled':''} style="--bend:${[0,1,2,1][i%4]}"><span class="path-node">${icon(done?'check':open?glyphs[i]:'lock')}<span class="node-unit" aria-hidden="true">${String(i+1).padStart(2,'0')}</span></span><span class="topic-content"><span class="unit-label">Unit ${String(i+1).padStart(2,'0')}${active.id===t.id && open?'<span class="next-badge">Mulai di sini</span>':''}</span><span class="topic-title">${escape(t.title)}</span><span class="topic-description">${escape(t.description)}</span><span class="exercise-track" aria-hidden="true">${exercisesForTopic(t.id).map((ex,n)=>`<span class="${state.solved[t.id]?.includes(ex.id)?'filled':''} ${n===9?'challenge-tick':''}"></span>`).join('')}</span><span class="topic-status">${!open?`Selesaikan unit ${i} untuk membuka`:legacyDone?`${mastered(t)}/10 latihan · progres lama tersimpan`:mastered(t)===10?'Tuntas! Mau main lagi?':`${mastered(t)}/10 latihan · ${state.sessions[t.id]?'lanjutkan langkahmu':'ayo taklukkan!'}`}</span></span><span class="topic-trailing">${open?icon('arrow'):''}</span></button>`;
      }).join('')}</div><div class="path-finish"><span>${icon('trophy')}</span><p>${allDone?'Petualangan tuntas! Terus asah logikamu.':'Tujuanmu: paham C, dari main() sampai array.'}</p></div></section>
      <aside class="coach-rail"><section class="buddy-panel"><div class="buddy-scene">${byteMascot('thinking')}<span class="buddy-speech">Kamu pasti bisa!</span></div><h2>Salah? Santai dulu.</h2><p>Aku simpan soal yang belum tepat. Kita coba lagi di akhir sampai kamu paham.</p><button class="text-button" data-action="guide">Kenali cara bermain ${icon('arrow')}</button></section><section class="course-progress-panel"><div class="panel-title">${icon('star')}<h2>Setiap usaha berarti</h2></div><strong>${stats().solvedCount}<span> / 80 latihan</span></strong><progress max="80" value="${stats().solvedCount}" aria-label="Total latihan dikuasai"></progress><p>Setiap soal baru yang kamu jawab benar memberi 10 XP. Sedikit-sedikit jadi bukit!</p></section><p class="rail-note">Dibuat untuk belajar, bukan terburu-buru.</p></aside>
      <footer class="page-footer"><span>Belajar. Coba. Paham. Ulangi.</span><button class="text-button" data-action="guide" aria-expanded="${showGuide}">Cara bermain ${showGuide?'−':'+'}</button></footer>
      ${showGuide?`<section class="guide" aria-label="Cara bermain"><h2>Jadi jago, satu soal dulu.</h2><ol><li>Pilih jawabanmu, lalu tekan <strong>Periksa jawaban</strong>.</li><li>Baca petunjuknya. Soal yang salah menunggu di putaran ulang setelah soal lain selesai.</li><li>Selesaikan 9 latihan dan tantangan akhir untuk membuka topik berikutnya.</li></ol><p>Setiap soal baru yang kamu jawab benar memberi 10 XP, sekali saja. Jawab lima soal berbeda dengan benar dalam satu hari untuk mencapai misi dan menambah streak. Review dihitung untuk misi harian, tanpa menggandakan XP. Tanggal mengikuti perangkatmu. Progres tersimpan di browser ini dan tidak tersinkron antarperangkat. Kode menggunakan C99 atau lebih baru dan tidak dieksekusi di browser.</p></section>`:''}
    </div>`;
}
function renderLearn() {
  const s=session(), topic=currentTopic();
  if(!s || !topic) {screen='course';renderCourse();return;}
  if(s.phase==='done') {renderSummary(topic);return;}
  const ex=currentExercise(), pending=s.pending;
  const phaseTitle=s.phase==='retry'?'Putaran ulang':s.phase==='challenge'?'Tantangan akhir':'Latihan utama';
  const count=exercisesForTopic(topic.id).findIndex(e=>e.id===ex.id)+1;
  main.innerHTML=`<div class="page-top"><button class="text-button back-link" data-action="course">${icon('back')} Peta belajar</button>${rewardBar()}</div>
    <header class="lesson-heading"><span class="lesson-unit">Unit ${String(topics.indexOf(topic)+1).padStart(2,'0')} / 08</span><h1 tabindex="-1">${escape(topic.title)}</h1><p>${s.phase==='retry'?'Kita coba lagi. Sekarang kamu sudah tahu petunjuknya.':s.phase==='challenge'?'Langkah terakhir sebelum membuka topik berikutnya.':'Coba, periksa, lalu pelajari alasan di balik jawabannya.'}</p></header>
    <div class="mobile-coach">${byteMascot(pending?(pending.correct?'celebrate':'thinking'):'idle')}<p>${pending?pending.correct?'Mantap! Logikamu makin tajam.':'Tenang, kita coba lagi di akhir.':'Coba dulu. Aku di sini menemanimu!'}</p></div><div class="study-layout"><section class="study-main" aria-label="Latihan interaktif"><div class="study-progress"><span>${s.cleared.length} dari 10 latihan dituntaskan</span><span>${phaseTitle}</span></div><progress max="10" value="${s.cleared.length}" aria-label="Latihan dituntaskan di sesi ini"></progress>
    ${s.phase!=='lesson'?`<div class="round-banner ${s.phase==='challenge'?'challenge-banner':''}">${icon(s.phase==='challenge'?'star':'repeat')}<span>${s.phase==='challenge'?'Tantangan akhir — tunjukkan pemahamanmu.':`${s.queue.length+s.deferred.length} soal perlu diulang · putaran ${s.round-1}`}</span></div>`:''}
    <form id="answer-form" novalidate><article class="flashcard quiz-card"><div class="flashcard-top"><span class="exercise-type">${icon(ex.challenge?'star':ex.type==='order'?'layers':'book')}${escape(typeLabels[ex.type])}</span><span>Soal ${count} / 10</span></div><h2 id="question" tabindex="-1">${escape(ex.prompt)}</h2>${ex.code?codeBlock(ex.code):''}<div id="answer-controls">${answerControls(ex,draft,s.seed,pending)}</div></article>
    <div id="input-note" class="input-note" aria-live="polite"></div>
    ${pending?feedbackMarkup(ex,pending):''}
    <div class="quiz-actions"><span>${pending?pending.correct?'Satu langkah lebih paham.':'Tidak ada nyawa yang berkurang.':'Tidak perlu buru-buru. Pikirkan dulu.'}</span>${pending?`<button type="button" class="primary check-button" data-action="continue">${s.phase==='challenge' && pending.correct?'Lihat hasil':'Lanjutkan'} ${icon('arrow')}</button>`:`<button type="submit" id="check-answer" class="primary check-button" ${!isAnswerComplete(ex,draft)?'disabled':''}>Periksa jawaban ${icon('check')}</button>`}</div></form>
    ${referenceMarkup(topic,state.learned[topic.id])}</section>
    <aside class="lesson-aside quiz-aside"><h2>Petualangan sesi ini</h2><div class="session-overview"><span>${icon('bolt')} ${s.earned} XP baru</span><span>${icon('check')} ${s.cleared.length}/10 dituntaskan</span><span>${icon('repeat')} ${s.mistakes} jawaban perlu diulang</span></div><ol class="lesson-steps"><li class="${s.phase==='lesson'?'active-step':'passed-step'}"><span>1</span><div>Latihan utama<small>Beragam cara mengasah logika</small></div></li><li class="${s.phase==='retry'?'active-step':s.phase==='challenge'?'passed-step':''}"><span>2</span><div>Ulangi yang belum tepat<small>Kesempatan tanpa batas</small></div></li><li class="${s.phase==='challenge'?'active-step':''}"><span>3</span><div>Tantangan akhir<small>Buka topik selanjutnya</small></div></li></ol><div class="learning-note">${byteMascot(pending?(pending.correct?'celebrate':'thinking'):'idle','lesson-mascot')}<h3>${pending?.correct?'Yes! Langkah yang bagus.':'Salah itu bagian dari paham.'}</h3><p>Baca penjelasan setiap jawaban. Soal yang belum tepat menunggumu di akhir putaran.</p></div><p class="local-note">Jawaban dan progres tersimpan otomatis. Kamu bisa melanjutkan sesi ini kapan saja.</p></aside></div>`;
  refreshSubmit();
}
function renderSummary(topic) {
  const s=session(), next=topics[topics.indexOf(topic)+1], pct=Math.round((s.attempts-s.mistakes)/Math.max(1,s.attempts)*100);
  main.innerHTML=`<div class="page-top"><button class="text-button back-link" data-action="course">${icon('back')} Peta belajar</button>${rewardBar()}</div><section class="summary quiz-summary"><div class="summary-celebration">${confetti()}${byteMascot('celebrate')}</div><p class="eyebrow">Tantangan dituntaskan</p><h1 tabindex="-1">${next?'Satu topik lebih paham.':'Dari nol, sampai array.'}</h1><p>Semua latihan di <strong>${escape(topic.title)}</strong> sudah kamu jawab benar, termasuk soal yang diulang.</p><div class="session-stats"><div><span>+${s.earned}</span><small>XP baru</small></div><div><span>${pct}%</span><small>Ketepatan dari ${s.attempts} percobaan</small></div><div><span>10/10</span><small>Latihan dituntaskan</small></div></div><p class="summary-retry">${s.mistakes?`${s.mistakes} jawaban belum tepat tadi jadi kesempatan untuk mencoba lagi. Kamu berhasil menuntaskannya.`:'Seluruh jawaban tepat sejak percobaan pertama. Kerja bagus!'}</p>${stats().todayCount>=5?'<div class="goal-complete">'+icon('target')+' Target harian tercapai · '+stats().streak+' hari streak</div>':''}${next?`<div class="next-preview"><span>Langkah berikutnya</span><h2>${escape(next.title)}</h2><p>${escape(next.description)}</p></div><button class="primary" data-topic="${next.id}">Lanjut ke topik berikutnya ${icon('arrow')}</button>`:`<button class="primary" data-action="course">Lihat perjalananmu ${icon('arrow')}</button>`}<button class="text-button summary-repeat" data-topic="${topic.id}">${icon('repeat')} Mainkan topik ini lagi</button></section>`;
}
function render(focus=false) {
  main.dataset.screen=screen;
  renderSidebar();
  if(screen==='home') renderCatalog();else if(screen==='course') renderCourse();else renderLearn();
  document.title=screen==='home'?'Flash Brains — Pilih pelajaranmu':screen==='course'?'Pemrograman C — Flash Brains':`${currentTopic()?.title??'Belajar'} — Flash Brains`;
  document.querySelector('#header-context').textContent=screen==='home'?'Beranda':screen==='course'?'Pelajaran / Pemrograman C':`Pemrograman C / ${currentTopic()?.title??'Latihan'}`;
  shell.sync();requestAnimationFrame(drawCourseRoute);
  if(focus) (main.querySelector('#feedback-title')??main.querySelector('#question')??main.querySelector('h1'))?.focus({preventScroll:true});
}
function setRoute(hash) {
  if(location.hash===hash) applyRoute(true);
  else location.hash=hash;
}
function openCourse(id) {
  if(!courseById(id) || courseById(id).status!=='available') return;
  closeMenu();setRoute(courseRoute(id));
}
function applyRoute(focus=false) {
  const route=parseRoute(location.hash);
  const course=route.courseId?courseById(route.courseId):null;
  showGuide=false;
  if(route.screen!=='home' && (!course || course.engine!=='c-quiz')) {
    history.replaceState(null,'','#/');screen='home';
  } else if(route.screen==='learn') {
    if(!topics.some(t=>t.id===route.topicId) || !isUnlocked(state,route.topicId)) {
      history.replaceState(null,'',courseRoute('c'));screen='course';
      announcement.textContent='Topik belum tersedia. Selesaikan topik sebelumnya terlebih dahulu.';
    } else {
      state=state.sessions[route.topicId]?{...state,activeTopicId:route.topicId}:startTopic(state,route.topicId);
      draft=session()?.pending?.input??session()?.draft;persist();screen='learn';
    }
  } else screen=route.screen;
  closeMenu();render(focus);window.scrollTo(0,0);
}
function navigateTopic(id) {
  if(!isUnlocked(state,id)) return;
  state=startTopic(state,id);draft=session()?.pending?.input??session()?.draft;persist();closeMenu();
  setRoute(lessonRoute('c',id));
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
  const ex=currentExercise(), s=session();
  document.querySelector('#answer-controls').innerHTML=answerControls(ex,draft,s.seed,s.pending);
  refreshSubmit();
}
function perform(action) {
  if(action==='motion' && !motionMedia.matches) {
    motionPaused=!motionPaused;
    try {storage?.setItem('flash-brains-motion',motionPaused?'paused':'on');} catch { /* No effect on saved quiz progress. */ }
    applyMotionPreference();renderSidebar();
    document.querySelector('#motion-toggle')?.focus({preventScroll:true});
    announcement.textContent=motionPaused?'Animasi dijeda.':'Animasi diaktifkan.';
  }
  if(action==='home') {closeMenu();setRoute('#/');}
  if(action==='course') {openCourse('c');}
  if(action==='close-sidebar') {shell.hide();}
  if(action==='browse-courses') {document.querySelector('#catalog-courses')?.scrollIntoView({block:'start'});document.querySelector('#course-search')?.focus({preventScroll:true});}
  if(action==='guide') {if(screen==='learn'){history.pushState(null,'',courseRoute('c'));screen='course';showGuide=false;}closeMenu();showGuide=!showGuide;render();main.querySelector('.page-footer [data-action="guide"]')?.focus({preventScroll:true});if(showGuide)main.querySelector('.guide').scrollIntoView({block:'nearest'});}
  if(action==='continue' && session()?.pending) {
    const phase=session().phase;
    state=advanceSession(state);draft=undefined;persist();render(true);window.scrollTo(0,0);
    if(session().phase==='retry' && phase!=='retry') announcement.textContent='Latihan utama selesai. Sekarang ulangi soal yang belum tepat.';
    if(session().phase==='challenge' && phase!=='challenge') announcement.textContent='Latihan selesai. Tantangan akhir terbuka.';
  }
}
document.addEventListener('click',event=> {
  if(event.target.closest('.skip')) {
    event.preventDefault();closeMenu();main.focus({preventScroll:true});main.scrollIntoView({block:'start'});return;
  }
  const course=event.target.closest('[data-course]');
  if(course && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button===0){event.preventDefault();openCourse(course.dataset.course);}
  const topic=event.target.closest('[data-topic]');
  if(topic && !topic.disabled) navigateTopic(topic.dataset.topic);
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
  state=submitAnswer(state,draft);persist();render(true);
  const pending=session().pending;
  if(pending) announcement.textContent=stats().todayCount>=5 && before<5?'Target harian tercapai!':pending.correct?`Jawaban benar. ${pending.xp?`Tambah ${pending.xp} XP.`:'Latihan ulang dicatat.'}`:'Jawaban belum tepat. Soal akan diulang di akhir putaran.';
  document.querySelector('#feedback')?.scrollIntoView({block:'nearest',behavior:'instant'});
});
document.addEventListener('input',event=> {
  if(event.target.id==='course-search'){courseQuery=event.target.value;document.querySelector('#course-results').innerHTML=courseCardsMarkup(courseQuery,progressByCourse());document.querySelector('#course-result-count').textContent=`${searchCourses(courseQuery).length} pelajaran ditemukan`;return;}
  if(event.target.id==='fill-answer' && !session()?.pending) {draft=event.target.value;persistDraft();refreshSubmit();}
});
document.addEventListener('change',event=> {
  if(screen!=='learn' || session()?.pending) return;
  if(event.target.name==='choice') {draft=event.target.value;persistDraft();refreshSubmit();}
  if(event.target.matches('[data-match]')) {
    draft={...(draft??{}),[event.target.dataset.match]:event.target.value};persistDraft();refreshSubmit();
    const preview=event.target.closest('.match-row').querySelector('.match-preview');
    const selected=currentExercise().pairs.find(p=>p.id===event.target.value);
    if(preview) preview.textContent=selected?selected.right:'';
  }
});
window.addEventListener('hashchange',()=>applyRoute(true));
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
