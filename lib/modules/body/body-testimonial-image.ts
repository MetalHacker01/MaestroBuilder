import type { Module } from "../types";
import { BRAND, escapeAttr, spacing } from "../helpers";

/**
 * Testimonial image — pattern from MasterClass exampleCorporate.html line
 * 217-235. A clickable image with descriptive alt text. Used for design-
 * heavy quote graphics that need to survive image blocking by falling
 * back to readable alt text. The image is the entire content; no inline
 * text is needed.
 */
export const bodyTestimonialImage: Module = {
  id: "body-testimonial-image",
  category: "body",
  label: "Testimonial image (clickable)",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Testimonial graphic URL",
      default: "https://picsum.photos/seed/maestro-testimonial/1120/420",
      group: "Image",
    },
    altText: {
      type: "text",
      label: "Alt text (the quote — used by screen readers + when images are blocked)",
      default:
        "“This is the only no-coding AI course you need as a business leader.” – Ritu K., Product Marketing Manager",
      group: "Image",
    },
    href: {
      type: "url",
      label: "Click-through URL",
      default: "https://martech-maestro-folio-sroh.vercel.app/",
      group: "Image",
    },
    bgColor: {
      type: "color",
      label: "Section background",
      default: BRAND.surfaceWarm,
      group: "Layout",
    },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 0, r: 40, b: 40, l: 40 },
      group: "Layout",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-image
          src="${escapeAttr(p.imageUrl)}"
          alt="${escapeAttr(p.altText)}"
          href="${escapeAttr(p.href)}"
          fluid-on-mobile="true"
          padding="0" />
      </mj-column>
    </mj-section>
  `,
};
