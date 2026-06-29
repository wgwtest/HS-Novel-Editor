import fs from "node:fs";
import path from "node:path";
import { appRootFrom, readAppSource } from "./app-validation-helpers.mjs";

const appRoot = appRootFrom(import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(relativePath) {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

for (const requiredPath of [
  "src/data/story-loader.js",
  "src/state/persisted-state.js",
  "src/timeline/geometry.js"
]) {
  assert(fs.existsSync(path.join(appRoot, requiredPath)), `Missing module boundary file: ${requiredPath}`);
}

const mainJs = readText("src/main.js");
const appSource = readAppSource(import.meta.url);

assert(mainJs.includes('from "./data/story-loader.js"'), "main.js must import story loading from data/story-loader.js.");
assert(mainJs.includes('from "./state/persisted-state.js"'), "main.js must import persisted state from state/persisted-state.js.");
assert(mainJs.includes('from "./timeline/geometry.js"'), "main.js must import timeline geometry from timeline/geometry.js.");
assert(!mainJs.includes("localStorage."), "main.js must not directly access localStorage after P2.4.2.");
assert(!/await fetch\(/.test(mainJs), "main.js must not directly fetch story data after P2.4.2.");
assert(!mainJs.includes("function createAxisProjection("), "main.js must not define axis projection after P2.4.3.");
assert(!mainJs.includes("function axisRangeToScreen("), "main.js must not define axis range projection after P2.4.3.");
assert(!mainJs.includes("function parseTime("), "main.js must not define parseTime after P2.4.3.");
assert(appSource.includes("function validateStoryManifest("), "Story manifest validation must remain present in app source.");
assert(appSource.includes("function loadPersistedState("), "Persisted state loading must remain present in app source.");
assert(appSource.includes("function savePersistedState("), "Persisted state saving must remain present in app source.");
assert(appSource.includes("function createAxisProjection("), "Axis projection factory must remain present in app source.");
assert(appSource.includes("function axisRangeToScreen("), "Axis range projection must remain present in app source.");

console.log("Module boundary validation passed.");
