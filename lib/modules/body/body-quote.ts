import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * Pull-quote / testimonial. Emphasises the quote with editorial typography
 * (large italic-ish weight) and an attribution line below.
 */
export const bodyQuote: Module = {
  id: "body-quote",
  category: "body",
  label: "Quote / Testimonial",
  schema: {
    quote: {
      type: "richtext",
      label: "Quote",
      default:
        "&ldquo;The new builder cut our email QA cycle from two days to two hours. The bulletproof exports just work, every time.&rdquo;",
      group: "Content",
    },
    attribution: {
      type: "richtext",
      label: "Attribution",
      default: "<strong>Sara Chen</strong> &middot; Head of Lifecycle, Acme Co.",
      group: "Content",
    },
    accentColor: {
      type: "color",
      label: "Accent rule color",
      default: BRAND.accent,
      group: "Style",
    },
    quoteColor: {
      type: "color",
      label: "Quote color",
      default: BRAND.heading,
      group: "Style",
    },
    attributionColor: {
      type: "color",
      label: "Attribution color",
      default: BRAND.muted,
      group: "Style",
    },
    bgColor: {
      type: "color",
      label: "Background",
      default: BRAND.surfaceWarm,
      group: "Style",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 40, r: 48, b: 40, l: 48 },
      group: "Style",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-divider border-width="3px" border-style="solid" border-color="${escapeAttr(p.accentColor)}" width="40px" align="left" padding="0 0 16px 0" />
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h2}px" line-height="1.4" font-weight="500" color="${escapeAttr(p.quoteColor)}" padding="0 0 16px 0">${safeHtml(p.quote)}</mj-text>
        <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.small}px" line-height="1.5" color="${escapeAttr(p.attributionColor)}" padding="0">${safeHtml(p.attribution)}</mj-text>
      </mj-column>
    </mj-section>
  `,
};
