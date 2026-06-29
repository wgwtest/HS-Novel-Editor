# P2.4.2 数据与状态层拆分实施记录

## 1. 目标

将 `app/src/main.js` 中的数据读取和本地状态持久化逻辑拆入独立模块，减少主入口承担的职责。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
| --- | --- | --- |
| 数据模块 | `app/src/data/story-loader.js` | 负责投影数据集 manifest、单个数据集、旧数据 fallback 的读取和 manifest 校验。 |
| 状态模块 | `app/src/state/persisted-state.js` | 负责状态 key、版本、归一化、localStorage 读写和数据集状态增删查。 |
| 模块边界校验 | `app/scripts/validate-module-boundaries.mjs` | 确认数据与状态模块存在，且 `main.js` 不再直接访问 `localStorage` 或裸 `fetch`。 |
| 校验 helper | `app/scripts/app-validation-helpers.mjs` | 将静态校验的源码读取范围扩展到 `src/data/` 和 `src/state/`。 |

## 3. 非目标

本轮不拆：

- 时间轴几何与 Canvas 绘制。
- 命中测试。
- Inspector。
- DOM 事件绑定。
- 正式入口切换。

这些内容进入 P2.4.3、P2.4.4 和 P2.4.5。

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
http://127.0.0.1:4174/index.html?p242=1
```

验证结果：

- 数据集下拉存在 3 个选项。
- 页面可加载已持久化的数据集状态。
- Canvas 和 Inspector 正常显示。
- 控制台无 error。
- 宽屏状态可由持久化状态恢复。

## 5. 当前结论

P2.4.2 已完成第一层拆分：数据读取和状态持久化不再散落在 `main.js` 中。`main.js` 仍保留页面调度、绘制、命中测试和 Inspector，后续继续拆分。
