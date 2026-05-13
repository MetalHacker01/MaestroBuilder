import type { Module } from "../types";
import { BRAND, escapeAttr, spacing } from "../helpers";

export const logoCenter: Module = {
  id: "logo-center",
  category: "logo",
  label: "Logo (center)",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Logo image URL",
      default: "/maestro-logo.png",
      group: "Image",
    },
    altText: { type: "text", label: "Alt text", default: "Logo", group: "Image" },
    href: { type: "url", label: "Click-through URL", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Image" },
    width: {
      type: "number", label: "Logo width", default: 120, min: 40, max: 600, unit: "px", group: "Image",
    },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Layout" },
    padding: {
      type: "spacing", label: "Padding",
      default: { t: 28, r: 32, b: 20, l: 32 },
      group: "Layout",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-image align="center" src="${escapeAttr(p.imageUrl)}" alt="${escapeAttr(p.altText)}" href="${escapeAttr(p.href)}" width="${Number(p.width)}px" />
      </mj-column>
    </mj-section>
  `,
};
