import type { Module } from "../types";
import { escapeAttr } from "../helpers";

export const spacerVertical: Module = {
  id: "spacer-vertical",
  category: "spacer",
  label: "Vertical spacer",
  schema: {
    height: {
      type: "number",
      label: "Height",
      default: 24,
      min: 4,
      max: 200,
      unit: "px",
      group: "Layout",
    },
    bgColor: {
      type: "color",
      label: "Background",
      default: "#ffffff",
      group: "Layout",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="0">
      <mj-column>
        <mj-spacer height="${Number(p.height)}px" />
      </mj-column>
    </mj-section>
  `,
};
