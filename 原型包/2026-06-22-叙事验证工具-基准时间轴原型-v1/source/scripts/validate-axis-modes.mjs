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

assert(html.includes('data-axis-mode="realTime"'), "缺少标准真实时间轴模式按钮。");
assert(html.includes('data-axis-mode="chapterEqual"'), "缺少章节等宽轴模式按钮。");
assert(/axisMode:\s*"realTime"/.test(html), "页面状态缺少默认 axisMode=realTime。");

assert(html.includes("function createAxisProjection("), "缺少统一 AxisProjection 工厂。");
assert(html.includes("function activeAxis("), "缺少当前轴投影读取函数。");
assert(html.includes("function axisRangeToScreen("), "缺少事件范围到屏幕坐标的统一接口。");
assert(html.includes("function axisChapterToScreenRange("), "缺少章节范围到屏幕坐标的统一接口。");
assert(html.includes("function axisGridLines("), "缺少网格线统一接口。");

assert(
  /const range = axisRangeToScreen\(item\.startAt,\s*item\.endAt\);/.test(html),
  "drawEvents 必须通过 axisRangeToScreen 读取事件横向几何。"
);

assert(
  !/const x = timeToScreen\(item\.startAt\);\s*[\s\S]{0,300}?const width = timeToScreen\(item\.endAt\) - x;/.test(html),
  "drawEvents 不能直接用 timeToScreen(start/end) 计算事件宽度。"
);

assert(
  /const range = axisChapterToScreenRange\(chapter\.id\);/.test(html),
  "章节头或选区必须通过 axisChapterToScreenRange 读取章节横向几何。"
);

assert(
  /axisGridLines\(\)\.forEach/.test(html),
  "主画布竖向网格必须通过 axisGridLines 绘制。"
);

console.log("Axis mode validation passed.");
