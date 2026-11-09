# Course Home and Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task-by-task.

**Goal:** Provide a general course homepage and an accessible collapsible sidebar.
**Architecture:** Add course metadata and pure hash-route helpers, keep C's learning state unchanged, extract sidebar behavior into its own controller, and render catalog/course/lesson views in the current ES-module app.
**Tech Stack:** Existing HTML/CSS/JS, localStorage, hash routing, inline SVG.
**Spec:** docs/superpowers/specs/2026-11-09-course-home-sidebar-design.md

## Global Constraints
- Preserve 80 C exercises, existing state key, rewards, migration and readable cartoon UI.
- Only actual published content may be shown as available.
- Desktop sidebar preference is separate from quiz progress; mobile closes on navigation.
- No backend, framework migration or new subject content in this request.

## Review Focus
- Back/Forward and deep links must not reset a finished or unfinished session.
- A collapsed sidebar must be absent from keyboard and accessibility navigation.
- Mobile modal state must clear correctly on close/navigation/resize.
- Search results and course counts must be derived from registry data.
- Larger text and drawer controls must fit narrow and short viewports.

### Task 1: Catalog and route contracts
Files: dist/courses.js, navigation.js, tests/navigation.test.js.
- [x] Write failing tests for course metadata, search, route builders/parser and malformed hashes.
- [x] Implement small explicit metadata and route modules; verify focused tests.

### Task 2: Sidebar and page integration
Files: dist/sidebar.js, catalog-view.js, app.js, index.html, catalog.css.
- [x] Implement desktop collapse persistence and accessible mobile drawer.
- [x] Separate general catalog from C overview, add hash navigation and preserve lesson state.
- [x] Render real course search, continuation and current C metadata; document extension point.

### Task 3: Verify and ship
- [x] Run full tests, catalog/sidebar navigation browser checks and complete C quiz journey.
- [x] Inspect responsive screenshots and obtain independent review; fix important issues.
- [x] Commit, update main, push and inspect exact Vercel production deployment.
