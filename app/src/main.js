import {
  loadLegacyStoryData as fetchLegacyStoryData,
  loadStoryManifest as loadStoryManifestCatalog,
  loadStoryProjection,
  storyUrl as resolveStoryUrl
} from "./data/story-loader.js";
import {
  VIEW_STATE_VERSION,
  clearDatasetViewState as removeDatasetViewState,
  getDatasetViewState as readDatasetViewState,
  loadPersistedState as loadPersistedStateFromStorage,
  savePersistedState as savePersistedStateToStorage,
  setDatasetViewState as writeDatasetViewState
} from "./state/persisted-state.js";
import { createInspectorController } from "./inspector/inspector-controller.js";
import {
  createTimelineGeometry,
  dayStart,
  formatDateTime,
  formatFullRange,
  formatMonthDay,
  parseTime,
  weekOfMonth
} from "./timeline/geometry.js";

    const canvas = document.getElementById("timelineCanvas");
    const wrap = document.getElementById("canvasWrap");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const colors = {
      ink: "#101716",
      muted: "#5f6e6b",
      line: "#98a9a5",
      lineSoft: "#d4ddda",
      panel: "#fbfcfb",
      panelSoft: "#f2f6f4",
      teal: "#087268",
      tealSoft: "#dcefed",
      selectionFill: "rgba(8, 114, 104, 0.075)",
      selectionBorder: "rgba(8, 114, 104, 0.62)",
      childLine: "#6f807c",
      childSoft: "#edf2f1",
      amber: "#a66a10",
      amberSoft: "#f3e4c8",
      red: "#b42b40",
      redSoft: "#f3d7de",
      blue: "#315f83",
      blueSoft: "#dbe8f1",
      violet: "#67558a",
      violetSoft: "#e7e2ef"
    };

    const timelineConfig = {
      defaultStart: "2025-07-07T08:00",
      defaultEnd: "2025-08-01T00:00"
    };

    const chapters = [
      { id: "C10", title: "采访启动", startAt: "2025-07-07T08:00", endAt: "2025-07-08T06:00", input: "专题裂开，叶依人进入记者身份。", inside: "建立采访身份和第一个爆点。", output: "采访主线启动，张航远发现爆点。" },
      { id: "C11", title: "样本成形", startAt: "2025-07-08T06:00", endAt: "2025-07-10T18:00", input: "走访材料进入叙事。", inside: "把苦难转成可追踪事实。", output: "职业病证据线获得初步材料。" },
      { id: "C12", title: "显形加压", startAt: "2025-07-10T18:00", endAt: "2025-07-12T20:00", input: "大仙祠救助和操控同时显形。", inside: "判断压力升高。", output: "会议结果和秩序吸收获得前置。" },
      { id: "C13", title: "会议结果", startAt: "2025-07-13T08:00", endAt: "2025-07-15T12:00", input: "会议暂缓和电视台口径变化。", inside: "压力被转入体面秩序。", output: "会后缓冲开始。" },
      { id: "C14", title: "会后吸收", startAt: "2025-07-15T12:00", endAt: "2025-07-17T18:00", input: "慈善、媒体和资源口径吸收冲突。", inside: "缓冲不是静止，而是再分配。", output: "C15 私线偏移获得条件。" },
      { id: "C15", title: "私线偏移", startAt: "2025-07-18T08:00", endAt: "2025-07-20T12:00", input: "多轨事件同时进入章节。", inside: "张航远从边缘化走向私线证明。", output: "C16 诱导风险和群众争夺前置。" },
      { id: "C16", title: "群众争夺", startAt: "2025-07-21T08:00", endAt: "2025-07-23T18:00", input: "群众真实处境和解释权冲突。", inside: "各方争夺解释权。", output: "流血冲突获得社会压力。" },
      { id: "C17", title: "流血冲突", startAt: "2025-07-24T08:00", endAt: "2025-07-26T10:00", input: "诱导、镜头压力和群众情绪叠加。", inside: "现实冲突被点燃。", output: "吕玉线接管的入口出现。" },
      { id: "C18", title: "吕玉接管", startAt: "2025-07-27T08:00", endAt: "2025-07-29T12:00", input: "前台崩塌后主线切换。", inside: "吕玉接管更深层敌手结构。", output: "后续进入新主线。" },
      { id: "C19", title: "深入敌境", startAt: "2025-07-29T12:00", endAt: "2025-07-30T22:00", input: "冲突后果需要处理。", inside: "主线深入敌方系统。", output: "现实反制被打开。" },
      { id: "C20", title: "现实反制", startAt: "2025-07-31T08:00", endAt: "2025-08-01T00:00", input: "敌境信息返回现实层。", inside: "叶伊人现实手段反制。", output: "吕玉主线巩固。" }
    ];

    const characters = {
      yiren: { name: "叶依人", short: "叶", color: "#087268", soft: "#e0f0ed" },
      zhang: { name: "张航远", short: "张", color: "#b42b40", soft: "#f3d7de" },
      yushu: { name: "禹树", short: "禹", color: "#6b4f86", soft: "#e9e1f0" },
      lvyu: { name: "吕玉", short: "吕", color: "#315f83", soft: "#dbe8f1" },
      linqian: { name: "林倩", short: "林", color: "#a66a10", soft: "#f3e4c8" }
    };

    const tracks = [
      { id: "main", name: "故事主轴", sub: "跨章节推进", expanded: false, characters: [], color: "#536761", soft: "#edf2f0" },
      { id: "interview", name: "采访线", sub: "叶依人行动", expanded: true, characters: ["yiren", "zhang", "yushu"], color: "#087268", soft: "#dcefed" },
      { id: "temple", name: "大仙祠线", sub: "解释权争夺", expanded: true, characters: ["yushu", "lvyu", "yiren"], color: "#67558a", soft: "#e7e2ef" },
      { id: "media", name: "电视台线", sub: "口径和资源", expanded: false, characters: ["yiren", "zhang"], color: "#315f83", soft: "#dbe8f1" },
      { id: "proof", name: "职业病证据线", sub: "材料和边界", expanded: false, characters: ["yiren", "linqian"], color: "#4f6f5f", soft: "#e1ebe6" },
      { id: "zhang", name: "张航远线", sub: "目标漂移", expanded: true, characters: ["zhang", "yushu"], color: "#7a4f68", soft: "#eadfe5" },
      { id: "lvyu", name: "吕玉线", sub: "后段接管", expanded: false, characters: ["lvyu"], color: "#315f83", soft: "#dbe8f1" },
      { id: "fragment", name: "碎片伏笔", sub: "必须对齐章节", expanded: false, characters: ["yushu"], color: "#a66a10", soft: "#f3e4c8" }
    ];

    const events = [
      storyEvent("e-main-10", "main", "2025-07-07T08:00", "2025-07-10T12:00", "采访启动", "E010-E014", "main", "专题裂开，采访身份建立。", "完成主轴启动。", "如果前置不足，后续压力会失真。"),
      storyEvent("e-main-13", "main", "2025-07-13T08:00", "2025-07-17T16:00", "会议结果落地", "E021-E028", "main", "会议暂缓被各方吸收。", "把冲突转入会后缓冲。", "缓冲不能写成静止。"),
      storyEvent("e-main-15", "main", "2025-07-18T08:00", "2025-07-23T16:00", "会后转争夺", "E029-E041", "main", "会后吸收完成。", "转入群众争夺。", "主轴必须压住碎片线。"),
      storyEvent("e-interview-11", "interview", "2025-07-08T08:00", "2025-07-12T10:00", "走访与材料整理", "C11-C12", "main", "叶依人开始形成事实链。", "事实链可被追踪。", "材料不能变成纯说明。"),
      storyEvent("e-interview-15", "interview", "2025-07-18T10:00", "2025-07-20T10:00", "重新接触群众", "C15", "main", "会后口径重写。", "群众真实处境重新进入视野。", "需要显示解释权变化。"),
      storyEvent("e-temple-11", "temple", "2025-07-08T12:00", "2025-07-12T20:00", "救助显形", "C11-C12", "temple", "大仙祠从背景进入可见层。", "救助与控制同时出现。", "不要只写成善意救助。"),
      storyEvent("e-temple-16", "temple", "2025-07-21T08:00", "2025-07-23T18:00", "重新争夺解释权", "C16", "risk", "群众争夺启动。", "大仙祠重新争夺叙述。", "可能抢走采访线。"),
      storyEvent("e-media-13", "media", "2025-07-13T08:00", "2025-07-16T12:00", "口径重写", "C13-C14", "media", "会议结果进入电视台系统。", "媒体口径改写现实感知。", "需要和采访线形成压力。"),
      storyEvent("e-media-16", "media", "2025-07-21T12:00", "2025-07-23T12:00", "镜头压力", "C16", "risk", "群众争夺升级。", "镜头介入现实冲突。", "可能提前引爆。"),
      storyEvent("e-proof-14", "proof", "2025-07-15T12:00", "2025-07-20T12:00", "化学证据预热", "C14-C15", "warn", "样本和材料尚未闭合。", "建立取样边界。", "不能提前裁决职业病真相。"),
      storyEvent("e-proof-17", "proof", "2025-07-24T10:00", "2025-07-26T10:00", "不能提前裁决", "C17", "risk", "证据线压力上升。", "提醒证据边界。", "过强会压过采访和群众争夺。"),
      storyEvent("e-zhang-10", "zhang", "2025-07-07T12:00", "2025-07-08T06:00", "发现爆点", "C10", "warn", "张航远发现新闻价值。", "形成自我证明欲。", "需要后续承接。"),
      storyEvent("e-zhang-15", "zhang", "2025-07-13T08:00", "2025-07-20T12:00", "边缘化到私线偏移", "C13-C15", "risk", "会议暂缓，张航远被边缘化。", "他把私线理解为补足采访线。", "缺少诱导链会显得突兀。"),
      storyEvent("e-zhang-16", "zhang", "2025-07-21T08:00", "2025-07-23T18:00", "诱导风险", "C16", "risk", "私线动机形成。", "外部压力推他错站边。", "需要连续诱导链。"),
      storyEvent("e-lvyu-17", "lvyu", "2025-07-24T08:00", "2025-07-29T12:00", "主线接管", "C17-C18", "main", "前台崩塌，现实冲突升级。", "吕玉接管更深层敌手结构。", "不能来得太突然。"),
      storyEvent("e-frag-14", "fragment", "2025-07-15T12:00", "2025-07-17T18:00", "基金入口", "C14", "warn", "碎片伏笔落入章节格。", "提供群众争夺入口。", "必须服务主轴。"),
      characterEvent("ce-interview-yiren-11", "interview", "yiren", "2025-07-08T08:00", "2025-07-12T10:00", "事实链走访", "叶依人", "main", "她进入群众材料。", "采访线获得可追踪事实。", "材料不能只做情绪展示。"),
      characterEvent("ce-interview-zhang-13", "interview", "zhang", "2025-07-13T08:00", "2025-07-17T12:00", "被边缘化", "张航远", "risk", "会议暂缓后失去主导感。", "形成私线证明欲。", "容易抢走叶依人的采访判断。"),
      characterEvent("ce-interview-yushu-15", "interview", "yushu", "2025-07-18T08:00", "2025-07-20T12:00", "被纳入采访压力", "禹树", "warn", "采访线触及外围资源入口。", "禹树成为被询问和被误读的对象。", "不能让他直接替代采访主角。"),
      characterEvent("ce-temple-yushu-12", "temple", "yushu", "2025-07-10T18:00", "2025-07-12T20:00", "情报入口显露", "禹树", "warn", "大仙祠线暴露解释权入口。", "禹树的资源信息被卷入争夺。", "他在此线是情报节点，不是硬资产本身。"),
      characterEvent("ce-temple-yushu-bg-13", "temple", "yushu", "2025-07-13T08:00", "2025-07-20T12:00", "情报后台发酵", "禹树", "warn", "情报入口已经被看见，但正文没有持续跟拍禹树行动。", "后台状态解释后续争夺为何仍有压力。", "虚段必须保留触发依据，不能当成正文事件。", "background"),
      characterEvent("ce-temple-lvyu-16", "temple", "lvyu", "2025-07-21T08:00", "2025-07-29T12:00", "接管阴影", "吕玉", "main", "群众争夺后出现更深层敌手。", "吕玉线准备接管。", "过早显形会削弱前台冲突。", "background"),
      characterEvent("ce-temple-yiren-11", "temple", "yiren", "2025-07-08T12:00", "2025-07-10T12:00", "观察救助逻辑", "叶依人", "main", "她看到救助和控制并存。", "采访线获得解释权冲突材料。", "不要写成单纯善恶判断。"),
      characterEvent("ce-media-yiren-13", "media", "yiren", "2025-07-13T08:00", "2025-07-15T12:00", "口径受压", "叶依人", "media", "电视台口径变化。", "她的采访空间被压缩。", "媒体线不能只做背景板。"),
      characterEvent("ce-media-zhang-15", "media", "zhang", "2025-07-18T08:00", "2025-07-20T12:00", "私线找镜头", "张航远", "risk", "他寻找绕开主采访的表达方式。", "诱导风险进入镜头压力。", "需要外部压力链承接。"),
      characterEvent("ce-proof-yiren-14", "proof", "yiren", "2025-07-15T12:00", "2025-07-20T12:00", "样本边界", "叶依人", "warn", "材料尚未闭合。", "她维持采访和证据边界。", "不能提前裁决职业病真相。"),
      characterEvent("ce-proof-linqian-14", "proof", "linqian", "2025-07-16T08:00", "2025-07-17T18:00", "数据校验", "林倩", "warn", "样本需要技术校验。", "证据线获得方法支撑。", "工具人化会削弱真实感。"),
      characterEvent("ce-zhang-zhang-15", "zhang", "zhang", "2025-07-13T08:00", "2025-07-20T12:00", "私线偏移", "张航远", "risk", "他把边缘化理解成失败。", "行动从补采访变成自我证明。", "缺少诱导链会突兀。"),
      characterEvent("ce-zhang-yushu-15", "zhang", "yushu", "2025-07-18T08:00", "2025-07-20T12:00", "成为诱导锚点", "禹树", "risk", "禹树的信息被张航远误读。", "同一人物在张航远线里变成诱导锚点。", "需要和采访线中的禹树区分语义。"),
      characterEvent("ce-lvyu-lvyu-17", "lvyu", "lvyu", "2025-07-24T08:00", "2025-07-29T12:00", "后段接管", "吕玉", "main", "前台冲突崩塌。", "吕玉开始承接后段主线。", "不能来得太突然。"),
      characterEvent("ce-frag-yushu-14", "fragment", "yushu", "2025-07-15T12:00", "2025-07-17T18:00", "资源碎片", "禹树", "warn", "碎片伏笔落入章节格。", "为后续资源争夺留入口。", "必须服务主轴，不可漂浮。")
    ];

    const world = {
      dayWidth: 96,
      labelWidth: 176,
      headerHeight: 104,
      trackHeight: 52,
      characterHeight: 26,
      chapterSlotWidth: 260,
      paddingTop: 0
    };

    const DEFAULT_VIEW_SCALE = 0.72;

    const state = {
      scale: DEFAULT_VIEW_SCALE,
      offsetX: 0,
      offsetY: 0,
      axisMode: "realTime",
      isWideMode: false,
      selected: null,
      detailMode: "summary",
      hover: null,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartOffset: 0,
      dragStartOffsetY: 0,
      moved: false
    };

    const MS_HOUR = 60 * 60 * 1000;
    const MS_DAY = 24 * MS_HOUR;
    const AXIS_MODE_REAL = "realTime";
    const AXIS_MODE_CHAPTER = "chapterEqual";
    const ZOOM_MIN = 0.45;
    const ZOOM_MAX = 7.5;
    const MIN_EVENT_BLOCK_WIDTH = 72;
    const timeline = {
      start: parseTime(timelineConfig.defaultStart),
      end: parseTime(timelineConfig.defaultEnd)
    };
    const storyCatalog = [];
    let persistedViewState = null;
    let defaultExpandedTrackIds = new Set();
    let activeStoryId = "";
    let storyDataSource = "内置演示投影数据";
    let storyDataError = "";

    const hitRegions = [];
    let rowLayout = [];
    const timelineGeometry = createTimelineGeometry({
      chapters,
      state,
      timeline,
      world,
      worldToScreenX,
      constants: {
        AXIS_MODE_CHAPTER,
        AXIS_MODE_REAL,
        MS_DAY,
        MS_HOUR
      }
    });
    const {
      activeAxis,
      axisChapterToScreenRange,
      axisGridLines,
      axisRangeToScreen,
      chapterRefsForRange,
      createAxisProjection,
      realTimeWorldWidth,
      timeToScreen,
      timeToWorld,
      totalWorldWidth
    } = timelineGeometry;
    const inspectorController = createInspectorController({
      chapterRefsForRange,
      chapters,
      characterById,
      document,
      events,
      formatFullRange,
      getStoryDataError: () => storyDataError,
      getStoryDataSource: () => storyDataSource,
      normalizeVisualState,
      parseTime,
      state,
      trackById,
      tracks,
      window
    });
    const {
      enterChapterDetail,
      enterEventDetail,
      hideDetails,
      updateInspectorChapter,
      updateInspectorCharacter,
      updateInspectorEmpty,
      updateInspectorEvent,
      updateInspectorTrack
    } = inspectorController;

    function legacyVisualState(tone, visibility = "explicit") {
      if (visibility === "background") return "background";
      if (tone === "warn" || tone === "risk" || tone === "key") return tone;
      return "normal";
    }

    function storyEvent(id, track, startAt, endAt, title, code, tone, input, output, risk) {
      return { id, kind: "story", track, startAt, endAt, title, code, visualState: legacyVisualState(tone), input, output, risk };
    }

    function characterEvent(id, track, character, startAt, endAt, title, code, tone, input, output, risk, visibility = "explicit") {
      return { id, kind: "character", track, character, startAt, endAt, title, code, visualState: legacyVisualState(tone, visibility), input, output, risk, visibility };
    }

    function applyStoryData(data) {
      if (!data || typeof data !== "object") throw new Error("基准时间轴投影数据集必须是对象。");
      const nextTimeline = data.timelineConfig || data.timeline || {};
      const nextChapters = data.chapters;
      const nextCharacters = data.characters;
      const nextTracks = data.tracks;
      const nextEvents = data.events;
      if (!Array.isArray(nextChapters)) throw new Error("基准时间轴投影数据集缺少 chapters 数组。");
      if (!nextCharacters || typeof nextCharacters !== "object") throw new Error("story.json 缺少 characters 对象。");
      if (!Array.isArray(nextTracks)) throw new Error("story.json 缺少 tracks 数组。");
      if (!Array.isArray(nextEvents)) throw new Error("story.json 缺少 events 数组。");

      Object.assign(timelineConfig, nextTimeline);
      chapters.splice(0, chapters.length, ...nextChapters);
      Object.keys(characters).forEach((key) => delete characters[key]);
      Object.assign(characters, nextCharacters);
      tracks.splice(0, tracks.length, ...nextTracks);
      events.splice(0, events.length, ...nextEvents);

      timeline.start = parseTime(timelineConfig.defaultStart);
      timeline.end = parseTime(timelineConfig.defaultEnd);
      document.getElementById("timelineStart").value = timelineConfig.defaultStart;
      document.getElementById("timelineEnd").value = timelineConfig.defaultEnd;
      defaultExpandedTrackIds = new Set(
        tracks
          .filter((track) => track.characters.length > 0 && track.expanded)
          .map((track) => track.id)
      );
    }

    function updateDataSourceState() {
      document.getElementById("data-source-state").textContent = `DATA ${storyDataSource}`;
    }

    function ensurePersistedViewState() {
      if (!persistedViewState) persistedViewState = loadPersistedStateFromStorage();
      return persistedViewState;
    }

    function getDatasetViewState(storyId = activeStoryId) {
      return readDatasetViewState(ensurePersistedViewState(), storyId);
    }

    function setDatasetViewState(storyId, viewState) {
      persistedViewState = savePersistedStateToStorage(
        writeDatasetViewState(ensurePersistedViewState(), storyId, viewState)
      );
    }

    function clearDatasetViewState(storyId = activeStoryId) {
      persistedViewState = savePersistedStateToStorage(
        removeDatasetViewState(ensurePersistedViewState(), storyId)
      );
    }

    function isValidAxisMode(mode) {
      return mode === AXIS_MODE_REAL || mode === AXIS_MODE_CHAPTER;
    }

    function setTimelineInputValues(startValue, endValue) {
      document.getElementById("timelineStart").value = startValue;
      document.getElementById("timelineEnd").value = endValue;
    }

    function updateWideModeButton() {
      const button = document.getElementById("wideMode");
      if (!button) return;
      button.classList.toggle("active", state.isWideMode);
      button.textContent = state.isWideMode ? "定宽" : "宽屏";
    }

    function applyWideModeClass() {
      document.querySelector(".frame").classList.toggle("wide-mode", state.isWideMode);
      updateWideModeButton();
    }

    function setWideMode(enabled) {
      if (state.isWideMode === Boolean(enabled)) return;
      state.isWideMode = Boolean(enabled);
      applyWideModeClass();
      resizeCanvas();
      document.getElementById("route-state").textContent = state.isWideMode ? "宽屏模式" : "定宽模式";
      persistCurrentDatasetState();
    }

    function captureCurrentDatasetState() {
      const selected = state.selected ? { ...state.selected } : null;
      return {
        version: VIEW_STATE_VERSION,
        axisMode: state.axisMode,
        timelineStart: document.getElementById("timelineStart").value,
        timelineEnd: document.getElementById("timelineEnd").value,
        scale: state.scale,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
        isWideMode: state.isWideMode,
        selected,
        expandedTrackIds: tracks
          .filter((track) => track.characters.length > 0 && track.expanded)
          .map((track) => track.id)
      };
    }

    function persistCurrentDatasetState() {
      if (!activeStoryId) return;
      setDatasetViewState(activeStoryId, captureCurrentDatasetState());
    }

    function applyTrackExpansion(expandedTrackIds) {
      const expanded = Array.isArray(expandedTrackIds)
        ? new Set(expandedTrackIds.map((id) => String(id)))
        : defaultExpandedTrackIds;
      tracks.forEach((track) => {
        if (track.characters.length > 0) track.expanded = expanded.has(track.id);
      });
    }

    function resolvePersistedSelection(selected) {
      if (!selected || typeof selected !== "object") return null;
      if (selected.type === "event" && events.some((item) => item.id === selected.id)) {
        return { type: "event", id: selected.id };
      }
      if (selected.type === "chapter" && chapters.some((item) => item.id === selected.id)) {
        return { type: "chapter", id: selected.id };
      }
      if (selected.type === "track" && trackById(selected.id)) {
        return { type: "track", id: selected.id };
      }
      if (selected.type === "character") {
        const [idTrack, idCharacter] = String(selected.id || "").split(":");
        const trackId = selected.track || idTrack;
        const characterId = selected.character || idCharacter;
        const track = trackById(trackId);
        if (track && track.characters.includes(characterId) && characterById(characterId)) {
          track.expanded = true;
          return {
            type: "character",
            id: `${trackId}:${characterId}`,
            track: trackId,
            character: characterId
          };
        }
      }
      return null;
    }

    function applyPersistedSelection(selected) {
      const region = resolvePersistedSelection(selected);
      if (!region) return false;
      selectRegion(region, { persist: false, restore: true });
      return true;
    }

    function applyDefaultDatasetViewState() {
      timeline.start = parseTime(timelineConfig.defaultStart);
      timeline.end = parseTime(timelineConfig.defaultEnd);
      setTimelineInputValues(timelineConfig.defaultStart, timelineConfig.defaultEnd);
      state.scale = DEFAULT_VIEW_SCALE;
      state.offsetX = 0;
      state.offsetY = 0;
      state.axisMode = AXIS_MODE_REAL;
      state.isWideMode = false;
      state.selected = null;
      state.detailMode = "summary";
      applyTrackExpansion(null);
      applyWideModeClass();
      hideDetails();
      updateInspectorEmpty();
      clampOffsets();
      resizeCanvas();
    }

    function applyDatasetViewState(viewState) {
      if (!viewState || typeof viewState !== "object") {
        applyDefaultDatasetViewState();
        return;
      }

      const startValue = typeof viewState.timelineStart === "string" ? viewState.timelineStart : timelineConfig.defaultStart;
      const endValue = typeof viewState.timelineEnd === "string" ? viewState.timelineEnd : timelineConfig.defaultEnd;
      const start = parseTime(startValue);
      const end = parseTime(endValue);
      if (Number.isFinite(start) && Number.isFinite(end) && end > start + MS_HOUR) {
        timeline.start = start;
        timeline.end = end;
        setTimelineInputValues(startValue, endValue);
      } else {
        timeline.start = parseTime(timelineConfig.defaultStart);
        timeline.end = parseTime(timelineConfig.defaultEnd);
        setTimelineInputValues(timelineConfig.defaultStart, timelineConfig.defaultEnd);
      }

      state.axisMode = isValidAxisMode(viewState.axisMode) ? viewState.axisMode : AXIS_MODE_REAL;
      state.scale = Number.isFinite(Number(viewState.scale))
        ? Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number(viewState.scale)))
        : DEFAULT_VIEW_SCALE;
      state.offsetX = Number.isFinite(Number(viewState.offsetX)) ? Number(viewState.offsetX) : 0;
      state.offsetY = Number.isFinite(Number(viewState.offsetY)) ? Number(viewState.offsetY) : 0;
      state.isWideMode = Boolean(viewState.isWideMode);
      state.selected = null;
      state.detailMode = "summary";
      applyTrackExpansion(viewState.expandedTrackIds);
      applyWideModeClass();
      hideDetails();
      updateInspectorEmpty();
      clampOffsets();
      resizeCanvas();
      applyPersistedSelection(viewState.selected);
    }

    function resetDatasetState() {
      clearDatasetViewState(activeStoryId);
      applyDefaultDatasetViewState();
      document.getElementById("route-state").textContent = "当前数据集状态已重置";
    }

    function renderStoryOptions() {
      const select = document.getElementById("storySelect");
      select.innerHTML = "";
      if (storyCatalog.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "内置演示数据";
        select.appendChild(option);
        select.disabled = true;
        return;
      }
      storyCatalog.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.label;
        select.appendChild(option);
      });
      select.disabled = false;
      select.value = activeStoryId;
    }

    async function loadStoryManifest() {
      const { manifest, list } = await loadStoryManifestCatalog();
      storyCatalog.splice(0, storyCatalog.length, ...list);
      persistedViewState = loadPersistedStateFromStorage();
      activeStoryId = persistedViewState.activeStoryId && list.some((item) => item.id === persistedViewState.activeStoryId)
        ? persistedViewState.activeStoryId
        : manifest.defaultStoryId && list.some((item) => item.id === manifest.defaultStoryId)
        ? manifest.defaultStoryId
        : list[0].id;
      renderStoryOptions();
    }

    function storyUrl(item) {
      return resolveStoryUrl(item);
    }

    async function applySelectedStory(storyId, options = {}) {
      const item = storyCatalog.find((story) => story.id === storyId);
      if (!item) throw new Error(`未找到基准时间轴投影数据集：${storyId}`);
      const data = await loadStoryProjection(item);
      applyStoryData(data);
      activeStoryId = item.id;
      storyDataSource = `${item.label}`;
      storyDataError = "";
      document.getElementById("storySelect").value = activeStoryId;
      updateDataSourceState();

      if (!options.keepView) {
        applyDatasetViewState(getDatasetViewState(activeStoryId));
        return;
      }
      clampOffsets();
      draw();
    }

    async function loadLegacyStoryData() {
      const { source, data } = await fetchLegacyStoryData();
      applyStoryData(data);
      storyDataSource = source;
      storyDataError = "";
    }

    async function loadStoryData() {
      try {
        await loadStoryManifest();
        await applySelectedStory(activeStoryId);
      } catch (error) {
        try {
          storyCatalog.splice(0, storyCatalog.length);
          activeStoryId = "";
          renderStoryOptions();
          await loadLegacyStoryData();
        } catch (legacyError) {
          storyDataSource = "内置演示投影数据";
          storyDataError = `${error.message}; fallback: ${legacyError.message}`;
        }
      }
      updateDataSourceState();
    }

    function resizeCanvas() {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      clampOffsets();
      draw();
    }

    function plotWidth() {
      return canvas.clientWidth - world.labelWidth;
    }

    function maxOffset() {
      const total = totalWorldWidth();
      return Math.max(0, total - plotWidth() / state.scale);
    }

    function clampOffset() {
      state.offsetX = Math.max(0, Math.min(maxOffset(), state.offsetX));
    }

    function bodyViewportHeight() {
      return Math.max(0, canvas.clientHeight - world.headerHeight);
    }

    function bodyContentHeight() {
      return tracks.reduce((total, track) => {
        const characterRows = track.expanded ? track.characters.length * world.characterHeight : 0;
        return total + world.trackHeight + characterRows;
      }, 0);
    }

    function maxOffsetY() {
      return Math.max(0, bodyContentHeight() - bodyViewportHeight());
    }

    function clampOffsetY() {
      state.offsetY = Math.max(0, Math.min(maxOffsetY(), state.offsetY));
    }

    function clampOffsets() {
      clampOffset();
      clampOffsetY();
    }

    function screenToWorldX(x) {
      return (x - world.labelWidth) / state.scale + state.offsetX;
    }

    function worldToScreenX(x) {
      return world.labelWidth + (x - state.offsetX) * state.scale;
    }

    function rowScreenY(y) {
      return y - state.offsetY;
    }

    function normalizeVisualState(item) {
      if (item.visualState) return item.visualState;
      if (item.visibility === "background") return "background";
      return legacyVisualState(item.tone);
    }

    function stateColor(visualState) {
      if (visualState === "warn") return colors.amber;
      if (visualState === "risk") return colors.red;
      if (visualState === "key") return colors.ink;
      if (visualState === "continuing") return colors.blue;
      return null;
    }

    function trackVisual(track) {
      return {
        fill: track?.soft || colors.tealSoft,
        stroke: track?.color || colors.teal
      };
    }

    function eventVisual(item) {
      const track = trackById(item.track);
      const visualState = normalizeVisualState(item);
      const character = item.kind === "character" ? characterById(item.character) : null;
      if (character) {
        return {
          fill: visualState === "background" ? "#fff" : character.soft,
          stroke: character.color,
          marker: stateColor(visualState),
          visualState
        };
      }
      const base = trackVisual(track);
      return {
        fill: base.fill,
        stroke: base.stroke,
        marker: stateColor(visualState),
        visualState
      };
    }

    function trackById(id) {
      return tracks.find((track) => track.id === id);
    }

    function eventById(id) {
      return events.find((eventItem) => eventItem.id === id);
    }

    function characterById(id) {
      return characters[id];
    }

    function buildRowLayout() {
      const rows = [];
      let y = world.headerHeight;
      tracks.forEach((track) => {
        rows.push({
          type: "track",
          id: track.id,
          trackId: track.id,
          y,
          height: world.trackHeight
        });
        y += world.trackHeight;
        if (track.expanded) {
          track.characters.forEach((characterId) => {
            rows.push({
              type: "character",
              id: `${track.id}:${characterId}`,
              trackId: track.id,
              characterId,
              y,
              height: world.characterHeight
            });
            y += world.characterHeight;
          });
        }
      });
      return rows;
    }

    function rowForEvent(item) {
      if (item.kind === "character") {
        return rowLayout.find((row) => row.type === "character" && row.trackId === item.track && row.characterId === item.character);
      }
      return rowLayout.find((row) => row.type === "track" && row.trackId === item.track);
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      hitRegions.length = 0;
      rowLayout = buildRowLayout();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      drawHeader(w);
      drawTracks(w, h);
      drawSelectedChapterColumn(w, h);
      drawEvents(w);
      updateStateLabels();
    }

    function drawHeader(w) {
      const axis = activeAxis();
      ctx.fillStyle = colors.panelSoft;
      ctx.fillRect(0, 0, w, world.headerHeight);
      ctx.fillStyle = "#f7f9f8";
      ctx.fillRect(world.labelWidth, 0, w - world.labelWidth, 48);
      ctx.fillStyle = "#fbfdfc";
      ctx.fillRect(world.labelWidth, 48, w - world.labelWidth, world.headerHeight - 48);
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, world.headerHeight);
      ctx.lineTo(w, world.headerHeight);
      ctx.stroke();

      ctx.fillStyle = "#eef3f1";
      ctx.fillRect(0, 0, world.labelWidth, 48);
      ctx.fillStyle = "#e4ece9";
      ctx.fillRect(0, 48, world.labelWidth, world.headerHeight - 48);
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, world.labelWidth, world.headerHeight);

      ctx.fillStyle = "#465552";
      ctx.font = "700 13px Microsoft YaHei UI";
      ctx.fillText(axis.mode === AXIS_MODE_CHAPTER ? "章节等宽轴" : "真实时间轴", 14, 25);
      ctx.fillStyle = "#71807c";
      ctx.font = "11px Microsoft YaHei UI";
      ctx.fillText(`${formatDateTime(timeline.start)}`, 14, 46);
      ctx.fillText(`${formatDateTime(timeline.end)}`, 14, 63);
      ctx.fillStyle = colors.ink;
      ctx.font = "800 12px Microsoft YaHei UI";
      ctx.fillText("章节覆盖层", 14, 89);

      ctx.save();
      ctx.beginPath();
      ctx.rect(world.labelWidth, 0, w - world.labelWidth, world.headerHeight);
      ctx.clip();

      if (axis.mode === AXIS_MODE_CHAPTER) {
        (axis.chapters || []).forEach((chapter) => {
          const range = axisChapterToScreenRange(chapter.id);
          if (!range) return;
          const x = range.x;
          const cw = range.width;
          if (x + cw < world.labelWidth - 80 || x > w + 80) return;
          ctx.strokeStyle = "#d8e2df";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 48);
          ctx.stroke();
          ctx.fillStyle = "#53625f";
          ctx.font = "700 12px Microsoft YaHei UI";
          clipText(`${formatMonthDay(chapter.startAt)}-${formatMonthDay(chapter.endAt)}`, x + 6, 20, Math.max(28, cw - 12));
          ctx.fillStyle = "#798884";
          ctx.font = "10px Microsoft YaHei UI";
          clipText(`${formatDateTime(chapter.startAt)} / ${formatDateTime(chapter.endAt)}`, x + 6, 39, Math.max(28, cw - 12));
        });
      } else {
        const weekStart = dayStart(timeline.start);
        for (let tick = weekStart; tick <= timeline.end + MS_DAY; tick += MS_DAY) {
          const x = worldToScreenX(axis.timeToWorld(tick));
          if (x < world.labelWidth - 80 || x > w + 80) continue;
          const date = new Date(tick);
          const day = date.getDay();
          ctx.strokeStyle = day === 1 ? "#cfd9d5" : "#e8eeee";
          ctx.lineWidth = day === 1 ? 1.1 : 1;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 48);
          ctx.stroke();
          if (day === 1 || date.getDate() === 1 || tick === weekStart) {
            const weekLabel = `${date.getMonth() + 1}月第${weekOfMonth(date)}周`;
            ctx.fillStyle = "#53625f";
            ctx.font = "700 12px Microsoft YaHei UI";
            ctx.fillText(weekLabel, x + 6, 20);
          }
          ctx.fillStyle = "#798884";
          ctx.font = "10px Microsoft YaHei UI";
          ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x + 6, 39);
        }
      }

      ctx.strokeStyle = "#b9c6c2";
      ctx.beginPath();
      ctx.moveTo(world.labelWidth, 48);
      ctx.lineTo(w, 48);
      ctx.stroke();

      chapters.forEach((chapter) => {
        const range = axisChapterToScreenRange(chapter.id);
        if (!range) return;
        const x = range.x;
        const cw = range.width;
        const visibleX = Math.max(x, world.labelWidth);
        const visibleRight = Math.min(x + cw, w);
        const visibleWidth = visibleRight - visibleX;
        if (visibleWidth <= 0) return;
        const selected = state.selected?.type === "chapter" && state.selected.id === chapter.id;
        ctx.fillStyle = selected ? colors.tealSoft : "#ffffff";
        ctx.fillRect(x, 52, cw, world.headerHeight - 56);
        ctx.strokeStyle = "#b8c8c4";
        ctx.strokeRect(x, 52, cw, world.headerHeight - 56);
        if (selected) {
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 2, 54, cw - 4, world.headerHeight - 60);
          ctx.lineWidth = 1;
        }
        ctx.fillStyle = colors.ink;
        ctx.font = "700 14px Microsoft YaHei UI";
        ctx.fillText(chapter.id, x + 8, 71);
        ctx.fillStyle = colors.muted;
        ctx.font = "11px Microsoft YaHei UI";
        clipText(chapter.title, x + 8, 91, Math.max(24, cw - 16));
        hitRegions.push({ type: "chapter", id: chapter.id, x: visibleX, y: 52, w: visibleWidth, h: world.headerHeight - 52 });
      });
      ctx.restore();
      ctx.lineWidth = 1;
    }

    function drawTracks(w, h) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, world.headerHeight, w, Math.max(0, h - world.headerHeight));
      ctx.clip();
      rowLayout.forEach((row, index) => {
        const selectedTrack = state.selected?.type === "track" && state.selected.id === row.trackId;
        const selectedCharacter = state.selected?.type === "character" && state.selected.id === row.id;
        const track = trackById(row.trackId);
        const character = row.type === "character" ? characterById(row.characterId) : null;
        const isTrack = row.type === "track";
        const y = rowScreenY(row.y);
        const rh = row.height;
        const visibleY = Math.max(y, world.headerHeight);
        const visibleBottom = Math.min(y + rh, h);
        const visibleH = visibleBottom - visibleY;
        if (visibleH <= 0) return;

        ctx.fillStyle = isTrack ? (index % 2 === 0 ? "#ffffff" : "#fcfdfc") : "#fbfdfc";
        ctx.fillRect(world.labelWidth, y, w - world.labelWidth, rh);
        ctx.fillStyle = isTrack ? (selectedTrack ? colors.tealSoft : "#f3f6f5") : (selectedCharacter ? character.soft : "#f8faf9");
        ctx.fillRect(0, y, world.labelWidth, rh);
        ctx.strokeStyle = isTrack ? colors.lineSoft : "#e5ece9";
        ctx.beginPath();
        ctx.moveTo(0, y + rh);
        ctx.lineTo(w, y + rh);
        ctx.stroke();
        ctx.strokeStyle = colors.line;
        ctx.beginPath();
        ctx.moveTo(world.labelWidth, y);
        ctx.lineTo(world.labelWidth, y + rh);
        ctx.stroke();

        if (isTrack) {
          const canExpand = track.characters.length > 0;
          ctx.fillStyle = colors.ink;
          ctx.font = "700 13px Microsoft YaHei UI";
          ctx.fillText(canExpand ? (track.expanded ? "▾" : "▸") : "•", 12, y + 31);
          ctx.fillText(track.name, 34, y + 31);
          if (canExpand) {
            ctx.fillStyle = colors.muted;
            ctx.font = "11px Microsoft YaHei UI";
            ctx.textAlign = "right";
            ctx.fillText(`${track.characters.length} 人`, world.labelWidth - 14, y + 31);
            ctx.textAlign = "left";
          }
          hitRegions.push({ type: "track", id: track.id, x: 0, y: visibleY, w: world.labelWidth, h: visibleH });
        } else {
          ctx.strokeStyle = character.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(28, y + 4);
          ctx.lineTo(28, y + rh - 4);
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.fillStyle = character.color;
          ctx.fillRect(38, y + 7, 7, 7);
          ctx.fillStyle = colors.ink;
          ctx.font = "700 11px Microsoft YaHei UI";
          ctx.fillText(character.name, 52, y + 14);
          hitRegions.push({ type: "character", id: row.id, track: row.trackId, character: row.characterId, x: 0, y: visibleY, w: world.labelWidth, h: visibleH });
        }
      });
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(world.labelWidth, world.headerHeight, w - world.labelWidth, h - world.headerHeight);
      ctx.clip();
      axisGridLines().forEach((line) => {
        const x = worldToScreenX(line.world);
        if (x < world.labelWidth - 10 || x > w + 10) return;
        ctx.strokeStyle = "#aebfba";
        ctx.lineWidth = 1.45;
        ctx.beginPath();
        ctx.moveTo(x, world.headerHeight);
        ctx.lineTo(x, h);
        ctx.stroke();
      });
      ctx.restore();
      ctx.lineWidth = 1;
    }

    function drawEvents(w) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(world.labelWidth, world.headerHeight, w - world.labelWidth, canvas.clientHeight - world.headerHeight);
      ctx.clip();

      events.forEach((item) => {
        const row = rowForEvent(item);
        if (!row) return;
        const isCharacter = item.kind === "character";
        const isBackground = isCharacter && item.visibility === "background";
        const character = isCharacter ? characterById(item.character) : null;
        const range = axisRangeToScreen(item.startAt, item.endAt);
        if (!range) return;
        const x = range.x;
        const height = isCharacter ? 20 : 38;
        const y = rowScreenY(row.y) + (isCharacter ? Math.round((row.height - height) / 2) : Math.max(4, (row.height - height) / 2));
        const width = range.width;
        const display = eventDisplayRect(x, width, w);
        if (!display) return;
        const hitY = Math.max(y - 3, world.headerHeight);
        const hitBottom = Math.min(y + height + 3, canvas.clientHeight);
        const hitHeight = hitBottom - hitY;
        if (hitHeight <= 0) return;
        const drawX = display.x;
        const drawWidth = display.width;
        const visual = eventVisual(item);
        const fill = visual.fill;
        const stroke = visual.stroke;
        const visualState = visual.visualState;
        const selected = state.selected?.type === "event" && state.selected.id === item.id;

        ctx.save();
        ctx.fillStyle = fill;
        if (isBackground) ctx.globalAlpha = 0.72;
        ctx.fillRect(drawX, y, drawWidth, height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = selected ? colors.ink : stroke;
        ctx.lineWidth = selected ? (isCharacter ? 3 : 4) : (isBackground ? 1.5 : 1);
        if (isBackground) ctx.setLineDash([7, 5]);
        ctx.strokeRect(drawX, y, drawWidth, height);
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        if (!isBackground) {
          if (!isCharacter && visualState === "warn") {
            ctx.fillStyle = visual.marker;
            ctx.fillRect(drawX, y, 7, height);
          } else if (!isCharacter && visualState === "risk") {
            ctx.fillStyle = visual.marker;
            ctx.fillRect(drawX, y + height - 5, drawWidth, 5);
          } else if (!isCharacter && visualState === "key") {
            ctx.strokeStyle = colors.ink;
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX + 3, y + 3, drawWidth - 6, height - 6);
          } else {
            ctx.fillStyle = stroke;
            ctx.fillRect(drawX, y + height - (isCharacter ? 3 : 4), drawWidth, isCharacter ? 3 : 4);
          }
        }
        if (!isCharacter && visual.marker && visualState !== "key" && drawWidth > 76) {
          const tag = visualState.toUpperCase();
          const tagWidth = visualState === "warn" ? 34 : 30;
          const tagX = drawX + drawWidth - tagWidth - 8;
          const tagY = y + 7;
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = visual.marker;
          ctx.lineWidth = 1;
          ctx.strokeRect(tagX, tagY, tagWidth, 14);
          ctx.fillStyle = visual.marker;
          ctx.font = "700 8px Consolas";
          ctx.fillText(tag, tagX + 4, tagY + 10);
        }

        ctx.fillStyle = colors.ink;
        ctx.font = isCharacter ? "700 9px Microsoft YaHei UI" : "700 12px Microsoft YaHei UI";
        if (isBackground) ctx.fillStyle = "#34413f";
        const label = isCharacter ? `${character.short} ${item.title}` : item.title;
        clipText(label, drawX + 8, y + (isCharacter ? 13 : 18), Math.max(20, drawWidth - 16));
        if (!isCharacter) {
          ctx.fillStyle = "#3c4b48";
          ctx.font = "10px Consolas";
          clipText(item.code, drawX + 10, y + 31, Math.max(20, drawWidth - 20));
        }
        ctx.restore();

        hitRegions.push({ type: "event", id: item.id, x: drawX, y: hitY, w: drawWidth, h: hitHeight });
      });

      ctx.restore();
    }

    function drawSelectedChapterColumn(w, h) {
      if (state.selected?.type !== "chapter") return;
      const chapter = chapters.find((item) => item.id === state.selected.id);
      if (!chapter) return;
      const range = axisChapterToScreenRange(chapter.id);
      if (!range) return;
      const x = range.x;
      const cw = range.width;
      if (x + cw < world.labelWidth || x > w) return;

      ctx.save();
      ctx.beginPath();
      ctx.rect(world.labelWidth, world.headerHeight, w - world.labelWidth, h - world.headerHeight);
      ctx.clip();
      ctx.fillStyle = colors.selectionFill;
      ctx.fillRect(x, world.headerHeight, cw, h - world.headerHeight);
      ctx.strokeStyle = colors.selectionBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, world.headerHeight + 1, Math.max(0, cw - 2), Math.max(0, h - world.headerHeight - 2));
      ctx.restore();
      ctx.lineWidth = 1;
    }

    function clipText(text, x, y, maxWidth) {
      let output = text;
      while (ctx.measureText(output).width > maxWidth && output.length > 1) {
        output = output.slice(0, -1);
      }
      if (output !== text && output.length > 1) output = output.slice(0, -1) + "...";
      ctx.fillText(output, x, y);
    }

    function clippedEventRect(x, width, viewportWidth) {
      const left = Math.max(x, world.labelWidth);
      const right = Math.min(x + width, viewportWidth);
      return { x: left, width: Math.max(0, right - left) };
    }

    function eventDisplayRect(x, width, viewportWidth) {
      const actualWidth = Math.max(0, width);
      const actualRight = x + actualWidth;
      if (actualRight < world.labelWidth || x > viewportWidth) return null;

      if (actualWidth >= MIN_EVENT_BLOCK_WIDTH) {
        const clipped = clippedEventRect(x, actualWidth, viewportWidth);
        return clipped.width > 0 ? clipped : null;
      }

      let displayRight = Math.min(actualRight, viewportWidth);
      let displayLeft = displayRight - MIN_EVENT_BLOCK_WIDTH;
      if (displayLeft < world.labelWidth) {
        displayLeft = world.labelWidth;
        displayRight = Math.min(viewportWidth, displayLeft + MIN_EVENT_BLOCK_WIDTH);
      }

      const displayWidth = displayRight - displayLeft;
      return displayWidth > 0 ? { x: displayLeft, width: displayWidth } : null;
    }

    function labelColumnHitTest(x, y) {
      if (x > world.labelWidth) return null;
      for (let i = hitRegions.length - 1; i >= 0; i -= 1) {
        const r = hitRegions[i];
        if (r.type !== "track" && r.type !== "character") continue;
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
      }
      return null;
    }

    function hitTest(x, y) {
      const labelHit = labelColumnHitTest(x, y);
      if (labelHit) return labelHit;
      for (let i = hitRegions.length - 1; i >= 0; i -= 1) {
        const r = hitRegions[i];
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
      }
      return null;
    }

    function selectRegion(region, options = {}) {
      state.detailMode = "summary";
      hideDetails();
      if (!region) {
        state.selected = null;
        updateInspectorEmpty();
        draw();
        if (options.persist !== false) persistCurrentDatasetState();
        return;
      }
      state.selected = region.type === "character"
        ? { type: region.type, id: region.id, track: region.track, character: region.character }
        : { type: region.type, id: region.id };
      if (region.type === "event") updateInspectorEvent(region.id);
      if (region.type === "chapter") updateInspectorChapter(region.id);
      if (region.type === "track") updateInspectorTrack(region.id, { toggle: !options.restore });
      if (region.type === "character") updateInspectorCharacter(region.track, region.character);
      clampOffsets();
      draw();
      if (options.persist !== false) persistCurrentDatasetState();
    }

    function selectedRouteLabel() {
      if (!state.selected) return "画布模式";
      if (state.selected.type === "event") return "事件已选中";
      if (state.selected.type === "chapter") return "章节已选中";
      if (state.selected.type === "track") return "故事线已选中";
      if (state.selected.type === "character") return "人物条已选中";
      return "画布模式";
    }

    function updateStateLabels() {
      const zoom = Math.round(state.scale * 100);
      document.getElementById("zoomLabel").textContent = `${zoom}%`;
      document.getElementById("zoomSlider").value = zoom;
      updateAxisModeButtons();
      updateWideModeButton();
    }

    function axisModeLabel() {
      return state.axisMode === AXIS_MODE_CHAPTER ? "章节等宽" : "真实时间";
    }

    function updateAxisModeButtons() {
      document.querySelectorAll("[data-axis-mode]").forEach((button) => {
        button.classList.toggle("active", button.dataset.axisMode === state.axisMode);
      });
    }

    function focusWorldRange(range) {
      if (!range) return false;
      const visibleWorldWidth = plotWidth() / state.scale;
      const rangeWidth = Math.max(1, range.endWorld - range.startWorld);
      const sidePadding = Math.max(12, (visibleWorldWidth - rangeWidth) / 2);
      state.offsetX = range.startWorld - sidePadding;
      return true;
    }

    function focusSelectedOnAxis() {
      const axis = activeAxis();
      if (!state.selected) return false;
      if (state.selected.type === "chapter") {
        return focusWorldRange(axis.chapterToWorldRange(state.selected.id));
      }
      if (state.selected.type === "event") {
        const item = eventById(state.selected.id);
        if (!item) return false;
        return focusWorldRange(axis.rangeToWorld(item.startAt, item.endAt));
      }
      return false;
    }

    function setAxisMode(mode) {
      if (mode !== AXIS_MODE_REAL && mode !== AXIS_MODE_CHAPTER) return;
      if (state.axisMode === mode) return;
      state.axisMode = mode;
      if (!focusSelectedOnAxis()) {
        state.offsetX = 0;
      }
      clampOffsets();
      updateAxisModeButtons();
      draw();
      document.getElementById("route-state").textContent = `轴模式：${axisModeLabel()}`;
      persistCurrentDatasetState();
    }

    function applyTimelineRange() {
      const startInput = document.getElementById("timelineStart");
      const endInput = document.getElementById("timelineEnd");
      const start = parseTime(startInput.value);
      const end = parseTime(endInput.value);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start + MS_HOUR) {
        document.getElementById("route-state").textContent = "时间范围无效";
        return;
      }
      timeline.start = start;
      timeline.end = end;
      state.offsetX = 0;
      state.selected = null;
      state.detailMode = "summary";
      hideDetails();
      clampOffsets();
      updateInspectorEmpty();
      draw();
      document.getElementById("route-state").textContent = "时间范围已应用";
      persistCurrentDatasetState();
    }

    function setScale(nextScale, anchorX = world.labelWidth + plotWidth() / 2) {
      const oldScale = state.scale;
      const worldAtAnchor = screenToWorldX(anchorX);
      state.scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nextScale));
      state.offsetX = worldAtAnchor - (anchorX - world.labelWidth) / state.scale;
      if (oldScale !== state.scale) clampOffsets();
      draw();
      persistCurrentDatasetState();
    }

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
      if (!nextStoryId || nextStoryId === activeStoryId) return;
      try {
        persistCurrentDatasetState();
        document.getElementById("route-state").textContent = "投影数据加载中";
        await applySelectedStory(nextStoryId);
        document.getElementById("route-state").textContent = "投影数据已切换";
      } catch (error) {
        storyDataError = error.message;
        document.getElementById("route-state").textContent = "投影数据读取失败";
        event.target.value = activeStoryId;
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
      state.scale = DEFAULT_VIEW_SCALE;
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

    function applyInitialRoute() {
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
        state.scale = ZOOM_MAX;
        state.offsetX = timeToWorld("2025-07-07T12:00");
        clampOffsets();
        updateStateLabels();
        draw();
      }
    }

    async function boot() {
      await loadStoryData();
      resizeCanvas();
      if (!state.selected) updateInspectorEmpty();
      applyInitialRoute();
    }

    boot();
