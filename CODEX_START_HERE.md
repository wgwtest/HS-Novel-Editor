# Codex Start Here

本文件是小说叙事验证工具迁移、重建 Git 或新开 Codex 会话后的第一入口。新会话应先读本文件，再按下方顺序读取设计说明和数据规范。

## 项目定位

本仓库只管理 `验证工具` 内部内容，用于验证小说结构管理工具，不直接改动外层小说正文、设定和成熟支撑材料。

当前核心工具是“基准时间轴原型 V1”：以真实时间为底盘，以章节覆盖层和故事线轨道组织事件、人物参与条、章节函数入口和 Inspector。

## 当前主入口

当前可运行页面位于：

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/index.html
```

章节函数页面位于：

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/chapter-workbench.html
```

不要再以早期 v6、v7、v9 原型作为当前实现基准。早期原型只保留为设计过程记录。

## 启动方式

必须用 HTTP 服务打开页面，不建议直接 `file://` 打开，因为页面需要读取本地 JSON 数据集。

推荐在 `source` 目录启动：

```powershell
cd C:\OpenCodeWorkSpace\TestProject\文章重写\验证工具\原型包\2026-06-22-叙事验证工具-基准时间轴原型-v1\source
npx --yes vite --host 127.0.0.1 --port 4173
```

然后打开：

```text
http://127.0.0.1:4173/index.html
```

如果没有 Vite，也可以临时用 Python 静态服务：

```powershell
cd C:\OpenCodeWorkSpace\TestProject\文章重写\验证工具\原型包\2026-06-22-叙事验证工具-基准时间轴原型-v1\source
python -m http.server 4173 --bind 127.0.0.1
```

## 必读顺序

新 Codex 会话应按以下顺序恢复上下文：

1. `CODEX_START_HERE.md`
2. `CURRENT_HANDOFF.md`
3. `README.md`
4. `设计说明/2026-06-28-基准时间轴页面总设计说明-v1.2.md`
5. `设计说明/2026-06-28-基准时间轴投影数据集定义-v1.0.md`
6. `设计说明/2026-06-24-事件拆分规则与智能体执行准则-v1.0.md`
7. `设计说明/2026-06-28-事件采集与人物参与策略规范-v1.0.md`
8. `设计说明/2026-06-23-对象可视化要素与颜色编码规则-v1.0.md`
9. `设计说明/2026-06-22-核心对象定义与系统记录总纲-v0.9.md`
10. `设计说明/2026-06-22-全局时间轴与章节工作台贯通设计-v1.0.md`

如果设计说明之间出现冲突，以较新的、面向当前基准时间轴 V1 的文档为准。

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
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/data/stories/
```

数据清单：

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/data/stories/index.json
```

Schema：

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/data/schema.json
```

### 章节函数

章节是处理事件输入、内部加工和输出事件的函数视图。全局时间轴只负责选中章节和进入章节函数，不把章节内部逻辑全部摊开。

### 故事线

故事线不是问题类型或处理流程，而是以核心人物关系、行为处置和持续冲突为依据组织出来的完整叙事线。

### 人物参与条

人物参与条用于表达人物在某章节或事件段中的参与形式。它不应只是复制事件标题，应该有不超过 15 字的参与简述，并在 Inspector 中展示人物、状态、关联事件等差异化信息。

## 当前数据文件

```text
source/data/stories/story-current.json
source/data/stories/story-c1-c5-resplit-v0.1.json
source/data/stories/story-c1-c14-storylines-preview-v0.1.json
```

`story-current.json` 是当前默认投影数据。

`story-c1-c5-resplit-v0.1.json` 用于检查 C1-C5 事件重拆粒度。

`story-c1-c14-storylines-preview-v0.1.json` 用于验证故事线分类、章节归属和对象域降级。

## 常用校验命令

在 `source` 目录执行：

```powershell
node scripts/build-storyline-preview-dataset.mjs
node scripts/validate-story-datasets.mjs
node scripts/validate-character-participation.mjs
node scripts/validate-storyline-preview-quality.mjs
node scripts/validate-axis-modes.mjs
node scripts/validate-event-min-width.mjs
node scripts/validate-hit-priority.mjs
node scripts/validate-visual-encoding.mjs
```

提交前至少运行：

```powershell
node scripts/validate-story-datasets.mjs
node scripts/validate-character-participation.mjs
node scripts/validate-axis-modes.mjs
node scripts/validate-event-min-width.mjs
node scripts/validate-hit-priority.mjs
node scripts/validate-visual-encoding.mjs
```

涉及页面交互、缩放、点击、拖拽或 Inspector 的改动，必须用真实浏览器验证。

## 迁移规则

迁移到新文件夹时，至少迁移以下内容：

```text
README.md
CODEX_START_HERE.md
CURRENT_HANDOFF.md
小说叙事验证工具-策划案.md
叙事验证工具-需求规格说明-v0.1.md
设计说明/
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/
```

如果还需要保留历史原型过程，再迁移整个 `原型包/`。

重建 Git 时不要复制旧 `.git` 目录。推荐流程：

```powershell
Copy-Item -Recurse <旧验证工具目录> <新目录>
Remove-Item -Recurse -Force <新目录>\.git
cd <新目录>
git init
git add .
git commit -m "初始化小说叙事验证工具"
```

如果要推送到远端，再设置新的 remote。

## 工作边界

- 不直接修改外层小说正文和成熟支撑材料。
- 数据拆分、故事线分类和人物参与信息必须先落到设计说明或数据规则，再写入投影数据集。
- UI 页面不能绕过数据模型直接写死业务判断。
- 旧原型可以参考，但当前实现事实源是“基准时间轴原型 V1”和本文件列出的设计说明。

