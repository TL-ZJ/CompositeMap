/**
 * GET/POST /api/loop-state —— 统一循环状态（UR×KB 与 KB×M2A 共享）
 */
import { NextRequest, NextResponse } from "next/server";
import { getLoopState, setLoopState } from "@/lib/loop-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ index: await getLoopState() });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const index = (body as { index?: unknown } | null)?.index;
  if (typeof index !== "number") {
    return NextResponse.json({ error: "index_required" }, { status: 400 });
  }
  return NextResponse.json({ index: await setLoopState(index) });
}
