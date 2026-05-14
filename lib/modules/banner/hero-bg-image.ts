import type { Module, Spacing } from "../types";
import {
  BRAND,
  FONT_STACK,
  escapeAttr,
  hexToRgba,
  safeHtml,
  spacing,
} from "../helpers";

/**
 * Hero with bg image + translucent overlay card — emitted as PURE HTML
 * inside `<mj-raw>` at the body level (no `<mj-section>`, no `<mj-column>`).
 *
 * Why bypass MJML entirely for this module:
 *   The Schneider reference (sch_email.html line 685-759) renders perfectly
 *   on Outlook because the bg image `<td>` sits DIRECTLY inside the outer
 *   `<table class="banner">` — the VML conditional comments are immediate
 *   siblings of the overlay HTML, with no extra table nesting in between.
 *
 *   MJML's `<mj-section background-url>` produces the right VML wrapper,
 *   but its column scaffolding wraps the overlay inside 5-6 additional
 *   layers of `<table><tbody><tr><td>` markup. Outlook's Word renderer
 *   gets confused by the depth and either drops the overlay or mispositions
 *   the bg image. By emitting Schneider's exact byte sequence we eliminate
 *   that risk.
 *
 *   Trade-off: this module doesn't participate in MJML's responsive column
 *   system. Instead it uses Schneider's CSS classes (.fluid, .responsive-td,
 *   .mobile-auto-height) defined in shell.ts — these handle mobile layout
 *   via media queries identically to Schneider's production email.
 *
 *   Editor click-to-select still works because we add `mb-uid-${uid}` to
 *   the outermost element — the canvas iframe's findUid() walks up the
 *   DOM looking for that class.
 */
