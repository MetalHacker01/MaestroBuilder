import type { Module } from "../types";
import { escapeAttr } from "../helpers";

/**
 * Hidden preheader text — shows up in inbox preview snippets but is invisible
 * inside the email body. The class `mb-preheader` is hooked by the editor's
 * preview-chrome CSS so the user can SEE the preheader on the canvas (with
 * a "hidden in inbox" badge) — that override is stripped from the export.
 */
export const preheader: Module = {
  id: "preheader",
  category: "preheader",
  label: "Preheader (preview text)",
  description: "Hidden preview text shown in inbox listings.",
  schema: {
    text: {
      type: "text",
      label: "Preview text",
      default: "Your preview text shows here in the inbox.",
      group: "Content",
    },
  },
  render: (p) => `
    <mj-raw>
      <div class="mb-preheader" style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
        ${escapeAttr(p.text)}
      </div>
    </mj-raw>
  `,
};
