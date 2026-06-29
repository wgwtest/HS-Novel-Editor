# P2.4.3 时间轴模型拆分实施记录

## 1. 目标

将 `app/src/main.js` 中的时间解析、时间轴投影和坐标换算逻辑拆入独立模块，降低 Canvas 绘制与轴模型之间的耦合。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
| --- | --- | --- |
| 时间轴几何模块 | `app/src/timeline/geometry.js` | 提供时间解析、格式化、真实时间轴投影、章节等宽轴投影、范围到屏幕坐标换算和章节引用计算。 |
| 主入口接线 | `app/src/main.js` | 通过 `createTimelineGeometry` 接收几何方法，保留现有绘制调用。 |
| 模块边界校验 | `app/scripts/validate-module-boundaries.mjs` | 防止 `createAxisProjection`、`axisRangeToScreen`、`parseTime` 等几何函数回流到 `main.js`。 |

## 3. 非目标

本轮不拆：

- Canvas 具体绘制函数。
- hit region 构建和命中测试。
- Inspector。
- DOM 事件绑定。

这些内容进入后续 P2.4.4 和 P2.4.5。

## 4. 验证记录

### 4.1 机器校验

在 `app/` 目录执行：

```powershell
npm run check
```

结果：

```text
App shell validation passed.
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
http://127.0.0.1:4174/index.html?p243=1
```

验证结果：

- 数据集下拉存在 3 个选项。
- Canvas 正常显示。
- Inspector 正常显示。
- 轴模式按钮状态可恢复。
- 控制台无 error。

## 5. 当前结论

P2.4.3 已完成时间轴模型层第一轮拆分。`main.js` 仍负责绘制和事件调度，但不再定义核心轴投影和时间几何函数。
