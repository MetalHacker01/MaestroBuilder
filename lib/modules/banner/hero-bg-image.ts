import type { Module, Spacing } from "../types";
import {
  BRAND,
  FONT_STACK,
  escapeAttr,
  hexToRgba,
  safeHtml,
  spacing,
} from "../helpers";

/**
 * Hero with bg image + transparent overlay card — verbatim Schneider
 * pattern (sch_email.html line 692-758). The key wins this approach
 * locks in:
 *
 *   1. `<mj-section background-url>` lets MJML generate the canonical
 *      `<v:rect><v:fill type="tile">` markup wrapped around the section's
 *      content `<td>`. This matches Schneider 1:1 — and unlike a hand-
 *      rolled bulletproofBgImage helper buried inside `<mj-raw>`, it
 *      doesn't get nested in extra mj-column tables that break VML
 *      positioning.
 *
 *   2. The overlay card uses Schneider's exact markup: a `<table>` with
 *      `style="background:rgba(...)"` + `bgcolor` fallback so Outlook
 *      (which ignores rgba) shows a solid card. Real `<h1>` element +
 *      spacer rows (height:5px;line-height:5px;font-size:1px;) for
 *      vertical gaps instead of margin (Outlook ignores margin on
 *      block elements).
 *
 *   3. Schneider-style button inside: `<table class="button" style="display:
 *      inline-block;max-width:250px">` + `<td display:block;width:180px;
 *      padding:10px 5px;border-radius:5px>`. The inline-block table fits
 *      naturally in an inline-flow context; the td's display:block makes
 *      the whole button clickable.
 *
 *   4. CSS classes (.fluid, .rounded-corner, .mobile-auto-height,
 *      .responsive-td, .mb-hero-overlay-*) defined in shell.ts handle
 *      responsive widths and mobile font scaling.
 */
