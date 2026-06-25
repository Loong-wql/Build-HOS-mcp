# Async State

## State Model
Represent async UI with explicit states: idle, loading, loaded, empty, error, and refreshing when needed.

## Defaults
- Start loading from lifecycle or an explicit user action, not from repeated UI construction paths.
- Keep request identity stable so stale responses cannot overwrite newer state.
- Expose retry from the error state.
- Show empty state separately from error state.

## Checks
- Is cancellation or stale response handling needed when route parameters change?
- Does the screen remain usable when partial data is available?
- Are loading indicators scoped to the region being updated?
