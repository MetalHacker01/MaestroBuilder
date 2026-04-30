import type { Module } from "../types";
import {
  BRAND,
  FONT_STACK,
  TYPE_SCALE,
  bulletproofBgImage,
  escapeAttr,
  safeHtml,
  spacing,
} from "../helpers";

/**
 * Hero with full-width background image and a translucent text-overlay card.
 *
 * Renders correctly in Outlook 2007-2019 desktop via:
 *   - `<v:rect>` + `<v:fill type="frame">` for the background image
 *   - `<v:roundrect>` for the overlay card so corners are ROUNDED (not
 *     squared) on Outlook desktop too
 *   - explicit height + `valign="middle"` so the overlay is vertically
 *     centred inside the banner instead of pinned to the top
 *
 * If the image is blocked or stripped, the fallback `bgColor` shows a
 * brand-coloured banner — design the fallback colour to be readable
 * against the overlay card.
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
    altText: {
      type: "text",
      label: "Alt text (image)",
      default: "Hero background",
      group: "Image",
    },
    bgFallback: {
      type: "color",
      label: "Fallback colour (image blocked)",
      default: "#1F2937",
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
      label: "Overlay card colour",
      default: "#0F172A",
      group: "Overlay",
    },
    overlayWidth: {
      type: "number",
      label: "Overlay card width",
      default: 480,
      min: 280,
      max: 600,
      unit: "px",
      group: "Overlay",
    },
    overlayRadius: {
      type: "number",
      label: "Overlay card radius",
      default: 12,
      min: 0,
      max: 32,
      unit: "px",
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
    ctaUrl: { type: "url", label: "Button link", default: "https://example.com", group: "Button" },
    ctaBgColor: { type: "color", label: "Button colour", default: BRAND.accent, group: "Button" },
    ctaTextColor: { type: "color", label: "Button text colour", default: "#ffffff", group: "Button" },
    ctaRadius: { type: "number", label: "Button radius", default: 8, min: 0, max: 32, unit: "px", group: "Button" },
    bannerHeight: {
      type: "number",
      label: "Banner height",
      default: 360,
      min: 200,
      max: 720,
      unit: "px",
      group: "Layout",
    },
    bannerWidth: {
      type: "number",
      label: "Banner width",
      default: 640,
      min: 320,
      max: 720,
      unit: "px",
      group: "Layout",
    },
    padding: {
      type: "spacing",
      label: "Outer padding",
      default: { t: 0, r: 0, b: 0, l: 0 },
      group: "Layout",
    },
  },
  render: (p) => {
    const showButton = p.showButton !== "no";
    const overlayWidth = Number(p.overlayWidth ?? 480);
    const overlayRadius = Number(p.overlayRadius ?? 12);

    // CTA inside the hero overlay uses a pure HTML table button (no VML
    // <v:roundrect>) because nested VML inside the <v:textbox> of a
    // <v:rect position:absolute> doesn't position correctly in Outlook —
    // the rounded button drifts to the document origin (top-left). The
    // ExampleEmail.txt pattern (line ~654) is the documented safe route:
    // bgcolor + border-radius on a <td>. Outlook desktop renders square
    // corners; every other client renders rounded. Other modules (where
    // there's no VML wrapper around them) keep using bulletproofButton.
    const ctaBgColor = String(p.ctaBgColor ?? BRAND.accent);
    const ctaTextColor = String(p.ctaTextColor ?? "#ffffff");
    const ctaRadiusPx = Number(p.ctaRadius ?? 8);
    const buttonHtml = showButton
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse:separate;line-height:100%;margin:0 auto;">
          <tr>
            <td align="center" bgcolor="${ctaBgColor}"
              style="border:none;border-radius:${ctaRadiusPx}px;background:${ctaBgColor};mso-padding-alt:14px 32px;"
              valign="middle">
              <a href="${escapeAttr(p.ctaUrl ?? "#")}"
                 style="display:inline-block;background:${ctaBgColor};color:${ctaTextColor};font-family:${FONT_STACK};font-size:15px;font-weight:600;line-height:100%;letter-spacing:0.2px;text-decoration:none;text-align:center;padding:14px 32px;border-radius:${ctaRadiusPx}px;mso-padding-alt:0;"
                 target="_blank">
                ${escapeAttr(p.ctaText ?? "Get started")}
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

    // Flat HTML overlay — no nested VML <v:roundrect>. Inner content uses
    // a NESTED TABLE with `padding` on each `<td>` row instead of `<div
    // margin>` because email clients (notably Gmail and several mobile
    // ones) strip `margin` from `<div>`s while td-padding survives
    // everywhere. Webmail gets rounded outer corners via `border-radius`;
    // Outlook desktop renders square (the user-approved trade-off).
    const cardHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0"
        align="center" width="${overlayWidth}"
        style="width:${overlayWidth}px;max-width:90%;">
        <tr>
          <td align="center" bgcolor="${escapeAttr(p.overlayColor)}"
            style="background-color:${escapeAttr(p.overlayColor)};border-radius:${overlayRadius}px;padding:32px 28px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
              <tr>
                <td align="center"
                  style="padding:0 0 16px 0;font-family:${FONT_STACK};font-size:${TYPE_SCALE.h1}px;font-weight:700;line-height:1.15;color:${escapeAttr(p.headlineColor)};text-align:center;">
                  ${safeHtml(p.headline)}
                </td>
              </tr>
              <tr>
                <td align="center"
                  style="padding:0 0 ${showButton ? "24" : "0"}px 0;font-family:${FONT_STACK};font-size:${TYPE_SCALE.body}px;line-height:1.55;color:${escapeAttr(p.paragraphColor)};text-align:center;">
                  ${safeHtml(p.paragraph)}
                </td>
              </tr>
              ${showButton ? `<tr><td align="center" style="padding:0;text-align:center;">${buttonHtml}</td></tr>` : ``}
            </table>
          </td>
        </tr>
      </table>
    `;

    // The bg image wrapper does the vertical centering (valign="middle"
    // on a height-explicit cell). That puts the overlay in the middle
    // of the banner instead of pinning it to the top.
    const bgHtml = bulletproofBgImage({
      imageUrl: String(p.imageUrl),
      width: Number(p.bannerWidth ?? 640),
      height: Number(p.bannerHeight ?? 360),
      bgColor: String(p.bgFallback ?? "#1F2937"),
      align: "center",
      innerHtml: cardHtml,
    });

    return `
      <mj-section background-color="${escapeAttr(p.bgFallback)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-raw>${bgHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
