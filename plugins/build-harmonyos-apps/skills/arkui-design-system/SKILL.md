---
name: arkui-design-system
description: Implement and review HarmonyOS ArkUI visual design using native components, platform spacing, typography, color, motion, and accessibility patterns.
---

# ArkUI Design System

## Overview
This is not a Liquid Glass clone. The iOS plugin has a Liquid Glass skill because iOS has a specific platform API and design language for that. HarmonyOS work should instead follow ArkUI and HarmonyOS-native visual patterns already present in the target app.

## Workflow
1. Identify the existing design system: colors, typography, spacing, components, icons, and motion.
2. Use native ArkUI controls and platform-consistent interaction states.
3. Keep screens dense enough for app workflows while preserving readable hierarchy.
4. Add loading, empty, disabled, error, focus, and pressed states for interactive elements.
5. Validate on device or emulator with screenshots when possible.

## Review Checklist
- Component choices match platform expectations and existing app conventions.
- Text fits in Chinese and English if the app is localized.
- Touch targets are large enough and visually clear.
- Color contrast is sufficient in light and dark modes where supported.
- Motion is local and purposeful rather than applied broadly.
- UI state is represented explicitly, not hidden in side effects.

## Implementation Defaults
- Prefer existing project tokens and components.
- Avoid one-off visual systems for a single page.
- Do not introduce decorative complexity that makes repeated app workflows slower to scan.
- Keep responsive behavior explicit for phones, tablets, foldables, or other target devices.
## References
- `references/visual-checklist.md`: platform fit, UI states, accessibility, responsive layout, and localization checks.

