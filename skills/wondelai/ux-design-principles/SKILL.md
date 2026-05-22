---
name: ux-design-principles
description: 'Apply evidence-based UX and UI design principles when building user interfaces. Use when creating layouts, navigation, forms, buttons, dashboards, landing pages, or any user-facing component. Triggers on: "design a page", "build a form", "create navigation", "improve usability", "visual hierarchy", "user experience", "layout design", "whitespace", "spacing", "readability", "scanning pattern", "F-pattern", "Gestalt", "Fitts law", "Hick law", "cognitive load", "form validation", "button design", "color contrast", "typography". Complements frontend-design (aesthetics) with functional design theory. For pure visual aesthetics, see frontend-design. For browser performance, see high-perf-browser.'
license: MIT
metadata:
  author: wondelai
  version: "1.0.0"
  sources:
    - "Nielsen Norman Group (nngroup.com)"
    - "Laws of UX (lawsofux.com)"
    - "Smashing Magazine (smashingmagazine.com)"
    - "Interaction Design Foundation (interaction-design.org)"
---

# UX Design Principles

Evidence-based principles for building interfaces that are not just beautiful, but **functional, intuitive, and accessible**. Apply these when designing layouts, choosing navigation patterns, building forms, or making any UI decision that affects how users perceive and interact with an interface.

This skill complements `frontend-design` (which covers aesthetics and visual creativity) by providing the **design theory layer** -- the principles that make interfaces actually work well for users.

## Core Truth

**Users don't read -- they scan. Users don't think -- they recognise. Users don't optimise -- they satisfice.** Every design decision must account for how humans actually behave, not how we wish they would.

---

## 1. Visual Hierarchy & Eye Movement

### The Three Levels Rule

Every page needs exactly **three distinct levels of visual emphasis** -- not a continuum, but clear steps:

| Level | Role | Techniques |
|---|---|---|
| **Dominant** | Single entry point, maximum visual weight | Largest size, strongest contrast, most whitespace around it |
| **Sub-dominant** | Secondary focal points, moderate emphasis | Medium size, accent color, moderate contrast |
| **Subordinate** | Supporting content, least visual weight | Body text, muted colors, standard sizing |

**Key principle:** "You can't emphasise everything. In order for some elements to stand out, other elements must fade into the background."

### Scanning Patterns

**F-Pattern** (text-heavy pages):
1. Horizontal scan across the top
2. Shorter horizontal scan slightly below
3. Vertical scan down the left edge

**Design implications:**
- First two paragraphs carry the most important information
- Start headings and bullet points with information-carrying words
- Left-aligned content gets more attention than right-aligned
- Break walls of text with headings, bold keywords, and bullet points

**Z-Pattern** (minimal-text pages like landing pages, hero sections):
- Eye moves: top-left -> top-right -> diagonal to bottom-left -> bottom-right
- Place logo/brand top-left, CTA top-right, key message along the diagonal, action bottom-right

**Critical insight:** The F-pattern is the **default** when no strong visual cues exist. Good design eliminates reliance on this inefficient scanning mode by providing clear hierarchy.

### Visual Weight Factors

Elements attract attention based on (strongest to weakest):
1. **Size** -- larger elements dominate
2. **Color & contrast** -- vivid/saturated colors outweigh muted ones
3. **Whitespace** -- isolated elements with surrounding space gain prominence
4. **Shape** -- distinctive shapes stand out among uniform ones
5. **Position** -- top-left has natural dominance (in LTR languages)
6. **Density** -- complex/detailed areas attract more than sparse ones
7. **Imagery** -- photos of people naturally draw the eye

---

## 2. Gestalt Principles (Practical Application)

These principles describe how humans **automatically group and interpret** visual elements. Use them intentionally.

### Proximity (Most Important for UI)

Elements close together are perceived as related. **Spacing is the primary grouping mechanism in UI.**

- Group related form fields by reducing space between them
- Separate unrelated sections with larger gaps
- A label must be closer to its field than to the previous field
- Navigation items in the same cluster are perceived as a group

