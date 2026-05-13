import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * Three-column feature row: icon/image, title, blurb, optional link per column.
 * Stacks to single-column on mobile via MJML's responsive defaults.
 */
export const bodyThreeColumns: Module = {
  id: "body-three-columns",
  category: "body",
  label: "Three-column feature row",
  schema: {
    sectionHeadline: {
      type: "richtext",
      label: "Section headline (optional)",
      default: "<strong>Why teams choose us</strong>",
      group: "Section",
    },
    showSectionHeadline: {
      type: "select",
      label: "Show section headline",
      default: "yes",
      options: [
        { label: "Show", value: "yes" },
        { label: "Hide", value: "no" },
      ],
      group: "Section",
    },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Section" },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 32, r: 16, b: 32, l: 16 },
      group: "Section",
    },

    col1Icon: { type: "image-url", label: "Icon 1 URL", default: "https://placehold.co/80x80/111111/ffffff/png?text=1", group: "Column 1" },
    col1Title: { type: "richtext", label: "Title 1", default: "<strong>First benefit</strong>", group: "Column 1" },
    col1Body: { type: "richtext", label: "Body 1", default: "Short description of the first benefit and what it solves for the reader.", group: "Column 1" },
    col1LinkText: { type: "text", label: "Link text 1", default: "Learn more", group: "Column 1" },
    col1LinkUrl: { type: "url", label: "Link URL 1", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Column 1" },

    col2Icon: { type: "image-url", label: "Icon 2 URL", default: "https://placehold.co/80x80/111111/ffffff/png?text=2", group: "Column 2" },
    col2Title: { type: "richtext", label: "Title 2", default: "<strong>Second benefit</strong>", group: "Column 2" },
    col2Body: { type: "richtext", label: "Body 2", default: "Short description of the second benefit and what it solves for the reader.", group: "Column 2" },
    col2LinkText: { type: "text", label: "Link text 2", default: "Learn more", group: "Column 2" },
    col2LinkUrl: { type: "url", label: "Link URL 2", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Column 2" },

    col3Icon: { type: "image-url", label: "Icon 3 URL", default: "https://placehold.co/80x80/111111/ffffff/png?text=3", group: "Column 3" },
    col3Title: { type: "richtext", label: "Title 3", default: "<strong>Third benefit</strong>", group: "Column 3" },
    col3Body: { type: "richtext", label: "Body 3", default: "Short description of the third benefit and what it solves for the reader.", group: "Column 3" },
    col3LinkText: { type: "text", label: "Link text 3", default: "Learn more", group: "Column 3" },
    col3LinkUrl: { type: "url", label: "Link URL 3", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Column 3" },

    iconSize: { type: "number", label: "Icon size", default: 56, min: 24, max: 120, unit: "px", group: "Style" },
    titleColor: { type: "color", label: "Title color", default: BRAND.heading, group: "Style" },
    bodyColor: { type: "color", label: "Body color", default: BRAND.text, group: "Style" },
    linkColor: { type: "color", label: "Link color", default: BRAND.accent, group: "Style" },
  },
  render: (p) => {
    const showHeadline = p.showSectionHeadline !== "no";
    // Each column has consistent inner padding (vertical breathing room
    // when columns stack on mobile) AND css-class `mb-three-col` so the
    // shell media query can bump the bottom padding on mobile.
    const renderCol = (
      icon: unknown,
      title: unknown,
      body: unknown,
      linkText: unknown,
      linkUrl: unknown
    ) => `
      <mj-column css-class="mb-three-col" width="33.33%" vertical-align="top" padding="12px 8px 20px 8px">
        <mj-image src="${escapeAttr(icon)}" alt="" width="${Number(p.iconSize)}px" align="center" padding="0 0 14px 0" />
        <mj-text align="center" font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h3}px" line-height="1.25" font-weight="700" color="${escapeAttr(p.titleColor)}" padding="0 0 8px 0">${safeHtml(title)}</mj-text>
        <mj-text align="center" font-family="${FONT_STACK}" font-size="${TYPE_SCALE.body}px" line-height="1.55" color="${escapeAttr(p.bodyColor)}" padding="0 0 10px 0">${safeHtml(body)}</mj-text>
        ${linkText ? `<mj-text align="center" font-family="${FONT_STACK}" font-size="${TYPE_SCALE.small}px" line-height="1.4" color="${escapeAttr(p.linkColor)}" font-weight="600" padding="0"><a href="${escapeAttr(linkUrl)}" style="color:${escapeAttr(p.linkColor)};text-decoration:none;">${escapeAttr(linkText)} &rsaquo;</a></mj-text>` : ``}
      </mj-column>
    `;

    // Two sections (headline + columns). compile.ts annotates EVERY
    // `<mj-section>` in a module's output with the same uid, so both
    // sections share the click-to-select wiring in the editor.
    const pad = p.padding as { t: number; r: number; b: number; l: number };

    return `
      ${showHeadline
        ? `
        <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${pad.t}px ${pad.r}px 0 ${pad.l}px">
          <mj-column>
            <mj-text align="center" font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h2}px" line-height="1.2" font-weight="700" color="${escapeAttr(p.titleColor)}" padding="0 8px 16px 8px">${safeHtml(p.sectionHeadline)}</mj-text>
          </mj-column>
        </mj-section>
      `
        : ``}
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${showHeadline ? `0 ${pad.r}px ${pad.b}px ${pad.l}px` : spacing(p.padding as never)}">
        ${renderCol(p.col1Icon, p.col1Title, p.col1Body, p.col1LinkText, p.col1LinkUrl)}
        ${renderCol(p.col2Icon, p.col2Title, p.col2Body, p.col2LinkText, p.col2LinkUrl)}
        ${renderCol(p.col3Icon, p.col3Title, p.col3Body, p.col3LinkText, p.col3LinkUrl)}
      </mj-section>
    `;
  },
};
