# Course home and collapsible sidebar

User requests a closable left sidebar and a separate home page because future lessons will extend beyond C. Keep the established colorful cartoon style and newly enlarged typography.

## Scope and approach

Add a course catalog homepage, a small central course registry, and hash-based navigation for home, C overview and C topic sessions. Reuse the complete existing C lesson engine and its browser storage. Current published content remains one course, Pemrograman C, with eight topics and 80 exercises. Do not fabricate other courses or add admin/backend/content-generation features. Future course metadata belongs in the registry; new learning content needs its own provider/engine integration before being marked available.

Alternative considered: keep one C page with a decorative Home button. Rejected because the user explicitly wants a real general home. A framework/server router is unnecessary: hash routes support refresh and browser Back/Forward with current static Vercel hosting.

## Navigation

- `#/`: general catalog and current-course continuation, searchable actual course metadata, a truthful course card and a non-interactive invitation for future lessons.
- `#/pelajaran/c`: existing C overview/path.
- `#/pelajaran/c/topik/<topic>`: saved C lesson session or its completion summary. Invalid/locked deep links return to a safe page.
- Brand and Beranda always return to catalog; Peta belajar inside C returns to its overview.
- Preserve unfinished drafts, feedback and retries when navigating. Explicitly opening a completed topic starts a review; Back/Forward restores saved completion without silently starting a new session.

## Sidebar

Always-visible header menu toggle opens/closes left navigation on all viewports. Desktop collapse expands content and is remembered with a separate storage preference. Mobile uses a left drawer, backdrop, close button, Escape, trapped keyboard focus, background scroll lock and inert main content. Navigation closes the mobile drawer; resizing clears the mobile modal state. Preference/storage failures must not interrupt learning.

Catalog sidebar lists available courses without showing C's eight topics as global subjects. Inside C, show its topic navigation as well. Keep animation pause control and progress honest.

## Checks and delivery

Unit-test catalog data/search and route parsing. Browser-test default home, opening course, all seven exercise types, reload/Back/Forward, locked deep links, saved draft/feedback, desktop collapse persistence and content expansion, mobile backdrop/Escape/focus trap, resizing, blocked storage and 320–1440px overflow. Keep readable fonts. Review then update existing GitHub/Vercel production deployment and domain.
