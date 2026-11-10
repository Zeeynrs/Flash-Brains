# Supabase accounts, profile and learning sync

## User intent and decisions

Add a real Supabase backend, login page and profile page to Flash Brains. The user chose **Google plus email/password** and **continued guest learning, with login for progress synchronization**. Preserve the three published courses, existing learning rules, content, rewards and animation/motion controls. The concrete scope below awaits approval before implementation.

## Approaches

1. **Extend the existing application with Supabase Auth and PostgreSQL protected by Row Level Security.** Proposed: preserve the existing static ES-module frontend, hash navigation and Vercel project. This is the smallest complete implementation compatible with the selected authentication and guest workflow.
2. **Introduce an application API for every profile/progress request or migrate the frontend to another framework.** Not proposed for this release: adds an additional authorization/session layer and migration unrelated to the requested experience. Future competitive rewards or public leaderboards may justify server-side grading, which is not part of this release.

Builder choice: use a pinned, locally bundled `@supabase/supabase-js` browser SDK and its MIT license. Current npm metadata checked: 2.119.0, Node >=22 for development tooling. Keep production assets self-contained; no runtime SDK CDN. Use one small build script to emit an ignored public configuration JSON from allowlisted Vercel environment variables. No framework migration or server-side admin key is needed for normal user requests.

## Screens and account experience

- **Login:** Google button; email/password fields; links to registration, password reset and guest learning. Retain an in-app return destination when login was opened from a lesson.
- **Registration:** display name, email, password and confirmation. Require matching passwords and an agreed frontend/backend minimum of eight characters. Show a clear confirmation-email screen when email verification is required; do not pretend registration already logged the learner in.
- **Forgot/reset password:** request a recovery email, then a dedicated recovery-session form to choose and confirm a new password. Invalid/expired links receive a useful retry path. Do not expose account existence through the recovery request response.
- **Profile:** account display name, avatar, own email, joining date, total XP, streak, daily goal, completed exercises and per-course progress. The profile is private. Allow editing display name and choosing from a small original Byte/initials avatar preset set. No avatar upload, public profile, bio, social features, email change or account-deletion flow in this release.
- **Navigation:** logged-out users see Masuk/Daftar access; logged-in users see their name/avatar, Profil and Keluar. Catalog and lessons stay usable as a guest. Visiting a private profile while signed out opens login, preserving that return destination.
- Keep visual language consistent with the current application: warm light surfaces, green action color, readable Nunito, existing Byte artwork and responsive forms. Do not add a long decorative entrance to login/profile navigation. Existing course-card entrance continues for course/topic selection.

## Authentication and redirects

Use Supabase Auth for passwords and Google OAuth, persistent sessions and refresh. Configure PKCE and handle its callback **before** ordinary hash-route parsing. Use the root URL with a callback query on `https://flashbrains.site/`, so a new pathname does not depend on an unconfigured static rewrite. Clear consumed auth parameters after success; never log tokens/passwords or include them in error messages.

The Supabase Site URL is the canonical production origin. Redirect allowlists contain the exact production callback and explicit local development callback(s); do not enable unrestricted production wildcard redirects. Validate return destinations as known same-origin application routes. Never honor an arbitrary external return URL.

Authentication initializes without blocking guest content. Resolve the actual account identity before rendering private profile/progress. On sign-in, expiry, sign-out or account switching, end active lesson entrance animations, dispose interactive controls, invalidate previous account requests and redraw from the correct progress namespace. Supabase auth callbacks schedule asynchronous profile/sync work outside the auth callback itself.

Rely on Supabase's verified identity behavior for Google/email identities; do not merge different user IDs just because their email text matches. Normal logout affects the current device/session and returns to guest home. Pending requests for an old user must never update a new user's view or cache.

## Database and authorization boundary

Apply versioned additive migrations to the selected project after inspecting its current schema and environment. Proposed application tables:

1. `profiles`: `id uuid` referencing the authenticated user, bounded `display_name`, constrained `avatar_id`, and server-managed creation/update timestamps. Store no password, provider secret or duplicate email column here. Create a safe default profile idempotently for new users; initialize any approved existing app users without overwriting their chosen names.
2. `course_progress`: unique `(user_id, course_id)`, course IDs constrained to `c`, `python`, `chess`, the version-2 learning-state JSON, a non-negative revision and server-managed update timestamp. The full existing state includes learned cards, solved/awarded exercise identities, activity dates, topic sessions, queued retries, pending feedback and drafts.

