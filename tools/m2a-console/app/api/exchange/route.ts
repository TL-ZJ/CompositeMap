/**
 * GET/POST /api/exchange —— .md 备料 / 回流 交换文件
 *  GET → { entries, next_id }
 *  POST { type: "备料"|"回流", scenario_id, content } → 原子写文件
 */
import { NextRequest, NextResponse } from "next/server";
import { listExchanges, saveExchange, nextScenarioId, type ExchangeType } from "@/lib/exchange";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [entries, next_id] = await Promise.all([listExchanges(), nextScenarioId()]);
  return NextResponse.json({ entries, next_id });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { type, scenario_id, content } = (body ?? {}) as {
    type?: unknown;
    scenario_id?: unknown;
    content?: unknown;
  };
  if (type !== "备料" && type !== "回流") {
    return NextResponse.json({ error: "bad_type" }, { status: 400 });
  }
  if (typeof scenario_id !== "string" || !scenario_id.trim()) {
    return NextResponse.json({ error: "scenario_id_required" }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content_required" }, { status: 400 });
  }
  const saved = await saveExchange(type as ExchangeType, scenario_id, content);
  return NextResponse.json({ ok: true, scenario_id, ...saved });
}
