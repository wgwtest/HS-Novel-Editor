import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(scriptDir, "..");
const dataPath = join(sourceDir, "data", "stories", "story-c1-c14-storylines-preview-v0.1.json");

const story = JSON.parse(readFileSync(dataPath, "utf8"));
const tracksById = new Map(story.tracks.map((track) => [track.id, track]));
const chapterIds = new Set(story.chapters.map((chapter) => chapter.id));

function fail(message) {
  throw new Error(message);
}

const storyEvents = story.events.filter((event) => event.kind === "story" && event.track !== "main");
const characterEvents = story.events.filter((event) => event.kind === "character");

if (characterEvents.length === 0) {
  fail("C1-C14 故事线预览数据没有人物子线事件。");
}

for (const event of storyEvents) {
  const track = tracksById.get(event.track);
  if (!track) fail(`故事事件 ${event.id} 引用了不存在的故事线 ${event.track}。`);
  if (event.title === `${event.code?.split(" / ")[0]} ${track.name}`) {
    fail(`故事事件 ${event.id} 仍在使用“章节 + 故事线名”的占位标题：${event.title}`);
  }
  if (event.title.includes(track.name)) {
    fail(`故事事件 ${event.id} 的标题仍重复故事线名称：${event.title}`);
  }
}

for (const event of characterEvents) {
  if (!event.character) fail(`人物事件 ${event.id} 缺少 character。`);
  if (!tracksById.has(event.track)) fail(`人物事件 ${event.id} 引用了不存在的故事线 ${event.track}。`);
  if (!event.code?.includes(event.character)) fail(`人物事件 ${event.id} 的 code 没有标出人物对象。`);
  const chapterId = event.code?.split(" / ")[0];
  if (!chapterIds.has(chapterId)) fail(`人物事件 ${event.id} 的章节编号无效：${chapterId}`);
}

const trackCharacterCoverage = new Map();
for (const event of characterEvents) {
  const key = `${event.track}:${event.character}`;
  trackCharacterCoverage.set(key, (trackCharacterCoverage.get(key) || 0) + 1);
}

const expandedTracks = story.tracks.filter((track) => track.characters.length > 0);
for (const track of expandedTracks) {
  const hasAnyCharacterEvent = track.characters.some((characterId) => trackCharacterCoverage.has(`${track.id}:${characterId}`));
  if (!hasAnyCharacterEvent) {
    fail(`故事线 ${track.id} 有人物候选，但没有任何人物子线事件。`);
  }
}

console.log("Storyline preview quality validation passed.");
