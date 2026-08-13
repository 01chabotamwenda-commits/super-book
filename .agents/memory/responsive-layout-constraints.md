---
name: Responsive layout constraints
description: Rules for preventing nested app grids and row metadata from overlapping at responsive widths
---

Responsive layouts should use shrink-safe columns and let secondary panels or metadata yield before primary content and actions compete for the same width.

**Why:** The study planner’s nested course, topic, and reference panels used content-sized minimums and fixed metadata tracks, so long labels overlapped neighboring columns at ordinary laptop and tablet widths.

**How to apply:** Add `min-width: 0` to grid/flex containers and children, use `minmax(0, 1fr)` for flexible tracks, and stack nested panels or hide optional metadata until the available width can support them.