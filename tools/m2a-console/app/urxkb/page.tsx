"use client";

import { useRef, useState } from "react";
import { RoleBadges } from "@/components/RoleBadges";
import { LoopBar } from "@/components/LoopBar";

// ── 类型 ────────────────────────────────────────────────
type Step = [string, string];

interface ProcessOutput {
  id: number;
  type: "mermaid" | "table";
  title: string;
  record: boolean;
  content?: string; // mermaid 源码
  headers?: string[];
  rows?: string[][];
}

interface Round {
  q: string;
  steps: Step[];
  ans: string;
  reasoning?: string;
  streaming?: boolean;
}

// ── 演示数据（首次加载展示；接真实 LLM 后替换）───────────
const DEMO_PROCESS_OUTPUTS: ProcessOutput[] = [
  {
    id: 1,
    type: "mermaid",
    title: "复材结构件无损检测方法选择（线框图）",
    record: true,
    content: `flowchart TD
  A["UR 提问：复材结构件无损检测"] --> B{"检测对象分类"}
  B -->|"分层 / 脱粘"| C["超声检测（含相控阵）"]
  B -->|"内部空隙 / 夹杂"| D["X 射线 / CT"]
  B -->|"表面 / 近表面"| E["红外热波 / 声发射"]
  C --> F["最终答案：方法清单 + 引用"]
  D --> F
  E --> F`,
  },
  {
    id: 2,
    type: "table",
    title: "无损检测方法对比",
    record: true,
    headers: ["方法", "检测对象", "分辨率", "优点", "局限"],
    rows: [
      ["超声（含相控阵）", "分层 / 脱粘", "mm 级", "对分层敏感、便携", "需耦合剂"],
      ["X 射线 / CT", "空隙 / 夹杂", "0.1 mm – μm", "直观成像", "成本高、有辐射"],
      ["红外热波 / 声发射", "表面 / 近表面", "cm 级", "大面积快速", "深度有限"],
    ],
  },
];

const DEMO_ROUNDS: Round[] = [
  {
    q: "碳纤维复合材料结构件有哪些主流的无损检测方法？",
    steps: [
      ["INTENT", "解析问题：识别「碳纤维复合材料」「无损检测」两个实体，查方法清单"],
      ["SEARCH", "search「碳纤维 无损检测」→ 命中 12 条"],
      ["READ", "read_page wiki/concepts/复材无损检测 + 3 篇 source_summary"],
      ["TOOL", "检测到 1 处 .mermaid → 已生成线框图（见「过程输出」）"],
      ["ANSWER", "汇总方法清单"],
    ],
    ans: "碳纤维复合材料结构件主流的无损检测方法包括：超声检测（含相控阵）、X 射线 / CT、红外热波、声发射等。其中超声检测对层间分层最敏感 [[wiki/concepts/复材无损检测#超声]]；X 射线 / CT 适合内部空隙与夹杂 [[raw/papers/阚仁峰#^p-3-abc123]]。",
  },
  {
    q: "X 射线检测的分辨率极限大约是多少？",
    steps: [
      ["INTENT", "单点事实：X 射线检测分辨率极限"],
      ["SEARCH", "search「X射线 分辨率」→ 命中 5 条"],
      ["READ", "read_block raw/papers/阚仁峰#^p-7-def456"],
      ["ANSWER", "给出数值 + 引用"],
    ],
    ans: "常规工业 X 射线 DR 的分辨率约在 0.1–0.5 mm 量级，微焦点 CT 可达 μm 级 [[raw/papers/阚仁峰#^p-7-def456]]。",
  },
];

const STEP_COLOR: Record<string, string> = {
  INTENT: "s-intent",
  SEARCH: "s-search",
  READ: "s-read",
  EVAL: "s-eval",
  ANSWER: "s-answer",
  TOOL: "s-tool",
};

