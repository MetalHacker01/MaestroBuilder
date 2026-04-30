import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

export const bodyTwoColText: Module = {
  id: "body-2col-text",
  category: "body",
  label: "Two columns of text",
  schema: {
    leftHeadline: {
      type: "richtext",
      label: "Left headline",
      default: "<strong>Left column</strong>",
      group: "Left",
    },
    leftBody: {
      type: "richtext",
      label: "Left body",
      default: "Describe the first point here.",
      group: "Left",
    },
    rightHeadline: {
      type: "richtext",
      label: "Right headline",
      default: "<strong>Right column</strong>",
      group: "Right",
    },
    rightBody: {
      type: "richtext",
      label: "Right body",
      default: "Describe the second point here.",
      group: "Right",
    },
    headlineColor: {
      type: "color",
      label: "Headline color",
      default: BRAND.heading,
      group: "Style",
    },
    bodyColor: {
      type: "color",
      label: "Body color",
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
      default: { t: 32, r: 16, b: 32, l: 16 },
      group: "Style",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column width="50%" vertical-align="top">
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h3}px" line-height="1.3" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 16px 8px 16px">${safeHtml(p.leftHeadline)}</mj-text>
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.body}px" line-height="1.55" color="${escapeAttr(p.bodyColor)}" padding="0 16px">${safeHtml(p.leftBody)}</mj-text>
      </mj-column>
      <mj-column width="50%" vertical-align="top">
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h3}px" line-height="1.3" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 16px 8px 16px">${safeHtml(p.rightHeadline)}</mj-text>
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.body}px" line-height="1.55" color="${escapeAttr(p.bodyColor)}" padding="0 16px">${safeHtml(p.rightBody)}</mj-text>
      </mj-column>
    </mj-section>
  `,
};
