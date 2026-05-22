# Gestalt Principles -- Deep Reference

Detailed descriptions and UI application examples for each Gestalt principle. Use this reference when making decisions about visual grouping, layout structure, and element relationships.

Source: Smashing Magazine, "Design Principles: Visual Perception And The Principles Of Gestalt"

---

## 1. Law of Pragnanz (Good Figure / Simplicity)

People perceive complex images as the simplest possible form. We prefer things that are simple, clear, and ordered because they require less cognitive processing.

**UI application:**
- Clean, uncluttered interfaces with clear structure
- Break complex information into simple, scannable components
- Favour straightforward iconography over detailed illustrations
- Organise navigation hierarchically rather than presenting all options simultaneously
- Progressive disclosure: show complexity only when needed

---

## 2. Proximity

Objects positioned close together are perceived as related. Spacing is a grouping mechanism without requiring borders or backgrounds.

**UI application:**
- Clustered navigation items in header menus
- Form fields grouped by topic with tighter internal spacing and larger gaps between groups
- Labels positioned closer to their input than to the previous input
- Related product cards displayed adjacent to each other
- Whitespace between sections signals "new topic"

**Common mistake:** Equal spacing everywhere -- this makes everything look equally related and removes hierarchy.

---

## 3. Similarity

Elements sharing visual characteristics (colour, shape, size, weight, texture) are perceived as related. Once one element is identified with a meaning, similar elements carry that same meaning.

**UI application:**
- Consistent link styling signals clickability
- Icon families with uniform stroke weight, dimensions, and style
- Colour-coding related sections or data categories
- Typography hierarchy: same size/weight = same importance level
- Button styling: similar style = similar function

**Critical rule:** Breaking similarity creates emphasis. A red item in a list of blue items demands attention (see Von Restorff Effect).

---

## 4. Closure

The brain completes incomplete shapes and patterns. We fill in missing information to form a complete whole.

**UI application:**
- Carousel items partially visible at the edge suggest more content to scroll
- Progress indicators with incomplete fills show how much remains
- Truncated text with "..." indicates expandable content
- Logo designs with intentional gaps that viewers complete mentally
- Dotted borders or dashed lines suggest containment without solid boundaries

---

## 5. Figure-Ground

Elements separate into figure (focal element) and ground (background). This relationship can be stable or unstable.

**UI application:**
- High-contrast CTAs against neutral backgrounds
- Cards with shadows separating content from the page
- Dark overlays on hero images making text readable
- Modal windows with dimmed background (background becomes subordinate)
- Sidebar navigation visually distinct from main content

**Factors determining figure vs ground:**
- **Size:** Smaller overlapping objects tend to be figure
- **Convexity:** Convex shapes appear as figures more readily
- **Contrast:** Higher contrast elements appear as figures
- **Position:** Lower elements tend to be perceived as figures (gravity)

---

## 6. Common Region

Elements enclosed within the same boundary are perceived as grouped and related.

**UI application:**
- Cards containing form fields for related information
- Coloured background sections grouping related content
- Bordered panels separating different information types
- Table rows with alternating backgrounds
- Navigation sections with distinct background treatment

**Power:** Common region can override proximity -- items far apart but within the same card appear more related than close items in different cards.

---

## 7. Continuity

Elements arranged on a line or curve appear more related than those not on alignment. The eye follows the path.

**UI application:**
- Aligned text and visual elements along invisible grid lines
- Step indicators showing sequential progression
- Timeline designs showing chronological flow
- Breadcrumbs following a linear path
- Diagonal or curved layouts guiding eye movement through content

---

## 8. Uniform Connectedness

Visually connected elements are perceived as most strongly related. **This is the strongest grouping principle.**

**UI application:**
- Lines connecting steps in a multi-step process
- Visual connectors between related data points in charts
- Tree view connectors in hierarchical navigation
- Relationship indicators in org charts or flow diagrams

**Note:** Connecting lines do not require direct contact with elements -- visual alignment is sufficient.

---

## 9. Common Fate (Synchrony)

Elements moving together or toward the same destination are perceived as related, regardless of distance or visual similarity.

**UI application:**
- Animated hover states affecting multiple related elements simultaneously
- Loading indicators showing grouped processes
- Swipe gestures revealing related content as a unit
- Accordion sections expanding/collapsing as a group
- Parallax layers moving at the same speed

---

## 10. Symmetry and Order

Humans perceive objects as symmetrical shapes centred around a midpoint. Symmetry creates feelings of stability and balance.

**UI application:**
- Centred layouts for formal, trustworthy presentations (landing pages, about pages)
- Balanced grid layouts in portfolios or galleries
- Symmetrical form layouts that feel stable and professional
- Mirror-image button placement (Cancel | Submit)

**Contrast:** Intentional asymmetry creates dynamism and draws attention to the asymmetric element.

---

## 11. Parallelism

Elements parallel to each other are seen as more related, appearing to point or move in the same direction.

**UI application:**
- Aligned button rows
- Consistent edge alignment in grid layouts
- Uniform line thickness in icon families
- List items with consistent indentation

---

## 12. Focal Points

Elements with emphasis, contrast, or distinction capture viewer attention. The eye is drawn to what differs from surroundings.

**UI application:**
- Highlighted CTA buttons using contrasting colours
- Larger text drawing attention to key information
- Drop shadows emphasising important elements
- Unique shapes among uniform elements (star rating among text)

**Dependency:** Focal points require similarity among other elements -- without a consistent baseline, nothing stands out.

---

## 13. Past Experiences

Elements are perceived based on prior experience and cultural conventions. This is the weakest principle but explains culturally-learned associations.

**UI application:**
- Traffic light colours for status (red = error, yellow = warning, green = success)
- Home icon for main page
- Magnifying glass for search
- Floppy disk for save (legacy but persistent)
- Shopping cart for e-commerce

**Warning:** Past experiences are culturally dependent. Always verify icon/colour meanings for your target audience.
