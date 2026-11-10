import {escape} from './html.js';
import {positionGame,legalMoves,moveId,PIECE_NAMES,chessAnswerText} from './chess-engine.js';

// Original Staunton-inspired SVG silhouettes, shared by both piece colors.
const shapes={
  p:'<circle cx="30" cy="16" r="8"/><path d="M24 24h12l-2 6q0 10 9 17H17q9-7 9-17Zm-9 24h30v5H15Z"/>',
  r:'<path d="M15 9h7v7h5V9h6v7h5V9h7v15l-7 4v15l7 5v5H15v-5l7-5V28l-7-4Z"/><path class="piece-detail" d="M22 29h16M22 43h16"/>',
  n:'<path d="m18 44 5-8 2-9-9 6-6-6 11-14 9-2 7-7 2 12q13 8 11 29l-5 4H18Z"/><path d="M15 48h33v5H15Z"/><path class="piece-detail" d="m22 18 8 1m-5 10 9-6q8 8 3 19"/><circle class="piece-eye" cx="28" cy="17" r="1.7"/>',
  b:'<path d="M30 5q-16 12-12 23 3 8 10 8h4q7 0 10-8Q46 17 30 5Z"/><path d="M26 36h8l2 9 8 4v4H16v-4l8-4Z"/><path class="piece-detail" d="m26 13 8 10M24 32h12"/>',
  q:'<path d="m13 18 7 21h20l7-21-12 8-5-14-5 14Z"/><circle cx="12" cy="15" r="4"/><circle cx="30" cy="9" r="4"/><circle cx="48" cy="15" r="4"/><path d="M21 39h18l-2 6 8 4v4H15v-4l8-4Z"/><path class="piece-detail" d="M21 35h18M23 44h14"/>',
  k:'<path class="piece-cross" d="M30 4v13m-6-7h12"/><path d="M30 17q-18-8-17 5 1 7 9 16h16q8-9 9-16 1-13-17-5Z"/><path d="M23 38h14l-1 7 9 4v4H15v-4l9-4Z"/><path class="piece-detail" d="M21 34h18M24 44h12"/>'
};
export function chessPiece(piece) {
  return piece?`<svg class="chess-piece piece-${piece.color}" data-piece="${piece.color}${piece.type}" viewBox="0 0 60 60" aria-hidden="true">${shapes[piece.type]}</svg>`:'';
}
const files='abcdefgh';
const squares=Array.from({length:64},(_,i)=>files[i%8]+(8-Math.floor(i/8)));
const pieceLabel=piece=>piece?`${PIECE_NAMES[piece.type]} ${piece.color==='w'?'putih':'hitam'}`:'kosong';

