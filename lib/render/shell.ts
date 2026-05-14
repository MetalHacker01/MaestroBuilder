import type { ModuleInstance, Theme } from "../modules/types";
import { darkBg, isHexColor, lightText } from "./colors";

export type ShellOptions = {
  backgroundColor?: string;
  width?: number;
  theme?: Theme;
  /** When true, the dark-mode CSS is applied unconditionally (forces dark in the editor preview). */
  forceDark?: boolean;
  /** Used to generate per-instance dark-mode rules. */
  instances?: ModuleInstance[];
};

const LIGHT_BG = "#fffffe"; // avoid pure white — Apple Mail contrast heuristics
const DARK_PAGE_BG = "#0a0a0a";
const DARK_DIVIDER = "#2c2c2c";
const FALLBACK_DARK_TEXT = "#e8e8e8";
const FALLBACK_DARK_SURFACE = "#1a1a1a";

/**
 * Props that drive section background colour.
 */
const BG_PROPS = ["bgColor", "backgroundColor"];

/**
 * Props that drive text colour, in priority order. We pick the first one we
 * find on each instance to drive the dark-mode text colour for that section.
 *
 * Buttons + bullet bgs + any other grayscale fills are handled by the
 * auto-invert pass at the bottom of instanceDarkRules. After the
 * minimalist-ui rebrand all default CTA backgrounds are grayscale
 * off-black, which would blend into the near-black dark-mode page bg
 * if left untransformed.
 */
const TEXT_PROPS = [
  "headlineColor",
  "paragraphColor",
  "textColor",
  "bodyColor",
  "captionColor",
  "leftHeadlineColor",
  "rightHeadlineColor",
  // three-column + promo callout text props — without these listed the
  // auto-invert pass treats them as bg colours and tries to invert via
  // bgcolor selector, which doesn't match (these drive `color:` not
  // `background-color:`). Listing them here funnels them through the
  // .mb-text dark-mode pipeline instead.
  "titleColor",
  "subheadColor",
  "linkColor",
  "kickerColor",
  "descriptionColor",
];
// `bulletColor` was previously listed here but it's actually the
// BACKGROUND of the bullet circle, not a text colour — the auto-invert
// pass below handles it correctly as a bg.


type DarkRule = {
  selector: string;
  property: "background-color" | "color";
  value: string;
};

function pickFirstColor(
  props: Record<string, unknown>,
  preference: string[]
): string | undefined {
  for (const key of preference) {
    const v = props[key];
    if (isHexColor(v)) return v.trim();
  }
  return undefined;
}

/**
 * Returns true when `hex` is a near-grayscale tone (R≈G≈B). These are the
 * colours we want to invert in dark mode — black/white/grays would otherwise
 * blend into the dark page bg. Saturated brand colours return false and are
 * left untouched.
 */
function isGrayscale(hex: string): boolean {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 12; // within 12/255 of each channel = practically gray
}


