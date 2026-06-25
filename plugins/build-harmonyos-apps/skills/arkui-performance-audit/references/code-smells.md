# ArkUI Performance Code Smells

## High-Impact Smells
- Expensive sorting, filtering, parsing, image processing, or formatting inside UI construction.
- Repeated list rows without stable domain identity.
- Broad store reads that redraw an entire page for a row-level change.
- Large synchronous work in input handlers before visual feedback appears.
- Deep layout trees inside large scrolling regions.
- Animations applied to large containers instead of local elements.

## Fix Patterns
- Move derived data to services, stores, or memoized helpers updated when inputs change.
- Split broad stores into narrower observable slices.
- Pre-size or downsample media before rendering.
- Stabilize keys for repeated rows.
- Replace duplicated conditional branches with a stable base layout and local state changes.