### Similarity

Elements sharing visual characteristics (color, shape, size, style) are perceived as related.

- All clickable links must look the same (color, underline, weight)
- Related action buttons share a style; destructive actions look different
- Icon families must use uniform stroke weight, size, and style
- Typography hierarchy: same size/weight = same importance

### Figure-Ground

Users separate elements into foreground (focus) and background (context).

- High-contrast CTAs against neutral backgrounds
- Cards with subtle shadows lift off the page
- Dark overlays on hero images make text readable
- Modal overlays dim the background to establish focus

### Common Region

Elements enclosed within the same boundary are perceived as grouped.

- Cards, panels, and bordered sections group related content
- Colored background sections separate content areas
- Form fieldsets with visible borders group related inputs

### Closure

The brain completes incomplete shapes. Use this for:

- Partially visible carousel items suggesting more content
- Progress indicators showing completion state
- Truncated text with "..." indicating expandable content

### Continuity

Elements on a line or curve are perceived as related and following a direction.

- Progress steppers guide users through a sequence
- Aligned elements along invisible grid lines create order
- Breadcrumbs follow a linear path showing hierarchy

### Uniform Connectedness (Strongest Grouping)

Visually connected elements are perceived as most strongly related.

- Lines connecting steps in a process
- Visual connectors between related data points
- Breadcrumb separators linking hierarchy levels

---

## 3. Laws of UX (Key Principles)

### Fitts's Law

**"The time to reach a target is a function of the distance to and size of the target."**

- Make primary action buttons large and easy to reach
- Place frequently used actions near the cursor's resting position
- Touch targets: minimum **10mm x 10mm** (MIT Touch Lab)
- Add padding between adjacent interactive elements to prevent mis-taps
- Corners and edges of the screen are easiest to reach (infinite edge)

### Hick's Law

**"Decision time increases with the number and complexity of choices."**

- Limit navigation items to 5-7 top-level options
- Use progressive disclosure: show details on demand, not all at once
- Break complex processes into steps (wizards, multi-step forms)
- Highlight recommended options to reduce decision effort
- Categorise long lists instead of presenting flat lists

### Miller's Law

**"Working memory holds 7 +/- 2 items."**

- Chunk information into groups of 5-9 items
- Phone numbers: `(555) 123-4567` not `5551234567`
- Break long forms into logical sections
- Limit tabs, navigation items, and option groups accordingly

### Jakob's Law

**"Users spend most of their time on other sites and prefer yours to work the same way."**

- Follow established conventions: logo top-left links to home, search top-right, cart icon in e-commerce
- Shopping cart, login, and navigation placement should match user expectations
- Use standard icons for universal actions (magnifying glass = search, gear = settings)
- Innovate on content and value proposition, not on basic interaction patterns

### Doherty Threshold

**"Productivity soars when response time is under 400ms."**

- Aim for < 100ms for direct manipulation (button clicks, toggles)
- Use optimistic UI updates: show the result immediately, sync in background
- Show skeleton screens or progress indicators for anything > 400ms
- Animate transitions to mask loading time (300-500ms)

### Von Restorff Effect (Isolation Effect)

**"The element that differs from the rest is most likely remembered."**

- Make the primary CTA visually distinct from all other buttons
- Highlight the recommended pricing plan differently
- Use a different color or size for the most important item in a list
- But: use sparingly -- if everything is highlighted, nothing stands out

### Peak-End Rule

**"People judge experiences by their peak moment and the ending."**

- Optimise the most impactful moment (first impression, key interaction)
- End flows positively: success confirmations, thank-you pages, delightful animations
- A frustrating checkout can ruin an otherwise good experience
- Error recovery is a peak moment -- handle it gracefully

### Aesthetic-Usability Effect

**"Users perceive aesthetically pleasing design as more usable."**

- Visual polish increases user tolerance for minor usability issues
- But: aesthetics cannot compensate for fundamentally broken interactions
- First impressions are disproportionately influenced by visual quality
- Invest in visual refinement after getting the interaction model right

