import { topics } from './curriculum.js';
import { isUnlocked, startTopic, rateCard, readProgress, saveProgress } from './state.js';

let storage;
try { storage = window.localStorage; } catch { storage = null; }
const loaded = readProgress(storage);
let state = loaded.state;
let screen = 'home';
let revealed = false;
let showGuide = false;
const main = document.querySelector('#main');
const sidebar = document.querySelector('#sidebar');
const notice = document.querySelector('#storage-notice');
const announcement = document.querySelector('#announcement');
notice.hidden = loaded.available;

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => {
  const paths = {
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    lock:'<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
    book:'<path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',
    repeat:'<path d="M20 8a8 8 0 0 0-14-2L3 9m0-5v5h5m-4 7a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.arrow}</svg>`;
};
const count = topic => state.learned[topic.id]?.length ?? 0;
const total = () => topics.reduce((n,t) => n+count(t),0);
const complete = topic => count(topic) === topic.cards.length;
const currentTopic = () => topics.find(t => t.id === state.session?.topicId);
const nextTopic = () => topics.find(t => !complete(t)) ?? topics[0];
function persist() { notice.hidden = saveProgress(storage,state); }

function renderSidebar() {
  sidebar.innerHTML = `<a href="#" class="brand desktop-brand" aria-label="Kartu C, beranda"><span class="brand-mark" aria-hidden="true">{c}</span> Kartu C</a>
    <p class="sidebar-subtitle">Ruang belajar pemrograman</p>
    <button class="nav-home ${screen === 'home' ? 'selected':''}" data-action="home">${icon('book')}<span>Rencana belajar</span></button>
    <p class="nav-label">Pemrograman dasar C</p>
    <nav aria-label="Daftar topik">${topics.map((t,i) => `<button class="nav-topic ${screen === 'learn' && state.session?.topicId === t.id ? 'selected':''}" data-topic="${t.id}" ${!isUnlocked(state,t.id) ? 'disabled' : ''} ${screen === 'learn' && state.session?.topicId === t.id ? 'aria-current="step"' : ''}><span class="nav-number ${complete(t) ? 'done':''}">${complete(t) ? icon('check') : String(i+1).padStart(2,'0')}</span><span>${escape(t.title)}</span>${!isUnlocked(state,t.id) ? icon('lock') : ''}<span class="sr-only">${!isUnlocked(state,t.id) ? ', terkunci' : complete(t) ? ', selesai' : ', terbuka'}</span></button>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="mini-progress"><span>Perjalananmu</span><span>${total()}/40 kartu</span></div><progress max="40" value="${total()}" aria-label="Total kartu dipelajari"></progress><p>Mulai dari dasar.<br>Tumbuh satu kartu setiap hari.</p><span class="local-label"><span aria-hidden="true">◉</span> Progres disimpan di perangkat ini</span></div>`;
}

function renderHome() {
  const next = nextTopic();
  const finished = topics.filter(complete).length;
  const allDone = finished === topics.length;
  const active = state.session?.queue.length ? currentTopic() : next;
  main.innerHTML = `<div class="page-top"><span>Rencana belajar</span><span>Dasar C <span class="separator">/</span> 8 topik</span></div>
    <header class="page-heading"><h1 tabindex="-1">${allDone ? 'Dasar yang kuat.<br>Langkah yang hebat.' : 'Sedikit demi sedikit,<br>paham C.'}</h1><p>Dari program pertamamu sampai array.<br>Belajar, ingat kembali, lalu lanjutkan.</p></header>
    <section class="overview-grid" aria-label="Lanjutkan belajar">
      <div class="continue-panel"><div class="continue-copy"><span class="eyebrow">${allDone ? 'Saatnya mengulang' : count(active) > 0 || state.session?.queue.length ? 'Lanjutkan perjalananmu' : 'Langkah pertamamu'}</span><h2>${escape(active.title)}</h2><p>${escape(active.description)}</p><div class="lesson-meta"><span>${String(topics.indexOf(active)+1).padStart(2,'0')} / 08 topik</span><span>5 kartu</span></div><button class="primary" data-topic="${active.id}">${allDone ? 'Ulangi materi' : count(active) > 0 || state.session?.queue.length ? 'Lanjut belajar' : 'Mulai belajar'} ${icon('arrow')}</button></div><div class="hello-code" aria-label="Contoh program C"><div class="code-caption"><span>hello.c</span><span>C</span></div><pre><code><span class="code-muted">#include &lt;stdio.h&gt;</span>

<span class="code-type">int</span> main(<span class="code-type">void</span>) {
    printf(<span class="code-string">"Halo, dunia!\\n"</span>);
    <span class="code-type">return</span> 0;
}</code></pre><div class="code-output"><span class="code-muted">&gt;</span> Halo, dunia!</div></div></div>
      <div class="journey-panel"><span class="eyebrow">Progres belajarmu</span><div class="big-number">${finished}<span> / 8</span></div><p>topik selesai</p><div class="topic-track" aria-hidden="true">${topics.map(t=>`<span class="${complete(t) ? 'filled':''}"></span>`).join('')}</div><span class="progress-caption">${total()} dari 40 kartu dipelajari</span><p class="journey-note">${allDone ? 'Semua topik terbuka. Ulangi kapan saja agar makin melekat.' : 'Tidak perlu terburu-buru.<br>Yang penting, kamu paham.'}</p></div>
    </section>
    <section class="curriculum"><div class="section-heading"><div><h2>Jalur belajarmu</h2><p>Selesaikan satu topik untuk membuka langkah berikutnya.</p></div><span class="topic-count">${finished}/8 selesai</span></div><div class="topic-grid">${topics.map((t,i) => {
      const unlocked = isUnlocked(state,t.id), done = complete(t);
      return `<button class="topic-row ${done ? 'is-done' : !unlocked ? 'is-locked' : 'is-open'}" data-topic="${t.id}" ${!unlocked ? 'disabled' : ''}><span class="topic-index">${String(i+1).padStart(2,'0')}</span><span class="topic-content"><span class="topic-title">${escape(t.title)}</span><span class="topic-description">${escape(t.description)}</span><span class="topic-status ${done ? 'success':''}">${done ? 'Selesai · ulangi kapan saja' : unlocked ? `${count(t)}/5 kartu · ${count(t) ? 'lanjutkan' : 'siap dipelajari'}` : `Terbuka setelah topik ${i}`}</span></span><span class="topic-trailing">${icon(done ? 'check' : unlocked ? 'arrow' : 'lock')}</span></button>`;
    }).join('')}</div></section>
    <footer class="page-footer"><span>40 kartu. Satu fondasi yang kuat.</span><button class="text-button" data-action="guide" aria-expanded="${showGuide}">Cara belajar ${showGuide ? '−' : '+'}</button></footer>
    ${showGuide ? `<section class="guide" aria-label="Cara belajar"><h2>Ingat kembali, bukan sekadar membaca.</h2><ol><li>Baca pertanyaan dan coba jawab sendiri.</li><li>Buka jawaban, lalu baca penjelasannya.</li><li>Pilih <strong>Ingat</strong> jika jawabanmu benar, atau <strong>Belum ingat</strong> untuk mengulang kartu.</li></ol><p>Topik berikutnya terbuka setelah kelima kartu ditandai Ingat. Ini penilaian mandiri, bukan ujian. Progres hanya tersimpan di browser ini; menghapus data situs akan menghapus progres. Materi menggunakan sintaks C99 atau lebih baru. Potongan kode mengasumsikan berada dalam main dengan header yang sesuai, kecuali dinyatakan sebagai program lengkap atau latihan mencari kesalahan.</p></section>` : ''}`;
}

function renderLearn() {
  const topic = currentTopic();
  if (!topic) { screen = 'home'; renderHome(); return; }
  if (!state.session.queue.length) { renderSummary(topic); return; }
  const card = topic.cards.find(c=>c.id === state.session.queue[0]);
  const remaining = state.session.queue.length;
  main.innerHTML = `<div class="page-top"><button class="text-button back-link" data-action="home">${icon('back')} Semua topik</button><span>Topik ${String(topics.indexOf(topic)+1).padStart(2,'0')} <span class="separator">/</span> 08</span></div>
    <header class="lesson-heading"><h1 tabindex="-1">${escape(topic.title)}</h1><p>Coba jawab sendiri sebelum membuka jawabannya.</p></header>
    <div class="study-layout"><section class="study-main" aria-label="Kartu belajar"><div class="study-progress"><span>${5-remaining} dari 5 kartu selesai dalam sesi ini</span><span>${remaining} tersisa</span></div><progress max="5" value="${5-remaining}" aria-label="Progres sesi"></progress>
    <article class="flashcard"><div class="flashcard-top"><span>${escape(card.kind)}</span><span>Kartu ${topic.cards.indexOf(card)+1} / 5</span></div><h2 id="question" tabindex="-1">${escape(card.question)}</h2>${card.code ? `<pre class="question-code"><code>${escape(card.code)}</code></pre>` : `<div class="concept-symbol" aria-hidden="true">${escape(topic.symbol)}</div>`}
    <div class="answer ${revealed ? 'revealed':''}" id="answer" ${!revealed ? 'hidden':''}><span class="eyebrow">Jawaban</span><h3>${escape(card.answer)}</h3><p>${escape(card.explanation)}</p></div>
    ${!revealed ? `<div class="reveal-area"><p>Sudah punya jawaban?</p><button class="primary" data-action="reveal" aria-expanded="false" aria-controls="answer">${icon('eye')} Lihat jawaban</button></div>` : ''}</article>
    ${revealed ? `<div class="rating-area"><p>Apakah jawabanmu sudah tepat?</p><div class="rating-buttons"><button class="secondary" data-action="again">${icon('repeat')} Belum ingat <kbd>1</kbd></button><button class="primary" data-action="remember">${icon('check')} Ingat <kbd>2</kbd></button></div></div>` : `<p class="study-hint">Pahami dulu. Tidak ada batas waktu.</p>`}</section>
    <aside class="lesson-aside"><h2>Di topik ini</h2><ol class="card-list">${topic.cards.map((c,i)=>`<li class="${c.id === card.id ? 'current' : !state.session.queue.includes(c.id) ? 'finished':''}"><span>${!state.session.queue.includes(c.id) ? icon('check') : String(i+1).padStart(2,'0')}</span><span>${escape(c.kind)}<small>${c.id === card.id ? 'Sedang dipelajari' : !state.session.queue.includes(c.id) ? 'Selesai di sesi ini' : 'Dalam antrean'}</small></span></li>`).join('')}</ol><div class="learning-note"><span class="note-mark" aria-hidden="true">{ }</span><h3>Belum ingat? Tidak apa-apa.</h3><p>Kartu akan muncul lagi di akhir antrean. Mengulang adalah bagian dari belajar.</p></div><p class="local-note">Kamu bisa berhenti kapan saja. Progres disimpan setiap selesai menilai kartu.</p></aside></div>`;
}

function renderSummary(topic) {
  const index = topics.indexOf(topic);
  const next = topics[index+1];
  main.innerHTML = `<div class="page-top"><button class="text-button back-link" data-action="home">${icon('back')} Semua topik</button><span>Topik ${String(index+1).padStart(2,'0')} selesai</span></div><section class="summary"><div class="summary-symbol" aria-hidden="true">${icon('check')}</div><p class="eyebrow">Satu langkah lebih paham</p><h1 tabindex="-1">${next ? 'Bagus. Lanjut selangkah lagi?' : 'Dari nol, sampai array.'}</h1><p>Kamu sudah menyelesaikan kelima kartu<br>di topik <strong>${escape(topic.title)}</strong>.</p><div class="session-stats"><div><span>5/5</span><small>Kartu selesai</small></div><div><span>${state.session.again}</span><small>Penilaian “Belum ingat”</small></div><div><span>${topics.filter(complete).length}/8</span><small>Topik selesai</small></div></div>${next ? `<div class="next-preview"><span>Topik berikutnya terbuka</span><h2>${escape(next.title)}</h2><p>${escape(next.description)}</p></div><button class="primary" data-topic="${next.id}">Lanjut ke topik berikutnya ${icon('arrow')}</button>` : `<p>Seluruh topik sudah terbuka. Kamu bisa mengulang<br>materi kapan saja untuk memperkuat ingatan.</p><button class="primary" data-action="home">Lihat perjalananmu ${icon('arrow')}</button>`}<button class="text-button summary-repeat" data-topic="${topic.id}">${icon('repeat')} Ulangi topik ini</button></section>`;
}

function render(focus = false) {
  renderSidebar();
  if (screen === 'home') renderHome(); else renderLearn();
  document.title = screen === 'home' ? 'Kartu C — Rencana belajar' : `${currentTopic()?.title ?? 'Belajar'} — Kartu C`;
  if (focus) (main.querySelector('#question') ?? main.querySelector('h1'))?.focus({preventScroll:true});
}
function navigateTopic(id) {
  if (!isUnlocked(state,id)) return;
  state = startTopic(state,id); screen = 'learn'; revealed = false; persist(); closeMenu(); render(true); window.scrollTo(0,0);
}
function closeMenu() { sidebar.classList.remove('mobile-open'); document.querySelector('#menu-toggle').setAttribute('aria-expanded','false'); }
function perform(action) {
  if (action === 'home') { screen = 'home'; closeMenu(); render(true); window.scrollTo(0,0); }
  if (action === 'guide') { showGuide = !showGuide; render(); if(showGuide) main.querySelector('.guide').scrollIntoView({block:'nearest'}); main.querySelector('[data-action="guide"]').focus({preventScroll:true}); }
  if (action === 'reveal' && screen === 'learn') { revealed = true; render(); const answer = document.querySelector('#answer'); answer?.setAttribute('tabindex','-1'); answer?.focus({preventScroll:true}); }
  if ((action === 'again' || action === 'remember') && screen === 'learn' && revealed) {
    state = rateCard(state,action === 'remember'); revealed = false; persist(); render(true);
    announcement.textContent = action === 'again' ? 'Kartu dipindahkan ke akhir antrean.' : 'Kartu ditandai ingat.';
    window.scrollTo(0,0);
  }
}
document.addEventListener('click',event=> {
  const topic = event.target.closest('[data-topic]');
  if (topic && !topic.disabled) navigateTopic(topic.dataset.topic);
  const action = event.target.closest('[data-action]');
  if (action) perform(action.dataset.action);
  if (event.target.closest('a.brand')) { event.preventDefault(); perform('home'); }
});
document.querySelector('#menu-toggle').addEventListener('click',()=> {
  const open = sidebar.classList.toggle('mobile-open');
  document.querySelector('#menu-toggle').setAttribute('aria-expanded',String(open));
});
document.addEventListener('keydown',event=> {
  if (event.key === 'Escape') closeMenu();
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (screen === 'learn' && revealed && (event.key === '1' || event.key === '2')) { event.preventDefault(); perform(event.key === '1' ? 'again' : 'remember'); }
});
render();