function instanceDarkRules(inst: ModuleInstance): DarkRule[] {
  const rules: DarkRule[] = [];
  const uid = inst.uid;

  // Background — use the section's bgColor if set, otherwise fall back to a
  // neutral dark surface.
  const bgSource = pickFirstColor(inst.props, BG_PROPS);
  const bg = bgSource ? darkBg(bgSource) : FALLBACK_DARK_SURFACE;
  // MJML emits this structure for each mj-section:
  //   <div class="mb-uid-X mb-section" style="background:#fff">
  //     <table style="background:#fff">           <-- this is the visible surface
  //       <tbody><tr><td>...content...</td></tr></tbody>
  //     </table>
  //   </div>
  // The TABLE's inline background is what the user sees (it covers the div).
  // We override at three levels for robustness.
  rules.push(
    {
      selector: `.mb-uid-${uid}.mb-section`,
      property: "background-color",
      value: bg,
    },
    {
      selector: `.mb-uid-${uid}.mb-section > table`,
      property: "background-color",
      value: bg,
    },
    {
      selector: `.mb-uid-${uid}.mb-section > table > tbody > tr > td`,
      property: "background-color",
      value: bg,
    }
  );

  // Text — pick the first colour-ish prop that exists; if none, default to
  // a neutral light grey so dark-text-on-dark-bg is never a thing.
  const textSource = pickFirstColor(inst.props, TEXT_PROPS);
  const text = textSource ? lightText(textSource) : FALLBACK_DARK_TEXT;

  // We use four selectors to robustly beat MJML's inline `style="color:..."`
  // on the inner div. The order matches the structure MJML emits:
  //   <td class="mb-text"><div style="color:..."><strong>...</strong></div></td>
  rules.push(
    {
      selector: `.mb-uid-${uid} .mb-text`,
      property: "color",
      value: text,
    },
    {
      selector: `.mb-uid-${uid} .mb-text *`,
      property: "color",
      value: text,
    }
  );

  // Auto-invert any GRAYSCALE colour prop on this instance. Catches:
  //   - ctaBgColor / primaryBg / panelColor / bulletColor (dark fills that
  //     would blend into the dark page bg if left as-is)
  //   - ctaTextColor / bulletTextColor (off-white text on a dark fill that
  //     needs to flip to off-black after the fill goes light)
  //   - any future prop names — we scan every value, not a fixed list, so
  //     new modules don't need to register here.
  // Saturated brand colours (#5B5BD6, the `pop` indigo, etc.) are skipped
  // by the isGrayscale gate so the brand stays branded.
  const seen = new Set<string>();
  for (const [key, raw] of Object.entries(inst.props)) {
    if (!isHexColor(raw)) continue;
    if (BG_PROPS.includes(key) || TEXT_PROPS.includes(key)) continue; // already handled above
    const hex = raw.trim();
    if (!isGrayscale(hex)) continue;
    if (seen.has(hex.toLowerCase())) continue;
    seen.add(hex.toLowerCase());

    // Lightness threshold: dark grayscale (#000–#444) flips to off-white,
    // light grayscale (#ddd–#fff) flips to off-black. Mid-grays stay close
    // to where they were (no-op).
    const lum = parseInt(hex.replace(/^#/, "").slice(0, 2), 16);
    let inverted: string;
    if (lum < 0x66) inverted = lightText(hex); // dark → light
    else if (lum > 0xcc) inverted = darkBg(hex); // light → dark
    else continue; // mid-gray, leave alone

    // Hit BOTH bgcolor-as-attribute and inline `background-color:` style.
    // Lowercase + uppercase hex both — Outlook normalises attr values
    // sometimes, so we cover both casings.
    rules.push(
      {
        selector: `.mb-uid-${uid} [bgcolor="${hex}"]`,
        property: "background-color",
        value: inverted,
      },
      {
        selector: `.mb-uid-${uid} [bgcolor="${hex.toUpperCase()}"]`,
        property: "background-color",
        value: inverted,
      }
    );

    // For dark fills, also flip the text colour of any <a>/<span> inside
    // matching cells — buttons typically have white text that needs to
    // become dark after the bg goes light.
    if (lum < 0x66) {
      rules.push(
        {
          selector: `.mb-uid-${uid} [bgcolor="${hex}"], .mb-uid-${uid} [bgcolor="${hex}"] *`,
          property: "color",
          value: "#111111",
        }
      );
    }
  }

  return rules;
}

function ruleToCss(rule: DarkRule): string {
  return `${rule.selector} { ${rule.property}: ${rule.value} !important; }`;
}

function buildDarkBlock(instances: ModuleInstance[], force: boolean): string {
  const allRules: DarkRule[] = [];

  // Outer body — always darkest, regardless of any module config
  allRules.push({
    selector: "body, .mb-body",
    property: "background-color",
    value: DARK_PAGE_BG,
  });

  for (const inst of instances) {
    allRules.push(...instanceDarkRules(inst));
  }

  // Modern + standards-compliant clients
  const standardCss = allRules.map(ruleToCss).join("\n  ");

  // Outlook.com / new Outlook web — they strip @media queries from external
  // mail but keep rules namespaced under [data-ogsc] (text colour) and
  // [data-ogsb] (background). Mirror our rules so dark mode survives.
  const ogsbCss = allRules
    .filter((r) => r.property === "background-color")
    .map((r) => ruleToCss({ ...r, selector: `[data-ogsb] ${r.selector}` }))
    .join("\n  ");
  const ogscCss = allRules
    .filter((r) => r.property === "color")
    .map((r) => ruleToCss({ ...r, selector: `[data-ogsc] ${r.selector}` }))
    .join("\n  ");

  // Dividers blend with the dark surface
  const dividerCss = `.mb-section hr { border-color: ${DARK_DIVIDER} !important; }`;

  if (force) {
    // Editor preview — apply unconditionally so the user sees dark even if
    // their OS is in light mode.
    return `
      <mj-style inline="false">
        ${standardCss}
        ${dividerCss}
      </mj-style>
    `;
  }

  return `
    <mj-style inline="false">
      @media (prefers-color-scheme: dark) {
        ${standardCss}
        ${dividerCss}
      }
      ${ogsbCss}
      ${ogscCss}
    </mj-style>
  `;
}

export function wrapMjml(body: string, options: ShellOptions = {}): string {
  const bg = options.backgroundColor ?? LIGHT_BG;
  const width = options.width ?? 640;
  const theme = options.theme ?? {};
  const darkEnabled = !!theme.darkMode || !!options.forceDark;

  const darkBlock =
    darkEnabled && options.instances && options.instances.length > 0
      ? buildDarkBlock(options.instances, !!options.forceDark)
      : "";

  // Meta tags + :root color-scheme are emitted unconditionally — they don't
  // hurt light-mode emails and they're required for Apple Mail to honour any
  // dark CSS we ship.
  return `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Arial, Helvetica, sans-serif" />
          <mj-section padding="0" />
          <mj-column padding="0" />
        </mj-attributes>
        <mj-raw>
          <meta name="color-scheme" content="${darkEnabled ? "light dark" : "light"}">
          <meta name="supported-color-schemes" content="${darkEnabled ? "light dark" : "light"}">
          <!--[if mso]>
          <style>
            /* VERBATIM Schneider MSO CSS (sch_email.html lines 466-507).
               Outlook Word renderer drops rgba, ignores padding on td
               elements inside v:textbox, and ignores margin on most
               block elements. These rules give Outlook the spacing
               and typography that inline styles and webmail CSS cannot
               reach. The CRITICAL rule is the .banner .button margin
               which insets the CTA from the overlay left edge on
               Outlook — without it the button sits flush against the
               overlay border. */
            .blackbg {
              background: #000 !important;
              margin: 15px 50px !important;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: Arial, sans-serif;
              font-weight: bold;
              line-height: 1.2;
            }
            h1 { font-size: 26px; }
            .banner .button-outline,
            .banner .button,
            .banner h1 {
              margin-bottom: 20px !important;
            }
            .banner .button-outline,
            .banner .button {
              margin: 20px 0 20px 25px !important;
            }
          </style>
          <![endif]-->
        </mj-raw>
        <mj-style>
          :root { color-scheme: ${darkEnabled ? "light dark" : "light"}; supported-color-schemes: ${darkEnabled ? "light dark" : "light"}; }
          a { text-decoration: underline; }
        </mj-style>
        <mj-style>
          /* Verbatim Schneider main stylesheet rules (sch_email.html
             lines 105-217). These are the LIGHT-MODE webmail rules. */
          .rounded-corner { border-radius: 8px; }
          .button { cursor: pointer; }
          table.button td {
            text-align: center;
            padding: 10px 5px;
            border-radius: 5px;
            line-height: 15px !important;
            font-weight: 400;
            max-width: 190px;
            width: 190px;
          }
          .banner h1 {
            font-family: Arial, sans-serif;
            font-weight: bold;
            line-height: 1.2;
            font-size: 34px;
            margin: 0;
          }
          .banner p { margin: 0; }
          .banner .button-outline td { border: 2px solid #fff !important; }
          .banner .button-outline td a,
          .banner .button-outline td a span,
          .banner .button td a,
          .banner .button td a span { color: #fff !important; }
        </mj-style>
        <mj-style>
          @media (max-width:480px) {
            .mj-full-width-mobile { width: 100% !important; max-width: 100% !important; }
            .fluid { width: 100% !important; max-width: 100% !important; }
            .mobile-auto-height { height: auto !important; }
            .mobile-hidden { display: none !important; mso-hide: all; max-height: 0 !important; overflow: hidden !important; }
            .responsive-td {
              margin: 0 auto !important;
              max-width: 100% !important;
              width: 100% !important;
              display: block !important;
              box-sizing: border-box !important;
            }
            .mb-hero-overlay-headline { font-size: 22px !important; line-height: 1.2 !important; }
            .mb-hero-overlay-paragraph { font-size: 14px !important; line-height: 1.5 !important; }
            .mb-utility-text > div { font-size: 11px !important; line-height: 1.4 !important; }
          }
        </mj-style>
        ${darkBlock}
      </mj-head>
      <mj-body css-class="mb-body" background-color="${bg}" width="${width}px">
        ${body}
      </mj-body>
    </mjml>
  `;
}
