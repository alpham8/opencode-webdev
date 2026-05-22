---
name: ui-animation-engineering
description: "Production-grade UI animation decisions: timing, easing, springs, transform-origin, interruptibility, stagger patterns, and perceived performance. Use when reviewing animations, building micro-interactions, or when UI 'feels sluggish/wrong'. Triggers on: animation review, motion design, dropdown/modal/toast animation, 'feels slow', 'animation wirkt falsch', micro-interactions, hover/active states."
---

# UI Animation Engineering

Based on Emil Kowalski's design engineering philosophy. Every animation decision must be intentional — unseen details compound into interfaces people love without knowing why.

## Core Philosophy

### Taste is trained, not innate

Good animation is not personal preference. It is a trained instinct: the ability to recognize what elevates an interaction. Study why the best interfaces feel the way they do. Reverse engineer animations. Inspect interactions. Be curious.

### Unseen details compound

Most details users never consciously notice. That is the point. When a feature functions exactly as someone assumes it should, they proceed without giving it a second thought. That is the goal.

### Beauty is leverage

People select tools based on the overall experience, not just functionality. Good defaults and good animations are real differentiators.

---

## 1. Frequency Rule (Non-Negotiable)

The frequency of an action determines its animation budget:

| Frequency | Animation Budget | Example |
|-----------|-----------------|---------|
| Hundreds of times/day | **None or drastically reduced** | Keyboard shortcuts, hover effects, list navigation |
| Tens of times/day | Standard, fast animation | Opening modals, toggling states |
| Occasional | Can add character | Toasts, feedback confirmations |
| Rare/first-time | Can add delight | Onboarding, celebrations, feedback forms |

**Never animate keyboard-initiated actions.** These actions are repeated hundreds of times daily. Animation makes them feel slow and disconnected.

Raycast has no open/close animation. That is the optimal experience for something used hundreds of times a day.

---

## 2. Duration Table

**Rule: UI animations must stay under 300ms.**

| Element | Duration |
|---------|----------|
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing/explanatory | Can be longer |

A 180ms dropdown feels more responsive than a 400ms one. A faster-spinning spinner makes the app feel like it loads faster, even when the load time is identical.

---

## 3. Easing Rules

| Context | Easing | Why |
|---------|--------|-----|
| UI elements entering/appearing | `ease-out` or custom curve | Instant visual feedback, then settles |
| UI elements exiting/disappearing | `ease-in` (short) or `ease-out` (if snapping away) | Exits should feel quick, not linger |
| Hover/press feedback | `ease-out` | Immediate response to user action |
| Marketing/decorative | Custom cubic-bezier | Character and brand expression |

**Never use:**
- `linear` for UI interactions (feels robotic)
- `ease-in` for appearing elements (feels sluggish — user sees slow start)
- `ease-in-out` as a default (the slow start adds unnecessary perceived delay)
- `transition: all` (specify exact properties: `transition: transform 200ms ease-out`)

**Perceived performance:** `ease-out` at 200ms *feels* faster than `ease-in` at 200ms because the user sees immediate movement.

---

## 4. Spring Animations

Springs feel more natural than duration-based animations because they simulate real physics. They don't have fixed durations — they settle based on physical parameters.

### When to use springs

