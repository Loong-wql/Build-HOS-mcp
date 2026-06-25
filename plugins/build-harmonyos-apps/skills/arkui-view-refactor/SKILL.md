---
name: arkui-view-refactor
description: Refactor ArkTS ArkUI pages and components into smaller, explicit, testable structures without changing behavior.
---

# ArkUI View Refactor

## Goals
Refactor HarmonyOS ArkUI code toward small components, explicit state ownership, and readable top-to-bottom flow. Preserve behavior unless the user asks for a functional change.

## Ordering Guideline
Within a component, prefer a stable order:
- imports;
- type aliases and interfaces;
- constants;
- component state and injected dependencies;
- lifecycle hooks;
- event handlers and async helpers;
- UI build method;
- private subcomponents or extracted files.

Follow stronger local conventions when the repo already has them.

## Refactor Workflow
1. Identify the current component responsibilities: data loading, routing, rendering, interaction, formatting.
2. Extract repeated or logically distinct UI sections into dedicated components.
3. Move non-trivial inline event bodies into named handlers.
4. Move business rules into services, stores, or pure helpers.
5. Keep component parameters narrow; pass values, callbacks, or stores intentionally.
6. Build after each meaningful step.

## Defaults
- Prefer component extraction before adding a new state-management layer.
- Keep async side effects out of UI construction code.
- Do not introduce optional stores or delayed bootstrap patterns unless the existing app architecture requires them.
- Do not rewrite routing, persistence, or network layers as part of a visual refactor unless they are the direct cause of the issue.

## Large Component Handling
When a page has grown beyond easy review, split by visible sections and interaction ownership. A good extracted component should have a small API and an obvious reason to exist.
## References
- `references/refactor-patterns.md`: component extraction, handler extraction, state narrowing, and behavior preservation.

