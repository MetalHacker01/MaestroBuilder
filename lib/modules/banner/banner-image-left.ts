import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

export const bannerImageLeft: Module = {
  id: "banner-image-left",
  category: "banner",
  label: "Image left + Text right",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Image URL",
      default: "https://picsum.photos/seed/maestro-banner-l/600/600",
      group: "Image",
    },
    altText: { type: "text", label: "Alt text", default: "Image", group: "Image" },
    headline: {
      type: "richtext",
      label: "Headline",
      default: "<strong>Eye-catching headline</strong>",
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
      default: "Short, punchy supporting text describing the offer.",
      group: "Content",
    },
    paragraphColor: {
      type: "color",
      label: "Paragraph color",
      default: BRAND.text,
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
      default: { t: 0, r: 0, b: 0, l: 0 },
      group: "Layout",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column width="50%" vertical-align="middle">
        <mj-image src="${escapeAttr(p.imageUrl)}" alt="${escapeAttr(p.altText)}" fluid-on-mobile="true" padding="0" />
      </mj-column>
      <mj-column width="50%" vertical-align="middle">
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h2}px" line-height="1.2" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="24px 24px 8px 24px">${safeHtml(p.headline)}</mj-text>
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.body}px" line-height="1.55" color="${escapeAttr(p.paragraphColor)}" padding="0 24px 24px 24px">${safeHtml(p.paragraph)}</mj-text>
      </mj-column>
    </mj-section>
  `,
};
