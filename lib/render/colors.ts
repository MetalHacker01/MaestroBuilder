/**
 * Color helpers for dark-mode tone-mapping.
 *
 * The naive approach of "make every dark-mode background black and every
 * dark-mode text light grey" loses brand identity — a red brand banner
 * becomes indistinguishable from a blue one. Instead we work in HSL space
 * and flip the lightness while preserving hue.
 *
 * Derived from the Litmus / Email-on-Acid research bundled with this project:
 *   - Avoid pure #fff and #000 (Apple Mail aggressive contrast heuristics)
 *   - Slightly desaturate in dark mode (reduces eye strain on OLED)
 *   - Preserve hue so brand colors stay recognisable
 */

export function isHexColor(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value.trim())
  );
}

export function hexToHsl(
  hex: string
): { h: number; s: number; l: number } | null {
  const cleaned = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(cleaned)) return null;

  let r: number, g: number, b: number;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  return { h: h * 360, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Transform a light-mode background colour into its dark-mode counterpart.
 *  - White-ish (#fff, #fafafa, #f3f4f6) → near-black (~#1a1a1a)
 *  - Light brand colour (#ff8888) → dark brand (~#3a1414)
 *  - Already-dark colour → stays close, just safer
 */
export function darkBg(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return "#1a1a1a";
  const { h, s, l } = hsl;
  let newL: number;
  if (l > 0.85) newL = 0.10;
  else if (l > 0.6) newL = 0.16;
  else if (l > 0.4) newL = 0.22;
  else if (l > 0.15) newL = Math.max(l - 0.1, 0.1);
  else newL = Math.max(l, 0.08);
  const newS = Math.min(s, 0.55);
  return hslToHex(h, newS, newL);
}

/**
 * Transform a light-mode text colour into its dark-mode counterpart.
 *  - Black / dark grey → light grey (~#dcdcdc)
 *  - Dark brand text (#0a3d62) → soft light tint of same hue (~#a8c2d8)
 *  - Already-light text → keep readable but slightly muted
 */
export function lightText(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return "#e8e8e8";
  const { h, s, l } = hsl;
  let newL: number;
  if (l < 0.15) newL = 0.88;
  else if (l < 0.35) newL = 0.82;
  else if (l < 0.55) newL = 0.78;
  else newL = Math.min(Math.max(l, 0.85), 0.94);
  const newS = Math.min(s, 0.45);
  return hslToHex(h, newS, newL);
}
