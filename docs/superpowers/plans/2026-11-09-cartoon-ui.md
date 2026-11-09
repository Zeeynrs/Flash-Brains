# Cartoon UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** Redesign Flash Brains into a colorful responsive cartoon learning game.
**Architecture:** Replace the presentation CSS and recompose existing screen markup; add a reusable original SVG mascot and decorative route drawing. Keep pure state and grading unchanged.
**Tech Stack:** Existing vanilla ES modules, HTML/CSS, inline SVG and CSS animations.
**Spec:** docs/superpowers/specs/2026-11-09-cartoon-ui-design.md

## Global Constraints
- User explicitly requests colorful cartoon UI inspired by Duolingo.
- Preserve all 80 quizzes, seven controls, end-of-round retries, XP/streak rules, v1 migration and per-topic saved answers.
- Honor reduced motion; no new dependencies or audio.
- Deliver through existing GitHub main → Vercel production integration.

## Review Focus
- New route markup must retain accessible button names and locked/complete status.
- Re-rendering feedback and restoring answers must still work with all input types.
- Large character art must not overflow or block mobile controls.
- Reduced-motion users must receive stable, fully usable views.
- Keyboard navigation and short landscape views must retain access to the full menu.

### Task 1: Visual components and shell
Files: dist/mascot.js, styles.css, index.html, icon.svg.
- [x] Create original SVG Byte character with decorative animation hooks and brand mark.
- [x] Replace base typography/tokens and responsive shell, including truthful navigation/progress.

### Task 2: Home and learning screens
Files: dist/app.js, quiz-view.js, quiz.css.
- [x] Recompose home into current lesson, curved topic route and goal/coach rail.
- [x] Redesign all seven controls, answer feedback, reference material and completion state.
- [x] Add measured decorative route and short feedback reactions without altering scoring/state.

### Task 3: Verify and deliver
- [x] Run existing unit/content suite and browser flows; inspect responsive screenshots and reduced motion.
- [x] Independent review and fix important findings.
- [x] Commit, update main, push and verify the exact Vercel production deployment.
