# Varied C Quizzes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Deliver 80 automatically graded C exercises with end-of-round retries and learning rewards.
**Architecture:** Add a pure quiz schema/grader and v2 state engine; keep existing reference curriculum and migrate its local progress. Browser UI renders seven input types and persists every checked answer and advance.
**Tech Stack:** Vanilla HTML/CSS/ES modules, localStorage, Node test runner, GCC content checks, Chromium QA.
**Spec:** docs/superpowers/specs/2026-11-06-varied-c-quizzes-design.md

## Global Constraints
- Eight topics, 10 exercises each; seven exercise types in each topic; last is challenge.
- Wrong answers retry at the end, no lives; feedback precedes advancing.
- 10 XP for first mastery only, daily goal five unique correct exercises, streak based on local goal-completion dates.
- Preserve old progress and per-topic unfinished sessions; no browser code execution.
- Existing Vercel project, GitHub repo and subdomain remain the delivery targets.

## Review Focus
- Reload while incorrect feedback is visible must not duplicate attempts, reward XP, or skip the retry.
- Completing/replaying old topics must never revoke unlocked access.
- All choice/order/match controls must work on keyboard and touch; no accidental form submission.
- Invalid saved queues/IDs/dates and unavailable storage must not crash or fabricate mastery.
- Day changes and repeated answers must not inflate streak, target or XP.

### Task 1: Author exercises
Files: kartu-c/dist/quizzes.js, kartu-c/tests/quiz-content.test.js.
Interface: export exercisesByTopic object keyed by existing topic IDs; export exercisesForTopic(id) and exerciseById(id). Exercise schema is specified in .superpowers/varied-c-quizzes/content-brief.md.
- [x] Write content tests first: 80 unique IDs, all seven types each topic, final challenge, valid answers and executable output snippets.
- [x] Author hand-written C exercises/explanations; run focused tests and self-review ambiguity/correctness.

### Task 2: Grader and state
Files: kartu-c/dist/quiz-engine.js, state.js; tests/grading.test.js, state.test.js.
Interfaces: gradeExercise(ex,input), isAnswerComplete(ex,input), correctAnswerText(ex), shuffled(items,seed); initialState(), startTopic(state,id), submitAnswer(state,input,date), advanceSession(state), currentSession(state), restore(raw), readProgress(storage), saveProgress(storage,state), learningStats(state,date), isUnlocked(state,id), topicComplete(state,id).
- [x] Write failing tests for all grading types, incorrect deferred queues, duplicate submissions, challenge gating, rewards, migration, persisted sessions, corrupt and blocked storage.
- [x] Implement pure transitions and versioned validation; ensure focused tests pass.

### Task 3: Quiz presentation
Files: kartu-c/dist/app.js, styles.css, index.html.
Consumes: Task 1 schema and Task 2 interfaces.
- [x] Implement home progress, rewards/goal/streak, lesson round/challenge view, seven accessible inputs, feedback and session completion.
- [x] Retain reference flashcards in a collapsible material panel and old-completion message.
- [x] Verify all exercise controls, wrong-answer/reload flow, migration and narrow/short layouts in browser.

### Task 4: Review and deliver
Files: README.md, kartu-c/README.md, validation record.
- [x] Run full unit/content suite, JS syntax checks and browser journey; inspect screenshots.
- [x] Independent review, fix important findings with regressions, rerun appropriate checks.
- [x] Commit and update main, push authorized app update, inspect Vercel deployment; return live subdomain and concise change summary.
