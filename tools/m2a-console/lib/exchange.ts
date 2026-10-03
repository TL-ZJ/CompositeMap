/**
 * .md 备料 / 回流 交换文件 —— 真实落地到 data/exchanges/<scenario_id>/。
 *
 * 「写回 KB」不在这里发生：回流 .md 是交给人类闸门（kb-ingest）的产物，
 * console 只写本地 data/ 交换目录，不直写 wiki/（对齐 CLAUDE.md：console 是 HTTP 读客户端）。
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export type ExchangeType = "备料" | "回流";

export interface ExchangeEntry {
  scenario_id: string;
  type: ExchangeType;
  filename: string;
  relpath: string;
  content: string;
  created_at: string;
}

const EXCHANGES_DIR = path.join(process.cwd(), "data", "exchanges");

const FILENAME: Record<ExchangeType, string> = {
  备料: "备料_场景属性.md",
  回流: "回流_检测结果.md",
};

function scenarioDir(scenarioId: string): string {
  const safe = scenarioId.replace(/[^A-Za-z0-9_-]/g, "");
  return path.join(EXCHANGES_DIR, safe || "default");
}

export async function saveExchange(
  type: ExchangeType,
  scenarioId: string,
  content: string,
): Promise<{ relpath: string; filename: string }> {
  const dir = scenarioDir(scenarioId);
  await fs.mkdir(dir, { recursive: true });
  const filename = FILENAME[type];
  await fs.writeFile(path.join(dir, filename), content, "utf-8");
  return { relpath: `${scenarioId}/${filename}`, filename };
}

export async function listExchanges(): Promise<ExchangeEntry[]> {
  let dirs: string[];
  try {
    dirs = await fs.readdir(EXCHANGES_DIR);
  } catch {
    return [];
  }
  const out: ExchangeEntry[] = [];
  for (const d of dirs) {
    const full = path.join(EXCHANGES_DIR, d);
    let st;
    try {
      st = await fs.stat(full);
    } catch {
      continue;
    }
    if (!st.isDirectory()) continue;
    for (const type of ["备料", "回流"] as const) {
      const filename = FILENAME[type];
      try {
        const content = await fs.readFile(path.join(full, filename), "utf-8");
        out.push({
          scenario_id: d,
          type,
          filename,
          relpath: `${d}/${filename}`,
          content,
          created_at: st.mtime.toISOString(),
        });
      } catch {
        /* 该 scenario 还没有此类型文件 */
      }
    }
  }
  return out.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** 生成下一个 scenario_id：S-YYYY-MMDD-NN（按当天已存在的最大 NN + 1） */
export async function nextScenarioId(): Promise<string> {
  const now = new Date();
  const y = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const prefix = `S-${y}-${mm}${dd}-`;
  let max = 0;
  try {
    const dirs = await fs.readdir(EXCHANGES_DIR);
    for (const d of dirs) {
      if (d.startsWith(prefix)) {
        const n = parseInt(d.slice(prefix.length), 10);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }
  } catch {
    /* 目录不存在 */
  }
  return `${prefix}${String(max + 1).padStart(2, "0")}`;
}