// ── 工具函数 ────────────────────────────────────────────
function renderAns(ans: string) {
  const parts = ans.split(/(\[\[[^\[\]]+\]\])/g);
  return parts.map((p, i) =>
    p.startsWith("[[") && p.endsWith("]]") ? (
      <span key={i} className="cite">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function stepHtml(steps: Step[]) {
  return (
    <div className="flow">
      {steps.map((s, i) => {
        const [t, d] = s;
        const cls = STEP_COLOR[t] || "s-tool";
        return (
          <span key={i} style={{ display: "flex", alignItems: "stretch" }}>
            {i > 0 ? <span className="arrow">→</span> : null}
            <span className="step">
              <span className={`st ${cls}`}>{t}</span>
              <div className="d">{d}</div>
            </span>
          </span>
        );
      })}
    </div>
  );
}

function readWorkspace(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("ws") ?? undefined;
}

interface ProviderInfo {
  id: string;
  available: boolean;
  is_agent: boolean;
  models: string[];
}

async function pickProvider(): Promise<{ id: string; model: string } | null> {
  try {
    const r = await fetch("/api/providers");
    const j = (await r.json()) as { providers?: ProviderInfo[] };
    const usable = (j.providers ?? []).find((p) => !p.is_agent && p.available);
    if (usable) return { id: usable.id, model: usable.models[0] || "deepseek-flash" };
  } catch {
    /* fallthrough */
  }
  return null;
}

async function streamChat(
  body: Record<string, unknown>,
  onEvent: (evt: Record<string, unknown>) => void,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`chat http_${res.status}`);
  }
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const line = chunk.trim();
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6);
      try {
        const evt = JSON.parse(json) as Record<string, unknown>;
        if (evt.kind === "stream-end") return;
        onEvent(evt);
      } catch {
        /* 忽略坏行 */
      }
    }
  }
}

