---
name: harmonyos-system-surfaces
description: Design HarmonyOS system-facing app surfaces such as UIAbility entry points, Want routing, widgets/cards, ExtensionAbility patterns, and cross-device handoff boundaries.
---

# HarmonyOS System Surfaces

## Overview
This is the HarmonyOS counterpart to iOS App Intents guidance. Do not map Apple App Intents one-to-one. Start from HarmonyOS concepts: abilities, Want parameters, widgets/cards, extension abilities, and distributed or system entry points supported by the app's SDK level.

## Workflow

### 1. Start with user actions
- Identify the 1-3 actions that should be reachable outside the main screen.
- Prefer concrete verbs: open, continue, create, search, inspect, share, scan, or control.
- Do not mirror the whole navigation tree as external entry points.

### 2. Define routing contracts
- Use a small, explicit Want parameter contract for external entry.
- Keep external route identifiers stable and versionable.
- Validate parameters before routing into a page.
- Keep business logic in services, not in entry-point glue code.

### 3. Choose the surface
- Use a UIAbility route when the user should land in the app.
- Use widget/card surfaces for glanceable information or quick actions where the project supports them.
- Use an ExtensionAbility-style approach only when the SDK and feature actually require it.
- For cross-device or distributed features, document device assumptions and failure behavior.

### 4. Validate
- Build the app.
- Launch the ability with representative parameters where possible.
- Confirm the app routes to the expected page and handles missing/invalid parameters.
- Summarize exposed actions, accepted parameters, and fallback behavior.

## Anti-Patterns
- Treating HarmonyOS system surfaces as a direct clone of iOS App Intents.
- Passing full internal model objects through Want parameters.
- Scattering routing logic across unrelated pages.
- Adding broad global side effects to make one external entry point work.
## References
- `references/first-pass-checklist.md`: choose actions, surfaces, contracts, and verification steps.
- `references/want-routing.md`: stable external parameter and internal route mapping.
- `references/templates.md`: open route, quick action, and widget/card templates.

