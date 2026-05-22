---
name: html-accessibility
description: 'Write accessible HTML that works with screenreaders and keyboard navigation. Use when you need to: (1) build forms with proper labels, fieldsets, and error messages, (2) structure pages with semantic landmarks and heading hierarchy, (3) add alt text, ARIA attributes, or skip links, (4) audit HTML for accessibility violations, (5) make interactive components keyboard-accessible. Triggers on: HTML templates, Twig files, Vue/Svelte templates, form elements, ARIA attributes, "accessible", "screenreader", "keyboard navigation", "a11y", "WCAG", "barrierefreiheit". Minimum viable accessibility for every project -- no excuses.'
license: MIT
metadata:
  author: wondelai
  version: "1.0.0"
  sources:
    - "W3C WCAG 2.2 (w3.org/WAI/standards-guidelines/wcag/)"
    - "MDN Web Docs: HTML Accessibility"
    - "barrierefreies-webdesign.de"
---

# HTML Accessibility

Practical, non-negotiable accessibility patterns for every web project. This skill focuses on **what you must always do** -- the minimum viable accessibility that ensures screenreaders can parse your HTML, keyboards can navigate it, and users with disabilities can use it.

This is not about achieving WCAG AAA perfection on every project. It's about **never shipping inaccessible basics** -- labels on inputs, alt on images, semantic structure, keyboard operability. These patterns cost almost nothing to implement but make a massive difference.

## Core Principle

**Use the right HTML element for the right job.** Semantic HTML provides built-in accessibility for free. Every `<div>` that should be a `<button>`, every missing `<label>`, every decorative image without `alt=""` is a barrier you chose to create. The first rule of ARIA: don't use ARIA if native HTML can do it.

## Scoring

**Goal: 10/10.** Rate HTML output 0-10 based on accessibility compliance.

- **9-10:** All inputs labelled, semantic structure correct, keyboard-navigable, images have appropriate alt, ARIA used only when necessary. Passes automated tools (axe, Lighthouse) with zero errors.
- **7-8:** Most patterns correct. Minor gaps: one missing alt, a decorative image with redundant alt text, one fieldset without legend.
- **5-6:** Basics present but inconsistent. Some labels missing, heading hierarchy broken, some interactive elements not keyboard-accessible.
- **3-4:** Significant gaps. Many inputs without labels, divs used as buttons, no landmark structure, images without alt.
- **1-2:** No accessibility consideration. Screenreaders cannot parse the page. Keyboard users cannot navigate.

## The Non-Negotiable Patterns

### 1. Every Input Must Have a Label

**The single most important accessibility rule for forms.** Without a label, screenreaders announce "text edit" with no context -- users have no idea what to type.

```html
<!-- ✅ ALWAYS: label with for/id association -->
<label for="email">E-Mail-Adresse</label>
<input type="email" id="email" name="email" autocomplete="email">

<!-- ✅ Also valid: wrapping label -->
<label>
    E-Mail-Adresse
    <input type="email" name="email" autocomplete="email">
</label>

<!-- ❌ NEVER: input without label -->
<input type="email" name="email" placeholder="E-Mail">

<!-- ❌ NEVER: placeholder as label substitute -->
<input type="email" placeholder="E-Mail-Adresse">
```

**Rules:**
- Every `<input>`, `<select>`, and `<textarea>` needs an associated `<label>`
- Use `for="id"` matching (preferred) or wrap the input inside the label
- Placeholders are **not** labels -- they disappear on focus
- Hidden labels (`sr-only` class) are acceptable when the visual design cannot show a label, but visible labels are always preferred
- The `<label>` click target activates the input -- a usability bonus for all users

See: [references/forms.md](references/forms.md)

### 2. Semantic Document Structure

**Use landmarks and headings so screenreader users can navigate the page like a table of contents.**

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Descriptive Page Title</title>
</head>
<body>
    <a href="#main-content" class="sr-only sr-only--focusable">Zum Inhalt springen</a>

    <header>
        <nav aria-label="Hauptnavigation">
            <ul>
                <li><a href="/">Startseite</a></li>
                <li><a href="/produkte">Produkte</a></li>
            </ul>
        </nav>
    </header>

    <main id="main-content">
        <h1>Seitentitel</h1>

        <article>
            <h2>Abschnittstitel</h2>
            <p>Inhalt...</p>

            <h3>Unterabschnitt</h3>
            <p>Mehr Inhalt...</p>
        </article>

        <aside aria-label="Verwandte Inhalte">
            <h2>Ähnliche Artikel</h2>
        </aside>
    </main>

    <footer>
        <nav aria-label="Footer-Navigation">
            <ul>
                <li><a href="/impressum">Impressum</a></li>
                <li><a href="/datenschutz">Datenschutz</a></li>
            </ul>
        </nav>
    </footer>