// ── 页面 ────────────────────────────────────────────────
export default function UrxkbPage() {
  const [processOutputs, setProcessOutputs] = useState<ProcessOutput[]>(DEMO_PROCESS_OUTPUTS);
  const [rounds, setRounds] = useState<Round[]>(DEMO_ROUNDS);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [mainThread, setMainThread] = useState<string | null>(null);
  const [, force] = useState(0);
  const bump = () => force((v) => v + 1);
  const roundsRef = useRef(rounds);
  roundsRef.current = rounds;

  function toggleRecord(id: number, checked: boolean) {
    setProcessOutputs((prev) =>
      prev.map((it) => (it.id === id ? { ...it, record: checked } : it)),
    );
  }

  async function ask() {
    const q = input.trim();
    if (!q) return;
    setInput("");

    const round: Round = { q, steps: [], ans: "", reasoning: "", streaming: true };
    roundsRef.current = [...roundsRef.current, round];
    setRounds(roundsRef.current);
    bump();

    const provider = await pickProvider();
    if (!provider) {
      round.steps = [
        ["INTENT", "解析问题，识别关键实体与期望答案粒度"],
        ["SEARCH", "search 关键词（未配置 LLM provider，展示演示回复）"],
        ["READ", "read_page 相关页面（演示：未连接真实 KB）"],
        ["ANSWER", "组织答案并附引用"],
      ];
      round.ans =
        "这是演示环境（未配置 LLM provider）下的一条示例回复。配置 DEEPSEEK_API_KEY 后，这里会返回带 [[...]] 块级引用的真实答案 [Agent 推断]。";
      round.streaming = false;
      bump();
      return;
    }

    try {
      await streamChat(
        {
          provider: provider.id,
          model: provider.model,
          messages: [{ role: "user", text: q }],
          workspace: readWorkspace(),
        },
        (evt) => {
          const kind = evt.kind as string;
          if (kind === "text-delta") {
            round.ans += String(evt.text ?? "");
          } else if (kind === "reasoning-delta") {
            round.reasoning = (round.reasoning ?? "") + String(evt.text ?? "");
          } else if (kind === "tool-call") {
            round.steps.push(["TOOL", `调用 ${String(evt.name)}`]);
          } else if (kind === "tool-result") {
            const last = round.steps[round.steps.length - 1];
            if (last && last[0] === "TOOL" && !last[1].includes("✓") && !last[1].includes("✗")) {
              last[1] += evt.ok ? " ✓" : " ✗";
            }
          } else if (kind === "status") {
            round.steps.push(["EVAL", String(evt.text ?? "")]);
          }
          bump();
        },
      );
    } catch (e) {
      round.ans += `\n\n（流式出错：${e instanceof Error ? e.message : String(e)}）`;
    }
    round.streaming = false;
    bump();
  }

  function buildMd(): string {
    const iso = new Date().toISOString().slice(0, 10);
    const L: string[] = [];
    L.push("# UR × KB 多轮交流记录");
    L.push("");
    L.push("> 由「UR × KB 交流界面」导出，供 M2A 读取。");
    L.push("");
    L.push("| 字段 | 值 |");
    L.push("|---|---|");
    L.push(`| 日期 | ${iso} |`);
    L.push("| workspace | papers（演示）|");
    L.push("| 角色 | 使用者 UR / LLM / KB / M2A |");
    L.push("");
    const rec = processOutputs.filter((it) => it.record);
    if (rec.length) {
      L.push("## 过程输出（已记录）");
      L.push("");
      rec.forEach((it) => {
        L.push(`### ${it.title}`);
        L.push("");
        if (it.type === "mermaid") {
          L.push("```mermaid");
          L.push(it.content || "");
          L.push("```");
        } else if (it.headers && it.rows) {
          L.push(`| ${it.headers.join(" | ")} |`);
          L.push(`| ${it.headers.map(() => "---").join(" | ")} |`);
          it.rows.forEach((r) => L.push(`| ${r.join(" | ")} |`));
        }
        L.push("");
      });
    }
    rounds.forEach((r, i) => {
      L.push(`## 第 ${i + 1} 轮`);
      L.push("");
      L.push("### 问");
      L.push(r.q);
      L.push("");
      L.push("### 推理步骤");
      r.steps.forEach((s) => L.push(`- **${s[0]}**：${s[1]}`));
      L.push("");
      L.push("### 最终答案");
      L.push(r.ans);
      L.push("");
    });
    L.push("---");
    L.push("*（说明：推理图与 mermaid 线框图可在 M2A 端渲染为图。）*");
    return L.join("\n");
  }

  function download(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onImportFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMainThread(String(reader.result ?? ""));
    reader.readAsText(file, "utf-8");
  }

  return (
    <>
      <header>
        <div className="brand">
          UR × KB <span className="dot">·</span> 交流界面 <span className="ver">R02</span>
        </div>
        <nav className="navlinks">
          <a className="on">URxKB · 解释环</a>
          <a href="/kbxm2a">KBxM2A · 执行环</a>
        </nav>
        <RoleBadges
          order={["UR", "LLM", "KB", "M2A"]}
          demo={readWorkspace() ? undefined : "演示数据 · 未连接真实 KB"}
        />
      </header>

      <LoopBar />

      <div className="layout">
        <main>
          <div className="scroll">
            {/* 1. 过程输出 */}
            <div className="block">
              <div className="block-h">
                <span className="idx">1</span> 过程输出 · 图 / 表
                <span
                  style={{ textTransform: "none", letterSpacing: 0, color: "var(--muted)", fontSize: 11 }}
                >
                  （对话中产生的线框图 / 表格；UR 决定是否记录，导出时只带走勾选项）
                </span>
              </div>
              <div className="block-b">
                {processOutputs.map((it) => (
                  <div className="po-item" key={it.id}>
                    <div className="po-head">
                      <span className={`po-type ${it.type === "mermaid" ? "t-mmd" : "t-tbl"}`}>
                        {it.type === "mermaid" ? "mermaid · 线框图" : "表格"}
                      </span>
                      <span className="po-title">{it.title}</span>
                      <label className="po-record">
                        <input
                          type="checkbox"
                          checked={it.record}
                          onChange={(e) => toggleRecord(it.id, e.target.checked)}
                        />{" "}
                        记录
                      </label>
                    </div>
                    <div className="po-body">
                      {it.type === "mermaid" ? (
                        <>
                          <pre>{it.content}</pre>
                          <div className="note">
                            （mermaid 源码，可在 M2A 端按 adds_on_01 渲染为线框图）
                          </div>
                        </>
                      ) : (
                        <table className="tbl">
                          <thead>
                            <tr>
                              {it.headers?.map((h) => (
                                <th key={h}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {it.rows?.map((r, ri) => (
                              <tr key={ri}>
                                {r.map((c, ci) => (
                                  <td key={ci}>{c}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 对话记录 + 推理图 */}
            <div className="block">
              <div className="block-h">
                <span className="idx">2</span> [01] 对话记录 + [02] 推理图
              </div>
              <div className="block-b">
                {rounds.map((r, i) => (
                  <div key={i}>
                    <div className="msg user">
                      <div className="who user">
                        <span className="pill">使用者</span>
                      </div>
                      <div className="body">
                        <div className="q">{r.q}</div>
                      </div>
                    </div>
                    <div className="msg llm">
                      <div className="who llm">
                        <span className="pill">LLM</span>
                      </div>
                      <div className="body">
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                          [02] 推理图
                        </div>
                        {stepHtml(r.steps)}
                        {r.reasoning ? (
                          <div className="reasoning">
                            <div className="h">思考过程</div>
                            <pre>{r.reasoning}</pre>
                          </div>
                        ) : null}
                        <div className="answer">
                          <div className="h">
                            最终答案 · 【ANSWER】{r.streaming ? "（生成中…）" : ""}
                          </div>
                          <p>{renderAns(r.ans)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="inputbar">
            <input
              value={input}
              placeholder="向 KB 提问…（配置 DEEPSEEK_API_KEY 后连真实 KB）"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask();
              }}
            />
            <button className="btn" onClick={ask}>
              发送
            </button>
          </div>
        </main>

        {/* M2A 侧栏 */}
        <aside className="m2a">
          <div>
            <h2>KB × M2A · .md 交换</h2>
            <div className="card">
              <div className="t">
                <span className="ic">↓</span> 备料 → M2A（导出 .md）
              </div>
              <div className="d">
                把「过程输出（已记录）+ 对话记录 + 推理图 + 最终答案」整理成一个 .md 输出给 M2A。
              </div>
              <div className="btns">
                <button
                  className="btn amber"
                  onClick={() =>
                    download(buildMd(), `URxKB_交流记录_${new Date().toISOString().slice(0, 10)}.md`)
                  }
                >
                  生成并下载 .md
                </button>
                <button className="btn ghost" onClick={() => setPreview(buildMd())}>
                  仅预览
                </button>
              </div>
            </div>
            <div className="card">
              <div className="t">
                <span className="ic">↑</span> M2A 回流 → KB（导入 .md）
              </div>
              <div className="d">导入一个来自 M2A 的 .md 文件，作为本轮多轮追问的「主线」。</div>
              <div className="btns">
                <label className="btn" style={{ display: "inline-block", cursor: "pointer" }}>
                  选择 .md 文件
                  <input
                    type="file"
                    accept=".md,.markdown,text/markdown,text/plain"
                    style={{ display: "none" }}
                    onChange={(e) => onImportFile(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2>主线（来自 M2A）</h2>
            <div className="mainthread">
              <div className="t">M2A 报告 · 主线</div>
              {mainThread === null ? (
                <div className="empty">尚未导入。导入的 M2A .md 会作为后续追问的主线显示在这里。</div>
              ) : (
                <pre>{mainThread}</pre>
              )}
            </div>
          </div>

          <div>
            <h2>导出结构（R02）</h2>
            <div className="card" style={{ fontSize: 12, color: "var(--muted)" }}>
              <span className="mono"># UR×KB 多轮交流记录</span>
              <br />
              元信息
              <br />
              <b style={{ color: "var(--text)" }}>过程输出（已记录）</b>：mermaid 线框图 + 表格
              <br />
              每轮：问 → 推理步骤 → 最终答案 → 引用
            </div>
          </div>
        </aside>
      </div>

      {/* 预览弹层 */}
      {preview !== null ? (
        <div className="overlay" onClick={() => setPreview(null)}>
          <div className="dlg" onClick={(e) => e.stopPropagation()}>
            <div className="dlg-h">
              <h3>导出的 .md（预览）</h3>
              <button className="x" onClick={() => setPreview(null)}>
                ✕
              </button>
            </div>
            <pre>{preview}</pre>
          </div>
        </div>
      ) : null}
    </>
  );
}
