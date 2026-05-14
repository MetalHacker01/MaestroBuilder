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

/**
 * Minimalist-UI palette — warm monochrome editorial tones.
 *
 *   - `accent` is off-black (#111111) for CTAs, matching the skill's
 *     "solid #111111 background, text #FFFFFF" button spec. The old
 *     indigo (#5B5BD6) became the OPTIONAL pop color (`pop`) for users
 *     who want a non-neutral button without losing the editorial feel.
 *   - Surfaces use warm bone (#F7F6F3) and pure white instead of cool
 *     gray to read as paper, not screen.
 *   - Borders standardise on #EAEAEA — the canonical minimalist-ui
 *     1px-divider colour.
 *   - Text colours stop short of pure black; #111111 + #2F3437 are the
 *     skill's recommended off-black/charcoal pairing.
 */
export const BRAND = {
  accent: "#111111",
  accentDark: "#000000",
  accentSoft: "#F7F6F3",
  // `pop` matches the landing page's primary CTA (Tailwind blue-700 #1d4ed8)
  // so the brand reads as one project — was indigo #5B5BD6 which the user
  // flagged as "purple/cyan", off-theme from the actual webpage palette.
  pop: "#1d4ed8",
  heading: "#111111",
  text: "#2F3437",
  muted: "#787774",
  surface: "#FFFFFF",
  surfaceWarm: "#F7F6F3",
  paper: "#FBFBFA",
  border: "#EAEAEA",
  borderSoft: "#EAEAEA",
  divider: "#EAEAEA",
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

/**
 * Convert `#RRGGBB` + opacity (0-100) to `rgba(r, g, b, a)`. Used for
 * semi-transparent overlay cards (Schneider pattern: bg image shows
 * through the dark/coloured overlay).
 */
export function hexToRgba(hex: string, opacity: number): string {
  const clean = String(hex || "").replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return `rgba(0, 0, 0, ${(opacity / 100).toFixed(2)})`;
  }
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const a = Math.max(0, Math.min(100, opacity)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

export function px(n: number | string | undefined, fallback = 0): string {
  if (n == null || n === "") return `${fallback}px`;
  if (typeof n === "string" && n.endsWith("px")) return n;
  return `${Number(n)}px`;
}

/* ──────────────────────────────────────────────────────────────────────
 * Bulletproof CTA button — MasterClass / Xbox pattern.
 *
 * Pattern: `<a>` wraps a `<table>` with `border-radius` on the inner
 * `<td>` (filled), or `border: 2px solid X` (outline). NO VML.
 *
 *   - Outlook 2007-2019 desktop ignores `border-radius` → renders SQUARE
 *     corners. Trade-off accepted across MasterClass, Klaviyo, Xbox,
 *     Mailchimp, etc.
 *   - Every other client (Gmail, Apple Mail, Outlook web, mobile) honours
 *     `border-radius` → renders rounded.
 *   - MAP-trackable everywhere because the outer `<a href>` is a plain
 *     HTML anchor — SFMC, Marketo, Eloqua, HubSpot all rewrite it.
 *   - Padding on the td renders correctly in Outlook (no v-text-anchor
 *     drift, no double borders).
 * ──────────────────────────────────────────────────────────────────── */
export type BulletproofButtonOptions = {
  href: string;
  text: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;        // outline variant — defaults to bgColor
  outline?: boolean;           // ghost button: transparent fill, coloured border + text
  radius?: number;             // px, default 8
  paddingY?: number;           // px, default 12
  paddingX?: number;           // px, default 28
  fontFamily?: string;
  fontSize?: number;           // px, default 15
  fontWeight?: number | string; // default 600
  align?: "left" | "center" | "right";
};

export function bulletproofButton(opts: BulletproofButtonOptions): string {
  const text = opts.text || "Click here";
  const href = opts.href || "#";
  const fill = opts.bgColor || BRAND.accent;
  const fg = opts.textColor || (opts.outline ? fill : "#ffffff");
  const stroke = opts.borderColor || fill;
  const radius = opts.radius ?? 8;
  const padY = opts.paddingY ?? 12;
  const padX = opts.paddingX ?? 28;
  const fontFamily = opts.fontFamily || FONT_STACK;
  const fontSize = opts.fontSize ?? 15;
  const fontWeight = opts.fontWeight ?? 600;
  const align = opts.align || "center";

  // Outline variant: transparent fill, coloured 2px border, coloured text.
  // FILLED variant gets a matching-colour 2px border too — the border is
  // invisible (same as the fill) but it makes filled + outline buttons
  // render at identical outer dimensions. Without this, an outline CTA
  // sitting next to a filled CTA (e.g. body-cta-pair) looks visibly
  // larger because the outline's `border:2px solid` adds 4px to width/
  // height while the filled version has `border:0`.
  const innerBg = opts.outline ? "transparent" : fill;
  const tdBgcolor = opts.outline ? "" : `bgcolor="${fill}"`;
  const borderStyle = opts.outline
    ? `border:2px solid ${stroke};`
    : `border:2px solid ${fill};`;

  // Pattern: Mailchimp / Litmus "anchor inside td" — the universally
  // reliable email-button structure.
  //
  //   <table align="X" role="presentation">    ← centers via align attr
  //     <tr><td>                                  ← the visual button cell
  //       <a display:block>text</a>               ← fills cell, full click area
  //     </td></tr>
  //   </table>
  //
  // Why this works where "<a> wraps <table>" doesn't:
  //   - The table is the OUTERMOST element. Its `align="${align}"` attribute
  //     is the only thing centering it, and it works because the table's
  //     containing block is always the parent (whatever td/div the caller
  //     placed it in) — no inline-containing-block edge case.
  //   - `<a style="display:block">` inside the td fills the entire cell,
  //     so the whole rounded button is the click target.
  //   - Single nesting, no <div>/<center>/<a> wrappers — Outlook, Gmail,
  //     and every webmail client render this identically.
  //
  // MAP-tracking note: SFMC, Marketo, Eloqua, HubSpot all rewrite any
  // `<a href>` they find in the HTML — the anchor's position inside vs
  // outside the table doesn't matter for tracking.
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${align}"
      style="border-collapse:separate;line-height:100%;">
      <tr>
        <td ${tdBgcolor} align="center" valign="middle"
          style="background-color:${innerBg};${borderStyle}border-radius:${radius}px;padding:${padY}px ${padX}px;mso-padding-alt:${padY}px ${padX}px;text-align:center;line-height:100%;">
          <a href="${escapeAttr(href)}" target="_blank"
             style="display:block;text-decoration:none;color:${fg};font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};line-height:1.2;letter-spacing:0.2px;text-align:center;">${escapeAttr(text)}</a>
        </td>
      </tr>
    </table>
  `;
}

/* ──────────────────────────────────────────────────────────────────────
 * VML-aware CTA — for use INSIDE a `<v:textbox>` (e.g. the hero overlay).
 *
 * Outlook 2007-2019 ignores `align="center"` on tables nested inside
 * `<v:textbox>` — that's why the regular bulletproofButton sits left of
 * center on Outlook when placed in a hero overlay. The Schneider pattern
 * (see combined_notes.md "Background Image and Round Button" line 431)
 * solves this by:
 *   1. Hiding the HTML table button from Outlook (`<!--[if !mso]>` block).
 *   2. Emitting a separate `<v:roundrect>` for Outlook that uses
 *      `v-text-anchor:middle` + an explicit width — Outlook centers a
 *      VML shape using the parent `<center>` element reliably, unlike
 *      HTML tables which it doesn't.
 *
 * The caller wraps this whole helper in `<center>...</center>` (which is
 * what Outlook needs to centre the VML shape). Webmail sees only the
 * HTML table, also centered by the same `<center>`.
 * ──────────────────────────────────────────────────────────────────── */
export type VmlButtonOptions = BulletproofButtonOptions & {
  /** VML button width in px — needed because v:roundrect can't auto-size. Default 200. */
  vmlWidth?: number;
  /** VML button height in px — controls v:roundrect height. Default 44. */
  vmlHeight?: number;
};

export function bulletproofButtonVml(opts: VmlButtonOptions): string {
  const text = opts.text || "Click here";
  const href = opts.href || "#";
  const fill = opts.bgColor || BRAND.accent;
  const fg = opts.textColor || "#ffffff";
  const radius = opts.radius ?? 8;
  const fontFamily = opts.fontFamily || FONT_STACK;
  const fontSize = opts.fontSize ?? 15;
  const fontWeight = opts.fontWeight ?? 600;
  const vmlWidth = opts.vmlWidth ?? 200;
  const vmlHeight = opts.vmlHeight ?? 44;
  // VML arcsize = (2 * radius / shortest-side) * 100, clamped 0-100.
  const arcsize = Math.max(
    0,
    Math.min(100, Math.round((2 * radius * 100) / Math.min(vmlWidth, vmlHeight)))
  );
  const htmlButton = bulletproofButton({ ...opts, align: "center" });
  return `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
      href="${escapeAttr(href)}"
      style="height:${vmlHeight}px;v-text-anchor:middle;width:${vmlWidth}px;"
      arcsize="${arcsize}%" stroke="f" fillcolor="${fill}">
      <w:anchorlock/>
      <center style="font-family:${fontFamily};font-size:${fontSize}px;color:${fg};font-weight:${fontWeight};">${escapeAttr(text)}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    ${htmlButton}
    <!--<![endif]-->
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
 * Schneider's exact pattern (sch_email.html line 692-758) — the cleanest
 * way to render a transparent overlay card on top of a bg image across
 * Gmail, Apple Mail, mobile, AND Outlook desktop:
 *
 *   - Outer `<td background="...">` + `style="background-image:url()"` for
 *     webmail. NO position:absolute anywhere.
 *   - `<v:rect>` with `<v:fill type="frame" src="..." color="...">` for
 *     Outlook. `type="frame"` scales the image to fill the rect; the
 *     `color` is the bgcolor fallback if the image is blocked.
 *   - `<v:textbox style="mso-fit-shape-to-text:true">` makes the v:rect
 *     auto-grow to fit the overlay content height — no fixed banner
 *     height needed, no stretched images.
 *   - NO separate `<v:image>` (Schneider doesn't use one). The image is
 *     painted into the v:rect via v:fill. The same overlay HTML renders
 *     inside the v:textbox in Outlook and directly in the td everywhere
 *     else. ONE code path. Outlook positions content via natural document
 *     flow inside the textbox, which is reliable.
 *
 * The `opts.height` parameter is now a HINT, not a fixed dimension. The
 * actual rendered height is determined by the overlay content + the
 * `mso-fit-shape-to-text:true` auto-sizing.
 */
export function bulletproofBgImage(opts: BulletproofBgOptions): string {
  const fallback = opts.bgColor || BRAND.heading;
  const align = opts.align || "center";
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"
      align="${align}" width="${opts.width}"
      style="width:${opts.width}px;max-width:100%;">
      <tr>
        <td valign="top" align="left"
          background="${escapeAttr(opts.imageUrl)}" bgcolor="${fallback}"
          style="background-image:url('${escapeAttr(opts.imageUrl)}');background-color:${fallback};background-position:center;background-size:cover;background-repeat:no-repeat;vertical-align:top;">
          <!--[if gte mso 9]>
          <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"
            style="width:${opts.width}px;height:auto;">
            <v:fill type="frame" src="${escapeAttr(opts.imageUrl)}" color="${fallback}" />
            <v:textbox style="mso-fit-shape-to-text:true;" inset="0,0,0,0">
          <![endif]-->
          ${opts.innerHtml}
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
