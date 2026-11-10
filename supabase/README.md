# Flash Brains accounts

Project: `bklsebahfuazpbhyuslh` (Flash Brains), frontend: https://flashbrains.site.

## Current status

Private profiles and revision-checked course progress are configured. Email/password login, optional guest learning, explicit guest import, profile editing, recovery handling and sync are implemented. Google and public signup/recovery stay gated until the owner configures Google OAuth and production email. Email confirmation remains enabled.

## Google Login — owner setup

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview) and select/create the Flash Brains project.
2. Configure Branding and Audience. Start with External / Testing and add your own Google account as a test user. Use only `openid`, email and profile scopes.
3. Under Clients create an OAuth client, type **Web application**.
4. Authorized JavaScript origin: `https://flashbrains.site`.
5. Authorized redirect URI: `https://bklsebahfuazpbhyuslh.supabase.co/auth/v1/callback`.
6. Open [Supabase Authentication](https://supabase.com/dashboard/project/bklsebahfuazpbhyuslh/auth/providers), choose Google, enable it, and enter the Client ID and Client Secret directly there. Save. Do not put the secret in Git, Vercel public variables or chat.
7. After a real Google login succeeds, set Vercel `SUPABASE_GOOGLE_ENABLED=true` and rebuild. Before public launch, configure Google Audience for production and complete any requested branding/domain verification.

The Supabase Site URL is already `https://flashbrains.site`; frontend callback is the canonical root. Development redirects allow only localhost/127.0.0.1 port 5173, not arbitrary preview hosts. See [official Google setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

## Confirmation/reset email — Resend setup

1. Create/sign in to [Resend](https://resend.com), add `flashbrains.site` as a sending domain, and select a region.
2. In Hostinger's DNS editor add the **exact records Resend provides**, then verify the domain in Resend. Preserve existing website and mailbox records. The generated DKIM/SPF records are specific to the domain/region; do not guess their values.
3. Create a sending API key in Resend. Keep it private.
4. In Supabase, Authentication → Notifications → Email → SMTP Settings, enable custom SMTP:

   | Field | Value |
   |---|---|
   | Sender email | `noreply@flashbrains.site` (verified domain) |
   | Sender name | `Flash Brains` |
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | Your Resend API key, entered directly in Supabase |

5. Save, then test signup confirmation and password reset with your own real inbox. Open PKCE email links in the same browser/device that requested them. Keep confirmation enabled.
6. Once delivery and redirects work, set Vercel `SUPABASE_EMAIL_DELIVERY_READY=true` and rebuild. Check Supabase Auth email rate limits for the intended usage.

Sources: [Resend SMTP for Supabase](https://resend.com/docs/send-with-supabase-smtp), [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## Build and deployment

The Vercel build executes `node scripts/build-public-config.mjs`. It writes ignored `kartu-c/dist/backend-config.json` using only these allowlisted variables:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | `https://bklsebahfuazpbhyuslh.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Public publishable key (never service role) |
| `SUPABASE_GOOGLE_ENABLED` | `false` until provider verified |
| `SUPABASE_EMAIL_DELIVERY_READY` | `false` until delivery verified |

Without public config the app remains usable as a guest and shows accounts unavailable. For local development set these variables, run the build script from the repo root, then serve `kartu-c/dist` on port 5173.

SDK: vendored `@supabase/supabase-js` 2.119.0, bundled as browser ESM with esbuild 0.25.12; see `dist/vendor/SUPABASE-LICENSE.txt`. No remote runtime CDN dependency.

## Database and proof

Migrations are additive, in order. Profiles expose only the owner's row. Profile update grants cover name/avatar only. Course writes use `save_course_progress`, deriving the owner from `auth.uid()` and rejecting stale revisions with HTTP409 / `PT409`. Direct authenticated/anonymous progress writes are denied. SQL validates basic shape/size; the course engine validates content/session invariants before merging cloud data. This is private learning storage, not an anti-cheating leaderboard.

Run `node scripts/test-supabase.mjs` with `FLASH_BRAINS_TEST_CONFIG` pointing to an **external private JSON file** containing `url`, `publicKey`, `adminKey`. The test creates two controlled `example.invalid` users without sending email, proves own/cross-owner/anonymous access, constrained profile edits, CAS concurrency and invalid-state rejection, then deletes only its fixture users. Never commit that file. No Docker/psql is required for this REST integration proof.

Local tests: `cd kartu-c; npm test`. Run `node scripts/test-accounts-browser.cjs` against the local server on port 5173 with the same private credentials file and Playwright installed. If Playwright is installed outside the repo, set `FLASH_BRAINS_PLAYWRIGHT_MODULE` to its absolute module directory. This creates only controlled fixture users and tests actual UI login/import/profile/reload/offline/account-switch/recovery guards. Screenshots go to the system temporary directory. The existing Windows Python newline assertion fails on CRLF; C compiler tests skip if GCC is missing.

## Local data and rollback

Guest originals remain at existing course keys until explicitly claimed. Import uses a Web Lock and **one atomic journal write** containing backup, owner and next independent guest generation. Backups remain under `flash-brains-accounts-v1:journal-v2`; incomplete imports resume only for their owner. New guest generations start independently. User/course caches and pending edits are separate from guests and other accounts. Clear browser data only if you intend to remove these local backups.

A frontend rollback does not require deleting backend tables or users. Preserve all account keys. The older frontend only understands the original guest course keys; to export a later guest generation, first back up originals, then copy that generation's engine-validated v2 course snapshots to those keys. Do not export signed-in user data automatically into guest keys. Re-enable the account frontend to resume cloud sync.
