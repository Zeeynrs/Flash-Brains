# Varied quiz verification

## Scope delivered

80 authored exercises: eight topics with ten each, all seven interaction types in every topic, tenth-only final challenge. Existing 40 reference cards retained. Wrong answers are deferred to the end of the round; final challenge opens after all nine main exercises are correct. No life limit. All exercises can be replayed.

10 lifetime XP per exercise, daily goal of five distinct correctly answered exercises, goal-based local-calendar streak. Per-topic sessions, unchecked drafts, checked feedback and retry ordering survive reload and navigation. Version 1 flashcard data migrates while preserving learned references and unlocked topic access; old self-assessments do not invent quiz scores.

## Automated checks

- `npm --prefix kartu-c test`: 63 passed, zero failures or skips in this environment.
- Grader checks cover every interaction, incomplete answers, duplicates, case sensitivity, whitespace and deterministic option shuffling.
- State checks cover end-of-round retries, failed challenge retry, duplicate submit, persisted feedback/drafts, per-topic session switching, full 80-exercise completion, v1 migration, invalid data, blocked storage, XP farming, daily uniqueness, streak gaps and month boundaries.
- GCC C99 with warnings as errors compiled and executed 40 examples with exact output (12 original references, 28 quizzes).
- GCC syntax checks cover every accepted fill answer and ordering key, including the valid alternate array-loop comparison.
- JavaScript syntax and Git whitespace checks passed.

## Browser QA

Existing Chromium exercised real form controls for all seven types. Completed all 80 exercises, deliberately deferred four different mistakes, reloaded with wrong-answer feedback visible, repeated a failed final challenge, and replayed a whole completed topic without additional XP. No JavaScript exceptions. v1 migration kept old topic access and reference counts. Unchecked choice/output/fill/order/bug/match answers survived Home/resume and reload, with visible controls restored. Escape closes mobile navigation and restores focus. Blocked storage shows a warning while still permitting answers.

Home checked at 320, 390, 768 and 1440 pixels. Quiz journey checked at mobile width with internal code scrolling and no document overflow. Design inspector: zero failures. Accepted warnings preserve the existing editorial title, code monospace alongside UI/display faces, and secondary metadata at 11–12px. Screenshots reviewed for home, each exercise type, feedback and session completion. Full selected matching text is displayed below its select so long answers remain readable on phones.

## Independent review and fixes

Content review confirmed all quantities, exercise types, ordering constraints and output-prediction safety. One important finding: array-1d-09 also needs to accept `!=`; regression failed before the answer key was expanded and now passes.

Whole-feature review found unchecked drafts were lost on navigation/reload. Added validated per-session drafts, persistence on editing, and clearing after advance. New state regressions failed before implementation and now pass; browser regressions confirm visible restoration. No critical or other important findings remained from the reviews.

## Delivery

Update the existing GitHub main branch and its automatic Vercel production deployment. Keep `flash-brains.parallel-dungeons.site` and the established project configuration.
