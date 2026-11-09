import {topics} from './curriculum.js';
import {exercisesForTopic} from './quizzes.js';

// Register actual published courses here. New subjects need their own content
// and learning-engine integration before they can be marked available.
export const courses=[{
  id:'c',title:'Pemrograman C',shortTitle:'Bahasa C',symbol:'C',category:'Pemrograman',level:'Pemula',
  description:'Belajar dasar C dari program pertama sampai array. Asah logika lewat kuis dan teka-teki interaktif.',
  tags:['dasar','C','array','kode','logika'],status:'available',engine:'c-quiz',tone:'green',
  progressKey:'kartu-c-progress-v1',topicCount:topics.length,
  exerciseCount:topics.reduce((sum,t)=>sum+exercisesForTopic(t.id).length,0)
}];
export const courseById=id=>courses.find(course=>course.id===id);
export function searchCourses(query='') {
  const words=(typeof query==='string'?query:'').trim().toLocaleLowerCase('id').split(/\s+/).filter(Boolean);
  return courses.filter(c=>c.status==='available' && words.every(word=>[c.title,c.shortTitle,c.category,c.description,...c.tags].join(' ').toLocaleLowerCase('id').includes(word)));
}
