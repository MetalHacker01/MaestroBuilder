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

    // Gmail Android strips MJML's `mj-group` CSS (`display:inline-block`
    // on column wrappers is forced back to block by Gmail's Android
    // renderer), which makes the date land above "View online" with the
    // wrong alignment. The bulletproof fix: render a raw 2-cell `<table>`
    // — tables NEVER stack on any client, in any viewport. No mj-column,
    // no mj-group, no responsive CSS dependency.
    const fontPx = Number(p.fontSize);
    // Schneider's exact utility-bar pattern (sch_email.html line 633-653):
    // a simple 2-cell `<table width="100%">` with NO explicit cell widths,
    // just `text-align:left` and `text-align:right`. The cells auto-share
    // 50/50, and the alignment pushes content to the outer edges of each
    // half — leaving a natural ~half-table-width gap between them. Works
    // on Gmail Android because there's nothing for Gmail to strip; the
    // table layout is determined entirely by HTML attributes.
    const utilityTable = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
        style="width:100%;border-collapse:collapse;">
        <tr>
          <td valign="middle"
            style="text-align:left;font-family:${FONT_STACK};font-size:${fontPx}px;line-height:1.5;color:${escapeAttr(p.textColor)};vertical-align:middle;">${leftHtml}</td>
          <td valign="middle"
            style="text-align:right;font-family:${FONT_STACK};font-size:${fontPx}px;line-height:1.5;color:${escapeAttr(p.textColor)};vertical-align:middle;">${rightHtml}</td>
        </tr>
      </table>
    `;
    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-raw>${utilityTable}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
