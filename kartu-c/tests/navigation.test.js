import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courses, courseById, searchCourses} from '../dist/courses.js';
import {parseRoute,courseRoute,lessonRoute} from '../dist/navigation.js';

test('catalog exposes only available real course content with derived counts',()=> {
  assert.equal(courses.length,1);
  assert.equal(courseById('c').title,'Pemrograman C');
  assert.equal(courseById('c').topicCount,8);
  assert.equal(courseById('c').exerciseCount,80);
  assert.equal(courseById('c').status,'available');
  assert.equal(courseById('missing'),undefined);
  assert.equal(courseById('__proto__'),undefined);
});
test('course search matches case-insensitive title, description, category and tags',()=> {
  for(const query of ['', '  ', 'c', 'PEMROGRAMAN', 'array', 'dasar C']) assert.equal(searchCourses(query).length,1,query);
  assert.deepEqual(searchCourses('pelajaran yang belum ada'),[]);
});
test('home routes resolve safely',()=> {
  for(const hash of ['', '#', '#/', '#/home']) assert.deepEqual(parseRoute(hash),{screen:'home'});
});
test('course and lesson routes round-trip stable ids',()=> {
  assert.equal(courseRoute('c'),'#/pelajaran/c');
  assert.deepEqual(parseRoute(courseRoute('c')),{screen:'course',courseId:'c'});
  assert.deepEqual(parseRoute(lessonRoute('c','array-1d')),{screen:'learn',courseId:'c',topicId:'array-1d'});
  assert.deepEqual(parseRoute('#/pelajaran/c/'),{screen:'course',courseId:'c'});
});
test('malformed and unsafe route segments fall back to home without throwing',()=> {
  for(const hash of ['#/missing','#/pelajaran/%E0%A4%A','#/pelajaran/../topik/a','#/pelajaran/c/topik/%2F','#/pelajaran/c/topik/a/extra']) assert.deepEqual(parseRoute(hash),{screen:'home'},hash);
});