export function chessBoardMarkup(ex,input,pending,readOnly=false) {
  const game=positionGame(ex,input),disabled=Boolean(pending)||readOnly;
  const selected=ex.mode==='square'?input:null;
  const checked=game.inCheck()?game.findPiece({type:'k',color:game.turn()})[0]:null;
  const title=readOnly?'Amati posisi pada papan':ex.mode==='square'?'Pilih satu petak pada papan':'Pilih bidak, lalu petak tujuannya';
  return `<fieldset class="chess-control ${pending?(pending.correct?'result-correct':'result-wrong'):''}" ${disabled?'disabled':''} data-chess-control><legend>${title}</legend><div class="chess-board-top"><span class="chess-turn"><i class="turn-${ex.position.split(' ')[1]}" aria-hidden="true"></i>${readOnly?'Posisi latihan':`Giliran ${ex.position.split(' ')[1]==='b'?'hitam':'putih'}`}</span><span class="chess-board-note">${ex.mode==='square'?'Huruf + angka':'Putih di bawah'}</span></div><div class="chess-board-frame"><div class="chess-board" role="grid" aria-label="Papan catur, putih di bawah" aria-readonly="${disabled}">${Array.from({length:8},(_,row)=>`<div class="chess-rank" role="row">${squares.slice(row*8,row*8+8).map(square=>{
    const piece=game.get(square),file=files.indexOf(square[0]),rank=Number(square[1]);
    return `<button type="button" role="gridcell" class="chess-square ${(file+rank)%2===1?'square-dark':'square-light'} ${selected===square?'is-selected':''} ${ex.mode==='move' && input && [input.slice(0,2),input.slice(2,4)].includes(square)?'is-last':''} ${square===checked?'is-check':''}" data-square="${square}" tabindex="${!disabled && square===(selected??'a1')?'0':'-1'}" aria-label="${square}, ${pieceLabel(piece)}" aria-selected="${selected===square}" ${disabled?'disabled':''}>${file===0?`<span class="rank-coordinate" aria-hidden="true">${rank}</span>`:''}${rank===1?`<span class="file-coordinate" aria-hidden="true">${square[0]}</span>`:''}${chessPiece(piece)}</button>`;
  }).join('')}</div>`).join('')}</div></div>${!readOnly?`<div class="chess-answer-row"><span class="chess-answer-label">${input?escape(ex.mode==='square'?`Petak ${input}`:chessAnswerText({...ex,answer:input})):ex.mode==='square'?'Belum ada petak dipilih':'Belum ada langkah dipilih'}</span><button type="button" class="chess-reset" data-chess-reset ${disabled || !input?'disabled':''}><span aria-hidden="true">↺</span> Ulangi posisi</button></div><div class="chess-promotion" hidden><p>Pilih bidak promosi</p><div class="promotion-options"></div><button type="button" class="promotion-cancel">Batalkan</button></div><p class="chess-status" role="status" aria-live="polite">${input?'Jawabanmu tersimpan. Periksa saat sudah yakin.':'Klik petak atau gunakan tombol panah, lalu Enter.'}</p>${ex.hint?`<details class="chess-hint"><summary>Butuh petunjuk?</summary><p>${escape(ex.hint)}</p></details>`:''}`:''}</fieldset>`;
}

