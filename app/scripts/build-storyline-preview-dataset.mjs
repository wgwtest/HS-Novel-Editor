import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(scriptDir, "..");
const definitionPath = join(sourceDir, "data", "storyline-definitions", "storylines-c1-c14-v0.1.json");
const storiesDir = join(sourceDir, "data", "stories");
const outputFile = "story-c1-c14-storylines-preview-v0.1.json";
const outputPath = join(storiesDir, outputFile);
const manifestPath = join(storiesDir, "index.json");

const chapterTimes = {
  C1: ["2025-07-05T09:30", "2025-07-07T12:20"],
  C2: ["2025-07-07T16:27", "2025-07-07T22:00"],
  C3: ["2025-07-08T07:30", "2025-07-08T13:30"],
  C4: ["2025-07-09T01:30", "2025-07-09T14:00"],
  C5: ["2025-07-09T15:27", "2025-07-10T01:00"],
  C6: ["2025-07-10T09:00", "2025-07-10T18:00"],
  C7: ["2025-07-10T19:00", "2025-07-11T02:00"],
  C8: ["2025-07-11T09:00", "2025-07-11T18:00"],
  C9: ["2025-07-11T19:30", "2025-07-12T23:30"],
  C10: ["2025-07-13T00:00", "2025-07-13T03:30"],
  C11: ["2025-07-13T10:00", "2025-07-13T16:30"],
  C12: ["2025-07-13T18:00", "2025-07-13T21:30"],
  C13: ["2025-07-13T21:30", "2025-07-14T01:00"],
  C14: ["2025-07-14T01:00", "2025-07-14T03:00"]
};

const characterCatalog = {
  ye_yiren: ["叶依人", "叶", "#087268", "#e0f0ed"],
  zhang_hangyuan: ["张航远", "张", "#b42b40", "#f3d7de"],
  lin_qian: ["林倩", "林", "#a66a10", "#f3e4c8"],
  monica: ["莫妮卡", "莫", "#315f83", "#dbe8f1"],
  yushu: ["禹树", "禹", "#6b4f86", "#e9e1f0"],
  yang_xinrui: ["杨心蕊", "杨", "#8a6f22", "#efe8cf"],
  lao_lin: ["老林", "林", "#6f7d79", "#e7ecea"],
  xiong_li: ["熊丽", "熊", "#536761", "#edf2f0"],
  zhou_qiheng: ["周启衡", "周", "#315f83", "#dbe8f1"],
  ma_sankui: ["马三魁", "马", "#6a4c93", "#e7e2ef"],
  lin_paner: ["林盼儿", "盼", "#7a4f68", "#eadfe5"],
  lao_wu: ["老吴", "吴", "#6f7d79", "#e7ecea"],
  lao_li_family: ["老李一家", "李", "#6f7d79", "#e7ecea"],
  patient_family_rep: ["病患家属代表", "病", "#6f7d79", "#e7ecea"],
  tv_authorizer: ["电视台相关授权者", "台", "#315f83", "#dbe8f1"],
  family_owner_rep: ["家主系代表", "主", "#7b1f1f", "#f1d7d7"],
  second_branch_media: ["二房传媒线", "二", "#7b1f1f", "#f1d7d7"],
  shen_yanqing: ["沈砚清", "沈", "#7b1f1f", "#f1d7d7"],
  steel_chair: ["钢铁主席", "钢", "#a66a10", "#f3e4c8"],
  vice_director: ["副局长", "局", "#a66a10", "#f3e4c8"],
  foundation_rep: ["基金会代表", "基", "#a66a10", "#f3e4c8"],
  real_estate_rep: ["地产代表", "地", "#a66a10", "#f3e4c8"],
  finance_rep: ["金融代表", "金", "#a66a10", "#f3e4c8"],
  energy_rep: ["能源代表", "能", "#a66a10", "#f3e4c8"],
  council_rep: ["议员代表", "议", "#a66a10", "#f3e4c8"]
};

