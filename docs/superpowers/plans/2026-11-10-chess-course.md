# Chess Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved eight-unit, 80-exercise beginner chess course and single-move puzzles.

**Architecture:** Reuse the shared course/session/reward engine. A small chess adapter wraps locally vendored chess.js; course data describes positions and goals; a separate board view/controller owns selection and movement. Existing programming courses retain their providers, storage and controls.

**Tech Stack:** Existing static HTML/CSS/browser ES modules, chess.js 1.4.0 ESM and BSD-2-Clause license, Node test runner and browser QA.

**Spec:** `docs/superpowers/specs/2026-11-10-chess-course-design.md`

## Global Constraints

- Eight units and ten exercises per unit; single-move puzzles, no bot or backend.
- Use `flash-brains-chess-progress-v1`; preserve all existing C/Python keys and migrations.
- Validate legal moves, king safety, special moves and every authored puzzle key.
- Accept any legal mating move for a mate goal.
- Explicit submit, persistent draft/feedback/retry, explicit promotion choice.
- Mouse/touch/keyboard, reduced motion, no overflow at 320px.
- Original Indonesian content and original SVG piece artwork; local library and license, no CDN.
- Commit and push directly to main, per the user’s established workflow.

## Review Focus

1. A legal alternate mate must grade correctly; stalemate and checking-only moves must not.
2. Truncated promotion, illegal moves and corrupted persisted drafts must never enable submit or earn XP.
3. Clicking a different piece, reset and reload must preserve a deterministic board and valid draft.
4. Switching courses must not mutate C/Python sessions, mastery, access or XP.
5. Mobile/keyboard promotion must remain reachable, and all board input must lock during feedback.

### Task 1: Chess rules adapter and content

**Files:** create `dist/vendor/chess.js`, `dist/vendor/chess.LICENSE`, `dist/chess-engine.js`, `dist/chess-curriculum.js`, `dist/chess-quizzes.js`, `tests/chess.test.js` (all under `kartu-c/`).

**Interfaces:** `positionGame(ex,input)` rebuilds a Chess instance; `legalMoves(ex,from)` returns verbose legal moves; `validChessAnswer(ex,input)`, `gradeChessAnswer(ex,input)`, `chessAnswerText(ex)` provide the shared-engine seam. Exports `topics`, `exercisesByTopic`, `exercisesForTopic(id)`, `exerciseById(id)` match existing providers. Board exercise shape: `{type:'chess',position,mode:'square'|'move',answer/answers,goal?,hint,...}`; drafts are square/UCI strings.

- [x] Write focused tests for missing adapter and content, run and observe failure.
- [x] Vendor exact chess.js ESM and license without adding runtime install/build requirements.
- [x] Implement strict legal square/move validation, all promotions and semantic mate grading; test blocked moves, king safety, castling, en passant and alternate mates.
- [x] Author 8 units/40 reference cards/80 exercises with board practice in each; assert schema, legal FENs, king safety and valid correct keys.
- [x] Run `node --test tests/chess.test.js` and fix content/key errors before UI work.

### Task 2: Board view and controller

**Files:** create `dist/chess-view.js`, `dist/chess.css`; modify `dist/quiz-view.js`, `dist/app.js`, `dist/index.html`.

**Interfaces:** `chessBoardMarkup(ex,input,pending)` returns accessible board controls; `mountChess(root,{exercise,input,pending,onChange,motionPaused})` owns ephemeral selection/hints/promotion and returns cleanup. `onChange(string|null)` persists a legal completed answer or clears it. Six SVG piece shapes serve both colors.

- [x] Add failing browser checks for square selection, legal/illegal moves, reset, explicit promotion, keyboard and locked feedback.
- [x] Implement tap/click and arrow-key/Enter board; retain exact canonical position, last move, side to move and legal destination markers.
- [x] Implement promotion buttons for q/r/b/n, hint disclosure and reset; incomplete moves remain transient.
- [x] Animate piece movement with transforms only; honor reduced motion. Ensure field and coordinate labels fit 320px.
- [x] Verify board behavior in the real browser and inspect desktop/mobile screenshots.

### Task 3: Course integration, state and delivery

**Files:** modify `dist/course-content.js`, `dist/courses.js`, `dist/quiz-engine.js`, `dist/learning-state.js`, `dist/catalog-view.js`, `dist/catalog.css`, `dist/lesson-entrance.js`, `dist/lesson-entrance.css`, existing integration/navigation tests and README copy.

- [x] Add failing registration/state tests: third course, isolated saved board drafts and feedback, 80-exercise completion, retry and XP uniqueness, shared rewards.
- [x] Register chess and route the board answer through completion/grading/draft validation. Keep existing C/Python assertions and add derived course totals.
- [x] Add gold course styling and chess emblem, update general catalog text, remove programming-only guidance from chess.
- [x] Run full tests and browser regressions: C/Python controls, matching, sidebar, entrance, chess from catalog through final completion, reset/reload/promotion and reduced motion.
- [x] Run whole-change review, resolve findings, inspect final diff, commit/push main and verify Vercel production deployment status.

## Execution ledger

- 2026-11-10: User approved design. Native execution selected as a routine implementation choice to avoid a new approval round; one independent whole-change review at the end.
- Ruling: Work in the current main checkout, honoring the user’s explicit direct-main/no-merge workflow. Only the approved design document was untracked at start.
- Baseline: Existing Python stdout CRLF assertion failure and GCC compilation skips are known and will be reported separately if still present.

- Task 1 complete: exact local chess.js runtime/license verified against npm SHA256; 80 positions/keys, 40 notes, promotion, king safety, special moves, forks, mate alternatives and stalemate tests pass.
- Task 2 complete: real browser verifies square answers, moves, illegal destinations, reset/reload, keyboard arrows/Enter, promotion/Escape/underpromotion, touch, hints, locked feedback, castling/en passant, catalog/entrance/resume at desktop and 320px.
- Task 3 verification: all 80 chess exercises completed in the real UI, 800 XP, eight completed units and summary restored on reload. Existing C/Python matching, sidebar and study-desk entrance regressions pass.
- Whole-change review found reversed square colors; reproduced with a failing renderer assertion, corrected, and verified a1 dark/h1 light/d1 light/a8 light in tests and browser. No other important review findings.
- Full suite: 50 passed, 1 existing Python CRLF-output failure, 41 GCC-unavailable skips. Production release proof follows the final commit/push.
- Release verified: feature commit `cb7f33d202cedc430754f79509eabcd86ceb99fe` is on origin/main; Vercel production deployment `flash-brains-6t9uy62do-adityadaffa522-9193.vercel.app` reports READY for that exact Git SHA. Course URL: https://flashbrains.site/#/pelajaran/chess.
- Diff whitespace check passed for project files. Unmodified upstream chess.js retains its generated mixed space/tab indentation; npm runtime SHA256 matched before commit.
