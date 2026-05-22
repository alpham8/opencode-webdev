# Form Accessibility -- Deep Dive

Every form pattern you need for accessible input, from simple text fields to complex multi-step forms.

## Label Association Methods

### Method 1: for/id (Preferred)

```html
<label for="firstname">Vorname</label>
<input type="text" id="firstname" name="firstname" autocomplete="given-name">
```

**Advantages:** Works regardless of DOM position; explicit connection; largest click target.

### Method 2: Wrapping (Alternative)

```html
<label>
    Vorname
    <input type="text" name="firstname" autocomplete="given-name">
</label>
```

**Advantages:** No `id` needed; simpler markup. **Disadvantage:** Less flexible layout.

### Method 3: aria-label (Hidden Label)

```html
<!-- Only when visual label is truly impossible -->
<input type="search" aria-label="Website durchsuchen" placeholder="Suchen...">
```

**Use sparingly.** Visible labels are always preferred. `aria-label` is invisible to sighted users.

### Method 4: aria-labelledby (Reference Existing Text)

```html
<h2 id="billing-heading">Rechnungsadresse</h2>
<!-- ... -->
<input type="text" aria-labelledby="billing-heading field-street" id="street">
<span id="field-street" class="sr-only">Straße</span>
```

**Use when:** label text already exists elsewhere in the DOM.

---

## Input Types and Autocomplete

Use correct `type` and `autocomplete` attributes -- they trigger the right mobile keyboard AND enable browser autofill:

| Data | type | autocomplete | inputmode |
|------|------|--------------|-----------|
| Full name | `text` | `name` | -- |
| Given name | `text` | `given-name` | -- |
| Family name | `text` | `family-name` | -- |
| Email | `email` | `email` | `email` |
| Phone | `tel` | `tel` | `tel` |
| Street address | `text` | `street-address` | -- |
| Postal code | `text` | `postal-code` | `numeric` |
| City | `text` | `address-level2` | -- |
| Country | `text` | `country-name` | -- |
| Credit card number | `text` | `cc-number` | `numeric` |
| Credit card expiry | `text` | `cc-exp` | `numeric` |
| Password | `password` | `current-password` | -- |
| New password | `password` | `new-password` | -- |
| One-time code | `text` | `one-time-code` | `numeric` |

---

## Fieldset and Legend

### When Required

Group related inputs in `<fieldset>` with `<legend>` when:
- Radio button groups (always)
- Checkbox groups (always)
- Logically connected fields (address block, date range)

```html
<fieldset>
    <legend>Lieferadresse</legend>

    <label for="street">Straße und Hausnummer</label>
    <input type="text" id="street" name="street" autocomplete="street-address">

    <label for="plz">PLZ</label>
    <input type="text" id="plz" name="plz" autocomplete="postal-code" inputmode="numeric">

    <label for="city">Ort</label>
    <input type="text" id="city" name="city" autocomplete="address-level2">
</fieldset>

<fieldset>
    <legend>Versandart</legend>

    <input type="radio" id="standard" name="shipping" value="standard">
    <label for="standard">Standard (3-5 Tage)</label>

    <input type="radio" id="express" name="shipping" value="express">
    <label for="express">Express (1-2 Tage)</label>
</fieldset>
```

**Screenreader announcement:** "Versandart, group. Standard (3-5 Tage), radio button, not selected."

Without fieldset/legend, the screenreader only says: "Standard (3-5 Tage), radio button" -- user doesn't know what the group is about.

---

## Error Handling

### Inline Errors (Per-Field)

```html
<div class="form-field form-field--error">
    <label for="email">E-Mail-Adresse</label>
    <input type="email" id="email" name="email" aria-describedby="email-error" aria-invalid="true" value="nicht-gueltig">
    <span id="email-error" class="form-field__error" role="alert">
        <svg aria-hidden="true" class="icon-error"><!-- error icon --></svg>
        Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@beispiel.de).
    </span>
</div>
```

