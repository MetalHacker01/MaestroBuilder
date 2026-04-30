import type { Module } from "../types";
import { BRAND, FONT_STACK, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * Visible utility bar at the very top of the email — Schneider-style.
 * Two cells: left text (often issue / date / brand fineprint) and a
 * right link (typically "View online" or "Web version"). Stacks on
 * mobile thanks to MJML's responsive defaults.
 *
 * Different from the `preheader` module: this one is VISIBLE inside the
 * email body, not hidden in the inbox-preview snippet.
 */
export const headerUtilityBar: Module = {
  id: "header-utility-bar",
  category: "preheader",
  label: "Top utility bar",
  schema: {
    leftText: {
      type: "richtext",
      label: "Left text",
      default: "Issue 23 &middot; April 2026",
      group: "Left",
    },
    leftHref: {
      type: "url",
      label: "Left link (optional)",
      default: "",
      group: "Left",
    },
    rightText: {
      type: "text",
      label: "Right link text",
      default: "View online",
      group: "Right",
    },
    rightHref: {
      type: "url",
      label: "Right link URL",
      default: "{{view_online_url}}",
      group: "Right",
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
      default: { t: 12, r: 24, b: 12, l: 24 },
      group: "Style",
    },
    fontSize: {
      type: "number",
      label: "Font size",
      default: 12,
      min: 10,
      max: 16,
      unit: "px",
      group: "Style",
    },
  },
  render: (p) => {
    const leftHasLink = typeof p.leftHref === "string" && p.leftHref.trim() !== "";
    const leftHtml = leftHasLink
      ? `<a href="${escapeAttr(p.leftHref)}" style="color:${escapeAttr(p.linkColor)};text-decoration:none;">${safeHtml(p.leftText)}</a>`
      : safeHtml(p.leftText);

    const rightHasLink = typeof p.rightHref === "string" && p.rightHref.trim() !== "";
    const rightHtml = rightHasLink
      ? `<a href="${escapeAttr(p.rightHref)}" style="color:${escapeAttr(p.linkColor)};text-decoration:underline;">${escapeAttr(p.rightText)}</a>`
      : escapeAttr(p.rightText);

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column width="50%" vertical-align="middle">
          <mj-text align="left" font-family="${FONT_STACK}" font-size="${Number(p.fontSize)}px" line-height="1.5" color="${escapeAttr(p.textColor)}" padding="0">${leftHtml}</mj-text>
        </mj-column>
        <mj-column width="50%" vertical-align="middle">
          <mj-text align="right" font-family="${FONT_STACK}" font-size="${Number(p.fontSize)}px" line-height="1.5" color="${escapeAttr(p.textColor)}" padding="0">${rightHtml}</mj-text>
        </mj-column>
      </mj-section>
    `;
  },
};
