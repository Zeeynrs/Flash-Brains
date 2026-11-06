import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { topics } from '../dist/curriculum.js';

const compilerAvailable = spawnSync('gcc',['--version']).status === 0;
const expected = {s3:'Halo, C!\n', v3:'8', i3:'Nilai: 85', o1:'3', o2:'1', o4:'14', p2:'Lulus', l2:'0 1 2 ', a2:'20', a4:'12', m3:'6', m4:'1 2 3 \n4 5 6 \n'};
for (const [id,output] of Object.entries(expected)) {
  test(`C99 example ${id} compiles and prints the taught result`,{skip:!compilerAvailable},()=> {
    const card = topics.flatMap(t=>t.cards).find(c=>c.id === id);
    const dir = mkdtempSync(join(tmpdir(),'kartu-c-'));
    try {
      const source = join(dir,'lesson.c'), binary = join(dir,'lesson');
      writeFileSync(source,`#include <stdio.h>\nint main(void) {\n${card.code}\nreturn 0;\n}`);
      const compilation = spawnSync('gcc',['-std=c99','-Wall','-Wextra','-Werror',source,'-o',binary],{encoding:'utf8'});
      assert.equal(compilation.status,0,compilation.stderr);
      const run = spawnSync(binary,[],{encoding:'utf8',timeout:1000});
      assert.equal(run.status,0);
      assert.equal(run.stdout,output);
    } finally { rmSync(dir,{recursive:true,force:true}); }
  });
}
