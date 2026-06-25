---
name: arkui-performance-audit
description: Audit HarmonyOS ArkUI runtime performance from code first, then guide profiler or hilog evidence collection when needed.
---

# ArkUI Performance Audit

## Workflow
1. Classify the symptom: slow first render, janky scrolling, high CPU, memory growth, hangs, slow navigation, or excessive recomposition.
2. Review the target page/component code first.
3. If code review is inconclusive, collect runtime evidence with DevEco Studio profiling tools, HDC logs, screenshots, or repo-specific telemetry.
4. Separate code-level suspicion from measured evidence.
5. Recommend small fixes and define how to verify them.

## Code Review Focus
- Expensive work inside UI construction or frequently re-evaluated computed paths.
- Unstable item identity in repeated lists.
- Broad store subscriptions that redraw more UI than necessary.
- Large synchronous image processing, JSON parsing, or sorting on the UI path.
- Layout nesting that makes scrolling or resizing expensive.
- Animations applied to large trees rather than local elements.

## Evidence Collection
- Use `harmonyos_hilog` to collect app logs around the target flow.
- Use screenshots to confirm the exact UI state being measured.
- Use DevEco Studio profiler exports when available for CPU, memory, frame, or allocation evidence.
- Compare before/after only when the same device, build mode, and user flow are used.

## Remediation Defaults
- Move expensive derived work out of UI construction.
- Precompute or cache domain data in stores/services when inputs change.
- Stabilize list identity.
- Narrow observation/subscription scope.
- Downsample or defer large media work.
- Reduce layout depth where the visible hierarchy is unnecessarily complex.

## Report Format
Include:
- target flow and device/emulator;
- build mode and app version if known;
- top issues ordered by expected impact;
- evidence source for each issue;
- concrete fixes and verification steps.
## References
- `references/code-smells.md`: ArkUI performance smell catalog and fix patterns.
- `references/profiling-intake.md`: evidence checklist before runtime diagnosis.
- `references/report-template.md`: structured performance audit output.

