import {courses,searchCourses} from './courses.js';
import {courseRoute} from './navigation.js';
import {escape,icon} from './quiz-view.js';
import {byteMascot} from './mascot.js';

// One-line daily goal, shared by the home and course screens.
export function missionMarkup(todayCount) {
  const done=Math.min(todayCount,5);
  return `<section class="mission ${todayCount>=5?'mission-done':''}" aria-label="Misi harian">${icon('target')}<div class="mission-copy"><strong>Misi harian</strong><span>${todayCount>=5?'Selesai. Kamu keren!':`${5-todayCount} soal benar lagi hari ini`}</span></div><progress max="5" value="${done}" aria-label="Target harian lima soal benar"></progress><span class="mission-count">${done}/5</span></section>`;
}
export function courseCardsMarkup(query,progressByCourse={}) {
  const matches=searchCourses(query);
  if(!matches.length) return `<div class="catalog-empty">${icon('search')}<h3>Belum ketemu pelajaran yang cocok.</h3><p>Coba kata lain, misalnya Python, C, atau catur.</p></div>`;
  return matches.map(c=> {
    const progress=progressByCourse[c.id]??{solvedCount:0};
    return `<article class="catalog-course-card" data-tone="${c.tone}"><div class="catalog-card-top"><span class="catalog-course-symbol" aria-hidden="true">${escape(c.symbol)}</span><div><h3><a href="${courseRoute(c.id)}" data-course="${c.id}">${escape(c.title)}</a></h3><span class="catalog-card-meta">${escape(c.level)} · ${c.topicCount} topik · ${c.exerciseCount} latihan</span></div></div><p class="catalog-description">${escape(c.description)}</p><div class="catalog-course-progress"><progress max="${c.exerciseCount}" value="${progress.solvedCount}" aria-label="Progres ${escape(c.title)}"></progress><span>${progress.solvedCount}/${c.exerciseCount}</span></div><a class="primary catalog-course-link" href="${courseRoute(c.id)}" data-course="${c.id}">${progress.solvedCount?'Lanjutkan':'Mulai belajar'} ${icon('arrow')}</a></article>`;
  }).join('');
}
export function catalogMarkup({stats,rewards,progressByCourse,continueTopic,query='',showGuide=false}) {
  const available=courses.filter(c=>c.status==='available').length;
  return `<div class="page page-wide"><div class="page-top"><header class="home-hello">${byteMascot('idle')}<div><h1 tabindex="-1">Mau belajar apa hari ini?</h1><p>Pilih pelajaran, lalu mulai dari langkah kecil.</p></div></header>${rewards}</div>
    ${missionMarkup(stats.todayCount)}
    ${continueTopic?`<section class="catalog-resume" aria-label="Lanjutkan pelajaran terakhir"><span class="resume-symbol" aria-hidden="true">${escape(continueTopic.symbol)}</span><div><h2>${escape(continueTopic.title)}</h2><p>${escape(continueTopic.courseTitle)} · jawaban dan progresmu tersimpan.</p></div><button class="secondary" data-topic="${continueTopic.id}" data-course-id="${continueTopic.courseId}">Lanjut belajar ${icon('arrow')}</button></section>`:''}
    <section class="catalog-courses" id="catalog-courses" aria-labelledby="catalog-title"><div class="catalog-section-header"><div><h2 id="catalog-title">Pelajaran</h2><p id="course-result-count" role="status">${query.trim()?`${searchCourses(query).length} pelajaran ditemukan`:`${available} pelajaran tersedia`}</p></div><div class="course-search"><label class="sr-only" for="course-search">Cari pelajaran</label>${icon('search')}<input id="course-search" type="search" placeholder="Cari pelajaran…" value="${escape(query)}" autocomplete="off" maxlength="100" aria-controls="course-results"></div></div><div id="course-results" class="catalog-course-grid">${courseCardsMarkup(query,progressByCourse)}</div></section>
    <footer class="page-footer"><span>Rasa ingin tahu adalah awal yang bagus.</span><button class="text-button" data-action="guide" aria-expanded="${showGuide}">Cara belajar ${showGuide?'−':'+'}</button></footer>
    ${showGuide?`<section class="guide" aria-label="Cara belajar"><h2>Mulai dari hal yang membuatmu penasaran.</h2><ol><li>Pilih pelajaran di katalog untuk melihat topiknya.</li><li>Ikuti latihan dan baca penjelasan jawabannya.</li><li>Soal yang belum tepat akan diulang di akhir putaran. Kamu bisa mencoba lagi tanpa batas nyawa.</li></ol><p>Progres dan jawaban tersimpan otomatis di browser ini. Jawab lima soal berbeda dengan benar dari pelajaran mana saja untuk mencapai misi harian. XP didapat saat pertama kali menjawab soal dengan benar.</p></section>`:''}</div>`;
}
