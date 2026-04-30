import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

export const bodyHeadlineParagraph: Module = {
  id: "body-headline-paragraph",
  category: "body",
  label: "Headline + Paragraph",
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
        "Tell your story here. Click anywhere on this text to edit it.",
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
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-text align="${escapeAttr(p.align)}" font-family="${FONT_STACK}" font-size="${Number(p.headlineSize)}px" line-height="1.2" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 0 12px 0">${safeHtml(p.headline)}</mj-text>
        <mj-text align="${escapeAttr(p.align)}" font-family="${FONT_STACK}" font-size="${Number(p.paragraphSize)}px" line-height="1.55" color="${escapeAttr(p.paragraphColor)}" padding="0">${safeHtml(p.paragraph)}</mj-text>
      </mj-column>
    </mj-section>
  `,
};
