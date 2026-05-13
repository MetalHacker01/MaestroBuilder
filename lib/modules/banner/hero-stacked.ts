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
 * Hero stacked — pattern from MasterClass exampleCorporate.html line 148-191.
 * Image on top, paragraph below it, centered CTA. No bg-image overlay
 * acrobatics; every row renders identically on every client.
 */
export const heroStacked: Module = {
  id: "hero-stacked",
  category: "banner",
  label: "Hero stacked (image + text + CTA)",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Image URL",
      default: "https://picsum.photos/seed/maestro-stacked/1280/520",
      group: "Image",
    },
    altText: {
      type: "text",
      label: "Alt text",
      default: "Hero image",
      group: "Image",
    },
    imageHref: {
      type: "url",
      label: "Image link",
      default: "https://martech-maestro-folio-sroh.vercel.app/",
      group: "Image",
    },
    paragraph: {
      type: "richtext",
      label: "Paragraph",
      default:
        "Professionals are choosing this course to build confidence, credibility, and practical AI fluency.",
      group: "Content",
    },
    paragraphColor: {
      type: "color",
      label: "Paragraph colour",
      default: BRAND.text,
      group: "Content",
    },
    showButton: {
      type: "select",
      label: "Show CTA",
      default: "yes",
      options: [
        { label: "Show CTA", value: "yes" },
        { label: "Hide CTA", value: "no" },
      ],
      group: "Button",
    },
    ctaText: { type: "text", label: "Button text", default: "Get started", group: "Button" },
    ctaUrl: { type: "url", label: "Button link", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Button" },
    ctaBgColor: { type: "color", label: "Button colour", default: BRAND.heading, group: "Button" },
    ctaTextColor: { type: "color", label: "Button text colour", default: "#ffffff", group: "Button" },
    ctaRadius: { type: "number", label: "Button radius", default: 8, min: 0, max: 32, unit: "px", group: "Button" },
    bgColor: {
      type: "color",
      label: "Section background",
      default: BRAND.surfaceWarm,
      group: "Layout",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 0, r: 0, b: 48, l: 0 },
      group: "Layout",
    },
  },
  render: (p) => {
    const showButton = p.showButton !== "no";
    const buttonHtml = showButton
      ? bulletproofButton({
          href: String(p.ctaUrl ?? "#"),
          text: String(p.ctaText ?? "Get started"),
          bgColor: String(p.ctaBgColor ?? BRAND.heading),
          textColor: String(p.ctaTextColor ?? "#ffffff"),
          radius: Number(p.ctaRadius ?? 8),
          align: "center",
        })
      : "";

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-image
            src="${escapeAttr(p.imageUrl)}"
            alt="${escapeAttr(p.altText)}"
            href="${escapeAttr(p.imageHref)}"
            fluid-on-mobile="true"
            padding="0" />
          <mj-text padding="28px 32px 0 32px"
            css-class="mb-hero-stacked-text"
            font-family="${FONT_STACK}"
            font-size="${TYPE_SCALE.body + 2}px"
            line-height="1.55"
            color="${escapeAttr(p.paragraphColor)}"
            align="center">
            ${safeHtml(p.paragraph)}
          </mj-text>
          ${showButton
            ? `<mj-spacer height="24px" />
               <mj-raw><div style="text-align:center;">${buttonHtml}</div></mj-raw>`
            : ``}
        </mj-column>
      </mj-section>
    `;
  },
};
