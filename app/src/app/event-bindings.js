export function bindAppEvents({
  applySelectedStory,
  applyTimelineRange,
  canvas,
  clampOffsets,
  defaultViewScale,
  document,
  draw,
  enterChapterDetail,
  enterEventDetail,
  getActiveStoryId,
  hideDetails,
  hitTest,
  persistCurrentDatasetState,
  resetDatasetState,
  resizeCanvas,
  selectedRouteLabel,
  selectRegion,
  setAxisMode,
  setScale,
  setStoryDataError,
  setWideMode,
  state,
  tracks,
  updateDataSourceState,
  updateInspectorEmpty,
  window
}) {
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.08 : 0.92;
    setScale(state.scale * factor, event.offsetX);
  }, { passive: false });

  canvas.addEventListener("pointerdown", (event) => {
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // Synthetic pointer events used by automated checks may not be capturable.
    }
    state.isDragging = true;
    state.dragStartX = event.clientX;
    state.dragStartY = event.clientY;
    state.dragStartOffset = state.offsetX;
    state.dragStartOffsetY = state.offsetY;
    state.moved = false;
    canvas.classList.add("dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.isDragging) return;
    const dx = event.clientX - state.dragStartX;
    const dy = event.clientY - state.dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) state.moved = true;
    state.offsetX = state.dragStartOffset - dx / state.scale;
    state.offsetY = state.dragStartOffsetY - dy;
    clampOffsets();
    draw();
  });

  canvas.addEventListener("pointerup", (event) => {
    state.isDragging = false;
    canvas.classList.remove("dragging");
    const region = hitTest(event.offsetX, event.offsetY);
    if (!state.moved) selectRegion(region);
    if (state.moved) persistCurrentDatasetState();
  });

  document.getElementById("zoomSlider").addEventListener("input", (event) => {
    setScale(Number(event.target.value) / 100);
  });

  document.getElementById("storySelect").addEventListener("change", async (event) => {
    const nextStoryId = event.target.value;
    if (!nextStoryId || nextStoryId === getActiveStoryId()) return;
    try {
      persistCurrentDatasetState();
      document.getElementById("route-state").textContent = "投影数据加载中";
      await applySelectedStory(nextStoryId);
      document.getElementById("route-state").textContent = "投影数据已切换";
    } catch (error) {
      setStoryDataError(error.message);
      document.getElementById("route-state").textContent = "投影数据读取失败";
      event.target.value = getActiveStoryId();
      updateDataSourceState();
      updateInspectorEmpty();
    }
  });

  document.querySelectorAll("[data-axis-mode]").forEach((button) => {
    button.addEventListener("click", () => setAxisMode(button.dataset.axisMode));
  });

  document.getElementById("applyTimeline").addEventListener("click", applyTimelineRange);
  document.getElementById("zoomIn").addEventListener("click", () => setScale(state.scale * 1.35));
  document.getElementById("zoomOut").addEventListener("click", () => setScale(state.scale * 0.85));
  document.getElementById("expandAll").addEventListener("click", () => {
    tracks.forEach((track) => {
      if (track.characters.length > 0) track.expanded = true;
    });
    clampOffsets();
    draw();
    persistCurrentDatasetState();
  });
  document.getElementById("resetView").addEventListener("click", () => {
    state.scale = defaultViewScale;
    state.offsetX = 0;
    state.offsetY = 0;
    state.detailMode = "summary";
    hideDetails();
    draw();
    persistCurrentDatasetState();
  });
  document.getElementById("wideMode").addEventListener("click", () => setWideMode(!state.isWideMode));
  document.getElementById("resetDatasetState").addEventListener("click", () => resetDatasetState());
  document.getElementById("enterEvent").addEventListener("click", enterEventDetail);
  document.getElementById("enterChapter").addEventListener("click", enterChapterDetail);
  document.getElementById("backToCanvas").addEventListener("click", () => {
    hideDetails();
    state.detailMode = "summary";
    document.getElementById("route-state").textContent = selectedRouteLabel();
  });

  window.addEventListener("resize", resizeCanvas);
}
