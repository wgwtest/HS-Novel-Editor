import fs from "node:fs";
import path from "node:path";
import { appRootFrom } from "./app-validation-helpers.mjs";

const appRoot = appRootFrom(import.meta.url);
const repoRoot = path.resolve(appRoot, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readRepoText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const startHere = readRepoText("CODEX_START_HERE.md");
const repoReadme = readRepoText("README.md");
const docReadme = readRepoText(path.join("DOC", "CODEX_DOC", "README.md"));
const factIndex = readRepoText(path.join("DOC", "CODEX_DOC", "02_设计说明", "00-设计事实源索引.md"));
const handoff = readRepoText("CURRENT_HANDOFF.md");

const appDevCommand = "cd C:\\CodexWorkSpace\\CodexProject\\HS-Novel-Editor\\app";
const appUrl = "http://127.0.0.1:4174/index.html";

assert(startHere.includes("app/index.html"), "CODEX_START_HERE.md must name app/index.html as the current formal page.");
assert(startHere.includes(appDevCommand), "CODEX_START_HERE.md must start the formal app from the app/ directory.");
assert(startHere.includes("npm run dev"), "CODEX_START_HERE.md must use npm run dev as the primary startup command.");
assert(startHere.includes(appUrl), "CODEX_START_HERE.md must point to the app dev URL.");

assert(repoReadme.includes("当前正式主页面") && repoReadme.includes("app/index.html"), "README.md must identify app/index.html as the current formal page.");
assert(docReadme.includes("| 当前运行实现 | 工程化 app 正式入口 | `app/` |"), "DOC/CODEX_DOC/README.md must classify app/ as the current implementation.");
assert(factIndex.includes("| 当前正式运行入口 | `app/index.html` |"), "设计事实源索引 must identify app/index.html as the formal runtime entry.");
assert(factIndex.includes("| 历史原型行为基线 |"), "设计事实源索引 must preserve the historical prototype as a baseline.");
assert(handoff.includes(appUrl), "CURRENT_HANDOFF.md must point browser startup to the app dev URL.");
assert(handoff.includes("app/index.html"), "CURRENT_HANDOFF.md must point source entry to app/index.html.");

console.log("Formal entrypoint validation passed.");