- Drag interactions with momentum
- Elements that should feel "alive" (like Apple's Dynamic Island)
- Gestures that can be interrupted mid-animation
- Decorative mouse-tracking interactions
- Any interaction where the user might change direction mid-gesture

### Spring-based mouse interactions

Tying visual changes directly to mouse position feels artificial because it lacks motion. Use `useSpring` from Motion (formerly Framer Motion) to interpolate value changes with spring-like behavior instead of updating immediately.

### When NOT to use springs

- Simple show/hide transitions (duration-based is simpler and sufficient)
- Keyboard-triggered UI (should be instant anyway)
- Loading indicators (predictable timing is better)

---

## 5. Entry/Exit Patterns

### Entry animations

**Nothing in the real world appears from nothing.**

| Bad | Good | Why |
|-----|------|-----|
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Starting from 0 implies materialization from void |
| `opacity: 0` only | `opacity: 0; transform: translateY(8px)` | Pure fade lacks spatial context |
| All items appear at once | Stagger with 30–80ms delay between items | Sequential reveal creates rhythm |

### Exit animations

**Exit must be faster than enter.** Users want to dismiss things quickly. The enter animation builds anticipation; the exit confirms the action.

- Enter: 200–400ms (build anticipation)
- Exit: 100–200ms (confirm dismissal)

### Stagger pattern

```css
.item {
    opacity: 0;
    transform: translateY(8px);
    animation: fadeIn 300ms ease-out forwards;
}

.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }
```

Keep stagger delays between **30–80ms**. Shorter feels rushed, longer feels sluggish.

---

## 6. Transform-Origin

**Popovers scale from their trigger. Modals stay centered.**

```css
/* Radix UI — popover scales from trigger */
.popover {
    transform-origin: var(--radix-popover-content-transform-origin);
}

/* Base UI equivalent */
.popover {
    transform-origin: var(--transform-origin);
}

/* Modal — always centered (not anchored to trigger) */
.modal {
    transform-origin: center;
}
```

The default `transform-origin: center` is wrong for almost every popover. Fix this for dropdowns, selects, tooltips, context menus — anything anchored to a trigger element.

---

## 7. Interruptibility: Transitions vs Keyframes

**CSS transitions can be interrupted and retargeted mid-animation. Keyframes restart from zero.**

For any interaction that can be triggered rapidly (adding toasts, toggling states, hover effects), transitions produce smoother results.

```css
/* Interruptible — good for dynamic UI */
.toast {
    transition: transform 400ms ease;
}

/* NOT interruptible — avoid for dynamic UI */
@keyframes slideIn {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
```

**Use keyframes only for:**
- One-shot animations (page load reveals)
- Complex multi-step sequences
- Animations that should NOT be interrupted

**Use transitions for:**
- Anything the user can trigger repeatedly
- Hover/focus/active states
- Toast notifications, dropdowns, tooltips

---

## 8. Touch & Hover Safety

### Hover media query (Non-Negotiable)

Touch devices trigger hover on tap, causing false positives. Gate hover animations behind:

```css
@media (hover: hover) and (pointer: fine) {
    .button:hover {
        transform: scale(1.02);
    }
}
```

### Tooltip skip-delay

Tooltips should delay before appearing (prevent accidental activation). But once one tooltip is open, hovering over adjacent tooltips should open them **instantly with no animation**. This feels faster without defeating the purpose of the initial delay.

---

## 9. Performance (Non-Negotiable)

### Only animate compositable properties

- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (with caution)

**Never animate:** `top`, `left`, `width`, `height`, `margin`, `padding`, `border-width` — these trigger layout recalculation.

### Hardware acceleration

For Motion/Framer Motion under load, prefer `transform: "translateX()"` string syntax over `x`/`y` shorthand props for explicit GPU compositing.

### backdrop-blur warning

`backdrop-blur` on scrolling content is expensive. Only apply to fixed/sticky elements (navbar, floating toolbar), never to elements that scroll with the page.

---

## 10. Button & Press Feedback

Every interactive element must feel responsive to press:

```css
.button:active {
    transform: scale(0.97);
}
```

| Element | Active State |
|---------|-------------|
| Buttons | `scale(0.97)` or `scale(0.98)` |
| Cards (clickable) | `scale(0.99)` (subtle) |
| List items | `translateY(1px)` or `scale(0.99)` |
| Toggles/switches | Spring animation on state change |

---

## 11. Review Format (Required)

When reviewing UI animation code, use a Before/After/Why table:

| Before | After | Why |
|--------|-------|-----|
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; avoid `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing appears from nothing |
| `ease-in` on dropdown | `ease-out` with custom curve | `ease-in` feels sluggish on entry |
| No `:active` state on button | `transform: scale(0.97)` on `:active` | Buttons must feel responsive to press |
| `transform-origin: center` on popover | `transform-origin: var(--radix-popover-content-transform-origin)` | Popovers scale from their trigger |
| Same enter/exit speed | Enter 300ms, exit 150ms | Exit confirms action, must feel quick |
| Elements all appear at once | Stagger delay 30–80ms between items | Sequential reveal creates rhythm |
| Hover animation without media query | Wrap in `@media (hover: hover) and (pointer: fine)` | Touch devices trigger hover on tap |
| Duration > 300ms on UI element | Reduce to 150–250ms | UI must feel responsive, not cinematic |
| Keyframes on rapidly-triggered element | CSS transitions | Transitions are interruptible |

---

## 12. Sonner Principles (Building Loved Components)

These principles come from building Sonner (13M+ weekly npm downloads) and apply to any component:

1. **Developer experience is key.** No hooks, no context, no complex setup. Insert `<Toaster />` once, call `toast()` from anywhere. The less friction to adopt, the more people will use it.

2. **Good defaults matter more than options.** Ship beautiful out of the box. Most users never customize. The default easing, timing, and visual design should be excellent.

3. **Naming creates identity.** A memorable name feels more elegant than a descriptive one. Sacrifice discoverability for memorability when appropriate.

4. **Handle edge cases invisibly.** Pause toast timers when the tab is hidden. Fill gaps between stacked toasts with pseudo-elements to maintain hover state. Capture pointer events during drag. Users never notice these, and that is exactly right.

5. **Use transitions, not keyframes, for dynamic UI.** Toasts are added rapidly. Keyframes restart from zero on interruption. Transitions retarget smoothly.

6. **Build a great documentation site.** Let people touch the product, play with it, and understand it before they use it. Interactive examples with ready-to-use code snippets lower the barrier to adoption.

---

## Quick Reference: Common Fixes

| Issue | Fix |
|-------|-----|
| `transition: all` | Specify exact properties |
| `scale(0)` entry | Start from `scale(0.95)` with `opacity: 0` |
| `ease-in` on UI element | Switch to `ease-out` or custom curve |
| `transform-origin: center` on popover | Set to trigger location (Radix/Base UI variable) |
| Animation on keyboard action | Remove animation entirely |
| Duration > 300ms on UI | Reduce to 150–250ms |
| Hover without media query | Add `@media (hover: hover) and (pointer: fine)` |
| Keyframes on rapid-trigger element | Use CSS transitions |
| Same enter/exit speed | Make exit faster (enter 300ms → exit 150ms) |
| All items appear at once | Add stagger (30–80ms between items) |

---

## Attribution

This skill synthesizes animation principles from Emil Kowalski's design engineering articles and his work on Sonner, Vaul, and other open-source components. For the full course: [animations.dev](https://animations.dev/)