const characterNameToId = new Map(Object.entries(characterCatalog).map(([id, [name]]) => [name, id]));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function toSoftColor(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const mix = (channel) => Math.round(channel * 0.18 + 255 * 0.82);
  return `#${[mix(r), mix(g), mix(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function trackSub(storyline) {
  if (storyline.id === "main") return "阶段块总览";
  if (storyline.coreAgents?.length) return storyline.coreAgents.slice(0, 3).join(" / ");
  return storyline.type;
}

function characterIdsForStoryline(storyline) {
  const names = [...(storyline.coreAgents || []), ...(storyline.childCharacterCandidates || [])];
  return names.map((name) => characterNameToId.get(name)).filter(Boolean);
}

function uniqueItems(items) {
  return [...new Set(items)];
}

function chapterRange(chapterId) {
  const range = chapterTimes[chapterId];
  if (!range) throw new Error(`缺少章节时间：${chapterId}`);
  return range;
}

function visualStateFor(storylineId, chapterId) {
  if (storylineId === "yang_clan_power" || storylineId === "city_charity_redevelopment") return "warn";
  if (storylineId === "daxian_control" && ["C9", "C10"].includes(chapterId)) return "risk";
  if (storylineId === "zhang_fall" && ["C10", "C11"].includes(chapterId)) return "risk";
  if (storylineId === "yiren_pov" && ["C13", "C14"].includes(chapterId)) return "key";
  if (storylineId === "tv_media_power") return "warn";
  return "normal";
}

const roleBriefRules = [
  ["定题配置采访人员", { 熊丽: "定题配置", 叶依人: "承接任务", 张航远: "被配置入组" }],
  ["厂门口采访被求助撕开", { 叶依人: "现场承接", 张航远: "跟拍入局" }],
  ["丢符求助露出控制入口", { 马三魁: "显露入口", 病患家属代表: "暴露困境" }],
  ["第一次撞见题材裂口", { 叶依人: "看见裂口", 张航远: "刺激判断" }],
  ["逼仄小屋确认真实困境", { 叶依人: "确认困境", 张航远: "直面贫病" }],
  ["熊丽吸收素材并压责", { 熊丽: "吸收压责", 叶依人: "承接压力", 张航远: "被纳入口径" }],
  ["受挫后出现代偿滑坡", { 张航远: "受挫代偿", 叶依人: "触发失衡" }],
  ["被迫承认采访对象不是素材", { 叶依人: "修正视角", 张航远: "制造刺点" }],
  ["私下回访触发暴起", { 叶依人: "私访承压", 张航远: "冒进救场" }],
  ["救人受伤换来正义错觉", { 张航远: "受伤自证", 叶依人: "被刺中判断" }],
  ["职业病判断刺中叶依人", { 叶依人: "被迫追问", 张航远: "抛出判断" }],
  ["禹树冷拆旧账风险", { 禹树: "冷拆旧账", 莫妮卡: "吸收风险", 叶依人: "听懂代价", 杨心蕊: "进入处置" }],
  ["从情绪冲击转向现实处置", { 叶依人: "转向处置", 禹树: "提供冷解", 莫妮卡: "接管现实" }],
  ["采访问题转成可核查事实", { 叶依人: "整理问题", 张航远: "保留冲动", 林倩: "准备核查" }],
  ["正式任务授权一周跟进", { 熊丽: "正式授权", 叶依人: "承接跟进", 张航远: "误读授权" }],
  ["林倩入组形成三角", { 叶依人: "接纳协作", 张航远: "争夺位置", 林倩: "入组归档" }],
  ["莫妮卡把外部采访纳入内圈", { 莫妮卡: "纳入内圈", 叶依人: "被拉入局", 林倩: "承担校验" }],
  ["把任务误读成正义授权", { 张航远: "误读授权", 叶依人: "成为参照", 熊丽: "放大错觉" }],
  ["十一户走访建立材料底盘", { 叶依人: "走访判断", 张航远: "抢占姿态", 林倩: "建立底盘" }],
  ["看见同情之外的工作量", { 叶依人: "看见工作量", 林倩: "显示方法", 张航远: "制造噪声" }],
  ["直觉判断暴露攀附心态", { 张航远: "暴露攀附", 叶依人: "感到偏移", 林倩: "旁观校正" }],
  ["老吴把线索串成组织节点", { 叶依人: "接收线索", 张航远: "盯住突破", 林倩: "串联记录", 老吴: "提供节点" }],
  ["大仙祠从传闻变成节点", { 马三魁: "成为节点", 林盼儿: "露出通道", 老吴: "指认入口" }],
  ["把线索当成个人突破口", { 张航远: "私占线索", 林盼儿: "打开缝隙", 叶依人: "失去同步" }],
  ["三页材料完成初步归档", { 叶依人: "形成材料", 张航远: "提供偏见", 林倩: "完成归档" }],
  ["汇报后口径被限制", { 熊丽: "限制口径", 叶依人: "被收边界", 张航远: "受限不满" }],
  ["上山建立风险清单", { 莫妮卡: "建立清单", 禹树: "校准风险", 叶依人: "被纳入网", 林倩: "补足数据" }],
  ["法会把苦难包装成庇护", { 马三魁: "包装苦难", 林盼儿: "维持场域", 叶依人: "现场观察" }],
  ["三人进入法会但判断分裂", { 叶依人: "保留判断", 张航远: "急于定性", 林倩: "记录分歧" }],
  ["看见真实苦难被二次利用", { 叶依人: "看见利用", 马三魁: "借真成势", 林盼儿: "连接苦难" }],
  ["法会后三人正式分流", { 叶依人: "分流判断", 张航远: "转入私线", 林倩: "维持记录" }],
  ["控制不是全假而是借真成势", { 马三魁: "借真成势", 叶依人: "重估控制", 莫妮卡: "重估风险" }],
  ["林盼儿打开私人空间", { 张航远: "被打开", 林盼儿: "诱入私域" }],
  ["莫妮卡重估马三魁风险", { 莫妮卡: "重估风险", 叶依人: "提供观察", 禹树: "补足判断" }],
  ["从揭假转向理解控制逻辑", { 叶依人: "理解控制", 莫妮卡: "吸收复盘", 林盼儿: "暴露逻辑" }],
  ["理解她们进不去的门槛", { 叶依人: "理解门槛", 林盼儿: "指向门槛", 老李一家: "承载代价" }],
  ["老李一家暴露控制后果", { 林盼儿: "带出后果", 老李一家: "暴露代价", 马三魁: "占据替代" }],
  ["莫妮卡推动进入上层场域", { 莫妮卡: "推入上层", 叶依人: "接受入场" }],
  ["慈善晚宴门槛浮出", { 叶依人: "准备入场", 钢铁主席: "掌握入口", 基金会代表: "提供入口" }],
  ["救助被转译成执行路径", { 叶依人: "转译救助", 钢铁主席: "打开路径", 基金会代表: "承接路径" }],
  ["学会把求助包装成议题", { 叶依人: "包装议题", 莫妮卡: "校正表达", 钢铁主席: "回应议题" }],
  ["近身圈协助搭出路径", { 莫妮卡: "搭出路径", 叶依人: "进入执行", 林倩: "补足依据" }],
  ["楼上内场绑定裁决票", { 家主系代表: "守住权力", 二房传媒线: "争夺口径", 沈砚清: "参与交锋", 叶依人: "被迫入局" }],
  ["旧社区改造进入五比五", { 钢铁主席: "抛出五比五", 基金会代表: "绑定资金", 副局长: "进入裁决", 叶依人: "承接风险" }],
  ["被迫接住五比五风险", { 叶依人: "接住风险", 莫妮卡: "压住局面", 钢铁主席: "转嫁压力" }],
  ["接招并提出暂缓条件", { 叶依人: "提出条件", 莫妮卡: "保护收束" }],
  ["各方被迫承认阶段条件", { 叶依人: "逼出承认", 家主系代表: "被迫让步", 二房传媒线: "收缩攻势", 沈砚清: "接受局面" }],
  ["暂缓改造换救助先行", { 叶依人: "按下暂缓", 钢铁主席: "承接输出", 基金会代表: "落实救助" }],
  ["莫妮卡截断后续羞辱", { 莫妮卡: "截断羞辱", 叶依人: "被吸收保护" }]
];

const roleBriefByTitle = new Map(roleBriefRules);

const storylineFallbackBrief = {
  tv_media_power: "承接口径",
  investigation_team: "参与核查",
  yiren_pov: "视角变化",
  yang_inner_circle: "内部处置",
  zhang_fall: "发生偏移",
  daxian_control: "卷入控制",
  city_charity_redevelopment: "进入资源场",
  yang_clan_power: "参与交锋"
};

const roleBriefMinLength = 5;
const roleBriefMaxLength = 15;

const storylineContext = {
  tv_media_power: "电视台口径",
  investigation_team: "采访组三人",
  yiren_pov: "主视角判断",
  yang_inner_circle: "杨家内部",
  zhang_fall: "张航远偏移",
  daxian_control: "大仙祠控制",
  city_charity_redevelopment: "慈善资源场",
  yang_clan_power: "杨氏家族场"
};

const beatContextRules = [
  [/求助|厂门口|小屋|困境/, "求助现场"],
  [/采访|回访|走访|任务|专题/, "采访任务"],
  [/符|法会|大仙祠|马三魁/, "大仙祠入口"],
  [/题材|裂口|真实|苦难/, "现实裂口"],
  [/材料|归档|核查|清单|数据|线索/, "材料核查"],
  [/电视台|口径|授权|熊丽|汇报/, "电视台口径"],
  [/莫妮卡|禹树|杨心蕊|内圈|家庭|旧账/, "杨家内部"],
  [/张航远|正义|误读|受伤|私线|私域/, "张航远偏移"],
  [/慈善|救助|基金|议题|旧社区|改造|五比五/, "慈善资源场"],
  [/楼上|裁决|上层|各方|家主|二房|沈砚清/, "杨氏家族场"]
];

function roleBriefContextFor(beat) {
  const rule = beatContextRules.find(([pattern]) => pattern.test(beat.title));
  return rule?.[1] || storylineContext[beat.storyline] || "关系变化";
}

function combineRoleBriefContext(brief, context) {
  if (context === "现实裂口" && brief.includes("裂口")) return brief.replace("裂口", "现实裂口");
  if (context === "采访任务" && brief.includes("任务")) return brief.replace("任务", "采访任务");
  if (context === "求助现场" && brief.startsWith("现场")) return `${brief.replace("现场", "")}${context}`;
  if (context === "求助现场" && brief.includes("现场")) return brief.replace("现场", "求助现场");
  if (context === "电视台口径" && brief.includes("口径")) return brief.replace("口径", "电视台口径");
  if (context === "材料核查" && brief.includes("核查")) return brief.replace("核查", "材料核查");
  if (context === "杨家内部" && brief.includes("内部")) return brief.replace("内部", "杨家内部");
  if (context === "慈善资源场" && brief.includes("慈善")) return brief.replace("慈善", "慈善资源");
  return `${brief}${context}`;
}

function normalizeRoleBrief(brief, beat) {
  const trimmed = brief.trim();
  const length = [...trimmed].length;
  if (length >= roleBriefMinLength && length <= roleBriefMaxLength) return trimmed;

  const context = roleBriefContextFor(beat);
  let candidate = trimmed.includes(context) ? trimmed : combineRoleBriefContext(trimmed, context);
  if ([...candidate].length < roleBriefMinLength) candidate = `${candidate}变化`;
  return [...candidate].slice(0, roleBriefMaxLength).join("");
}

function roleBriefFor(beat, participantName) {
  const byParticipant = roleBriefByTitle.get(beat.title);
  const brief = byParticipant?.[participantName] || storylineFallbackBrief[beat.storyline] || "参与变化";
  return normalizeRoleBrief(brief, beat);
}

function relationChangeFor(brief, participantName, storyline) {
  if (brief.includes("压责") || brief.includes("限制") || brief.includes("授权")) {
    return `${participantName}强化了“${storyline.name}”中的权力约束。`;
  }
  if (brief.includes("误读") || brief.includes("偏移") || brief.includes("私")) {
    return `${participantName}让关系从协作滑向分流或失衡。`;
  }
  if (brief.includes("归档") || brief.includes("核查") || brief.includes("记录") || brief.includes("数据")) {
    return `${participantName}把现场信息转成可追踪依据。`;
  }
  if (brief.includes("保护") || brief.includes("截断") || brief.includes("收束")) {
    return `${participantName}收束冲突，改变后续承压方式。`;
  }
  if (brief.includes("风险") || brief.includes("旧账") || brief.includes("判断")) {
    return `${participantName}改变了当前关系场的判断依据。`;
  }
  return `${participantName}改变了“${storyline.name}”在本章的关系位置。`;
}

function actionFor(brief, participantName, beat) {
  return `${participantName}在“${beat.title}”中${brief}，对应章内事实：${beat.summary}`;
}

function inspectorSummaryFor(brief, participantName, storyline, beat) {
  return `${participantName}的本章作用是“${brief}”，用于说明其在“${storyline.name}”里的具体参与方式。`;
}

const definition = readJson(definitionPath);
const storylinesById = new Map(definition.storylines.map((item) => [item.id, item]));
const domainsById = new Map(definition.domains.map((item) => [item.id, item]));
const chapterBeatsByKey = new Map((definition.chapterBeats || []).map((item) => [`${item.chapter}:${item.storyline}`, item]));

const characters = Object.fromEntries(
  Object.entries(characterCatalog).map(([id, [name, short, color, soft]]) => [
    id,
    { name, short, color, soft }
  ])
);

const tracks = definition.storylines
  .filter((storyline) => storyline.visibleAsTrack)
  .map((storyline) => ({
    id: storyline.id,
    name: storyline.name,
    sub: trackSub(storyline),
    expanded: false,
    characters: uniqueItems(characterIdsForStoryline(storyline)),
    color: storyline.baseColor,
    soft: toSoftColor(storyline.baseColor)
  }));
const tracksById = new Map(tracks.map((track) => [track.id, track]));

const chapters = definition.chapterStorylineMatrix.map((chapter) => {
  const [startAt, endAt] = chapterRange(chapter.chapter);
  const storylineNames = chapter.primaryStorylines.map((id) => storylinesById.get(id)?.name || id);
  const domainNames = chapter.domains.map((id) => domainsById.get(id)?.name || id);
  return {
    id: chapter.chapter,
    title: chapter.title,
    startAt,
    endAt,
    input: `本章进入的顶层故事线：${storylineNames.join(" / ")}。`,
    inside: chapter.summary,
    output: domainNames.length > 0 ? `关联对象域：${domainNames.join(" / ")}。` : "无额外对象域。"
  };
});

const events = [];

for (const phase of definition.completedChapters.phaseBlocks) {
  const [startAt] = chapterRange(phase.chapters[0]);
  const [, endAt] = chapterRange(phase.chapters[phase.chapters.length - 1]);
  events.push({
    id: `PHASE-${phase.id}`,
    kind: "story",
    track: "main",
    startAt,
    endAt,
    title: phase.name,
    code: `${phase.id} / ${phase.chapters.join("-")}`,
    visualState: "key",
    input: "这是故事主轴的阶段块，不替代具体故事线事件。",
    output: phase.summary,
    risk: definition.principles.mainAxisMode.definition
  });
}

for (const chapter of definition.chapterStorylineMatrix) {
  const [startAt, endAt] = chapterRange(chapter.chapter);
  const domainNames = chapter.domains.map((id) => domainsById.get(id)?.name || id);
  for (const storylineId of chapter.primaryStorylines) {
    const storyline = storylinesById.get(storylineId);
    if (!storyline) throw new Error(`章节 ${chapter.chapter} 引用了不存在的故事线：${storylineId}`);
    const beat = chapterBeatsByKey.get(`${chapter.chapter}:${storylineId}`);
    if (!beat) throw new Error(`章节 ${chapter.chapter} 的故事线 ${storylineId} 缺少 chapterBeat。`);
    const visualState = visualStateFor(storylineId, chapter.chapter);
    events.push({
      id: `MAP-${chapter.chapter}-${storylineId}`,
      kind: "story",
      track: storylineId,
      startAt,
      endAt,
      title: beat.title,
      code: `${chapter.chapter} / ${storylineId}`,
      visualState,
      input: beat.summary,
      output: `本章把事件归入：${storyline.name}${domainNames.length ? `；对象域：${domainNames.join(" / ")}` : ""}。`,
      risk: storyline.definition
    });
    const track = tracksById.get(storylineId);
    const trackCharacters = new Set(track?.characters || []);
    for (const participantName of beat.participants || []) {
      const characterId = characterNameToId.get(participantName);
      if (!characterId || !trackCharacters.has(characterId)) continue;
      const roleBrief = roleBriefFor(beat, participantName);
      const action = actionFor(roleBrief, participantName, beat);
      const relationChange = relationChangeFor(roleBrief, participantName, storyline);
      const inspectorSummary = inspectorSummaryFor(roleBrief, participantName, storyline, beat);
      events.push({
        id: `CHAR-${chapter.chapter}-${storylineId}-${characterId}`,
        kind: "character",
        track: storylineId,
        character: characterId,
        participantName,
        startAt,
        endAt,
        title: roleBrief,
        roleBrief,
        code: `${chapter.chapter} / ${characterId}`,
        visualState,
        action,
        relationChange,
        inspectorSummary,
        input: action,
        output: relationChange,
        risk: inspectorSummary,
        visibility: "explicit"
      });
    }
  }
}

const runtimeStory = {
  meta: {
    name: "C1-C14 故事线分类预览 v0.1",
    version: "0.1.0",
    datasetType: "narrativeTimelineProjection",
    projectionTarget: "baselineTimeline",
    modelVersion: "timeline-projection-v1",
    source: "由 data/storyline-definitions/storylines-c1-c14-v0.1.json 转写生成的基准时间轴投影数据集，用于验证故事线分类。",
    updatedAt: "2026-06-28"
  },
  timelineConfig: {
    defaultStart: "2025-07-05T09:00",
    defaultEnd: "2025-07-14T04:00"
  },
  chapters,
  characters,
  tracks,
  events
};

writeFileSync(outputPath, `${JSON.stringify(runtimeStory, null, 2)}\n`, "utf8");

const manifest = readJson(manifestPath);
const previewEntry = {
  id: "c1-c14-storyline-preview-v0-1",
  label: "C1-C14 故事线分类预览 v0.1",
  file: outputFile,
  description: "由故事线定义转写的基准时间轴投影数据集，用于验证顶层故事线、章节归属和对象域降级。"
};
const existingIndex = manifest.stories.findIndex((item) => item.id === previewEntry.id);
if (existingIndex >= 0) {
  manifest.stories[existingIndex] = previewEntry;
} else {
  manifest.stories.push(previewEntry);
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Generated ${outputFile}`);
