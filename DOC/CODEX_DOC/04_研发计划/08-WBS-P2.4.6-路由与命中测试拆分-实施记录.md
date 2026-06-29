# P2.4.6 路由与命中测试拆分实施记录

## 1. 目标

继续收窄 `app/src/main.js` 的职责，将 hash 初始化路由和 Canvas 命中测试拆到独立模块，降低后续拆 Canvas 渲染与事件绑定时的耦合风险。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
| --- | --- | --- |
| 初始路由模块 | `app/src/app/route.js` | 处理 `#event-selected`、`#chapter=...`、`#all-expanded`、`#zoomed` 等初始化入口。 |
| 命中测试模块 | `app/src/timeline/hit-test.js` | 提供 `createHitTester`，封装标签列优先命中和普通 region 命中。 |
| 主入口接线 | `app/src/main.js` | 导入 `applyInitialRoute` 和 `createHitTester`，保留选择调度。 |
| 模块边界校验 | `app/scripts/validate-module-boundaries.mjs` | 防止 `labelColumnHitTest`、`hitTest`、`applyInitialRoute` 回流到 `main.js`。 |

## 3. 非目标

本轮不拆：

- Canvas 绘制函数。
- hit region 构建。
- DOM 事件绑定总线。

这些职责仍留在 `main.js`，下一轮再拆。

## 4. TDD 记录

RED：

```powershell
node scripts/validate-module-boundaries.mjs
```

失败原因：

```text
Missing module boundary file: src/app/route.js
```

GREEN：

- 新增 `app/src/app/route.js`。
- 新增 `app/src/timeline/hit-test.js`。
- `main.js` 改为导入并调用模块。
- `npm run check` 全部通过。

## 5. 验证记录

### 5.1 机器校验

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

### 5.2 浏览器校验

路由初始化：

```text
http://127.0.0.1:4174/index.html?p246=1#event-selected
```

结果：

- Inspector 显示 `Selected Story Event`。
- 标题为 `第二天暗访与老妇暴起`。
- `拆解事件` 按钮启用。
- 控制台 error 数量为 0。

画布点击命中：

```text
http://127.0.0.1:4174/index.html?p246-click=1
```

点击画布事件块后结果：

- Inspector 显示 `Selected Story Event`。
- 标题为 `电视台确定皮革厂专题`。
- 坐标为 `07-05 09:30 -> 07-07 09:20 / C1`。
- 控制台 error 数量为 0。

## 6. 当前结论

P2.4.6 已完成路由与命中测试拆分。下一轮可继续拆 Canvas 绘制模型和 DOM 事件绑定。
