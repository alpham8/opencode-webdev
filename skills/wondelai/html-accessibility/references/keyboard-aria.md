# Keyboard Navigation & ARIA -- Deep Dive

Making interactive components usable without a mouse, and using ARIA correctly when semantic HTML isn't enough.

## Keyboard Navigation Fundamentals

### Default Keyboard Behaviours

| Key | Default action |
|-----|---------------|
| **Tab** | Move focus to next focusable element |
| **Shift + Tab** | Move focus to previous focusable element |
| **Enter** | Activate link or button |
| **Space** | Activate button, toggle checkbox, open select |
| **Arrow keys** | Navigate within radio groups, selects, tabs, menus |
| **Escape** | Close modal, dropdown, overlay |
| **Home / End** | Jump to first / last item in a list or input |

### Natively Focusable Elements (No Extra Work)

These elements are in the tab order by default:
- `<a href="...">`
- `<button>`
- `<input>` (all types)
- `<select>`
- `<textarea>`
- `<details>` / `<summary>`
- Elements with `contenteditable`

### Making Custom Elements Focusable

```html
<!-- tabindex="0": adds to natural tab order -->
<div role="button" tabindex="0">Custom Button</div>

<!-- tabindex="-1": focusable via JS only (not Tab) -->
<div id="modal-content" tabindex="-1">Modal content receives focus programmatically</div>

<!-- ❌ NEVER: positive tabindex (breaks natural order) -->
<button tabindex="5">Don't do this</button>
```

---

## Focus Management Patterns

### Modal Dialog

```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
    <h2 id="modal-title">Bestätigung</h2>
    <p>Möchten Sie den Artikel wirklich löschen?</p>
    <button type="button">Abbrechen</button>
    <button type="button">Löschen</button>
</div>
```

**Focus management requirements:**
1. On open: move focus to the dialog (or first focusable element inside)
2. Focus trap: Tab cycles within the dialog only
3. Escape closes the dialog
4. On close: return focus to the element that opened it

```javascript
// Focus trap implementation sketch
dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDialog();
        triggerElement.focus(); // Return focus
        return;
    }

    if (e.key === 'Tab') {
        const focusable = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});
```

### Dropdown Menu

```html
<div class="dropdown">
    <button aria-expanded="false" aria-haspopup="menu" aria-controls="menu-list">
        Menü
    </button>
    <ul id="menu-list" role="menu" hidden>
        <li role="menuitem" tabindex="-1">Bearbeiten</li>
        <li role="menuitem" tabindex="-1">Duplizieren</li>
        <li role="menuitem" tabindex="-1">Löschen</li>
    </ul>
</div>
```

**Keyboard pattern:**
- Enter/Space on button: open menu, focus first item
- Arrow Down/Up: navigate between items
- Escape: close menu, return focus to button
- Home/End: jump to first/last item

### Tab Panel

```html
<div role="tablist" aria-label="Produktinformationen">
    <button role="tab" aria-selected="true" aria-controls="panel-desc" id="tab-desc" tabindex="0">
        Beschreibung
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-specs" id="tab-specs" tabindex="-1">
        Spezifikationen
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-reviews" id="tab-reviews" tabindex="-1">
        Bewertungen
    </button>
</div>

<div role="tabpanel" id="panel-desc" aria-labelledby="tab-desc">
    <p>Produktbeschreibung...</p>
</div>
<div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" hidden>
    <p>Technische Daten...</p>
</div>
<div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" hidden>
    <p>Kundenbewertungen...</p>
</div>
```

**Keyboard pattern (roving tabindex):**
- Arrow Left/Right: switch between tabs
- Only active tab has `tabindex="0"`; inactive tabs have `tabindex="-1"`
- Tab from tab → moves focus into the panel content

---

## ARIA -- Rules of Use

### The Five Rules of ARIA

1. **Don't use ARIA if native HTML works.** `<button>` is always better than `<div role="button">`.
2. **Don't change native semantics.** Never `<h2 role="tab">` -- use `<div role="tab">` instead.
3. **All ARIA controls must be keyboard operable.** If you add `role="button"`, you must also handle Enter and Space.
4. **Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements.** This makes them invisible but still reachable -- confusing.
5. **All interactive elements must have an accessible name.** Via label, `aria-label`, or `aria-labelledby`.

