## 16) Accessibility (Non-Negotiable for User-Facing UI)

### Core Principles (WCAG 2.1 AA Minimum)

- **Semantic HTML first**: Use native HTML elements (`<button>`, `<nav>`, `<main>`, `<table>`, `<label>`) before reaching for `<div>` or `<span>` with ARIA roles.
- **Keyboard navigable**: Every interactive element must be reachable and operable via keyboard alone. Never remove focus outlines (`outline: none`) without providing a visible alternative.
- **Labels and ARIA**: Every form input must have an associated `<label>`. Use `aria-label` or `aria-labelledby` only when a visible label is not possible.
- **Alt text**: Every `<img>` must have an `alt` attribute. Decorative images use `alt=""`. Informative images describe the content.
- **Colour contrast**: Text must meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text). Never convey information through colour alone.
- **Focus management**: After navigation, modal open/close, or dynamic content changes, move focus to the appropriate element.

### Anti-Patterns to Reject

- Custom widgets when a native HTML element does the job.
- Hover-only interactions without keyboard/touch equivalents.
- Colour as the sole indicator of state (error = red only, success = green only).
- Disabled buttons without explanation — prefer keeping buttons enabled and showing validation on submit.
- Auto-playing media without user consent.