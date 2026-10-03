/**
 * 服务端统一循环状态 —— 内存单例 + JSON 持久化。
 *
 * 替代原型的 `gm_loop_state_v1`（localStorage）。UR×KB 与 KB×M2A 两个界面
 * 都经 /api/loop-state 读写同一个状态，由「同一个 LLM」持有，实现跨路由同步。
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_LOOP_STATE, clampLoop } from "./m2a-domain";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "loop-state.json");

let state: number | null = null;
// 串行化写，避免并发 POST 乱序落盘
let writeChain: Promise<void> = Promise.resolve();

async function load(): Promise<number> {
  if (state !== null) return state;
  try {
    const raw = await fs.readFile(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { index?: unknown };
    state = clampLoop(typeof parsed.index === "number" ? parsed.index : DEFAULT_LOOP_STATE);
  } catch {
    state = DEFAULT_LOOP_STATE;
  }
  return state;
}

export async function getLoopState(): Promise<number> {
  return load();
}

export async function setLoopState(index: number): Promise<number> {
  const v = clampLoop(index);
  state = v;
  writeChain = writeChain
    .then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(STATE_FILE, JSON.stringify({ index: v }, null, 2), "utf-8");
    })
    .catch(() => {
      /* 落盘失败不影响内存态 */
    });
  return v;
}
