# WCAG 2.2 Checklist for HTML Developers

Actionable checklist of WCAG 2.2 Level A and AA criteria relevant to HTML/CSS/JS development. Organised by the four POUR principles.

Use this as a review checklist before shipping any user-facing page.

---

## Perceivable

### 1.1 Text Alternatives

- [ ] **1.1.1 Non-text Content (A):** Every `<img>` has `alt`. Decorative images use `alt=""`. Form inputs have labels. CAPTCHA has text alternative.

### 1.2 Time-Based Media

- [ ] **1.2.1 Audio/Video prerecorded (A):** Captions or transcript for audio; audio description or transcript for video.
- [ ] **1.2.2 Captions prerecorded (A):** All pre-recorded video with audio has synchronised captions.
- [ ] **1.2.5 Audio Description (AA):** Pre-recorded video has audio description for visual-only information.

### 1.3 Adaptable

- [ ] **1.3.1 Info and Relationships (A):** Structure conveyed visually is also conveyed in code: headings use `<h1>`-`<h6>`, lists use `<ul>`/`<ol>`, tables use `<th>` with `scope`, form groups use `<fieldset>`/`<legend>`.
- [ ] **1.3.2 Meaningful Sequence (A):** DOM order matches visual reading order. CSS doesn't create confusing reordering.
- [ ] **1.3.3 Sensory Characteristics (A):** Instructions don't rely solely on shape, size, position, or sound ("click the round button", "the field on the left").
- [ ] **1.3.4 Orientation (AA):** Content works in both portrait and landscape orientation.
- [ ] **1.3.5 Identify Input Purpose (AA):** Form inputs have appropriate `autocomplete` attribute for personal data fields.

### 1.4 Distinguishable