</body>
</html>
```

**Rules:**
- `<html lang="de">` -- declare the page language (screenreaders switch pronunciation)
- One `<h1>` per page; heading hierarchy never skips levels (h1 → h2 → h3)
- Use landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- `<main>` appears exactly once per page
- Multiple `<nav>` elements need `aria-label` to distinguish them
- `<title>` must be descriptive and unique per page
- Add a skip link as the first focusable element

### 3. Images -- Alt Text or Explicit Decoration

**Every `<img>` must have an `alt` attribute.** The content depends on the image's purpose.

```html
<!-- ✅ Informative image: describe what it shows -->
<img src="team-photo.jpg" alt="Das Entwicklerteam bei der Weihnachtsfeier 2024">

<!-- ✅ Functional image (link/button): describe the action -->
<a href="/warenkorb">
    <img src="cart-icon.svg" alt="Warenkorb (3 Artikel)">
</a>

<!-- ✅ Decorative image: empty alt to skip -->
<img src="decorative-border.png" alt="">

<!-- ✅ Complex image with extended description -->
<figure>
    <img src="chart.png" alt="Umsatzentwicklung 2024" aria-describedby="chart-desc">
    <figcaption id="chart-desc">
        Umsatz stieg von 1,2 Mio. Euro im Q1 auf 2,8 Mio. Euro im Q4,
        mit dem stärksten Wachstum im Q3 (+45%).
    </figcaption>
</figure>

<!-- ❌ NEVER: missing alt attribute -->
<img src="product.jpg">

<!-- ❌ NEVER: filename as alt -->
<img src="product.jpg" alt="product.jpg">

<!-- ❌ NEVER: redundant "Bild von..." -->
<img src="sunset.jpg" alt="Bild von einem Sonnenuntergang">
```

**Rules:**
- Informative images: describe content and context concisely
- Functional images (inside links/buttons): describe the action/destination
- Decorative images: `alt=""` (empty, not omitted) -- screenreaders skip it
- Never start alt with "Bild von" / "Image of" -- screenreaders already announce "graphic"
- Never put text in images -- it can't be read by screenreaders or selected by users
- SVG icons inside buttons: use `aria-hidden="true"` on the SVG and put text on the button

### 4. Buttons vs Links -- Use the Right Element

**`<a>` navigates. `<button>` acts.** Never use one for the other's job.

```html
<!-- ✅ Link: navigates to a URL -->
<a href="/produkte">Produkte ansehen</a>

<!-- ✅ Button: performs an action -->
<button type="button" onclick="addToCart()">In den Warenkorb</button>

<!-- ✅ Submit button in a form -->
<button type="submit">Bestellung absenden</button>

<!-- ❌ NEVER: div/span as button -->
<div class="btn" onclick="doSomething()">Klick mich</div>

<!-- ❌ NEVER: link as button -->
<a href="#" onclick="doSomething(); return false;">Aktion ausführen</a>
<a href="javascript:void(0)" onclick="doSomething()">Aktion</a>

<!-- ❌ NEVER: button for navigation -->
<button onclick="window.location='/produkte'">Produkte</button>
```

**Why it matters:**
- `<button>`: focusable, activates with Enter AND Space, announced as "button"
- `<a href>`: focusable, activates with Enter only, announced as "link", can be opened in new tab
- `<div>`: not focusable, no keyboard activation, no role announced -- invisible to assistive tech

**If you absolutely must use a non-semantic element** (legacy code, framework constraint):
```html
<div role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')doSomething()" onclick="doSomething()">
    Fallback-Button
</div>
```
But this is always worse than `<button>`. Prefer the real element.

### 5. Keyboard Navigation

**Everything clickable must be keyboard-accessible.** Users who can't use a mouse rely entirely on Tab, Enter, Space, Escape, and Arrow keys.

```html
<!-- ✅ Naturally keyboard-accessible (no extra work needed) -->
<a href="/page">Link</a>
<button type="button">Button</button>
<input type="text">
<select><option>Option</option></select>

<!-- ✅ Custom interactive element made accessible -->
<div role="tab" tabindex="0" aria-selected="true" aria-controls="panel-1"
     onkeydown="handleTabKeydown(event)">
    Tab 1
</div>

