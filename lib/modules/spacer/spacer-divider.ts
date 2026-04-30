import type { Module } from "../types";
import { BRAND, escapeAttr, spacing } from "../helpers";

export const spacerDivider: Module = {
  id: "spacer-divider",
  category: "spacer",
  label: "Horizontal divider",
  schema: {
    color: {
      type: "color",
      label: "Line color",
      default: BRAND.border,
      group: "Style",
    },
    thickness: {
      type: "number",
      label: "Thickness",
      default: 1,
      min: 1,
      max: 8,
      unit: "px",
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
      default: { t: 8, r: 32, b: 8, l: 32 },
      group: "Layout",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-divider border-width="${Number(p.thickness)}px" border-style="solid" border-color="${escapeAttr(p.color)}" padding="0" />
      </mj-column>
    </mj-section>
  `,
};
