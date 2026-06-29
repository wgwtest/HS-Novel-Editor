# P2.4.1 App 运行壳 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 `app/` 正式运行工程根，让当前基准时间轴页面脱离原型包路径，并完成 HTML/CSS/JS 的第一步拆分。

**Architecture:** 本阶段只做低风险迁移：从当前原型 `index.html` 机械抽取样式和脚本，生成 `app/index.html`、`app/src/styles/main.css` 和 `app/src/main.js`。数据与校验脚本复制到 `app/public/data/` 和 `app/scripts/`，原型包保持不变，后续 P2.4.2 再抽数据层和状态层。

**Tech Stack:** Native JavaScript ES Modules, Python static HTTP server, Node.js validation scripts, Canvas 2D.

---

## File Structure

- Create: `app/package.json`
- Create: `app/index.html`
- Create: `app/src/main.js`
- Create: `app/src/styles/main.css`
- Create: `app/public/data/**`
- Create: `app/scripts/validate-app-shell.mjs`
- Copy: `app/scripts/validate-*.mjs`
- Modify: `DOC/CODEX_DOC/02_设计说明/00-设计事实源索引.md`
- Modify: `DOC/CODEX_DOC/04_研发计划/03-WBS-P2.4.1-App运行壳-实施计划.md`

## Task 1: App Shell Guard

**Files:**
- Create: `app/scripts/validate-app-shell.mjs`

- [x] **Step 1: Write the failing app shell validation**

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(relativePath) {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

for (const requiredPath of [
  "package.json",
  "index.html",
  "src/main.js",
  "src/styles/main.css",
  "public/data/schema.json",
  "public/data/stories/index.json",
  "scripts/validate-story-datasets.mjs",
  "scripts/validate-wide-canvas-drag.mjs"
]) {
  assert(fs.existsSync(path.join(appRoot, requiredPath)), `Missing app artifact: ${requiredPath}`);
}

const indexHtml = readText("index.html");
const mainJs = readText("src/main.js");
const css = readText("src/styles/main.css");
const packageJson = JSON.parse(readText("package.json"));

assert(indexHtml.includes('src="/src/main.js"'), "app/index.html must load the module entry.");
assert(!indexHtml.includes("<style>"), "app/index.html must not keep the large inline style block.");
assert(!indexHtml.includes("<script>"), "app/index.html must not keep the large inline script block.");
assert(mainJs.includes('import "./styles/main.css";'), "src/main.js must import the extracted CSS.");
assert(mainJs.includes("function boot("), "src/main.js must keep the existing boot flow for this migration stage.");
assert(css.includes("#timelineCanvas"), "Extracted CSS must include timeline canvas styling.");
assert(packageJson.scripts?.dev, "package.json must define npm run dev.");
assert(packageJson.scripts?.check, "package.json must define npm run check.");

console.log("App shell validation passed.");
```

- [x] **Step 2: Run validation and verify RED**

Run:

```powershell
node app/scripts/validate-app-shell.mjs
```

Expected: FAIL with `Missing app artifact: package.json`.

## Task 2: Create App Shell

**Files:**
- Create: `app/package.json`
- Create: `app/index.html`
- Create: `app/src/main.js`
- Create: `app/src/styles/main.css`
- Create: `app/public/data/**`
- Copy: `app/scripts/validate-*.mjs`

- [x] **Step 1: Mechanically extract current prototype**

Run a mechanical extraction from:

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/index.html
```

Rules:

- Move the `<style>` block content into `app/src/styles/main.css`.
- Move the final `<script>` block content into `app/src/main.js`.
- Add `<link rel="stylesheet" href="/src/styles/main.css">` to `app/index.html`.
- Replace inline JS in `app/index.html` with `<script type="module" src="/src/main.js"></script>`.
- Keep `app/src/main.js` as browser-native JavaScript without bundler-only CSS imports.
- Copy `source/data/` to `app/public/data/`.
- Copy `source/scripts/*.mjs` to `app/scripts/`.

- [x] **Step 2: Create package scripts**

`app/package.json` must contain:

```json
{
  "name": "hs-novel-editor-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "python -m http.server 4174 --bind 127.0.0.1",
    "check": "node scripts/validate-app-shell.mjs && node scripts/validate-story-datasets.mjs && node scripts/validate-character-participation.mjs && node scripts/validate-axis-modes.mjs && node scripts/validate-event-min-width.mjs && node scripts/validate-hit-priority.mjs && node scripts/validate-visual-encoding.mjs && node scripts/validate-view-state-management.mjs && node scripts/validate-wide-canvas-drag.mjs"
  }
}
```

- [x] **Step 3: Run validation and verify GREEN**

Run:

```powershell
npm run check
```

Expected: all copied validation scripts pass under `app/`.

## Task 3: Runtime Verification

**Files:**
- No production file required unless verification exposes a defect.

- [x] **Step 1: Start app dev server**

Run:

```powershell
npm run dev
```

Expected: Vite serves `http://127.0.0.1:4174/index.html`.

- [x] **Step 2: Verify browser behavior**

Use a real browser to verify:

- Page loads default projection dataset.
- Inspector remains visible.
- The `宽屏` button exists.
- Canvas exists and has non-zero rendered dimensions.
- No console errors are emitted on load.

## Task 4: Documentation Sync

**Files:**
- Modify: `DOC/CODEX_DOC/02_设计说明/00-设计事实源索引.md`
- Modify: `DOC/CODEX_DOC/04_研发计划/03-WBS-P2.4.1-App运行壳-实施计划.md`

- [x] **Step 1: Update fact source index**

Add `app/` as a new engineering migration source, while keeping the prototype as migration baseline until formal entry switching.

- [x] **Step 2: Run final checks**

Run:

```powershell
git diff --check
git status --short --branch --ignored
```

Expected:

- No whitespace errors.
- Only intended app and doc files are staged or modified.
- `验证作品/` remains ignored.
- `角色头像/` deletions remain unstaged and unrelated.

## Self-Review

- Spec coverage: this plan implements P2.4.1 only. P2.4.2 data/state extraction, P2.4.3 timeline extraction, P2.4.4 Inspector extraction, and P2.4.5 formal entry switching remain future tasks.
- Placeholder scan: no `TBD`, `TODO`, or undefined file path is intentionally present.
- Type consistency: `app/scripts/validate-app-shell.mjs`, `app/src/main.js`, `app/src/styles/main.css`, and `app/public/data/` names match the engineering design document.
