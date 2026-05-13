import mjml2html from "mjml";
import type { ModuleInstance, Theme } from "../modules/types";
import { getModule } from "../modules/registry";
import { wrapMjml } from "./shell";

export type RenderResult = {
  html: string;
  errors: { line: number; tagName: string; message: string }[];
};

export type RenderMode = "export" | "preview";

export type CompileOptions = {
  mode?: RenderMode;
  theme?: Theme;
  /** Force the dark-mode CSS on, regardless of prefers-color-scheme. Used in editor preview. */
  forceDark?: boolean;
};

const SECTION_TAG_REGEX = /<mj-section(?=\s|>|\/>)/;

/**
 * Inject `mb-uid-{uid}` and `mb-section` onto the first <mj-section>, plus
 * `mb-text` on every <mj-text> and `mb-btn` on every <mj-button>. Also handles
 * existing `css-class` attributes by merging into them.
 */
function annotate(mjml: string, uid: string): string {
  let out = mjml;

  // First section gets mb-uid-X + mb-section
  if (SECTION_TAG_REGEX.test(out)) {
    out = out.replace(
      SECTION_TAG_REGEX,
      `<mj-section css-class="mb-uid-${uid} mb-section"`
    );
  }

  // Tag every mj-text. If a css-class already exists, merge.
  out = out.replace(/<mj-text(\s[^>]*)?>/g, (m, attrs?: string) => {
    if (!attrs) return `<mj-text css-class="mb-text">`;
    if (/\bcss-class\s*=/.test(attrs)) {
      return m.replace(
        /css-class\s*=\s*"([^"]*)"/,
        (_a, val: string) => `css-class="${val} mb-text"`
      );
    }
    return `<mj-text${attrs} css-class="mb-text">`;
  });

  // Tag every mj-button.
  out = out.replace(/<mj-button(\s[^>]*)?>/g, (m, attrs?: string) => {
    if (!attrs) return `<mj-button css-class="mb-btn">`;
    if (/\bcss-class\s*=/.test(attrs)) {
      return m.replace(
        /css-class\s*=\s*"([^"]*)"/,
        (_a, val: string) => `css-class="${val} mb-btn"`
      );
    }
    return `<mj-button${attrs} css-class="mb-btn">`;
  });

  return out;
}

export function buildMjml(instances: ModuleInstance[], theme?: Theme, forceDark = false): string {
  const body = instances
    .map((inst) => {
      const m = getModule(inst.moduleId);
      if (!m) return `<!-- unknown module: ${inst.moduleId} -->`;
      try {
        const raw = m.render(inst.props);
        return annotate(raw, inst.uid);
      } catch (e) {
        return `<!-- render error in ${inst.moduleId}: ${(e as Error).message} -->`;
      }
    })
    .join("\n");
  return wrapMjml(body, { theme, forceDark, instances });
}

export async function compileTemplate(
  instances: ModuleInstance[],
  options: CompileOptions = {}
): Promise<RenderResult> {
  const { mode = "export", theme, forceDark } = options;
  if (!instances || instances.length === 0) {
    return {
      html: emptyDocument(mode, !!forceDark),
      errors: [],
    };
  }
  const mjmlSource = buildMjml(instances, theme, forceDark);
  const result = await mjml2html(mjmlSource, {
    validationLevel: "soft",
    keepComments: false,
    minify: false,
  });
  const html =
    mode === "preview" ? injectPreviewChrome(result.html) : result.html;
  return {
    html,
    errors: result.errors.map((e) => ({
      line: e.line ?? 0,
      tagName: e.tagName ?? "",
      message: e.message ?? "",
    })),
  };
}

