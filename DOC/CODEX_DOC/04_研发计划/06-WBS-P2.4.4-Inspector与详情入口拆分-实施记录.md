# P2.4.4 Inspector 与详情入口拆分实施记录

## 1. 目标

将 `app/src/main.js` 中的 Inspector 渲染、摘要面板更新和详情入口控制拆入独立模块，避免主入口继续同时承担数据加载、状态、几何、绘制和右侧面板职责。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
| --- | --- | --- |
| Inspector 控制器 | `app/src/inspector/inspector-controller.js` | 提供空选择、事件、故事线、人物条、章节等 Inspector 更新函数，以及事件详情和章节详情入口控制。 |
| 主入口接线 | `app/src/main.js` | 通过 `createInspectorController` 注入章节、事件、轨道、状态、时间格式化和 DOM 依赖。 |
| 模块边界校验 | `app/scripts/validate-module-boundaries.mjs` | 防止 `updateInspectorEvent`、`updateInspectorChapter`、`hideDetails` 等面板职责回流到 `main.js`。 |
| 校验聚合 | `app/scripts/app-validation-helpers.mjs` | 将 Inspector 控制器纳入应用源码扫描范围。 |

## 3. 非目标

本轮不拆：

- Canvas 绘制函数。
- hit region 构建与命中测试。
- DOM 事件绑定总线。
- 页面布局或样式。

这些内容继续保留在 `main.js`，后续按解耦计划逐步拆分。

## 4. TDD 记录

RED：

```powershell
node scripts/validate-module-boundaries.mjs
```

失败原因：

```text
Missing module boundary file: src/inspector/inspector-controller.js
```

GREEN：

- 新增 `app/src/inspector/inspector-controller.js`。
- `main.js` 改为导入并创建 `createInspectorController`。
- 删除 `main.js` 内部的 Inspector 渲染和详情入口函数定义。

## 5. 验证记录

### 5.1 机器校验

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

### 5.2 浏览器校验

打开：

```text
http://127.0.0.1:4174/index.html?p244=1
```

验证结果：

- 页面标题为 `叙事验证工具 基准时间轴原型 V1`。
- 数据集下拉存在 3 个选项。
- Canvas 和 Inspector 正常显示。
- 控制台 error 数量为 0。
- 点击画布事件块后，Inspector 切换到 `Selected Story Event`。
- 选中事件标题为 `电视台确定皮革厂专题`。
- `拆解事件` 按钮启用，`进入章节函数` 按钮保持禁用。

## 6. 当前结论

P2.4.4 已完成 Inspector 与详情入口的第一轮拆分。`main.js` 仍负责选择调度和事件绑定，但不再直接定义 Inspector 面板渲染函数。