Enable RLS before exposing either table. An authenticated user can select/insert/update only their own row using `auth.uid()` checks for both visibility and new values. Guests have no private-row access. Prevent changing ownership through an update. Apply explicit grants, constraints and immutable server-managed fields. Any profile-creation trigger uses a fixed search path and minimal privilege with safe metadata defaults; malformed provider names must not break sign-up.

For concurrent progress writes, use a narrowly scoped, owner-checked compare-and-swap operation: accept the expected revision, store the next valid payload only if that revision still matches, and return the updated row/revision. A stale write must return a conflict instead of silently overwriting progress. Prefer an RLS-respecting security-invoker RPC; if a narrowly scoped definer function is required, enforce `auth.uid()`, a fixed search path, and restricted execute grants explicitly. Do not expose a generic privileged SQL or admin endpoint.

Profile and statistics remain private and instructional. Client-side grading remains the existing model; this release does not claim tamper-proof competitive XP, issue valuable rewards, or introduce public leaderboards.

## Progress ownership, migration and merging

Read existing guest progress from `kartu-c-progress-v1`, `flash-brains-python-progress-v1`, and `flash-brains-chess-progress-v1` without changing its version-2 data shape. Signed-in caches and pending writes are separately namespaced by authenticated user ID and course. New guest generations use their own namespace and a current-generation pointer; old original keys and claimed snapshots are retained as migration/rollback sources, not silently re-imported. Never write account data back into guest keys or load another user's cache as a fallback. Retain a last-known-good cache and make pending sync visible.

When a learner first signs in from a browser with unclaimed guest progress, offer a concise **Simpan progres perangkat ini ke akun** action with a skip choice. This is a product ownership decision, not an automatic transfer into every account that uses that browser. Import is idempotent: durably back up and reserve the selected full guest generation for the consenting user before cloud writes, then finalize its claimed status only after all required course writes succeed. A partial import remains reserved for that user and resumes only under that identity. Never offer that source generation to another account. Do not rotate or report import success if the source backup cannot be preserved.

After a generation is reserved/claimed, the next guest entry starts a **fresh guest generation** with no borrowed prerequisites or rewards. The old full guest source is retained in its owner-tagged backup; the signed-in account retains its merged achievements. A different user can import only the new guest generation, which is independently valid from the first unit. This deliberately avoids trying to import a later-topic delta whose prerequisites belonged to another user. Refreshed/other tabs must check the active generation before writing; stale generation writes cannot modify a new guest generation.

For rollback, retain every version-2 snapshot. Before reverting to a pre-generation client, export the active guest generation back to compatible legacy-key copies through a migration bridge, preserving both source copies. Do not delete account caches or claim backups as part of disabling the backend.

Merge validated progress rather than replacing it wholesale:

- Union solved and awarded exercise identities, date activity, learned references and compatible legacy completion. XP is derived from unique awarded identities; daily totals are distinct per course/exercise/date. Never add XP counters together.
- Reuse each learning engine's validation before and after merging. Reject invalid remote payloads with an actionable sync error while retaining local progress; do not silently turn a failed merge into an empty course.
- Guest import preserves the account's existing session for a topic; import the guest session when the account has no session for that topic. Guest source data is retained, so an unfinished guest draft is not destroyed if the account already has a different draft. Tell the user that an existing account session is resumed when applicable.
- For ordinary signed-in synchronization, locally edited topic sessions take precedence during a pending write; otherwise use the fetched cloud sessions. Union untouched topic sessions. Two simultaneous edits to the **same** topic cannot combine different answers into one draft: the last successfully saved edited session wins, while solved/activity unions preserve both devices' learning achievements. Document and test this boundary.
- Use optimistic revisions and refetch/merge/retry on conflicts. Serialize writes per course, debounce draft changes briefly, and retain unsent data when offline or the server is unavailable. Retry on reconnect/focus/manual retry without creating duplicate rewards. Merge fresh cloud data before uploading when entering an account on a new device.

The active user identity is captured for every asynchronous operation. On account change, abort or disregard old fetch/write results. Never replay an A-owned pending write using B's authentication session. A pending write may resume only under its original user after that user signs back in.

Logout clears the active private view and auth session, then opens the independent active unclaimed guest generation (creating a fresh one when the previous generation was reserved/claimed). Preserve any unsent owner-tagged progress locally for that same user's next login instead of discarding answers during an outage. A refresh in guest mode cannot display the previous account's private profile or progress.