**Required attributes:**
- `aria-invalid="true"` on the invalid input
- `aria-describedby="error-id"` linking input to error message
- `role="alert"` on dynamically added errors (triggers immediate announcement)
- Icon + text (never colour alone)

### Error Summary (Top of Form)

For forms with multiple errors, add a summary at the top that links to each invalid field:

```html
<div role="alert" aria-labelledby="error-summary-title">
    <h2 id="error-summary-title">Es sind 2 Fehler aufgetreten</h2>
    <ul>
        <li><a href="#email">E-Mail-Adresse: Bitte gültige Adresse eingeben</a></li>
        <li><a href="#plz">PLZ: Bitte 5-stellige Postleitzahl eingeben</a></li>
    </ul>
</div>
```

**Rules:**
- Move focus to the error summary after form submission fails
- Each error links to the corresponding field (click jumps to it)
- Show both summary AND inline errors simultaneously

### Success Feedback

```html
<div role="status" aria-live="polite">
    Ihre Nachricht wurde erfolgreich gesendet.
</div>
```

Use `role="status"` (polite) for success messages -- doesn't interrupt the user.

---

## Required Fields

```html
<!-- Approach 1: Visual indicator + aria-required -->
<label for="name">Name <span aria-hidden="true">*</span></label>
<input type="text" id="name" name="name" required aria-required="true">

<!-- Approach 2: Text indicator -->
<label for="name">Name (Pflichtfeld)</label>
<input type="text" id="name" name="name" required>

<!-- At the top of the form, explain the convention: -->
<p>Felder mit <span aria-hidden="true">*</span><span class="sr-only">Stern</span> sind Pflichtfelder.</p>
```

**Rules:**
- Use `required` attribute (native validation)
- Add `aria-required="true"` for custom validation
- Explain the asterisk convention in text above the form
- Hide the asterisk from screenreaders (`aria-hidden="true"`) if you use the `required` attribute (screenreader already announces "required")

---

## Help Text and Instructions

```html
<label for="password">Passwort</label>
<input type="password" id="password" name="password" aria-describedby="password-help" autocomplete="new-password">
<p id="password-help" class="form-field__help">
    Mindestens 8 Zeichen, davon mindestens eine Zahl und ein Sonderzeichen.
</p>
```

`aria-describedby` links the help text to the input -- screenreaders announce it after the label.

---

## Disabled vs Read-Only

```html
<!-- Disabled: not focusable, not submitted, greyed out -->
<input type="text" id="code" name="code" disabled value="PROMO2024">

<!-- Read-only: focusable, submitted, selectable text -->
<input type="text" id="total" name="total" readonly value="149,90 €">
```

**Accessibility note:** Disabled fields are skipped by Tab. If users need to read the value, prefer `readonly` (still focusable, still announced by screenreaders).

---

## Select, Checkbox, Radio Patterns

### Custom Checkbox (Accessible)

When native checkboxes are visually styled:

```html
<label class="custom-checkbox">
    <input type="checkbox" name="newsletter" class="custom-checkbox__input">
    <span class="custom-checkbox__visual" aria-hidden="true"></span>
    <span class="custom-checkbox__label">Newsletter abonnieren</span>
</label>
```

**Key:** The real `<input type="checkbox">` is visually hidden (not `display:none`) but remains focusable and operable. The visual span is purely decorative (`aria-hidden="true"`).

### Combobox / Autocomplete (ARIA)

```html
<label for="country">Land</label>
<div class="combobox" role="combobox" aria-expanded="false" aria-haspopup="listbox">
    <input type="text" id="country" aria-autocomplete="list" aria-controls="country-listbox">
    <ul id="country-listbox" role="listbox" hidden>
        <li role="option" id="de">Deutschland</li>
        <li role="option" id="at">Österreich</li>
        <li role="option" id="ch">Schweiz</li>
    </ul>
</div>
```

Complex widgets like this require careful ARIA. See [WAI-ARIA Authoring Practices: Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
