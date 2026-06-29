export const STORY_DATA_BASE_URL = "public/data";
export const STORY_MANIFEST_URL = `${STORY_DATA_BASE_URL}/stories/index.json`;

async function fetchJson(url, label) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`读取 ${label} 失败：HTTP ${response.status}`);
  return response.json();
}

export function validateStoryManifest(manifest) {
  if (!manifest || typeof manifest !== "object") throw new Error("stories/index.json 必须是对象。");
  if (!Array.isArray(manifest.stories) || manifest.stories.length === 0) throw new Error("stories/index.json 缺少 stories 数组。");
  return manifest.stories.map((item) => {
    if (!item || typeof item !== "object") throw new Error("stories 条目必须是对象。");
    if (!item.id || !item.label || !item.file) throw new Error("stories 条目必须包含 id、label、file。");
    if (item.file.includes("..") || item.file.includes("/") || item.file.includes("\\")) throw new Error(`非法 story 文件名：${item.file}`);
    return {
      id: String(item.id),
      label: String(item.label),
      file: String(item.file),
      description: item.description ? String(item.description) : ""
    };
  });
}

export function storyUrl(item) {
  return `${STORY_DATA_BASE_URL}/stories/${item.file}`;
}

export async function loadStoryManifest() {
  const manifest = await fetchJson(STORY_MANIFEST_URL, "stories/index.json");
  return {
    manifest,
    list: validateStoryManifest(manifest)
  };
}

export async function loadStoryProjection(item) {
  return fetchJson(storyUrl(item), item.file);
}

export async function loadLegacyStoryData() {
  const source = `${STORY_DATA_BASE_URL}/story.json`;
  return {
    source,
    data: await fetchJson(source, "story.json")
  };
}
