import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateAccountForm,safeReturnRoute,accountError} from '../dist/account-model.js';
test('registration rejects mismatched passwords and blank names without submitting',()=>{
  assert.ok(validateAccountForm('register',{email:'a@b.co',password:'secret123',confirm:'different',name:'Name'}));
  assert.ok(validateAccountForm('register',{email:'a@b.co',password:'secret123',confirm:'secret123',name:'  '}));
  assert.equal(validateAccountForm('register',{email:'a@b.co',password:'secret123',confirm:'secret123',name:'A'}),null);
});
test('OAuth return destinations accept only known app learning routes',()=>{
  assert.equal(safeReturnRoute('#/pelajaran/chess/topik/chess-board'),'#/pelajaran/chess/topik/chess-board');
  for(const path of ['https://evil.test','//evil.test','#/login','#/profil/evil','javascript:alert(1)'])assert.equal(safeReturnRoute(path),'#/profil');
});
test('account errors are actionable and do not reveal server details',()=>{
  assert.match(accountError({code:'invalid_credentials'}),/email|kata sandi/i);
  assert.match(accountError({code:'email_not_confirmed'}),/konfirmasi/i);
  assert.equal(accountError({message:'secret server stack'}).includes('secret'),false);
});
