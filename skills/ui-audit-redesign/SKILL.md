---
name: ui-audit-redesign
description: "Systematic workflow to audit and upgrade existing UIs from generic/AI-slop to premium quality. Scan current design, diagnose weak patterns, fix with targeted upgrades. Use when UI 'looks generic', 'feels like AI', 'needs polish', or for any redesign of existing interfaces. Triggers on: UI audit, redesign, 'sieht nach AI aus', 'wirkt generisch', 'Design verbessern', 'UI aufwerten', 'looks like a template'."
---

# UI Audit & Redesign

Systematic workflow to upgrade existing UIs from generic to premium. Based on proven anti-slop patterns from the design engineering community.

**This skill does not rewrite from scratch.** It audits what exists and applies targeted, prioritized fixes working with the existing stack.

---

## Workflow: Scan → Diagnose → Fix

### Step 1: Scan

Read the codebase first. Identify:
- Framework (React, Vue, Svelte, vanilla, etc.)
- Styling method (Tailwind, vanilla CSS, styled-components, CSS modules, etc.)
- Current design patterns and component library (if any)
- Fonts currently loaded
- Color values currently in use

### Step 2: Diagnose

Run through every section of the audit below. List every generic pattern, weak point, and missing state found.

### Step 3: Fix

Apply targeted upgrades in priority order (see Section 7). Work with the existing stack — do not introduce new frameworks or rewrite components from scratch.

---

## 1. Anti-Slop Patterns (Banned → Replacement)

These are the most common AI-generated design fingerprints. If the UI contains any of these, fix them first.

### Fonts

| Banned | Replacement Options |
|--------|-------------------|
| Inter | Geist, Satoshi, Outfit, Plus Jakarta Sans |
| Roboto | Cabinet Grotesk, General Sans, Switzer |
| Arial, Helvetica | Any of the above; for editorial: pair a serif header (e.g. Fraunces, Playfair Display) with a sans body |
| Open Sans | Same as above |
| System font stack only | Load at least one intentional typeface |

**Rule:** Every project should have at least one font that was deliberately chosen, not defaulted to.

### Colors

| Banned | Replacement |
|--------|------------|
| Purple/blue AI gradient | Neutral base + single considered accent |
| Pure `#000000` background | Off-black: `#0a0a0a`, `#121212`, or tinted dark (dark navy, dark charcoal) |
| Oversaturated accents (saturation > 80%) | Desaturate to blend with neutrals |
| More than one accent color | Pick one. Remove the rest. |
| Mixing warm and cool grays | Stick to one gray family, tint all consistently |

### Layout

