import {courseContentById} from './course-content.js';

// Only publish a subject once its content and learning engine are ready.
export const courses=[{
  id:'c',title:'Pemrograman C',shortTitle:'Bahasa C',symbol:'C',category:'Pemrograman',level:'Pemula',
  description:'Belajar dasar C dari program pertama sampai array. Asah logika lewat kuis dan teka-teki interaktif.',
  tags:['dasar','C','array','kode','logika'],status:'available',engine:'quiz',tone:'green',
  rangeLabel:'Dari nol sampai array',finishLabel:'Dari nol, sekarang jago array!',
  goalLabel:'Tujuanmu: paham C, dari main() sampai array.',codeStandard:'C99 atau lebih baru'
},{
  id:'python',title:'Pemrograman Python',shortTitle:'Python',symbol:'Py',category:'Pemrograman',level:'Pemula',
  description:'Mulai Python dari print, variabel, dan percabangan sampai perulangan dan list. Belajar bertahap lewat kuis seru.',
  tags:['dasar','python','list','kode','logika'],status:'available',engine:'quiz',tone:'blue',
  rangeLabel:'Dari nol sampai list',finishLabel:'Dari nol, sekarang jago list!',
  goalLabel:'Tujuanmu: paham Python, dari print() sampai list.',codeStandard:'Python 3'
}].map(course=>{
  const content=courseContentById(course.id);
  return {...course,progressKey:content.learning.STORAGE_KEY,topicCount:content.topics.length,
    exerciseCount:content.topics.reduce((sum,t)=>sum+content.exercisesForTopic(t.id).length,0)};
});
export const courseById=id=>courses.find(course=>course.id===id);
export function searchCourses(query='') {
  const words=(typeof query==='string'?query:'').trim().toLocaleLowerCase('id').split(/\s+/).filter(Boolean);
  return courses.filter(c=>{
    const text=[c.title,c.shortTitle,c.symbol,c.category,c.description,...c.tags].join(' ').toLocaleLowerCase('id');
    const tokens=text.split(/[^a-z0-9]+/);
    return c.status==='available' && words.every(word=>word.length<=2?tokens.includes(word):text.includes(word));
  });
}
