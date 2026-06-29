# P2.4.5 正式入口切换实施记录

## 1. 目标

将 HS-Novel-Editor 的正式运行入口从历史原型包切换到 `app/`，并用机器校验防止启动指南、README、事实源索引和交接文档重新指向原型目录。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
| --- | --- | --- |
| 正式入口校验 | `app/scripts/validate-formal-entrypoint.mjs` | 校验 `CODEX_START_HERE.md`、`README.md`、`DOC/CODEX_DOC/README.md`、事实源索引和交接说明均指向 `app/`。 |
| 检查入口 | `app/package.json` | 将正式入口校验接入 `npm run check`。 |
| 启动指南 | `CODEX_START_HERE.md` | 将启动命令切换为 `cd app` 与 `npm run dev`，运行 URL 切换为 `4174`。 |
| 仓库 README | `README.md` | 将当前正式主页面改为 `app/index.html`。 |
| 工程文档入口 | `DOC/CODEX_DOC/README.md` | 将当前运行实现改为 `app/`。 |
| 事实源索引 | `DOC/CODEX_DOC/02_设计说明/00-设计事实源索引.md` | 明确 `app/index.html` 是当前正式运行入口，原型包为历史行为基线。 |
| 交接说明 | `CURRENT_HANDOFF.md` | 将浏览器入口和源码入口切到 `app/`。 |
| 机测记录 | `DOC/CODEX_DOC/06_测试文档/03_机测记录/2026-06-30-003538-入口切换与工程化改造-机测记录.md` | 记录本轮静态、运行时和浏览器验证证据。 |

## 3. TDD 记录

RED：

```powershell
npm run check
```

失败原因：

```text
Error: CODEX_START_HERE.md must name app/index.html as the current formal page.
```

GREEN：

- 更新启动指南、README、正式文档入口、事实源索引和交接说明。
- 保留原型包定位为历史行为基线和视觉回归基线。

## 4. 验证记录

在 `app/` 目录执行：

```powershell
npm run check
```

预期结果：

```text
Formal entrypoint validation passed.
Module boundary validation passed.
Story dataset validation passed.
...
```

浏览器入口：

```text
http://127.0.0.1:4174/index.html
```

## 5. 当前结论

P2.4.5 完成后，`app/` 是当前正式运行入口；原型包只保留为历史对照，不再承接产品功能开发。
