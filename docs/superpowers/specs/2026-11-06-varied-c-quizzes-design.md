# Flash-Brains: latihan C yang bervariasi

## Intent and authorization
User requested Duolingo-like features and varied puzzle quizzes. Proposed scope was seven exercise types, 80 exercises (10/topic), automatic feedback, XP, daily goal, streak, and a final topic challenge. User selected retrying mistakes at the end rather than a lives limit. Proceed with that scope; implementation defaults below are the builder's choices.

## Approaches
1. Add quizzes on top of the existing static curriculum and local progress. Chosen: suits existing hosting and no-account experience.
2. Add an account-backed game with leaderboards and remote execution. Not chosen: adds services unrelated to the requested variety.

## Curriculum and exercise flow
Preserve eight C topics and existing reference flashcards. Add ten hand-authored exercises per topic: choice, output prediction, fill a blank, order code, identify a bug, match concepts, logic puzzle. Every topic includes all seven types. Exercise ten is the final challenge.

Each session begins with the first nine exercises. Submit checks the answer automatically and shows a clear correct/incorrect result, correct answer, and explanation. A separate Continue button advances, preserving time to read feedback. Wrong exercises are collected and retried only after the current round ends. Repeat rounds until all nine are correct, then show the final challenge. A wrong challenge is repeated at the end of its round. There are no lives, time limits, or blocked retries. Topic completion requires ten correct exercises in the session; past completion remains valid during later review.

Answers, feedback, queue/deferred order and partial sessions must survive reload and switching between topics. Option and matching-choice orders are shuffled deterministically per session and exercise; do not move after reload. Code ordering uses click/tap controls and removable selections, not drag-only input. Matching uses labeled selects or equivalently keyboard-operable controls. Fill answers are case-sensitive, with explicit accepted variants and whitespace normalization. No code is executed in the browser.

## Rewards
10 XP once per exercise for its first correct answer; no XP from repeatedly replaying a mastered exercise. Daily goal: five different exercises answered correctly on the local calendar date; reviews count once per exercise per date. A day qualifies for streak after the daily goal is reached. Today or yesterday may anchor the displayed streak; a gap resets it. No server, leaderboard, or financial rewards.

## Compatibility
Keep current localStorage key and migrate version 1 to version 2. Preserve old learned-card references, completed topics and unlocked access; do not pretend old self-assessment is new quiz mastery or award retroactive XP. Show new exercises as available for old completed topics. Never silently erase valid old progress on migration. Reject malformed/untrusted local data safely. Catch blocked/quota-limited storage and show a warning while allowing in-memory play. Keep per-topic sessions to avoid losing a retry round when switching topics.

## Presentation
Keep current product identity and responsive layout; introduce a path of topics, real XP/goal/streak figures, varied exercise controls and distinct green/warm feedback. No proprietary mascot or copied Duolingo assets. Honor reduced motion. Keyboard focus, announcements, accessible labels, code scrolling and narrow/short viewports are required. A reference panel retains access to the original five explanations per topic.

## Delivery and validation
Retain buildless HTML/CSS/ES modules and Vercel configuration. Tests cover grading, postponed retries, final challenge gating, persisted feedback, multi-topic sessions, migration, corrupted/blocked storage, duplicate submission, XP farming and date boundaries. Compile executable teaching examples with GCC where possible. Browser QA covers every control type, wrong-answer retries, reload, migrated progress and mobile layouts. Review then push to main for existing automatic Vercel production deployment and inspect Ready status. Keep the established subdomain.
