import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * Full-width editorial image card with optional headline + caption underneath.
 * Image gets rounded corners (modern look) — Outlook ignores `border-radius`
 * on `<img>` so the corners are square in Outlook desktop, which is fine.
 */
export const bodyImageCard: Module = {
  id: "body-image-card",
  category: "body",
  label: "Image card with caption",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Image URL",
      default: "https://picsum.photos/seed/maestro-card/1280/700",
      group: "Image",
    },
    altText: {
      type: "text",
      label: "Alt text",
      default: "Photo",
      group: "Image",
    },
    href: { type: "url", label: "Click-through URL", default: "#", group: "Image" },
    radius: {
      type: "number",
      label: "Image radius",
      default: 12,
      min: 0,
      max: 24,
      unit: "px",
      group: "Image",
    },
    headline: {
      type: "richtext",
      label: "Headline (optional)",
      default: "<strong>Headline goes here</strong>",
      group: "Caption",
    },
    paragraph: {
      type: "richtext",
      label: "Caption (optional)",
      default: "Short caption explaining the image, max ~2 lines.",
      group: "Caption",
    },
    headlineColor: { type: "color", label: "Headline color", default: BRAND.heading, group: "Style" },
    paragraphColor: { type: "color", label: "Caption color", default: BRAND.muted, group: "Style" },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Style" },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 16, r: 24, b: 24, l: 24 },
      group: "Style",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-image src="${escapeAttr(p.imageUrl)}" alt="${escapeAttr(p.altText)}" href="${escapeAttr(p.href)}" fluid-on-mobile="true" border-radius="${Number(p.radius)}px" padding="0 0 16px 0" />
        ${p.headline ? `<mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h3}px" line-height="1.3" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 0 6px 0">${safeHtml(p.headline)}</mj-text>` : ``}
        ${p.paragraph ? `<mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.small}px" line-height="1.55" color="${escapeAttr(p.paragraphColor)}" padding="0">${safeHtml(p.paragraph)}</mj-text>` : ``}
      </mj-column>
    </mj-section>
  `,
};
