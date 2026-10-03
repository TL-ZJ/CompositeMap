# CompositeMap 改造需求说明

> 从「GitHub 下载的原版 compositemap」改造成「本项目知识库」的总体需求。
> 目标项目暂定名：**M2A 复合材料超声检测知识库**（下称"本项目 KB"，可整体替换）。

---

## 0. 文档信息

| 项 | 内容 |
|---|---|
| 文档目的 | 界定"把通用 compositemap 引擎改造成本项目 KB"要改什么、不改什么、如何验收 |
| 适用对象 | 执行改造的 agent / 开发者、审查改造结果的负责人 |
| 状态 | draft |
| 前置依据 | `CLAUDE.md`（行为规范唯一真相源）、`CompositeMap-设计文档.md`、现有 `workspaces/composites-ndt/` |

---

## 1. 背景与目标

**compositemap 是什么**：一套"markdown + Git 唯一真相源"的知识库引擎。引擎（`scripts/`、`web/`、`.claude/skills/`、`wiki/_templates/`）是**通用**的，数据按主题隔离在 `workspaces/<name>/` 下；随仓自带 3 个示例库（`smb-ecommerce`、`rag-evolution`、`ai-ml-demo`）。

**为什么改造**：引擎通用、可直接复用；但示例库与本项目无关，品牌名、默认 workspace、README、示例数据都是别人的。要变成"开箱即用、面向复材超声无损检测领域、可独立发布"的形态，需要一次有边界、可回滚、可验收的改造。

**改造总目标**：在不破坏引擎内核与数据契约的前提下，把 GitHub 版 compositemap 改造成——

1. 品牌/命名属于本项目；
2. 示例库被清理或替换为本项目自己的 workspace；
3. 默认值指向本项目；
4. 数据、文档、发布物符合本项目领域与开源合规要求；
5. 引擎测试与 KB 健康检查全部通过。

---

## 2. 改造总原则（约束，不可违反）

改造全程遵守 CLAUDE.md 的**核心设计原则**，并把"不破坏不变量"作为硬性边界：

- **不动内核**：不内嵌 LLM/agent runtime、不引入 embedding/向量/切片、保持"完整页面优先"。
- **不动契约层**：锚点算法、frontmatter schema、wikilink·anchor 语法、关系白名单（`RELATION_TYPES` 7 类）——除非走 CLAUDE.md「迁移四步法」。
- **raw/ 绝对只读**：改造只是搬移/清理示例数据，不修改任何 `raw/**` 原始文件；本项目 raw 文献默认不入库。
- **可复现、可回滚、可验收**：每一项需求都带验收标准（见第 8 节），改完能跑测试/健康检查证明没改坏。

---

## 3. 需求清单

### R1 品牌与命名

- **R1.1 引擎名策略（已决策：2026-10-02）**
  已选 **整体改名 → `CompositeMap`**（`GroundMap` → `CompositeMap`，`groundmap` → `compositemap`），Phase 1 已执行：`CLAUDE.md`/`AGENTS.md`/README/`web/package.json`/web 标题/i18n 品牌串等已同步改名，并跑 `TestMirrorSync` 确认镜像一致。
- **R1.2 web 端品牌**：站点 `<title>`、favicon、首页欢迎语改为本项目（引擎名可保留）；不硬编码 UI 文案，走 `web/lib/i18n.ts`。
- **R1.3 README**：重写为面向复材 NDT 领域——项目定位、快速开始（下载 → 初始化 workspace → 摄入第一篇）、目录约定、引用规范、如何贡献。

### R2 示例库与目录清理

- **R2.1 移除或替换 3 个示例 workspace**（`smb-ecommerce` / `rag-evolution` / `ai-ml-demo`）：
  - 本项目不需要它们 → 从仓库删除（真删这些"示例数据"目录，与"删除即标记"不冲突——那条原则针对 `wiki/` 知识页，不针对要下架的示例库）；
  - 若要留一个作最小示例，明确标记为 `#示例` 且**不参与默认 workspace 解析**。
- **R2.2 清理示例数据**：示例库连带 `raw/`、`exports/`、`my_thoughts/` 的示例内容一并移除；目录骨架可保留 `.gitkeep` 说明。
- **R2.3 引擎级示例页**：`wiki/_templates/` **保留**（所有 workspace 共用）；其余引擎级示例/归档页按需清理，并跑 `list-broken-refs` 确认无残留链接。

### R3 本项目 workspace 建立

- **R3.1 标准结构**：`workspaces/<本项目>/` 下建齐 `wiki/`、`raw/`、`exports/`、`my_thoughts/`、`.cache/`、`log.md`。
- **R3.2 raw/ 材料分目录**（沿用已定 9 类 + 通用）：
  ```
  raw/
  ├── 01-cfrp/ 02-gfrp/ 03-kfrp/          # 碳/玻/芳纶纤维复合材料
  ├── 04-honeycomb/ 05-foam-sandwich/      # 蜂窝/泡沫夹芯
  ├── 06-rubber/ 07-rubber-composite/      # 橡胶/橡胶复合材料
  ├── 08-cmc/ 09-cc/                       # 陶瓷基/碳碳
  └── _common/                             # 标准、通用规范（如 ISO 8203-2）
  ```
  各放 `.gitkeep`；原始文献由人放入，agent 只读。
- **R3.3 wiki/ 骨架**：建 `root_index` + 按材料/方法拆分的子 MOC（单一主题来源 > ~8 篇时拆分，防巨型索引）；接入已 ingest 的 7 页（3 source_summary + 3 concept + 1 index）。

### R4 配置与默认值

