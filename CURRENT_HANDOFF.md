# 当前交接说明

更新时间：2026-06-28

## 当前状态

小说叙事验证工具当前进入“基准时间轴原型 V1”阶段。页面已经从早期静态原型演进为可读取 JSON 投影数据集的本地 HTML 工具。

当前浏览器入口：

```text
http://127.0.0.1:4173/index.html
```

当前源码入口：

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/index.html
```

## 最近完成的关键统一

1. 将页面读取的 JSON 统一命名为“基准时间轴投影数据集”。
2. 为投影数据集补充必备元信息：
   - `datasetType: narrativeTimelineProjection`
   - `projectionTarget: baselineTimeline`
   - `modelVersion: timeline-projection-v1`
3. 更新 `schema.json` 和 `validate-story-datasets.mjs`，缺少投影元信息时校验失败。
4. 更新页面文案，把下拉框和状态栏统一为“投影数据集”。
5. 建立 `CODEX_START_HERE.md` 作为迁移后新会话第一入口。

## 当前重要文件

```text
CODEX_START_HERE.md
README.md
设计说明/2026-06-28-基准时间轴页面总设计说明-v1.2.md
设计说明/2026-06-28-基准时间轴投影数据集定义-v1.0.md
设计说明/2026-06-28-事件采集与人物参与策略规范-v1.0.md
设计说明/2026-06-24-事件拆分规则与智能体执行准则-v1.0.md
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/index.html
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/chapter-workbench.html
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/data/stories/index.json
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/data/schema.json
```

## 当前待处理问题

1. 人物参与条仍需要继续完善：
   - 每条人物参与不应只复制事件标题。
   - 每条人物参与应有不超过 15 字的简述。
   - Inspector 需要展示人物参与的差异化属性。
2. 故事线分类仍处于验证阶段：
   - 故事线应以核心人物关系、行为处置和持续冲突组织。
   - 不能把“问题类型”或“处理事项”误当成故事线。
3. 基准时间轴页面已有双轴模式设计：
   - 标准时间轴模式按真实时间比例显示。
   - 章节时间轴模式按章节等宽显示。
   - 两种模式应通过轴接口驱动事件条绘制，不能让事件条自己分叉两套绘制逻辑。
4. 迁移新目录后，需要重新初始化 Git 并确认启动服务和校验命令仍可运行。

## 最近通过的校验

在 `source` 目录运行过以下校验：

```powershell
node scripts/build-storyline-preview-dataset.mjs
node scripts/validate-story-datasets.mjs
node scripts/validate-character-participation.mjs
node scripts/validate-storyline-preview-quality.mjs
node scripts/validate-axis-modes.mjs
node scripts/validate-event-min-width.mjs
node scripts/validate-hit-priority.mjs
node scripts/validate-visual-encoding.mjs
git diff --check
```

结果：脚本通过。`git diff --check` 只有 Windows 换行提示。

浏览器页面也已确认：

- 下拉框显示“投影数据集”。
- 默认项显示“当前投影数据 C1-C5”。
- 控制台无错误。

## Git 注意

当前仓库已有未提交改动。迁移前建议先决定是否在旧仓库提交一次稳定点，或者迁移后在新仓库做初始提交。

不要把外层小说正文目录纳入这个工具仓库。

