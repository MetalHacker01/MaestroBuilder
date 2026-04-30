import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * Bulleted list with bulletproof colour-customisable markers. Outlook desktop
 * ignores `::marker` and CSS list-style-image, so we render the bullets via a
 * dedicated table column instead of `<ul>`.
 */
export const bodyBullets: Module = {
  id: "body-bullets",
  category: "body",
  label: "Bulleted list",
  schema: {
    headline: {
      type: "richtext",
      label: "Headline",
      default: "<strong>What you'll get</strong>",
      group: "Content",
    },
    headlineColor: {
      type: "color",
      label: "Headline color",
      default: BRAND.heading,
      group: "Content",
    },
    bullet1: {
      type: "richtext",
      label: "Bullet 1",
      default: "First benefit — quick to scan, specific to the offer.",
      group: "Bullets",
    },
    bullet2: {
      type: "richtext",
      label: "Bullet 2",
      default: "Second benefit — backed up with a number where you can.",
      group: "Bullets",
    },
    bullet3: {
      type: "richtext",
      label: "Bullet 3",
      default: "Third benefit — keeps the rhythm of three.",
      group: "Bullets",
    },
    bullet4: {
      type: "richtext",
      label: "Bullet 4 (optional)",
      default: "",
      group: "Bullets",
    },
    bullet5: {
      type: "richtext",
      label: "Bullet 5 (optional)",
      default: "",
      group: "Bullets",
    },
    bulletColor: {
      type: "color",
      label: "Bullet marker color",
      default: BRAND.accent,
      group: "Style",
    },
    textColor: {
      type: "color",
      label: "Bullet text color",
      default: BRAND.text,
      group: "Style",
    },
    bgColor: {
      type: "color",
      label: "Background",
      default: BRAND.surface,
      group: "Style",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 24, r: 32, b: 32, l: 32 },
      group: "Style",
    },
  },
  render: (p) => {
    const bullets = [p.bullet1, p.bullet2, p.bullet3, p.bullet4, p.bullet5]
      .map((b) => (typeof b === "string" ? b.trim() : ""))
      .filter(Boolean);

    const rows = bullets
      .map(
        (b) => `
          <tr>
            <td valign="top" align="center"
              style="width:24px;font-family:${FONT_STACK};font-size:18px;line-height:24px;color:${escapeAttr(p.bulletColor)};padding:4px 12px 8px 0;">
              ●
            </td>
            <td valign="top"
              style="font-family:${FONT_STACK};font-size:${TYPE_SCALE.body}px;line-height:1.55;color:${escapeAttr(p.textColor)};padding:4px 0 8px 0;">
              ${safeHtml(b)}
            </td>
          </tr>
        `
      )
      .join("");

    const tableHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        ${rows}
      </table>
    `;

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h2}px" line-height="1.2" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 0 16px 0">${safeHtml(p.headline)}</mj-text>
          <mj-raw>${tableHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
