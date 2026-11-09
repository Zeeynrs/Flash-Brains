import {topics as cTopics} from './curriculum.js';
import {exercisesForTopic as cExercises,exerciseById as cExercise} from './quizzes.js';
import {cLearning} from './state.js';
import {topics as pythonTopics} from './python-curriculum.js';
import {exercisesForTopic as pythonExercises,exerciseById as pythonExercise} from './python-quizzes.js';
import {createLearningEngine} from './learning-state.js';

const pythonLearning=createLearningEngine({topics:pythonTopics,exercisesForTopic:pythonExercises,exerciseById:pythonExercise,storageKey:'flash-brains-python-progress-v1'});
const content=new Map([
  ['c',{topics:cTopics,exercisesForTopic:cExercises,exerciseById:cExercise,learning:cLearning}],
  ['python',{topics:pythonTopics,exercisesForTopic:pythonExercises,exerciseById:pythonExercise,learning:pythonLearning}]
]);
export const courseContentById=id=>content.get(id);
