# Laws of UX -- Complete Reference

All 30 laws from lawsofux.com with practical design implications. Use this reference when making interaction design decisions, evaluating UI patterns, or reviewing designs for usability.

Source: Laws of UX (lawsofux.com), based on research from psychology, cognitive science, and HCI.

---

## Perception & Cognition

### Aesthetic-Usability Effect
Users perceive aesthetically pleasing design as more usable. Visual polish increases tolerance for minor usability issues. But aesthetics cannot compensate for fundamentally broken interactions.

### Cognitive Load
The amount of mental resources needed to understand and interact with an interface. Reduce by: simplifying choices, using familiar patterns, providing clear labels, removing visual noise.

### Cognitive Bias
Systematic errors in thinking that influence perception and decision-making. Design for these biases rather than against them: anchoring (show reference prices), framing (positive language), social proof (reviews, usage counts).

### Mental Model
A compressed model based on what users think they know about a system. Interfaces matching existing mental models require less learning. Research users' expectations before designing.

### Selective Attention
Users focus only on stimuli relevant to their current goal. Reduce distracting elements. Highlight goal-relevant information. Banner blindness is selective attention in action.

### Working Memory
A cognitive system that temporarily holds 5-9 items needed for current tasks. Support with: visible labels, persistent breadcrumbs, autocomplete, and clipboard-friendly formats.

---

## Decision Making

### Hick's Law
Decision time increases with the number and complexity of choices. Reduce options, use progressive disclosure, highlight recommended choices, categorise long lists.

### Choice Overload
People become overwhelmed with too many options. Limit visible choices. Use smart defaults. Provide filtering and sorting for large sets.

### Paradox of the Active User
Users never read manuals -- they start using software immediately. Design for intuitive exploration. Provide contextual help, not documentation walls.

### Pareto Principle (80/20 Rule)
80% of effects come from 20% of causes. Identify and optimise the 20% of features users use most. Don't over-invest in rarely-used edge cases.

---

## Interaction

### Fitts's Law
Time to reach a target = f(distance, size). Make important targets large and close. Corners and edges of the screen are easiest to reach (infinite edge effect). Minimum touch target: 10mm x 10mm.

### Doherty Threshold
Productivity soars when response time < 400ms. Use: optimistic UI, skeleton screens, progress indicators, and animated transitions to mask latency.

### Postel's Law (Robustness)
Be liberal in what you accept, conservative in what you send. Accept varied input formats. Parse and normalise silently. Display clean, consistent output.

### Goal-Gradient Effect
Motivation increases as users approach their goal. Show progress bars. Start slightly filled. Use completion indicators and checklists.

### Parkinson's Law
Tasks expand to fill available time. Set time constraints in workflows. Use deadlines and countdown timers where appropriate.

### Flow
A mental state of full immersion. Design for sustained engagement: clear goals, immediate feedback, appropriate challenge level, no interruptions.

---

## Memory

### Miller's Law
Working memory holds 7 +/- 2 items. Chunk information into groups of 5-9. Format: phone numbers, credit cards, IP addresses. Limit navigation items per level.

### Serial Position Effect
Users best remember the first and last items in a series. Place critical information at beginning and end. Navigation: most important items first and last.

### Von Restorff Effect (Isolation Effect)
The item that differs from the rest is most remembered. Make the primary CTA visually distinct. Highlight the recommended plan. Use sparingly -- if everything is highlighted, nothing stands out.

### Zeigarnik Effect
People remember uncompleted tasks better than completed ones. Use progress indicators, saved drafts, and "continue where you left off" patterns to leverage this.

### Peak-End Rule
Experiences are judged by their peak and ending, not the average. Optimise critical moments: first impression, key interaction, final confirmation. Handle errors gracefully -- they are peak moments.

---

## Visual Perception

### Law of Common Region
Elements within the same boundary are perceived as grouped. Use cards, panels, borders, and background colours to establish relationships.

### Law of Proximity
Nearby objects are perceived as related. Spacing is the primary grouping mechanism. Related items close together, unrelated items farther apart.

### Law of Pragnanz (Simplicity)
Ambiguous or complex images are interpreted in the simplest form possible. Simplify visual complexity. Use clean shapes and clear iconography.

### Law of Similarity
Visually similar elements are perceived as related. Consistent styling for related components. Break similarity strategically for emphasis.

### Law of Uniform Connectedness
Visually connected elements are perceived as most related. Use lines, arrows, and visual connectors to show relationships.

---

## System Design

### Tesler's Law (Conservation of Complexity)
Every system has irreducible complexity. The question is who deals with it -- the user or the system. Move complexity from user to system: smart defaults, auto-detection, contextual help.

### Occam's Razor
Among equally effective solutions, choose the simplest. Don't add features that complicate without proportional benefit. Simple solutions are easier to maintain, test, and explain.

### Chunking
Break information into meaningful groups. Related to Miller's Law but focuses on the grouping strategy rather than the capacity limit. Use visual and semantic grouping together.