- [ ] **1.4.1 Use of Colour (A):** Colour is not the only way to convey information (errors, required fields, active states). Always add text, icons, or patterns.
- [ ] **1.4.3 Contrast Minimum (AA):** Text has 4.5:1 contrast; large text (>= 24px / >= 18.8px bold) has 3:1.
- [ ] **1.4.4 Resize Text (AA):** Page is usable at 200% browser zoom. No content cut off, no horizontal scroll on text.
- [ ] **1.4.5 Images of Text (AA):** Text is HTML text, not embedded in images (except logos).
- [ ] **1.4.10 Reflow (AA):** Content reflows at 320px width (mobile) without horizontal scrolling. No 2D scrolling for text content.
- [ ] **1.4.11 Non-text Contrast (AA):** UI components and graphical elements have 3:1 contrast against background (borders, icons, focus indicators, chart elements).
- [ ] **1.4.12 Text Spacing (AA):** Content remains readable when users override: line-height 1.5x, paragraph spacing 2x font size, letter spacing 0.12em, word spacing 0.16em.
- [ ] **1.4.13 Content on Hover or Focus (AA):** Tooltips/popovers are dismissible (Esc), hoverable (mouse can move to tooltip), and persistent (don't disappear while hovering).

---

## Operable

### 2.1 Keyboard Accessible

- [ ] **2.1.1 Keyboard (A):** All functionality works with keyboard only. No mouse-dependent interactions without keyboard alternative.
- [ ] **2.1.2 No Keyboard Trap (A):** Focus can always be moved away from any component using standard keys (Tab, Escape, arrows).
- [ ] **2.1.4 Character Key Shortcuts (A):** Single-character shortcuts (if any) can be turned off, remapped, or are only active when component is focused.

### 2.2 Enough Time

- [ ] **2.2.1 Timing Adjustable (A):** If there are time limits, users can turn off, adjust, or extend them (at least 10x). Exceptions: real-time events, essential time limits.
- [ ] **2.2.2 Pause, Stop, Hide (A):** Auto-moving, blinking, or scrolling content can be paused, stopped, or hidden. Auto-updating content can be paused or controlled.

### 2.3 Seizures and Physical Reactions

- [ ] **2.3.1 Three Flashes (A):** Nothing flashes more than 3 times per second.

### 2.4 Navigable

- [ ] **2.4.1 Bypass Blocks (A):** Skip link to main content, or landmarks (`<main>`, `<nav>`, `<header>`) for screenreader navigation.
- [ ] **2.4.2 Page Titled (A):** Every page has a unique, descriptive `<title>`.
- [ ] **2.4.3 Focus Order (A):** Tab order is logical and matches visual layout.
- [ ] **2.4.4 Link Purpose (A):** Link text (or link + surrounding context) makes the destination clear.
- [ ] **2.4.6 Headings and Labels (AA):** Headings and labels describe topic or purpose.
- [ ] **2.4.7 Focus Visible (AA):** Keyboard focus indicator is always visible on interactive elements.
- [ ] **2.4.11 Focus Not Obscured Minimum (AA):** Focused element is not entirely hidden by other content (sticky headers, modals, banners).

### 2.5 Input Modalities

- [ ] **2.5.1 Pointer Gestures (A):** Multi-point or path-based gestures have single-pointer alternatives.
- [ ] **2.5.2 Pointer Cancellation (A):** Click/tap actions fire on up-event (not down-event) or can be aborted.
- [ ] **2.5.3 Label in Name (A):** Accessible name of a component includes the visible text label (for voice control users).
- [ ] **2.5.4 Motion Actuation (A):** Shake/tilt functionality has button alternative and can be disabled.
- [ ] **2.5.8 Target Size Minimum (AA):** Interactive targets are at least 24x24 CSS pixels, or have sufficient spacing.

---

## Understandable

### 3.1 Readable

- [ ] **3.1.1 Language of Page (A):** `<html lang="de">` (or appropriate language code) is set.
- [ ] **3.1.2 Language of Parts (AA):** Text in a different language is marked with `lang` attribute.

### 3.2 Predictable

- [ ] **3.2.1 On Focus (A):** No unexpected behaviour (page change, form submit, new window) when an element receives focus.
- [ ] **3.2.2 On Input (A):** No unexpected context change when user enters data (unless warned beforehand).
- [ ] **3.2.3 Consistent Navigation (AA):** Navigation appears in the same position and order across pages.
- [ ] **3.2.4 Consistent Identification (AA):** Same-function elements have consistent labels and icons across the site.

### 3.3 Input Assistance

- [ ] **3.3.1 Error Identification (A):** Errors are described in text (not just colour), identifying which field has the problem.
- [ ] **3.3.2 Labels or Instructions (A):** Form inputs have associated labels. Required fields are indicated. Format hints provided.
- [ ] **3.3.3 Error Suggestion (AA):** If an error is detected and a correction is known, suggest it to the user.
- [ ] **3.3.4 Error Prevention for Legal/Financial (AA):** Submissions with legal or financial consequences are reversible, verifiable, or confirmable.
- [ ] **3.3.7 Redundant Entry (A):** Information previously entered by user is auto-populated or available to select (don't ask twice).
- [ ] **3.3.8 Accessible Authentication Minimum (AA):** Login doesn't require cognitive function tests (memory, puzzles) unless alternative is provided.

---

## Robust

### 4.1 Compatible

- [ ] **4.1.2 Name, Role, Value (A):** Custom components expose accessible name, role, and state/value to assistive tech via ARIA.
- [ ] **4.1.3 Status Messages (AA):** Dynamically inserted status messages (errors, confirmations) use `role="alert"`, `role="status"`, or `aria-live` to announce without focus change.

---

## Testing Checklist

### Automated Testing (Catches ~30% of Issues)

| Tool | What it catches |
|------|----------------|
| axe DevTools | Missing labels, contrast, ARIA misuse, structure |
| Lighthouse (Accessibility) | Same as axe + performance-related a11y |
| WAVE | Visual overlay showing structure and errors |
| HTML validator (W3C) | Malformed markup, duplicate IDs |

### Manual Testing (Catches ~70% of Issues)

| Test | How |
|------|-----|
| Keyboard-only navigation | Unplug mouse; Tab through entire page. Can you reach and activate everything? |
| Focus visibility | Is the focus indicator always visible? |
| Zoom 200% | Does content reflow? Is anything cut off? |
| Screenreader check | Turn on VoiceOver (Mac), NVDA (Windows), or Orca (Linux). Can you understand the page? |
| Heading outline | Use a browser extension to view heading structure. Is it logical? |
| No-colour test | Greyscale your monitor. Can you still distinguish states and understand the UI? |
| Mobile tap targets | Are all interactive elements at least 44x44px on touch devices? |

### Quick Keyboard Test Script

1. Press Tab -- focus should start at skip link or first interactive element
2. Continue Tab -- focus should move logically through the page
3. Activate buttons with Enter and Space
4. Open dropdown/modal -- Escape should close it
5. Tab within modal -- focus should be trapped
6. Close modal -- focus should return to trigger
7. Navigate to form -- every input should announce its label
8. Submit form with errors -- errors should be announced
