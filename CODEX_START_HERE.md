# Codex Start Here

本文件是 HS-Novel-Editor 迁移、重建 Git 或新开 Codex 会话后的第一入口。先读本文件恢复当前事实，再进入 `DOC/CODEX_DOC/` 查看正式工程文档。

## 项目定位

本仓库只管理小说叙事结构管理工具本身，不直接改动外层小说正文、设定和成熟支撑材料。

项目最初是“小说叙事验证工具”，当前已经转向长期产品化：以基准时间轴、章节函数、故事线、人物参与条和投影数据集为核心，逐步沉淀成可持续迭代的 HS-Novel-Editor。

当前核心实现是“基准时间轴原型 V1”：以真实时间为底盘，以章节覆盖层和故事线轨道组织事件、人物参与条、章节函数入口和 Inspector。

## 正式工程文档根

长期研发文档统一放在：

```text
DOC/CODEX_DOC/
```

当前活动节点：

```text
P2.4 app 工程化解耦与正式入口切换
```

关键入口：

```text
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

## 当前主入口

当前正式运行入口位于：

```text
app/index.html
```

章节函数页面位于：

```text
app/chapter-workbench.html
```

原型包 `原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/` 从现在起冻结为历史行为基线和视觉回归基线，不再作为产品功能主开发目录。

不要再以早期 v6、v7、v9 原型作为当前实现基准。早期原型只保留为设计过程记录。

## 启动方式

必须用 HTTP 服务打开页面，不建议直接 `file://` 打开，因为页面需要读取本地 JSON 数据集。

推荐在 `app` 目录启动：

```powershell
cd C:\CodexWorkSpace\CodexProject\HS-Novel-Editor\app
npm run dev
```

然后打开：

```text
http://127.0.0.1:4174/index.html
```

`npm run dev` 当前封装的是 Python 静态服务：

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

## 必读顺序

新 Codex 会话应按以下顺序恢复上下文：

1. `CODEX_START_HERE.md`
2. `DOC/CODEX_DOC/README.md`
3. `DOC/CODEX_DOC/00-本地工程策略映射.md`
4. `DOC/CODEX_DOC/01_需求分析/00-工程总体分析.md`
5. `DOC/CODEX_DOC/02_设计说明/00-设计事实源索引.md`
6. `DOC/CODEX_DOC/03_规范与流程/00-文档治理与迁移规则.md`
7. `DOC/CODEX_DOC/04_研发计划/01-WBS-0-HS-Novel-Editor-研发总纲-研发计划.md`
8. `CURRENT_HANDOFF.md`
9. `README.md`

如需追溯专题设计，再按 `DOC/CODEX_DOC/02_设计说明/00-设计事实源索引.md` 读取 `设计说明/` 下的历史设计文档。

## 核心概念

### 基准时间轴投影数据集

当前页面读取的 JSON 统一称为“基准时间轴投影数据集”，不是最终结构化小说数据库。

必备元信息：

```json
{
  "datasetType": "narrativeTimelineProjection",
  "projectionTarget": "baselineTimeline",
  "modelVersion": "timeline-projection-v1"
}
```

数据目录：

```text
app/public/data/stories/
```

数据清单：

```text
app/public/data/stories/index.json
```

Schema：

```text
app/public/data/schema.json
```

### 章节函数

章节是处理事件输入、内部加工和输出事件的函数视图。全局时间轴只负责选中章节和进入章节函数，不把章节内部逻辑全部摊开。

### 故事线

故事线不是问题类型或处理流程，而是以核心人物关系、行为处置和持续冲突为依据组织出来的完整叙事线。

### 人物参与条

人物参与条用于表达人物在某章节或事件段中的参与形式。它不应只是复制事件标题，应该有不超过 15 字的参与简述，并在 Inspector 中展示人物、状态、关联事件等差异化信息。

## 当前数据文件

```text
app/public/data/stories/story-current.json
app/public/data/stories/story-c1-c5-resplit-v0.1.json
app/public/data/stories/story-c1-c14-storylines-preview-v0.1.json
```

`story-current.json` 是当前默认投影数据。

`story-c1-c5-resplit-v0.1.json` 用于检查 C1-C5 事件重拆粒度。

`story-c1-c14-storylines-preview-v0.1.json` 用于验证故事线分类、章节归属和对象域降级。

## 常用校验命令

在 `app` 目录执行：

```powershell
cd C:\CodexWorkSpace\CodexProject\HS-Novel-Editor\app
npm run check
```

提交前至少运行：

```powershell
npm run check
```

涉及页面交互、缩放、点击、拖拽或 Inspector 的改动，必须用真实浏览器验证。

## Git 与素材边界

当前仓库已经初始化并推送到：

```text
https://github.com/wgwtest/HS-Novel-Editor.git
```

`验证作品/` 是本地素材区，只可作为只读引用，必须保持在 `.gitignore` 中，不能提交。

## 工作边界

- 新的稳定工程文档默认写入 `DOC/CODEX_DOC/`。
- 既有 `设计说明/` 和 `原型包/` 暂作为历史事实源与资产根保留，不在 P0.1 中移动。
- 不直接修改外层小说正文和成熟支撑材料。
- 数据拆分、故事线分类和人物参与信息必须先落到设计说明或数据规则，再写入投影数据集。
- UI 页面不能绕过数据模型直接写死业务判断。
- 旧原型可以参考，但当前实现事实源是“基准时间轴原型 V1”和 `DOC/CODEX_DOC/02_设计说明/00-设计事实源索引.md` 指向的设计文档。
