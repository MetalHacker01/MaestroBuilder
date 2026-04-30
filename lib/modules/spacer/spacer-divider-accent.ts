import type { Module } from "../types";
import { BRAND, escapeAttr, spacing } from "../helpers";

/**
 * Short, centred coloured rule used as a "section accent" under a headline —
 * editorial flourish that gives the layout rhythm without a full divider.
 */
export const spacerDividerAccent: Module = {
  id: "spacer-divider-accent",
  category: "spacer",
  label: "Accent rule (short coloured line)",
  schema: {
    color: {
      type: "color",
      label: "Line color",
      default: BRAND.accent,
      group: "Style",
    },
    width: {
      type: "number",
      label: "Length",
      default: 56,
      min: 16,
      max: 200,
      unit: "px",
      group: "Style",
    },
    thickness: {
      type: "number",
      label: "Thickness",
      default: 3,
      min: 1,
      max: 8,
      unit: "px",
      group: "Style",
    },
    align: {
      type: "align",
      label: "Align",
      default: "center",
      group: "Style",
    },
    bgColor: {
      type: "color",
      label: "Background",
      default: BRAND.surface,
      group: "Layout",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 16, r: 24, b: 16, l: 24 },
      group: "Layout",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-divider align="${escapeAttr(p.align)}" border-width="${Number(p.thickness)}px" border-style="solid" border-color="${escapeAttr(p.color)}" width="${Number(p.width)}px" padding="0" />
      </mj-column>
    </mj-section>
  `,
};
