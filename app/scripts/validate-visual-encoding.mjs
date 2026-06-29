import { dataPath, readAppSource, readJson } from "./app-validation-helpers.mjs";

const story = readJson(dataPath(import.meta.url, "story.json"));
const schema = readJson(dataPath(import.meta.url, "schema.json"));
const html = readAppSource(import.meta.url);

const failures = [];
const hexColor = /^#[0-9a-fA-F]{6}$/;
const visualStates = new Set(["normal", "warn", "risk", "key", "background", "continuing"]);
const reservedStateColors = new Set(["#a66a10", "#b42b40"]);

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(Array.isArray(story.tracks), "story.json 必须包含 tracks 数组。");
assert(Array.isArray(story.events), "story.json 必须包含 events 数组。");

for (const track of story.tracks || []) {
  assert(hexColor.test(track.color || ""), `故事线 ${track.id} 必须有 hex 格式 color。`);
  assert(hexColor.test(track.soft || ""), `故事线 ${track.id} 必须有 hex 格式 soft。`);
  assert(!reservedStateColors.has((track.color || "").toLowerCase()), `故事线 ${track.id} 不应直接使用警示橙或风险红作为身份色。`);
}

for (const event of story.events || []) {
  assert(visualStates.has(event.visualState), `事件 ${event.id} 必须有合法 visualState。`);
  if (event.kind === "story") {
    assert(event.visualState !== "background", `故事事件 ${event.id} 不应使用 background 状态。`);
  }
  if (event.tone) {
    assert(!["media", "temple"].includes(event.tone), `事件 ${event.id} 的 tone 不应再用 ${event.tone} 表示分类色。`);
  }
}

const trackRequired = schema?.$defs?.track?.required || [];
const eventRequired = schema?.$defs?.event?.required || [];
assert(trackRequired.includes("color"), "schema track.required 必须包含 color。");
assert(trackRequired.includes("soft"), "schema track.required 必须包含 soft。");
assert(eventRequired.includes("visualState"), "schema event.required 必须包含 visualState。");

assert(html.includes("function eventVisual("), "index.html 必须提供 eventVisual 视觉编码函数。");
assert(html.includes("track.color") || html.includes("track?.color"), "index.html 渲染故事事件时必须读取 track.color。");
assert(!html.includes("const [storyFill, storyStroke] = toneColors(item.tone);"), "index.html 不应再用 toneColors(item.tone) 决定故事事件主色。");

if (failures.length > 0) {
  console.error("视觉编码规则校验失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("视觉编码规则校验通过。");
