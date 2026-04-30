import type { Module } from "../types";
import { BRAND, bulletproofButton, escapeAttr, spacing } from "../helpers";

/**
 * Side-by-side primary + secondary CTA pair (e.g. "Buy now" + "Learn more").
 * Both buttons survive Outlook desktop via the bulletproof VML pattern.
 */
export const bodyCtaPair: Module = {
  id: "body-cta-pair",
  category: "body",
  label: "CTA pair (primary + outline)",
  schema: {
    primaryText: { type: "text", label: "Primary button", default: "Get started", group: "Primary" },
    primaryUrl: { type: "url", label: "Primary URL", default: "https://example.com", group: "Primary" },
    primaryBg: { type: "color", label: "Primary fill", default: BRAND.accent, group: "Primary" },
    primaryFg: { type: "color", label: "Primary text", default: "#ffffff", group: "Primary" },

    secondaryText: { type: "text", label: "Secondary button", default: "Learn more", group: "Secondary" },
    secondaryUrl: { type: "url", label: "Secondary URL", default: "https://example.com/learn", group: "Secondary" },
    secondaryBorder: { type: "color", label: "Outline color", default: BRAND.accent, group: "Secondary" },
    secondaryFg: { type: "color", label: "Outline text", default: BRAND.accent, group: "Secondary" },

    radius: { type: "number", label: "Button radius", default: 8, min: 0, max: 32, unit: "px", group: "Style" },
    paddingY: { type: "number", label: "Button padding Y", default: 12, min: 4, max: 28, unit: "px", group: "Style" },
    paddingX: { type: "number", label: "Button padding X", default: 24, min: 8, max: 60, unit: "px", group: "Style" },

    align: {
      type: "align",
      label: "Group align",
      default: "center",
      group: "Layout",
    },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Layout" },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 16, r: 24, b: 32, l: 24 },
      group: "Layout",
    },
  },
  render: (p) => {
    const radius = Number(p.radius ?? 8);
    const padY = Number(p.paddingY ?? 12);
    const padX = Number(p.paddingX ?? 24);

    const primary = bulletproofButton({
      href: String(p.primaryUrl),
      text: String(p.primaryText),
      bgColor: String(p.primaryBg),
      textColor: String(p.primaryFg),
      radius, paddingY: padY, paddingX: padX,
      align: "left",
    });
    const secondary = bulletproofButton({
      href: String(p.secondaryUrl),
      text: String(p.secondaryText),
      outline: true,
      bgColor: String(p.secondaryBorder),
      borderColor: String(p.secondaryBorder),
      textColor: String(p.secondaryFg),
      radius, paddingY: padY, paddingX: padX,
      align: "left",
    });

    const groupAlign = (p.align as "left" | "center" | "right") ?? "center";

    // Side-by-side via a 2-cell table; stacks on narrow screens via display:block
    const tableHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${groupAlign}">
        <tr>
          <td style="padding-right:8px;">${primary}</td>
          <td style="padding-left:8px;">${secondary}</td>
        </tr>
      </table>
    `;

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-raw>${tableHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
