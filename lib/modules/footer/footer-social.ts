import type { Module } from "../types";
import { BRAND, escapeAttr, spacing } from "../helpers";

const PLATFORM_OPTIONS = [
  { label: "(none — slot disabled)", value: "none" },
  { label: "Facebook", value: "facebook" },
  { label: "X / Twitter", value: "twitter" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Instagram", value: "instagram" },
  { label: "YouTube", value: "youtube" },
  { label: "TikTok", value: "tiktok" },
  { label: "Pinterest", value: "pinterest" },
  { label: "GitHub", value: "github" },
  { label: "Snapchat", value: "snapchat" },
  { label: "Web / Globe", value: "web" },
];

const slotName = (i: number) => `slot${i}Name` as const;
const slotUrl = (i: number) => `slot${i}Url` as const;
const slotIcon = (i: number) => `slot${i}Icon` as const;

/**
 * Configurable social-icons row. 6 slots — each picks a named platform
 * (or "none" to disable) and a target URL. For brands needing a custom
 * icon, an optional image URL per slot overrides the named platform's
 * default. Slots whose Platform is "none" or whose URL is empty are
 * dropped from the rendered MJML.
 */
export const footerSocial: Module = {
  id: "footer-social",
  category: "footer",
  label: "Social icons row",
  schema: {
    // Slot 1 — defaults to Facebook so the module renders sensibly out of the box
    slot1Name: { type: "select", label: "Slot 1 — platform", default: "facebook", options: PLATFORM_OPTIONS, group: "Slot 1" },
    slot1Url:  { type: "url",    label: "Slot 1 — URL",      default: "https://facebook.com/yourpage", group: "Slot 1" },
    slot1Icon: { type: "image-url", label: "Slot 1 — custom icon URL (optional)", default: "", group: "Slot 1" },

    slot2Name: { type: "select", label: "Slot 2 — platform", default: "twitter", options: PLATFORM_OPTIONS, group: "Slot 2" },
    slot2Url:  { type: "url",    label: "Slot 2 — URL",      default: "https://twitter.com/yourhandle", group: "Slot 2" },
    slot2Icon: { type: "image-url", label: "Slot 2 — custom icon URL (optional)", default: "", group: "Slot 2" },

    slot3Name: { type: "select", label: "Slot 3 — platform", default: "linkedin", options: PLATFORM_OPTIONS, group: "Slot 3" },
    slot3Url:  { type: "url",    label: "Slot 3 — URL",      default: "https://linkedin.com/company/yourcompany", group: "Slot 3" },
    slot3Icon: { type: "image-url", label: "Slot 3 — custom icon URL (optional)", default: "", group: "Slot 3" },

    slot4Name: { type: "select", label: "Slot 4 — platform", default: "instagram", options: PLATFORM_OPTIONS, group: "Slot 4" },
    slot4Url:  { type: "url",    label: "Slot 4 — URL",      default: "https://instagram.com/yourhandle", group: "Slot 4" },
    slot4Icon: { type: "image-url", label: "Slot 4 — custom icon URL (optional)", default: "", group: "Slot 4" },

    // Slots 5 & 6 are off by default — set their Platform to enable them
    slot5Name: { type: "select", label: "Slot 5 — platform", default: "none", options: PLATFORM_OPTIONS, group: "Slot 5" },
    slot5Url:  { type: "url",    label: "Slot 5 — URL",      default: "",     group: "Slot 5" },
    slot5Icon: { type: "image-url", label: "Slot 5 — custom icon URL (optional)", default: "", group: "Slot 5" },

    slot6Name: { type: "select", label: "Slot 6 — platform", default: "none", options: PLATFORM_OPTIONS, group: "Slot 6" },
    slot6Url:  { type: "url",    label: "Slot 6 — URL",      default: "",     group: "Slot 6" },
    slot6Icon: { type: "image-url", label: "Slot 6 — custom icon URL (optional)", default: "", group: "Slot 6" },

    iconSize: {
      type: "number",
      label: "Icon size",
      default: 36,
      min: 16,
      max: 64,
      unit: "px",
      group: "Style",
    },
    align: {
      type: "align",
      label: "Row align",
      default: "center",
      group: "Style",
    },
    iconColor: {
      type: "color",
      label: "Icon background",
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
      default: { t: 20, r: 32, b: 8, l: 32 },
      group: "Style",
    },
  },
  render: (p) => {
    const align = (p.align as "left" | "center" | "right") ?? "center";

    const elements: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const name = String(p[slotName(i)] ?? "none");
      const url = String(p[slotUrl(i)] ?? "").trim();
      const icon = String(p[slotIcon(i)] ?? "").trim();
      if (name === "none" || url === "") continue;

      // If a custom icon is provided, use src= and skip name= (MJML uses src
      // when both are set; we omit name to be explicit and avoid platform
      // colour fills bleeding through).
      if (icon) {
        elements.push(
          `<mj-social-element src="${escapeAttr(icon)}" href="${escapeAttr(url)}" />`
        );
      } else {
        elements.push(
          `<mj-social-element name="${escapeAttr(name)}" href="${escapeAttr(url)}" background-color="${escapeAttr(p.iconColor)}" color="${escapeAttr(p.bgColor)}" />`
        );
      }
    }

    if (elements.length === 0) {
      // Don't emit an empty <mj-social> — it produces invalid MJML
      return `<mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}"><mj-column /></mj-section>`;
    }

    return `
      <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
        <mj-column>
          <mj-social mode="horizontal" icon-size="${Number(p.iconSize)}px" align="${align}" padding="0" inner-padding="0 7px" border-radius="999px">
            ${elements.join("\n            ")}
          </mj-social>
        </mj-column>
      </mj-section>
    `;
  },
};
