# Supabase Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Implement in this session with one independent whole-change review.

**Goal:** Add Google/email authentication, private profiles and safe optional cloud learning sync to the existing guest-capable app.
**Architecture:** Keep the static ES-module application. Supabase Auth supplies identity; RLS tables and a revision-checked RPC persist profiles/course state. A scoped local store and sync controller isolate guest generations and users. Forms/profile are separate view modules.
**Tech Stack:** Existing browser JS/CSS, locally bundled Supabase JS, additive Postgres SQL migrations, Node tests, real Supabase integration tests, browser QA.
**Spec:** `docs/superpowers/specs/2026-11-11-supabase-accounts-design.md`

## Global Constraints

- Target only existing project `bklsebahfuazpbhyuslh` (`flashbrains`). No paid resource or plan changes.
- Google plus email/password; guests retain access to all lessons.
- Preserve C/Python/chess data and rules; no public leaderboard, uploads, admin UI or framework migration.
- Public build configuration contains only project URL, publishable key and provider flags. No admin key/password/token in Git or frontend.
- User-owned rows and revision-checked writes; real RLS proof, not mocked policy assertions.
- Account-switch requests cannot apply another user's data; migration is explicit, idempotent and backed up.
- Preserve unsent work on outages, and distinguish sync errors from sign-out.
- Direct-main commit/push remains authorized after verification; do not claim unavailable providers work.

## Review Focus

1. Old user fetch/write results after logout/switch must be discarded, including delayed conflict retries.
2. Claimed guest state must not become another account's prerequisites or XP; reserve full generations and rotate guest namespaces.
3. Concurrent course writes must union achievements, preserve active drafts and retry CAS conflicts without lost local edits.
4. OAuth/recovery callbacks must be consumed before hash navigation and only redirect internally.
5. Users A/B and unauthenticated clients must fail cross-owner DB reads/changes; malformed payloads and profile fields must be rejected.

## Task 1 — Backend schema and live configuration

Files: `supabase/migrations/202611110001_accounts.sql`, `scripts/test-supabase.mjs`, `scripts/build-public-config.mjs`, `supabase/README.md`.
- [x] Inspect public schema/user count and sanitized provider/SMTP flags. Back up configuration privately before additive changes.
- [x] Write failing RLS/CAS integration checks against controlled fixture users; apply additive tables/RPC/policies then verify own versus cross-owner access and revisions.
- [x] Configure canonical Site URL/callback allowlist and email policy without weakening unrelated security settings.
- [x] Obtain only public frontend configuration; document any missing Google/SMTP setup for the user's action.

## Task 2 — Local ownership and validated state merge

Files: `dist/account-store.js`, `dist/progress-sync.js`, `tests/account-store.test.js`, `tests/progress-sync.test.js`; expose an explicit validation seam in `learning-state.js` without changing restore fallback behavior.
- [x] Test first: guest legacy load; user cache isolation; reserved import backup; fresh guest rotation; stale generation guard; same-course reward/date unions and session precedence.
- [x] Implement storage facade mapping logical course keys to guest/user physical keys. Preserve legacy snapshots, owner backups and pending writes.
- [x] Implement validated monotonic merge and per-course serialized CAS sync, including dirty-topic tracking and network/account epochs.
- [x] Test stale responses, in-flight local edits, conflicts, bad cloud data, reconnect and identity changes.

## Task 3 — Authentication and private account views

Files: `dist/backend.js`, `dist/account-view.js`, `dist/account.css`, local vendor Supabase runtime/license, route tests.
- [x] Add failing route/form behavior tests; locally bundle pinned SDK and allowlisted public configuration.
- [x] Implement Google/email registration/login/recovery/logout and session events with safe callbacks and local return destination.
- [x] Build profile, edit name/avatar presets, private stats/course progress and explicit guest import controls.
- [x] Validate all form/loading/error paths and callback/recovery/session expiry states.

## Task 4 — Shared app wiring and browser proof

Files: `app.js`, `navigation.js`, `index.html`, sidebar/account styling, package/vercel build command, docs.
- [x] Integrate auth navigation and scoped stores; switch all three course states atomically on identity change and dispose active UI/entrance.
- [x] Persist locally first, synchronize asynchronously, show sync/retry status, and restore guest home on logout.
- [x] Browser tests: private route, login/profile/logout, account A/B, guest import, reload, offline/retry, Google callback, recovery, mobile/keyboard; three-course and animation regressions.
- [x] Verify live backend with controlled users. Real Google login and delivery tests remain pending owner OAuth/SMTP setup; the frontend gates those providers.

## Task 5 — Review and release

- [x] Run full suite; keep baseline Windows Python CRLF and missing-GCC skips explicit.
- [x] Independent whole-change review, resolve findings, inspect secret-free diff and RLS proof.
- Set Vercel public env configuration, then commit/push main and verify production SHA/status. Final release evidence is recorded in the execution ledger and response; external providers remain gated.

## Execution ledger

- User requested backend/login/profile, selected Google+email and guests, supplied exact project URL and completed CLI authorization. Proceed under this authorization rather than asking again about unchanged scope.
- Current main checkout is clean except the authored design document; preserve direct-main workflow.
- Supabase management login verified; project name flashbrains, status ACTIVE_HEALTHY, auth user count initially 0. CLI v3 supports remote SQL and configuration inspection. Docker/psql are unavailable locally; use controlled remote integration proof and rollback fixture work.

## Verification evidence

- Real hosted REST checks pass: two fixture users, own/cross-owner/anonymous access, profile constraints, concurrent CAS, invalid payloads; fixtures removed. All three additive migrations recorded as applied.
- 14 account unit tests pass; full suite 106 tests: 64 pass, 1 pre-existing Python CRLF failure, 41 GCC skips.
- Real browser account proof passes: profile/avatar/reload, guest import without duplicate XP, offline/reconnect, A/B isolation, delayed logout, recovery identity changes, invalid callback cleanup and mobile layout. Existing matching/sidebar/entrance/chess browser regressions pass.
- Independent review findings fixed with regression evidence: atomic guest claim journal under Web Locks; repeated import generations and generation-bound completion; recovery identity binding; delayed logout epoch guard. Final reviewer reports no remaining blockers.
- Google OAuth and SMTP are absent. Owner requested guidance; `supabase/README.md` gives exact Google callback and Resend/Hostinger DNS steps. No signup/Google success claim until provider setup and real inbox tests.
