# P2.4.7 DOM 事件绑定拆分实施记录

## 1. 目标

将 `app/src/main.js` 中的 DOM 事件绑定拆入 `app/src/app/event-bindings.js`，让主入口只负责组装依赖和启动流程。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
| --- | --- | --- |
| 事件绑定模块 | `app/src/app/event-bindings.js` | 绑定 Canvas wheel/pointer、缩放控件、轴模式、数据集切换、宽屏、重置状态、详情入口和 resize。 |
| 主入口接线 | `app/src/main.js` | 通过 `bindAppEvents` 注入状态、动作、DOM 和回调。 |
| 模块边界校验 | `app/scripts/validate-module-boundaries.mjs` | 防止 `main.js` 继续直接 `.addEventListener(...)`。 |

## 3. TDD 记录

RED：

```powershell
node scripts/validate-module-boundaries.mjs
```

失败原因：

```text
Missing module boundary file: src/app/event-bindings.js
```

GREEN：

- 新增 `app/src/app/event-bindings.js`。
- `main.js` 改为调用 `bindAppEvents`。
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
http://127.0.0.1:4174/index.html?p247=1
```

画布点击事件块后：

- Inspector 显示 `Selected Story Event`。
- 标题为 `电视台确定皮革厂专题`。
- 控制台 error 数量为 0。

打开：

```text
http://127.0.0.1:4174/index.html?p247-wide=1
```

点击 `宽屏` 按钮后：

- 按钮文本变为 `定宽`。
- `.frame` 包含 `wide-mode`。
- 路由状态显示 `宽屏模式`。
- 控制台 error 数量为 0。

## 5. 当前结论

P2.4.7 已完成 DOM 事件绑定拆分。下一轮可继续拆 Canvas 绘制模型和 hit region 构建。
