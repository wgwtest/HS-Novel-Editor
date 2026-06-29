# P2.4.8 Canvas 渲染拆分实施记录

## 1. 目标

将 `app/src/main.js` 中的 Canvas 绘制函数、行布局、事件块裁剪和 hit region 构建移入 `app/src/timeline/renderer.js`，让主入口只负责组装依赖、状态调度和选择更新。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
| --- | --- | --- |
| Canvas 渲染模块 | `app/src/timeline/renderer.js` | 提供 `createTimelineRenderer`，封装 header、轨道、事件、章节选中列、文本裁剪和事件最小宽度显示。 |
| 主入口接线 | `app/src/main.js` | 导入 renderer，并通过工厂取得 `draw`。 |
| 模块边界校验 | `app/scripts/validate-module-boundaries.mjs` | 防止 `draw`、`drawHeader`、`drawTracks`、`drawEvents`、`eventDisplayRect` 等绘制函数回流到 `main.js`。 |
| 事件最小宽度校验 | `app/scripts/validate-event-min-width.mjs` | 改为括号配平提取函数，适配 renderer 工厂内部函数。 |

## 3. TDD 记录

RED：

```powershell
node scripts/validate-module-boundaries.mjs
```

失败原因：

```text
Missing module boundary file: src/timeline/renderer.js
```

GREEN：

- 新增 `app/src/timeline/renderer.js`。
- `main.js` 删除 Canvas 绘制函数，改为 `createTimelineRenderer(...)`。
- `validate-event-min-width.mjs` 更新为结构化函数提取。
- `npm run check` 全部通过。

## 4. 验证记录

### 4.1 机器校验

```powershell
npm run check
```

结果：

```text
App shell validation passed.
Formal entrypoint validation passed.
Module boundary validation passed.
Story dataset validation passed.
Character participation validation passed.
Axis mode validation passed.
Event min width validation passed.
Hit priority validation passed.
视觉编码规则校验通过。
View state management validation passed.
Wide canvas and two-axis drag validation passed.
```

### 4.2 浏览器校验

打开：

```text
http://127.0.0.1:4174/index.html?p248=1
```

验证结果：

- Canvas 尺寸为 `1487 x 913`。
- 采样区域非白像素数为 `576`，确认画布非空。
- 控制台 error 数量为 0。
- 点击画布事件块后 Inspector 显示 `Selected Story Event`。
- 选中事件标题为 `电视台确定皮革厂专题`。
- 坐标为 `07-05 09:30 -> 07-07 09:20 / C1`。

## 5. 当前结论

P2.4.8 已完成 Canvas 渲染拆分。当前 `main.js` 已从单文件原型职责收敛为应用组装、状态调度和选择更新入口。
