import type { Module } from "../types";
import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

/**
 * Numbered step list. Each step renders as a coloured circle (perfect
 * round on webmail via `border-radius:50%`, clean square on Outlook
 * desktop where `border-radius` is ignored — both readable) plus the
 * step text aligned to the right.
 *
 * Replaces an earlier Unicode-glyph approach (❶❷❸❹) which had
 * inconsistent vertical metrics and got clipped by the bounding box at
 * common font sizes.
 */
export const bodyBulletsNumbered: Module = {
  id: "body-bullets-numbered",
  category: "body",
  label: "Numbered steps",
  schema: {
    headline: {
      type: "richtext",
      label: "Headline",
      default: "<strong>How it works</strong>",
      group: "Content",
    },
    headlineColor: { type: "color", label: "Headline color", default: BRAND.heading, group: "Content" },
    step1: { type: "richtext", label: "Step 1", default: "Open the application on your device and tap <em>Start</em>.", group: "Steps" },
    step2: { type: "richtext", label: "Step 2", default: "Scan the QR code that appears on screen.", group: "Steps" },
    step3: { type: "richtext", label: "Step 3", default: "Sign in with your account and confirm the device pairing.", group: "Steps" },
    step4: { type: "richtext", label: "Step 4", default: "Personalise your preferences in <strong>Settings</strong>.", group: "Steps" },
    bulletColor: { type: "color", label: "Number circle colour", default: BRAND.accent, group: "Style" },
    bulletTextColor: { type: "color", label: "Number text colour", default: "#ffffff", group: "Style" },
    textColor: { type: "color", label: "Step text colour", default: BRAND.text, group: "Style" },
    bgColor: { type: "color", label: "Background", default: BRAND.surface, group: "Style" },
    padding: {
      type: "spacing",
      label: "Section padding",
      default: { t: 24, r: 32, b: 32, l: 32 },
      group: "Style",
    },
  },
  render: (p) => {
    const steps = [p.step1, p.step2, p.step3, p.step4]
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);

    const bulletBg = String(p.bulletColor ?? BRAND.accent);
    const bulletFg = String(p.bulletTextColor ?? "#ffffff");

    // Each row: a fixed-size 28x28 circle on the left, step text on the
    // right. The circle MUST be inside a nested table — putting bgcolor
    // directly on the outer td stretches the colour to the row's full
    // height (because td height is dictated by the tallest cell in the
    // row, and the right-side text wraps to multiple lines). The nested
    // table is its own layout context: explicit width+height attributes
    // are honoured, and `valign="top"` on the wrapping td pins it to the
    // top of the row instead of vertically centring it next to multi-line
    // step text.
    const rows = steps
      .map(
        (s, i) => `
          <tr>
            <td valign="top" width="28" style="width:28px;vertical-align:top;padding-bottom:14px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                style="border-collapse:collapse;">
                <tr>
                  <td bgcolor="${bulletBg}" align="center" valign="middle"
                    width="28" height="28"
                    style="background-color:${bulletBg};color:${bulletFg};width:28px;height:28px;border-radius:50%;font-family:${FONT_STACK};font-size:14px;font-weight:700;line-height:28px;text-align:center;vertical-align:middle;mso-line-height-rule:exactly;">
                    ${i + 1}
                  </td>
                </tr>
              </table>
            </td>
            <td valign="top" width="16" style="width:16px;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td>
            <td valign="top"
              style="font-family:${FONT_STACK};font-size:${TYPE_SCALE.body}px;line-height:1.55;color:${escapeAttr(p.textColor)};padding:2px 0 14px 0;vertical-align:top;">
              ${safeHtml(s)}
            </td>
          </tr>
        `
      )
      .join("");

    const tableHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        ${rows}
      </table>
    `;

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h2}px" line-height="1.2" font-weight="700" color="${escapeAttr(p.headlineColor)}" padding="0 0 16px 0">${safeHtml(p.headline)}</mj-text>
          <mj-raw>${tableHtml}</mj-raw>
        </mj-column>
      </mj-section>
    `;
  },
};
