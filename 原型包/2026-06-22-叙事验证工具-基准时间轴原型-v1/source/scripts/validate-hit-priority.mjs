import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(scriptDir, "..");
const html = readFileSync(join(sourceDir, "index.html"), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  html.includes("function clippedEventRect("),
  "事件块缺少统一裁剪函数，命中区可能穿透到左侧轴名栏。"
);

assert(
  /hitRegions\.push\(\{\s*type:\s*"event",\s*id:\s*item\.id,\s*x:\s*drawX,\s*y:\s*y - 3,\s*w:\s*drawWidth,\s*h:\s*height \+ 6\s*\}\)/s.test(html),
  "事件命中区没有使用裁剪后的 drawX/drawWidth。"
);

assert(
  html.includes("function labelColumnHitTest("),
  "左侧轴名栏缺少优先命中逻辑。"
);

assert(
  /function hitTest\(x,\s*y\)\s*\{\s*const labelHit = labelColumnHitTest\(x,\s*y\);/s.test(html),
  "hitTest 没有先检查左侧轴名栏。"
);

console.log("Hit priority validation passed.");
