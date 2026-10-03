/**
 * M2A 领域常量与纯函数 —— UR×KB / KB×M2A 两端共用的单一真相源。
 *
 * 只放「不依赖 node / 浏览器」的纯内容：8 步循环、四角色、S 场景属性向量组、
 * f1-f4 检测结果键，以及备料 / 回流 .md 的**字符串生成**。
 * 文件读写（fs）在 lib/exchange.ts（仅 server 端 import）。
 *
 * 契约对齐 adds_on_08（S 向量组）/ adds_on_13（交换内容与接口）/ adds_on_12（四角色顶层）。
 */

// ── 四角色 ──────────────────────────────────────────────
export type RoleId = "UR" | "KB" | "M2A" | "LLM";

export interface Role {
  id: RoleId;
  order: number;
  name: string;
  /** CSS 变量名（globals.css 定义） */
  color: string;
  className: string;
}

export const ROLES: Role[] = [
  { id: "UR", order: 1, name: "使用者", color: "var(--user)", className: "r-user" },
  { id: "KB", order: 2, name: "知识库", color: "var(--kb)", className: "r-kb" },
  { id: "M2A", order: 3, name: "影像分析", color: "var(--m2a)", className: "r-m2a" },
  { id: "LLM", order: 4, name: "调度中枢", color: "var(--llm)", className: "r-llm" },
];

// ── 8 步统一循环 ────────────────────────────────────────
export type LoopOwner = "KB×M2A" | "KB×UR" | "共享";

export interface LoopStep {
  name: string;
  owner: LoopOwner;
  ring: string;
}

export const LOOP: LoopStep[] = [
  { name: "冷启动", owner: "KB×M2A", ring: "启动" },
  { name: "S 收敛", owner: "KB×UR", ring: "解释环" },
  { name: "备料", owner: "KB×M2A", ring: "执行环" },
  { name: "检测 B1/B2", owner: "KB×M2A", ring: "执行环" },
  { name: "回流", owner: "KB×M2A", ring: "执行环" },
  { name: "写回 KB", owner: "KB×M2A", ring: "执行环" },
  { name: "UR 审阅", owner: "KB×UR", ring: "闸门" },
  { name: "反哺 S-模板", owner: "共享", ring: "变聪明" },
];

export const LOOP_NUMS = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦"];

export const DEFAULT_LOOP_STATE = 1;

/** 推进：⑦ 之后回到 ①（不是 ⓪ —— 冷启动只在首次发生） */
export function advanceLoop(cur: number): number {
  return cur >= LOOP.length - 1 ? 1 : cur + 1;
}

export function clampLoop(n: number): number {
  return n >= 0 && n < LOOP.length ? n : DEFAULT_LOOP_STATE;
}

// ── S 场景属性向量组（模板两层：A/B/C… 开放 + 实例具体值）──
export interface SInstance {
  A: { A1: string; A2: string; A3: string; A4: string };
  B: { B1: string; B2: string; B3: string };
  C?: Record<string, string>;
}

export const DEFAULT_S: SInstance = {
  A: {
    A1: "碳纤维 T700 · Vf=60% · [0/±45/90]s · 环氧",
    A2: "胶膜 FM-300 · 0.2mm · 喷砂处理",
    A3: "自动铺带",
    A4: "热压罐 180°C · 6h · 0.6MPa",
  },
  B: {
    B1: "相控阵 5MHz · 64 晶片",
    B2: "采样 100MHz · TGC",
    B3: "12bit · .dat",
  },
};

// ── 检测结果 f1-f4（B2 小信号预测）───────────────────────
export interface DetectionResult {
  f1: number; // 缺陷存在概率 0-1
  f2: number; // 最大幅度 mV
  f3: number; // TOF μs
  f4: number; // 频谱主峰 MHz
  type: string;
  size: string;
  position: string;
  detection_rate: string;
  verdict: string;
  expert: string;
}

export const F1_F4_KEYS = [
  { key: "f1", name: "缺陷存在概率", unit: "0–1" },
  { key: "f2", name: "最大幅度", unit: "mV" },
  { key: "f3", name: "TOF", unit: "μs" },
  { key: "f4", name: "频谱主峰", unit: "MHz" },
] as const;

