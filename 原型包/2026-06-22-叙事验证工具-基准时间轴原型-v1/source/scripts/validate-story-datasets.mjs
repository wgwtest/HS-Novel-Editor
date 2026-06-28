import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(scriptDir, "..");
const storiesDir = join(sourceDir, "data", "stories");
const html = readFileSync(join(sourceDir, "index.html"), "utf8");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const manifest = readJson(join(storiesDir, "index.json"));

assert(Array.isArray(manifest.stories), "data/stories/index.json 缺少 stories 数组。");
assert(manifest.stories.length >= 2, "至少需要两个 story 数据集用于下拉切换验证。");

for (const item of manifest.stories) {
  assert(item && typeof item === "object", "stories 条目必须是对象。");
  assert(typeof item.id === "string" && item.id.trim(), "story 条目缺少 id。");
  assert(typeof item.label === "string" && item.label.trim(), `story ${item.id} 缺少 label。`);
  assert(typeof item.file === "string" && item.file.trim(), `story ${item.id} 缺少 file。`);
  assert(!item.file.includes("..") && !item.file.includes("/") && !item.file.includes("\\"), `story ${item.id} 的 file 必须限制在 data/stories 目录内。`);

  const storyPath = normalize(join(storiesDir, item.file));
  assert(storyPath.startsWith(storiesDir), `story ${item.id} 不能越过 data/stories 目录。`);
  const story = readJson(storyPath);
  assert(story.meta && typeof story.meta === "object", `story ${item.id} 缺少 meta。`);
  assert(story.meta.datasetType === "narrativeTimelineProjection", `story ${item.id} 必须声明为基准时间轴投影数据集。`);
  assert(story.meta.projectionTarget === "baselineTimeline", `story ${item.id} 的 projectionTarget 必须是 baselineTimeline。`);
  assert(typeof story.meta.modelVersion === "string" && story.meta.modelVersion.trim(), `story ${item.id} 缺少 modelVersion。`);
  assert(Array.isArray(story.chapters) && story.chapters.length > 0, `story ${item.id} 缺少 chapters。`);
  assert(story.characters && typeof story.characters === "object", `story ${item.id} 缺少 characters。`);
  assert(Array.isArray(story.tracks) && story.tracks.length > 0, `story ${item.id} 缺少 tracks。`);
  assert(Array.isArray(story.events) && story.events.length > 0, `story ${item.id} 缺少 events。`);
}

assert(html.includes('id="storySelect"'), "页面缺少 story 数据集下拉菜单。");
assert(html.includes("loadStoryManifest"), "页面缺少 story 清单加载逻辑。");
assert(html.includes("applySelectedStory"), "页面缺少 story 切换应用逻辑。");

console.log("Story dataset validation passed.");
