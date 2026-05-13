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
 * Buttons (`ctaBgColor`, `ctaTextColor`) are intentionally OMITTED — buttons
 * keep their brand colour in dark mode, otherwise saturated red/blue buttons
 * would all collapse to indistinguishable mud.
 */
const TEXT_PROPS = [
  "headlineColor",
  "paragraphColor",
  "textColor",
  "bodyColor",
  "bulletColor",
  "captionColor",
  "leftHeadlineColor",
  "rightHeadlineColor",
];

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
        </mj-raw>
        <mj-style>
          :root { color-scheme: ${darkEnabled ? "light dark" : "light"}; supported-color-schemes: ${darkEnabled ? "light dark" : "light"}; }
          a { text-decoration: underline; }
        </mj-style>
        <mj-style>
          /* Schneider helpers (sch_email.html): rounded-corner +
             responsive helpers + banner h1/p margin reset so the
             headline sits flush at the top of the rgba overlay card. */
          .rounded-corner { border-radius: 8px; }
          .button { cursor: pointer; }
          .banner h1 { line-height: 1.2; margin: 0; }
          .banner p { margin: 0; }
        </mj-style>
        <mj-style>
          @media (max-width:480px) {
            .mj-full-width-mobile { width: 100% !important; max-width: 100% !important; }
            .fluid { width: 100% !important; max-width: 100% !important; }
            .mobile-auto-height { height: auto !important; }
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
