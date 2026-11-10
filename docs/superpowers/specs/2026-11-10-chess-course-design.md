# Chess course and puzzles for Flash Brains

## Intent and authorization

The user wants a chess course with short, progressive lessons in the same spirit as the existing learning experience. They selected courses and puzzles first, rather than playing against a bot. Reuse the catalog, course path, lesson sessions, retries, XP, daily goal, streak, storage, sidebar and study-desk entrance animation. The user approved this concrete first release on 2026-11-10.

## Approaches

1. Native course and interactive puzzles inside Flash Brains. This is the direction selected when the user chose “kursus dan puzzle dahulu.” It keeps progress, explanations and rewards in the existing application.
2. A separate chess game, bot or embedded third-party trainer. Excluded from this release because it introduces a different learning/game flow and is outside the selected scope.

Implementation choice proposed by the builder: retain buildless browser ES modules and use the verified npm release `chess.js` 1.4.0, licensed BSD-2-Clause, for legal moves and check/checkmate detection. Vendor its browser ESM distribution and license under `kartu-c/dist/vendor/`; no runtime CDN, account, backend, chess AI or framework is required. The alternative of implementing special-move legality ourselves adds correctness risk without improving this course.

## Release boundary

Add a third available course, `chess`, titled “Catur,” with eight ordered units and ten exercises per unit. Ten per unit preserves the current engine and UI contract. The first nine are practice; the tenth is the existing final challenge. Propose these units:

1. **Kenalan dengan papan** — colors, coordinates, starting positions and piece recognition.
2. **Benteng dan gajah** — straight/diagonal moves, occupied paths and captures.
3. **Menteri dan kuda** — combined movement and knight jumps.
4. **Langkah pion** — one/two-square advances, diagonal capture and promotion.
5. **Raja dan skak** — king movement, attacked squares and escaping check.
6. **Langkah khusus** — castling prerequisites and immediate en passant.
7. **Taktik sederhana** — undefended pieces, capture targets and knight forks.
8. **Skakmat satu langkah** — legal mate versus check or stalemate, then a final puzzle.

The unit titles, 80-exercise size, single-move puzzles and beginner audience are builder proposals, not additional user requirements. Stop at this coherent course; do not add a bot, full matches, multiplayer, ratings, leaderboards, timers, accounts, generated puzzles, move analysis or multi-move opponent replies.

## Learning and exercise model

Author original Indonesian prompts, explanations and optional hints. Combine existing multiple-choice questions with two new board interactions: choose a square and make one legal move. Each unit includes board practice; later units emphasize moves and mate puzzles. Each unit also has five concise reference cards, following the existing content shape.

Board exercises store a FEN position, side-to-move, task mode and answer specification. Board drafts use a square (`e4`) or UCI move (`e2e4`, `a7a8q`) string. A selected source square is transient UI state, not a completed answer. Only a completed legal move can enable checking a move exercise.

For an exact instructional target, list every correct answer that satisfies the prompt. For mate-in-one exercises, accept **any legal move that actually gives checkmate**, rather than only a single authored key. Keep a validated canonical example for the answer explanation. Do not accept merely giving check or causing stalemate as mate. Avoid vague “best move” questions without a provable objective.

All move positions contain both kings and valid turn/castling/en-passant data. They must not put kings next to each other or begin with the non-moving king illegally in check. Validate authored keys with the rules library. Author en-passant examples from real legal move sequences, rather than inventing incompatible FEN rights. Validate all board positions and mate claims in tests before publication.

## Board interaction

Use a responsive 8×8 board with original SVG piece drawings, coordinate labels, white at the bottom and clear side-to-move text. Keep the board visually consistent with the application, using warm cream and muted green squares and readable ivory/dark pieces. Include a gold course accent and a chess symbol in catalog/sidebar/entrance art.

Click/tap a piece, then its destination. Offer equivalent keyboard operation with arrow keys to move square focus and Enter/Space to select. Show the selected square, legal destinations and last move. An illegal destination must not modify the position, create a draft, submit a wrong attempt or change rewards; announce why the action could not proceed. A complete legal move updates the board preview and persists its draft. The user can reset the position and choose a different answer before pressing “Periksa jawaban.”

Promotion requires an explicit choice among queen, rook, bishop and knight; do not silently force a queen. The rules library handles king safety, castling, castling through attacked squares and en passant. Never allow a king to be captured.

Keep answer checking explicit and consistent with other courses. After checking, lock the board, show the actual submitted position, the normal correct/incorrect feedback and an explanation. A wrong answer also shows a readable canonical correct move. Use a polite live status for selection, move, promotion and errors. Hints are authored text, reveal only on request, do not change scoring and are separate from the legal-destination markers.

Animate moved pieces briefly and smoothly; preserve board geometry and honor the application’s pause/reduced-motion choice. Dragging is not required for this release: touch, mouse and keyboard must all work without it. Keep every square usable at 320px viewport width and avoid page overflow.

## State and shared engine integration

Register chess content and a learning-engine instance with storage key `flash-brains-chess-progress-v1`. Keep existing C and Python keys, sessions and migrations intact. Add only the board answer validation/grading and draft validation needed at the existing seams; avoid a separate duplicate rewards/session engine.

Unchecked board drafts, submitted feedback, retry queues and course switching survive reload. Rebuild the preview deterministically from the exercise FEN and stored draft. Treat illegal, malformed or unrelated persisted moves as invalid input using the existing restoration policy. No XP may be gained from illegal moves, incomplete promotions, duplicate submissions or reviewing an already-awarded exercise. Chess exercises count toward the shared daily goal and streak with the current distinct-per-day rule.

Make catalog/search counts, available-course copy and integration tests account for the third course. Remove programming-only instructional copy from the chess course and avoid exposing fields such as a C/Python code standard there. Retain reference notes and existing course behavior. The entrance animation must show the chosen chess course/topic and a chess emblem, while all its Skip/Back/focus/motion behavior remains intact.

## Verification and acceptance

- Focused rules tests: basic moves, blocked paths, own-piece capture rejection, king safety, castling through check, en passant timing, promotion including underpromotion, mate versus stalemate, and alternate mating answers.
- Content validation: 8 units, 80 unique exercises, reference cards and all authored FENs/keys legal; executable assertions for claims that a move gives check, captures a target or mates.
- State integration: fresh learner can complete all 80; drafts/pending feedback/retries restore; chess state is isolated from C/Python; reward aggregation and no XP farming remain correct.
- Browser QA: catalog/path/entrance; board tap and keyboard; legal/illegal moves; promotion; reset; hints; wrong-answer retry; correct completion; reload and cross-course switching; reduced motion; 320px mobile and desktop layouts.
- Run the existing full suite and report baseline issues separately. The current Windows baseline has one unrelated Python stdout LF/CRLF comparison failure in `tests/python-content.test.js:84`, and C compilation tests skip when GCC is unavailable. This feature does not require changing those tests to conceal failures.
- Review the completed change, then commit and push directly to `main`, following the user’s established delivery preference. Verify production status for the existing Vercel project; use the already-connected `flashbrains.site` domain.

## References checked

- Rules: https://handbook.fide.com/chapter/e012023
- Library/API: https://github.com/jhlywa/chess.js and https://github.com/jhlywa/chess.js/blob/master/website/docs/index.md
- npm metadata checked for version 1.4.0 and BSD-2-Clause license before selecting the local dependency.

## Approval

Approved by the user with “ya” on 2026-11-10. Implement and validate this course and release boundary, then push directly to main under the established workflow.
