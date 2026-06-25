---
name: arkui-ui-patterns
description: Build and refactor HarmonyOS ArkUI UI with ArkTS component, navigation, state, layout, and preview patterns.
---

# ArkUI UI Patterns

## Quick Start

### Existing project
- Find the target page/component and nearby local patterns first.
- Inspect `@Entry`, `@Component`, route configuration, shared stores, and service injection already used by the repo.
- Keep state ownership narrow: component-local state stays local; app/session state belongs in explicit stores or services.
- Build with ArkUI-native layout primitives and avoid introducing web-style abstractions unless the repo already uses them.

### New screen or feature
- Identify the page entry point, navigation route, and data dependencies before writing UI code.
- Split large UI into focused components with explicit parameters.
- Add loading, empty, error, and success states when the screen depends on async data.
- Build and verify before expanding the feature.

## State Ownership
- Use local component state for transient UI state.
- Use explicit stores or injected services for shared domain state.
- Avoid broad global mutable state for route-specific or view-specific values.
- Keep async work out of render-heavy component expressions; trigger it from lifecycle or explicit actions.

## Layout and Interaction
- Prefer predictable ArkUI layout composition over deeply nested conditional branches.
- Keep navigation, modal presentation, and transient UI state represented by one clear source of truth.
- Use stable keys/identities for repeated collections.
- Make touch targets, disabled states, loading states, and error states explicit.

## Anti-Patterns
- One huge page component that mixes layout, routing, network calls, business logic, and formatting.
- Multiple booleans for mutually exclusive overlays or dialogs.
- Expensive mapping/filtering work performed repeatedly inside UI construction.
- Hidden global side effects for navigation or ability handoff.

## Validation
- Run the project build with `harmonyos_build` or the repo's documented command.
- Launch the screen when possible and capture a screenshot.
- If the build fails, fix the first concrete compiler or type error before changing unrelated code.
## References
- `references/components-index.md`: choose focused ArkUI component guidance.
- `references/app-wiring.md`: app shell, routes, services, and page ownership.
- `references/async-state.md`: loading, retry, stale response, and refresh states.
- `references/lists.md`: stable identity, row cost, empty/pagination states.
- `references/forms.md`: draft state, validation, save/cancel behavior.
- `references/overlays.md`: modal/dialog state and dismissal behavior.
- `references/theming.md`: tokens, localization, accessibility, responsive layout.

