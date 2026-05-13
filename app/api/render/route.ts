import { NextRequest, NextResponse } from "next/server";
import { compileTemplate, type RenderMode } from "@/lib/render/compile";
import { templateSchema } from "@/lib/schema/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rewrite root-relative `src="/..."` attributes to absolute URLs against
 * the request origin. Email clients (and exported HTML opened in a
 * browser) have no base URL to resolve relative paths against, so a
 * default like `/maestro-logo.png` would 404. Doing this at the API
 * layer keeps module schemas portable — the default stays as the
 * relative path, but every render bakes in the actual deployed origin.
 *
 * Matches both src="/foo" and src='/foo' but NOT src="//cdn..." (protocol-
 * relative) and NOT src="/" alone.
 */
function absolutizeSrcs(html: string, origin: string): string {
  return html.replace(/src=(["'])\/(?!\/)([^"']+)\1/g, (_m, q, path) => {
    return `src=${q}${origin}/${path}${q}`;
  });
}

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
    // Prefer x-forwarded-host (Vercel sets this) over the rewritten internal
    // host so the absolute URL matches what the user sees in the browser.
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const origin = forwardedHost
      ? `${forwardedProto ?? "https"}://${forwardedHost}`
      : url.origin;
    const html = absolutizeSrcs(result.html, origin);
    return NextResponse.json({ ...result, html });
  } catch (e) {
    return NextResponse.json(
      { error: "Render failed", message: (e as Error).message },
      { status: 500 }
    );
  }
}
