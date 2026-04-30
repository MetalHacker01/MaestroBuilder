import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

export const bodyTwoColImageText: Module = {
  id: "body-2col-image-text",
  category: "body",
  label: "Two columns: image + caption",
  schema: {
    leftImage: {
      type: "image-url",
      label: "Left image URL",
      default: "https://picsum.photos/seed/maestro-2col-1/280/200",
      group: "Left",
    },
    leftAlt: { type: "text", label: "Left alt", default: "Image 1", group: "Left" },
    leftCaption: {
      type: "richtext",
      label: "Left caption",
      default: "Caption for the left image.",
      group: "Left",
    },
    rightImage: {
      type: "image-url",
      label: "Right image URL",
      default: "https://picsum.photos/seed/maestro-2col-2/280/200",
      group: "Right",
    },
    rightAlt: { type: "text", label: "Right alt", default: "Image 2", group: "Right" },
    rightCaption: {
      type: "richtext",
      label: "Right caption",
      default: "Caption for the right image.",
      group: "Right",
    },
    captionColor: {
      type: "color",
      label: "Caption color",
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
      default: { t: 24, r: 16, b: 24, l: 16 },
      group: "Style",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column width="50%" vertical-align="top">
        <mj-image src="${escapeAttr(p.leftImage)}" alt="${escapeAttr(p.leftAlt)}" fluid-on-mobile="true" padding="0 16px 12px 16px" border-radius="8px" />
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.small}px" line-height="1.5" color="${escapeAttr(p.captionColor)}" padding="0 16px">${safeHtml(p.leftCaption)}</mj-text>
      </mj-column>
      <mj-column width="50%" vertical-align="top">
        <mj-image src="${escapeAttr(p.rightImage)}" alt="${escapeAttr(p.rightAlt)}" fluid-on-mobile="true" padding="0 16px 12px 16px" border-radius="8px" />
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.small}px" line-height="1.5" color="${escapeAttr(p.captionColor)}" padding="0 16px">${safeHtml(p.rightCaption)}</mj-text>
      </mj-column>
    </mj-section>
  `,
};
