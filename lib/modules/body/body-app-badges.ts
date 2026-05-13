import type { Module } from "../types";
import { BRAND, FONT_STACK, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * App Store + Google Play "download badges" row. Two side-by-side image
 * links — universally supported because they're just `<img>` tags inside
 * `<a>` tags. Use the official badge artwork (Apple / Google have brand
 * guidelines requiring specific files; the placeholder URLs here just
 * render the right shape so the layout looks correct in the editor).
 */
export const bodyAppBadges: Module = {
  id: "body-app-badges",
  category: "body",
  label: "App Store / Google Play badges",
  schema: {
    headline: {
      type: "richtext",
      label: "Headline (optional)",
      default: "<strong>Get the app</strong>",
      group: "Content",
    },
    showHeadline: {
      type: "select",
      label: "Show headline",
      default: "yes",
      options: [
        { label: "Show", value: "yes" },
        { label: "Hide", value: "no" },
      ],
      group: "Content",
    },
    headlineColor: {
      type: "color",
      label: "Headline colour",
      default: BRAND.heading,
      group: "Content",
    },

    appStoreUrl: {
      type: "url",
      label: "App Store URL",
      default: "https://martech-maestro-folio-sroh.vercel.app/",
      group: "Apple",
    },
    appStoreImage: {
      type: "image-url",
      label: "App Store badge image",
      default: "https://placehold.co/270x80/0F172A/ffffff/png?text=App+Store&font=lato",
      group: "Apple",
    },

    playStoreUrl: {
      type: "url",
      label: "Google Play URL",
      default: "https://martech-maestro-folio-sroh.vercel.app/",
      group: "Google",
    },
    playStoreImage: {
      type: "image-url",
      label: "Google Play badge image",
      default: "https://placehold.co/270x80/0F172A/ffffff/png?text=Google+Play&font=lato",
      group: "Google",
    },

    badgeWidth: {
      type: "number",
      label: "Badge width",
      default: 160,
      min: 100,
      max: 240,
      unit: "px",
      group: "Style",
    },
    badgeGap: {
      type: "number",
      label: "Gap between badges",
      default: 24,
      min: 0,
      max: 60,
      unit: "px",
      group: "Style",
    },
    align: {
      type: "align",
      label: "Group align",
      default: "center",
      group: "Style",
    },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Style" },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 24, r: 32, b: 32, l: 32 },
      group: "Style",
    },
  },
  render: (p) => {
    const showHeadline = p.showHeadline !== "no";
    const align = (p.align as "left" | "center" | "right") ?? "center";
    const badgeWidth = Number(p.badgeWidth ?? 160);
    const badgeGap = Number(p.badgeGap ?? 16);

    // Use `padding-right` on the first badge's `<td>` for the gap.
    // A separate spacer cell with `font-size:0` + a hairspace renders
    // at zero width in Outlook (the empty cell collapses), so the
    // two badges visually touch. Putting the gap as padding-right on
    // the first cell is honoured by every client including Outlook.
    const badgesHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}">
        <tr>
          <td style="padding-right:${badgeGap}px;" valign="middle">
            <a href="${escapeAttr(p.appStoreUrl)}" style="text-decoration:none;display:block;">
              <img src="${escapeAttr(p.appStoreImage)}" alt="Download on the App Store" width="${badgeWidth}" style="display:block;border:0;width:${badgeWidth}px;height:auto;" />
            </a>
          </td>
          <td valign="middle">
            <a href="${escapeAttr(p.playStoreUrl)}" style="text-decoration:none;display:block;">
              <img src="${escapeAttr(p.playStoreImage)}" alt="Get it on Google Play" width="${badgeWidth}" style="display:block;border:0;width:${badgeWidth}px;height:auto;" />
            </a>
          </td>
        </tr>
      </table>
    `;

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          ${showHeadline ? `<mj-text align="${align}" font-family="${FONT_STACK}" font-size="18px" line-height="1.2" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 0 4px 0">${safeHtml(p.headline)}</mj-text>
          <mj-spacer height="20px" />` : ``}
          <mj-raw>${badgesHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
