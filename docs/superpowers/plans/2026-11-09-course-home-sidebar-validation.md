# Course catalog and sidebar verification

## Delivered

Added a real catalog home, one honest published course card for Pemrograman C, search/empty state, and continuation of unfinished sessions. Added a central course metadata registry; future subjects require their own real content and engine integration before publication. C overview and lessons have distinct hash routes supporting refresh and Back/Forward. Existing C state, curriculum, scoring and storage key are unchanged.

An always-visible Menu toggle opens/closes left navigation. Desktop preference is persisted independently and content expands when navigation is hidden. Mobile uses a left drawer with backdrop, close button, Escape, trapped focus, modal semantics, scroll lock and inert background. Resizing clears modal state and respects the desktop preference.

## Evidence

- Full Node/content suite: 68 passed, zero failures or skips. Five new tests cover real course metadata/counts/search and safe route parsing/builders.
- Existing all-80 exercise journey passes with every interaction, end-of-round retries, failed challenge retry, feedback reload, no XP farming and original v1 migration. The migration fixture now forces a document reload: navigating only to a different hash correctly keeps the existing JS context alive.
- Dedicated navigation browser QA passes: default catalog, real search/empty/counts, clearing and retaining queries, desktop collapse and width expansion, persisted desktop preference, opening C and topic routes, unchecked drafts, checked feedback on reload, Back/Forward, completed-summary restoration, locked/unknown deep links, and blocked storage.
- Mobile checks pass for backdrop/close/Escape, focus trap and restored toggle focus, closing on course selection, and clearing inert/modal/body lock on desktop resize.
- Catalog has no horizontal overflow at 320, 390, 640, 760, 768, 1024 and 1440px. Readable typography from the previous fix is retained. Screenshots reviewed for expanded/collapsed home, mobile drawer and C overview.
- Design inspector: zero failures and zero warnings using established cartoon-direction allowances for dimensional buttons, rounded font and colored course markers.
- JavaScript syntax and Git whitespace checks pass.

## Review

Independent review found a skip-link regression: native `#main` conflicted with hash routing and opened home. Browser regression failed before fix; skip activation now focuses and scrolls the main landmark while preserving current route, saved draft and lesson view. No other important review findings.

## Delivery

Keep the existing GitHub main → Vercel production integration and domain. No server routing changes or backend services are needed.