export const heroBgImage: Module = {
  id: "hero-bg-image",
  category: "banner",
  label: "Hero with background image + overlay",
  schema: {
    imageUrl: {
      type: "image-url",
      label: "Background image URL",
      default: "https://picsum.photos/seed/maestro-hero-bg/1280/520",
      group: "Image",
    },
    bgFallback: {
      type: "color",
      label: "Fallback colour (image blocked)",
      default: "#2F3437",
      group: "Image",
    },
    headline: {
      type: "richtext",
      label: "Headline",
      default: "Your headline goes here",
      group: "Overlay",
    },
    headlineColor: {
      type: "color",
      label: "Headline colour",
      default: "#ffffff",
      group: "Overlay",
    },
    paragraph: {
      type: "richtext",
      label: "Subhead",
      default:
        "Short, punchy supporting copy that sets up the value proposition.",
      group: "Overlay",
    },
    paragraphColor: {
      type: "color",
      label: "Subhead colour",
      default: "#E5E7EB",
      group: "Overlay",
    },
    overlayColor: {
      type: "color",
      label: "Card colour",
      default: "#000000",
      group: "Overlay",
    },
    overlayOpacity: {
      type: "number",
      label: "Card opacity (0 = transparent, 100 = solid)",
      default: 70,
      min: 0,
      max: 100,
      unit: "%",
      group: "Overlay",
    },
    overlayWidth: {
      type: "number",
      label: "Card width",
      default: 500,
      min: 280,
      max: 700,
      unit: "px",
      group: "Overlay",
    },
    overlayRadius: {
      type: "number",
      label: "Card radius",
      default: 8,
      min: 0,
      max: 32,
      unit: "px",
      group: "Overlay",
    },
    showButton: {
      type: "select",
      label: "Show CTA",
      default: "yes",
      options: [
        { label: "Show CTA", value: "yes" },
        { label: "Hide CTA", value: "no" },
      ],
      group: "Button",
    },
    ctaText: { type: "text", label: "Button text", default: "Get started", group: "Button" },
    ctaUrl: { type: "url", label: "Button link", default: "https://martech-maestro-folio-sroh.vercel.app/", group: "Button" },
    // Default: WHITE button on the dark overlay card (editorial-minimalist
    // "inverted" CTA). Black-on-dark was invisible; indigo "pop" was too
    // saturated for the minimalist palette. White on dark gives the
    // highest universal contrast and stays on-theme.
    ctaBgColor: { type: "color", label: "Button colour", default: "#FFFFFF", group: "Button" },
    ctaTextColor: { type: "color", label: "Button text colour", default: BRAND.heading, group: "Button" },
    ctaRadius: { type: "number", label: "Button radius", default: 5, min: 0, max: 32, unit: "px", group: "Button" },
    ctaWidth: { type: "number", label: "Button width", default: 180, min: 100, max: 300, unit: "px", group: "Button" },
    bannerWidth: {
      type: "number",
      label: "Banner width",
      default: 640,
      min: 320,
      max: 720,
      unit: "px",
      group: "Layout",
    },
    cardPadding: {
      type: "spacing",
      label: "Padding around card (controls how much bg image shows around the card)",
      default: { t: 15, r: 25, b: 15, l: 25 },
      group: "Layout",
    },
  },
  render: (p) => {
    // We render outside of mj-section/mj-column, so spacing() is for the
    // card-padding td only.
    const uid = "__MB_UID__"; // overwritten by compile.ts annotate pass

    const showButton = p.showButton !== "no";
    const overlayWidth = Number(p.overlayWidth ?? 500);
    const overlayRadius = Number(p.overlayRadius ?? 8);
    const overlayOpacity = Number(p.overlayOpacity ?? 70);
    const overlayHex = String(p.overlayColor ?? "#000000");
    const overlayRgba = hexToRgba(overlayHex, overlayOpacity);

    const ctaBg = String(p.ctaBgColor ?? BRAND.accent);
    const ctaFg = String(p.ctaTextColor ?? "#ffffff");
    const ctaRadiusPx = Number(p.ctaRadius ?? 5);
    const ctaWidthPx = Number(p.ctaWidth ?? 180);

    const bgImage = escapeAttr(p.imageUrl);
    const bgFallback = escapeAttr(p.bgFallback);
    const bannerWidth = Number(p.bannerWidth ?? 640);
    const pad = (p.cardPadding as Spacing | undefined) ?? {
      t: 15,
      r: 25,
      b: 15,
      l: 25,
    };

    // Schneider's exact button markup — display:inline-block on the outer
    // table makes the button flow naturally in the cell, and the td has
    // explicit width:180px so it doesn't stretch to fill its parent.
    const buttonHtml = showButton
      ? `
        <table class="button" cellpadding="0" cellspacing="0" border="0"
          style="display:inline-block;max-width:250px;">
          <tr>
            <td bgcolor="${ctaBg}" valign="middle"
              style="background-color:${ctaBg};font-family:${FONT_STACK};font-size:14px;text-align:center;vertical-align:middle;color:${ctaFg};display:block;padding:10px 5px;border-radius:${ctaRadiusPx}px;line-height:15px;font-weight:400;max-width:250px;width:${ctaWidthPx}px;">
              <a href="${escapeAttr(p.ctaUrl)}" target="_blank"
                 style="color:${ctaFg};text-decoration:none;line-height:16px;display:inline-block;font-weight:bold;margin:0 10px;">
                ${escapeAttr(p.ctaText)}
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

    // Verbatim Schneider hero markup (sch_email.html:685-759), parameterised
    // with the user's settings. The OUTERMOST table carries the uid + section
    // + banner classes so the editor selects it and dark-mode CSS targets it.
    // NO mj-section, NO mj-column wrapping — pure HTML inside mj-raw.
    return `
<mj-raw>
<table class="mb-uid-${uid} mb-section banner" border="0" cellpadding="0" cellspacing="0" align="center"
  style="width:100%;max-width:${bannerWidth}px;margin:0 auto;background-color:${bgFallback};"
  width="${bannerWidth}">
  <tr>
    <td background="${bgImage}" bgcolor="${bgFallback}"
        class="mobile-auto-height responsive-td"
        height="auto"
        style="background-image:url('${bgImage}');background-color:${bgFallback};background-size:cover;background-position:center center;background-repeat:no-repeat;vertical-align:top;"
        valign="top">
      <!--[if gte mso 9]>
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${bannerWidth}px;height:auto;">
        <v:fill type="tile" src="${bgImage}" color="${bgFallback}" />
        <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
      <![endif]-->
      <div>
        <table border="0" cellpadding="0" cellspacing="0" class="mobile-auto-height">
          <tr>
            <td class="responsive-td" style="padding:${pad.t}px ${pad.r}px ${pad.b}px ${pad.l}px;">
              <table class="blackbg mb-hero-overlay-card fluid rounded-corner" border="0" cellpadding="0" cellspacing="0"
                bgcolor="${overlayHex}"
                style="background:${overlayRgba};background-color:${overlayRgba};width:${overlayWidth}px;border-radius:${overlayRadius}px;"
                width="${overlayWidth}">
                <tr>
                  <td style="color:${escapeAttr(p.headlineColor)};padding:20px 30px;font-family:${FONT_STACK};">
                    <h1 style="color:${escapeAttr(p.headlineColor)};font-family:${FONT_STACK};font-size:30px;line-height:1.2;font-weight:bold;margin:0;padding-bottom:10px;">
                      ${safeHtml(p.headline)}
                    </h1>
                    ${p.paragraph
                      ? `
                      <p style="color:${escapeAttr(p.paragraphColor)};font-family:${FONT_STACK};font-size:15px;line-height:1.55;margin:0;padding-bottom:4px;">
                        ${safeHtml(p.paragraph)}
                      </p>
                      `
                      : ``}
                    ${showButton
                      ? `
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td colspan="3" style="height:10px;line-height:10px;font-size:1px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td class="responsive-td">
                          ${buttonHtml}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3" style="height:5px;line-height:5px;font-size:1px;">&nbsp;</td>
                      </tr>
                    </table>
                    `
                      : ``}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
      <!--[if gte mso 9]>
        </v:textbox>
      </v:rect>
      <![endif]-->
    </td>
  </tr>
</table>
</mj-raw>
    `;
  },
};
