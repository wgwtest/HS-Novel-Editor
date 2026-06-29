export function applyInitialRoute({
  chapters,
  clampOffsets,
  draw,
  location,
  selectRegion,
  state,
  timeToWorld,
  trackById,
  tracks,
  updateStateLabels,
  zoomMax
}) {
  const hash = location.hash.replace("#", "");
  if (hash === "track-selected") {
    const media = trackById("media");
    if (media) media.expanded = false;
    selectRegion({ type: "track", id: "media" });
  } else if (hash === "character-selected") {
    const interview = trackById("interview");
    if (interview) interview.expanded = true;
    selectRegion({ type: "character", id: "interview:yiren", track: "interview", character: "yiren" });
  } else if (hash === "event-selected") {
    const interview = trackById("interview");
    if (interview) interview.expanded = true;
    selectRegion({ type: "event", id: "E005" });
  } else if (hash === "background-selected") {
    const temple = trackById("temple");
    if (temple) temple.expanded = true;
    selectRegion({ type: "event", id: "CE-T-yiren-bg-1" });
  } else if (hash.startsWith("chapter=")) {
    const chapterId = decodeURIComponent(hash.slice("chapter=".length));
    if (chapters.some((chapter) => chapter.id === chapterId)) {
      selectRegion({ type: "chapter", id: chapterId });
    } else if (chapters.length > 0) {
      selectRegion({ type: "chapter", id: chapters[0].id });
    }
  } else if (hash === "chapter-selected") {
    selectRegion({ type: "chapter", id: chapters.some((chapter) => chapter.id === "C15") ? "C15" : chapters[0]?.id });
  } else if (hash === "event-detail") {
    const interview = trackById("interview");
    if (interview) interview.expanded = true;
    selectRegion({ type: "event", id: "E005" });
  } else if (hash === "chapter-detail") {
    selectRegion({ type: "chapter", id: chapters.some((chapter) => chapter.id === "C15") ? "C15" : chapters[0]?.id });
  } else if (hash === "all-expanded") {
    tracks.forEach((track) => {
      if (track.characters.length > 0) track.expanded = true;
    });
    clampOffsets();
    draw();
  } else if (hash === "zoomed") {
    state.scale = zoomMax;
    state.offsetX = timeToWorld("2025-07-07T12:00");
    clampOffsets();
    updateStateLabels();
    draw();
  }
}
