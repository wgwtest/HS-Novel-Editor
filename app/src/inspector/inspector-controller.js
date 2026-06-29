export function createInspectorController({
  chapterRefsForRange,
  chapters,
  characterById,
  document,
  events,
  formatFullRange,
  getStoryDataError,
  getStoryDataSource,
  normalizeVisualState,
  parseTime,
  state,
  trackById,
  tracks,
  window
}) {
  function updateInspectorEmpty() {
    document.getElementById("selectionKind").textContent = "No Selection";
    document.getElementById("selectionTitle").textContent = "尚未选中对象";
    document.getElementById("selectionDesc").textContent = getStoryDataError()
      ? `当前使用内置演示投影数据。JSON 读取失败：${getStoryDataError()}`
      : "请在画布中点击章节、主线标题、人物条或事件块。系统会先显示 Inspector，不会自动进入详情。";
    document.getElementById("selectionTags").innerHTML = `<span class="tag">WAITING</span><span class="tag">DATA ${getStoryDataSource()}</span>`;
    document.getElementById("summaryCoord").textContent = "未选中";
    document.getElementById("summaryTrack").textContent = "未选中";
    document.getElementById("summaryInput").textContent = "等待选择对象。";
    document.getElementById("summaryOutput").textContent = "等待选择对象。";
    document.getElementById("summaryRisk").textContent = "等待选择对象。";
    document.getElementById("enterEvent").disabled = true;
    document.getElementById("enterChapter").disabled = true;
    document.getElementById("route-state").textContent = "画布模式";
  }

  function updateInspectorEvent(id) {
    const item = events.find((eventItem) => eventItem.id === id);
    const track = trackById(item.track);
    const character = item.kind === "character" ? characterById(item.character) : null;
    const isBackground = item.kind === "character" && item.visibility === "background";
    const visualState = normalizeVisualState(item);
    const timeRange = formatFullRange(item.startAt, item.endAt);
    const chapterRefs = chapterRefsForRange(item.startAt, item.endAt);
    const chapterLabel = chapterRefs.length > 0 ? chapterRefs.join("/") : "未落入章节";
    document.getElementById("selectionKind").textContent = item.kind === "character"
      ? (isBackground ? "Selected Character Background" : "Selected Character Event")
      : "Selected Story Event";
    document.getElementById("selectionTitle").textContent = character && item.roleBrief
      ? `${character.name}：${item.roleBrief}`
      : item.title;
    document.getElementById("selectionDesc").textContent = item.kind === "character"
      ? (isBackground
        ? "当前选中的是人物条虚段：逻辑上持续，但正文未直接描写；它不会扩大故事线事件边界。"
        : "当前选中的是人物条实段：正文已经写到的人物参与片段。需要点击“拆解事件”，才进入事件检查器。")
      : "当前只是选中故事线事件块。需要点击“拆解事件”，才进入事件检查器。";
    const personTag = character ? `<span class="tag">${character.name}</span>` : "";
    const visibilityTag = character ? `<span class="tag">${isBackground ? "BACKGROUND" : "EXPLICIT"}</span>` : "";
    document.getElementById("selectionTags").innerHTML = `<span class="tag">${chapterLabel}</span><span class="tag">${track.name}</span>${personTag}${visibilityTag}<span class="tag">${visualState.toUpperCase()}</span>`;
    document.getElementById("summaryCoord").textContent = `${timeRange} / ${chapterLabel}`;
    document.getElementById("summaryTrack").textContent = character ? `${track.name} / ${character.name}` : track.name;
    document.getElementById("summaryInput").textContent = character ? (item.action || item.input) : item.input;
    document.getElementById("summaryOutput").textContent = character ? (item.relationChange || item.output) : item.output;
    document.getElementById("summaryRisk").textContent = isBackground
      ? `${item.risk} 注意：虚段只解释后台状态，不能当成文中已经发生的事件。`
      : item.risk;
    document.getElementById("eventInput").textContent = character ? (item.action || item.input) : item.input;
    document.getElementById("eventInside").textContent = character
      ? (isBackground
        ? `${character.name} 在“${track.name}”里的后台状态片段；它需要触发依据，只能解释逻辑延续，不能替代正文事件。`
        : `${character.name} 在“${track.name}”里的正文可见参与片段；同一人物可以在其他故事线下出现，但语义由所在故事线决定。`)
      : "事件检查器服务于当前选中的故事线事件块，可以是单章节事件，也可以是跨章节事件。";
    document.getElementById("eventOutput").textContent = `${item.output} 风险：${isBackground ? `${item.risk} 不能把虚段反向写成事件线延长。` : item.risk}`;
    document.getElementById("enterEvent").disabled = false;
    document.getElementById("enterChapter").disabled = true;
    document.getElementById("route-state").textContent = "事件已选中";
  }

  function updateInspectorTrack(id, options = {}) {
    const track = trackById(id);
    const personCount = track.characters.length;
    if (personCount > 0 && options.toggle !== false) track.expanded = !track.expanded;
    const names = track.characters.map((characterId) => characterById(characterId).name).join(" / ") || "无人物条";
    document.getElementById("selectionKind").textContent = "Selected Story Line";
    document.getElementById("selectionTitle").textContent = track.name;
    document.getElementById("selectionDesc").textContent = personCount > 0
      ? `已${track.expanded ? "展开" : "折叠"}这条故事线。展开后下方显示人物条，人物条高度低于主故事线。`
      : "这条故事线当前没有人物条，只作为主轨展示。";
    document.getElementById("selectionTags").innerHTML = `<span class="tag">${track.expanded ? "EXPANDED" : "COLLAPSED"}</span><span class="tag">${personCount} PERSON</span>`;
    document.getElementById("summaryCoord").textContent = "跨章节";
    document.getElementById("summaryTrack").textContent = track.name;
    document.getElementById("summaryInput").textContent = `故事线下人物：${names}`;
    document.getElementById("summaryOutput").textContent = track.expanded ? "人物条已显示，可继续选择人物或其实虚片段。" : "人物条已收起，主轨仍保留。";
    document.getElementById("summaryRisk").textContent = "人物不是主轨的替代品；展开只用于观察该故事线下的人物参与，不能拉长事件线。";
    document.getElementById("enterEvent").disabled = true;
    document.getElementById("enterChapter").disabled = true;
    document.getElementById("route-state").textContent = track.expanded ? "故事线已展开" : "故事线已折叠";
  }

  function updateInspectorCharacter(trackId, characterId) {
    const track = trackById(trackId);
    const character = characterById(characterId);
    const participationEvents = events
      .filter((eventItem) => eventItem.kind === "character" && eventItem.track === trackId && eventItem.character === characterId)
      .sort((a, b) => parseTime(a.startAt) - parseTime(b.startAt));
    const samePersonTrackNames = tracks
      .filter((trackItem) => trackItem.characters.includes(characterId))
      .map((trackItem) => trackItem.name)
      .join(" / ");
    const roleBriefList = participationEvents
      .slice(0, 8)
      .map((eventItem) => {
        const chapterRefs = chapterRefsForRange(eventItem.startAt, eventItem.endAt);
        const chapterLabel = chapterRefs[0] || eventItem.code.split(" / ")[0];
        return `${chapterLabel} ${eventItem.roleBrief || eventItem.title}`;
      })
      .join(" / ");
    const relationChangeSummary = [...new Set(participationEvents
      .map((eventItem) => eventItem.relationChange || eventItem.output)
      .filter(Boolean))]
      .slice(0, 3)
      .join(" ");
    const inspectorSummary = participationEvents
      .slice(0, 3)
      .map((eventItem) => eventItem.inspectorSummary || eventItem.risk)
      .filter(Boolean)
      .join(" ");
    document.getElementById("selectionKind").textContent = "Selected Character Lane";
    document.getElementById("selectionTitle").textContent = `${character.name} / ${track.name}`;
    document.getElementById("selectionDesc").textContent = participationEvents.length > 0
      ? `${character.name} 在这条故事线下已有 ${participationEvents.length} 个章节参与片段。`
      : `${character.name} 在这条故事线下尚未采集人物参与片段。`;
    document.getElementById("selectionTags").innerHTML = `<span class="tag">${character.name}</span><span class="tag">${track.name}</span><span class="tag">${participationEvents.length} PARTS</span>`;
    document.getElementById("summaryCoord").textContent = participationEvents.length > 0 ? `${participationEvents.length} 个参与片段` : "尚未采集";
    document.getElementById("summaryTrack").textContent = `${track.name} / 人物参与`;
    document.getElementById("summaryInput").textContent = roleBriefList || "尚未采集人物参与片段。";
    document.getElementById("summaryOutput").textContent = relationChangeSummary || `同一人物可同时出现在：${samePersonTrackNames}`;
    document.getElementById("summaryRisk").textContent = inspectorSummary || "人物行只做聚合，不替代具体人物事件条。";
    document.getElementById("enterEvent").disabled = true;
    document.getElementById("enterChapter").disabled = true;
    document.getElementById("route-state").textContent = "人物条已选中";
  }

  function updateInspectorChapter(id) {
    const item = chapters.find((chapter) => chapter.id === id);
    document.getElementById("selectionKind").textContent = "Selected Chapter";
    document.getElementById("selectionTitle").textContent = `${item.id} ${item.title}`;
    document.getElementById("selectionDesc").textContent = "当前只是选中章节覆盖区。章节是正文切片，横向宽度来自它覆盖的真实时间范围。";
    document.getElementById("selectionTags").innerHTML = `<span class="tag">${item.id}</span><span class="tag">章节覆盖层</span><span class="tag">CONFIRM</span>`;
    document.getElementById("summaryCoord").textContent = formatFullRange(item.startAt, item.endAt);
    document.getElementById("summaryTrack").textContent = "真实时间轴 / 章节覆盖";
    document.getElementById("summaryInput").textContent = item.input;
    document.getElementById("summaryOutput").textContent = item.output;
    document.getElementById("summaryRisk").textContent = "如果误触即进入，会打断时间线编辑。";
    document.getElementById("chapterInput").textContent = item.input;
    document.getElementById("chapterInside").textContent = item.inside;
    document.getElementById("chapterOutput").textContent = item.output;
    document.getElementById("enterEvent").disabled = true;
    document.getElementById("enterChapter").disabled = false;
    document.getElementById("route-state").textContent = "章节已选中";
  }

  function hideDetails() {
    document.getElementById("eventDetail").classList.remove("active");
    document.getElementById("chapterDetail").classList.remove("active");
  }

  function enterEventDetail() {
    if (state.selected?.type !== "event") return;
    hideDetails();
    document.getElementById("eventDetail").classList.add("active");
    document.getElementById("route-state").textContent = "事件检查器";
    state.detailMode = "event";
  }

  function enterChapterDetail() {
    if (state.selected?.type !== "chapter") return;
    const item = chapters.find((chapter) => chapter.id === state.selected.id);
    if (!item) return;
    const params = new URLSearchParams({
      chapter: item.id,
      title: item.title,
      startAt: item.startAt,
      endAt: item.endAt
    });
    document.getElementById("route-state").textContent = "进入章节函数";
    window.location.href = `chapter-workbench.html?${params.toString()}`;
  }

  return {
    enterChapterDetail,
    enterEventDetail,
    hideDetails,
    updateInspectorChapter,
    updateInspectorCharacter,
    updateInspectorEmpty,
    updateInspectorEvent,
    updateInspectorTrack
  };
}
