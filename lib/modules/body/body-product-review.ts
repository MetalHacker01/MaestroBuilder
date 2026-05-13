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

/**
 * Product card with star rating + customer quote + CTA. Mirrors the
 * Klaviyo / Moonwalkers pattern from ExampleEmail.txt:
 *   title + tagline → product image → star pill → quote → author → CTA
 *
 * Stars are Unicode (★ U+2605 / ☆ U+2606) inside a bgcolor-filled pill,
 * so they render identically in every client without sprite images or
 * VML. The CTA uses the bulletproofButton helper for proper rounded
 * corners on Outlook.
 */

const STAR_FILLED = "★";
const STAR_EMPTY = "☆";

export const bodyProductReview: Module = {
  id: "body-product-review",
  category: "body",
  label: "Product card with rating",
  schema: {
    title: {
      type: "richtext",
      label: "Product title",
      default: "<strong>Moonwalkers Aero</strong>",
      group: "Content",
    },
    tagline: {
      type: "richtext",
      label: "Tagline / short description",
      default: "Lighter, quieter, and great for urban environments.",
      group: "Content",
    },

    imageUrl: {
      type: "image-url",
      label: "Product image URL",
      default: "https://picsum.photos/seed/maestro-product-review/600/400",
      group: "Image",
    },
    altText: {
      type: "text",
      label: "Alt text",
      default: "Product photo",
      group: "Image",
    },
    imageHref: {
      type: "url",
      label: "Image click-through URL",
      default: "https://martech-maestro-folio-sroh.vercel.app/",
      group: "Image",
    },
    imageRadius: {
      type: "number",
      label: "Image radius",
      default: 12,
      min: 0,
      max: 24,
      unit: "px",
      group: "Image",
    },

    showRating: {
      type: "select",
      label: "Show rating",
      default: "yes",
      options: [
        { label: "Show", value: "yes" },
        { label: "Hide", value: "no" },
      ],
      group: "Rating",
    },
    ratingCount: {
      type: "number",
      label: "Stars filled (out of 5)",
      default: 5,
      min: 1,
      max: 5,
      unit: "",
      group: "Rating",
    },
    ratingColor: {
      type: "color",
      label: "Star colour",
      default: "#111111",
      group: "Rating",
    },
    ratingBgColor: {
      type: "color",
      label: "Pill background",
      default: "#ffffff",
      group: "Rating",
    },

    showQuote: {
      type: "select",
      label: "Show quote",
      default: "yes",
      options: [
        { label: "Show", value: "yes" },
        { label: "Hide", value: "no" },
      ],
      group: "Quote",
    },
    quote: {
      type: "richtext",
      label: "Customer quote",
      default: "&ldquo;Great product. It feels like gliding.&rdquo;",
      group: "Quote",
    },
    author: {
      type: "richtext",
      label: "Author name",
      default: "Nikolaus O.",
      group: "Quote",
    },
    quoteColor: {
      type: "color",
      label: "Quote colour",
      default: BRAND.heading,
      group: "Quote",
    },
    authorColor: {
      type: "color",
      label: "Author colour",
      default: BRAND.muted,
      group: "Quote",
    },

    ctaText: {
      type: "text",
      label: "Button text",
      default: "Explore",
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
      label: "Button colour",
      default: BRAND.accent,
      group: "Button",
    },
    ctaTextColor: {
      type: "color",
      label: "Button text colour",
      default: "#ffffff",
      group: "Button",
    },
    ctaRadius: {
      type: "number",
      label: "Button radius",
      default: 999,
      min: 0,
      max: 999,
      unit: "px",
      group: "Button",
    },

    titleColor: {
      type: "color",
      label: "Title colour",
      default: BRAND.heading,
      group: "Style",
    },
    taglineColor: {
      type: "color",
      label: "Tagline colour",
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
      default: { t: 32, r: 32, b: 48, l: 32 },
      group: "Style",
    },
  },
  render: (p) => {
    const showRating = p.showRating !== "no";
    const showQuote = p.showQuote !== "no";

    // Build star string (e.g. "★★★★☆" for 4 of 5)
    const filled = Math.max(0, Math.min(5, Number(p.ratingCount ?? 5)));
    const stars = STAR_FILLED.repeat(filled) + STAR_EMPTY.repeat(5 - filled);

    const ratingHtml = showRating
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 18px auto;">
          <tr>
            <td align="center" bgcolor="${escapeAttr(p.ratingBgColor)}"
              style="background-color:${escapeAttr(p.ratingBgColor)};border-radius:6px;padding:4px 14px;font-family:${FONT_STACK};font-size:18px;letter-spacing:3px;color:${escapeAttr(p.ratingColor)};line-height:1;">
              ${stars}
            </td>
          </tr>
        </table>
      `
      : "";

    const quoteHtml = showQuote
      ? `
        <div style="font-family:${FONT_STACK};font-size:18px;line-height:1.4;font-weight:600;color:${escapeAttr(p.quoteColor)};margin:0 0 6px 0;text-align:center;">
          ${safeHtml(p.quote)}
        </div>
        <div style="font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:${escapeAttr(p.authorColor)};margin:0 0 24px 0;text-align:center;">
          ${safeHtml(p.author)}
        </div>
      `
      : "";

    const buttonHtml = bulletproofButton({
      href: String(p.ctaUrl ?? "#"),
      text: String(p.ctaText ?? "Explore"),
      bgColor: String(p.ctaBgColor ?? BRAND.accent),
      textColor: String(p.ctaTextColor ?? "#ffffff"),
      radius: Number(p.ctaRadius ?? 999),
      paddingY: 14,
      paddingX: 32,
      fontSize: 15,
      align: "center",
    });

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-text align="center" font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h2}px" line-height="1.25" font-weight="700" color="${escapeAttr(p.titleColor)}" padding="0 0 8px 0">${safeHtml(p.title)}</mj-text>
          <mj-text align="center" font-family="${FONT_STACK}" font-size="${TYPE_SCALE.body}px" line-height="1.5" color="${escapeAttr(p.taglineColor)}" padding="0 0 20px 0">${safeHtml(p.tagline)}</mj-text>
          <mj-image src="${escapeAttr(p.imageUrl)}" alt="${escapeAttr(p.altText)}" href="${escapeAttr(p.imageHref)}" fluid-on-mobile="true" border-radius="${Number(p.imageRadius)}px" padding="0 0 24px 0" />
          ${showRating ? `<mj-raw>${ratingHtml}</mj-raw>` : ``}
          ${showQuote ? `<mj-raw>${quoteHtml}</mj-raw>` : ``}
          <mj-raw>${buttonHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
