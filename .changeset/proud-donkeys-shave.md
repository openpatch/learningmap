---
"@learningmap/learningmap": minor
---

Make background nodes easier to work with and new nodes easier to see

- Add a layers panel listing every node, so nodes covered by another one can still be reached, selected, locked and reordered
- Add bring to front / forward / backward / send to back controls to the node panel and the multi selection panel
- Add per node locking, which stops a background image from being dragged or selected by accident while it can still be edited from the layers panel
- Alt-click cycles through the nodes stacked under the cursor
- Selected nodes are lifted above the stack so their resize handles stay reachable
- Fix text nodes defaulting to a near-invisible light grey; the default now follows the background colour
- Empty image and text nodes render a visible placeholder and image nodes start at a usable size
- Fix nodes added with a keyboard shortcut getting no zIndex, which put them below every other node
- New nodes are placed inside the visible canvas, cascade instead of stacking on each other, and are selected on creation
- Text nodes can be edited in place with a double-click
- Fix the clickable area of a rotated text node not matching what is drawn
- Fix undo, copy, paste and delete being disabled whenever a node was selected
