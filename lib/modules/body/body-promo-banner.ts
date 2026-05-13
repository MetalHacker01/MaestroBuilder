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
 * Promotional / discount banner — large offer headline, supporting subline,
 * optional redemption code panel and CTA. Used for "$49 off your next
 * purchase" / "30% off this weekend" / "Use code FALL2025" style emails.
 *
 * Pattern adapted from the Schneider / industry promo block: heavy display
 * type for the offer, smaller subline beneath, optional code chip, single
 * CTA — all on a brand-coloured surface (not an image, so no VML
 * complexity). Use `hero-bg-image` if you want a photo behind the offer.
 */
export const bodyPromoBanner: Module = {
  id: "body-promo-banner",
  category: "body",
  label: "Promo / discount banner",
  schema: {
    offer: {
      type: "richtext",
      label: "Offer headline",
      default: "<strong>$49 OFF</strong>",
      group: "Offer",
    },
    offerSize: {
      type: "number",
      label: "Offer size",
      default: 56,
      min: 28,
      max: 96,
      unit: "px",
      group: "Offer",
    },
    offerColor: {
      type: "color",
      label: "Offer colour",
      default: BRAND.accent,
      group: "Offer",
    },
    subline: {
      type: "richtext",
      label: "Subline",
      default: "Your next purchase",
      group: "Offer",
    },
    sublineColor: {
      type: "color",
      label: "Subline colour",
      default: BRAND.heading,
      group: "Offer",
    },

    showCode: {
      type: "select",
      label: "Show redemption code",
      default: "yes",
      options: [
        { label: "Show code", value: "yes" },
        { label: "Hide code", value: "no" },
      ],
      group: "Code",
    },
    codeLabel: {
      type: "text",
      label: "Code label",
      default: "Use code",
      group: "Code",
    },
    code: {
      type: "text",
      label: "Code",
      default: "WELCOME49",
      group: "Code",
    },
    codeColor: {
      type: "color",
      label: "Code text colour",
      default: BRAND.heading,
      group: "Code",
    },
    codeBgColor: {
      type: "color",
      label: "Code chip colour",
      default: BRAND.accentSoft,
      group: "Code",
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
    ctaText: { type: "text", label: "Button text", default: "Redeem now", group: "Button" },
    ctaUrl: { type: "url", label: "Button link", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Button" },
    ctaBgColor: { type: "color", label: "Button colour", default: BRAND.accent, group: "Button" },
    ctaTextColor: { type: "color", label: "Button text colour", default: "#ffffff", group: "Button" },
    ctaRadius: { type: "number", label: "Button radius", default: 8, min: 0, max: 32, unit: "px", group: "Button" },

    bgColor: {
      type: "color",
      label: "Background",
      default: BRAND.surfaceWarm,
      group: "Layout",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 40, r: 32, b: 40, l: 32 },
      group: "Layout",
    },
  },
  render: (p) => {
    const showCode = p.showCode !== "no";
    const showButton = p.showButton !== "no";

    const codeChipHtml = showCode
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
          <tr>
            <td style="font-family:${FONT_STACK};font-size:13px;color:${escapeAttr(p.sublineColor)};padding:0 8px 0 0;">
              ${escapeAttr(p.codeLabel)}
            </td>
            <td style="font-family:${FONT_STACK};font-size:14px;font-weight:700;letter-spacing:1.2px;color:${escapeAttr(p.codeColor)};background-color:${escapeAttr(p.codeBgColor)};padding:6px 14px;border-radius:6px;">
              ${escapeAttr(p.code)}
            </td>
          </tr>
        </table>
      `
      : "";

    // Vertical gap between the code chip and the CTA, only when both are
    // shown (avoids a stray spacer when one is hidden).
    const codeButtonGapHtml =
      showCode && showButton
        ? `<div style="height:24px;line-height:24px;font-size:1px;mso-line-height-rule:exactly;">&#8202;</div>`
        : "";

    const buttonHtml = showButton
      ? bulletproofButton({
          href: String(p.ctaUrl ?? "#"),
          text: String(p.ctaText ?? "Redeem now"),
          bgColor: String(p.ctaBgColor ?? BRAND.accent),
          textColor: String(p.ctaTextColor ?? "#ffffff"),
          radius: Number(p.ctaRadius ?? 8),
          align: "center",
        })
      : "";

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-text align="center" font-family="${FONT_STACK}" font-size="${Number(p.offerSize)}px" line-height="1.05" font-weight="800" letter-spacing="-0.02em" color="${escapeAttr(p.offerColor)}" padding="0 0 8px 0">${safeHtml(p.offer)}</mj-text>
          <mj-text align="center" font-family="${FONT_STACK}" font-size="18px" line-height="1.3" font-weight="600" color="${escapeAttr(p.sublineColor)}" padding="0 0 ${showCode || showButton ? "20" : "0"}px 0">${safeHtml(p.subline)}</mj-text>
          ${showCode ? `<mj-raw>${codeChipHtml}</mj-raw>` : ``}
          ${codeButtonGapHtml ? `<mj-raw>${codeButtonGapHtml}</mj-raw>` : ``}
          ${showButton ? `<mj-raw>${buttonHtml}</mj-raw>` : ``}
        </mj-column>
      </mj-section>
    `;
  },
};
