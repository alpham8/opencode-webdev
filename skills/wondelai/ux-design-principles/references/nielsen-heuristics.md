# Nielsen's 10 Usability Heuristics -- Detailed Reference

Jakob Nielsen's 10 general principles for interaction design, developed in 1994 and refined over decades. Use as a review checklist for any user interface.

Source: Nielsen Norman Group (nngroup.com)

---

## 1. Visibility of System Status

**The design should always keep users informed about what is going on, through appropriate feedback within a reasonable amount of time.**

### Implementation checklist:
- [ ] Loading states visible for any action > 400ms
- [ ] Progress indicators for multi-step processes
- [ ] Confirmation messages after successful actions (save, send, delete)
- [ ] Real-time validation feedback on form fields
- [ ] Current page/section highlighted in navigation
- [ ] Upload progress with percentage or file count
- [ ] Network/connection status for offline-capable apps
- [ ] Sync status for collaborative features

### Anti-patterns:
- Silent failures (action appears to do nothing)
- Missing loading indicators during async operations
- No confirmation after form submission
- Buttons that don't change state when clicked

---

## 2. Match Between System and Real World

**The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon.**

### Implementation checklist:
- [ ] Labels use the user's vocabulary, not developer terminology
- [ ] Icons match real-world metaphors users recognise
- [ ] Information appears in a natural, logical order
- [ ] Date/time formats match user's locale
- [ ] Currency and number formats match user expectations
- [ ] Error messages describe the problem in plain language

### Anti-patterns:
- Technical error codes shown to users ("Error 422: Unprocessable Entity")
- Developer jargon in UI labels ("Instantiate", "Parse", "Query")
- Database field names as form labels ("first_name" instead of "First name")
- Abstract icons without labels

---

## 3. User Control and Freedom

**Users often perform actions by mistake. They need a clearly marked 'emergency exit' to leave the unwanted action without having to go through an extended process.**

### Implementation checklist:
- [ ] Undo/redo available for destructive actions
- [ ] Cancel buttons clearly visible in all multi-step processes
- [ ] "Back" navigation works as expected
- [ ] Escape key closes modals and overlays
- [ ] Users can dismiss notifications and alerts
- [ ] Draft saving for long forms
- [ ] "Are you sure?" confirmation only for truly irreversible actions
- [ ] Edit/modify after submission where possible

### Anti-patterns:
- No way to undo a deletion
- Multi-step wizards with no "back" button
- Forced completion of a flow before exiting
- Confirmation dialogs for every trivial action (overuse dilutes their value)

---

## 4. Consistency and Standards

**Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions.**

### Implementation checklist:
- [ ] Same action uses the same word everywhere ("Delete" not sometimes "Remove")
- [ ] Visual styling consistent for same-function elements
- [ ] Interaction patterns match platform conventions (swipe, long-press, right-click)
- [ ] Navigation in the same position on every page
- [ ] Consistent use of colour meanings (red = error, green = success)
- [ ] Form field behaviour consistent across the application
- [ ] Consistent spacing, alignment, and grid usage

### Two types of consistency:
- **Internal:** Within your product (buttons, labels, flows all work the same way)
- **External:** With industry conventions (logo links home, cart icon in top-right for e-commerce)

### Anti-patterns:
- Using "Save" on one page and "Update" on another for the same action
- Different button styles for the same level of importance
- Navigation that moves between pages
- Non-standard icons for common actions

---

## 5. Error Prevention

**Good error messages are important, but the best designs prevent problems from occurring in the first place.**

### Implementation checklist:
- [ ] Confirmation dialogs for irreversible actions (delete, send, publish)
- [ ] Input constraints prevent invalid data entry (date pickers, dropdowns)
- [ ] Smart defaults reduce the chance of wrong choices
- [ ] Inline validation guides users before submission
- [ ] Autocomplete prevents typos in known-value fields
- [ ] Disabled states explained (tooltip/label says why)
- [ ] Search suggestions correct common misspellings

