# CompositeMap · M2A 控制台（m2a-console）

**CompositeMap 的 M2A 客户端子项目**：把 `URxKB.R02.html` 与 `KBxM2A.R01.html` 两个单文件原型落成真实可用的独立 Next.js 子项目，复用 `tools/debug-console`（已废弃）的 LLM 管线。

- **`/urxkb`** — UR × KB 解释环：UR 提问 → LLM 调度中枢 → 调知识库工具（search / read_page / read_block…）→ 带 `[[...]]` 块级引用的最终答案。配置 `DEEPSEEK_API_KEY` 后连真实 KB。
- **`/kbxm2a`** — KB × M2A 执行环：备料（S 场景属性向量组 + 策略 + 锚点）↔ 回流（f1-f4 检测结果）两份 `.md` 的交换接口，落盘到 `data/exchanges/<scenario_id>/`。

> **与 CLAUDE.md 原则 1 的关系**：KB 核心（`scripts/`、`web/`）严禁内嵌 LLM；本子项目**作为 KB 的外部客户端存在**，所以可以引入 LLM SDK。它只通过 HTTP 调主管理台的 `POST /api/agent-tool`（只读工具白名单 + CSRF 防护），不直接读 markdown / `.cache/`。**删掉整个 `tools/` 目录不影响 KB 任何功能。**

## 启动

```bash
npm --prefix tools/m2a-console install            # 首次装依赖
cp tools/m2a-console/.env.example tools/m2a-console/.env   # 按需填 DEEPSEEK_API_KEY

cd tools/m2a-console
npm run dev         # 端口 3200
```

访问 [http://localhost:3200/urxkb](http://localhost:3200/urxkb)（解释环）与 [http://localhost:3200/kbxm2a](http://localhost:3200/kbxm2a)（执行环）。

> 需同时起主管理台 `web/`（`cd web && npm run dev`，端口 3006）才能真正查询知识库。未配 LLM key 时 `/urxkb` 回退演示数据。

## 与主站的契约

- **读**：`POST {KB_API_BASE}/api/agent-tool`（工具白名单：search / outline / read_page / read_section / read_block / backlinks / outlinks / list_* / health）。查询的 workspace 由 web 顶栏两个入口传入的 `?ws=` 决定（经 `kb_workspace` cookie 对齐）。
- **循环状态**：`GET/POST /api/loop-state`，服务端单例 + `data/loop-state.json` 持久化；UR×KB 与 KB×M2A 双界面同步。
- **.md 交换**：`GET/POST /api/exchange`，备料 / 回流落盘到 `data/exchanges/<scenario_id>/`（`.gitignore` 排除，不入库）。
- **写回 KB**：**不在本控制台发生**。回流 `.md` 是交给人类闸门的产物——由 `/kb-ingest` 流程（或人工在 web 管理台）经「UR 审阅 → 写回」四步回流，`approved_by: UR` / `reviewed_by: UR` 是闸门字段。控制台是 HTTP **读**客户端，不直写 wiki。

## 目录结构

```
lib/providers/*        LLM/agent provider 契约（复用 debug-console）
lib/agent-loop.ts      多轮 + 工具分发 + 【ANSWER】段 + 引用后验
lib/kb-http-client.ts  调 web /api/agent-tool（含 workspace cookie）
lib/m2a-domain.ts      8 步循环 / 四角色 / S 向量组 / f1-f4 / .md 生成（纯函数）
lib/loop-state.ts      服务端循环状态单例 + JSON 持久化
lib/exchange.ts        data/exchanges 备料/回流 .md 读写（仅 server）
app/urxkb/             UR × KB 界面
app/kbxm2a/            KB × M2A 界面
```

## 技术栈

Next.js 14 + TypeScript；纯 CSS 深色主题（继承原型）；provider 适配层（`lib/providers/`：DeepSeek / OpenAI 兼容 / 本地 Claude Code / Codex CLI）。