export function mountChess(root,{exercise:ex,input,pending,onChange,motionPaused=()=>false}) {
  if(!root || pending || ex.type!=='chess') return ()=>{};
  let answer=input??null,selected=null,promotion=null,focus=input?.slice(0,2)??'a1';
  const controls=[...root.querySelectorAll('[data-square]')];
  const squareNode=id=>controls.find(node=>node.dataset.square===id);
  const status=root.querySelector('.chess-status'),label=root.querySelector('.chess-answer-label');
  const promotionBox=root.querySelector('.chess-promotion'),events=new AbortController(),animations=new Set();
  const announce=text=>{status.textContent=text;};
  function paint() {
    const game=positionGame(ex,answer),moves=selected && ex.mode==='move'?legalMoves(ex,selected):[];
    const checked=game.inCheck()?game.findPiece({type:'k',color:game.turn()})[0]:null;
    for(const node of controls) {
      const square=node.dataset.square,piece=game.get(square),target=moves.some(move=>move.to===square);
      node.innerHTML=`${square[0]==='a'?`<span class="rank-coordinate" aria-hidden="true">${square[1]}</span>`:''}${square[1]==='1'?`<span class="file-coordinate" aria-hidden="true">${square[0]}</span>`:''}${chessPiece(piece)}`;
      node.classList.toggle('is-selected',ex.mode==='square'?answer===square:selected===square);
      node.classList.toggle('is-legal',target);
      node.classList.toggle('is-capture',target && Boolean(piece));
      node.classList.toggle('is-last',ex.mode==='move' && Boolean(answer) && [answer.slice(0,2),answer.slice(2,4)].includes(square));
      node.classList.toggle('is-check',square===checked);
      node.setAttribute('aria-label',`${square}, ${pieceLabel(piece)}${target?', tujuan sah':''}`);
      node.setAttribute('aria-selected',String(ex.mode==='square'?answer===square:selected===square));
      node.tabIndex=square===focus?0:-1;
    }
    root.querySelector('[data-chess-reset]').disabled=!answer && !selected && !promotion;
    label.textContent=answer?(ex.mode==='square'?`Petak ${answer}`:chessAnswerText({...ex,answer})):(ex.mode==='square'?'Belum ada petak dipilih':'Belum ada langkah dipilih');
    promotionBox.hidden=!promotion;
  }
  function complete(value) {
    answer=value;selected=null;promotion=null;paint();onChange(value);
    announce(ex.mode==='square'?`Petak ${value} dipilih.`:`${chessAnswerText({...ex,answer:value})} Gunakan Ulangi posisi untuk mengubahnya.`);
    if(ex.mode==='move' && !motionPaused()) {
      const from=squareNode(value.slice(0,2)).getBoundingClientRect(),to=squareNode(value.slice(2,4)).getBoundingClientRect();
      const piece=squareNode(value.slice(2,4)).querySelector('.chess-piece');
      const destination=squareNode(value.slice(2,4));destination.classList.add('is-moving');
      const animation=piece.animate([{transform:`translate(${from.left-to.left}px,${from.top-to.top}px)`},{transform:'none'}],{duration:190,easing:'cubic-bezier(.2,.8,.3,1)'});
      animations.add(animation);animation.onfinish=()=>{animations.delete(animation);destination.classList.remove('is-moving');};
    }
  }
  function choose(square) {
    focus=square;
    if(promotion) {announce('Pilih bidak promosi atau batalkan terlebih dahulu.');return;}
    if(ex.mode==='square') {complete(square);return;}
    if(answer) {announce('Langkahmu sudah dipilih. Tekan Ulangi posisi untuk mencoba langkah lain.');return;}
    const game=positionGame(ex),piece=game.get(square);
    if(selected) {
      const candidates=legalMoves(ex,selected).filter(move=>move.to===square);
      if(candidates.length) {
        if(candidates.some(move=>move.promotion)) {
          promotion={from:selected,to:square};
          const options=promotionBox.querySelector('.promotion-options');
          options.innerHTML=['q','r','b','n'].map(type=>`<button type="button" data-promote="${type}">${chessPiece({color:game.turn(),type})}<span>${PIECE_NAMES[type]}</span></button>`).join('');
          paint();options.querySelector('button').focus({preventScroll:true});announce('Pilih menteri, benteng, gajah, atau kuda untuk promosi.');return;
        }
        complete(moveId(candidates[0]));return;
      }
      if(square===selected) {selected=null;paint();announce('Pilihan bidak dibatalkan.');return;}
    }
    if(piece?.color===game.turn()) {
      selected=square;paint();const count=new Set(legalMoves(ex,square).map(move=>move.to)).size;
      announce(`${PIECE_NAMES[piece.type]} ${square} dipilih. ${count?`${count} tujuan sah ditandai.`:'Tidak ada langkah sah dari bidak ini.'}`);
    } else {announce(selected?'Langkah itu tidak sah. Pilih petak bertanda atau bidakmu yang lain.':'Pilih bidak sesuai warna giliran terlebih dahulu.');}
  }
  root.addEventListener('click',event=> {
    const square=event.target.closest('[data-square]'),promote=event.target.closest('[data-promote]');
    if(square) choose(square.dataset.square);
    if(promote && promotion) {const value=promotion.from+promotion.to+promote.dataset.promote;focus=promotion.to;complete(value);squareNode(focus).focus({preventScroll:true});}
    if(event.target.closest('[data-chess-reset]')) {answer=null;selected=null;promotion=null;paint();onChange(null);announce('Posisi awal dikembalikan. Pilih jawaban yang baru.');}
    if(event.target.closest('.promotion-cancel')) {promotion=null;selected=null;paint();squareNode(focus).focus({preventScroll:true});announce('Promosi dibatalkan.');}
  },{signal:events.signal});
  root.addEventListener('focusin',event=> {
    const node=event.target.closest('[data-square]');
    if(node) {focus=node.dataset.square;controls.forEach(square=>square.tabIndex=square===node?0:-1);}
  },{signal:events.signal});
  root.addEventListener('keydown',event=> {
    if(event.key==='Escape') {event.preventDefault();selected=null;promotion=null;paint();squareNode(focus).focus({preventScroll:true});announce('Pilihan dibatalkan.');return;}
    const node=event.target.closest('[data-square]');
    if(!node) return;
    let file=files.indexOf(node.dataset.square[0]),rank=Number(node.dataset.square[1]);
    const moves={ArrowUp:[0,1],ArrowDown:[0,-1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
    if(event.key in moves) {event.preventDefault();file=Math.max(0,Math.min(7,file+moves[event.key][0]));rank=Math.max(1,Math.min(8,rank+moves[event.key][1]));squareNode(files[file]+rank).focus({preventScroll:true});}
  },{signal:events.signal});
  paint();
  return ()=>{events.abort();animations.forEach(animation=>animation.cancel());};
}
