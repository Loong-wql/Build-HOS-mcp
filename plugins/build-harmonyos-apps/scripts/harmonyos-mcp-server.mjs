#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";

const serverInfo = { name: "harmonyosmcp", version: "0.1.0" };
const defaultProtocolVersion = "2024-11-05";

function textContent(text) {
  return { content: [{ type: "text", text }] };
}

function asString(value, fallback = "") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function asNumber(value, name, options = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${name} is required and must be a finite number.`);
  if (Number.isFinite(options.min) && number < options.min) throw new Error(`${name} must be >= ${options.min}.`);
  if (Number.isFinite(options.max) && number > options.max) throw new Error(`${name} must be <= ${options.max}.`);
  return Math.round(number);
}

function hdcArgs(targetId, args) {
  return targetId ? ["-t", targetId, ...args] : args;
}

function findUp(start, names) {
  let current = resolve(start || process.cwd());
  while (true) {
    for (const name of names) {
      const candidate = join(current, name);
      if (existsSync(candidate)) return candidate;
    }
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function findHvigor(projectPath) {
  const root = resolve(projectPath || process.cwd());
  const windowsWrapper = join(root, "hvigorw.bat");
  const posixWrapper = join(root, "hvigorw");
  if (process.platform === "win32" && existsSync(windowsWrapper)) return windowsWrapper;
  if (existsSync(posixWrapper)) return posixWrapper;
  if (existsSync(windowsWrapper)) return windowsWrapper;
  return "hvigor";
}

function walkForFiles(root, predicate, limit = 50) {
  const results = [];
  const stack = [root];
  while (stack.length > 0 && results.length < limit) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (!["node_modules", ".git", ".hvigor", "oh_modules"].includes(entry.name)) stack.push(full);
      } else if (predicate(full, entry.name)) {
        results.push(full);
      }
      if (results.length >= limit) break;
    }
  }
  return results;
}

function runCommand(command, args, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 120000;
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...(options.env || {}) },
      shell: process.platform === "win32" && /\.(bat|cmd)$/i.test(command),
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
    }, timeoutMs);
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolvePromise({ code: -1, stdout, stderr: `${stderr}${error.message}` });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolvePromise({ code, stdout, stderr });
    });
  });
}

async function toolFindProject(input) {
  const projectPath = resolve(asString(input.projectPath, process.cwd()));
  const markers = {
    ohPackage: findUp(projectPath, ["oh-package.json5"]),
    buildProfile: findUp(projectPath, ["build-profile.json5"]),
    hvigor: findUp(projectPath, ["hvigorw", "hvigorw.bat", "hvigorfile.ts"]),
    appScope: existsSync(join(projectPath, "AppScope", "app.json5")) ? join(projectPath, "AppScope", "app.json5") : null
  };
  const root = dirname(markers.ohPackage || markers.buildProfile || markers.hvigor || projectPath);
  const haps = existsSync(root) ? walkForFiles(root, (full, name) => name.endsWith(".hap"), 25) : [];
  return textContent(JSON.stringify({ projectPath, inferredRoot: root, markers, hapCandidates: haps }, null, 2));
}

async function toolBuild(input) {
  const projectPath = resolve(asString(input.projectPath, process.cwd()));
  const task = asString(input.task, "assembleHap");
  const extraArgs = asArray(input.extraArgs);
  const command = asString(input.hvigorPath, findHvigor(projectPath));
  const result = await runCommand(command, [task, ...extraArgs], {
    cwd: projectPath,
    timeoutMs: Number(input.timeoutMs) || 300000
  });
  const haps = walkForFiles(projectPath, (full, name) => name.endsWith(".hap"), 50)
    .map((file) => {
      let size = null;
      try {
        size = statSync(file).size;
      } catch {}
      return { file, size };
    });
  return textContent(JSON.stringify({ command, args: [task, ...extraArgs], code: result.code, stdout: result.stdout, stderr: result.stderr, hapCandidates: haps }, null, 2));
}

async function toolListDevices(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const result = await runCommand(hdc, ["list", "targets"], { timeoutMs: Number(input.timeoutMs) || 30000 });
  return textContent(JSON.stringify({ command: hdc, args: ["list", "targets"], code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

async function toolInstallHap(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const hapPath = resolve(asString(input.hapPath));
  if (!hapPath || !existsSync(hapPath)) throw new Error("hapPath is required and must exist.");
  const args = hdcArgs(asString(input.targetId), ["install", hapPath]);
  const result = await runCommand(hdc, args, { timeoutMs: Number(input.timeoutMs) || 120000 });
  return textContent(JSON.stringify({ command: hdc, args, code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

async function toolLaunchAbility(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const bundleName = asString(input.bundleName);
  const abilityName = asString(input.abilityName, "EntryAbility");
  if (!bundleName) throw new Error("bundleName is required.");
  const args = hdcArgs(asString(input.targetId), ["shell", "aa", "start", "-b", bundleName, "-a", abilityName]);
  const result = await runCommand(hdc, args, { timeoutMs: Number(input.timeoutMs) || 30000 });
  return textContent(JSON.stringify({ command: hdc, args, code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

async function toolHilog(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const args = hdcArgs(asString(input.targetId), ["hilog"]);
  const timeoutMs = Number(input.timeoutMs) || 8000;
  const result = await runCommand(hdc, args, { timeoutMs });
  const lines = `${result.stdout}\n${result.stderr}`.split(/\r?\n/).filter(Boolean);
  const grep = asString(input.grep);
  const filtered = grep ? lines.filter((line) => line.includes(grep)) : lines;
  const tailCount = Number(input.lines) || 200;
  return textContent(filtered.slice(-tailCount).join("\n"));
}

async function toolScreenshot(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const targetId = asString(input.targetId);
  const remote = asString(input.remotePath, "/data/local/tmp/codex_harmonyos_screen.png");
  const outDir = resolve(asString(input.outDir, join(tmpdir(), "codex-harmonyos-screens")));
  await mkdir(outDir, { recursive: true });
  const local = join(outDir, `screen-${Date.now()}.png`);
  const snapArgs = hdcArgs(targetId, ["shell", "snapshot_display", "-f", remote]);
  const recvArgs = hdcArgs(targetId, ["file", "recv", remote, local]);
  const snap = await runCommand(hdc, snapArgs, { timeoutMs: Number(input.timeoutMs) || 30000 });
  const recv = await runCommand(hdc, recvArgs, { timeoutMs: Number(input.timeoutMs) || 30000 });
  return textContent(JSON.stringify({ local, snapshot: { command: hdc, args: snapArgs, code: snap.code, stdout: snap.stdout, stderr: snap.stderr }, receive: { command: hdc, args: recvArgs, code: recv.code, stdout: recv.stdout, stderr: recv.stderr } }, null, 2));
}

async function toolUiScreenshot(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const targetId = asString(input.targetId);
  const remote = asString(input.remotePath, `/data/local/tmp/codex_harmonyos_ui_screen_${Date.now()}.png`);
  const outDir = resolve(asString(input.outDir, join(tmpdir(), "codex-harmonyos-screens")));
  await mkdir(outDir, { recursive: true });
  const local = join(outDir, `ui-screen-${Date.now()}.png`);
  const screenArgs = hdcArgs(targetId, ["shell", "uitest", "screenCap", "-p", remote]);
  const recvArgs = hdcArgs(targetId, ["file", "recv", remote, local]);
  const screen = await runCommand(hdc, screenArgs, { timeoutMs: Number(input.timeoutMs) || 30000 });
  const recv = await runCommand(hdc, recvArgs, { timeoutMs: Number(input.timeoutMs) || 30000 });
  return textContent(JSON.stringify({ local, screen: { command: hdc, args: screenArgs, code: screen.code, stdout: screen.stdout, stderr: screen.stderr }, receive: { command: hdc, args: recvArgs, code: recv.code, stdout: recv.stdout, stderr: recv.stderr } }, null, 2));
}

async function toolDumpLayout(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const targetId = asString(input.targetId);
  const remote = asString(input.remotePath, `/data/local/tmp/codex_harmonyos_layout_${Date.now()}.json`);
  const outDir = resolve(asString(input.outDir, join(tmpdir(), "codex-harmonyos-layouts")));
  await mkdir(outDir, { recursive: true });
  const local = join(outDir, `layout-${Date.now()}.json`);
  const dumpArgs = hdcArgs(targetId, ["shell", "uitest", "dumpLayout", "-p", remote]);
  if (input.unmerged === true) dumpArgs.push("-i");
  if (input.includeFontAttributes === true) dumpArgs.push("-a");
  const bundleName = asString(input.bundleName);
  if (bundleName) dumpArgs.push("-b", bundleName);
  const windowId = asString(input.windowId);
  if (windowId) dumpArgs.push("-w", windowId);
  const displayId = asString(input.displayId);
  if (displayId) dumpArgs.push("-d", displayId);
  const dump = await runCommand(hdc, dumpArgs, { timeoutMs: Number(input.timeoutMs) || 30000 });
  const recvArgs = hdcArgs(targetId, ["file", "recv", remote, local]);
  const recv = await runCommand(hdc, recvArgs, { timeoutMs: Number(input.timeoutMs) || 30000 });
  return textContent(JSON.stringify({ local, dump: { command: hdc, args: dumpArgs, code: dump.code, stdout: dump.stdout, stderr: dump.stderr }, receive: { command: hdc, args: recvArgs, code: recv.code, stdout: recv.stdout, stderr: recv.stderr } }, null, 2));
}

async function toolTap(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const x = asNumber(input.x, "x", { min: 0 });
  const y = asNumber(input.y, "y", { min: 0 });
  const args = hdcArgs(asString(input.targetId), ["shell", "uitest", "uiInput", "click", String(x), String(y)]);
  const result = await runCommand(hdc, args, { timeoutMs: Number(input.timeoutMs) || 10000 });
  return textContent(JSON.stringify({ command: hdc, args, code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

async function toolSwipe(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const fromX = asNumber(input.fromX, "fromX", { min: 0 });
  const fromY = asNumber(input.fromY, "fromY", { min: 0 });
  const toX = asNumber(input.toX, "toX", { min: 0 });
  const toY = asNumber(input.toY, "toY", { min: 0 });
  const velocity = Number(input.velocity);
  const args = hdcArgs(asString(input.targetId), ["shell", "uitest", "uiInput", "swipe", String(fromX), String(fromY), String(toX), String(toY)]);
  if (Number.isFinite(velocity)) args.push(String(asNumber(velocity, "velocity", { min: 200, max: 40000 })));
  const result = await runCommand(hdc, args, { timeoutMs: Number(input.timeoutMs) || 10000 });
  return textContent(JSON.stringify({ command: hdc, args, code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

async function toolTypeText(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const text = asString(input.text);
  if (!text) throw new Error("text is required.");
  const method = asString(input.method, "uitest");
  let args;
  if (method === "uinput") {
    args = hdcArgs(asString(input.targetId), ["shell", "uinput", "-K", "-t", text]);
  } else if (input.x !== undefined || input.y !== undefined) {
    const x = asNumber(input.x, "x", { min: 0 });
    const y = asNumber(input.y, "y", { min: 0 });
    args = hdcArgs(asString(input.targetId), ["shell", "uitest", "uiInput", "inputText", String(x), String(y), text]);
  } else {
    args = hdcArgs(asString(input.targetId), ["shell", "uitest", "uiInput", "text", text]);
  }
  const result = await runCommand(hdc, args, { timeoutMs: Number(input.timeoutMs) || 10000 });
  return textContent(JSON.stringify({ command: hdc, args, code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

async function toolPressKey(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const key = asString(input.key);
  if (!key) throw new Error("key is required, for example Back, Home, Power, or a numeric key id.");
  const args = hdcArgs(asString(input.targetId), ["shell", "uitest", "uiInput", "keyEvent", key]);
  const result = await runCommand(hdc, args, { timeoutMs: Number(input.timeoutMs) || 10000 });
  return textContent(JSON.stringify({ command: hdc, args, code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

function stripJson5Like(text) {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/,\s*([}\]])/g, "$1");
}

function readJson5Like(path) {
  try {
    const text = stripJson5Like(readFileSync(path, "utf8"));
    return JSON.parse(text);
  } catch (error) {
    return { __parseError: error instanceof Error ? error.message : String(error) };
  }
}

function findMetadataFiles(root) {
  const files = walkForFiles(root, (full, name) => {
    if (!["app.json5", "module.json5", "build-profile.json5", "oh-package.json5"].includes(name)) return false;
    return !full.includes(`${sep}build${sep}`) && !full.includes(`${sep}.hvigor${sep}`) && !full.includes(`${sep}oh_modules${sep}`);
  }, 100);
  return files;
}

function newestFile(files) {
  return files
    .map((file) => {
      try {
        const stats = statSync(file);
        return { file, mtimeMs: stats.mtimeMs, size: stats.size };
      } catch {
        return { file, mtimeMs: 0, size: 0 };
      }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0] || null;
}

async function toolInspectAppMetadata(input) {
  const projectPath = resolve(asString(input.projectPath, process.cwd()));
  const files = findMetadataFiles(projectPath);
  const parsed = files.map((file) => ({ file, data: readJson5Like(file) }));
  const app = parsed.find((entry) => entry.file.endsWith(`${sep}app.json5`))?.data;
  const modules = parsed.filter((entry) => entry.file.endsWith(`${sep}module.json5`));
  const abilities = modules.flatMap((entry) => {
    const module = entry.data?.module || {};
    return Array.isArray(module.abilities)
      ? module.abilities.map((ability) => ({ moduleName: module.name || null, abilityName: ability.name || null, srcEntry: ability.srcEntry || null, file: entry.file }))
      : [];
  });
  return textContent(JSON.stringify({
    projectPath,
    bundleName: app?.app?.bundleName || app?.bundleName || null,
    vendor: app?.app?.vendor || null,
    versionName: app?.app?.versionName || null,
    versionCode: app?.app?.versionCode || null,
    modules: modules.map((entry) => ({ file: entry.file, name: entry.data?.module?.name || null, type: entry.data?.module?.type || null })),
    abilities,
    parseErrors: parsed.filter((entry) => entry.data?.__parseError).map((entry) => ({ file: entry.file, error: entry.data.__parseError }))
  }, null, 2));
}

async function toolUninstall(input) {
  const hdc = asString(input.hdcPath, "hdc");
  const bundleName = asString(input.bundleName);
  if (!bundleName) throw new Error("bundleName is required.");
  const args = hdcArgs(asString(input.targetId), ["uninstall", bundleName]);
  const result = await runCommand(hdc, args, { timeoutMs: Number(input.timeoutMs) || 60000 });
  return textContent(JSON.stringify({ command: hdc, args, code: result.code, stdout: result.stdout, stderr: result.stderr }, null, 2));
}

async function toolBuildInstallLaunch(input) {
  const projectPath = resolve(asString(input.projectPath, process.cwd()));
  const hdc = asString(input.hdcPath, "hdc");
  const targetId = asString(input.targetId);
  const buildTask = asString(input.task, "assembleHap");
  const buildArgs = asArray(input.extraArgs);
  const hvigor = asString(input.hvigorPath, findHvigor(projectPath));
  const build = await runCommand(hvigor, [buildTask, ...buildArgs], { cwd: projectPath, timeoutMs: Number(input.buildTimeoutMs) || 300000 });
  const hap = asString(input.hapPath) ? { file: resolve(asString(input.hapPath)) } : newestFile(walkForFiles(projectPath, (full, name) => name.endsWith(".hap"), 100));
  if (!hap?.file || !existsSync(hap.file)) throw new Error("Build finished but no HAP artifact was found. Pass hapPath explicitly if the project uses a custom output path.");
  const metadataText = await toolInspectAppMetadata({ projectPath });
  const metadata = JSON.parse(metadataText.content[0].text);
  const bundleName = asString(input.bundleName, metadata.bundleName || "");
  const abilityName = asString(input.abilityName, metadata.abilities?.[0]?.abilityName || "EntryAbility");
  if (!bundleName) throw new Error("bundleName could not be inferred. Pass bundleName explicitly.");
  const installArgs = hdcArgs(targetId, ["install", hap.file]);
  const install = await runCommand(hdc, installArgs, { timeoutMs: Number(input.installTimeoutMs) || 120000 });
  const launchArgs = hdcArgs(targetId, ["shell", "aa", "start", "-b", bundleName, "-a", abilityName]);
  const launch = await runCommand(hdc, launchArgs, { timeoutMs: Number(input.launchTimeoutMs) || 30000 });
  return textContent(JSON.stringify({
    build: { command: hvigor, args: [buildTask, ...buildArgs], code: build.code, stdout: build.stdout, stderr: build.stderr },
    hap,
    install: { command: hdc, args: installArgs, code: install.code, stdout: install.stdout, stderr: install.stderr },
    launch: { command: hdc, args: launchArgs, code: launch.code, stdout: launch.stdout, stderr: launch.stderr },
    inferred: { bundleName, abilityName, metadata }
  }, null, 2));
}
const tools = {
  harmonyos_inspect_app_metadata: {
    description: "Inspect HarmonyOS app.json5/module.json5 metadata and infer bundle name and abilities.",
    inputSchema: { type: "object", properties: { projectPath: { type: "string" } } },
    handler: toolInspectAppMetadata
  },
  harmonyos_uninstall: {
    description: "Uninstall a HarmonyOS bundle from a device or emulator through hdc.",
    inputSchema: {
      type: "object",
      required: ["bundleName"],
      properties: { bundleName: { type: "string" }, targetId: { type: "string" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolUninstall
  },
  harmonyos_build_install_launch: {
    description: "Build a HarmonyOS project, install the newest HAP, infer bundle/ability metadata, and launch the app.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string" },
        task: { type: "string", default: "assembleHap" },
        extraArgs: { type: "array", items: { type: "string" } },
        hvigorPath: { type: "string" },
        hapPath: { type: "string" },
        bundleName: { type: "string" },
        abilityName: { type: "string" },
        targetId: { type: "string" },
        hdcPath: { type: "string" },
        buildTimeoutMs: { type: "number" },
        installTimeoutMs: { type: "number" },
        launchTimeoutMs: { type: "number" }
      }
    },
    handler: toolBuildInstallLaunch
  },
  harmonyos_find_project: {
    description: "Detect a HarmonyOS/OpenHarmony project root, common metadata files, and existing HAP outputs.",
    inputSchema: { type: "object", properties: { projectPath: { type: "string" } } },
    handler: toolFindProject
  },
  harmonyos_build: {
    description: "Build a HarmonyOS project with project-local hvigorw/hvigorw.bat or hvigor.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string" },
        task: { type: "string", default: "assembleHap" },
        extraArgs: { type: "array", items: { type: "string" } },
        hvigorPath: { type: "string" },
        timeoutMs: { type: "number" }
      }
    },
    handler: toolBuild
  },
  harmonyos_list_devices: {
    description: "List connected HarmonyOS devices or emulators with hdc list targets.",
    inputSchema: { type: "object", properties: { hdcPath: { type: "string" }, timeoutMs: { type: "number" } } },
    handler: toolListDevices
  },
  harmonyos_install_hap: {
    description: "Install a HAP package on a HarmonyOS device or emulator through hdc.",
    inputSchema: {
      type: "object",
      required: ["hapPath"],
      properties: { hapPath: { type: "string" }, targetId: { type: "string" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolInstallHap
  },
  harmonyos_launch_ability: {
    description: "Launch a HarmonyOS ability through hdc shell aa start.",
    inputSchema: {
      type: "object",
      required: ["bundleName"],
      properties: { bundleName: { type: "string" }, abilityName: { type: "string", default: "EntryAbility" }, targetId: { type: "string" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolLaunchAbility
  },
  harmonyos_hilog: {
    description: "Capture a short hilog window and optionally filter/tail it.",
    inputSchema: {
      type: "object",
      properties: { targetId: { type: "string" }, grep: { type: "string" }, lines: { type: "number" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolHilog
  },
  harmonyos_screenshot: {
    description: "Capture a device screenshot with snapshot_display and pull it locally.",
    inputSchema: {
      type: "object",
      properties: { targetId: { type: "string" }, outDir: { type: "string" }, remotePath: { type: "string" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolScreenshot
  },
  harmonyos_ui_screenshot: {
    description: "Capture a device screenshot with uitest screenCap and pull it locally.",
    inputSchema: {
      type: "object",
      properties: { targetId: { type: "string" }, outDir: { type: "string" }, remotePath: { type: "string" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolUiScreenshot
  },
  harmonyos_dump_layout: {
    description: "Dump the current HarmonyOS UI layout tree with uitest dumpLayout and pull it locally.",
    inputSchema: {
      type: "object",
      properties: {
        targetId: { type: "string" },
        outDir: { type: "string" },
        remotePath: { type: "string" },
        hdcPath: { type: "string" },
        timeoutMs: { type: "number" },
        unmerged: { type: "boolean" },
        includeFontAttributes: { type: "boolean" },
        bundleName: { type: "string" },
        windowId: { type: "string" },
        displayId: { type: "string" }
      }
    },
    handler: toolDumpLayout
  },
  harmonyos_tap: {
    description: "Tap a HarmonyOS device or emulator screen coordinate through uitest uiInput.",
    inputSchema: {
      type: "object",
      required: ["x", "y"],
      properties: { x: { type: "number" }, y: { type: "number" }, targetId: { type: "string" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolTap
  },
  harmonyos_swipe: {
    description: "Swipe between two HarmonyOS screen coordinates through uitest uiInput.",
    inputSchema: {
      type: "object",
      required: ["fromX", "fromY", "toX", "toY"],
      properties: {
        fromX: { type: "number" },
        fromY: { type: "number" },
        toX: { type: "number" },
        toY: { type: "number" },
        velocity: { type: "number", default: 600 },
        targetId: { type: "string" },
        hdcPath: { type: "string" },
        timeoutMs: { type: "number" }
      }
    },
    handler: toolSwipe
  },
  harmonyos_type_text: {
    description: "Type text into the focused field, or into a coordinate, through uitest or uinput.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string" },
        x: { type: "number" },
        y: { type: "number" },
        method: { type: "string", enum: ["uitest", "uinput"], default: "uitest" },
        targetId: { type: "string" },
        hdcPath: { type: "string" },
        timeoutMs: { type: "number" }
      }
    },
    handler: toolTypeText
  },
  harmonyos_press_key: {
    description: "Inject a HarmonyOS key event such as Back, Home, Power, or a numeric key id.",
    inputSchema: {
      type: "object",
      required: ["key"],
      properties: { key: { type: "string" }, targetId: { type: "string" }, hdcPath: { type: "string" }, timeoutMs: { type: "number" } }
    },
    handler: toolPressKey
  }
};

function listTools() {
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }));
}

function sendMessage(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

function sendResponse(id, result) {
  sendMessage({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  sendMessage({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleMessage(message) {
  if (!message || typeof message.method !== "string") return;
  const { id, method, params = {} } = message;
  try {
    if (method === "initialize") {
      sendResponse(id, {
        protocolVersion: params.protocolVersion || defaultProtocolVersion,
        capabilities: { tools: {} },
        serverInfo
      });
    } else if (method === "tools/list") {
      sendResponse(id, { tools: listTools() });
    } else if (method === "tools/call") {
      const name = params.name;
      const tool = tools[name];
      if (!tool) throw new Error(`Unknown tool: ${name}`);
      sendResponse(id, await tool.handler(params.arguments || {}));
    } else if (method === "ping") {
      sendResponse(id, {});
    } else if (id !== undefined) {
      sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (error) {
    if (id !== undefined) sendError(id, -32000, error instanceof Error ? error.message : String(error));
  }
}

let buffer = Buffer.alloc(0);
process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const separator = buffer.indexOf("\r\n\r\n");
    if (separator === -1) break;
    const header = buffer.slice(0, separator).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(separator + 4);
      continue;
    }
    const length = Number(match[1]);
    const total = separator + 4 + length;
    if (buffer.length < total) break;
    const body = buffer.slice(separator + 4, total).toString("utf8");
    buffer = buffer.slice(total);
    try {
      handleMessage(JSON.parse(body));
    } catch (error) {
      sendError(null, -32700, error instanceof Error ? error.message : String(error));
    }
  }
});

process.stdin.resume();
