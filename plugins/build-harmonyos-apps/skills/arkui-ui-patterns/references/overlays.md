# Overlays

## Defaults
- Represent mutually exclusive dialogs or sheets with one enum-like state, not several booleans.
- Keep modal content responsible for its own confirm/cancel actions when possible.
- Ensure backdrop, focus, and dismissal behavior match app conventions.

## Checks
- Can two overlays appear at once accidentally?
- Does navigation dismiss transient UI in a predictable way?
- Are loading and disabled states visible inside the overlay?
