"use client";

import { useEffect, useState } from "react";
import { RoleBadges } from "@/components/RoleBadges";
import { LoopBar } from "@/components/LoopBar";
import { NoiseWaveform } from "@/components/kbxm2a/NoiseWaveform";
import {
  buildBeiLiaoMd,
  buildHuiLiuMd,
  DEFAULT_S,
  DEFAULT_STRATEGY,
  DEFAULT_ANCHORS,
  DEFAULT_RESULT,
  DEFAULT_MATERIAL,
  F1_F4_KEYS,
} from "@/lib/m2a-domain";

interface ExchangeEntry {
  scenario_id: string;
  type: "备料" | "回流";
  relpath: string;
}

function localId(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `S-${d.getFullYear()}-${p(d.getMonth() + 1)}${p(d.getDate())}-01`;
}

function download(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Kbxm2aPage() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [entries, setEntries] = useState<ExchangeEntry[]>([]);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState<{ title: string; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/exchange", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { next_id?: string; entries?: ExchangeEntry[] }) => {
        if (j.next_id) setScenarioId(j.next_id);
        setEntries(j.entries ?? []);
      })
      .catch(() => {
        /* 忽略 */
      });
  }, []);

  const id = scenarioId ?? localId();
  const beiLiaoMd = buildBeiLiaoMd({
    scenarioId: id,
    material: DEFAULT_MATERIAL,
    s: DEFAULT_S,
    strategy: DEFAULT_STRATEGY,
    anchors: DEFAULT_ANCHORS,
  });
  const huiLiuMd = buildHuiLiuMd({ scenarioId: id, r: DEFAULT_RESULT });

  async function saveAndDownload(type: "备料" | "回流", content: string) {
    const sid = scenarioId ?? localId();
    setStatus(`正在保存 ${type} .md …`);
    try {
      const r = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, scenario_id: sid, content }),
      });
      const j = (await r.json()) as { ok?: boolean; relpath?: string; error?: string };
      if (j.ok) {
        setStatus(`已保存 → data/exchanges/${j.relpath}`);
        // 刷新列表
        const lr = await fetch("/api/exchange", { cache: "no-store" });
        const lj = (await lr.json()) as { entries?: ExchangeEntry[] };
        setEntries(lj.entries ?? []);
      } else {
        setStatus(`保存失败：${j.error ?? "未知错误"}`);
      }
    } catch (e) {
      setStatus(`保存失败：${e instanceof Error ? e.message : String(e)}`);
    }
    download(content, `${type === "备料" ? "备料_场景属性" : "回流_检测结果"}_${sid}.md`);
  }

  const fRows = F1_F4_KEYS.map((k) => [k.name, String(DEFAULT_RESULT[k.key]), k.unit] as const);

  return (
    <>
      <header>
        <div className="brand">
          KB × M2A <span className="dot">·</span> 交换接口 <span className="ver">R01</span>
        </div>
        <nav className="navlinks">
          <a href="/urxkb">URxKB · 解释环</a>
          <a className="on">KBxM2A · 执行环</a>
        </nav>
        <RoleBadges order={["KB", "LLM", "M2A", "UR"]} demo={`scenario_id: ${id}`} />
      </header>

      <LoopBar />

      <div className="subbar">
        <span>
          两个环共享 <b>同一个 LLM</b> 调度中枢；S 在解释环与执行环之间流转
        </span>
        <span className="flow">
          出发原点 → 备料 .md → M2A B1/B2 → 回流 .md → 解读写回 KB → UR 审阅 → 反哺 S-模板 ⭯
        </span>
      </div>

      <div className="cols">
        {/* ════════ 左：KB → M2A 备料 ════════ */}
        <section className="col col-kb">
          <h2>
            <span className="dir to-m2a">KB → M2A</span> 备料（导出 .md）
          </h2>

          <div className="block" style={{ borderColor: "var(--accent)" }}>
            <div className="block-h">
              <span className="idx" style={{ color: "var(--accent)" }}>⓪</span> 出发原点 · 冷启动
              <span
                style={{
                  marginLeft: "auto", fontSize: 10, color: "var(--accent)",
                  border: "1px solid var(--accent)", borderRadius: 6, padding: "1px 6px",
                }}
              >
                循环迭代 ⭯
              </span>
            </div>
            <div className="block-b">
              <p className="kv"><span className="k">时机</span> <span className="v">首次实施 B1 数据分析前</span></p>
              <p className="kv"><span className="k">动作</span> <span className="v">KB + LLM 生成 <b>S</b> + 噪声 A-scan 波形 + 量化描述</span></p>
              <NoiseWaveform />
              <div style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 8px" }}>
                噪声 A-scan 波形（生成 · 冷启动）
              </div>
              <table className="tbl">
                <tbody>
                  <tr><th>量化维度</th><th>描述</th></tr>
                  <tr><td>幅度</td><td>最大 12 mV · RMS 3.1 mV</td></tr>
                  <tr><td>时间</td><td>TOF 11.2 μs · 脉宽 1.8 μs</td></tr>
                  <tr><td>频域</td><td>主频 5.0 MHz · 带宽 2.1 MHz</td></tr>
                  <tr><td>统计</td><td>高斯噪声 · σ = 3.0 mV</td></tr>
                </tbody>
              </table>
              <p className="kv" style={{ marginTop: 8 }}>
                <span className="k">冷启动机制</span>{" "}
                <span className="v">经典仿真（ground truth）生成；真实数据累积后 DL 噪声模型接管、越来越准</span>
              </p>
            </div>
          </div>

          <div className="block">
            <div className="block-h"><span className="idx">①</span> 场景属性 S-实例（解释环产出）</div>
            <div className="block-b">
              <p className="kv"><span className="k">A 工件属性</span></p>
              <p className="kv"><span className="k">· A1 原材料</span> <span className="v enum">{DEFAULT_S.A.A1}</span></p>
              <p className="kv"><span className="k">· A2 粘接工艺</span> <span className="v">{DEFAULT_S.A.A2}</span></p>
              <p className="kv"><span className="k">· A3 加工工艺</span> <span className="v">{DEFAULT_S.A.A3}</span></p>
              <p className="kv"><span className="k">· A4 成型固化</span> <span className="v">{DEFAULT_S.A.A4}</span></p>
              <p className="kv" style={{ marginTop: 8 }}><span className="k">B 影像属性</span></p>
              <p className="kv"><span className="k">· B1 探头</span> <span className="v">{DEFAULT_S.B.B1}</span></p>
              <p className="kv"><span className="k">· B2 采集器模拟</span> <span className="v">{DEFAULT_S.B.B2}</span></p>
              <p className="kv"><span className="k">· B3 数字化</span> <span className="v">{DEFAULT_S.B.B3}</span></p>
              <p className="kv" style={{ marginTop: 8 }}><span className="k">C… 开放</span> <span className="v">（未来可加）</span></p>
            </div>
          </div>

          <div className="block">
            <div className="block-h"><span className="idx">②</span> 策略建议（LLM 推荐 · UR 决策）</div>
            <div className="block-b">
              <p className="kv"><span className="k">滤波器</span> <span className="v">{DEFAULT_STRATEGY.filter}</span> <span className="pill-rec">LLM 推荐</span></p>
              <p className="kv"><span className="k">DL 噪声架构</span> <span className="v">{DEFAULT_STRATEGY.dlArch}</span> <span className="pill-rec">LLM 推荐</span></p>
              <p className="kv" style={{ marginTop: 6 }}><span className="k">依据</span> <span className="cite">{DEFAULT_STRATEGY.basis}</span></p>
            </div>
          </div>

          <div className="block">
            <div className="block-h"><span className="idx">③</span> 领域知识锚点（可溯源）</div>
            <div className="block-b">
              {DEFAULT_ANCHORS.map((a) => (
                <p className="kv" key={a}><span className="cite">{a}</span></p>
              ))}
            </div>
          </div>

          <button className="btn amber" style={{ width: "100%" }} onClick={() => saveAndDownload("备料", beiLiaoMd)}>
            生成并下载备料 .md
          </button>
          <div className={`statusline${status.startsWith("保存失败") ? " warn" : ""}`}>{status}</div>
        </section>

        {/* ════════ 中：LLM 同一中枢 ════════ */}
        <section className="col col-llm">
          <h2>
            <span className="dir" style={{ background: "rgba(180,143,240,.12)", color: "var(--llm)", border: "1px solid var(--llm)" }}>中枢</span>{" "}
            调度编排
          </h2>

          <div className="hub">
            <div className="t">LLM 调度中枢 <span className="same">同一个</span></div>
            <div className="d">解释环（KB×UR）与执行环（KB×M2A）共享这同一个 LLM，S 在两者间流转由它闭环驱动。</div>
            <div className="leg">
              <div className="row"><span className="n n-kb">KB</span><span className="arrow">检索 / 溯源 / 收敛 S</span><span className="n n-llm">LLM</span></div>
              <div className="row"><span className="n n-llm">LLM</span><span className="arrow">打包 .md（S + 策略 + 锚点）</span><span className="n n-m2a">M2A</span></div>
              <div className="row"><span className="n n-m2a">M2A</span><span className="arrow">检测结果 f1-f4 + 报告</span><span className="n n-llm">LLM</span></div>
              <div className="row"><span className="n n-llm">LLM</span><span className="arrow">解读 / 挂锚点 / 写回</span><span className="n n-kb">KB</span></div>
              <div className="row" style={{ marginTop: 4 }}><span className="n n-kb">KB</span><span className="arrow" style={{ color: "var(--user)" }}>写回前 → 请 UR 审阅</span><span className="n" style={{ background: "rgba(240,112,112,.18)", color: "var(--user)", border: "1px solid var(--user)" }}>UR</span></div>
            </div>
            <div className="iface">
              <div className="t">两个接口</div>
              <div className="li"><span className="e">LLM ↔ KB</span><span className="v">KB 工具 <span className="mono">k.py / REST API</span>（读 wiki、写 wiki，人类闸门）</span></div>
              <div className="li"><span className="e">LLM ↔ M2A</span><span className="v">结构化 <span className="mono">.md</span> 文件（备料 / 回流）</span></div>
            </div>
          </div>

          <div className="block">
            <div className="block-h"><span className="idx">◈</span> 一次交换的闭环</div>
            <div className="block-b" style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
              <b style={{ color: "var(--accent)" }}>出发原点</b> KB+LLM 生成 S + 噪声波形 → 1. 备料 .md → 2. M2A B1/B2 → 3. 回流 .md → 4. 解读写回 KB → 5. UR 审阅 → 6. 反哺 S-模板 → 7. 下次备料更准 <span style={{ color: "var(--accent)" }}>⭯ 循环</span>
            </div>
          </div>
        </section>

        {/* ════════ 右：M2A → KB 回流 ════════ */}
        <section className="col col-m2a">
          <h2>
            <span className="dir to-kb">M2A → KB</span> 回流（导入 .md）
          </h2>

          <div className="block">
            <div className="block-h"><span className="idx">①</span> 检测结果 f1-f4（B2 小信号预测）</div>
            <div className="block-b">
              <table className="tbl">
                <thead>
                  <tr><th>特征</th><th>值</th><th>单位</th></tr>
                </thead>
                <tbody>
                  {fRows.map(([name, val, unit], i) => (
                    <tr key={i}>
                      <td><b>f{i + 1}</b> {name}</td>
                      <td>{val}</td>
                      <td>{unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="block">
            <div className="block-h"><span className="idx">②</span> 缺陷定性 / 定量</div>
            <div className="block-b">
              <p className="kv"><span className="k">类型</span> <span className="v enum">{DEFAULT_RESULT.type}</span></p>
              <p className="kv"><span className="k">尺寸</span> <span className="v">{DEFAULT_RESULT.size}</span></p>
              <p className="kv"><span className="k">位置</span> <span className="v">{DEFAULT_RESULT.position}</span></p>
            </div>
          </div>

          <div className="block">
            <div className="block-h"><span className="idx">③</span> 实际 S + 结果（回流反哺模板）</div>
            <div className="block-b">
              <p className="kv"><span className="k">实际 S</span> <span className="v">与备料一致（无现场修正）</span></p>
              <p className="kv"><span className="k">检出率</span> <span className="v">{DEFAULT_RESULT.detection_rate}</span></p>
              <p className="kv"><span className="k">判定</span> <span className="v" style={{ color: "var(--accent)" }}>{DEFAULT_RESULT.verdict}</span></p>
            </div>
          </div>

          <div className="block">
            <div className="block-h"><span className="idx">④</span> 专家评价（UR 判官）</div>
            <div className="block-b">
              <p className="kv"><span className="v">{DEFAULT_RESULT.expert}</span> <span className="pill-rec">待 UR 审</span></p>
            </div>
          </div>

          <button className="btn" style={{ width: "100%" }} onClick={() => saveAndDownload("回流", huiLiuMd)}>
            生成并下载回流 .md
          </button>
        </section>
      </div>

      {/* ════════ 接口契约 ════════ */}
      <section className="contract">
        <h2>接口契约 · 交换文件结构（.md）</h2>
        <div className="contract-grid">
          <div className="mdbox">
            <div className="h">
              <span className="t kb">KB → M2A · 备料</span>
              <span className="fn">备料_场景属性.md</span>
              <button className="btn ghost" onClick={() => setPreview({ title: "备料 .md — KB → M2A", text: beiLiaoMd })}>展开</button>
            </div>
            <pre>{beiLiaoMd}</pre>
          </div>
          <div className="mdbox">
            <div className="h">
              <span className="t m2a">M2A → KB · 回流</span>
              <span className="fn">回流_检测结果.md</span>
              <button className="btn amber" onClick={() => setPreview({ title: "回流 .md — M2A → KB", text: huiLiuMd })}>展开</button>
            </div>
            <pre>{huiLiuMd}</pre>
          </div>
        </div>

        <div className="fieldnote">
          <b>接口要点：</b>① 两份 .md 通过 <b>scenario_id</b> 关联成一次检测的闭环；② S 各子属性-参数沿用 adds_on_08 的向量组 schema，<b>开放（A/B/C…）</b>；③ 策略建议遵循 <b>「LLM 推荐 / UR 决策」</b>，备料经 <b>approved_by: UR</b> 闸门；④ 回流结果作为新 source 进 raw，每条实质数据挂块级锚点 <span className="mono">[[raw/...#^]]</span>；⑤ M2A 只与 LLM 交换 .md，不直连 KB（KB 原则1：不内嵌 LLM）。
        </div>

        {entries.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              已落盘的交换文件（data/exchanges/）
            </div>
            <table className="tbl">
              <thead>
                <tr><th>scenario_id</th><th>类型</th><th>相对路径</th></tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i}>
                    <td><b>{e.scenario_id}</b></td>
                    <td>{e.type}</td>
                    <td className="mono">{e.relpath}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {/* 预览弹层 */}
      {preview !== null ? (
        <div className="overlay" onClick={() => setPreview(null)}>
          <div className="dlg" onClick={(e) => e.stopPropagation()}>
            <div className="dlg-h">
              <h3>{preview.title}</h3>
              <button className="x" onClick={() => setPreview(null)}>✕</button>
            </div>
            <pre>{preview.text}</pre>
          </div>
        </div>
      ) : null}
    </>
  );
}