### Tesler's Law (Law of Conservation of Complexity)

**"Every system has irreducible complexity. The question is who deals with it."**

- Move complexity from the user to the system wherever possible
- Smart defaults reduce decisions the user must make
- Auto-detection (location, language, currency) absorbs complexity
- But: don't hide essential controls behind too much "magic"

### Postel's Law (Robustness Principle)

**"Be liberal in what you accept, conservative in what you send."**

- Accept varied input formats (dates, phone numbers, addresses)
- Parse and normalise user input silently
- Display output in a clean, consistent format
- Forgive typos, extra spaces, and formatting inconsistencies

### Goal-Gradient Effect

**"Motivation increases as users approach their goal."**

- Show progress bars in multi-step processes
- Start progress indicators slightly filled (e.g. "Step 1 of 4" not "0 of 4")
- Loyalty programs and gamification leverage this principle
- Checklist completion indicators motivate task finishing

---

## 4. Typography & Readability

### Line Length (Measure)

| Context | Optimal range |
|---|---|
| Body text (web) | **45-85 characters** per line (including spaces) |
| Ideal sweet spot | **65 characters** (2.5x the Roman alphabet) |
| Mobile | Prioritise readable font size over ideal measure |

**Too long:** Reader fatigue, difficulty finding next line start.
**Too short:** Breaks reading rhythm, disrupts word groups.

### Font Size

- Body text: **16px minimum** on desktop, **16px minimum** on mobile (prevents iOS zoom)
- Don't scale font size proportionally to viewport width without limits
- Large text on large screens disrupts horizontal reading flow -- use narrower columns instead
- Test on standard-resolution monitors, not just retina displays

### Line Height

- Standard ratio: **~150%** of font size (1.5 line-height)
- Smaller text needs more generous line height
- Too tight: horizontal reading suffers, line doubling increases
- Too loose: lines visually separate, paragraphs lose cohesion

### Hierarchy Through Typography

- Use **size, weight, and spacing** -- not just bold/italic -- to create distinct levels
- Maximum 2-3 font families per design
- Headings: 1.2-1.3x larger than the level below them
- Body text at a weight/size comfortable for sustained reading

---

## 5. Color & Contrast

### Contrast for Readability

| Element | Minimum ratio (WCAG AA) |
|---|---|
| Normal text (< 24px) | **4.5:1** |
| Large text (>= 24px or 18.8px bold) | **3:1** |
| UI components, icons | **3:1** |

- Body text needs near-maximum contrast for fluent readability
- Secondary elements (footnotes, captions) use lower contrast to establish hierarchy
- **Not everything can be at maximum contrast** -- hierarchy requires contrast differences
- Test on standard-resolution displays, not just retina (antialiasing degrades small text contrast)

### Color as Communication

- **Never convey information through colour alone** -- always add a secondary indicator (icon, text, pattern)
- Red/black is problematic for protan colour vision -- avoid for text or semantic elements
- Luminance perception is the same for colour-blind users -- lightness contrast always works
- Use colour to reinforce hierarchy, not to create it

### Dark Mode Considerations

- WCAG 2 contrast ratios are less reliable for dark mode -- consider APCA (Accessible Perceptual Contrast Algorithm)
- Light text on dark backgrounds needs different weight/size adjustments than dark-on-light
- Reduce pure white text on pure black -- use off-white on dark grey to reduce eye strain

---

## 6. Whitespace & Spacing

### Principles

- **Whitespace is not wasted space** -- it is an active design element that creates hierarchy, grouping, and breathing room
- **Micro whitespace:** Space within elements (padding, line height, letter spacing)
- **Macro whitespace:** Space between elements (margins, section gaps, content gutters)
- More whitespace around an element = more visual weight and importance
- Consistent spacing creates rhythm; inconsistent spacing creates visual noise

### Spacing System

Use a **consistent spacing scale** based on a base unit (typically 4px or 8px):

```
4px  -- tight: between related inline elements
8px  -- compact: between related items in a list
16px -- default: between form fields, list items
24px -- comfortable: between content groups
32px -- spacious: between major sections
48px -- generous: between page-level sections
64px -- dramatic: hero sections, major visual breaks
```

