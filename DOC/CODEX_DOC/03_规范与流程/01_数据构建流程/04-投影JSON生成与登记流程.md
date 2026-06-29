# 投影 JSON 生成与登记流程

## 1. 目的

本文定义如何从源定义生成基准时间轴页面可读取的投影 JSON，并登记到数据集清单。

投影 JSON 是页面运行层，不是最终结构化小说数据库。

## 2. 当前文件角色

| 文件或目录 | 角色 |
| --- | --- |
| `source/data/storyline-definitions/` | 结构化源定义。 |
| `source/scripts/build-storyline-preview-dataset.mjs` | 当前 C1-C14 预览数据生成脚本。 |
| `source/data/stories/*.json` | 页面可读取的基准时间轴投影数据集。 |
| `source/data/stories/index.json` | 数据集 manifest，下拉框读取入口。 |
| `source/data/schema.json` | 投影数据集 schema。 |

完整路径当前位于：

```text
原型包/2026-06-22-叙事验证工具-基准时间轴原型-v1/source/
```

## 3. 当前 C1-C14 生成链

当前 C1-C14 故事线分类预览使用：

```text
data/storyline-definitions/storylines-c1-c14-v0.1.json
```

生成：

```text
data/stories/story-c1-c14-storylines-preview-v0.1.json
```

并登记：

```text
data/stories/index.json
```

运行命令：

```powershell
cd "C:\CodexWorkSpace\CodexProject\HS-Novel-Editor\原型包\2026-06-22-叙事验证工具-基准时间轴原型-v1\source"
node scripts/build-storyline-preview-dataset.mjs
```

## 4. 新增投影数据集步骤

新增一份界面可用 JSON 时，按以下顺序：

1. 确认源材料和事件候选已通过人工确认。
2. 新建或更新源定义文件。
3. 生成投影 JSON。
4. 确认 `meta` 含有：

```json
{
  "datasetType": "narrativeTimelineProjection",
  "projectionTarget": "baselineTimeline",
  "modelVersion": "timeline-projection-v1"
}
```

5. 确认顶层字段包含：

```text
meta
timelineConfig
chapters
characters
tracks
events
```

6. 将数据集登记到 `data/stories/index.json`。
7. 运行校验脚本。
8. 打开页面下拉框确认可读取。

## 5. 手写与脚本生成的边界

允许 Codex 辅助手写源定义或候选表。

不推荐长期手写运行投影 JSON，原因：

- 字段多，容易遗漏。
- ID、颜色、人物目录和 manifest 容易漂移。
- 不利于重复生成和回归检查。

如果短期必须手写运行 JSON，必须：

1. 明确这是临时数据集。
2. 通过 schema 和校验脚本。
3. 登记到 manifest。
4. 后续补回源定义或生成链路。

## 6. 脚本职责边界

生成脚本负责：

- 补齐页面运行字段。
- 稳定生成 ID、章节、轨道、人物参与片段。
- 写入投影 JSON。
- 更新或检查 manifest。

生成脚本不负责：

- 判断事件是否成立。
- 替代用户确认。
- 改写小说正文。
- 把页面视图状态写回数据集。

## 7. 未来迁移提示

当正式 `app/` 数据入口完成后，应新增新的生成入口说明，并保留当前原型 `source/` 链路作为历史兼容路径。

迁移前不要删除当前 `source/data/stories/`，因为它仍是基准时间轴 V1 的运行事实源。
