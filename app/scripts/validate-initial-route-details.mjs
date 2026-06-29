import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = resolve("index.html");
const html = readFileSync(sourcePath, "utf8");

function extractFunctionBody(source, name) {
  const signature = `function ${name}()`;
  const signatureIndex = source.indexOf(signature);
  if (signatureIndex < 0) {
    throw new Error(`找不到函数 ${name}`);
  }
  const openIndex = source.indexOf("{", signatureIndex);
  if (openIndex < 0) {
    throw new Error(`函数 ${name} 缺少函数体`);
  }

  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, index);
    }
  }
  throw new Error(`函数 ${name} 的函数体未闭合`);
}

const initialRouteBody = extractFunctionBody(html, "applyInitialRoute");
const forbiddenAutoDetails = [
  "enterEventDetail(",
  "enterChapterDetail("
];

for (const forbiddenCall of forbiddenAutoDetails) {
  if (initialRouteBody.includes(forbiddenCall)) {
    throw new Error(`初始路由不能自动展开详情面板：${forbiddenCall}`);
  }
}

console.log("Initial route detail guard validation passed.");
