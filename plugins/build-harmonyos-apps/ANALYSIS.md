# Build iOS Apps Plugin Analysis and HarmonyOS Mapping

## Source Checked

- Local installed plugin: `openai-curated-remote/build-ios-apps/0.1.2`.
- Shared plugin page: `https://chatgpt.com/plugins/share/bbf23ae552e240ffa3d5dfddc9737942` loaded as a plugin share page, but the actionable implementation details came from the locally installed plugin files.

## What Build iOS Apps Actually Contains

The iOS plugin has four layers:

1. Plugin manifest
   - Name: `build-ios-apps`.
   - Exposes skills from `./skills/`.
   - Exposes MCP servers from `./.mcp.json`.
   - UI metadata, icon, descriptions, default prompt, and category.

2. MCP tool layer
   - `.mcp.json` starts `xcodebuildmcp` through `npx`.
   - Enabled workflows include simulator, UI automation, debugging, and logging.
   - This is the main reason the plugin can do real build/run/debug work rather than only provide advice.

3. Skill layer
   - `ios-debugger-agent`: build/run/debug on Simulator with XcodeBuildMCP.
   - `ios-simulator-browser`: browser mirroring and SwiftUI preview host flow.
   - `ios-ettrace-performance`: focused ETTrace profiling workflow.
   - `ios-memgraph-leaks`: memgraph capture and leak proof workflow.
   - `ios-app-intents`: App Intents and system surface design.
   - `swiftui-liquid-glass`: iOS 26 Liquid Glass implementation and review.
   - `swiftui-performance-audit`: code-first SwiftUI performance audit.
   - `swiftui-ui-patterns`: SwiftUI navigation, state, async, previews, components.
   - `swiftui-view-refactor`: refactor large SwiftUI views.

4. Evidence discipline
   - Build before claiming success.
   - Screenshot or describe UI before interacting.
   - Do not claim performance or leak fixes without before/after evidence.
   - Use current platform docs when APIs may have changed.

## HarmonyOS Equivalent Design

| iOS plugin capability | HarmonyOS equivalent in this plugin | Parity status |
| --- | --- | --- |
| Xcode build/run/debug MCP | `harmonyosmcp` wrapping `hvigorw` and `hdc` | Partial, practical first version |
| Simulator discovery | `harmonyos_list_devices` via `hdc list targets` | Good enough if HDC is installed |
| Build app | `harmonyos_build` via `assembleHap` | Good, repo-specific args may be needed |
| Install app | `harmonyos_install_hap` | Good if HDC install syntax matches local SDK |
| Launch app | `harmonyos_launch_ability` via `aa start` | Good when bundle/ability are known |
| Logs | `harmonyos_hilog` | Basic but useful |
| Screenshots | `harmonyos_screenshot` via `snapshot_display` | Device-image dependent |
| UI automation | Not fully implemented | Needs input/tap/swipe support validated per SDK |
| Browser simulator mirror | Screenshot-based visual proof only | Not equal to `serve-sim` yet |
| SwiftUI patterns | ArkUI patterns | Good conceptual match |
| SwiftUI refactor | ArkUI refactor | Good conceptual match |
| SwiftUI performance | ArkUI performance | Good code-first match, runtime profiler depends on DevEco tooling |
| Memgraph leaks | HarmonyOS memory/resource retention workflow | Conceptual match; tool parity depends on profiler exports |
| App Intents | HarmonyOS abilities/Want/widgets/extensions | Conceptual match, not one-to-one |
| Liquid Glass | ArkUI design system guidance | Not equivalent; intentionally not cloned |

## What Was Built Here

Created plugin path:

`plugins/build-harmonyos-apps`

Created and updated files:`n
- `.codex-plugin/plugin.json`
- `.mcp.json`
- `README.md`
- `assets/build-harmonyos-apps.svg`
- `scripts/harmonyos-mcp-server.mjs`
- `skills/harmonyos-debugger-agent/SKILL.md`
- `skills/harmonyos-device-browser/SKILL.md`
- `skills/arkui-ui-patterns/SKILL.md`
- `skills/arkui-view-refactor/SKILL.md`
- `skills/arkui-performance-audit/SKILL.md`
- `skills/harmonyos-memory-leaks/SKILL.md`
- `skills/harmonyos-system-surfaces/SKILL.md`
- `skills/arkui-design-system/SKILL.md`

## Remaining Work for Stronger Parity

1. Validate HDC commands against the user's installed HarmonyOS SDK version.
2. Add tap/type/swipe tools if local HDC supports stable input injection.
3. Add package metadata parsing for `module.json5` and `app.json5` so bundle/ability can be inferred automatically.
4. Add DevEco profiler artifact readers if profiler exports are available in stable formats.
5. Add a real browser streaming helper if screen capture can be polled efficiently enough.
6. Add marketplace wiring when this plugin is ready to install into Codex UI.

## Self-Check

- I did not assume HarmonyOS has exact equivalents for all iOS-specific features.
- I separated implemented MCP tools from future parity targets.
- I avoided inventing a Liquid Glass equivalent for HarmonyOS.
- Some command details such as `snapshot_display` and HDC install behavior may vary by SDK/device image; these are implemented as practical defaults and must be validated locally.
## Gap-Fill Pass Against Local iOS Plugin

After inspecting the local `build-ios-apps/0.1.2` cache, these gaps were closed:

- Added plugin-level `agents/openai.yaml`, mirroring the iOS plugin's UI metadata layer.
- Added `agents/openai.yaml` for every HarmonyOS skill, so each skill has a display name, short description, and default prompt.
- Added focused `references/` folders for ArkUI UI patterns, performance audit, view refactor, design review, HarmonyOS system surfaces, memory/resource leaks, and debugger troubleshooting.
- Enhanced `harmonyosmcp` with metadata and combined workflow tools:
  - `harmonyos_inspect_app_metadata`
  - `harmonyos_uninstall`
  - `harmonyos_build_install_launch`
- Updated the debugger workflow to prefer metadata inference and the combined build/install/launch flow where appropriate.

Still intentionally not copied from iOS:

- iOS ETTrace scripts: these depend on iOS simulator frameworks and dSYM symbolication, not HarmonyOS.
- iOS memgraph scripts: `.memgraph`, `leaks`, and `xcrun simctl` are Apple-specific.
- SwiftUI preview browser templates: these depend on Swift Package/Xcode/Simulator mechanics.
- Liquid Glass details: HarmonyOS has no equivalent API to clone directly.

For stronger future parity, the next real work is validating HDC input injection, DevEco profiler export formats, and any stable ArkUI preview CLI exposed by the installed HarmonyOS SDK.
