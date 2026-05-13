import type { Module } from "../types";
import { BRAND, bulletproofButton, escapeAttr, spacing } from "../helpers";

export const bodyCtaOnly: Module = {
  id: "body-cta-only",
  category: "body",
  label: "CTA button (bulletproof)",
  schema: {
    ctaText: {
      type: "text",
      label: "Button text",
      default: "Click here",
      group: "Button",
    },
    ctaUrl: {
      type: "url",
      label: "Button link",
      default: "https://martech-maestro-folio-sroh.vercel.app/",
      group: "Button",
    },
    ctaBgColor: {
      type: "color",
      label: "Button color",
      default: BRAND.accent,
      group: "Button",
    },
    ctaTextColor: {
      type: "color",
      label: "Button text color",
      default: "#ffffff",
      group: "Button",
    },
    ctaRadius: {
      type: "number",
      label: "Button radius",
      default: 8,
      min: 0,
      max: 32,
      unit: "px",
      group: "Button",
    },
    ctaPaddingY: {
      type: "number",
      label: "Padding Y",
      default: 12,
      min: 4,
      max: 28,
      unit: "px",
      group: "Button",
    },
    ctaPaddingX: {
      type: "number",
      label: "Padding X",
      default: 28,
      min: 8,
      max: 60,
      unit: "px",
      group: "Button",
    },
    ctaAlign: {
      type: "align",
      label: "Align",
      default: "center",
      group: "Button",
    },
    outline: {
      type: "select",
      label: "Style",
      default: "solid",
      group: "Button",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Outline (ghost)", value: "outline" },
      ],
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
      default: { t: 16, r: 24, b: 32, l: 24 },
      group: "Layout",
    },
  },
  render: (p) => {
    const buttonHtml = bulletproofButton({
      href: String(p.ctaUrl ?? "#"),
      text: String(p.ctaText ?? "Click"),
      bgColor: String(p.ctaBgColor ?? BRAND.accent),
      textColor: String(p.ctaTextColor ?? "#ffffff"),
      radius: Number(p.ctaRadius ?? 8),
      paddingY: Number(p.ctaPaddingY ?? 12),
      paddingX: Number(p.ctaPaddingX ?? 28),
      align: (p.ctaAlign as "left" | "center" | "right") ?? "center",
      outline: p.outline === "outline",
    });

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-raw>${buttonHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
