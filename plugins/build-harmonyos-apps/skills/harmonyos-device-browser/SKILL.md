---
name: harmonyos-device-browser
description: Mirror or visually inspect a HarmonyOS device/emulator through screenshots and future browser streaming. Use when a user wants visual proof of a running HarmonyOS app or preview-like feedback.
---

# HarmonyOS Device Browser

## Overview
The iOS plugin uses `serve-sim` to stream Simulator frames into the Codex in-app browser. HarmonyOS does not have an equivalent bundled here yet. This skill provides the closest current workflow: repeated HDC/uitest screenshots, UI layout dumps, basic coordinate input, and log evidence, with a clear boundary for future streaming support.

## Visual Proof Workflow
1. Build, install, and launch through `harmonyos-debugger-agent`.
2. Call `harmonyos_ui_screenshot` or `harmonyos_screenshot` and inspect the returned local PNG path.
3. Call `harmonyos_dump_layout` when selecting tappable text, buttons, or input fields.
4. Use `harmonyos_tap`, `harmonyos_swipe`, `harmonyos_press_key`, and `harmonyos_type_text` for basic interaction, then capture another screenshot/layout.
5. Pair screenshots with `harmonyos_hilog` output when the UI state depends on runtime data.

## ArkUI Preview Boundary
- Prefer DevEco Studio Preview for component-level ArkUI preview rendering when available.
- Do not edit project build files only to force preview support.
- If a repo has documented preview commands, follow the repo documentation and report the command used.

## Future MCP Parity Target
A fuller implementation should add:
- a device-frame streaming server backed by HDC screenshot or screen-record APIs;
- semantic element helpers such as tap-by-text, wait-for-text, and assert-visible built on `harmonyos_dump_layout`;
- browser-hosted ArkUI preview rendering if DevEco exposes a CLI preview interface.

Until streaming is implemented, do not claim live browser mirroring parity with the iOS plugin. Coordinate input is available, but it should be paired with screenshots or layout evidence.