<!-- ❌ Interactive but not keyboard-accessible -->
<div class="card" onclick="openDetail()">Product Card</div>
```

**Rules:**
- Never use `tabindex` > 0 (reorders tab flow, causes confusion)
- `tabindex="0"`: adds element to natural tab order (use for custom widgets)
- `tabindex="-1"`: focusable via JavaScript only, not via Tab (use for focus management)
- Never remove focus outlines without providing a visible alternative
- Escape should close modals, dropdowns, and overlays
- Focus must return to the trigger element when a modal/overlay closes
- Test with keyboard only: can you reach and activate every interactive element?

See: [references/keyboard-aria.md](references/keyboard-aria.md)

### 6. Tables -- Structure for Screenreaders

```html
<!-- ✅ Accessible table -->
<table>
    <caption>Bestellübersicht</caption>
    <thead>
        <tr>
            <th scope="col">Produkt</th>
            <th scope="col">Menge</th>
            <th scope="col">Preis</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Widget Pro</td>
            <td>2</td>
            <td>49,90 €</td>
        </tr>
    </tbody>
</table>

<!-- ❌ Inaccessible table -->
<table>
    <tr>
        <td><b>Produkt</b></td>
        <td><b>Menge</b></td>
        <td><b>Preis</b></td>
    </tr>
    <tr>
        <td>Widget Pro</td>
        <td>2</td>
        <td>49,90 €</td>
    </tr>
</table>
```

**Rules:**
- Use `<th>` for header cells, not bold `<td>`
- Add `scope="col"` or `scope="row"` to every `<th>`
- Include `<caption>` for the table title
- Use `<thead>`, `<tbody>`, `<tfoot>` for row grouping
- Never use tables for layout -- use CSS Grid or Flexbox

### 7. Form Groups and Validation

```html
<!-- ✅ Grouped radio buttons with legend -->
<fieldset>
    <legend>Zahlungsart</legend>
    <input type="radio" id="pay-card" name="payment" value="card">
    <label for="pay-card">Kreditkarte</label>

    <input type="radio" id="pay-paypal" name="payment" value="paypal">
    <label for="pay-paypal">PayPal</label>

    <input type="radio" id="pay-invoice" name="payment" value="invoice">
    <label for="pay-invoice">Rechnung</label>
</fieldset>

<!-- ✅ Error message associated with input -->
<div>
    <label for="plz">Postleitzahl</label>
    <input type="text" id="plz" name="plz" aria-describedby="plz-error" aria-invalid="true" inputmode="numeric" pattern="[0-9]{5}">
    <span id="plz-error" role="alert">Bitte geben Sie eine gültige 5-stellige PLZ ein.</span>
</div>

<!-- ✅ Required field -->
<label for="name">Name <span aria-hidden="true">*</span></label>
<input type="text" id="name" name="name" required aria-required="true">
```

**Rules:**
- Group related radio buttons and checkboxes in `<fieldset>` with `<legend>`
- Link error messages to inputs via `aria-describedby`
- Mark invalid fields with `aria-invalid="true"`
- Use `role="alert"` on dynamically appearing error messages (announces immediately)
- Indicate required fields with `required` attribute AND visual indicator
- Don't rely on colour alone for error states -- add icons or text

See: [references/forms.md](references/forms.md)

### 8. Language and Text

```html
<!-- ✅ Page language declared -->
<html lang="de">

<!-- ✅ Language switch for foreign phrases -->
<p>Das Konzept basiert auf dem <span lang="en">Design Thinking</span>-Ansatz.</p>

<!-- ✅ Abbreviation with expansion -->
<abbr title="Barrierefreie Informationstechnik-Verordnung">BITV</abbr>

<!-- ✅ Meaningful link text -->
<a href="/agb">Allgemeine Geschäftsbedingungen lesen</a>

