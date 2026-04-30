import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

export const footerUnsubscribe: Module = {
  id: "footer-unsubscribe",
  category: "footer",
  label: "Unsubscribe block",
  schema: {
    intro: {
      type: "richtext",
      label: "Intro line",
      default: "You are receiving this email because you subscribed to our list.",
      group: "Content",
    },
    unsubscribeText: {
      type: "text",
      label: "Unsubscribe link text",
      default: "Unsubscribe",
      group: "Content",
    },
    unsubscribeUrl: {
      type: "url",
      label: "Unsubscribe URL",
      default: "{{unsubscribe_url}}",
      group: "Content",
    },
    preferencesText: {
      type: "text",
      label: "Preferences link text",
      default: "Manage preferences",
      group: "Content",
    },
    preferencesUrl: {
      type: "url",
      label: "Preferences URL",
      default: "{{preferences_url}}",
      group: "Content",
    },
    textColor: {
      type: "color",
      label: "Text color",
      default: BRAND.muted,
      group: "Style",
    },
    linkColor: {
      type: "color",
      label: "Link color",
      default: BRAND.accent,
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
      default: { t: 12, r: 32, b: 28, l: 32 },
      group: "Style",
    },
  },
  render: (p) => `
    <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
      <mj-column>
        <mj-text align="center" font-family="${FONT_STACK}" font-size="${TYPE_SCALE.caption}px" line-height="1.7" color="${escapeAttr(p.textColor)}" padding="0">
          ${safeHtml(p.intro)}<br/>
          <a href="${escapeAttr(p.unsubscribeUrl)}" style="color:${escapeAttr(p.linkColor)};text-decoration:underline;">${escapeAttr(p.unsubscribeText)}</a>
          &nbsp;|&nbsp;
          <a href="${escapeAttr(p.preferencesUrl)}" style="color:${escapeAttr(p.linkColor)};text-decoration:underline;">${escapeAttr(p.preferencesText)}</a>
        </mj-text>
      </mj-column>
    </mj-section>
  `,
};
