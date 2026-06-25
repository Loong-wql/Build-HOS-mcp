# Forms

## Defaults
- Keep draft form state separate from persisted model state.
- Validate locally before invoking service calls.
- Disable submit while saving and show a clear error state on failure.
- Keep cancel/reset behavior explicit.

## Checks
- Can the user recover from validation and network errors?
- Are destructive actions confirmed where appropriate?
- Is the submit action idempotent or guarded against double taps?
