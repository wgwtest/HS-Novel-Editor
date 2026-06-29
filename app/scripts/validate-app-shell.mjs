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

assert(indexHtml.includes('href="/src/styles/main.css"'), "app/index.html must load the extracted CSS.");
assert(indexHtml.includes('src="/src/main.js"'), "app/index.html must load the module entry.");
assert(!indexHtml.includes("<style>"), "app/index.html must not keep the large inline style block.");
assert(!indexHtml.includes("<script>"), "app/index.html must not keep the large inline script block.");
assert(!mainJs.includes("<style>"), "src/main.js must not contain HTML style tags.");
assert(mainJs.includes("function boot("), "src/main.js must keep the existing boot flow for this migration stage.");
assert(mainJs.includes('const STORY_DATA_BASE_URL = "public/data"'), "src/main.js must read copied app data from public/data.");
assert(!mainJs.includes('"data/stories/index.json"'), "src/main.js must not keep the prototype-only data/stories manifest path.");
assert(css.includes("#timelineCanvas"), "Extracted CSS must include timeline canvas styling.");
assert(packageJson.scripts?.dev, "package.json must define npm run dev.");
assert(packageJson.scripts?.check, "package.json must define npm run check.");

console.log("App shell validation passed.");
