---
name: harmonyos-memory-leaks
description: Investigate HarmonyOS memory growth, leaked resources, and retained ArkUI/service objects with code review plus profiler evidence.
---

# HarmonyOS Memory Leaks

## Workflow
1. Define the exact flow that should release memory or resources.
2. Build, install, launch, and drive that flow on a fixed target.
3. Collect evidence from DevEco Studio memory profiler, HDC/hilog, or repo instrumentation.
4. Identify app-owned retained types, listeners, timers, subscriptions, native resources, or background tasks.
5. Patch the smallest retaining edge.
6. Re-run the same flow and compare the same metric.

## Code Review Focus
- Event listeners or callbacks not removed when a page/ability is destroyed.
- Timers, intervals, workers, or async tasks that outlive the page.
- Global stores retaining page-specific objects.
- Media, file, network, sensor, or native handles without explicit cleanup.
- Closures that capture large objects or page instances longer than intended.

## Evidence Rules
- Do not claim a leak fix from lower total memory alone.
- Identify the intended lifetime: page, ability, session, account, process, or background task.
- Tie the fix to a retaining path or concrete resource cleanup responsibility.
- Report before/after evidence when available.

## Output
A useful report includes:
- exact reproduction steps;
- device/emulator and build mode;
- evidence source and artifact paths if available;
- suspected retained app-owned types/resources;
- applied or proposed fix;
- remaining uncertainty.
## References
- `references/resource-checklist.md`: common retained resources and proof standard.
- `references/report-template.md`: memory investigation report format.

