import type { Module } from "../types";
import { BRAND, escapeAttr, spacing } from "../helpers";

export const bannerHero: Module = {
  id: "banner-hero",
  category: "banner",
  label: "Hero banner (full-width image)",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Image URL",
      default: "https://picsum.photos/seed/maestro-hero/1280/520",
      group: "Image",
    },
    altText: {
      type: "text",
      label: "Alt text",
      default: "Banner",
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
      label: "Background",
      default: BRAND.surface,
      group: "Layout",
    },
    padding: {
      type: "spacing",
      label: "Padding",
      default: { t: 0, r: 0, b: 0, l: 0 },
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