| Banned | Replacement |
|--------|------------|
| 3 equal-column card row (the #1 AI layout) | 2-column zig-zag, asymmetric grid, horizontal scroll, masonry |
| Centered hero text over dark image | Asymmetric hero: text aligned left/right, image with gradient fade |
| Edge-to-edge sticky navbar | Floating nav, inset nav, or nav with max-width constraint |
| `height: 100vh` for full-screen sections | `min-height: 100dvh` (prevents iOS Safari viewport jumping) |
| Complex flexbox percentage math `calc(33%-1rem)` | CSS Grid: `grid grid-cols-1 md:grid-cols-3 gap-6` |
| Everything centered and symmetrical | Break symmetry with offset margins, mixed aspect ratios |

### Components

| Banned | Replacement |
|--------|------------|
| Generic circular spinner for loading | Skeleton loaders matching layout shape |
| `window.alert()` for errors | Inline error messages in context |
| Buttons linking to `#` | Real destinations or visually disabled state |
| Emojis as icons in UI | Proper icon set (Phosphor, Radix Icons, Lucide) |

---

## 2. Typography Audit

Check for these problems and fix them:

| Problem | Fix |
|---------|-----|
| Headlines lack presence | Increase size, tighten `letter-spacing` (negative tracking), reduce `line-height` |
| Body text too wide | Limit to ~65 characters (`max-w-prose` or `max-width: 65ch`) |
| Only Regular (400) and Bold (700) used | Introduce Medium (500) and SemiBold (600) for subtle hierarchy |
| Numbers in proportional font | Use `font-variant-numeric: tabular-nums` for data-heavy interfaces |
| Missing letter-spacing adjustments | Negative tracking for large headers, positive for small caps/labels |
| All-caps subheaders everywhere | Try sentence case, lowercase italic, or small-caps instead |
| Orphaned words on last line | `text-wrap: balance` (headings) or `text-wrap: pretty` (body) |
| Same font size for everything | Apply modular type scale: 12, 14, 16, 20, 24, 30, 36px |
| Headings with relaxed line-height | Headings: `line-height: 1.0–1.25`. Body: `line-height: 1.5–1.75` |

---

## 3. Color & Surface Audit

| Problem | Fix |
|---------|-----|
| Pure `#000` or `#fff` backgrounds | Use off-black (`#0a0a0a`) or warm white (`#fafafa`, `#fdfbf7`) |
| Generic `box-shadow` with pure black | Tint shadows to match background hue (dark blue shadow on blue bg) |
| Flat design with zero texture | Add subtle noise, grain, or micro-patterns (`opacity: 0.03`) |
| Perfectly even gradients | Radial gradients, noise overlays, or mesh gradients instead of linear 45deg |
| Inconsistent lighting direction | Audit all shadows for a single consistent light source |
| Random dark section in light page | Either commit to full dark mode or use a slightly darker shade of the same background |
| Text contrast too low | Body text minimum 4.5:1 ratio; use `#374151` (gray-700) on white, not lighter grays |
| Too many colors competing | Reduce to one primary + one accent + neutral grays. Consistency beats variety. |

---

## 4. Layout & Spacing Audit

| Problem | Fix |
|---------|-----|
| No max-width container | Add constraint (1200–1440px) with `mx-auto` |
| Uniform border-radius on everything | Vary radius: tighter on inner elements, softer on outer containers |
| No overlap or depth | Use negative margins for layering and visual depth |
| Symmetrical vertical padding | Adjust optically — bottom padding often needs to be slightly larger |
| Dashboard always has left sidebar | Consider top nav, floating command menu, or collapsible panel |
| Dense layout without breathing room | Double the spacing. Let the design breathe. |
| Cards of equal height forced by flexbox | Allow variable heights or use masonry when content varies |
| Content stretches edge-to-edge on wide screens | Constrain with `max-w-7xl mx-auto` or similar |
| Arbitrary spacing values (13px, 17px) | Use consistent scale: 4, 8, 16, 24, 32, 48, 64px |

---

## 5. Interactive States Audit (Non-Negotiable)

Every interactive element must have ALL of these states. Missing states make a UI feel unfinished.

| State | What to check |
|-------|--------------|
| **Default** | Clear affordance that the element is interactive |
| **Hover** | Background shift, slight scale, or translate. Not just color change. Gate behind `@media (hover: hover)` |
| **Active/Pressed** | `scale(0.98)` or `translateY(1px)` to simulate physical click |
| **Focus** | Visible focus ring for keyboard navigation (never `outline: none` without replacement) |
| **Loading** | Skeleton loaders matching layout shape, not generic spinners |
| **Empty** | Designed "getting started" view, not blank screen |
| **Error** | Clear inline error messages, not `alert()`. Explain what went wrong and how to fix it. |
| **Disabled** | Visually muted with `cursor: not-allowed`. Prefer keeping buttons enabled + validation on submit |
| **Current/Active (nav)** | Active nav link styled differently so users know where they are |

### Transitions for state changes

- All hover/focus/active transitions: 150–250ms with `ease-out`
- Never instant state changes without interpolation
- Animations on `top`/`left`/`width`/`height` → switch to `transform` + `opacity`
- Add `scroll-behavior: smooth` for anchor links (no jump-scrolling)

---

## 6. Responsive & Technical Audit

| Problem | Fix |
|---------|-----|
| No mobile consideration | Every layout must collapse gracefully below 768px |
| `h-screen` for full sections | `min-h-[100dvh]` to prevent iOS Safari jumping |
| Hover-only interactions | Ensure touch equivalents exist |
| No `prefers-reduced-motion` respect | Wrap animations in `@media (prefers-reduced-motion: no-preference)` |
| Images without lazy loading | Add `loading="lazy"` to below-fold images |
| No alt text on images | Add descriptive alt text; decorative images get `alt=""` |
| Animations using layout properties | Only animate `transform` and `opacity` |
| `backdrop-blur` on scrolling content | Only apply to fixed/sticky elements |

---

## 7. Fix Priority Order

Apply fixes in this order — each step builds on the previous one:

| Priority | Action | Impact |
|----------|--------|--------|
| 1 | **Font swap** | Biggest instant improvement, lowest risk |
| 2 | **Color palette cleanup** | Remove clashing/oversaturated colors, establish gray family |
| 3 | **Hover and active states** | Makes the interface feel alive and responsive |
| 4 | **Layout and spacing** | Proper grid, max-width, consistent padding scale |
| 5 | **Replace generic components** | Swap cliche patterns (3-col cards, circular spinners) |
| 6 | **Add missing states** | Loading, empty, error states make it feel finished |
| 7 | **Typography polish** | Letter-spacing, weight variation, `text-wrap: balance` |

---

## 8. Pre-Output Checklist

Before delivering the redesigned code, verify:

- [ ] No banned fonts, colors, layouts, or components from Section 1 remain
- [ ] Typography uses at least 3 font weights (400, 500/600, 700)
- [ ] Color palette has one accent, consistent gray family, no oversaturation
- [ ] Spacing follows a consistent scale (4/8/16/24/32/48/64)
- [ ] All interactive elements have hover + active + focus states
- [ ] Layout has a max-width container — nothing stretches infinitely
- [ ] `min-h-[100dvh]` instead of `h-screen` for full-height sections
- [ ] CSS Grid instead of flexbox percentage math for multi-column layouts
- [ ] All transitions use `ease-out`, 150–250ms, on `transform`/`opacity` only
- [ ] `@media (hover: hover)` gates hover animations
- [ ] Loading, empty, and error states exist
- [ ] Text contrast meets WCAG AA (4.5:1 for body, 3:1 for large text)
- [ ] The overall impression reads as intentionally designed, not AI-generated

---

## Review Format

When presenting audit findings, use a Before/After/Why table:

| Before | After | Why |
|--------|-------|-----|
| Inter font everywhere | Geist for UI, Fraunces for headings | Inter is the #1 AI font fingerprint |
| Purple gradient hero | Warm white bg + single teal accent | Purple gradient = instant AI detection |
| 3 equal-column cards | Asymmetric bento grid | Equal columns = most generic layout pattern |
| No hover states | `scale(1.02)` + shadow shift on hover | Interface must feel alive |
| `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` | `box-shadow: 0 4px 12px rgba(15,23,42,0.08)` | Tinted shadows feel more natural |

---

## Attribution

This skill synthesizes design audit principles from the Taste Skill (Leonxlnx), Impeccable.style, and the Redesign Skill community approaches for upgrading AI-generated UIs to premium quality.