export const heroBgImage: Module = {
  id: "hero-bg-image",
  category: "banner",
  label: "Hero with background image + overlay",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Background image URL",
      default: "https://picsum.photos/seed/maestro-hero-bg/1280/520",
      group: "Image",
    },
    bgFallback: {
      type: "color",
      label: "Fallback colour (image blocked)",
      default: "#2F3437",
      group: "Image",
    },
    headline: {
      type: "richtext",
      label: "Headline",
      default: "Your headline goes here",
      group: "Overlay",
    },
    headlineColor: {
      type: "color",
      label: "Headline colour",
      default: "#ffffff",
      group: "Overlay",
    },
    paragraph: {
      type: "richtext",
      label: "Subhead",
      default:
        "Short, punchy supporting copy that sets up the value proposition.",
      group: "Overlay",
    },
    paragraphColor: {
      type: "color",
      label: "Subhead colour",
      default: "#E5E7EB",
      group: "Overlay",
    },
    overlayColor: {
      type: "color",
      label: "Card colour",
      default: "#000000",
      group: "Overlay",
    },
    overlayOpacity: {
      type: "number",
      label: "Card opacity (0 = transparent, 100 = solid)",
      default: 70,
      min: 0,
      max: 100,
      unit: "%",
      group: "Overlay",
    },
    overlayWidth: {
      type: "number",
      label: "Card width",
      default: 500,
      min: 280,
      max: 700,
      unit: "px",
      group: "Overlay",
    },
    overlayRadius: {
      type: "number",
      label: "Card radius",
      default: 8,
      min: 0,
      max: 32,
      unit: "px",
      group: "Overlay",
    },
    contentAlign: {
      type: "align",
      label: "Card position",
      default: "left",
      group: "Overlay",
    },
    showButton: {
      type: "select",
      label: "Show CTA",
      default: "yes",
      options: [
        { label: "Show CTA", value: "yes" },
        { label: "Hide CTA", value: "no" },
      ],
      group: "Button",
    },
    ctaText: { type: "text", label: "Button text", default: "Get started", group: "Button" },
    ctaUrl: { type: "url", label: "Button link", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Button" },
    ctaBgColor: { type: "color", label: "Button colour", default: BRAND.accent, group: "Button" },
    ctaTextColor: { type: "color", label: "Button text colour", default: "#ffffff", group: "Button" },
    ctaRadius: { type: "number", label: "Button radius", default: 5, min: 0, max: 32, unit: "px", group: "Button" },
    ctaWidth: { type: "number", label: "Button width", default: 180, min: 100, max: 300, unit: "px", group: "Button" },
    sectionPadding: {
      type: "spacing",
      label: "Padding around card (how much bg image shows around it)",
      default: { t: 32, r: 25, b: 32, l: 25 },
      group: "Layout",
    },
  },
  render: (p) => {
    const showButton = p.showButton !== "no";
    const overlayWidth = Number(p.overlayWidth ?? 500);
    const overlayRadius = Number(p.overlayRadius ?? 8);
    const overlayOpacity = Number(p.overlayOpacity ?? 70);
    const overlayHex = String(p.overlayColor ?? "#000000");
    const overlayRgba = hexToRgba(overlayHex, overlayOpacity);
    const contentAlign =
      (p.contentAlign as "left" | "center" | "right") ?? "left";

    const ctaBg = String(p.ctaBgColor ?? BRAND.accent);
    const ctaFg = String(p.ctaTextColor ?? "#ffffff");
    const ctaRadiusPx = Number(p.ctaRadius ?? 5);
    const ctaWidthPx = Number(p.ctaWidth ?? 180);

    // Schneider's button markup verbatim: inline-block outer table +
    // display:block td with explicit width. The `<a>` inside is inline-
    // block so its margin pulls the text away from the td edges, which
    // gives Outlook a consistent visual click target.
    const buttonHtml = showButton
      ? `
        <table class="button" cellpadding="0" cellspacing="0" border="0"
          style="display:inline-block;max-width:250px;">
          <tr>
            <td bgcolor="${ctaBg}" valign="middle"
              style="background-color:${ctaBg};font-family:${FONT_STACK};font-size:14px;text-align:center;vertical-align:middle;color:${ctaFg};display:block;padding:10px 5px;border-radius:${ctaRadiusPx}px;line-height:15px;font-weight:400;max-width:250px;width:${ctaWidthPx}px;">
              <a href="${escapeAttr(p.ctaUrl)}" target="_blank"
                 style="color:${ctaFg};text-decoration:none;line-height:16px;display:inline-block;font-weight:bold;margin:0 10px;">
                ${escapeAttr(p.ctaText)}
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

    // Schneider's overlay card: rgba background + matching bgcolor
    // fallback for Outlook (which ignores rgba — falls back to solid hex).
    // The `<h1>` is the actual headline element; clients respect h1 even
    // when style attributes get stripped. Spacer rows give vertical gaps
    // around the button. `.rounded-corner` + `.fluid` classes from shell.ts
    // handle radius + mobile-responsive width.
    const overlayCard = `
      <table class="rounded-corner fluid" cellpadding="0" cellspacing="0" border="0"
        align="${contentAlign}" width="${overlayWidth}" bgcolor="${overlayHex}"
        style="background:${overlayRgba};background-color:${overlayRgba};width:${overlayWidth}px;max-width:100%;border-radius:${overlayRadius}px;${contentAlign === "center" ? "margin:0 auto;" : ""}">
        <tr>
          <td style="color:${escapeAttr(p.headlineColor)};padding:24px 28px;font-family:${FONT_STACK};">
            <h1 class="mb-hero-overlay-headline"
              style="color:${escapeAttr(p.headlineColor)};font-family:${FONT_STACK};font-size:32px;line-height:1.2;font-weight:700;margin:0;padding:0 0 10px 0;">
              ${safeHtml(p.headline)}
            </h1>
            ${p.paragraph
              ? `
              <p class="mb-hero-overlay-paragraph"
                style="color:${escapeAttr(p.paragraphColor)};font-family:${FONT_STACK};font-size:15px;line-height:1.55;margin:0;padding:0 0 4px 0;">
                ${safeHtml(p.paragraph)}
              </p>
              `
              : ``}
            ${showButton
              ? `
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td colspan="3" style="height:10px;line-height:10px;font-size:1px;">&nbsp;</td>
                </tr>
                <tr>
                  <td class="responsive-td">
                    ${buttonHtml}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" style="height:5px;line-height:5px;font-size:1px;">&nbsp;</td>
                </tr>
              </table>
              `
              : ``}
          </td>
        </tr>
      </table>
    `;

    const pad = (p.sectionPadding as Spacing | undefined) ?? {
      t: 32,
      r: 25,
      b: 32,
      l: 25,
    };

    // MJML's `mj-section background-url` emits the canonical Schneider
    // VML markup automatically: `<v:rect><v:fill type="tile" src color>
    // <v:textbox mso-fit-shape-to-text>...content...</v:textbox></v:rect>`.
    // We get bulletproof Outlook bg image rendering for free, and the
    // overlay card flows naturally inside the section's content td.
    return `
      <mj-section css-class="banner"
        background-url="${escapeAttr(p.imageUrl)}"
        background-size="cover"
        background-repeat="no-repeat"
        background-position="center center"
        background-color="${escapeAttr(p.bgFallback)}"
        padding="${spacing(pad as never)}">
        <mj-column vertical-align="middle">
          <mj-raw>${overlayCard}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
