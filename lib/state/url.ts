import type { Template } from "@/lib/modules/types";
import { templateSchema } from "@/lib/schema/template";

export const URL_STATE_PARAM = "state";
export const URL_STATE_WARN_BYTES = 6000;

function toBase64Url(s: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(s, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeTemplateToUrl(t: Template): string {
  return toBase64Url(JSON.stringify(t));
}

export function decodeTemplateFromUrl(encoded: string): Template | null {
  try {
    const raw = fromBase64Url(encoded);
    const parsed = JSON.parse(raw);
    const result = templateSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(t: Template, baseHref?: string): string {
  const encoded = encodeTemplateToUrl(t);
  const base =
    baseHref ??
    (typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "/editor");
  return `${base}?${URL_STATE_PARAM}=${encoded}`;
}