### Essential ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Provides accessible name when no visible text | `<button aria-label="Menü schließen"><svg>...</svg></button>` |
| `aria-labelledby` | References another element as the label | `<div aria-labelledby="heading-id">` |
| `aria-describedby` | Links additional description (help text, errors) | `<input aria-describedby="help-text-id">` |
| `aria-expanded` | Indicates expanded/collapsed state | `<button aria-expanded="false">` |
| `aria-controls` | Points to the element this control affects | `<button aria-controls="menu-id">` |
| `aria-hidden` | Hides from assistive tech (not visual) | `<svg aria-hidden="true">` (decorative icon) |
| `aria-live` | Announces dynamic content changes | `<div aria-live="polite">` |
| `aria-invalid` | Marks input as having an error | `<input aria-invalid="true">` |
| `aria-required` | Marks input as required | `<input aria-required="true">` |
| `aria-current` | Indicates current item in a set | `<a aria-current="page">` (active nav link) |
| `aria-selected` | Selected state in tabs, listboxes | `<button role="tab" aria-selected="true">` |
| `aria-disabled` | Communicates disabled state | `<button aria-disabled="true">` |

### ARIA Live Regions

For dynamic content that updates without page reload:

```html
<!-- Polite: announces when user is idle (success messages, status updates) -->
<div aria-live="polite" aria-atomic="true">
    Artikel wurde zum Warenkorb hinzugefügt.
</div>

<!-- Assertive: interrupts immediately (critical errors, time-sensitive) -->
<div aria-live="assertive" aria-atomic="true">
    Ihre Sitzung läuft in 2 Minuten ab.
</div>

<!-- Role shortcuts -->
<div role="status">...</div>   <!-- equivalent to aria-live="polite" -->
<div role="alert">...</div>    <!-- equivalent to aria-live="assertive" -->
```

**Rules:**
- The live region element must exist in the DOM before content is added
- `aria-atomic="true"`: announce the entire region, not just the change
- Use `polite` for most cases; `assertive` only for urgent messages
- Never use `aria-live` on large content areas (e.g., entire page sections)

---

## Icon Buttons

Icons without visible text need accessible names:

```html
<!-- ✅ Icon button with aria-label -->
<button type="button" aria-label="Warenkorb öffnen">
    <svg aria-hidden="true" focusable="false">
        <use href="#icon-cart"></use>
    </svg>
</button>

<!-- ✅ Icon button with sr-only text -->
<button type="button">
    <svg aria-hidden="true" focusable="false">
        <use href="#icon-close"></use>
    </svg>
    <span class="sr-only">Dialog schließen</span>
</button>

<!-- ✅ Icon + visible text (best option -- no extra work needed) -->
<button type="button">
    <svg aria-hidden="true" focusable="false">
        <use href="#icon-cart"></use>
    </svg>
    Warenkorb
</button>
```

**Rules:**
- SVGs inside buttons: always `aria-hidden="true"` + `focusable="false"`
- The button needs a text alternative: `aria-label`, sr-only span, or visible text
- Icon + visible text is the most accessible AND most usable option

---

## Skip Links

```html
<body>
    <!-- First focusable element on the page -->
    <a href="#main-content" class="sr-only sr-only--focusable">
        Zum Hauptinhalt springen
    </a>

    <header>
        <nav><!-- potentially 20+ links --></nav>
    </header>

    <main id="main-content" tabindex="-1">
        <!-- tabindex="-1" ensures focus moves here when skip link is activated -->
        <h1>Seitentitel</h1>
    </main>
</body>
```

**Why:** Keyboard users would otherwise Tab through the entire navigation on every page load before reaching content. Skip links let them jump directly to `<main>`.

**Rules:**
- Visually hidden by default, visible on focus (`:focus` or `:focus-visible`)
- Target element needs `tabindex="-1"` if it's not natively focusable
- Place as the very first focusable element in `<body>`

---

## Focus Visible Styles

```css
/* ❌ NEVER remove focus outline without replacement */
*:focus {
    outline: none;
}

/* ✅ Custom focus style (visible, high-contrast) */
:focus-visible {
    outline: 3px solid #1a73e8;
    outline-offset: 2px;
}

/* ✅ For dark backgrounds */
.dark-section :focus-visible {
    outline: 3px solid #ffffff;
    outline-offset: 2px;
}
```

**Rules:**
- Use `:focus-visible` (not `:focus`) to show outlines only for keyboard navigation
- Minimum 3:1 contrast ratio for the focus indicator against its background
- `outline-offset` prevents the outline from overlapping content
- Never rely solely on colour change for focus indication
