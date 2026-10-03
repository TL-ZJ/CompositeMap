"use client";

import { useEffect, useRef, useState } from "react";
import { LOOP, LOOP_NUMS, DEFAULT_LOOP_STATE, advanceLoop } from "@/lib/m2a-domain";

/**
 * 统一循环状态条（服务端持久化，替代原型 gm_loop_state_v1 的 localStorage）。
 * 挂载时 GET、每 2s 轮询对齐跨路由变化；「推进一步」乐观更新 + POST。
 */
export function LoopBar({ onIndex }: { onIndex?: (n: number) => void }) {
  const [cur, setCur] = useState(DEFAULT_LOOP_STATE);
  const curRef = useRef(cur);
  curRef.current = cur;
  const lastPostRef = useRef(0);
  const onIndexRef = useRef(onIndex);
  onIndexRef.current = onIndex;

  useEffect(() => {
    let live = true;
    async function poll() {
      try {
        const r = await fetch("/api/loop-state", { cache: "no-store" });
        const j = (await r.json()) as { index?: unknown };
        if (!live || typeof j.index !== "number") return;
        // 刚 POST 过，跳过本轮 poll 避免把乐观值拉回旧值
        if (Date.now() - lastPostRef.current < 1500) return;
        if (j.index !== curRef.current) setCur(j.index);
      } catch {
        /* 忽略 */
      }
    }
    poll();
    const iv = setInterval(poll, 2000);
    return () => {
      live = false;
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    onIndexRef.current?.(cur);
  }, [cur]);

  async function advance() {
    const next = advanceLoop(curRef.current);
    lastPostRef.current = Date.now();
    setCur(next);
    try {
      const r = await fetch("/api/loop-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: next }),
      });
      const j = (await r.json()) as { index?: unknown };
      if (typeof j.index === "number") setCur(j.index);
    } catch {
      /* 忽略 */
    }
  }

  const step = LOOP[cur];
  return (
    <div className="loopstate">
      <div className="ls-head">
        <span className="ls-title">当前状态 · 循环进度</span>
        <span className="ls-cur">
          {LOOP_NUMS[cur]} {step.name} · {step.ring}
        </span>
        <button
          className="btn ghost"
          style={{ padding: "4px 10px", fontSize: 11 }}
          onClick={advance}
        >
          推进一步 ⭯
        </button>
        <span className="ls-sync">KB×UR 与 KB×M2A 双界面同步 · 同一 LLM 持有状态</span>
      </div>
      <div className="ls-steps">
        {LOOP.map((s, i) => {
          const own =
            s.owner === "KB×UR" ? "own-ur" : s.owner === "KB×M2A" ? "own-m2a" : "own-share";
          return (
            <div key={i} className={`ls-step${i === cur ? " on" : ""}`}>
              <span className="n">{LOOP_NUMS[i]}</span>
              <span className="t">{s.name}</span>
              <span className={`o ${own}`}>{s.owner}</span>
            </div>
          );
        })}
        <span className="ls-arrow">⭯ 回到①</span>
      </div>
    </div>
  );
}
