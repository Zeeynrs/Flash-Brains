# Kartu C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver the approved Indonesian C flashcard webapp.
**Architecture:** Buildless browser app; curriculum, learning state and DOM presentation are separate ES modules. localStorage keeps versioned state. Sites hosts the static dist directory.
**Tech Stack:** HTML, CSS, JavaScript, Node built-in test runner.
**Spec:** docs/superpowers/specs/2026-11-06-c-flashcards-design.md

## Global Constraints
- Eight topics with five cards each, in Indonesian.
- Sequential unlock; review does not revoke completed topics.
- No login, backend, editor, or code execution.
- Browser-local storage and responsive accessible controls.

## Review Focus
- Corrupt or inaccessible storage must not crash the app.
- Reload must preserve a deferred card's place in the session.
- Review must not revoke permanent progress.
- Locked topic navigation must be rejected by state logic.
- Mobile code blocks must scroll internally without overflowing the page.

### Task 1: Curriculum and state
Files: kartu-c/dist/curriculum.js, kartu-c/dist/state.js, kartu-c/tests/state.test.js.
Interfaces: topics[{id,title,description,cards[{id,kind,question,code?,answer,explanation}]}]; initialState(), restore(raw), startTopic(state,id), rateCard(state,remembered), isUnlocked(state,id), readProgress(storage), saveProgress(storage,state).
- [x] Write meaningful tests for deferred cards, unlock, review, reload, corrupt storage and curriculum size.
- [x] Run node --test kartu-c/tests/state.test.js; expect missing implementation failure.
- [x] Implement pure state transitions and curriculum; run tests, expect zero failures.

### Task 2: Responsive learning interface
Files: kartu-c/dist/index.html, styles.css, app.js, icon.svg.
Consumes: curriculum and state interfaces from Task 1.
Produces: topic dashboard, keyboard accessible learning session and completion page.
- [x] Implement topic list, real progress, reveal/rate controls and session summary.
- [x] Save after every transition, explain storage errors and support resuming a session.
- [x] Verify keyboard and mobile/desktop layouts with a browser when available.

### Task 3: Verification and delivery
Files: kartu-c/README.md and .openai/hosting.json.
- [x] Run state tests and JavaScript syntax checks; expect zero failures.
- [x] Review curriculum and accessible interaction; verify serving over HTTP.
- [x] Package exact source and publish private Site; return verified URL or explicit blocker.

## Execution notes
User approved implementation. Work proceeds inline on feat/c-flashcards in the supplied initially empty repository, without an additional worktree or approval round.
Visual direction: editorial-greeting, seed 1239489558. The screen answers 'what should I learn next?'. The product's face is its C brace mark and serif lesson title; its signature is the eight-stage topic path, with truthful zero progress on first use. No decorative images are needed.
