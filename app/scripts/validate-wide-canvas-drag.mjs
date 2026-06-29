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
  ['id="wideMode"', "Missing wide-screen toolbar button."],
  [".frame.wide-mode", "Missing wide-screen frame layout class."],
  ["function setWideMode(", "Missing wide-screen mode setter."],
  ["function applyWideModeClass(", "Missing wide-screen class synchronizer."],
  ["isWideMode: false", "Missing wide-screen state flag."],
  ["offsetY: 0", "Missing vertical viewport offset state."],
  ["dragStartY: 0", "Missing vertical drag origin."],
  ["dragStartOffsetY: 0", "Missing vertical drag offset origin."],
  ["function maxOffsetY(", "Missing vertical offset bounds."],
  ["function clampOffsetY(", "Missing vertical offset clamp."],
  ["function clampOffsets(", "Missing combined viewport clamp."],
  ["function rowScreenY(", "Missing row-to-screen Y projection."],
  ["function bodyViewportHeight(", "Missing body viewport height helper."],
  ["function bodyContentHeight(", "Missing body content height helper."],
  ["offsetY: state.offsetY", "Missing vertical offset persistence."],
  ["isWideMode: state.isWideMode", "Missing wide-screen state persistence."],
  ["state.offsetY = Number.isFinite(Number(viewState.offsetY))", "Missing vertical offset restore."],
  ["state.isWideMode = Boolean(viewState.isWideMode)", "Missing wide-screen restore."],
  ["const dy = event.clientY - state.dragStartY", "Pointer drag does not track Y delta."],
  ["state.offsetY = state.dragStartOffsetY - dy", "Pointer drag does not update vertical viewport."],
  ["setWideMode(!state.isWideMode)", "Wide-screen button is not wired."],
  ["persistCurrentDatasetState()", "Viewport changes are not persisted."]
];

for (const [snippet, message] of requiredSnippets) {
  assertIncludes(snippet, message);
}

assertNotIncludes(".frame.wide-mode .inspector { display: none", "Wide-screen mode must not hide Inspector.");
assertNotIncludes(".wide-mode .inspector { display: none", "Wide-screen mode must preserve Inspector.");

console.log("Wide canvas and two-axis drag validation passed.");