function injectPreviewChrome(html: string): string {
  // Inject a <base href> so relative URLs (like the default logo
  // `/maestro-logo.png` shipped from `public/`) resolve against the
  // editor app's origin instead of `about:srcdoc`. The runtime script
  // patches it client-side because the server can't know the iframe's
  // browsing-context origin at compile time. Setting `target="_blank"`
  // also ensures iframe link clicks open in a new tab rather than
  // replacing the preview.
  const baseInject = `
<base id="mb-preview-base" href="/" target="_blank">
<script>
(function(){
  try {
    var b = document.getElementById('mb-preview-base');
    if (b && window.parent && window.parent.location && window.parent.location.origin) {
      b.setAttribute('href', window.parent.location.origin + '/');
    }
  } catch (e) {}
})();
</script>`;
  const chrome = `
<style id="mb-preview-chrome">
  [class*="mb-uid-"] {
    cursor: pointer;
    transition: outline-color 120ms ease;
    outline: 1px dashed transparent;
    outline-offset: -1px;
  }
  [class*="mb-uid-"]:hover {
    outline: 2px solid rgba(29, 78, 216, 0.45);
    outline-offset: -1px;
  }
  .mb-selected {
    outline: 2px solid #1d4ed8 !important;
    outline-offset: -1px;
  }
  [class*="mb-uid-"] a { cursor: pointer; }

  /* Preheader is hidden in real inboxes via inline display:none + opacity:0.
   * Override here ONLY in editor preview so the user can see/edit it. The
   * !important wins over the inline style because inline style="display:none"
   * has no !important flag. The badge before it makes the override obvious. */
  .mb-preheader {
    display: block !important;
    opacity: 1 !important;
    max-height: none !important;
    max-width: 100% !important;
    height: auto !important;
    width: auto !important;
    overflow: visible !important;
    line-height: 1.5 !important;
    color: #475569 !important;
    background: #f1f5f9 !important;
    border: 1px dashed #cbd5e1 !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    margin: 8px 0 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 12px !important;
  }
  .mb-preheader::before {
    content: "Hidden in inbox · shown only in preview snippet — ";
    font-weight: 600;
    color: #64748b;
  }
</style>
<script id="mb-preview-bridge">
(function () {
  function findUid(el) {
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.classList) {
        for (var i = 0; i < el.classList.length; i++) {
          var c = el.classList[i];
          if (c.indexOf('mb-uid-') === 0) return c.slice('mb-uid-'.length);
        }
      }
      el = el.parentElement;
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document.body) {
      if (t.tagName === 'A') { e.preventDefault(); break; }
      t = t.parentElement;
    }
    var uid = findUid(e.target);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ source: 'mb-preview', type: 'select', uid: uid }, '*');
    }
  }, true);
  window.addEventListener('message', function (e) {
    var data = e.data || {};
    if (data.source !== 'mb-editor') return;
    if (data.type === 'set-selected') {
      var prev = document.querySelectorAll('.mb-selected');
      for (var i = 0; i < prev.length; i++) prev[i].classList.remove('mb-selected');
      if (data.uid) {
        var el = document.querySelector('.mb-uid-' + data.uid);
        if (el) {
          el.classList.add('mb-selected');
          if (data.scroll) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    if (data.type === 'restore-scroll' && typeof data.scrollTop === 'number') {
      window.scrollTo({ top: data.scrollTop, behavior: 'instant' });
    }
  });
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ source: 'mb-preview', type: 'ready' }, '*');
  }
})();
</script>
`;
  let out = html;
  // <base> must be inside <head> so it applies before any <img> resolves.
  if (out.includes("</head>")) {
    out = out.replace("</head>", `${baseInject}</head>`);
  } else {
    out = baseInject + out;
  }
  if (out.includes("</body>")) {
    return out.replace("</body>", `${chrome}</body>`);
  }
  return out + chrome;
}

function emptyDocument(mode: RenderMode, dark: boolean): string {
  const cta =
    mode === "preview"
      ? "Drag a module from the left panel to start building."
      : "Drag modules from the left panel into the canvas to start building your email.";
  const bg = dark ? "#0a0a0a" : "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)";
  const text = dark ? "#a8a8a8" : "#44403c";
  const headlineText = dark ? "#e8e8e8" : "#1c1917";
  const cardBg = dark ? "#1e1e1e" : "#ffffff";
  const border = dark ? "#2c2c2c" : "#e7e5e4";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html, body { margin:0; padding:0; height:100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bg}; color: ${text}; }
    .empty { display:flex; align-items:center; justify-content:center; min-height:100%; padding:32px; text-align:center; }
    .card { max-width:420px; }
    .card h2 { margin:0 0 8px; font-size:18px; font-weight:600; color: ${headlineText}; letter-spacing:-0.01em; }
    .card p { margin:0; font-size:14px; line-height:1.6; color: ${text}; }
    .badge { display:inline-block; margin-bottom:12px; padding:4px 10px; border:1px solid ${border}; border-radius:999px; font-size:11px; letter-spacing:0.04em; text-transform:uppercase; color: ${text}; background: ${cardBg}; }
  </style></head><body>
    <div class="empty"><div class="card">
      <span class="badge">Empty canvas</span>
      <h2>Start your email</h2>
      <p>${cta}</p>
    </div></div>
  </body></html>`;
}
