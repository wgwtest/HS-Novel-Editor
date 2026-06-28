# 叙事验证工具 - 中心事件图谱与蓝图检查原型 v13

## 元信息

- 版本：v13
- 状态：供用户评审
- 继承版本：v12 事件树与事件检查工作台原型
- 目标画板：1920 x 1080
- 目标入口：`source/index.html`

## 调研结论

本轮不再自创“事件树”展示语言，而是参考成熟图谱和节点编辑器：

1. 知识图谱视角：Neo4j Bloom、Neo4j Browser 这类工具强调节点与关系的探索。我们的图谱页采用中心事件视角，左侧是来源事件，右侧是输出事件。
2. 节点图交互：React Flow 将图定义为 nodes + edges，并支持 source/target、handle、edge type、selection 等概念。我们的图谱节点保留连接端口和关系标签。
3. 有向图布局：Graphviz `rankdir=LR`、Dagre、ELK 都支持左到右的分层布局。我们的事件因果基本遵守时序，因此关系线应统一左到右。
4. 正交边路由：yFiles orthogonal routing 一类方案用水平/垂直线段连接节点，适合规整图形。我们的时间线关系层改为正交折线。
5. 蓝图/流程编辑：Rete.js、Node-RED、Unreal Blueprints 都把处理过程拆成节点、端口、连接。我们的事件页只借鉴这种表达，不做完整编程器。

## 三个视图

### 01-全局时间线正交关系层-1920x1080.png

时间线仍是默认首页。关系层只显示当前选中事件的输入和输出，并用从左到右的正交折线。

评审重点：

- 这种折线是否比 V12 的曲线箭头更符合事件时序。
- 关系层是否没有抢走故事线条本身的主视觉。
- 只显示选中事件周边关系是否足够。

### 02-中心事件知识图谱-1920x1080.png

该图不再叫事件树，而是中心事件知识图谱。中心节点是当前事件，左侧是来源事件，右侧是输出事件。

评审重点：

- 左来源、中中心、右输出是否比“树”更准确。
- 关系标签是否有助于说明为什么连接。
- 这个视图是否适合作为时间线之外的因果阅读模式。

### 03-蓝图式事件检查器-1920x1080.png

单事件页改为蓝图式检查器，用节点表达输入、触发条件、人物动作、冲突机制、动态变化和风险输出。

评审重点：

- 这种节点端口形式是否比表格/段落更适合表达事件内部结构。
- 事件检查是否被拆成了可编辑、可验证的对象。
- 是否避免过度像编程器，仍然服务小说事件检查。

## 查看方式

```text
source/index.html#timeline
source/index.html#graph
source/index.html#blueprint
```

## 非目标

- 不实现真实保存。
- 不接入真实图数据库。
- 不实现完整 React Flow / Rete.js。
- 不处理人物线详情页。
- 不全量显示所有事件连接。

## 参考来源

- Rete.js：视觉工作流、dataflow/control flow、节点编辑器。
- React Flow：node-based UI、handles、edges、selection、viewport。
- Graphviz：`rankdir=LR` 左到右有向图布局。
- AntV G6 Dagre：适合 DAG 的分层布局。
- ELK：方向、边路由、交叉减少等图布局配置。
- yFiles Orthogonal Layout：正交布局和直角边路由。
- Node-RED：浏览器里的 flow editor。
- Unreal Blueprints：节点、执行 pin、数据 pin、wire。

