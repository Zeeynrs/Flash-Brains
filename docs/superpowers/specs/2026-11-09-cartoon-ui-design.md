# Flash Brains — colorful cartoon UI

User requests a full UI/UX redesign: colorful, responsive, cartoon animation inspired by Duolingo. Existing 80 exercises, rewards, retries, daily goals and saved progress remain the product's foundation.

## Direction

Use a playful learning-game interface with rounded Nunito type, bright leaf-green actions, violet XP, warm orange streak and blue course accents. Use a light canvas, generous controls, dimensional button bases, a curved topic route, clear course metadata and a right-hand coaching/goal column on larger screens. Build an original violet code creature named Byte as inline SVG, with blinking eyes, gentle idle motion and short success/retry reactions. Reference: https://blog.duolingo.com/shape-language-duolingos-art-style/.

The user's explicit colorful cartoon direction supersedes the previous editorial/neutral app art direction. Keep accessibility principles: readable contrast, semantic text/status, real figures, touch and keyboard controls, internally scrolling code and reduced-motion support.

## Approaches

1. Restyle the current DOM only: quick, but preserves the old editorial layout rather than a full redesign.
2. Recompose presentation with a course path, original character and redesigned lesson controls while retaining the tested state/grading engine: selected as it meets the requested scope.
3. Introduce a UI framework or animation runtime: unnecessary for these interactions; retain the existing dependency-free stack.

## Screens

- Home: course/reward header, current lesson invitation with Byte, linked curving topic nodes and accurate completion ticks; daily target and coach cards alongside on desktop and below/above the path on phones.
- Lesson: progress first, prominent prompt, seven consistently styled answer types, animated character coach, distinct correct/retry feedback and a clear next action. Original reference material stays available.
- Completion: original celebratory character, small confetti accents, earned XP and honest session figures, next-topic action.
- Mobile: compact top bar and course menu, readable single-column exercises, no horizontal page overflow or clipped matching answers.

## Behavior and boundaries

Keep state.js, curriculum.js, quizzes.js and grading semantics intact. Presentation may measure node positions to draw the decorative SVG route. Keep stable existing action hooks and labels for QA. Correct/retry animations are brief and decorative, not delaying input. Honor prefers-reduced-motion; no audio, new accounts, or external services. All existing saved data remains valid.

Provide a visible animation pause/resume control in navigation, with an independent persisted browser preference. The operating system reduced-motion preference takes precedence. Pausing never changes quiz progress, and remains usable when storage is unavailable.

## Verification and delivery

Run existing 63 tests, all-seven-type browser flow, draft/reload tests and original-progress migration. Review desktop/tablet/mobile screenshots and feedback/summary states; check 320–1440px widths, short viewports, keyboard menu controls and reduced motion. Review then update the already authorized GitHub/Vercel production site at the same subdomain.
