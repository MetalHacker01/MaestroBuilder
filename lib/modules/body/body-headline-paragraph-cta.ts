import type { Module } from "../types";
import {
  BRAND,
  FONT_STACK,
  TYPE_SCALE,
  bulletproofButton,
  escapeAttr,
  safeHtml,
  spacing,
} from "../helpers";

export const bodyHeadlineParagraphCta: Module = {
  id: "body-headline-paragraph-cta",
  category: "body",
  label: "Headline + Paragraph + CTA",
  schema: {
    headline: {
      type: "richtext",
      label: "Headline",
      default: "<strong>Your headline goes here</strong>",
      group: "Content",
    },
    headlineSize: {
      type: "number",
      label: "Headline size",
      default: TYPE_SCALE.h2,
      min: 14,
      max: 48,
      unit: "px",
      group: "Content",
    },
    headlineColor: {
      type: "color",
      label: "Headline color",
      default: BRAND.heading,
      group: "Content",
    },
    paragraph: {
      type: "richtext",
      label: "Paragraph",
      default:
        "Replace this with your message. You can <strong>bold</strong>, <em>italicize</em> and add <a href=\"#\">links</a>.",
      group: "Content",
    },
    paragraphSize: {
      type: "number",
      label: "Paragraph size",
      default: TYPE_SCALE.body,
      min: 11,
      max: 22,
      unit: "px",
      group: "Content",
    },
    paragraphColor: {
      type: "color",
      label: "Paragraph color",
      default: BRAND.text,
      group: "Content",
    },
    align: {
      type: "align",
      label: "Text align",
      default: "left",
      group: "Content",
    },
    ctaText: {
      type: "text",
      label: "Button text",
      default: "Register now",
      group: "Button",
    },
    ctaUrl: {
      type: "url",
      label: "Button link",
      default: "https://example.com",
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
      label: "Button align",
      default: "left",
      group: "Button",
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
      default: { t: 32, r: 32, b: 32, l: 32 },
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
      align: (p.ctaAlign as "left" | "center" | "right") ?? "left",
    });

    return `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-text
          align="${escapeAttr(p.align)}"
          font-family="${FONT_STACK}"
          font-size="${Number(p.headlineSize)}px"
          line-height="1.2"
          font-weight="700"
          color="${escapeAttr(p.headlineColor)}"
          padding="0 0 12px 0">${safeHtml(p.headline)}</mj-text>
        <mj-text
          align="${escapeAttr(p.align)}"
          font-family="${FONT_STACK}"
          font-size="${Number(p.paragraphSize)}px"
          line-height="1.55"
          color="${escapeAttr(p.paragraphColor)}"
          padding="0 0 20px 0">${safeHtml(p.paragraph)}</mj-text>
        <mj-raw>${buttonHtml}</mj-raw>
      </mj-column>
    </mj-section>
  `;
  },
};
