import type { Module } from "../types";
import { BRAND, FONT_STACK, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * Three-column statistic row — large number + small descriptive label,
 * times three. Common in newsletters, year-in-review, and B2B "social
 * proof" emails.
 */
export const bodyStatRow: Module = {
  id: "body-stat-row",
  category: "body",
  label: "Stat row (3 numbers)",
  schema: {
    sectionHeadline: {
      type: "richtext",
      label: "Section headline (optional)",
      default: "<strong>The numbers</strong>",
      group: "Section",
    },
    showSectionHeadline: {
      type: "select",
      label: "Show headline",
      default: "yes",
      options: [
        { label: "Show", value: "yes" },
        { label: "Hide", value: "no" },
      ],
      group: "Section",
    },

    stat1Number: { type: "text", label: "Stat 1 number", default: "10K+", group: "Stat 1" },
    stat1Label: { type: "richtext", label: "Stat 1 label", default: "Active users", group: "Stat 1" },

    stat2Number: { type: "text", label: "Stat 2 number", default: "99.9%", group: "Stat 2" },
    stat2Label: { type: "richtext", label: "Stat 2 label", default: "Uptime SLA", group: "Stat 2" },

    stat3Number: { type: "text", label: "Stat 3 number", default: "47.2", group: "Stat 3" },
    stat3Label: { type: "richtext", label: "Stat 3 label", default: "Hours saved per week", group: "Stat 3" },

    numberSize: {
      type: "number",
      label: "Number size",
      default: 40,
      min: 20,
      max: 72,
      unit: "px",
      group: "Style",
    },
    numberColor: { type: "color", label: "Number colour", default: BRAND.accent, group: "Style" },
    labelColor: { type: "color", label: "Label colour", default: BRAND.muted, group: "Style" },
    headlineColor: { type: "color", label: "Headline colour", default: BRAND.heading, group: "Style" },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Style" },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 32, r: 16, b: 32, l: 16 },
      group: "Style",
    },
  },
  render: (p) => {
    const showHeadline = p.showSectionHeadline !== "no";
    const renderCol = (num: unknown, label: unknown) => `
      <mj-column width="33.33%" vertical-align="top" padding="0 8px">
        <mj-text align="center" font-family="${FONT_STACK}" font-size="${Number(p.numberSize)}px" line-height="1.05" font-weight="800" letter-spacing="-0.01em" color="${escapeAttr(p.numberColor)}" padding="0 0 8px 0">${escapeAttr(num)}</mj-text>
        <mj-text align="center" font-family="${FONT_STACK}" font-size="13px" line-height="1.4" font-weight="500" color="${escapeAttr(p.labelColor)}" padding="0">${safeHtml(label)}</mj-text>
      </mj-column>
    `;
    const padTop = (p.padding as { t: number }).t;
    const padBottom = (p.padding as { b: number }).b;
    const padLeft = (p.padding as { l: number }).l;
    const padRight = (p.padding as { r: number }).r;

    return `
      ${showHeadline ? `
        <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${padTop}px ${padRight}px 16px ${padLeft}px">
          <mj-column>
            <mj-text align="center" font-family="${FONT_STACK}" font-size="22px" line-height="1.2" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 8px 0 8px">${safeHtml(p.sectionHeadline)}</mj-text>
          </mj-column>
        </mj-section>
      ` : ``}
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${showHeadline ? `0 ${padRight}px ${padBottom}px ${padLeft}px` : spacing(p.padding as never)}">
        ${renderCol(p.stat1Number, p.stat1Label)}
        ${renderCol(p.stat2Number, p.stat2Label)}
        ${renderCol(p.stat3Number, p.stat3Label)}
      </mj-section>
    `;
  },
};