export const DEFAULT_RESULT: DetectionResult = {
  f1: 0.93,
  f2: 38,
  f3: 12.4,
  f4: 2.3,
  type: "分层",
  size: "8.2 mm",
  position: "(12, 34, 5)",
  detection_rate: "97.2%",
  verdict: "疑似（待复检）",
  expert: "边界模糊，建议复检确认。",
};

// ── 策略建议（LLM 推荐 · UR 决策）────────────────────────
export interface Strategy {
  filter: string;
  dlArch: string;
  basis: string;
}

export const DEFAULT_STRATEGY: Strategy = {
  filter: "小波包时频阈值降噪 + 参数",
  dlArch: "生成式（需完整背景波形）",
  basis: "[[raw/标准/GB-xxx#^p-5-1a2b3c]]",
};

export const DEFAULT_ANCHORS = [
  "[[raw/标准/GB-xxx#^h-2-3-a3f2c1]]",
  "[[raw/论文/yyy#^h-3-2-7d8e9a]]",
  "[[wiki/sources/缺陷-分层#^p-1]]",
];

export const DEFAULT_MATERIAL = "碳纤维增强复合材料（热压罐）";

// ── 备料 / 回流 .md 生成（纯函数，client 与 server 都可 import）──
export interface BeiLiaoInput {
  scenarioId: string;
  material: string;
  s: SInstance;
  strategy: Strategy;
  anchors: string[];
}

export function buildBeiLiaoMd(o: BeiLiaoInput): string {
  const { scenarioId, material, s, strategy, anchors } = o;
  const L: string[] = [];
  L.push("---");
  L.push(`scenario_id: ${scenarioId}`);
  L.push(`material: ${material}`);
  L.push("created_by: LLM");
  L.push("approved_by: UR            # 人类闸门");
  L.push("---");
  L.push("## 场景属性 S");
  L.push("### A 工件属性");
  L.push(`- A1 原材料: ${s.A.A1}`);
  L.push(`- A2 粘接工艺: ${s.A.A2}`);
  L.push(`- A3 加工工艺: ${s.A.A3}`);
  L.push(`- A4 成型固化: ${s.A.A4}`);
  L.push("### B 影像属性");
  L.push(`- B1 探头: ${s.B.B1}`);
  L.push(`- B2 采集器模拟: ${s.B.B2}`);
  L.push(`- B3 数字化: ${s.B.B3}`);
  L.push("## 噪声 A-scan 波形（生成 · 冷启动）");
  L.push("- 波形: [经典仿真 ground truth] [[raw/仿真/噪声-xxx]]");
  L.push("## 量化描述");
  L.push("- 幅度: max 12 mV, RMS 3.1 mV");
  L.push("- 时间: TOF 11.2 μs, 脉宽 1.8 μs");
  L.push("- 频域: 主频 5.0 MHz, 带宽 2.1 MHz");
  L.push("- 统计: 高斯, σ = 3.0 mV");
  L.push("## 策略建议");
  L.push(`- 滤波器: ${strategy.filter} ${strategy.basis}`);
  L.push(`- DL 架构: ${strategy.dlArch}`);
  L.push("## 领域知识锚点");
  for (const a of anchors) L.push(`- ${a}`);
  return L.join("\n");
}

export function buildHuiLiuMd(o: { scenarioId: string; r: DetectionResult }): string {
  const { scenarioId, r } = o;
  const L: string[] = [];
  L.push("---");
  L.push(`scenario_id: ${scenarioId}   # 关联备料`);
  L.push("created_by: M2A");
  L.push("reviewed_by: UR             # 待人类审阅");
  L.push("---");
  L.push("## 检测结果（f1-f4）");
  L.push(`- f1 缺陷存在概率: ${r.f1}`);
  L.push(`- f2 最大幅度: ${r.f2} mV`);
  L.push(`- f3 TOF: ${r.f3} μs`);
  L.push(`- f4 频谱主峰: ${r.f4} MHz`);
  L.push("## 缺陷定性/定量");
  L.push(`- 类型: ${r.type}; 尺寸: ${r.size}; 位置: ${r.position}`);
  L.push("## 实际 S + 结果");
  L.push("- 实际 S: 与备料一致（无修正）");
  L.push(`- 检出率: ${r.detection_rate}; 判定: ${r.verdict}`);
  L.push("## 专家评价");
  L.push(`- UR 评判: ${r.expert}`);
  L.push("## 附件");
  L.push("- B/C/D scan 图像, 三维渲染, 检测报告");
  return L.join("\n");
}