**Rule:** Related elements get less space between them than unrelated elements. This is Gestalt proximity in practice.

---

## 7. Navigation Design

### The Three Questions

Every page must answer these for the user:
1. **"Where am I?"** -- current location indicator (active state, breadcrumbs, page title)
2. **"Where can I go?"** -- visible navigation options
3. **"Where have I been?"** -- visited state, breadcrumbs, history

Most responsive navigation solutions handle only #2 and forget #1 and #3.

### Navigation Patterns

| Pattern | Use when | Avoid when |
|---|---|---|
| **Persistent top nav** | <= 7 items, simple hierarchy | Complex multi-level structures |
| **Simple toggle** | Single-level, many items | Multi-level hierarchies |
| **Multi-level toggle** | Two-level hierarchy (sweet spot) | > 2 levels of depth |
| **Off-canvas / hamburger** | Complex menus, mobile-first | Desktop with enough space to show nav |
| **Tab bar (mobile)** | 3-5 primary destinations | > 5 items |

### Best Practices

- Always label hamburger icons with "Menu" text -- icons alone are ambiguous
- Breadcrumbs at all viewport sizes, not just desktop
- Build navigation progressively -- it must work without JavaScript
- Show the current page indicator in responsive navigation (most fail at this)
- Simplify information architecture before choosing a pattern -- the pattern cannot fix a bad IA

### Red Flags

- Complex mega-menus on mobile
- Navigation that hides the current page indicator
- Icon-only navigation without labels
- More than 3 levels of nested navigation

---

## 8. Form Design

### Structure & Layout

- **Labels above fields** -- closest possible visual proximity
- **Never use placeholder text as labels** -- it disappears on focus
- **Size fields proportionally** to expected input length (postcode = short, address = long)
- **One column for forms** -- multi-column forms increase completion time by 15-25%
- **Group related fields** with visible boundaries (fieldsets) and reduce space within groups
- **Auto-focus the first field** to reduce interaction cost

### Input Optimisation

- Match keyboard to input type: `type="email"`, `type="tel"`, `type="number"`
- Use input masking for formatted data (phone, dates, credit cards)
- Enable autocomplete/autofill (30% faster completion per Google research)
- Provide a "show password" toggle instead of "confirm password" fields
- **Avoid dropdowns on mobile** -- use radio buttons, segmented controls, or steppers instead
- Keep fields in single inputs -- don't split phone numbers or dates across multiple fields

### Validation

- **Validate inline after the user leaves the field** (on blur), not while typing
- Show errors next to the field, not in a summary at the top only
- Use plain language: "Email address must include @" not "Invalid format"
- **Never rely on colour alone** for error indication -- add icons and text
- Mark only optional fields (if most are required); avoid asterisk notation
- Protect user input: persist form data across accidental page reloads

### Reducing Friction

- Remove every field that is not strictly necessary (most forms can cut 20-60% of fields)
- Explain why sensitive data is requested ("We need your phone for delivery updates")
- Use geolocation, camera scanning, and biometrics where appropriate
- Make the form appear short -- perceived complexity reduces completion rates more than actual complexity

---

## 9. Button & Interactive Element Design

### Visual Design

- Buttons must **look clickable** -- use shadows, borders, or colour fills to signal interactivity
- **Rectangular with rounded corners** is the safest, most recognisable shape
- Consistent button shapes within an interface -- never mix three different styles

### Sizing & Touch Targets

- Minimum touch target: **10mm x 10mm** (approximately 44x44 CSS pixels)
- Add breathing room between adjacent buttons to prevent mis-taps
- Primary action buttons should be the largest interactive element in their context

### Primary vs Secondary Actions

- **Primary action** (Submit, Save, Continue): strongest visual weight -- filled, high-contrast colour
- **Secondary action** (Cancel, Back): weakest visual weight -- outlined or text-only
- **Destructive action** (Delete, Remove): visually distinct, requires confirmation
- Never give Cancel the same visual weight as Submit -- this causes errors