## Offline, failures and user-facing status

Guest learning remains local, including when Supabase is temporarily unavailable. A signed-in user with a validated local account cache can continue offline; display a pending-sync status and keep their identity isolated. If a new device cannot fetch an account's existing progress, show a retry/loading state rather than uploading an empty snapshot over unknown cloud data. Switching to guest learning remains available.

Registration, login, recovery and profile saves have validation, loading, success and actionable error states. Disable duplicate form submissions and duplicate OAuth starts. Profile changes are only confirmed after the server accepts them. Network failures do not erase filled non-password fields or learning progress. Treat session expiration and backend outage as different states. Do not sign the learner out merely because a progress request failed once.

## Configuration and external setup needed

- The user supplied the target project URL `https://bklsebahfuazpbhyuslh.supabase.co`, project ref `bklsebahfuazpbhyuslh`. Verify access and inspect this existing project before changing schema/configuration; do not target another project. Do not create a paid resource, upgrade a plan or change unrelated projects without explicit authorization.
- Supabase is not connected in the current tool session. The plugin was offered but remains uninstalled at the latest check. An official CLI login is an alternative when needed; never ask the user to paste privileged secrets into chat.
- Google login needs an owned Google Cloud web OAuth client with the exact Supabase callback URI, and its client ID/secret configured securely in Supabase. Do not put the client secret into frontend configuration or Git.
- Public email/password registration with confirmation and recovery needs a working production SMTP configuration. Supabase's default sender is for limited pre-authorized team addresses, not general production delivery. Inspect existing SMTP settings first. Choosing/connecting a new mail service and its sender-domain DNS are external setup dependencies; do not buy a plan or send real-user test emails without authorization.
- Public frontend configuration contains only Supabase URL, publishable key and supported-provider flags. The build script writes only these allowlisted values into the ignored generated JSON. Backend secrets stay in their owning service/environment. No service-role/admin key is shipped in the browser.
- Keep guest mode operational if backend configuration is absent in local development. Do not declare the live login feature complete or enable a broken Google button before the real providers are configured and verified.

## Verification and acceptance

1. Unit tests for auth routes and safe return destinations; guest/account storage isolation; idempotent guest import and partial-import recovery; fresh guest generations after a claim and stale-tab write rejection; valid-state union; duplicate XP/activity; same-topic session conflicts; bad remote data; revision conflicts and stale responses after account changes.
2. Database integration tests prove unauthenticated denial, user-A/user-B row isolation, ownership immutability, profile constraints and compare-and-swap behavior. Use controlled temporary test users or an isolated test database; do not treat mocked policy checks or SQL-text assertions as RLS proof.
3. Browser tests cover registration confirmation, email login failures/success, Google initiation/callback handling, recovery, profile edits, logout/account switch, guest migration choice, offline/retry, reload, cross-device progress and narrow/keyboard layouts. Never log real credentials. Coordinate a real Google OAuth smoke test with the user's own login when it cannot be automated safely.
4. Exercise C/Python/chess regressions, board/matching controls, existing animations, rewards and guest restoration. Full-suite reporting preserves visibility of the existing Windows Python CRLF baseline failure and GCC skips.
5. Prepare migrations and frontend/configuration first, verify on the selected backend, review the whole change, then push directly to `main` under the established workflow. Confirm the production deployment and real auth/sync behavior on `flashbrains.site` before claiming completion. No forced framework, paid upgrade, admin UI, subscriptions, public leaderboard or avatar-storage bucket is in scope.

## Approval and source references

The user confirmed authentication methods/guest access, selected project `bklsebahfuazpbhyuslh`, and completed the requested management login to proceed. Implementation continues within that requested scope. Existing Google/SMTP configuration remains environment setup information, not a reason to rewrite the approved learning system.

Official references checked: https://supabase.com/docs/guides/auth/managing-user-data ; https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/auth/passwords ; https://supabase.com/docs/guides/auth/social-sign-in/auth-google ; https://supabase.com/docs/guides/auth/sessions/pkce-flow ; https://supabase.com/docs/guides/auth/auth-smtp .

Builder check resolved one ownership edge: importing only a post-claim guest delta into another account could violate prerequisite validation. The design now uses a fresh independently valid guest generation after a claim, keeps the original source backup, and forbids carrying another account's prerequisites or rewards into a new guest import. No other important planning questions remained.
