# 当前交接说明

更新时间：2026-06-29

## 当前状态

HS-Novel-Editor 已从一次性“小说叙事验证工具”转向长期产品化项目。当前运行实现仍是“基准时间轴原型 V1”：页面可读取 JSON 投影数据集，并通过真实时间轴、章节覆盖层、故事线轨道、人物参与条、章节函数入口和 Inspector 验证叙事结构。

本轮正在推进 `P0.1 文档治理底座`：已经建立 `DOC/CODEX_DOC/` 正式工程文档根，并把启动入口、研发计划、节点合同、验收入口、机测记录和交接记录接入统一结构。

当前浏览器入口：

```text
http://127.0.0.1:4173/index.html
```

当前源码入口：

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/index.html
```

## 当前重要入口

```text
CODEX_START_HERE.md
DOC/CODEX_DOC/README.md
DOC/CODEX_DOC/00-本地工程策略映射.md
DOC/CODEX_DOC/01_需求分析/00-工程总体分析.md
DOC/CODEX_DOC/02_设计说明/00-设计事实源索引.md
DOC/CODEX_DOC/03_规范与流程/00-文档治理与迁移规则.md
DOC/CODEX_DOC/04_研发计划/01-WBS-0-HS-Novel-Editor-研发总纲-研发计划.md
DOC/CODEX_DOC/04_研发计划/02-WBS-P0.1-文档治理底座-研发计划.md
DOC/CODEX_DOC/05_节点合同/01-WBS-P0.1-文档治理底座-节点合同.md
DOC/CODEX_DOC/06_测试文档/02_验收入口/00-验收主入口.md
```

## 最近完成的关键统一

1. 将页面读取的 JSON 统一命名为“基准时间轴投影数据集”。
2. 为投影数据集补充必备元信息：
   - `datasetType: narrativeTimelineProjection`
   - `projectionTarget: baselineTimeline`
   - `modelVersion: timeline-projection-v1`
3. 更新 `schema.json` 和 `validate-story-datasets.mjs`，缺少投影元信息时校验失败。
4. 更新页面文案，把下拉框和状态栏统一为“投影数据集”。
5. 建立 `CODEX_START_HERE.md` 作为新会话第一入口。
6. 建立 `DOC/CODEX_DOC/` 作为正式工程文档根。

## 当前实现事实

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/index.html
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/chapter-workbench.html
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/data/stories/index.json
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/data/schema.json
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/scripts/
```

基准时间轴页面当前已经具备双轴模式实现：

- 真实时间轴模式按真实时间比例显示。
- 章节等宽轴模式按章节等宽显示。
- 两种模式通过轴投影接口驱动事件条绘制，避免事件条维护两套分叉绘制逻辑。

## 当前待处理问题

1. 人物参与条仍需要继续完善：
   - 每条人物参与不应只复制事件标题。
   - 每条人物参与应有不超过 15 字的简述。
   - Inspector 需要展示人物参与的差异化属性。
2. 故事线分类仍处于验证阶段：
   - 故事线应以核心人物关系、行为处置和持续冲突组织。
   - 不能把“问题类型”或“处理事项”误当成故事线。
3. 文档治理仍需人工确认：
   - `DOC/CODEX_DOC/` 的目录命名和 WBS 拆分需要确认后再作为后续默认规范。
   - P0.1 不移动 `设计说明/` 和 `原型包/`，只建立索引和映射。

## 最近通过的校验

2026-06-29 已在 `source` 目录运行以下校验：

```powershell
node scripts/validate-story-datasets.mjs
node scripts/validate-character-participation.mjs
node scripts/validate-axis-modes.mjs
node scripts/validate-event-min-width.mjs
node scripts/validate-hit-priority.mjs
node scripts/validate-visual-encoding.mjs
```

结果：全部通过。

机测记录：

```text
DOC/CODEX_DOC/06_测试文档/03_机测记录/2026-06-29-001629-文档治理底座-机测记录.md
```

涉及页面交互、缩放、点击、拖拽或 Inspector 的改动，必须用真实浏览器验证。

## Git 注意

当前仓库已经初始化并推送到：

```text
https://github.com/wgwtest/HS-Novel-Editor.git
```

`验证作品/` 是本地素材区，只可作为只读引用，必须保持在 `.gitignore` 中，不能提交。

本轮文档治理改动尚未提交；提交前应检查 `git status --short --ignored`，确认只有预期文档变更和 `!! 验证作品/` 忽略项。
