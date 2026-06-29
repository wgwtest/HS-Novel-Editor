import { dataPath, readAppSource, readJson } from "./app-validation-helpers.mjs";

const story = readJson(dataPath(import.meta.url, "stories", "story-c1-c14-storylines-preview-v0.1.json"));
const html = readAppSource(import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const storyTitleByKey = new Map(
  story.events
    .filter((event) => event.kind === "story")
    .map((event) => [`${event.code.split(" / ")[0]}:${event.track}`, event.title])
);

const characterEvents = story.events.filter((event) => event.kind === "character");
assert(characterEvents.length > 0, "缺少人物参与事件。");

for (const event of characterEvents) {
  const chapterId = event.code.split(" / ")[0];
  const storyTitle = storyTitleByKey.get(`${chapterId}:${event.track}`);
  assert(storyTitle, `人物事件 ${event.id} 找不到对应故事事件。`);
  assert(event.title !== storyTitle, `人物事件 ${event.id} 仍然复用故事事件标题。`);
  assert(typeof event.roleBrief === "string" && event.roleBrief.trim(), `人物事件 ${event.id} 缺少 roleBrief。`);
  assert([...event.roleBrief].length <= 15, `人物事件 ${event.id} 的 roleBrief 超过 15 字：${event.roleBrief}`);
  assert([...event.roleBrief].length >= 5, `人物事件 ${event.id} 的 roleBrief 表达过短：${event.roleBrief}`);
  assert(event.title === event.roleBrief, `人物事件 ${event.id} 的画布标题必须使用 roleBrief。`);
  assert(typeof event.action === "string" && event.action.trim(), `人物事件 ${event.id} 缺少 action。`);
  assert(typeof event.relationChange === "string" && event.relationChange.trim(), `人物事件 ${event.id} 缺少 relationChange。`);
  assert(typeof event.inspectorSummary === "string" && event.inspectorSummary.trim(), `人物事件 ${event.id} 缺少 inspectorSummary。`);
  assert(typeof event.participantName === "string" && event.participantName.trim(), `人物事件 ${event.id} 缺少 participantName。`);
  assert(!event.input.includes("参与："), `人物事件 ${event.id} 的 input 仍是模板参与句。`);
  assert(!event.output.includes("该人物片段服务于"), `人物事件 ${event.id} 的 output 仍是模板句。`);
}

assert(html.includes("participationEvents"), "人物行 Inspector 没有聚合人物参与事件。");
assert(html.includes("roleBrief"), "页面没有消费 roleBrief 字段。");
assert(html.includes("relationChange"), "页面没有消费 relationChange 字段。");
assert(html.includes("inspectorSummary"), "页面没有消费 inspectorSummary 字段。");

console.log("Character participation validation passed.");
