"use client";

import { useEffect, useRef } from "react";

/** 噪声 A-scan 波形（生成 · 冷启动）—— 复刻原型 canvas 绘制 */
export function NoiseWaveform() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const x = c.getContext("2d");
    if (!x) return;
    const W = c.width;
    const H = c.height;
    const mid = H / 2;
    x.clearRect(0, 0, W, H);
    x.strokeStyle = "#4fd6a0";
    x.lineWidth = 1.5;
    x.beginPath();
    for (let i = 0; i <= W; i++) {
      const t = i / W;
      const env = Math.exp(-3 * t);
      const sig = env * 22 * Math.sin(t * 42) + (Math.random() * 0.6 - 0.3);
      const yy = mid - sig;
      if (i === 0) x.moveTo(i, yy);
      else x.lineTo(i, yy);
    }
    x.stroke();
  }, []);

  return (
    <canvas
      ref={ref}
      width={320}
      height={72}
      style={{
        width: "100%",
        height: "auto",
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        margin: "8px 0 2px",
      }}
    />
  );
}