<!-- ❌ Generic link text -->
<a href="/agb">hier klicken</a>
<a href="/agb">mehr</a>
<a href="/agb">Link</a>
```

**Rules:**
- Declare `lang` on `<html>` and on inline elements in a different language
- Never use "hier klicken", "mehr", or "Link" as link text -- describe the destination
- Expand abbreviations with `<abbr title="">`on first use
- Use clear, simple language; avoid jargon where possible

## WCAG Quick Reference (Level A + AA)

The four POUR principles and the most critical success criteria:

### Perceivable

| Criterion | Requirement |
|-----------|-------------|
| 1.1.1 Non-text Content | All images, icons, charts need text alternatives |
| 1.3.1 Info and Relationships | Structure (headings, lists, tables) must be programmatically determinable |
| 1.3.2 Meaningful Sequence | Reading order in source must match visual order |
| 1.4.1 Use of Colour | Never convey information through colour alone |
| 1.4.3 Contrast | 4.5:1 for text; 3:1 for large text (>= 24px or >= 18.8px bold) |
| 1.4.4 Resize Text | Must work at 200% zoom without loss of functionality |

### Operable

| Criterion | Requirement |
|-----------|-------------|
| 2.1.1 Keyboard | All functionality available via keyboard |
| 2.1.2 No Keyboard Trap | Focus never gets trapped; user can always Tab away |
| 2.4.1 Bypass Blocks | Skip link or landmarks to bypass repeated content |
| 2.4.3 Focus Order | Tab order matches logical reading/visual order |
| 2.4.4 Link Purpose | Link text (or link + context) makes destination clear |
| 2.4.7 Focus Visible | Keyboard focus indicator always visible |
| 2.5.3 Label in Name | Visible text label matches the accessible name |

### Understandable

| Criterion | Requirement |
|-----------|-------------|
| 3.1.1 Language of Page | `<html lang="...">` declared |
| 3.1.2 Language of Parts | Language changes within the page marked with `lang` |
| 3.2.1 On Focus | No unexpected context change on focus |
| 3.3.1 Error Identification | Errors identified in text, not just colour |
| 3.3.2 Labels or Instructions | Form inputs have labels and instructions |

### Robust

| Criterion | Requirement |
|-----------|-------------|
| 4.1.2 Name, Role, Value | Custom components expose name, role, state to assistive tech |
| 4.1.3 Status Messages | Dynamic messages use ARIA live regions |

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| Input without label | Screenreader says "text edit" with no context | Add `<label for="id">` |
| Placeholder as only label | Disappears on focus; not announced reliably | Add visible label; keep placeholder as hint only |
| `<div>` as button | Not focusable, no keyboard activation, no role | Use `<button>` |
| `<a href="#">` as button | Wrong semantics, confuses assistive tech | Use `<button>` for actions |
| Missing `alt` on `<img>` | Screenreader reads filename | Add descriptive `alt` or `alt=""` for decorative |
| `alt="image"` or `alt="icon"` | Useless information | Describe what the image shows or does |
| Heading levels skipped (h1 → h3) | Broken document outline; navigation confused | Use sequential levels |
| `outline: none` without replacement | Keyboard users lose all orientation | Keep outline or add custom `:focus-visible` style |
| Colour-only error indication | Invisible to colour-blind users | Add icon + text + `aria-invalid` |
| No `lang` attribute | Screenreader uses wrong pronunciation | Add `lang="de"` to `<html>` |
| Generic link text "hier klicken" | Meaningless in link list context | Describe the destination |
| Form without fieldset/legend for radio groups | Screenreader doesn't announce the group question | Wrap in `<fieldset>` with `<legend>` |

## Quick Diagnostic

| Question | If No | Action |
|----------|-------|--------|
| Does every input have an associated label? | Screenreaders can't identify fields | Add `<label for="id">` to every input |
| Is there a skip link or landmark structure? | Keyboard users must tab through entire nav | Add `<a href="#main">` skip link + `<main>` landmark |
| Does every `<img>` have an `alt` attribute? | Screenreaders read filenames | Add descriptive alt or `alt=""` |
| Can you Tab through all interactive elements? | Keyboard users are blocked | Fix with semantic elements or `tabindex="0"` |
| Is there a visible focus indicator on every interactive element? | Keyboard users are lost | Keep default outline or add `:focus-visible` styles |
| Are headings in order (h1 → h2 → h3)? | Document structure is broken | Fix hierarchy; never skip levels |
| Do error messages use more than just colour? | Colour-blind users miss errors | Add icon + text + `aria-invalid` |
| Is `<html lang="...">` set? | Screenreaders mispronounce everything | Add the correct language code |

## The sr-only Pattern

For visually hidden but screenreader-accessible content:

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Variant: visible on focus (for skip links) */
.sr-only--focusable:focus,
.sr-only--focusable:active {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: inherit;
}
```

Use for: skip links, icon-only button labels, additional context for screenreaders.
Never use `display: none` or `visibility: hidden` for screenreader content -- those hide from assistive tech too.

## Reference Files

- [references/forms.md](references/forms.md) -- Form accessibility patterns: labels, fieldsets, validation, error handling, required fields, autocomplete
- [references/keyboard-aria.md](references/keyboard-aria.md) -- Keyboard navigation, focus management, ARIA roles, live regions, and widget patterns
- [references/wcag-checklist.md](references/wcag-checklist.md) -- WCAG 2.2 Level A + AA checklist for HTML developers

## Further Reading

- [W3C WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [MDN: HTML Accessibility](https://developer.mozilla.org/de/docs/Learn_web_development/Core/Accessibility/HTML)
- [barrierefreies-webdesign.de](https://www.barrierefreies-webdesign.de/artikel/intros/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
