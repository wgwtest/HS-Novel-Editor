import { readAppSource } from "./app-validation-helpers.mjs";

const html = readAppSource(import.meta.url);

function assertIncludes(snippet, message) {
  if (!html.includes(snippet)) {
    throw new Error(message);
  }
}

function assertNotIncludes(snippet, message) {
  if (html.includes(snippet)) {
    throw new Error(message);
  }
}

const requiredSnippets = [
  [
    'const VIEW_STATE_STORAGE_KEY = "hs-novel-editor:timeline-view-state:v1"',
    "Missing durable localStorage key for timeline view state."
  ],
  ["function loadPersistedState(", "Missing persisted state loader."],
  ["function savePersistedState(", "Missing persisted state saver."],
  ["function getDatasetViewState(", "Missing dataset state reader."],
  ["function setDatasetViewState(", "Missing dataset state writer."],
  ["function clearDatasetViewState(", "Missing dataset state resetter."],
  ["function captureCurrentDatasetState(", "Missing current dataset state capture."],
  ["function applyDatasetViewState(", "Missing dataset state restore."],
  ["function applyDefaultDatasetViewState(", "Missing default state restore."],
  ["function resetDatasetState(", "Missing dataset reset interaction handler."],
  ['id="resetDatasetState"', "Missing reset-state toolbar button."],
  ["localStorage.getItem(VIEW_STATE_STORAGE_KEY)", "Missing localStorage read."],
  ["localStorage.setItem(VIEW_STATE_STORAGE_KEY", "Missing localStorage write."],
  ["expandedTrackIds", "Missing expanded-track dataset state."],
  ["persistCurrentDatasetState()", "Missing persistence calls after state mutations."]
];

for (const [snippet, message] of requiredSnippets) {
  assertIncludes(snippet, message);
}

assertNotIncludes('id="collapseAll"', "Toolbar still exposes obsolete collapse-all button.");
assertNotIncludes('document.getElementById("collapseAll")', "Obsolete collapse-all handler is still wired.");

const mutationFunctions = [
  "function setAxisMode(",
  "function applyTimelineRange(",
  "function setScale(",
  "function selectRegion(",
  'document.getElementById("expandAll").addEventListener',
  'document.getElementById("resetView").addEventListener',
  'document.getElementById("resetDatasetState").addEventListener'
];

for (const marker of mutationFunctions) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Missing mutation marker: ${marker}`);
  }

  const nextFunctionIndex = html.indexOf("\n    function ", markerIndex + marker.length);
  const nextListenerIndex = html.indexOf("\n    document.getElementById", markerIndex + marker.length);
  const candidates = [nextFunctionIndex, nextListenerIndex].filter((index) => index !== -1);
  const sectionEnd = candidates.length > 0 ? Math.min(...candidates) : markerIndex + 1400;
  const section = html.slice(markerIndex, sectionEnd);

  if (!section.includes("persistCurrentDatasetState()") && !section.includes("resetDatasetState()")) {
    throw new Error(`State mutation does not persist view state near: ${marker}`);
  }
}

console.log("View state management validation passed.");