- **R4.1 默认 workspace**：由 `smb-ecommerce` 改为本项目（同步改 `scripts/k.py` 的默认解析 + `web` 的 `KB_WORKSPACE` 默认）。注意 release 约定"不设固定默认、自动选第一个"的差异，改造时二选一并对齐 web/k.py 两处口径。
- **R4.2 默认 locale**：保持 `zh`（当前 `web/lib/server-locale.ts` 已是 zh fallback）；如需英文默认则改 fallback。
- **R4.3 `KB_ROOT`**（如本项目是多项目复用场景）：默认指向本项目数据根；未设时保持"引擎根即数据根"的后向兼容。

### R5 数据与版权合规

- **R5.1 `raw/` 原始文献**（pdf/docx 等，多为受版权保护）**不入库、不随仓分发**——`.gitignore` 已排除其派生 `.md`/`.outline.json`；仅 `.gitkeep` 随仓。
- **R5.2 `my_thoughts/`** 不随仓分发，仅 `.gitkeep`。
- **R5.3 `wiki/`**（agent 维护的知识，含块级引用）随仓分发，作为开源内容——需保证其中不含个人隐私/私有路径/未授权第三版权内容（符合 CLAUDE.md「项目定位」）。
- **R5.4 示例数据**可公开分发，不引用未授权第三方内容。

### R6 发布与开源

- **R6.1 形成本项目独立 Git 仓库**：引擎（`scripts/`、`web/`、`.claude/skills/`、`wiki/_templates/`）+ 本项目 workspace（仅 `wiki/`）+ `docs/` + `scripts/tests/` + README + LICENSE。
- **R6.2 许可证**：保留 compositemap 原开源许可证与署名；本项目新增内容明确其许可。
- **R6.3 `.gitignore`**：覆盖 `raw/**` 原始与派生文件、`.cache/`、`my_thoughts/**`、临时转换目录等。
- **R6.4 双仓同步**（若沿用 dev↔release 模式）：遵守"不变量镜像"——引擎代码、`scripts/tests/`、`.claude/skills ↔ .agents/skills`、`web/` 逐字同步；dev 工作数据不镜像到 release。

### R7 文档

- **R7.1 快速开始**：下载 → 初始化本项目 workspace → 摄入第一篇文献的端到端步骤。
- **R7.2 领域说明**：复材 NDT 的 raw/ 材料分目录约定、引用规范、标准（ISO 8203-2 等）与案例的对应关系。
- **R7.3 改造说明**：即本文档，说明"从原版 compositemap 到本项目"改了什么、为什么、如何回滚。

---

## 4. 不变量清单（改造不得破坏）

以下任一被破坏都视作"改造失败"，必须回滚：

| 不变量 | 守护手段 |
|---|---|
| 5 条核心原则（不内嵌 LLM / 禁 embedding / 完整页面 / markdown+Git / raw 只读·删除即标记） | CLAUDE.md 行为规范 |
| `RELATION_TYPES` 白名单 7 类 | `TestRelationTypesSync`（k.py ↔ web/lib/markdown.ts） |
| `WIKILINK_RE` 正则 | `TestWikilinkRegexSync` |
| `CLAUDE.md ↔ AGENTS.md ↔ .claude/skills ↔ .agents/skills` 镜像 | `TestMirrorSync` |
| frontmatter schema / 锚点格式 / wikilink·anchor 语法 | `validate-frontmatter`、`list-broken-refs` |
| i18n `zh`↔`en` 同步 | `test_i18n_sync.py` |

---

## 5. 非目标（明确不做）

- ❌ 不修改锚点算法 / frontmatter schema / wikilink 语法（契约层；需改则走迁移四步）。
- ❌ 不新增 LLM 调用 / embedding / 向量检索。
- ❌ 不实现 KDH / 北大方正 CEB 等解码器。
- ❌ 不在本次改造中新增引擎功能（新子命令 / 新 lint 若需要，单独立项）。
- ❌ 不真删 `wiki/` 知识页（只允许 `status: deprecated`）。

---

## 6. 验收标准

| # | 验收项 | 通过判据 |
|---|---|---|
| A1 | 引擎测试 | `pytest scripts/tests/` 全过（含镜像/同步/i18n 守护） |
| A2 | KB 健康 | `python scripts/k.py --workspace <本项目> health --json` 硬性 lint 全 0（bare_claims / coarse_citations / source_issues / broken_refs / relation_issues 等） |
| A3 | 默认解析 | 不指定 workspace 时，CLI 与 web 均解析到本项目 workspace；无指向已删示例库的路径 |
| A4 | 无残留引用 | `list-broken-refs` 为空；grep 全仓无对 `smb-ecommerce`/`rag-evolution`/`ai-ml-demo` 的失效链接 |
| A5 | 品牌一致 | README / web 标题 / i18n 中品牌与项目名一致，无示例库品牌残留 |
| A6 | 合规 | `raw/`、`my_thoughts/` 不入库（`git ls-files` 不含原始文献）；`.gitignore` 生效 |
| A7 | 可回滚 | 改造以原子 commit 落库，`git revert` 可整体回退 |

---

## 7. 风险与注意事项

- **改名成本**：整体改名需同步大量镜像引用并过 `TestMirrorSync`，容易漏；建议保留引擎名、只在 workspace 名与 README/web 文案体现品牌。
- **默认 workspace 改动连带**：改 `k.py` 与 `web` 两处口径要一致，否则 CLI 与 web 行为漂移。
- **清理示例库破坏测试**：删除示例库前先确认 `scripts/tests/` 里没有以其为夹具的用例；有则同步改夹具。
- **raw 只读边界**：改造中的"清理示例数据"只针对要下架的示例库目录，不触碰本项目 `raw/**` 内的真实文献。
