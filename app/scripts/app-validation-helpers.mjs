import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function appRootFrom(metaUrl) {
  return path.resolve(path.dirname(fileURLToPath(metaUrl)), "..");
}

export function dataPath(metaUrl, ...segments) {
  return path.join(appRootFrom(metaUrl), "public", "data", ...segments);
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readAppSource(metaUrl) {
  const appRoot = appRootFrom(metaUrl);
  const parts = [
    fs.readFileSync(path.join(appRoot, "index.html"), "utf8"),
    fs.readFileSync(path.join(appRoot, "src", "main.js"), "utf8"),
    fs.readFileSync(path.join(appRoot, "src", "data", "story-loader.js"), "utf8"),
    fs.readFileSync(path.join(appRoot, "src", "state", "persisted-state.js"), "utf8"),
    fs.existsSync(path.join(appRoot, "src", "app", "event-bindings.js"))
      ? fs.readFileSync(path.join(appRoot, "src", "app", "event-bindings.js"), "utf8")
      : "",
    fs.existsSync(path.join(appRoot, "src", "app", "route.js"))
      ? fs.readFileSync(path.join(appRoot, "src", "app", "route.js"), "utf8")
      : "",
    fs.existsSync(path.join(appRoot, "src", "inspector", "inspector-controller.js"))
      ? fs.readFileSync(path.join(appRoot, "src", "inspector", "inspector-controller.js"), "utf8")
      : "",
    fs.existsSync(path.join(appRoot, "src", "timeline", "geometry.js"))
      ? fs.readFileSync(path.join(appRoot, "src", "timeline", "geometry.js"), "utf8")
      : "",
    fs.existsSync(path.join(appRoot, "src", "timeline", "hit-test.js"))
      ? fs.readFileSync(path.join(appRoot, "src", "timeline", "hit-test.js"), "utf8")
      : "",
    fs.readFileSync(path.join(appRoot, "src", "styles", "main.css"), "utf8")
  ];

  return parts.join("\n");
}