### Labeling

- Use **action verbs** describing the outcome: "Create Account", "Send Message", "Download PDF"
- Labels must answer: "What happens when I click this?"
- Avoid vague labels: "OK", "Submit", "Yes", "Click Here"

### States

Every button needs these visual states:
- **Default** -- resting appearance
- **Hover** -- cursor feedback (desktop)
- **Active/Pressed** -- confirmation of click
- **Focused** -- keyboard navigation indicator (never remove focus outline without replacement)
- **Disabled** -- visually muted, explains why (prefer keeping buttons enabled and validating on submit)
- **Loading** -- spinner or progress indication during async actions

---

## 10. Nielsen's 10 Usability Heuristics (Applied)

Use these as a **review checklist** after building any interface:

| # | Heuristic | Design check |
|---|---|---|
| 1 | **Visibility of system status** | Does the user always know what's happening? Loading states, progress bars, confirmations. |
| 2 | **Match real-world language** | Does the UI use the user's vocabulary, not developer jargon? |
| 3 | **User control & freedom** | Can users undo, go back, and escape without penalty? |
| 4 | **Consistency & standards** | Do similar elements look and behave the same everywhere? |
| 5 | **Error prevention** | Are error-prone conditions eliminated? Confirmation for destructive actions? |
| 6 | **Recognition over recall** | Are options visible? Does the user need to remember things between screens? |
| 7 | **Flexibility & efficiency** | Are there shortcuts for power users? Can the interface be customised? |
| 8 | **Aesthetic & minimalist design** | Does every element serve a purpose? Is noise removed? |
| 9 | **Help users recover from errors** | Are error messages in plain language with a suggested fix? |
| 10 | **Help & documentation** | Is help searchable, contextual, concise, and task-oriented? |

---

## Quick Decision Reference

### "Should I use X or Y?"

| Decision | Recommendation | Why |
|---|---|---|
| Hamburger vs visible nav | Visible nav when space allows | Hidden nav reduces discoverability by 50%+ |
| Dropdown vs radio buttons (mobile) | Radio buttons | Dropdowns require 2 taps and hide options |
| Placeholder vs label | Always use labels | Placeholders disappear, violating recognition over recall |
| Modal vs inline | Inline when possible | Modals interrupt flow and require focus management |
| Carousel vs static content | Static content | Carousels have < 1% interaction rate past first slide |
| Infinite scroll vs pagination | Pagination for goal-oriented tasks | Infinite scroll loses position, breaks "back" button |
| Icon-only vs icon+label | Icon + label | Icons alone are ambiguous except for universal ones (close, search) |
| Confirm password vs show toggle | Show/hide toggle | Single field with toggle reduces errors |
| Disabled button vs enabled+validate | Enabled + validate on submit | Disabled buttons don't explain what's wrong |

---

## Sources & Further Reading

- Nielsen Norman Group: [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [F-Shaped Pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- Laws of UX: [lawsofux.com](https://lawsofux.com/)
- Smashing Magazine: [UX Design Guide](https://www.smashingmagazine.com/guides/ux-design/), [Button Design](https://www.smashingmagazine.com/2016/11/a-quick-guide-for-designing-better-buttons/), [Responsive Navigation](https://www.smashingmagazine.com/2017/04/overview-responsive-navigation-patterns/), [Mobile Form Design](https://www.smashingmagazine.com/2018/08/best-practices-for-mobile-form-design/), [Gestalt Principles](https://www.smashingmagazine.com/2014/03/design-principles-visual-perception-and-the-principles-of-gestalt/), [Visual Hierarchy](https://www.smashingmagazine.com/2015/02/design-principles-dominance-focal-points-hierarchy/), [Color & Contrast](https://www.smashingmagazine.com/2022/09/realities-myths-contrast-color/)
- Interaction Design Foundation: [Visual Hierarchy & Eye Movement](https://www.interaction-design.org/literature/article/visual-hierarchy-organizing-content-to-follow-natural-eye-movement-patterns)
