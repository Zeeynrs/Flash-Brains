import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../dist/chess-engine.js';
import * as course from '../dist/chess-quizzes.js';
import {topics} from '../dist/chess-curriculum.js';
import {chessBoardMarkup} from '../dist/chess-view.js';
const ex=position=>({type:'chess',mode:'move',position,answer:'e2e4'});

test('chess rejects blocked moves, own captures, malformed input and exposing its king',()=> {
  assert.equal(typeof api.validChessAnswer,'function','chess rules adapter is available');
  const start=ex('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  for(const move of ['a1a4','e1e2','e2e5','e7e5','x1a1','e2e4q',null,{},'']) assert.equal(api.validChessAnswer(start,move),false,String(move));
  assert.equal(api.validChessAnswer(start,'e2e4'),true);
  const pinned=ex('k3r3/8/8/8/8/8/4R3/4K3 w - - 0 1');
  assert.equal(api.validChessAnswer(pinned,'e2d2'),false);
  assert.equal(api.validChessAnswer(pinned,'e2e8'),true);
});
test('castling cannot cross check and en passant requires the immediate right',()=> {
  assert.equal(typeof api.validChessAnswer,'function');
  assert.equal(api.validChessAnswer(ex('4k3/8/8/8/8/8/8/4K2R w K - 0 1'),'e1g1'),true);
  assert.equal(api.validChessAnswer(ex('4kr2/8/8/8/8/8/8/4K2R w K - 0 1'),'e1g1'),false);
  const ep='rnbqkbnr/1pp1pppp/p7/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3';
  assert.equal(api.validChessAnswer(ex(ep),'e5d6'),true);
  assert.equal(api.validChessAnswer(ex(ep.replace(' d6 ',' - ')),'e5d6'),false);
});
test('promotion requires an explicit choice and supports all four pieces',()=> {
  assert.equal(typeof api.validChessAnswer,'function');
  const promotion=ex('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  assert.equal(api.validChessAnswer(promotion,'a7a8'),false);
  for(const piece of ['q','r','b','n']) assert.equal(api.validChessAnswer(promotion,`a7a8${piece}`),true);
  assert.equal(api.validChessAnswer(promotion,'a7a8k'),false);
});
test('mate goals accept alternative mates but reject stalemate and checking-only moves',()=> {
  assert.equal(typeof api.gradeChessAnswer,'function');
  const mate={...ex('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1'),goal:'mate',answer:'f7g7'};
  assert.equal(api.gradeChessAnswer(mate,'f7g7'),true);
  assert.equal(api.gradeChessAnswer(mate,'f7h7'),true);
  assert.equal(api.positionGame(mate,'f7e6').isStalemate(),true);
  assert.equal(api.gradeChessAnswer(mate,'f7e6'),false);
  assert.doesNotMatch(api.chessAnswerText({...mate,answer:'f7e6'}),/skakmat/,'a legal wrong preview must not claim mate');
  assert.equal(api.gradeChessAnswer(mate,'f7f6'),false);
});
test('authored knight forks really attack both the king and the rook',()=> {
  for(const [id,king,rook,target] of [['ch-taktik-05','e7','f6','d5'],['ch-taktik-10','h7','d7','f6']]) {
    const exercise=course.exerciseById(id),game=api.positionGame(exercise,exercise.answer);
    assert.equal(game.isCheck(),true);
    assert.ok(game.attackers(king,'w').includes(target),id);
    assert.ok(game.attackers(rook,'w').includes(target),id);
  }
});
test('square answers check coordinates and exact instructional targets',()=> {
  assert.equal(typeof api.validChessAnswer,'function');
  const square={type:'chess',mode:'square',answer:'e4'};
  assert.equal(api.validChessAnswer(square,'e4'),true);
  assert.equal(api.gradeChessAnswer(square,'e4'),true);
  assert.equal(api.gradeChessAnswer(square,'d4'),false);
  assert.equal(api.validChessAnswer(square,'e9'),false);
});
test('the actual board renders a1 dark, h1 light and the white queen on a light square',()=> {
  const markup=chessBoardMarkup(course.exerciseById('ch-papan-01'),null,null);
  assert.match(markup,/square-dark[^"<>]*" data-square="a1"/);
  assert.match(markup,/square-light[^"<>]*" data-square="h1"/);
  assert.match(markup,/square-light[^"<>]*" data-square="d1"/);
  assert.match(markup,/square-light[^"<>]*" data-square="a8"/);
});
test('all eighty authored chess exercises have legal positions and valid answer keys',()=> {
  assert.ok(course.exercisesByTopic,'chess content is available');
  const units=Object.values(course.exercisesByTopic);
  assert.equal(units.length,8);
  assert.equal(topics.length,8);
  assert.equal(new Set(topics.flatMap(t=>t.cards.map(c=>c.id))).size,40);
  for(const topic of topics) assert.equal(topic.cards.length,5);
  const ids=new Set(),errors=[];
  for(const unit of units) {
    assert.equal(unit.length,10);
    assert.ok(unit.some(e=>e.type==='chess'));
    for(const [i,e] of unit.entries()) {
      assert.ok(!ids.has(e.id));ids.add(e.id);
      assert.ok(e.prompt.length>15 && e.explanation.length>20,e.id);
      assert.equal(Boolean(e.challenge),i===9,e.id);
      if(e.position) {
        const game=api.positionGame(e);
        if(game.isAttacked(game.findPiece({type:'k',color:game.turn()==='w'?'b':'w'})[0],game.turn())) errors.push(`${e.id}: non-moving king starts in check`);
      }
      if(e.type==='chess') {
        if(!api.gradeChessAnswer(e,e.answer)) errors.push(`${e.id}: invalid key ${e.answer}`);
        for(const answer of e.answers??[]) assert.equal(api.gradeChessAnswer(e,answer),true,e.id);
      } else assert.ok(e.options.some(o=>o.id===e.answer),e.id);
    }
  }
  assert.equal(ids.size,80);
  assert.deepEqual(errors,[]);
});
