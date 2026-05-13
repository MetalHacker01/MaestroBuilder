import type { Module } from "../types";
import {
  BRAND,
  FONT_STACK,
  bulletproofButton,
  escapeAttr,
  safeHtml,
  spacing,
} from "../helpers";

/**
 * Promo callout — pattern from MasterClass exampleCorporate.html line
 * 273-323. A coloured rounded panel with H2 headline + subhead + centered
 * CTA. Useful for "stay ahead" / "join now" closers above the footer.
 * Outlook renders square corners on the panel (border-radius ignored) —
 * acceptable trade-off.
 */
export const bodyPromoCallout: Module = {
  id: "body-promo-callout",
  category: "body",
  label: "Promo callout (coloured panel + CTA)",
  schema: {
    headline: {
      type: "richtext",
      label: "Headline",
      default: "Stay ahead of the curve",
      group: "Content",
    },
    subhead: {
      type: "richtext",
      label: "Subhead",
      default: "Build the skills to lead, not just catch up.",
      group: "Content",
    },
    headlineColor: {
      type: "color",
      label: "Headline colour",
      default: BRAND.heading,
      group: "Content",
    },
    subheadColor: {
      type: "color",
      label: "Subhead colour",
      default: BRAND.heading,
      group: "Content",
    },
    panelColor: {
      type: "color",
      label: "Panel colour",
      default: "#FBF3DB",
      group: "Style",
    },
    panelRadius: {
      type: "number",
      label: "Panel corner radius",
      default: 12,
      min: 0,
      max: 32,
      unit: "px",
      group: "Style",
    },
    ctaText: { type: "text", label: "Button text", default: "Start now", group: "Button" },
    ctaUrl: { type: "url", label: "Button link", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Button" },
    ctaBgColor: { type: "color", label: "Button colour", default: BRAND.heading, group: "Button" },
    ctaTextColor: { type: "color", label: "Button text colour", default: "#ffffff", group: "Button" },
    ctaRadius: { type: "number", label: "Button radius", default: 8, min: 0, max: 32, unit: "px", group: "Button" },
    bgColor: {
      type: "color",
      label: "Section background",
      default: BRAND.surfaceWarm,
      group: "Layout",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 0, r: 32, b: 32, l: 32 },
      group: "Layout",
    },
  },
  render: (p) => {
    const panelColor = escapeAttr(p.panelColor);
    const panelRadius = Number(p.panelRadius ?? 12);
    const buttonHtml = bulletproofButton({
      href: String(p.ctaUrl ?? "#"),
      text: String(p.ctaText ?? "Start now"),
      bgColor: String(p.ctaBgColor ?? BRAND.heading),
      textColor: String(p.ctaTextColor ?? "#ffffff"),
      radius: Number(p.ctaRadius ?? 8),
      align: "center",
    });

    const panelHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0"
        align="center" width="100%"
        style="background:${panelColor};background-color:${panelColor};border-radius:${panelRadius}px;border-collapse:separate;">
        <tr>
          <td align="center" bgcolor="${panelColor}"
            style="background:${panelColor};border-radius:${panelRadius}px ${panelRadius}px 0 0;padding:48px 32px 12px 32px;font-family:${FONT_STACK};font-size:32px;line-height:1.2;font-weight:700;color:${escapeAttr(p.headlineColor)};text-align:center;">
            ${safeHtml(p.headline)}
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="${panelColor}"
            style="background:${panelColor};padding:0 32px 28px 32px;font-family:${FONT_STACK};font-size:16px;line-height:1.5;color:${escapeAttr(p.subheadColor)};text-align:center;">
            ${safeHtml(p.subhead)}
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="${panelColor}"
            style="background:${panelColor};border-radius:0 0 ${panelRadius}px ${panelRadius}px;padding:0 32px 44px 32px;text-align:center;">
            ${buttonHtml}
          </td>
        </tr>
      </table>
    `;

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-raw>${panelHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
