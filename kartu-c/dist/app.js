import { topics } from './curriculum.js';
import { exercisesForTopic, exerciseById } from './quizzes.js';
import { isAnswerComplete, typeLabels } from './quiz-engine.js';
import { isUnlocked, topicComplete, startTopic, setDraft, submitAnswer, advanceSession, currentSession, readProgress, saveProgress, learningStats } from './state.js';
import { escape, icon, codeBlock, answerControls, feedbackMarkup, referenceMarkup } from './quiz-view.js';

let storage;
try {storage=window.localStorage;} catch {storage=null;}
const loaded=readProgress(storage);
let state=loaded.state, screen='home', draft, showGuide=false;
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
function nextTopic() {
  return topics.find(t=>isUnlocked(state,t.id) && !topicComplete(state,t.id)) ?? topics.find(t=>mastered(t)<10 && isUnlocked(state,t.id)) ?? topics[0];
}
function closeMenu(restoreFocus=false) {
  const wasOpen=sidebar.classList.contains('mobile-open');
  sidebar.classList.remove('mobile-open');main.inert=false;
  document.querySelector('#menu-toggle').setAttribute('aria-expanded','false');
  if(wasOpen && restoreFocus) document.querySelector('#menu-toggle').focus();
}
function renderSidebar() {
  sidebar.innerHTML=`<a href="#" class="brand desktop-brand" aria-label="Flash Brains, beranda"><span class="brand-mark" aria-hidden="true">{c}</span> Flash Brains</a><p class="sidebar-subtitle">Petualangan kecil, fondasi kuat.</p>
    <button class="nav-home ${screen==='home'?'selected':''}" data-action="home">${icon('layers')}<span>Jalur belajar</span></button>
    <p class="nav-label">Pemrograman dasar C</p><nav aria-label="Daftar topik">${topics.map((t,i)=>`<button class="nav-topic ${screen==='learn' && state.activeTopicId===t.id?'selected':''}" data-topic="${t.id}" ${!isUnlocked(state,t.id)?'disabled':''} ${screen==='learn' && state.activeTopicId===t.id?'aria-current="step"':''}><span class="nav-number ${topicComplete(state,t.id)?'done':''}">${topicComplete(state,t.id)?icon('check'):String(i+1).padStart(2,'0')}</span><span>${escape(t.title)}</span>${!isUnlocked(state,t.id)?icon('lock'):''}<span class="sr-only">${!isUnlocked(state,t.id)?', terkunci':topicComplete(state,t.id)?', selesai':', terbuka'}</span></button>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="mini-progress"><span>Latihan dikuasai</span><span>${stats().solvedCount}/80</span></div><progress max="80" value="${stats().solvedCount}" aria-label="Total latihan dikuasai"></progress><p>Salah itu petunjuk.<br>Kita coba lagi di akhir.</p><span class="local-label">${notice.hidden?'Progres tersimpan di browser ini':'Penyimpanan browser tidak tersedia'}</span></div>`;
}
const rewardBar=()=>`<div class="reward-bar" aria-label="Pencapaian belajar"><span class="reward-pill">${icon('bolt')}<strong>${stats().xp}</strong> XP</span><span class="reward-pill streak-pill">${icon('fire')}<strong>${stats().streak}</strong> hari streak</span></div>`;
function renderHome() {
  const active=session() && session().phase!=='done'?currentTopic():nextTopic();
  const finished=topics.filter(t=>topicComplete(state,t.id)).length;
  const allDone=stats().solvedCount===80, continuing=state.sessions[active.id] && state.sessions[active.id].phase!=='done';
  const legacy=Object.values(state.learned).some(ids=>ids.length);
  main.innerHTML=`<div class="page-top"><span>Jalur belajar · Dasar C</span>${rewardBar()}</div>
    <header class="page-heading"><h1 tabindex="-1">${allDone?'Fondasi kuat.<br>Terus asah ingatan.':'Mainkan logikamu.<br>Selangkah lebih paham.'}</h1><p>Susun kode, pecahkan teka-teki, dan temukan jawabannya. <br>Satu latihan kecil membawa kamu lebih jauh.</p></header>
    ${legacy?'<p class="legacy-notice">Progres kartu lamamu tetap tersimpan. Coba latihan baru di topik yang sudah terbuka untuk mengumpulkan XP.</p>':''}
    <section class="overview-grid" aria-label="Lanjutkan belajar"><div class="continue-panel quiz-continue"><div class="continue-copy"><span class="eyebrow">${continuing?'Petualanganmu belum selesai':allDone?'Jaga ingatan tetap tajam':'Langkah berikutnya'}</span><h2>${escape(active.title)}</h2><p>${escape(active.description)}</p><div class="lesson-meta"><span>Unit ${String(topics.indexOf(active)+1).padStart(2,'0')}</span><span>10 latihan · 7 variasi</span></div><button class="primary" data-topic="${active.id}">${continuing?'Lanjutkan latihan':allDone?'Latihan lagi':'Mulai tantangan'} ${icon('arrow')}</button></div>
    <div class="challenge-preview" aria-label="Contoh teka-teki C"><div class="code-caption"><span>Teka-teki kecil</span><span>C</span></div><pre><code><span class="code-muted">// Bisa tebak hasilnya?</span>

<span class="code-type">int</span> langkah = 2;
langkah += 3;
printf(<span class="code-string">"%d"</span>, langkah);</code></pre><div class="preview-answers" aria-hidden="true"><span>2</span><span>5</span><span>3</span></div></div></div>
    <div class="journey-panel daily-panel"><span class="eyebrow">${icon('target')} Target hari ini</span><div class="big-number">${Math.min(stats().todayCount,5)}<span> / 5</span></div><p>soal berbeda dijawab benar</p><progress max="5" value="${Math.min(stats().todayCount,5)}" aria-label="Target harian lima soal benar"></progress><p class="goal-status">${stats().todayCount>=5?'Target tercapai. Bagus sekali!':`${5-stats().todayCount} lagi untuk menjaga streak.`}</p><p class="journey-note">Streak bertambah saat target harian tercapai. Latihan ulang juga dihitung.</p></div></section>
    <section class="curriculum"><div class="section-heading"><div><h2>Peta belajar C</h2><p>9 latihan, 1 tantangan akhir. Soal yang salah diulang di akhir.</p></div><span class="topic-count">${finished}/8 topik selesai</span></div><div class="topic-grid quiz-topic-grid">${topics.map((t,i)=>{
      const open=isUnlocked(state,t.id), done=topicComplete(state,t.id), legacyDone=state.legacyCompleted.includes(t.id) && mastered(t)<10;
      return `<button class="topic-row quiz-topic-row ${done?'is-done':open?'is-open':'is-locked'}" data-topic="${t.id}" ${!open?'disabled':''}><span class="path-node">${done?icon('check'):String(i+1).padStart(2,'0')}</span><span class="topic-content"><span class="topic-title">${escape(t.title)}</span><span class="topic-description">${escape(t.description)}</span><span class="exercise-track" aria-hidden="true">${exercisesForTopic(t.id).map((ex,n)=>`<span class="${state.solved[t.id]?.includes(ex.id)?'filled':''} ${n===9?'challenge-tick':''}"></span>`).join('')}</span><span class="topic-status">${!open?`Selesaikan topik ${i} untuk membuka`:legacyDone?`${mastered(t)}/10 kuis · progres lama tersimpan`:mastered(t)===10?'10/10 dikuasai · latihan lagi':`${mastered(t)}/10 dikuasai · ${state.sessions[t.id]?'lanjutkan':'siap dimainkan'}`}</span></span><span class="topic-trailing">${icon(!open?'lock':mastered(t)===10?'star':'arrow')}</span></button>`;
    }).join('')}</div></section><footer class="page-footer"><span>80 latihan. Banyak jalan untuk paham.</span><button class="text-button" data-action="guide" aria-expanded="${showGuide}">Cara bermain ${showGuide?'−':'+'}</button></footer>
    ${showGuide?`<section class="guide" aria-label="Cara bermain"><h2>Belajar dari setiap percobaan.</h2><ol><li>Jawab soal, lalu tekan <strong>Periksa jawaban</strong>.</li><li>Baca penjelasannya. Jawaban salah masuk putaran ulang setelah soal lainnya selesai.</li><li>Tuntaskan latihan dan tantangan akhir untuk membuka topik berikutnya.</li></ol><p>Setiap soal baru yang kamu jawab benar memberi 10 XP, sekali saja. Jawab lima soal berbeda dengan benar dalam satu hari untuk mencapai target dan menambah streak. Review dihitung untuk target harian, tetapi tidak menggandakan XP. Tanggal mengikuti perangkatmu. Progres tersimpan di browser ini dan tidak tersinkron antarperangkat. Kode menggunakan C99 atau lebih baru, ditampilkan sebagai latihan, dan tidak dieksekusi di browser.</p></section>`:''}`;
}
function renderLearn() {
  const s=session(), topic=currentTopic();
  if(!s || !topic) {screen='home';renderHome();return;}
  if(s.phase==='done') {renderSummary(topic);return;}
  const ex=currentExercise(), pending=s.pending;
  const phaseTitle=s.phase==='retry'?'Putaran ulang':s.phase==='challenge'?'Tantangan akhir':'Latihan utama';
  const count=exercisesForTopic(topic.id).findIndex(e=>e.id===ex.id)+1;
  main.innerHTML=`<div class="page-top"><button class="text-button back-link" data-action="home">${icon('back')} Peta belajar</button>${rewardBar()}</div>
    <header class="lesson-heading"><span class="lesson-unit">Unit ${String(topics.indexOf(topic)+1).padStart(2,'0')} / 08</span><h1 tabindex="-1">${escape(topic.title)}</h1><p>${s.phase==='retry'?'Kita coba lagi. Sekarang kamu sudah tahu petunjuknya.':s.phase==='challenge'?'Langkah terakhir sebelum membuka topik berikutnya.':'Coba, periksa, lalu pelajari alasan di balik jawabannya.'}</p></header>
    <div class="study-layout"><section class="study-main" aria-label="Latihan interaktif"><div class="study-progress"><span>${s.cleared.length} dari 10 latihan dituntaskan</span><span>${phaseTitle}</span></div><progress max="10" value="${s.cleared.length}" aria-label="Latihan dituntaskan di sesi ini"></progress>
    ${s.phase!=='lesson'?`<div class="round-banner ${s.phase==='challenge'?'challenge-banner':''}">${icon(s.phase==='challenge'?'star':'repeat')}<span>${s.phase==='challenge'?'Tantangan akhir — tunjukkan pemahamanmu.':`${s.queue.length+s.deferred.length} soal perlu diulang · putaran ${s.round-1}`}</span></div>`:''}
    <form id="answer-form" novalidate><article class="flashcard quiz-card"><div class="flashcard-top"><span class="exercise-type">${icon(ex.challenge?'star':ex.type==='order'?'layers':'book')}${escape(typeLabels[ex.type])}</span><span>Soal ${count} / 10</span></div><h2 id="question" tabindex="-1">${escape(ex.prompt)}</h2>${ex.code?codeBlock(ex.code):''}<div id="answer-controls">${answerControls(ex,draft,s.seed,pending)}</div></article>
    <div id="input-note" class="input-note" aria-live="polite"></div>
    ${pending?feedbackMarkup(ex,pending):''}
    <div class="quiz-actions"><span>${pending?pending.correct?'Satu langkah lebih paham.':'Tidak ada nyawa yang berkurang.':'Tidak perlu buru-buru. Pikirkan dulu.'}</span>${pending?`<button type="button" class="primary check-button" data-action="continue">${s.phase==='challenge' && pending.correct?'Lihat hasil':'Lanjutkan'} ${icon('arrow')}</button>`:`<button type="submit" id="check-answer" class="primary check-button" ${!isAnswerComplete(ex,draft)?'disabled':''}>Periksa jawaban ${icon('check')}</button>`}</div></form>
    ${referenceMarkup(topic,state.learned[topic.id])}</section>
    <aside class="lesson-aside quiz-aside"><h2>Petualangan sesi ini</h2><div class="session-overview"><span>${icon('bolt')} ${s.earned} XP baru</span><span>${icon('check')} ${s.cleared.length}/10 dituntaskan</span><span>${icon('repeat')} ${s.mistakes} jawaban perlu diulang</span></div><ol class="lesson-steps"><li class="${s.phase==='lesson'?'active-step':'passed-step'}"><span>1</span><div>Latihan utama<small>Beragam cara mengasah logika</small></div></li><li class="${s.phase==='retry'?'active-step':s.phase==='challenge'?'passed-step':''}"><span>2</span><div>Ulangi yang belum tepat<small>Kesempatan tanpa batas</small></div></li><li class="${s.phase==='challenge'?'active-step':''}"><span>3</span><div>Tantangan akhir<small>Buka topik selanjutnya</small></div></li></ol><div class="learning-note"><span class="note-mark" aria-hidden="true">{ }</span><h3>Salah itu bagian dari paham.</h3><p>Baca penjelasan setiap jawaban. Soal yang belum tepat menunggumu di akhir putaran.</p></div><p class="local-note">Jawaban dan progres tersimpan otomatis. Kamu bisa melanjutkan sesi ini kapan saja.</p></aside></div>`;
  refreshSubmit();
}
function renderSummary(topic) {
  const s=session(), next=topics[topics.indexOf(topic)+1], pct=Math.round((s.attempts-s.mistakes)/Math.max(1,s.attempts)*100);
  main.innerHTML=`<div class="page-top"><button class="text-button back-link" data-action="home">${icon('back')} Peta belajar</button>${rewardBar()}</div><section class="summary quiz-summary"><div class="summary-symbol">${icon('star')}</div><p class="eyebrow">Tantangan dituntaskan</p><h1 tabindex="-1">${next?'Satu topik lebih paham.':'Dari nol, sampai array.'}</h1><p>Semua latihan di <strong>${escape(topic.title)}</strong> sudah kamu jawab benar, termasuk soal yang diulang.</p><div class="session-stats"><div><span>+${s.earned}</span><small>XP baru</small></div><div><span>${pct}%</span><small>Ketepatan dari ${s.attempts} percobaan</small></div><div><span>10/10</span><small>Latihan dituntaskan</small></div></div><p class="summary-retry">${s.mistakes?`${s.mistakes} jawaban belum tepat tadi jadi kesempatan untuk mencoba lagi. Kamu berhasil menuntaskannya.`:'Seluruh jawaban tepat sejak percobaan pertama. Kerja bagus!'}</p>${stats().todayCount>=5?'<div class="goal-complete">'+icon('target')+' Target harian tercapai · '+stats().streak+' hari streak</div>':''}${next?`<div class="next-preview"><span>Langkah berikutnya</span><h2>${escape(next.title)}</h2><p>${escape(next.description)}</p></div><button class="primary" data-topic="${next.id}">Lanjut ke topik berikutnya ${icon('arrow')}</button>`:`<button class="primary" data-action="home">Lihat perjalananmu ${icon('arrow')}</button>`}<button class="text-button summary-repeat" data-topic="${topic.id}">${icon('repeat')} Mainkan topik ini lagi</button></section>`;
}
function render(focus=false) {
  renderSidebar();
  if(screen==='home') renderHome();else renderLearn();
  document.title=screen==='home'?'Flash Brains — Petualangan C':`${currentTopic()?.title??'Belajar'} — Flash Brains`;
  if(focus) {
    const el=main.querySelector('#feedback-title')??main.querySelector('#question')??main.querySelector('h1');
    el?.focus({preventScroll:true});
  }
}
function navigateTopic(id) {
  if(!isUnlocked(state,id)) return;
  state=startTopic(state,id);draft=session()?.pending?.input??session()?.draft;screen='learn';persist();closeMenu();render(true);window.scrollTo(0,0);
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
  if(action==='home') {screen='home';closeMenu();render(true);window.scrollTo(0,0);}
  if(action==='guide') {showGuide=!showGuide;render();document.querySelector('[data-action="guide"]').focus({preventScroll:true});if(showGuide)main.querySelector('.guide').scrollIntoView({block:'nearest'});}
  if(action==='continue' && session()?.pending) {
    const phase=session().phase;
    state=advanceSession(state);draft=undefined;persist();render(true);window.scrollTo(0,0);
    if(session().phase==='retry' && phase!=='retry') announcement.textContent='Latihan utama selesai. Sekarang ulangi soal yang belum tepat.';
    if(session().phase==='challenge' && phase!=='challenge') announcement.textContent='Latihan selesai. Tantangan akhir terbuka.';
  }
}
document.addEventListener('click',event=> {
  const topic=event.target.closest('[data-topic]');
  if(topic && !topic.disabled) navigateTopic(topic.dataset.topic);
  const action=event.target.closest('[data-action]');
  if(action) perform(action.dataset.action);
  if(event.target.closest('a.brand')) {event.preventDefault();perform('home');}
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
document.querySelector('#menu-toggle').addEventListener('click',()=> {
  const open=sidebar.classList.toggle('mobile-open');main.inert=open;
  document.querySelector('#menu-toggle').setAttribute('aria-expanded',String(open));
  if(open) sidebar.querySelector('button')?.focus();
});
document.addEventListener('keydown',event=> {if(event.key==='Escape')closeMenu(true);});
window.addEventListener('resize',()=>{if(window.innerWidth>640)closeMenu();});
render();
