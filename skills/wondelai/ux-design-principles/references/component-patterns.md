# UI Component Patterns -- Practical Reference

Concrete design rules for common UI components. Use this when building specific components to ensure they follow evidence-based patterns.

Sources: Smashing Magazine, Nielsen Norman Group, Laws of UX

---

## Navigation

### Three Questions Every Page Must Answer
1. **"Where am I?"** -- active state, breadcrumbs, page title
2. **"Where can I go?"** -- visible navigation options
3. **"Where have I been?"** -- visited link states, breadcrumbs

### Pattern Selection

| Pattern | Best for | Avoid when |
|---|---|---|
| Persistent top nav | <= 7 items, flat hierarchy | Complex multi-level structures |
| Simple toggle (hamburger) | Single-level, many items | Multi-level hierarchies |
| Multi-level toggle | 2-level hierarchy (sweet spot) | > 2 levels of depth |
| Off-canvas | Complex menus, mobile-first | Desktop has enough space |
| Tab bar (mobile) | 3-5 primary destinations | > 5 items |
| Priority+ | Many items, varied importance | When all items are equally important |

### Rules
- Always label hamburger icons with "Menu" text
- Show breadcrumbs at all viewport sizes
- Build progressively -- navigation must work without JavaScript
- Current page indicator must be visible in responsive state
- No mega-menus on mobile
- No more than 3 levels of nested navigation

---

## Forms

### Label Placement
- **Labels above fields** -- always. Closest visual proximity to their input.
- Label must be closer to its field than to the previous field (Gestalt proximity).
- Never use placeholder text as labels -- it disappears on focus.
- Keep labels to 1-2 words maximum.
- Mark only optional fields (if most are required). Use "Optional" text, not asterisks.

### Input Fields
- Size fields proportionally to expected input (postcode = short, address = long)
- One column layout for forms -- multi-column increases completion time 15-25%
- Auto-focus the first field
- Match keyboard to input type: `type="email"`, `type="tel"`, `type="number"`, `type="date"`
- Use input masking for formatted data (phone, dates, credit cards)
- Enable browser autocomplete/autofill (30% faster completion)
- Show/hide password toggle instead of confirm password fields
- Avoid dropdowns on mobile -- prefer radio buttons, segmented controls, or steppers
- Don't split single data points across multiple inputs (phone, dates)

### Validation
- Validate inline **after the user leaves the field** (on blur), not while typing
- Show errors next to the field, not only in a top summary
- Plain language: "Email must include @" not "Invalid format"
- Never rely on colour alone for errors -- add icons and text
- Preserve user input when errors occur -- never clear fields
- Show all errors at once, not one at a time

### Reducing Friction
- Remove every non-essential field (most forms can cut 20-60%)
- Explain why sensitive data is requested
- Persist form data across accidental page reloads
- Use geolocation, camera scanning, biometrics where appropriate

---

## Buttons

### Visual Design
- Must **look clickable** -- shadows, borders, or colour fills signal interactivity
- Rectangular with rounded corners is safest and most recognisable
- Consistent button shapes within an interface

### Sizing
- Minimum touch target: **44x44 CSS pixels** (10mm x 10mm physical)
- Breathing room between adjacent buttons
- Primary action is the largest button in its context

### Hierarchy

| Level | Style | Example |
|---|---|---|
| **Primary** | Filled, high contrast, strongest visual weight | "Create Account", "Submit Order" |
| **Secondary** | Outlined or ghost, lower visual weight | "Cancel", "Back" |
| **Tertiary** | Text-only, minimal visual weight | "Skip", "Learn more" |
| **Destructive** | Distinct colour (often red), requires confirmation | "Delete", "Remove" |

**Rule:** Never give Cancel the same visual weight as Submit.

### Labels
- Action verbs describing the outcome: "Create Account", "Send Message", "Download PDF"
- Must answer: "What happens when I click this?"
- Avoid: "OK", "Submit", "Yes", "Click Here"

### States (All Required)
- **Default** -- resting state
- **Hover** -- cursor feedback (desktop)
- **Active/Pressed** -- click confirmation
- **Focused** -- keyboard navigation (never remove without replacement)
- **Disabled** -- muted, with explanation (prefer enabled + validate on submit)
- **Loading** -- spinner or progress during async operations

---

## Cards

### When to Use
- Displaying collections of heterogeneous content (products, articles, users)
- Content that can be individually acted upon
- Scannable summaries linking to detailed views

### Design Rules
- One primary action per card (secondary actions in overflow menu)
- Entire card clickable for the primary action, not just a "Read more" link
- Consistent card dimensions within a grid (same height per row)
- Clear visual hierarchy within the card: image > title > description > meta
- Don't overload cards -- 3-4 pieces of information maximum

---

## Modals & Dialogs

### When to Use
- Requiring immediate user decision before proceeding
- Confirming destructive actions
- Short forms that don't warrant a full page

### When NOT to Use
- Displaying information that could be inline
- Long forms or complex interactions (use a full page)
- Marketing messages or upsells (use inline banners)
- Error messages (use inline errors next to the source)

### Design Rules
- Always provide a visible close button (X) AND Escape key dismissal
- Dim/blur the background to establish figure-ground
- Focus trap: tab cycling stays within the modal
- Return focus to the trigger element on close
- One action per modal -- don't stack modals
- Mobile: consider full-screen or bottom sheet instead of centred modal

---

## Tables

### Design Rules
- Right-align numeric data for easy comparison
- Left-align text data
- Consistent column widths
- Sticky headers for long tables
- Zebra striping or subtle row borders for scanability
- Sortable columns indicated with directional icons
- Responsive: horizontal scroll, stacked cards, or priority columns on mobile

---

## Search

### Design Rules
- Prominent placement: top of page, centred or right-aligned
- Magnifying glass icon as universal signifier
- Show search suggestions/autocomplete
- Preserve search query in the input after results load
- Show number of results
- Provide clear "no results" state with suggestions
- Recent searches visible on focus (recognition over recall)

---

## Loading States

### Pattern Selection

| Duration | Pattern |
|---|---|
| < 100ms | No indicator needed |
| 100ms - 400ms | Subtle indicator (button state change) |
| 400ms - 2s | Spinner or skeleton screen |
| 2s - 10s | Progress bar with percentage |
| > 10s | Progress bar + status messages |

### Skeleton Screens
- Mirror the layout of the content being loaded
- Use subtle animation (shimmer/pulse) to indicate activity
- Replace with real content progressively (don't flash)
- Better than spinners for content-heavy pages (reduces perceived load time)

---

## Notifications & Feedback

### Types

| Type | Persistence | Position | Use case |
|---|---|---|---|
| **Toast** | Auto-dismiss (3-5s) | Top-right or bottom | Success confirmations, non-critical info |
| **Banner** | Persistent until dismissed | Top of page/section | System messages, warnings |
| **Inline** | Persistent | Next to the source element | Validation errors, field-level feedback |
| **Modal** | Requires user action | Centre overlay | Destructive action confirmation |

### Rules
- Success notifications auto-dismiss; errors persist until acknowledged
- Errors always colour-independent (icon + text, not just red)
- Stack multiple notifications vertically, don't overlap
- Include an action in notifications when recovery is possible ("Undo", "Retry")
- Don't interrupt the user's current task for non-critical notifications
