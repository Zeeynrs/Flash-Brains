import {topics} from './curriculum.js';
import {exercisesForTopic,exerciseById} from './quizzes.js';
import {createLearningEngine} from './learning-state.js';

// Keep the original key and legacy migration for existing C learners.
export const cLearning=createLearningEngine({topics,exercisesForTopic,exerciseById,storageKey:'kartu-c-progress-v1',allowLegacyMigration:true});
export const {STORAGE_KEY, DAILY_GOAL, XP_PER_EXERCISE, initialState, currentSession, topicComplete, isUnlocked, localDateKey, learningStats, startTopic, setDraft, submitAnswer, advanceSession, restore, readProgress, saveProgress}=cLearning;
