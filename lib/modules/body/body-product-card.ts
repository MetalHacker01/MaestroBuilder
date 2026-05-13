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
 * Single-product card: image on top, then title, optional rating/category
 * line, price (with optional strikethrough original), short description and
 * CTA. Standard ecommerce / lookbook block.
 */
export const bodyProductCard: Module = {
  id: "body-product-card",
  category: "body",
  label: "Product card",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Product image URL",
      default: "https://picsum.photos/seed/maestro-product/640/480",
      group: "Image",
    },
    altText: { type: "text", label: "Alt text", default: "Product photo", group: "Image" },
    imageRadius: {
      type: "number",
      label: "Image radius",
      default: 12,
      min: 0,
      max: 24,
      unit: "px",
      group: "Image",
    },

    kicker: {
      type: "text",
      label: "Kicker (category / new arrival)",
      default: "NEW ARRIVAL",
      group: "Content",
    },
    title: {
      type: "richtext",
      label: "Product title",
      default: "<strong>Product name goes here</strong>",
      group: "Content",
    },
    description: {
      type: "richtext",
      label: "Description",
      default: "Short, persuasive product description — one or two sentences max.",
      group: "Content",
    },

    showOriginalPrice: {
      type: "select",
      label: "Show original price",
      default: "yes",
      options: [
        { label: "Show (sale style)", value: "yes" },
        { label: "Hide", value: "no" },
      ],
      group: "Price",
    },
    price: { type: "text", label: "Price", default: "$59.00", group: "Price" },
    originalPrice: { type: "text", label: "Original price", default: "$79.00", group: "Price" },
    priceColor: { type: "color", label: "Price colour", default: BRAND.accent, group: "Price" },
    originalPriceColor: { type: "color", label: "Original price colour", default: BRAND.muted, group: "Price" },

    ctaText: { type: "text", label: "Button text", default: "Add to cart", group: "Button" },
    ctaUrl: { type: "url", label: "Button link", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Button" },
    ctaBgColor: { type: "color", label: "Button colour", default: BRAND.heading, group: "Button" },
    ctaTextColor: { type: "color", label: "Button text colour", default: "#ffffff", group: "Button" },
    ctaRadius: { type: "number", label: "Button radius", default: 8, min: 0, max: 32, unit: "px", group: "Button" },

    kickerColor: { type: "color", label: "Kicker colour", default: BRAND.accent, group: "Style" },
    titleColor: { type: "color", label: "Title colour", default: BRAND.heading, group: "Style" },
    descriptionColor: { type: "color", label: "Description colour", default: BRAND.text, group: "Style" },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Style" },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 32, r: 32, b: 32, l: 32 },
      group: "Style",
    },
  },
  render: (p) => {
    const showOriginal = p.showOriginalPrice !== "no";
    const buttonHtml = bulletproofButton({
      href: String(p.ctaUrl ?? "#"),
      text: String(p.ctaText ?? "Add to cart"),
      bgColor: String(p.ctaBgColor ?? BRAND.heading),
      textColor: String(p.ctaTextColor ?? "#ffffff"),
      radius: Number(p.ctaRadius ?? 8),
      align: "left",
    });

    // Use `&nbsp;` between prices because Outlook ignores `margin-right`
    // on inline `<span>` elements (Word renderer treats them as if they
    // had `margin:0`). The non-breaking spaces survive every client and
    // keep the two prices from colliding.
    const priceHtml = showOriginal
      ? `<span style="color:${escapeAttr(p.originalPriceColor)};text-decoration:line-through;font-weight:500;">${escapeAttr(p.originalPrice)}</span>&nbsp;&nbsp;&nbsp;<span style="color:${escapeAttr(p.priceColor)};font-weight:700;">${escapeAttr(p.price)}</span>`
      : `<span style="color:${escapeAttr(p.priceColor)};font-weight:700;">${escapeAttr(p.price)}</span>`;

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-image src="${escapeAttr(p.imageUrl)}" alt="${escapeAttr(p.altText)}" fluid-on-mobile="true" border-radius="${Number(p.imageRadius)}px" padding="0 0 16px 0" />
          ${p.kicker ? `<mj-text font-family="${FONT_STACK}" font-size="11px" font-weight="700" letter-spacing="0.08em" color="${escapeAttr(p.kickerColor)}" padding="0 0 6px 0">${escapeAttr(p.kicker)}</mj-text>` : ``}
          <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h3}px" line-height="1.25" font-weight="700" color="${escapeAttr(p.titleColor)}" padding="0 0 8px 0">${safeHtml(p.title)}</mj-text>
          <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.body}px" line-height="1.55" color="${escapeAttr(p.descriptionColor)}" padding="0 0 12px 0">${safeHtml(p.description)}</mj-text>
          <mj-text font-family="${FONT_STACK}" font-size="20px" line-height="1.2" padding="0 0 4px 0">${priceHtml}</mj-text>
          <mj-spacer height="20px" />
          <mj-raw>${buttonHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
