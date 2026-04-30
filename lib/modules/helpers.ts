import type { Spacing } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Maestro Builder design system (v0.4)
 *
 * Single accent (indigo violet) chosen to feel modern but distinct from the
 * Schneider-style green and the typical AI-generated cyan/blue gradients.
 * Palette pulled from the v0.3 UI audit + the bulletproof-email research:
 * avoid pure white (#fffffe) and pure black (#0a0a0a) so Apple Mail's
 * contrast heuristics don't aggressively partial-invert the design.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const BRAND = {
  accent: "#5B5BD6",
  accentDark: "#4747B3",
  accentSoft: "#EEEEFB",
  heading: "#0F172A",
  text: "#1F2937",
  muted: "#6B7280",
  surface: "#FFFFFF",
  surfaceWarm: "#FBFAF7",
  paper: "#F4F4F2",
  border: "#E5E7EB",
  borderSoft: "#EFEFEF",
  divider: "#D1D5DB",
  darkSurface: "#1C1B23",
  darkText: "#C1C1C1",
  darkLink: "#9DB7E2",
} as const;

/**
 * Multi-word font names like "Helvetica Neue" need quotes in CSS, but raw
 * `"` characters interpolated into either an MJML attribute (`font-family="${FONT_STACK}"`)
 * or an inline style string (`style="font-family:${FONT_STACK};..."`) collide
 * with the surrounding double quotes and corrupt the attribute. We use
 * HTML-encoded `&quot;` instead — every email client (and MJML's parser)
 * decodes that to a real `"` at parse time, giving us valid CSS without
 * the quote-collision bug that made text disappear in Gmail at 17 modules.
 */
export const FONT_STACK =
  "&quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif";

export const TYPE_SCALE = {
  h1: 32,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  caption: 12,
} as const;

export const LH = {
  heading: 1.2,
  body: 1.55,
} as const;

/** Backwards-compat alias used by older modules. Prefer FONT_STACK. */
export const DEFAULT_FONT = FONT_STACK;

export function spacing(s: Spacing): string {
  return `${s.t}px ${s.r}px ${s.b}px ${s.l}px`;
}