### Two types of errors:
- **Slips:** Unconscious mistakes (clicking the wrong button). Prevent with spacing, confirmation, undo.
- **Mistakes:** Conscious wrong decisions from misunderstanding. Prevent with clear labels, constraints, guidance.

### Anti-patterns:
- Free text input where structured input (picker, dropdown) would prevent errors
- No confirmation before permanent deletion
- Accepting invalid input and showing errors only after form submission

---

## 6. Recognition Rather Than Recall

**Minimise the user's memory load by making elements, actions, and options visible.**

### Implementation checklist:
- [ ] All necessary information visible without requiring memory of other screens
- [ ] Recently used items and search history shown
- [ ] Autocomplete for previously entered values
- [ ] Contextual help and tooltips where needed
- [ ] Labels on all form fields (not just placeholders)
- [ ] Breadcrumbs showing navigation path
- [ ] Persistent display of selected filters and search terms

### Anti-patterns:
- Placeholder-only form labels (disappear on focus)
- Requiring users to remember codes, IDs, or values from other pages
- Icon-only interfaces without labels
- Hidden navigation that requires memorising menu locations

---

## 7. Flexibility and Efficiency of Use

**Shortcuts -- hidden from novice users -- may speed up interaction for expert users.**

### Implementation checklist:
- [ ] Keyboard shortcuts for frequent actions
- [ ] Customisable toolbars or dashboards
- [ ] Recent items / frequently used shortcuts
- [ ] Bulk actions for power users
- [ ] Touch gestures as alternatives to buttons
- [ ] Command palettes (Cmd+K / Ctrl+K)
- [ ] Saved presets or templates for repeated tasks

### Anti-patterns:
- No keyboard navigation in a productivity tool
- Forcing experts through the same tutorial as beginners
- No way to customise or personalise frequently used features

---

## 8. Aesthetic and Minimalist Design

**Every extra unit of information competes with relevant information and diminishes its relative visibility.**

### Implementation checklist:
- [ ] Every element serves a clear purpose
- [ ] Visual noise removed (unnecessary borders, dividers, backgrounds)
- [ ] Content prioritised -- most important information most prominent
- [ ] Decorative elements don't compete with functional ones
- [ ] White space used intentionally to create focus
- [ ] Progressive disclosure for secondary information

### Important distinction:
Minimalist does NOT mean bare or cold. It means **every element earns its place.** A rich, warm design can still be minimalist if nothing is superfluous.

### Anti-patterns:
- Dense dashboards with everything visible at once
- Decorative elements that distract from content
- Marketing banners competing with functional UI
- Gratuitous animations that don't communicate meaning

---

## 9. Help Users Recognise, Diagnose, and Recover from Errors

**Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.**

### Implementation checklist:
- [ ] Error messages in plain language (no error codes, no jargon)
- [ ] Error messages state what went wrong specifically
- [ ] Error messages suggest a concrete next step
- [ ] Errors visually prominent (colour, icon, position next to the field)
- [ ] Multiple errors shown at once (not one at a time)
- [ ] Error state preserved -- user input not lost when an error occurs
- [ ] Errors colour-independent (icon + text, not just red)

### Error message formula:
**What happened** + **Why** (if helpful) + **What to do next**

Good: "Email address already registered. Try signing in or use a different email."
Bad: "Error: duplicate key violation on users_email_unique"

### Anti-patterns:
- Generic "Something went wrong" with no guidance
- Error codes without explanation
- Errors shown only at the top of a long form
- Input cleared after an error

---

## 10. Help and Documentation

**It's best if the system doesn't need explanation. However, documentation may be necessary to help users complete tasks.**

### Implementation checklist:
- [ ] Help is searchable
- [ ] Help is contextual (appears where/when needed)
- [ ] Instructions are concise and step-by-step
- [ ] Tooltips for complex features
- [ ] Onboarding tours for first-time users (skippable)
- [ ] FAQ covering common user questions
- [ ] Contact support accessible from error states

### Anti-patterns:
- Requiring users to read documentation before using basic features
- Help pages that are not searchable
- Tooltips that block the element they describe
- Onboarding tours that cannot be skipped or revisited
