import { join } from "node:path";
import { dataPath, readJson } from "./app-validation-helpers.mjs";

const definition = readJson(dataPath(import.meta.url, "storyline-definitions", "storylines-c1-c35-outline-v0.1.json"));
const story = readJson(dataPath(import.meta.url, "stories", "story-c1-c35-outline-preview-v0.1.json"));
const manifest = readJson(dataPath(import.meta.url, "stories", "index.json"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifestEntry = manifest.stories.find((item) => item.id === "c1-c35-outline-preview-v0-1");
assert(manifestEntry, "stories/index.json 缺少 c1-c35-outline-preview-v0-1。");
assert(manifestEntry.file === "story-c1-c35-outline-preview-v0.1.json", "C1-C35 manifest file 指向不正确。");

assert(definition.meta?.status === "outline_projection_for_review", "C1-C35 源定义必须标记为 outline_projection_for_review。");
assert(definition.meta?.notRuntimeDataset === true, "C1-C35 源定义必须声明 notRuntimeDataset。");
assert(Array.isArray(definition.chapterStorylineMatrix), "C1-C35 源定义缺少 chapterStorylineMatrix。");
assert(definition.chapterStorylineMatrix.length === 35, `C1-C35 源定义章节数应为 35，实际为 ${definition.chapterStorylineMatrix.length}。`);
assert(Array.isArray(definition.chapterBeats) && definition.chapterBeats.length >= 100, "C1-C35 源定义 chapterBeats 数量过少。");

assert(story.meta?.datasetType === "narrativeTimelineProjection", "C1-C35 运行数据必须是 narrativeTimelineProjection。");
assert(story.meta?.projectionTarget === "baselineTimeline", "C1-C35 运行数据 projectionTarget 必须是 baselineTimeline。");
assert(Array.isArray(story.chapters) && story.chapters.length === 35, `C1-C35 运行数据章节数应为 35，实际为 ${story.chapters?.length}。`);
assert(Array.isArray(story.tracks) && story.tracks.length >= 11, "C1-C35 运行数据至少应包含 11 条故事线轨道。");
assert(Array.isArray(story.events) && story.events.length > 300, "C1-C35 运行数据事件数量过少。");

const chaptersById = new Map(story.chapters.map((chapter) => [chapter.id, chapter]));
const tracksById = new Map(story.tracks.map((track) => [track.id, track]));
const characterIds = new Set(Object.keys(story.characters || {}));
const eventIds = new Set();

for (let index = 1; index <= 35; index += 1) {
  const chapterId = `C${index}`;
  assert(chaptersById.has(chapterId), `缺少章节 ${chapterId}。`);
}

for (let index = 1; index <= 14; index += 1) {
  const chapter = chaptersById.get(`C${index}`);
  assert(chapter.sourceStatus === "completed_text", `${chapter.id} 应标记为 completed_text。`);
}

for (let index = 15; index <= 28; index += 1) {
  const chapter = chaptersById.get(`C${index}`);
  assert(chapter.sourceStatus === "planned_outline", `${chapter.id} 应标记为 planned_outline。`);
}

for (let index = 29; index <= 35; index += 1) {
  const chapter = chaptersById.get(`C${index}`);
  assert(chapter.sourceStatus === "planned_followup", `${chapter.id} 应标记为 planned_followup。`);
}

for (const requiredTrack of ["chemistry_evidence_collaboration", "lvyu_hidden_network"]) {
  assert(tracksById.has(requiredTrack), `缺少新增故事线轨道 ${requiredTrack}。`);
}

for (const requiredCharacter of ["chemical_girl", "lvyu", "old_wu_wife", "volunteer_group"]) {
  assert(characterIds.has(requiredCharacter), `缺少新增人物 ${requiredCharacter}。`);
}

for (const event of story.events) {
  assert(!eventIds.has(event.id), `事件 ID 重复：${event.id}。`);
  eventIds.add(event.id);
  assert(tracksById.has(event.track), `事件 ${event.id} 引用了不存在的 track：${event.track}。`);
  assert(typeof event.sourceStatus === "string" && event.sourceStatus.trim(), `事件 ${event.id} 缺少 sourceStatus。`);
  assert(typeof event.sourceRef === "string" && event.sourceRef.trim(), `事件 ${event.id} 缺少 sourceRef。`);
  assert(Date.parse(event.startAt) < Date.parse(event.endAt), `事件 ${event.id} 的时间范围无效。`);

  if (event.kind === "character") {
    assert(characterIds.has(event.character), `人物事件 ${event.id} 引用了不存在的人物 ${event.character}。`);
    assert(typeof event.roleBrief === "string" && event.roleBrief.trim(), `人物事件 ${event.id} 缺少 roleBrief。`);
    assert([...event.roleBrief].length >= 5, `人物事件 ${event.id} 的 roleBrief 过短：${event.roleBrief}。`);
    assert([...event.roleBrief].length <= 15, `人物事件 ${event.id} 的 roleBrief 超过 15 字：${event.roleBrief}。`);
    assert(event.title === event.roleBrief, `人物事件 ${event.id} 的 title 必须等于 roleBrief。`);
    assert(tracksById.get(event.track).characters.includes(event.character), `人物事件 ${event.id} 不在 track ${event.track} 的人物列表中。`);
  }
}

const storyEventKeys = new Set(
  story.events
    .filter((event) => event.kind === "story" && event.track !== "main")
    .map((event) => `${event.code.split(" / ")[0]}:${event.track}`)
);

for (const beat of definition.chapterBeats) {
  assert(storyEventKeys.has(`${beat.chapter}:${beat.storyline}`), `缺少 ${beat.chapter} / ${beat.storyline} 的故事事件。`);
}

const c35Events = story.events.filter((event) => event.code?.startsWith("C35 / "));
assert(c35Events.length >= 5, "C35 至少应包含 5 条故事线事件。");

console.log("C1-C35 outline dataset validation passed.");