export function escapeAttr(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function safeHtml(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

export function px(n: number | string | undefined, fallback = 0): string {
  if (n == null || n === "") return `${fallback}px`;
  if (typeof n === "string" && n.endsWith("px")) return n;
  return `${Number(n)}px`;
}

/* ──────────────────────────────────────────────────────────────────────
 * Bulletproof CTA button.
 *
 * MJML's stock `<mj-button>` only emits a styled `<a>` inside a coloured
 * table cell — Outlook 2007-2019 desktop ignores `border-radius` on
 * `<td>` so the corners go square. The fix is the canonical Litmus
 * pattern: a hidden VML `<v:roundrect>` for Outlook + a regular HTML
 * button for everyone else, with `mso-hide:all` on the HTML side.
 *
 * arcsize is the VML "how round" parameter, expressed as a percentage of
 * half the shortest side. arcsize = round(2 * radius / min(w,h) * 100).
 * For an 8px radius on a 44px-tall button that's ~36%.
 * ──────────────────────────────────────────────────────────────────── */
export type BulletproofButtonOptions = {
  href: string;
  text: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string; // outline variant — defaults to bgColor
  outline?: boolean;    // ghost button: transparent fill, coloured border + text
  width?: number;       // px, default content-fit (~auto)
  height?: number;      // px, default 44
  radius?: number;      // px, default 8
  paddingY?: number;    // px, default 12
  paddingX?: number;    // px, default 28
  fontFamily?: string;
  fontSize?: number;    // px, default 14
  fontWeight?: number | string; // default 600
  align?: "left" | "center" | "right";
};

export function bulletproofButton(opts: BulletproofButtonOptions): string {
  const text = opts.text || "Click here";
  const href = opts.href || "#";
  const bg = opts.outline ? "transparent" : (opts.bgColor || BRAND.accent);
  const fill = opts.bgColor || BRAND.accent;
  const fg = opts.textColor || (opts.outline ? fill : "#ffffff");
  const stroke = opts.borderColor || fill;
  const height = opts.height ?? 44;
  const radius = opts.radius ?? 8;
  const padY = opts.paddingY ?? 12;
  const padX = opts.paddingX ?? 28;
  const fontFamily = opts.fontFamily || FONT_STACK;
  const fontSize = opts.fontSize ?? 14;
  const fontWeight = opts.fontWeight ?? 600;
  const align = opts.align || "center";
  const widthAttr = opts.width ? ` style="width:${opts.width}px;"` : "";

  // Approximate VML arcsize from height; clamp 0..100.
  const arcsize = Math.max(
    0,
    Math.min(100, Math.round((2 * radius * 100) / height))
  );

  const vmlFill = opts.outline
    ? `fillcolor="#ffffff" filled="false"`
    : `fillcolor="${fill}"`;
  const vmlStroke = opts.outline
    ? `strokecolor="${stroke}" strokeweight="2px"`
    : `strokecolor="${fill}" strokeweight="0px"`;

  // The VML `<center>` sits inside the <v:roundrect> textbox; the HTML <a>
  // is hidden from Outlook via `mso-hide:all` to prevent dual-render.
  return `
    <div style="text-align:${align};">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
        href="${escapeAttr(href)}"
        style="height:${height}px;v-text-anchor:middle;${opts.width ? `width:${opts.width}px;` : "width:200px;"}"
        arcsize="${arcsize}%" ${vmlFill} ${vmlStroke}>
        <w:anchorlock/>
        <center style="font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};color:${fg};letter-spacing:0.2px;">${escapeAttr(text)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <a href="${escapeAttr(href)}"${widthAttr}
         style="background-color:${bg};border:${opts.outline ? `2px solid ${stroke}` : "0"};border-radius:${radius}px;color:${fg};display:inline-block;font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};line-height:${height - padY * 2 - (opts.outline ? 4 : 0)}px;letter-spacing:0.2px;padding:${padY}px ${padX}px;text-align:center;text-decoration:none;mso-hide:all;">${escapeAttr(text)}</a>
      <!--<![endif]-->
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────────────────
 * Bulletproof background image with content overlay.
 *
 * MJML's `mj-section background-url` works in webmail but Outlook desktop
 * just shows the bgcolor — no image. The fix is a `<v:rect>` with
 * `<v:fill type="frame">` so Outlook renders the image AND keeps the
 * inner HTML inside `<v:textbox>`. Standard clients ignore the VML and
 * see the same content via the regular `background-image` CSS.
 *
 * Returns a string that should be wrapped in `<mj-raw>` because mj-section
 * cannot host VML directly.
 * ──────────────────────────────────────────────────────────────────── */
export type BulletproofBgOptions = {
  imageUrl: string;
  width: number;
  height: number;
  bgColor?: string;       // Fallback colour when image is blocked
  align?: "left" | "center" | "right";
  /** HTML rendered both in webmail AND inside <v:textbox> for Outlook. */
  innerHtml: string;
};

/**
 * Bulletproof background image with content overlay.
 *
 * Pattern matches the canonical Schneider / training-docs approach
 * (combined_notes.md → "Background Image"):
 *
 *   - Outer `<td background="">` + `style="background-image:url()"` for
 *     webmail (Apple Mail, Gmail web, Yahoo, mobile)
 *   - `<v:image src="...">` for Outlook desktop — top-level VML
 *     element, more reliable than `<v:fill type="frame">` which often
 *     silently falls back to fillcolor when the image isn't on a
 *     CDN with permissive headers
 *   - `<v:rect>` with `<v:fill opacity="0%">` overlaid via
 *     `position:absolute` to host the `<v:textbox>` for the text
 *     content (otherwise Outlook would render the image OR the
 *     content, not both)
 *   - Inner content is plain HTML inside `valign="middle"` for
 *     vertical centering across all clients
 */
export function bulletproofBgImage(opts: BulletproofBgOptions): string {
  const fallback = opts.bgColor || BRAND.heading;
  const align = opts.align || "center";
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"
      align="${align}" width="${opts.width}"
      style="width:${opts.width}px;max-width:100%;">
      <tr>
        <td valign="middle" align="center" height="${opts.height}"
          background="${escapeAttr(opts.imageUrl)}" bgcolor="${fallback}"
          style="height:${opts.height}px;background-image:url('${escapeAttr(opts.imageUrl)}');background-color:${fallback};background-position:center;background-size:cover;background-repeat:no-repeat;">
          <!--[if gte mso 9]>
          <v:image xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"
            src="${escapeAttr(opts.imageUrl)}"
            style="border:0;display:inline-block;position:absolute;width:${opts.width}px;height:${opts.height}px;" />
          <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"
            style="border:0;display:inline-block;position:absolute;width:${opts.width}px;height:${opts.height}px;">
            <v:fill opacity="0%" color="${fallback}" />
            <v:textbox style="mso-fit-shape-to-text:false" inset="0,0,0,0">
          <![endif]-->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0"
            align="center" width="${opts.width}" height="${opts.height}"
            style="width:${opts.width}px;height:${opts.height}px;">
            <tr>
              <td valign="middle" align="center" height="${opts.height}"
                style="height:${opts.height}px;padding:24px 16px;">
                ${opts.innerHtml}
              </td>
            </tr>
          </table>
          <!--[if gte mso 9]>
            </v:textbox>
          </v:rect>
          <![endif]-->
        </td>
      </tr>
    </table>
  `;
}

/* ──────────────────────────────────────────────────────────────────────
 * Bulletproof rounded card / panel — for overlay cards, callout boxes,
 * dark-on-light promo panels. Same VML pattern as the rounded button
 * but sized for content blocks: a `<v:roundrect>` provides the rounded
 * shape on Outlook, with an inner `<v:textbox>` hosting the HTML; on
 * standard clients the regular `<table>` shows through with
 * `border-radius` for the corners.
 *
 * NOTE on arcsize: VML expresses corner radius as a percentage of half
 * the shortest side. For a 480x180 card with 12px radius:
 *   arcsize = round(2 * 12 / min(480,180) * 100) ≈ 13%.
 * We compute it from the smaller of width/height so the user just sets
 * a CSS-style radius in px.
 * ──────────────────────────────────────────────────────────────────── */
export type BulletproofCardOptions = {
  width: number;
  bgColor: string;
  radius?: number;       // px, default 12
  paddingY?: number;     // px, default 32
  paddingX?: number;     // px, default 28
  align?: "left" | "center" | "right";
  /** HTML rendered both in webmail AND inside <v:textbox>. */
  innerHtml: string;
};

export function bulletproofCard(opts: BulletproofCardOptions): string {
  const radius = opts.radius ?? 12;
  const padY = opts.paddingY ?? 32;
  const padX = opts.paddingX ?? 28;
  const align = opts.align || "center";
  // For arcsize we don't know the height (content-driven), so estimate
  // off the width — looks good for cards where width > 2 * radius.
  const arcsize = Math.max(0, Math.min(100, Math.round((2 * radius * 100) / Math.max(opts.width, 80))));

  return `
    <!--[if gte mso 9]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" arcsize="${arcsize}%"
      fillcolor="${escapeAttr(opts.bgColor)}" stroke="false"
      style="width:${opts.width}px;mso-fit-shape-to-text:true;">
      <v:textbox inset="${padX}px,${padY}px,${padX}px,${padY}px" style="mso-fit-shape-to-text:true;">
    <![endif]-->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"
      align="${align}" width="${opts.width}"
      style="width:${opts.width}px;max-width:90%;">
      <tr>
        <td align="center" bgcolor="${escapeAttr(opts.bgColor)}"
          style="background-color:${escapeAttr(opts.bgColor)};border-radius:${radius}px;padding:${padY}px ${padX}px;">
          ${opts.innerHtml}
        </td>
      </tr>
    </table>
    <!--[if gte mso 9]>
      </v:textbox>
    </v:roundrect>
    <![endif]-->
  `;
}
