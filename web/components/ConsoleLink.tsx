"use client";
import { useEffect, useState } from "react";
import { SquareTerminal, Boxes } from "lucide-react";
import { useT } from "@/lib/i18n-client";

/**
 * 顶栏右上角「URxKB-控制」「KBxM2A-控制」两个入口——直接暴露在顶栏。
 * 指向独立子项目 tools/m2a-console（解释环 / 执行环两个界面）。
 *
 * URL 取自 NEXT_PUBLIC_M2A_CONSOLE_URL（默认 http://localhost:3200）；设为空字符串则整个入口
 * 隐藏——供开源部署不带 m2a-console 时用。控制台是 KB 的**外部客户端**（独立 Next.js
 * 子项目，需单独 `cd tools/m2a-console && npm run dev` 启动），故在新标签打开、不离开当前
 * wiki 浏览上下文。
 *
 * 自动识别 workspace：把 web **当前**所在的库（`/api/workspaces` 的 current —— 浏览器请求会带
 * `kb_workspace` cookie，故返回的是你正在看的那个库）作为 `?ws=` 拼到控制台链接。控制台读到后
 * 即用该库查询，**答案与引用都落在同一个库**，无需手动对齐端口 / KB_WORKSPACE。
 */

const M2A_CONSOLE_URL = process.env.NEXT_PUBLIC_M2A_CONSOLE_URL ?? "http://localhost:3200";

export function ConsoleLink() {
  const t = useT();
  const [ws, setWs] = useState<string | null>(null);

  useEffect(() => {
    if (!M2A_CONSOLE_URL) return;
    let alive = true;
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((d: { current?: unknown }) => {
        if (alive && typeof d.current === "string") setWs(d.current);
      })
      .catch(() => {
        /* 拿不到就不带 ?ws，控制台落到自己的默认库 */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!M2A_CONSOLE_URL) return null;

  const q = ws
    ? `${M2A_CONSOLE_URL.includes("?") ? "&" : "?"}ws=${encodeURIComponent(ws)}`
    : "";

  const linkCls =
    "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <div className="flex items-center gap-1.5">
      <a href={`${M2A_CONSOLE_URL}/urxkb${q}`} target="_blank" rel="noreferrer" title={t("nav.urxkb")} className={linkCls}>
        <SquareTerminal className="h-4 w-4" aria-hidden />
        <span>{t("nav.urxkb")}</span>
      </a>
      <a href={`${M2A_CONSOLE_URL}/kbxm2a${q}`} target="_blank" rel="noreferrer" title={t("nav.kbxm2a")} className={linkCls}>
        <Boxes className="h-4 w-4" aria-hidden />
        <span>{t("nav.kbxm2a")}</span>
      </a>
    </div>
  );
}
