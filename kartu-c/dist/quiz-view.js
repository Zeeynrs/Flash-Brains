import { correctAnswerText, shuffled } from './quiz-engine.js';
import { byteMascot, confetti } from './mascot.js';

export const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function icon(name) {
  const paths={
    home:'<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',
    play:'<path d="m8 4 12 8-12 8Z"/>',
    code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
    gem:'<path d="m7 3-5 6 10 13L22 9l-5-6Zm-5 6h20M7 3l5 19 5-19"/>',
    terminal:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m6 9 3 3-3 3m6 0h5"/>',
    branch:'<circle cx="6" cy="5" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="6" cy="19" r="3"/><path d="M6 8v8m0-4h5q7 0 7-4"/>',
    grid:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    flag:'<path d="M5 22V3m0 0q3-2 7 0t7 0v10q-3 2-7 0t-7 0"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 4m0 4h.01"/>',
    trophy:'<path d="M7 3h10v6q0 6-5 6T7 9ZM7 6H3v3q0 4 5 4m9-7h4v3q0 4-5 4M12 15v5m-5 1h10"/>',
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
    lock:'<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
    book:'<path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',
    repeat:'<path d="M20 8a8 8 0 0 0-14-2L3 9m0-5v5h5m-4 7a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>',
    star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    fire:'<path d="M12 3c1 5-5 5-5 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 3-2 3s2-4-1-8Z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    bolt:'<path d="m13 2-8 12h6l-1 8 9-13h-6Z"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]??paths.arrow}</svg>`;
}
export const codeBlock = (code,extra='') => `<pre class="question-code ${extra}"><code>${escape(code)}</code></pre>`;
export function answerControls(ex,input,seed,pending) {
  const disabled=pending ? 'disabled' : '';
  if(ex.options) {
    return `<fieldset class="choice-group" ${disabled}><legend class="sr-only">Pilih satu jawaban</legend>${shuffled(ex.options,`${seed}:${ex.id}`).map((o,i)=>{
      const correct=pending && o.id===ex.answer, selected=input===o.id;
      return `<label class="answer-option ${correct?'answer-correct':''} ${pending && selected && !correct?'answer-wrong':''}"><input type="radio" name="choice" value="${escape(o.id)}" ${selected?'checked':''}><span class="option-key" aria-hidden="true">${String.fromCharCode(65+i)}</span><span class="option-text">${escape(o.text)}${correct?'<small>Jawaban benar</small>':pending && selected?'<small>Pilihanmu</small>':''}</span>${correct?icon('check'):pending && selected?icon('close'):''}</label>`;
    }).join('')}</fieldset>`;
  }
  if(ex.type==='fill') return `<div class="fill-control"><label for="fill-answer">Lengkapi bagian <code>___</code></label><input id="fill-answer" name="fill" type="text" value="${escape(typeof input==='string'?input:'')}" placeholder="Tulis bagian kode yang hilang" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="1000" ${disabled} aria-describedby="fill-help"><p id="fill-help">Huruf besar dan kecil berpengaruh dalam C.</p></div>`;
  if(ex.type==='order') {
    const selected=Array.isArray(input)?input:[];
    return `<div class="order-control"><p id="order-help">Ketuk potongan kode sesuai urutan. Ketuk lagi untuk mengembalikannya.</p><div id="answer-workspace" class="code-workspace" tabindex="-1" aria-label="Urutan kodemu" aria-describedby="order-help">${selected.length?selected.map((id,i)=>`<button type="button" class="placed-token" data-token-remove="${escape(id)}" aria-label="Keluarkan baris ${i+1}: ${escape(ex.tokens.find(t=>t.id===id).text)}" ${disabled}><span class="line-number">${i+1}</span><code>${escape(ex.tokens.find(t=>t.id===id).text)}</code>${icon('close')}</button>`).join(''):'<span class="workspace-placeholder">Susun programmu di sini</span>'}</div><div class="token-bank" aria-label="Potongan kode tersedia">${shuffled(ex.tokens,`${seed}:${ex.id}`).map(t=>`<button type="button" class="code-token" data-token-add="${escape(t.id)}" ${selected.includes(t.id)||pending?'disabled':''}><code>${escape(t.text)}</code><span class="sr-only">${selected.includes(t.id)?' — sudah dipilih':' — tambahkan ke urutan'}</span></button>`).join('')}</div><span class="input-count">${selected.length}/${ex.tokens.length} potongan tersusun</span></div>`;
  }
  if(ex.type==='match') {
    const selected=input && typeof input==='object'?input:{};
    const options=shuffled(ex.pairs,`${seed}:${ex.id}`);
    return `<fieldset class="match-control" ${disabled}><legend>Pasangkan setiap konsep dengan jawaban yang sesuai.</legend>${ex.pairs.map((p,i)=>`<div class="match-row"><label for="match-${i}">${escape(p.left)}</label><span aria-hidden="true">→</span><select id="match-${i}" data-match="${escape(p.id)}" aria-label="Pasangan untuk ${escape(p.left)}"><option value="">Pilih pasangan…</option>${options.map(o=>`<option value="${escape(o.id)}" ${selected[p.id]===o.id?'selected':''}>${escape(o.right)}</option>`).join('')}</select><small class="match-preview" aria-live="polite">${escape(ex.pairs.find(target=>target.id===selected[p.id])?.right??'')}</small></div>`).join('')}<p class="match-help">Setiap jawaban dipakai satu kali.</p></fieldset>`;
  }
  return '';
}
export function feedbackMarkup(ex,pending) {
  if(!pending) return '';
  return `<section id="feedback" class="quiz-feedback ${pending.correct?'feedback-correct':'feedback-retry'}" aria-labelledby="feedback-title">${pending.correct?confetti():''}<div class="feedback-illustration">${byteMascot(pending.correct?'celebrate':'thinking')}</div><div class="feedback-copy"><div class="feedback-heading"><span class="feedback-icon">${icon(pending.correct?'check':'repeat')}</span><h2 id="feedback-title" tabindex="-1">${pending.correct?'Tepat sekali!':'Belum tepat. Kita ulangi nanti.'}</h2>${pending.xp?`<span class="xp-earned">+${pending.xp} XP</span>`:''}</div>${!pending.correct?`<p class="answer-key-label">Jawaban yang tepat</p><pre class="answer-key">${escape(correctAnswerText(ex))}</pre>`:''}<p>${escape(ex.explanation)}</p>${!pending.correct?'<p class="retry-note">Soal ini masuk putaran ulang setelah soal lainnya selesai.</p>':!pending.xp?'<p class="retry-note">Latihan ulang dihitung untuk target harian. XP soal ini sudah pernah kamu dapatkan.</p>':''}</div></section>`;
}
export function referenceMarkup(topic,learned=[]) {
  return `<details class="reference-panel"><summary>${icon('book')} Catatan materi: ${escape(topic.title)} <span>5 kartu referensi</span></summary><div class="reference-intro">Baca saat perlu bantuan. Catatan ini tidak menambah XP.${learned.length?` ${learned.length}/5 kartu pernah kamu pelajari di versi awal.`:''}</div>${topic.cards.map(c=>`<article class="reference-card"><h3>${escape(c.question)}</h3>${c.code?codeBlock(c.code):''}<p class="reference-answer">${escape(c.answer)}</p><p>${escape(c.explanation)}</p></article>`).join('')}</details>`;
}
