# ArkUI Refactor Patterns

## Component Extraction
Extract a component when a region has its own inputs, interaction state, loading/error state, or repeated structure.

## Handler Extraction
Move non-trivial inline actions into named handlers. Keep the UI readable as layout plus event references.

## State Narrowing
Keep route-specific and modal state near the page that owns it. Shared stores should represent shared domain state, not temporary widget state.

## Behavior Preservation
Refactors should build after each step and should not change routing, persistence, or service semantics unless requested.
