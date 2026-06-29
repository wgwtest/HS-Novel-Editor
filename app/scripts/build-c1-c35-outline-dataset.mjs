import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(scriptDir, "..");
const definitionDir = join(appDir, "public", "data", "storyline-definitions");
const storiesDir = join(appDir, "public", "data", "stories");

const baseDefinitionPath = join(definitionDir, "storylines-c1-c14-v0.1.json");
const baseProjectionPath = join(storiesDir, "story-c1-c14-storylines-preview-v0.1.json");
const outputDefinitionFile = "storylines-c1-c35-outline-v0.1.json";
const outputStoryFile = "story-c1-c35-outline-preview-v0.1.json";
const outputDefinitionPath = join(definitionDir, outputDefinitionFile);
const outputStoryPath = join(storiesDir, outputStoryFile);
const manifestPath = join(storiesDir, "index.json");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function toSoftColor(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const mix = (channel) => Math.round(channel * 0.18 + 255 * 0.82);
  return `#${[mix(r), mix(g), mix(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

const baseDefinition = readJson(baseDefinitionPath);
const baseProjection = readJson(baseProjectionPath);

const newCharacters = {
  kaili: { name: "凯里", short: "凯", color: "#315f83", soft: "#dbe8f1" },
  chemical_girl: { name: "家主派化学小姑娘", short: "化", color: "#2f7c85", soft: "#d9ecee" },
  volunteer_group: { name: "志愿者队伍", short: "志", color: "#58725f", soft: "#e2e9e4" },
  medical_social_worker: { name: "医疗社工", short: "医", color: "#58725f", soft: "#e2e9e4" },
  old_worker_group: { name: "老工人群体", short: "工", color: "#6f7d79", soft: "#e7ecea" },
  elder_believers: { name: "老人信众", short: "信", color: "#6f7d79", soft: "#e7ecea" },
  lvyu: { name: "吕玉", short: "吕", color: "#1f5a53", soft: "#d5e6e4" },
  old_wu_wife: { name: "老吴老婆", short: "吴", color: "#6f7d79", soft: "#e7ecea" },
  yang_family_main: { name: "杨家主系", short: "主", color: "#7b1f1f", soft: "#f1d7d7" }
};

const characters = {
  ...baseProjection.characters,
  ...newCharacters
};

const characterNameToId = new Map(Object.entries(characters).map(([id, character]) => [character.name, id]));

const storylineUpdates = {
  main: {
    chapterSpan: ["C1", "C35"],
    currentStage: "第二卷从采访裂口推进到吕玉吸灵网络被击溃，并打开城市资源争夺战下一阶段。"
  },
  yiren_pov: {
    chapterSpan: ["C1", "C35"],
    currentStage: "叶依人从同情和发声进入公共危机处置、敌境自救和小卷收束。"
  },
  investigation_team: {
    chapterSpan: ["C1", "C32"],
    currentStage: "采访组三人关系从协作走向分裂，林倩最终通过证据工作部分回归。"
  },
  tv_media_power: {
    chapterSpan: ["C1", "C35"],
    currentStage: "电视台从专题启动、口径吸收到舆论剪辑和后续清算。",
    childCharacterCandidates: ["熊丽", "叶依人", "张航远", "林倩", "周启衡", "凯里", "电视台相关授权者", "二房传媒线"]
  },
  yang_inner_circle: {
    chapterSpan: ["C4", "C30"],
    currentStage: "杨家近身处置线从稳定内场到接入吕玉节点拆解。",
    childCharacterCandidates: ["莫妮卡", "叶依人", "林倩", "杨心蕊", "老林", "禹树", "家主派化学小姑娘", "杨家主系"]
  },
  yang_clan_power: {
    chapterSpan: ["C13", "C35"],
    currentStage: "家族权力交锋从楼上内场投票推进到供奉协议和资源战后续入口。",
    childCharacterCandidates: ["杨家主系", "莫妮卡", "叶依人", "吕玉", "周启衡", "二房传媒线", "沈砚清", "钢铁主席"]
  },
  daxian_control: {
    chapterSpan: ["C1", "C28"],
    currentStage: "大仙祠前台控制从苦难包装推进到闭门护法、敌境陷阱和前台崩塌。",
    childCharacterCandidates: ["马三魁", "林盼儿", "老吴", "老吴老婆", "老李一家", "病患家属代表", "老人信众", "张航远", "叶依人"]
  },
  zhang_fall: {
    chapterSpan: ["C2", "C35"],
    currentStage: "张航远从边缘化、被捕获、实际背叛到正义包装彻底破裂。",
    childCharacterCandidates: ["张航远", "林盼儿", "叶依人", "林倩", "凯里"]
  },
  city_charity_redevelopment: {
    chapterSpan: ["C12", "C35"],
    currentStage: "城市资源与慈善旧改从救助承诺落地到公共危机、供奉协议和下一阶段资源战。",
    childCharacterCandidates: ["钢铁主席", "副局长", "基金会代表", "地产代表", "金融代表", "能源代表", "议员代表", "叶依人", "志愿者队伍", "医疗社工", "老工人群体"]
  }
};

const storylines = baseDefinition.storylines.map((storyline) => ({
  ...storyline,
  ...(storylineUpdates[storyline.id] || {})
}));

storylines.push(
  {
    id: "chemistry_evidence_collaboration",
    name: "林倩与化学证据协作线",
    type: "evidence_collaboration_storyline",
    isTopLevel: true,
    visibleAsTrack: true,
    definition: "林倩、家主派化学小姑娘和禹树如何把职业病疑云、符纸、符水、香灰、药瓶和五味体系转成可检测、可复核的材料链。",
    coreAgents: ["林倩", "家主派化学小姑娘", "禹树"],
    coreRelations: ["林倩-化学小姑娘", "林倩-禹树", "样品链-数据表"],
    chapterSpan: ["C17", "C34"],
    startsFrom: "志愿者进场后，化学小姑娘建立取样规范并与林倩形成工作默契。",
    currentStage: "证据协作线把职业病疑云、五味符纸和吕玉节点拆解合并到同一条破局链。",
    baseColor: "#2f7c85",
    childCharacterCandidates: ["林倩", "家主派化学小姑娘", "禹树", "叶依人", "志愿者队伍", "病患家属代表", "吕玉"]
  },
  {
    id: "lvyu_hidden_network",
    name: "吕玉吸灵网络线",
    type: "hidden_cultivator_network_storyline",
    isTopLevel: true,
    visibleAsTrack: true,
    definition: "吕玉如何从大仙祠前台失败后进入前台，并被禹树用现实证据、数据分类和低耗法术拆解其吸灵网络。",
    coreAgents: ["吕玉", "禹树", "叶依人", "林盼儿"],
    coreRelations: ["吕玉-大仙祠前台", "吕玉-杨家供奉协议", "禹树-吕玉节点拆解"],
    chapterSpan: ["C25", "C35"],
    startsFrom: "叶依人深入敌境时的现实反制与禹树背后拆解吕玉节点重合。",
    currentStage: "吕玉吸灵网络被正面击溃，小卷进入清算和下一阶段入口。",
    baseColor: "#1f5a53",
    childCharacterCandidates: ["吕玉", "禹树", "叶依人", "林盼儿", "老吴老婆", "杨家主系", "马三魁", "林倩", "家主派化学小姑娘"]
  }
);

const domains = [
  ...baseDefinition.domains,
  {
    id: "volunteer_relief_system",
    name: "志愿者 / 互助协会 / 医疗筛查",
    type: "relief_execution_domain",
    isTopLevelStoryline: false,
    reasonNotStoryline: "救助系统是资源执行机制，不是稳定行动主体；其效果应归入城市资源与慈善旧改线、叶依人主视角成长线和证据协作线。",
    useAs: ["event.domain", "resource_mechanism", "inspector.tag"],
    relatedStorylines: ["city_charity_redevelopment", "yiren_pov", "chemistry_evidence_collaboration"]
  },
  {
    id: "public_opinion_versions",
    name: "舆论剪辑版本",
    type: "media_output_domain",
    isTopLevelStoryline: false,
    reasonNotStoryline: "视频版本是电视台和二房传媒线的产物，本身不构成独立故事线。",
    useAs: ["event.objects", "inspector.tag"],
    relatedStorylines: ["tv_media_power", "yang_clan_power"]
  },
  {
    id: "chemical_sample_chain",
    name: "化学样品链",
    type: "evidence_domain",
    isTopLevelStoryline: false,
    reasonNotStoryline: "样品链是林倩与化学小姑娘协作线中的材料对象，不是行动主体。",
    useAs: ["event.objects", "evidence_panel", "filter_tag"],
    relatedStorylines: ["chemistry_evidence_collaboration", "lvyu_hidden_network"]
  },
  {
    id: "enemy_space",
    name: "大仙祠后殿 / 旧厂暗处 / 供奉空间",
    type: "danger_space_domain",
    isTopLevelStoryline: false,
    reasonNotStoryline: "敌境空间承载张航远背叛、叶依人自救和吕玉节点显形，但不是主动关系线。",
    useAs: ["event.location", "danger_context", "inspector.tag"],
    relatedStorylines: ["daxian_control", "zhang_fall", "lvyu_hidden_network"]
  },
  {
    id: "lvyu_absorption_network",
    name: "吕玉吸灵网络",
    type: "hidden_mechanism_domain",
    isTopLevelStoryline: false,
    reasonNotStoryline: "吸灵网络是吕玉线的控制机制和最终战场对象，不单独脱离人物关系成为故事线。",
    useAs: ["event.objects", "mechanism_panel", "filter_tag"],
    relatedStorylines: ["lvyu_hidden_network", "chemistry_evidence_collaboration"]
  },
  {
    id: "yang_supply_contract",
    name: "杨家旧供奉协议",
    type: "power_contract_domain",
    isTopLevelStoryline: false,
    reasonNotStoryline: "供奉协议是吕玉压向杨家和城市资源战衔接的契约对象，归属杨氏家族权力交锋线与吕玉线。",
    useAs: ["event.objects", "power_mechanism", "chapter_output"],
    relatedStorylines: ["yang_clan_power", "lvyu_hidden_network"]
  },
  {
    id: "city_resource_war",
    name: "城市资源争夺战入口",
    type: "next_arc_domain",
    isTopLevelStoryline: false,
    reasonNotStoryline: "这是下一阶段入口，不应提前作为当前小卷的完整故事线。",
    useAs: ["chapter_output", "next_arc_marker"],
    relatedStorylines: ["city_charity_redevelopment", "yang_clan_power"]
  }
];

function chapter(id, title, startAt, endAt, primaryStorylines, domainsForChapter, summary, sourceStatus, sourceRef) {
  return {
    chapter: id,
    title,
    startAt,
    endAt,
    primaryStorylines,
    domains: domainsForChapter,
    summary,
    sourceStatus,
    sourceRef
  };
}

const outlineChapters = [
  chapter("C15", "会议定调之后", "2025-07-14T07:00", "2025-07-14T18:00", ["yang_clan_power", "tv_media_power", "city_charity_redevelopment", "yiren_pov", "yang_inner_circle", "zhang_fall"], ["adjudication_vote", "special_fund", "volunteer_relief_system"], "楼上内场结论被转化为高层定调，电视台改做民生专区，救助筛查进入筹备期，叶依人被吸收入监督配置，张航远第一次清楚感到自己远离事件中心。", "planned_outline", "致命采访-分章大纲.txt:第十五章；致命采访-事件脉络.md:E029-E035"),
  chapter("C16", "缓冲期的假性好转", "2025-07-14T18:00", "2025-07-17T18:00", ["investigation_team", "yiren_pov", "daxian_control", "zhang_fall"], ["old_factory_patients", "volunteer_relief_system", "talisman_system"], "三天缓冲期里后台筹备、前台继续走访，叶依人看见群众复杂性，林盼儿开始双线诱导，张航远误以为自己仍掌握调查节奏。", "planned_outline", "致命采访-分章大纲.txt:第十六章；致命采访-事件脉络.md:E031-E035"),
  chapter("C17", "热闹进场", "2025-07-18T08:00", "2025-07-18T20:00", ["city_charity_redevelopment", "chemistry_evidence_collaboration", "yang_inner_circle", "yiren_pov"], ["volunteer_relief_system", "chemical_sample_chain", "old_factory_patients"], "志愿者、基金、医疗筛查和电视台大规模进入旧社区，善意秩序机器照进现场，禹树低调入镜，化学小姑娘与林倩建立取样协作。", "planned_outline", "致命采访-分章大纲.txt:第十七章；致命采访-事件脉络.md:E036-E038"),
  chapter("C18", "职业病线收束", "2025-07-19T08:00", "2025-07-19T22:00", ["chemistry_evidence_collaboration", "investigation_team", "daxian_control"], ["occupational_disease_evidence", "chemical_sample_chain", "talisman_system"], "林倩和化学小姑娘把病患按车间、工种、症状、样品和符水残留拆开登记，撬动群众第一次具体质疑马三魁的共同苦难叙事。", "planned_outline", "致命采访-分章大纲.txt:第十八章；致命采访-事件脉络.md:E039"),
  chapter("C19", "重新收拢", "2025-07-20T08:00", "2025-07-20T23:00", ["daxian_control", "zhang_fall", "yiren_pov"], ["talisman_system", "old_factory_patients"], "马三魁以闭门护法和集体忏悔重新收拢群众，五味符纸体系正式露出，张航远把事实拆解误读成冷酷管理并开始实际站错边。", "planned_outline", "致命采访-分章大纲.txt:第十九章；致命采访-事件脉络.md:E040-E041"),
  chapter("C20", "镜头下的流血冲突", "2025-07-21T08:00", "2025-07-21T22:00", ["daxian_control", "city_charity_redevelopment", "tv_media_power", "zhang_fall", "yiren_pov"], ["volunteer_relief_system", "public_opinion_versions", "old_factory_patients"], "志愿者清理和马三魁闭门护法正面相撞，冲突在镜头下流血，张航远起到坏作用，叶依人用公共危机处置能力压住现场。", "planned_outline", "致命采访-分章大纲.txt:第二十章；致命采访-事件脉络.md:E042-E043"),
  chapter("C21", "舆论起火与查账查人", "2025-07-22T08:00", "2025-07-23T18:00", ["tv_media_power", "yang_inner_circle", "chemistry_evidence_collaboration", "daxian_control"], ["public_opinion_versions", "chemical_sample_chain", "occupational_disease_evidence"], "流血冲突被剪成多种舆论版本，大房调查系统与林倩、化学小姑娘查补贴、香火钱、符水和药瓶残留，马三魁放出半真半假的旧厂材料。", "planned_outline", "致命采访-分章大纲.txt:第二十一章；致命采访-事件脉络.md:E044"),
  chapter("C22", "张航远与林盼儿", "2025-07-23T20:00", "2025-07-24T03:00", ["zhang_fall", "daxian_control", "yiren_pov"], ["talisman_system"], "张航远把林盼儿误判为关键受害者，并在私人空间、越界亲密和正义幻觉中被进一步套牢，开始在镜头和解释上偏向大仙祠一侧。", "planned_outline", "致命采访-分章大纲.txt:第二十二章；致命采访-事件脉络.md:E041"),
  chapter("C23", "姐妹线与再拉回", "2025-07-24T08:00", "2025-07-25T18:00", ["chemistry_evidence_collaboration", "investigation_team", "zhang_fall", "yiren_pov"], ["chemical_sample_chain", "old_factory_patients"], "林倩被假证据、张航远姿态和群众苦难拉扯，化学小姑娘用样品和标签规范把她拉回具体证据，两人建立姐妹式工作关系。", "planned_outline", "致命采访-分章大纲.txt:第二十三章；致命采访-事件脉络.md:E045"),
  chapter("C24", "闭门护法", "2025-07-26T08:00", "2025-07-26T20:00", ["daxian_control", "zhang_fall", "investigation_team"], ["enemy_space", "talisman_system"], "马三魁夫妇以闭门护法升级控制，叶依人、林倩和张航远得到核心证据线索，张航远把陷阱包装成风险控制并推动少带人深入。", "planned_outline", "致命采访-分章大纲.txt:第二十四章；致命采访-事件脉络.md:E046"),
  chapter("C25", "深入敌境", "2025-07-27T08:00", "2025-07-27T23:00", ["daxian_control", "zhang_fall", "yiren_pov", "lvyu_hidden_network"], ["enemy_space", "talisman_system", "lvyu_absorption_network"], "三人进入大仙祠后殿或旧厂暗处后被分开，张航远暴露背叛，叶依人进入羞辱、控制和载体标记风险，幕后节点开始显形。", "planned_outline", "致命采访-分章大纲.txt:第二十五章；致命采访-事件脉络.md:E046-E047"),
  chapter("C26", "前台崩塌", "2025-07-28T08:00", "2025-07-28T22:00", ["yiren_pov", "chemistry_evidence_collaboration", "daxian_control", "lvyu_hidden_network"], ["enemy_space", "chemical_sample_chain", "lvyu_absorption_network"], "叶依人用禹树小知识反制现实险境，林倩和化学小姑娘拼出前台伪造，马三魁香头体系崩塌，吕玉必须亲自收尾。", "planned_outline", "致命采访-分章大纲.txt:第二十六章；致命采访-事件脉络.md:E047-E048"),
  chapter("C27", "林盼儿反咬", "2025-07-29T08:00", "2025-07-29T20:00", ["zhang_fall", "daxian_control", "lvyu_hidden_network", "investigation_team"], ["talisman_system", "lvyu_absorption_network"], "林盼儿放出张航远把柄，将私人越界和敌境背叛串在一起，并带着叶依人载体信息、符水、香火和信众名单逃向吕玉。", "planned_outline", "致命采访-分章大纲.txt:第二十七章；致命采访-事件脉络.md:E048"),
  chapter("C28", "吕玉下场", "2025-07-30T08:00", "2025-07-30T22:00", ["lvyu_hidden_network", "yiren_pov", "chemistry_evidence_collaboration", "yang_inner_circle"], ["lvyu_absorption_network", "chemical_sample_chain", "talisman_system"], "吕玉发现前台体系被拆穿后亲自收尾，信众香火、符纸残留、符水样品和吸灵网络压向杨家，叶依人的现实脱困与禹树幕后拆解重合。", "planned_outline", "致命采访-分章大纲.txt:第二十八章；致命采访-事件脉络.md:E048"),
  chapter("C29", "杨氏集团对峙", "2025-07-31T08:00", "2025-07-31T22:00", ["lvyu_hidden_network", "yang_clan_power", "yang_inner_circle", "city_charity_redevelopment"], ["yang_supply_contract", "city_resource_war"], "吕玉以旧供奉协议和保厂承诺压杨家，杨家主旧协议暴露，莫妮卡负责家族对接，叶依人被推到前台，城市资源争夺战正式连接。", "planned_followup", "致命采访-分章大纲.txt:第二十九章"),
  chapter("C30", "吕玉第一次败退", "2025-08-01T08:00", "2025-08-01T22:00", ["lvyu_hidden_network", "chemistry_evidence_collaboration", "yang_inner_circle"], ["lvyu_absorption_network", "chemical_sample_chain"], "禹树利用传感器、数据表、化学样品、五味符纸分类和低耗法术切断部分节点，吕玉第一次败退但退回不败之地。", "planned_followup", "致命采访-分章大纲.txt:第三十章"),
  chapter("C31", "不败之地", "2025-08-02T08:00", "2025-08-02T22:00", ["lvyu_hidden_network", "daxian_control", "chemistry_evidence_collaboration"], ["lvyu_absorption_network", "enemy_space", "chemical_sample_chain"], "大仙祠深处成为吕玉经营多年的吸灵场，病人、符纸、香火、旧厂化学污染、符水添加物和供奉阵法纠缠在一起。", "planned_followup", "致命采访-分章大纲.txt:第三十一章"),
  chapter("C32", "林倩崩裂与回归", "2025-08-03T08:00", "2025-08-03T22:00", ["chemistry_evidence_collaboration", "investigation_team", "zhang_fall", "yiren_pov"], ["chemical_sample_chain", "talisman_system"], "林倩把张航远、林盼儿、五味符纸、化学样品和禹树判断串上，意识到自己曾被漂亮闭环误导，并在化学小姑娘帮助下落回证据。", "planned_followup", "致命采访-分章大纲.txt:第三十二章；致命采访-事件脉络.md:E045"),
  chapter("C33", "禹树破局", "2025-08-04T08:00", "2025-08-04T22:00", ["lvyu_hidden_network", "chemistry_evidence_collaboration"], ["lvyu_absorption_network", "chemical_sample_chain", "talisman_system"], "禹树把五味符纸视为信号分类，把信众反应视为反馈网络，把符水和香灰残留视为现实刺激，找到吕玉吸灵网络节律。", "planned_followup", "致命采访-分章大纲.txt:第三十三章"),
  chapter("C34", "正面击溃", "2025-08-05T08:00", "2025-08-05T22:00", ["lvyu_hidden_network", "chemistry_evidence_collaboration", "yiren_pov"], ["lvyu_absorption_network", "chemical_sample_chain"], "吕玉吸纳信众精气神攻击，禹树反向利用传感网络、符纸数据、化学样品和低耗法术破坏节点同步，让吸灵网络反噬。", "planned_followup", "致命采访-分章大纲.txt:第三十四章"),
  chapter("C35", "清算与入口", "2025-08-06T08:00", "2025-08-06T22:00", ["lvyu_hidden_network", "tv_media_power", "yang_clan_power", "city_charity_redevelopment", "zhang_fall"], ["city_resource_war", "public_opinion_versions", "yang_supply_contract"], "吕玉败亡或重创，病人不会立刻痊愈但继续恶化的根被拔掉，马三魁夫妇体系崩塌，电视台、二房传媒线和张航远进入清算，小卷打开城市资源争夺战下一阶段。", "planned_followup", "致命采访-分章大纲.txt:第三十五章")
];

function beat(chapterId, storyline, title, summary, participants, sourceRefs = []) {
  return {
    chapter: chapterId,
    storyline,
    title,
    summary,
    participants,
    sourceRefs
  };
}

const outlineBeats = [
  beat("C15", "yang_clan_power", "会议结论成为高层定调", "楼上内场的投票结果被转化成所有人明面上必须执行的城市口径。", ["钢铁主席", "莫妮卡", "沈砚清", "周启衡"], ["E029"]),
  beat("C15", "tv_media_power", "电视台推出民生专区", "采访报道被系统吸收，从揭黑叙事改成民生宣传和救助配合。", ["叶依人", "张航远", "林倩", "凯里", "周启衡", "电视台相关授权者"], ["E030"]),
  beat("C15", "city_charity_redevelopment", "救助筛查进入筹备期", "基金、互助协会、志愿者和医疗筛查开始对接人、表格、场地和资源。", ["叶依人", "钢铁主席", "基金会代表", "志愿者队伍"], ["E031"]),
  beat("C15", "yiren_pov", "被吸收入监督配置", "叶依人拒绝单纯荣誉化安排，坚持继续去一线访谈和收集资料。", ["叶依人", "莫妮卡"], ["E031"]),
  beat("C15", "yang_inner_circle", "莫妮卡信用回升", "莫妮卡通过临场反转稳定家主系局面，获得阶段性政治信用。", ["莫妮卡", "杨家主系", "沈砚清"], ["E034"]),
  beat("C15", "zhang_fall", "发现自己被边缘化", "张航远发现新闻、基金、口径和叶依人身份吸收了事件中心，开始寻找新的爆点。", ["张航远", "叶依人", "林倩", "凯里"], ["E035"]),
  beat("C16", "investigation_team", "三天缓冲继续走访", "采访组在筹备期继续访谈、登记意向和收集资料，表面节奏放慢。", ["叶依人", "张航远", "林倩"], ["E031"]),
  beat("C16", "yiren_pov", "看见群众复杂性", "叶依人发现受苦不等于纯洁，救助必须面对恐惧、粗鄙、贪小便宜和说不清诉求。", ["叶依人", "病患家属代表", "老工人群体"], ["E032"]),
  beat("C16", "daxian_control", "林盼儿双线诱导", "林盼儿对张航远走照顾求助路线，对叶依人走责任使命路线。", ["林盼儿", "张航远", "叶依人"], ["E033"]),
  beat("C16", "zhang_fall", "接受私人空间渗透", "张航远允许林盼儿几乎每晚进入出租屋，开始被连续捕获。", ["张航远", "林盼儿"], ["E033", "E035"]),
  beat("C17", "city_charity_redevelopment", "热闹进场变成善意秩序机器", "志愿者、基金、医疗筛查和电视台民生团队大规模进入旧社区。", ["叶依人", "志愿者队伍", "基金会代表", "医疗社工", "老工人群体"], ["E036"]),
  beat("C17", "yang_inner_circle", "禹树低调入镜", "禹树在楼道口检查烧黑插排、异常香灰和符纸残片，不急于解释。", ["禹树", "叶依人", "林倩"], ["E037"]),
  beat("C17", "chemistry_evidence_collaboration", "化学小姑娘建立取样规范", "化学小姑娘提醒志愿者不要乱收符纸、药瓶、香灰和符水残留，与林倩形成默契。", ["林倩", "家主派化学小姑娘", "志愿者队伍"], ["E038"]),
  beat("C17", "yiren_pov", "看见救助也会灼伤", "叶依人同时看见救助的必要性和善意秩序机器对旧社区的压迫感。", ["叶依人", "老工人群体", "志愿者队伍"], ["E036"]),
  beat("C18", "chemistry_evidence_collaboration", "病例与样品被分开登记", "林倩和化学小姑娘按车间、工种、症状、符水、香灰和药瓶残留拆开登记。", ["林倩", "家主派化学小姑娘", "病患家属代表"], ["E039"]),
  beat("C18", "investigation_team", "职业病疑云回到材料链", "采访组把职业病从苦情叙事拆回病历、工龄、岗位和接触源。", ["叶依人", "张航远", "林倩"], ["E039"]),
  beat("C18", "daxian_control", "共同苦难叙事被拆开", "群众第一次具体质疑为何不同症状和接触源都被马三魁说成同一种毒和同一条符水救命路。", ["马三魁", "林盼儿", "病患家属代表", "老人信众"], ["E039"]),
  beat("C19", "daxian_control", "马三魁重新收拢群众", "马三魁用闭门护法、集体忏悔和断根话术把松动人群拉回大仙祠。", ["马三魁", "林盼儿", "老人信众", "老工人群体"], ["E040"]),
  beat("C19", "zhang_fall", "把拆解误读成冷酷管理", "张航远把林倩的数据拆解和志愿者秩序化工作理解成系统清洗。", ["张航远", "林盼儿", "林倩"], ["E041"]),
  beat("C19", "yiren_pov", "面对保护权争夺", "叶依人意识到群众被不同力量争夺保护权和解释权。", ["叶依人", "马三魁", "老工人群体"], ["E040"]),
  beat("C20", "daxian_control", "镜头下的流血冲突", "马三魁集中老人对抗志愿者和电视台，现场出现抢夺、推挤和流血。", ["马三魁", "林盼儿", "老人信众", "电视台相关授权者"], ["E042"]),
  beat("C20", "city_charity_redevelopment", "志愿救助变公共危机", "清理楼道、消防排查和确认老人安全的救助工作被推成公共危机。", ["志愿者队伍", "医疗社工", "基金会代表", "叶依人"], ["E042", "E043"]),
  beat("C20", "tv_media_power", "冲突素材进入镜头", "冲突现场变成双方都能剪辑和利用的视频素材。", ["张航远", "电视台相关授权者", "周启衡"], ["E042"]),
  beat("C20", "zhang_fall", "张航远现场起坏作用", "张航远拼命拍摄并接受林盼儿诱导，让现场解释向大仙祠一侧倾斜。", ["张航远", "林盼儿"], ["E042"]),
  beat("C20", "yiren_pov", "摆平流血现场", "叶依人让镜头后撤，要求第三方医护和女性社工确认老人安全，并逼马三魁让人自己出来说话。", ["叶依人", "马三魁", "医疗社工", "老人信众"], ["E043"]),
  beat("C21", "tv_media_power", "两版视频引爆舆论", "电视台和二房线把现场剪成救助遭邪教阻挠和年轻人欺负病人两种版本。", ["熊丽", "周启衡", "二房传媒线", "叶依人"], ["E044"]),
  beat("C21", "yang_inner_circle", "大房调查系统查账查人", "禹树、杨心蕊、老林、林倩和化学小姑娘分头查补贴、香火钱、伪诉讼和样品。", ["禹树", "杨心蕊", "老林", "林倩", "家主派化学小姑娘"], ["E044"]),
  beat("C21", "chemistry_evidence_collaboration", "符水香灰初筛咬合", "化学证据能提示异常残留，但不能直接替代司法鉴定。", ["林倩", "家主派化学小姑娘", "禹树"], ["E044"]),
  beat("C21", "daxian_control", "半真半假旧厂材料被放出", "马三魁一侧放出过于整齐的旧厂化学制剂记录和病人工种名单，引导调查走向漂亮闭环。", ["马三魁", "林盼儿", "张航远"], ["E044"]),
  beat("C22", "zhang_fall", "张航远与林盼儿越界", "张航远把林盼儿误判成关键受害者，在私人空间和越界亲密中被套牢。", ["张航远", "林盼儿"], ["E041"]),
  beat("C22", "daxian_control", "林盼儿套住张航远", "林盼儿用柔弱、克制、求助和我只信你的话术套住张航远。", ["林盼儿", "张航远"], ["E041"]),
  beat("C22", "yiren_pov", "被理解成已经被吸收", "张航远把叶依人、领导小组、基金会和莫妮卡的关系理解成她被系统吸收。", ["张航远", "叶依人", "莫妮卡"], ["E041"]),
  beat("C23", "chemistry_evidence_collaboration", "姐妹线稳住林倩", "化学小姑娘用样品、标签和残留差异把林倩从情绪和漂亮闭环里拉回来。", ["林倩", "家主派化学小姑娘"], ["E045"]),
  beat("C23", "investigation_team", "林倩再拉出部分老人", "林倩再次把一部分老人从马三魁仪式中拉出来，群众拉锯进入第二轮。", ["林倩", "叶依人", "病患家属代表"], ["E045"]),
  beat("C23", "zhang_fall", "张航远话术继续拉扯", "张航远的正义姿态和群众苦难继续影响林倩判断。", ["张航远", "林倩"], ["E045"]),
  beat("C23", "yiren_pov", "叶依人保留细节疑虑", "叶依人被张航远刺中但更成熟，从细节中保留疑虑。", ["叶依人", "张航远"], ["E045"]),
  beat("C24", "daxian_control", "闭门护法升级", "马三魁夫妇把核心信众、关键老人和老吴老婆重新收进大仙祠体系。", ["马三魁", "林盼儿", "老吴老婆", "老人信众"], ["E046"]),
  beat("C24", "zhang_fall", "把陷阱包装成风险控制", "张航远以最懂风险、最能接近底层为名，说服叶依人和林倩不要带太多人。", ["张航远", "叶依人", "林倩", "林盼儿"], ["E046"]),
  beat("C24", "investigation_team", "核心证据线索引三人深入", "叶依人、林倩和张航远获得核心证据线索，准备进入大仙祠或旧厂暗处。", ["叶依人", "林倩", "张航远"], ["E046"]),
  beat("C25", "daxian_control", "三人深入敌境", "三人进入大仙祠后殿、旧厂暗处或供奉空间后被自然分开。", ["叶依人", "林倩", "张航远", "马三魁"], ["E046"]),
  beat("C25", "zhang_fall", "背叛现实爆发", "张航远先用自以为正义的话术指责叶依人，再把她带入羞辱、控制和载体标记风险。", ["张航远", "叶依人", "林盼儿"], ["E046"]),
  beat("C25", "yiren_pov", "进入载体标记风险", "叶依人没有法术，只能在现实空间里识别香炉、红线、镜面和符灰位置。", ["叶依人", "张航远", "马三魁"], ["E047"]),
  beat("C25", "lvyu_hidden_network", "供奉空间露出幕后节点", "敌境中的香炉、符灰、红线和甜腻香味露出吕玉节点存在。", ["吕玉", "禹树", "叶依人", "马三魁"], ["E047"]),
  beat("C26", "yiren_pov", "叶依人用小知识反制", "叶依人避开符水和甜腻香味，用强光、断电、开窗和破坏香炉节奏争取时间。", ["叶依人", "禹树", "张航远"], ["E047"]),
  beat("C26", "chemistry_evidence_collaboration", "账册样品拼出前台伪造", "林倩和化学小姑娘从账册、样品和符水残留中确认前台伪造和控制。", ["林倩", "家主派化学小姑娘", "禹树"], ["E047", "E048"]),
  beat("C26", "daxian_control", "马三魁前台体系崩塌", "马三魁的职业病闭环、符水控制和香头体系同时暴露。", ["马三魁", "林盼儿", "老吴老婆"], ["E048"]),
  beat("C26", "lvyu_hidden_network", "吕玉必须亲自收尾", "前台失败后，吕玉只能从幕后进入前台收尾。", ["吕玉", "禹树", "叶依人"], ["E048"]),
  beat("C27", "zhang_fall", "林盼儿放出张航远把柄", "林盼儿把张航远的正义包装、私人越界和敌境背叛串成反咬材料。", ["林盼儿", "张航远", "林倩", "叶依人"], ["E048"]),
  beat("C27", "daxian_control", "林盼儿带火种逃向吕玉", "林盼儿带着张航远线把柄、叶依人载体信息、符水香火和信众名单逃向吕玉。", ["林盼儿", "老吴老婆", "吕玉"], ["E048"]),
  beat("C27", "lvyu_hidden_network", "载体信息转入幕后", "叶依人被标记为载体的信息和信众名单从前台香头线转入吕玉线。", ["吕玉", "林盼儿", "叶依人"], ["E048"]),
  beat("C27", "investigation_team", "林倩情感判断崩裂", "林倩受到张航远和林盼儿反转冲击，确认自己的情感判断曾被误导。", ["林倩", "叶依人", "张航远"], ["E045", "E048"]),
  beat("C28", "lvyu_hidden_network", "吕玉下场施压杨家", "吕玉借信众香火、符纸残留、符水样品和吸灵网络向杨家施压。", ["吕玉", "杨家主系", "禹树"], ["E048"]),
  beat("C28", "yiren_pov", "现实脱困与幕后拆解重合", "读者随后明白，叶依人在现实空间的打断动作正好配合禹树拆解吕玉节点。", ["叶依人", "禹树", "吕玉"], ["E047", "E048"]),
  beat("C28", "chemistry_evidence_collaboration", "数据样品和斗法合成破局链", "化学证据、数据网络和禹树斗法不再并列，而是合成同一条破局链。", ["林倩", "家主派化学小姑娘", "禹树"], ["E048"]),
  beat("C28", "yang_inner_circle", "禹树低调拆解节点", "禹树在另一层面拆解吕玉节点，不抢走叶依人的现实胜利。", ["禹树", "叶依人", "莫妮卡"], ["E048"]),
  beat("C29", "lvyu_hidden_network", "旧供奉协议压向杨家", "吕玉以旧供奉协议和保厂承诺压杨家。", ["吕玉", "杨家主系", "禹树"], []),
  beat("C29", "yang_clan_power", "杨氏集团对峙", "杨家主旧协议暴露，叶依人被推到前台。", ["杨家主系", "莫妮卡", "叶依人", "吕玉"], []),
  beat("C29", "yang_inner_circle", "莫妮卡负责家族对接", "莫妮卡负责家族对接，杨心蕊稳住资料。", ["莫妮卡", "杨心蕊", "叶依人"], []),
  beat("C29", "city_charity_redevelopment", "资源争夺战被接上", "致命采访与城市资源争夺战正式连接。", ["钢铁主席", "基金会代表", "叶依人"], []),
  beat("C30", "lvyu_hidden_network", "吕玉第一次败退", "禹树切断部分节点，吕玉第一次败退但退回不败之地。", ["禹树", "吕玉"], []),
  beat("C30", "chemistry_evidence_collaboration", "传感器样品五味分类协同", "传感器、数据表、化学样品和五味符纸分类一起成为拆解工具。", ["禹树", "林倩", "家主派化学小姑娘"], []),
  beat("C30", "yang_inner_circle", "低耗法术切断节点", "禹树用低耗法术和现实样品切断部分吸灵节点。", ["禹树", "杨心蕊", "莫妮卡"], []),
  beat("C31", "lvyu_hidden_network", "不败之地显形", "大仙祠深处成为吕玉经营多年的吸灵场。", ["吕玉", "禹树"], []),
  beat("C31", "daxian_control", "大仙祠深处成为吸灵场", "病人、符纸、香火、旧厂化学污染和供奉阵法纠缠在一起。", ["吕玉", "马三魁", "老人信众"], []),
  beat("C31", "chemistry_evidence_collaboration", "现实病灶与邪修手段纠缠", "普通调查手段失效，样品链必须与非自然结构判断合并。", ["林倩", "家主派化学小姑娘", "禹树"], []),
  beat("C32", "chemistry_evidence_collaboration", "林倩崩裂后被证据拉回", "化学小姑娘帮助林倩把崩裂落回具体证据。", ["林倩", "家主派化学小姑娘"], ["E045"]),
  beat("C32", "investigation_team", "三人关系裂缝显形", "张航远遗留伤害让采访组三人关系彻底裂开。", ["叶依人", "林倩", "张航远"], ["E045"]),
  beat("C32", "zhang_fall", "遗留情绪泥潭", "张航远造成的正义姿态和漂亮闭环仍在拖拽林倩。", ["张航远", "林倩"], ["E045"]),
  beat("C32", "yiren_pov", "重新校准林倩站位", "叶依人和林倩在裂缝中重新校准立场。", ["叶依人", "林倩"], ["E045"]),
  beat("C33", "lvyu_hidden_network", "禹树把吸灵网络建模", "禹树把信众反应、符水残留、五味符纸和吸灵术转成可拆解网络。", ["禹树", "吕玉"], []),
  beat("C33", "chemistry_evidence_collaboration", "五味符纸转成信号分类", "五味符纸从玄学物件转成信号分类和反馈网络节点。", ["禹树", "林倩", "家主派化学小姑娘"], []),
  beat("C34", "lvyu_hidden_network", "正面击溃吸灵网络", "禹树破坏节点同步，让吕玉吸灵网络反噬。", ["禹树", "吕玉"], []),
  beat("C34", "chemistry_evidence_collaboration", "数据与样品破坏节点同步", "传感网络、符纸数据和化学样品共同定位节点节律。", ["禹树", "林倩", "家主派化学小姑娘"], []),
  beat("C34", "yiren_pov", "现实动作补上关键节奏", "叶依人的现实动作补上破局节奏，避免胜利只属于禹树。", ["叶依人", "禹树"], []),
  beat("C35", "lvyu_hidden_network", "吕玉败亡或重创", "吕玉败亡或重创，继续恶化的根被拔掉。", ["吕玉", "禹树", "叶依人"], []),
  beat("C35", "tv_media_power", "电视台和二房线进入清算", "电视台和二房传媒线暴露，熊丽和周启衡线进入清算。", ["熊丽", "周启衡", "二房传媒线"], []),
  beat("C35", "yang_clan_power", "城市资源战开启下一阶段", "杨家、二房、城市资源方和叶依人进入下一阶段争夺。", ["杨家主系", "莫妮卡", "叶依人"], []),
  beat("C35", "zhang_fall", "正义包装彻底破裂", "张航远的正义包装彻底破裂，后续只剩清算或审判空间。", ["张航远", "叶依人", "林倩"], []),
  beat("C35", "city_charity_redevelopment", "病人不会立刻痊愈", "病人不会立刻痊愈，但继续恶化的根被拔掉，救助和城市资源问题进入下一阶段。", ["叶依人", "基金会代表", "医疗社工", "老工人群体"], [])
];

const baseChapterMatrix = baseDefinition.chapterStorylineMatrix.map((item) => ({
  ...item,
  sourceStatus: "completed_text",
  sourceRef: "第002卷第001-014章正文；致命采访-事件脉络.md:E001-E028"
}));

const baseChapterBeats = baseDefinition.chapterBeats.map((item) => ({
  ...item,
  sourceRefs: item.sourceRefs || ["C1-C14 source definition"]
}));

const phaseBlocks = [
  ...baseDefinition.completedChapters.phaseBlocks.map((phase) => ({
    ...phase,
    sourceStatus: "completed_text",
    sourceRef: "第002卷第001-014章正文与既有事件脉络"
  })),
  {
    id: "P5",
    name: "会后缓冲与假性好转",
    chapters: ["C15", "C16"],
    summary: "会议结果进入城市机器和民生口径，救助与筛查进入筹备期；叶依人认识群众复杂性，张航远被边缘化，林盼儿开始双线诱导。",
    sourceStatus: "planned_outline",
    sourceRef: "致命采访-分章大纲.txt:第十五章-第十六章；致命采访-事件脉络.md:E029-E035"
  },
  {
    id: "P6",
    name: "热闹进场与职业病线反拆",
    chapters: ["C17", "C18", "C19"],
    summary: "救助系统大规模进入旧社区，林倩和化学小姑娘拆开职业病共同叙事，马三魁重新收拢群众，张航远实际站错边。",
    sourceStatus: "planned_outline",
    sourceRef: "致命采访-分章大纲.txt:第十七章-第十九章；致命采访-事件脉络.md:E036-E041"
  },
  {
    id: "P7",
    name: "舆论冲突与证据回拉",
    chapters: ["C20", "C21", "C22", "C23"],
    summary: "镜头下流血冲突引发舆论战和证据战，张航远被林盼儿进一步套牢，林倩在化学小姑娘帮助下回到具体证据。",
    sourceStatus: "planned_outline",
    sourceRef: "致命采访-分章大纲.txt:第二十章-第二十三章；致命采访-事件脉络.md:E042-E045"
  },
  {
    id: "P8",
    name: "敌境背叛与前台崩塌",
    chapters: ["C24", "C25", "C26", "C27", "C28"],
    summary: "闭门护法升级为敌境陷阱，张航远背叛现实爆发，叶依人用现实知识自救，马三魁前台崩塌，吕玉亲自下场。",
    sourceStatus: "planned_outline",
    sourceRef: "致命采访-分章大纲.txt:第二十四章-第二十八章；致命采访-事件脉络.md:E046-E048"
  },
  {
    id: "P9",
    name: "吕玉吸灵网络与小卷收束",
    chapters: ["C29", "C30", "C31", "C32", "C33", "C34", "C35"],
    summary: "吕玉以供奉协议压向杨家，禹树把五味符纸和吸灵网络转成可拆解模型，最终击溃吕玉体系并打开城市资源争夺战下一阶段。",
    sourceStatus: "planned_followup",
    sourceRef: "致命采访-分章大纲.txt:第二十九章-第三十五章"
  }
];

const chapterStorylineMatrix = [...baseChapterMatrix, ...outlineChapters];
const chapterBeats = [...baseChapterBeats, ...outlineBeats];

const definition = {
  meta: {
    name: "致命采访 C1-C35 大纲映射故事线定义",
    version: "0.1.0",
    status: "outline_projection_for_review",
    scope: "第002卷 C1-C14 已成文内容 + C15-C35 大纲规划内容",
    createdAt: "2026-06-30",
    purpose: "把第二卷大纲、事件脉络和既有 C1-C14 故事线定义推进为 C1-C35 版本化源定义，供基准时间轴投影 JSON 生成使用。",
    sourceBasis: [
      "app/public/data/storyline-definitions/storylines-c1-c14-v0.1.json",
      "第002卷第001章至第014章正文",
      "致命采访-分章大纲.txt",
      "致命采访-事件脉络.md",
      "用户确认：把第二卷大纲内容继续映射到 JSON，不覆盖当前基准数据"
    ],
    notRuntimeDataset: true,
    runtimeMigrationNote: "本文件是 C1-C35 outline preview 的源定义；运行层数据由 build-c1-c35-outline-dataset.mjs 生成。"
  },
  principles: {
    ...baseDefinition.principles,
    outlineProjectionBoundary: {
      definition: "C15-C35 来自大纲和事件脉络，不等同于已成文正文事实；运行 JSON 必须保留 planned_outline 或 planned_followup 来源状态。",
      rule: "C1-C14 标记为 completed_text；C15-C28 标记为 planned_outline；C29-C35 标记为 planned_followup。"
    }
  },
  completedChapters: {
    volume: "第002卷",
    included: chapterStorylineMatrix.map((item) => item.chapter),
    completedText: baseChapterMatrix.map((item) => item.chapter),
    plannedOutline: outlineChapters.filter((item) => item.sourceStatus === "planned_outline").map((item) => item.chapter),
    plannedFollowup: outlineChapters.filter((item) => item.sourceStatus === "planned_followup").map((item) => item.chapter),
    excluded: [],
    phaseBlocks
  },
  storylines,
  domains,
  chapterStorylineMatrix,
  chapterBeats,
  migrationGuidance: {
    generatedStoryFile: outputStoryFile,
    manifestId: "c1-c35-outline-preview-v0-1",
    keepCurrentDefault: true,
    note: "该数据集用于界面预览和结构校对，不把 C15-C35 规划段升级为正文事实。"
  }
};

writeJson(outputDefinitionPath, definition);

const storylinesById = new Map(definition.storylines.map((item) => [item.id, item]));
const domainsById = new Map(definition.domains.map((item) => [item.id, item]));
const chapterMetaById = new Map(definition.chapterStorylineMatrix.map((item) => [item.chapter, item]));
const participantNamesByStoryline = new Map();
for (const beatItem of definition.chapterBeats) {
  const names = participantNamesByStoryline.get(beatItem.storyline) || [];
  names.push(...(beatItem.participants || []));
  participantNamesByStoryline.set(beatItem.storyline, unique(names));
}
const chapterTimes = new Map(baseProjection.chapters.map((item) => [item.id, [item.startAt, item.endAt]]));
for (const item of outlineChapters) {
  chapterTimes.set(item.chapter, [item.startAt, item.endAt]);
}

function chapterRange(chapterId) {
  const range = chapterTimes.get(chapterId);
  if (!range) throw new Error(`Missing chapter time for ${chapterId}`);
  return range;
}

function trackSub(storyline) {
  if (storyline.id === "main") return "阶段块总览";
  if (storyline.coreAgents?.length) return storyline.coreAgents.slice(0, 3).join(" / ");
  return storyline.type;
}

function characterIdsForStoryline(storyline) {
  const names = [
    ...(storyline.coreAgents || []),
    ...(storyline.childCharacterCandidates || []),
    ...(participantNamesByStoryline.get(storyline.id) || [])
  ];
  return unique(names.map((name) => characterNameToId.get(name)));
}

function sourceLabel(sourceStatus) {
  if (sourceStatus === "completed_text") return "已成文";
  if (sourceStatus === "planned_followup") return "规划顺延";
  return "规划";
}

function visualStateFor(storylineId, chapterId, sourceStatus) {
  if (sourceStatus === "planned_followup") return "continuing";
  if (storylineId === "lvyu_hidden_network") return "risk";
  if (["daxian_control", "zhang_fall"].includes(storylineId) && Number(chapterId.slice(1)) >= 19) return "risk";
  if (["yang_clan_power", "city_charity_redevelopment", "tv_media_power"].includes(storylineId)) return "warn";
  if (["yiren_pov", "chemistry_evidence_collaboration"].includes(storylineId)) return "key";
  return "normal";
}

const participantBriefs = {
  叶依人: "负责现场判断",
  张航远: "制造偏移破坏",
  林倩: "整理证据链",
  莫妮卡: "维持家族控场",
  禹树: "拆解幕后节点",
  杨心蕊: "稳住资料线",
  老林: "补足旧厂材料",
  熊丽: "控制电视口径",
  周启衡: "推动剪辑利用",
  凯里: "承接台内反馈",
  马三魁: "重新收拢信众",
  林盼儿: "执行诱导捕获",
  吕玉: "发动幕后施压",
  家主派化学小姑娘: "校准样品链",
  志愿者队伍: "执行救助秩序",
  医疗社工: "确认老人安全",
  老工人群体: "承载现场压力",
  老人信众: "承载信众冲突",
  老吴老婆: "转入幕后火种",
  杨家主系: "承受协议压力",
  钢铁主席: "搭建资源入口",
  基金会代表: "承接救助路径",
  副局长: "参与资源裁决",
  地产代表: "进入旧改博弈",
  金融代表: "进入资金博弈",
  能源代表: "进入资源博弈",
  议员代表: "进入公共博弈",
  电视台相关授权者: "承接报道口径",
  二房传媒线: "利用舆论版本",
  沈砚清: "参与家族交锋",
  家主系代表: "承受家族压力",
  老吴: "提供组织线索",
  老李一家: "承载控制代价",
  病患家属代表: "承载病患诉求"
};

function roleBriefFor(participantName) {
  const brief = participantBriefs[participantName] || "参与关系变化";
  return [...brief].slice(0, 15).join("");
}

function relationChangeFor(participantName, roleBrief, storyline, chapterId) {
  return `${participantName}在 ${chapterId} 中${roleBrief}，改变了“${storyline.name}”的推进方式。`;
}

function sourceRefFor(beat, chapter) {
  const refs = unique([...(beat.sourceRefs || []), chapter.sourceRef]);
  return refs.join("；");
}

const tracks = definition.storylines
  .filter((storyline) => storyline.visibleAsTrack)
  .map((storyline) => ({
    id: storyline.id,
    name: storyline.name,
    sub: trackSub(storyline),
    expanded: false,
    characters: characterIdsForStoryline(storyline),
    color: storyline.baseColor,
    soft: toSoftColor(storyline.baseColor)
  }));
const tracksById = new Map(tracks.map((track) => [track.id, track]));

const chapters = definition.chapterStorylineMatrix.map((chapterItem) => {
  const [startAt, endAt] = chapterRange(chapterItem.chapter);
  const storylineNames = chapterItem.primaryStorylines.map((id) => storylinesById.get(id)?.name || id);
  const domainNames = chapterItem.domains.map((id) => domainsById.get(id)?.name || id);
  return {
    id: chapterItem.chapter,
    title: chapterItem.title,
    startAt,
    endAt,
    input: `本章进入的顶层故事线：${storylineNames.join(" / ")}。`,
    inside: chapterItem.summary,
    output: domainNames.length > 0 ? `关联对象域：${domainNames.join(" / ")}。` : "无额外对象域。",
    sourceStatus: chapterItem.sourceStatus,
    sourceRef: chapterItem.sourceRef
  };
});

const events = [];

for (const phase of definition.completedChapters.phaseBlocks) {
  const [startAt] = chapterRange(phase.chapters[0]);
  const [, endAt] = chapterRange(phase.chapters.at(-1));
  events.push({
    id: `PHASE-${phase.id}`,
    kind: "story",
    track: "main",
    startAt,
    endAt,
    title: phase.name,
    code: `${phase.id} / ${phase.chapters.join("-")}`,
    visualState: phase.sourceStatus === "completed_text" ? "key" : "continuing",
    input: "这是故事主轴的阶段块，不替代具体故事线事件。",
    output: phase.summary,
    risk: `${sourceLabel(phase.sourceStatus)}：${definition.principles.mainAxisMode.definition}`,
    sourceStatus: phase.sourceStatus,
    sourceRef: phase.sourceRef
  });
}

for (const beatItem of definition.chapterBeats) {
  const chapterItem = chapterMetaById.get(beatItem.chapter);
  if (!chapterItem) throw new Error(`Beat ${beatItem.title} references missing chapter ${beatItem.chapter}`);
  const storyline = storylinesById.get(beatItem.storyline);
  if (!storyline) throw new Error(`Beat ${beatItem.title} references missing storyline ${beatItem.storyline}`);
  const [startAt, endAt] = chapterRange(beatItem.chapter);
  const domainNames = chapterItem.domains.map((id) => domainsById.get(id)?.name || id);
  const visualState = visualStateFor(beatItem.storyline, beatItem.chapter, chapterItem.sourceStatus);
  const sourceRef = sourceRefFor(beatItem, chapterItem);

  events.push({
    id: `MAP-${beatItem.chapter}-${beatItem.storyline}`,
    kind: "story",
    track: beatItem.storyline,
    startAt,
    endAt,
    title: beatItem.title,
    code: `${beatItem.chapter} / ${beatItem.storyline}`,
    visualState,
    input: beatItem.summary,
    output: `本章把事件归入：${storyline.name}${domainNames.length ? `；对象域：${domainNames.join(" / ")}` : ""}。`,
    risk: `${sourceLabel(chapterItem.sourceStatus)}：${storyline.definition}`,
    sourceStatus: chapterItem.sourceStatus,
    sourceRef
  });

  const track = tracksById.get(beatItem.storyline);
  const trackCharacters = new Set(track?.characters || []);
  for (const participantName of beatItem.participants || []) {
    const characterId = characterNameToId.get(participantName);
    if (!characterId) throw new Error(`Missing character mapping for ${participantName}`);
    if (!trackCharacters.has(characterId)) {
      throw new Error(`Track ${beatItem.storyline} does not include character ${participantName}`);
    }
    const roleBrief = roleBriefFor(participantName);
    const relationChange = relationChangeFor(participantName, roleBrief, storyline, beatItem.chapter);
    const action = `${participantName}在“${beatItem.title}”中${roleBrief}。${beatItem.summary}`;
    const inspectorSummary = `${sourceLabel(chapterItem.sourceStatus)}来源：${sourceRef}；人物作用是“${roleBrief}”。`;
    events.push({
      id: `CHAR-${beatItem.chapter}-${beatItem.storyline}-${characterId}`,
      kind: "character",
      track: beatItem.storyline,
      character: characterId,
      participantName,
      startAt,
      endAt,
      title: roleBrief,
      roleBrief,
      code: `${beatItem.chapter} / ${characterId}`,
      visualState,
      action,
      relationChange,
      inspectorSummary,
      input: action,
      output: relationChange,
      risk: inspectorSummary,
      visibility: "explicit",
      sourceStatus: chapterItem.sourceStatus,
      sourceRef
    });
  }
}

const runtimeStory = {
  meta: {
    name: "C1-C35 大纲映射预览 v0.1",
    version: "0.1.0",
    datasetType: "narrativeTimelineProjection",
    projectionTarget: "baselineTimeline",
    modelVersion: "timeline-projection-v1",
    source: `由 data/storyline-definitions/${outputDefinitionFile} 转写生成。C1-C14 为已成文映射，C15-C35 为大纲/事件脉络规划映射。`,
    updatedAt: "2026-06-30",
    sourceStatusLegend: {
      completed_text: "已成文正文与既有事件脉络",
      planned_outline: "大纲和事件脉络中的规划内容",
      planned_followup: "大纲中的规划顺延内容"
    }
  },
  timelineConfig: {
    defaultStart: "2025-07-05T09:00",
    defaultEnd: "2025-08-06T23:00"
  },
  chapters,
  characters,
  tracks,
  events
};

writeJson(outputStoryPath, runtimeStory);

const manifest = readJson(manifestPath);
const entry = {
  id: "c1-c35-outline-preview-v0-1",
  label: "C1-C35 大纲映射预览 v0.1",
  file: outputStoryFile,
  description: "把第二卷《致命采访》C1-C14 已成文结构和 C15-C35 大纲规划映射为基准时间轴投影数据集。"
};
const existingIndex = manifest.stories.findIndex((item) => item.id === entry.id);
if (existingIndex >= 0) {
  manifest.stories[existingIndex] = entry;
} else {
  manifest.stories.push(entry);
}
writeJson(manifestPath, manifest);

console.log(`Generated ${outputDefinitionFile}`);
console.log(`Generated ${outputStoryFile}`);
