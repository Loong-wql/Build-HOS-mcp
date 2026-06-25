# Lists

## Defaults
- Use stable item identifiers from the domain model.
- Keep row components small and pure where possible.
- Move formatting and expensive derived values outside row construction when the list is large.
- Provide loading, empty, error, and pagination states deliberately.

## Pitfalls
- Using array index as identity when rows can reorder or delete.
- Performing network or storage work from row rendering.
- Rebuilding the entire page for a row-level selection change.
