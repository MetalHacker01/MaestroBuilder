import { NextRequest, NextResponse } from "next/server";
import { compileTemplate, type RenderMode } from "@/lib/render/compile";
import { templateSchema } from "@/lib/schema/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mode: RenderMode = url.searchParams.get("mode") === "preview" ? "preview" : "export";
    const forceDark = url.searchParams.get("forceDark") === "1";
    const body = await req.json();
    const parsed = templateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid template payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const result = await compileTemplate(parsed.data.instances, {
      mode,
      theme: parsed.data.theme,
      forceDark,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: "Render failed", message: (e as Error).message },
      { status: 500 }
    );
  }
}
