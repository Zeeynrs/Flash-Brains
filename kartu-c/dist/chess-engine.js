import {Chess} from './vendor/chess.js';

export {Chess};
export const PIECE_NAMES={k:'raja',q:'menteri',r:'benteng',b:'gajah',n:'kuda',p:'pion'};
export const moveId=move=>move.from+move.to+(move.promotion??'');
const moveObject=input=>({from:input.slice(0,2),to:input.slice(2,4),...(input.length===5?{promotion:input[4]}:{})});

export function legalMoves(ex,from) {
  try {return new Chess(ex.position).moves({verbose:true,...(from?{square:from}:{})});}
  catch {return [];}
}
export function validChessAnswer(ex,input) {
  if(typeof input!=='string') return false;
  if(ex.mode==='square') return /^[a-h][1-8]$/.test(input);
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input) && legalMoves(ex).some(move=>moveId(move)===input);
}
export function positionGame(ex,input) {
  const game=new Chess(ex.position);
  if(ex.mode==='move' && validChessAnswer(ex,input)) game.move(moveObject(input));
  return game;
}
export function gradeChessAnswer(ex,input) {
  if(!validChessAnswer(ex,input)) return false;
  if(ex.goal==='mate') return positionGame(ex,input).isCheckmate();
  return (ex.answers??[ex.answer]).includes(input);
}
export function chessAnswerText(ex) {
  const input=ex.answer??ex.answers?.[0];
  if(ex.mode==='square') return `Pilih petak ${input}.`;
  const piece=new Chess(ex.position).get(input.slice(0,2));
  const mate=ex.goal==='mate' && positionGame(ex,input).isCheckmate();
  return `${PIECE_NAMES[piece.type][0].toUpperCase()+PIECE_NAMES[piece.type].slice(1)} ${input.slice(0,2)} → ${input.slice(2,4)}${input[4]?`, promosi menjadi ${PIECE_NAMES[input[4]]}`:''}${mate?' — skakmat.':'.'}`;
}
