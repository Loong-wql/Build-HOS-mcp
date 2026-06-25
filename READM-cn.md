# Build HarmonyOS Apps 插件

Build HarmonyOS Apps 是一个面向 HarmonyOS / OpenHarmony 应用开发的 Codex 插件。它提供 ArkTS、ArkUI、DevEco、hvigor 和 HDC 相关的开发、构建、运行、调试与界面验证工作流。

## 功能范围

- 编写和重构 ArkUI 页面、组件、列表、表单、弹窗和导航结构。
- 使用 `hvigorw`、`hvigor` 构建 HarmonyOS 项目和 HAP 包。
- 通过 `hdc` 安装、卸载、启动应用，并读取设备或模拟器日志。
- 解析 `app.json5`、`module.json5`，辅助推断 bundle、module 和 ability 信息。
- 捕获设备截图，导出 UI 布局树，执行基础坐标交互。
- 支持 `tap`、`swipe`、按键事件和文本输入等基础 UI 自动化能力。
- 辅助分析 ArkUI 性能问题、内存增长、资源泄漏和系统级入口设计。

## MCP 工具

插件内置 `harmonyosmcp` 本地 MCP server，主要工具包括：

- `harmonyos_find_project`：检测 HarmonyOS / OpenHarmony 项目根目录、元数据文件和 HAP 输出。
- `harmonyos_inspect_app_metadata`：读取 `app.json5` / `module.json5`，推断 bundle 名、模块和 abilities。
- `harmonyos_build`：调用项目内 `hvigorw` / `hvigorw.bat` 或系统 `hvigor` 构建项目。
- `harmonyos_build_install_launch`：构建、安装最新 HAP，并启动应用。
- `harmonyos_list_devices`：通过 `hdc list targets` 列出设备或模拟器。
- `harmonyos_install_hap`：安装 HAP 包。
- `harmonyos_uninstall`：卸载指定 bundle。
- `harmonyos_launch_ability`：启动指定 UIAbility。
- `harmonyos_hilog`：抓取并过滤 hilog。
- `harmonyos_screenshot`：通过 `snapshot_display` 截图并拉取到本地。
- `harmonyos_ui_screenshot`：通过 `uitest screenCap` 截图并拉取到本地。
- `harmonyos_dump_layout`：通过 `uitest dumpLayout` 导出当前 UI 布局树。
- `harmonyos_tap`：通过 `uitest uiInput click` 点击指定坐标。
- `harmonyos_swipe`：通过 `uitest uiInput swipe` 执行滑动。
- `harmonyos_type_text`：通过 `uitest uiInput` 或 `uinput` 输入文本。
- `harmonyos_press_key`：注入 Back、Home、Power 或数字 key id 等按键事件。

## 技能模块

插件包含以下 Codex 技能：

- `arkui-ui-patterns`：ArkUI 页面、状态、导航、异步、列表、表单和主题模式。
- `arkui-view-refactor`：将大型 ArkTS / ArkUI 页面拆分为更清晰的组件结构。
- `arkui-design-system`：按 HarmonyOS 和项目既有规范做视觉设计与审查。
- `arkui-performance-audit`：从代码和运行证据两侧排查 ArkUI 性能问题。
- `harmonyos-debugger-agent`：构建、安装、启动、日志、截图和基础 UI 自动化。
- `harmonyos-device-browser`：通过截图和 UI 布局树进行设备画面验证。
- `harmonyos-memory-leaks`：排查资源释放、监听器、定时器、worker 和全局状态持有问题。
- `harmonyos-system-surfaces`：设计 UIAbility、Want 路由、widgets/cards 和 ExtensionAbility 风格入口。

## 本地环境要求

- 已安装 DevEco Studio 或 HarmonyOS / OpenHarmony 命令行 SDK。
- 本机 PATH 中有 `node`，用于启动 MCP server。
- 可用的 `hdc`，或者在 MCP 工具参数中显式传入 `hdcPath`。
- 连接的 HarmonyOS 设备或 DevEco 模拟器。
- 目标设备 shell 中可用 `uitest`；如需备用文本输入能力，需可用 `uinput`。
- 项目内存在 `hvigorw` / `hvigorw.bat`，或者系统中可用 `hvigor`。

## 已验证能力

在本地 DevEco 模拟器上已验证：

- `hdc` 版本为 `3.2.0d`。
- 模拟器 target 为 `127.0.0.1:5555`。
- `uitest dumpLayout` 可以导出 UI 布局树。
- `uitest screenCap` 可以截图。
- `uitest uiInput click`、`swipe`、`keyEvent`、`inputText` 可用。
- `uinput` 可用于触摸和键盘文本输入。
- 文本输入结果可在 `TextInput` 节点中通过布局树确认。

## 当前边界

当前 UI 自动化能力是坐标和布局树驱动的，适合做基础验证和明确路径的交互操作。它还不是完整的语义化 UI 自动化框架。

建议在交互前后配合使用：

- `harmonyos_dump_layout` 获取节点坐标和文本。
- `harmonyos_tap` / `harmonyos_swipe` / `harmonyos_type_text` 执行操作。
- `harmonyos_ui_screenshot` 或 `harmonyos_screenshot` 做视觉确认。
- `harmonyos_hilog` 补充运行日志证据。

后续可以继续增强：

- 按文本点击：`tap-by-text`。
- 等待文本出现：`wait-for-text`。
- 可见性断言：`assert-visible`。
- 基于截图轮询的设备画面流。
- DevEco profiler 导出文件解析。

## 项目结构

```text
plugins/build-harmonyos-apps/
  .codex-plugin/plugin.json
  .mcp.json
  scripts/harmonyos-mcp-server.mjs
  skills/
  assets/
```

根目录中的 `validate-plugin.ps1` 和 `validate-plugin.cmd` 用于插件校验。`.gitignore` 已排除虚拟环境、验证截图、布局导出和打包产物。

## 自检说明

本文档只描述当前插件源码中已经存在或本地验证过的能力。对于不同 SDK、设备镜像或真机环境，`hdc`、`uitest`、`uinput` 的具体可用性可能存在差异，需要以目标环境实测为准。
