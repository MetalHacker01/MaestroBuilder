import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

export const footerLegal: Module = {
  id: "footer-legal",
  category: "footer",
  label: "Legal footer",
  schema: {
    body: {
      type: "richtext",
      label: "Legal copy",
      default:
        "&copy; 2026 Your Company. All rights reserved.<br/>123 Street Name, City, Country.<br/><a href=\"https://martech-maestro-folio-sroh.vercel.app/\" style=\"color:#111111;text-decoration:underline;\">Privacy policy</a>",
      group: "Content",
    },
    align: {
      type: "align",
      label: "Text align",
      default: "center",
      group: "Content",
    },
    fontSize: {
      type: "number",
      label: "Font size",
      default: TYPE_SCALE.caption,
      min: 9,
      max: 18,
      unit: "px",
      group: "Style",
    },
    textColor: {
      type: "color",
      label: "Text color",
      default: BRAND.muted,
      group: "Style",
    },
    bgColor: {
      type: "color",
      label: "Background",
      default: BRAND.surfaceWarm,
      group: "Style",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 24, r: 32, b: 24, l: 32 },
      group: "Style",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-text align="${escapeAttr(p.align)}" font-family="${FONT_STACK}" font-size="${Number(p.fontSize)}px" line-height="1.6" color="${escapeAttr(p.textColor)}" padding="0">${safeHtml(p.body)}</mj-text>
      </mj-column>
    </mj-section>
  `,
};
