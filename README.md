<p align="center">
  <img src="./public/maestro-logo.png" width="260" alt="Maestro Builder" />
</p>

<p align="center">
  <em>Drag, drop, tweak — ship emails that render everywhere.</em>
</p>

<p align="center">
  <a href="#quick-start"><strong>Quick start</strong></a> ·
  <a href="#configuration"><strong>Configuration</strong></a> ·
  <a href="#module-library"><strong>Modules</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#adding-a-module"><strong>Adding a module</strong></a>
</p>

---

A drag-and-drop visual builder for **bulletproof responsive HTML emails** that render cleanly across Gmail, Yahoo, every Outlook from 2007 onward, and mobile inboxes. Compose with typed modules, edit copy with WYSIWYG, tweak every radius, color and spacing in a property panel, ship a real test through your own inbox via [Mailjet](https://mailjet.com) or [htmltest.email](https://htmltest.email), then export the bulletproof HTML for your production ESP (Salesforce Marketing Cloud, Marketo, Eloqua, etc.).

It's the modern replacement for an internal jQuery-era tool that produced 75 hand-tuned email modules across four `.json` files. Maestro Builder collapses that into ~30 typed-and-editable modules with a real preview, real send-test, and real dark-mode support.

## Highlights

- **30 production-ready modules** — preheaders, logos, hero with bg-image overlay (VML-bulletproof for Outlook), three-column feature rows, numbered steps, product cards with star ratings, promo banners with redemption codes, app-store badges, footers with configurable social slots, dividers and accent rules
- **Live preview canvas** — click any module in the rendered email to select it; the right panel re-renders with that module's typed properties
- **Bulletproof Outlook** — `<v:roundrect>` rounded buttons, `<v:image>` + `<v:rect>` overlay-on-photo hero pattern, `mso-padding-alt` everywhere, all derived from documented Litmus / Email-on-Acid patterns
- **Dark-mode support** — opt-in toggle that emits per-instance HSL-derived dark variants (red bg → dark red, dark navy headline → soft light blue) plus `[data-ogsc]` / `[data-ogsb]` mirrors for Outlook.com and the meta tags Apple Mail requires
- **Send a test in two clicks** — Mailjet integration with friendly error guidance for the validation hold / sender-not-verified states; falls back to a one-click "open in htmltest.email" with the HTML auto-copied to clipboard
- **No backend persistence** — `.html` downloads ship the email, `.json` downloads round-trip the editable state, base64 URL state lets you share a draft over Slack
- **Bulletproof rounded CTAs** that survive Outlook 2007 with the canonical VML `<v:roundrect>` + `mso-hide:all` HTML fallback pattern, with arcsize calculated correctly from radius/height
- **Inline WYSIWYG text editing** via Tiptap (bold / italic / strike / lists / links) inside the property panel
- **Live MJML warnings panel** — click the warnings count in the canvas header to see every issue MJML emitted on the last render

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Drag-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Inline rich text | Tiptap (StarterKit + Link) |
| State | Zustand with `localStorage` persistence |
| Email engine | [`mjml`](https://github.com/mjmlio/mjml) running in a Next.js Route Handler (`/api/render`) |
| Send-test | [Mailjet](https://mailjet.com) via [`node-mailjet`](https://www.npmjs.com/package/node-mailjet) |
| Telemetry | `@vercel/analytics` + `@vercel/speed-insights` |
| Hosting | Vercel |

## Quick start

```bash
git clone https://github.com/MetalHacker01/MaestroBuilder.git
cd MaestroBuilder
npm install
cp .env.local.example .env.local   # create .env.local; fill in Mailjet keys (see below)
npm run dev
```

Open <http://localhost:3000>, click **Open editor**, drag a module from the palette into the canvas, edit on the right.

## Configuration

Maestro sends test emails through Mailjet. The free tier gives you 200 sends/day and 6000/month — well beyond what a typical QA loop needs.

Add to `.env.local` (already in `.gitignore`):

```bash
MAILJET_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILJET_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILJET_FROM_ADDRESS=you@yourdomain.com   # must match a verified sender
MAILJET_FROM_NAME=Maestro Builder
```

**One-time Mailjet setup** (~2 minutes):

1. Sign up at [app.mailjet.com](https://app.mailjet.com) (free tier, no card required)
2. **Senders & Domains** → **Add a sender** → enter your email → click the confirmation link Mailjet emails you
3. **Account Settings** → **API Key Management** → copy the API Key + Secret Key
4. Paste them into `.env.local`, set `MAILJET_FROM_ADDRESS` to the email you verified in step 2, restart the dev server

If `MAILJET_FROM_ADDRESS` is unset, the API returns a 503 with guided setup steps that surface inside the Send-test dialog — so a misconfigured environment never silently fails.

When Mailjet is unavailable (account hold, validation review, no internet), the dialog has an **htmltest.email** fallback button: it renders the email, copies the HTML to your clipboard, and opens [htmltest.email](https://htmltest.email) in a new tab so you can paste and send manually. Works offline-of-Mailjet without any backend integration.

## Module library

30 modules across 6 categories. Each one defines a typed schema (`text` / `richtext` / `color` / `number` / `select` / `url` / `image-url` / `align` / `spacing`) and a `render(props)` function that returns MJML.

| Category | Modules |
|---|---|
| Preheader (2) | preheader (hidden snippet), header-utility-bar (visible top bar with View Online link) |
| Logo (3) | logo-left, logo-center, logo-right |
| Banner / Hero (4) | banner-hero (full-width image), **hero-bg-image** (image + overlay card with VML for Outlook), banner-image-left, banner-image-right |
| Body (16) | headline-paragraph, headline-paragraph-cta, two-col-text, two-col-image-text, three-columns, bullets, bullets-numbered, image-card, quote, cta-only, cta-pair, **promo-banner** (offer + code chip), **product-card**, **product-review** (with ★ rating + customer quote), **stat-row** (3-number social proof), **app-badges** (App Store + Google Play) |
| Footer (3) | legal, social (6 configurable platform slots + custom icon URLs), unsubscribe |
| Spacer (3) | vertical, divider (full hairline), accent-rule (short colored line under headlines) |

## Architecture

```
User edits  ─►  Zustand store ([instances])
                 │
                 ▼
       POST /api/render
                 │
                 ▼  buildMjml() concatenates each module.render(props)
                    + injects mb-uid-{uid} class markers on each section
                    for click-to-select + per-instance dark-mode rules
                 │
                 ▼  wrapMjml() adds the MJML shell:
                    - meta color-scheme tags (Apple Mail dark-mode opt-in)
                    - per-instance darkBg / lightText rules under
                      @media (prefers-color-scheme: dark) and
                      [data-ogsc]/[data-ogsb] for Outlook.com
                 │
                 ▼  mjml2html() compiles bulletproof HTML
                 │
                 ├─►  iframe srcdoc  (live editor preview)
                 └─►  blob download  /  Mailjet send  /  htmltest.email copy
```

| Path | Responsibility |
|---|---|
| `lib/modules/*` | One file per module — schema + `render(props)` |
| `lib/modules/registry.ts` | Imports + exports all 30 modules + `getDefaultProps()` helper |
| `lib/modules/helpers.ts` | `bulletproofButton()`, `bulletproofBgImage()`, `bulletproofCard()` helpers + the `BRAND` design tokens |
| `lib/render/compile.ts` | `buildMjml(instances)` — annotation, dispatch to module renders |
| `lib/render/shell.ts` | `wrapMjml()` — MJML shell, dark-mode emitter (`darkBg`, `lightText` HSL transforms), Outlook.com mirrors |
| `lib/render/colors.ts` | HSL helpers — hexToHsl, hslToHex, darkBg, lightText |
| `lib/state/store.ts` | Zustand store — add / remove / move / duplicate / updateProp / theme |
| `lib/state/url.ts` | base64url encode/decode for `?state=` share links |
| `lib/schema/template.ts` | Zod schema validating `.json` save files |
| `app/api/render/route.ts` | MJML compilation endpoint — dispatches to compile pipeline |
| `app/api/send-test/route.ts` | Mailjet integration with `humanizeMailjetError()` translating the cryptic `mj-XXXX` codes into actionable guidance |
| `components/editor/Editor.tsx` | 3-column shell (palette / canvas / properties) + dnd-kit `<DndContext>` |
| `components/editor/Canvas.tsx` | Live iframe preview with click-to-select via `postMessage` bridge |
| `components/editor/SendTestDialog.tsx` | Recipient input, Mailjet error states, htmltest.email fallback button + custom tooltip |

## Adding a module

1. Create a file at `lib/modules/<category>/<id>.ts`:

   ```ts
   import type { Module } from "../types";
   import { BRAND, FONT_STACK, TYPE_SCALE, escapeAttr, safeHtml, spacing } from "../helpers";

   export const myModule: Module = {
     id: "body-my-module",
     category: "body",
     label: "My module",
     schema: {
       headline: { type: "richtext", label: "Headline", default: "Hi", group: "Content" },
       bgColor:  { type: "color",    label: "Background", default: BRAND.surface, group: "Layout" },
       padding:  { type: "spacing",  label: "Section padding", default: { t: 32, r: 32, b: 32, l: 32 }, group: "Layout" },
     },
     render: (p) => `
       <mj-section background-color="${escapeAttr(p.bgColor)}" padding="${spacing(p.padding as never)}">
         <mj-column>
           <mj-text font-family="${FONT_STACK}" font-size="${TYPE_SCALE.h2}px" line-height="1.2" font-weight="700">
             ${safeHtml(p.headline)}
           </mj-text>
         </mj-column>
       </mj-section>
     `,
   };
   ```

2. Register it in `lib/modules/registry.ts`:

   ```ts
   import { myModule } from "./body/my-module";

   export const MODULES = [
     // ...
     myModule,
   ];
   ```

That's it. The palette, property panel, drag-drop, save / load, send-test, and dark-mode CSS pick it up automatically.

## Design system

| Token | Value |
|---|---|
| Accent | `#5B5BD6` (modern indigo, anti-Schneider, anti-cyan-gradient) |
| Heading | `#0F172A` (warm near-black) |
| Body text | `#1F2937` |
| Muted text | `#6B7280` |
| Surface (warm) | `#FBFAF7` |
| Border | `#E5E7EB` |
| Dark-mode surface | `#1E1E1E` (auto-derived per-instance from user's bgColor) |
| Dark-mode text | `#E8E8E8` (auto-derived per-instance) |
| Font stack | Helvetica Neue / Helvetica / Arial / sans-serif |
| Type scale | 32 (h1) / 22 (h2) / 18 (h3) / 15 (body) / 13 (small) / 12 (caption) |
| Button radius | 8px (`arcsize="36%"` for VML at 44px height) |
| Spacing rhythm | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 |

## Known limitations & tradeoffs

### Outlook desktop renders square corners on the hero overlay card

The canonical bulletproof bg-image pattern uses `<v:image>` + `<v:rect position:absolute>` for the background, and nesting a `<v:roundrect>` for the overlay inside that breaks the layout in Outlook (the overlay button drifts to the document origin). Buttons, banners, and standalone CTAs still get rounded corners on Outlook via VML; only the hero overlay's container is squared on Outlook desktop. The hero CTA inside the overlay also uses a flat-table button (no v:roundrect) for the same reason.

### Outlook click tracking on rounded VML buttons

Maestro Builder's `bulletproofButton` uses SFMC's verified pattern: the `<a href>` wraps the entire button (visible to all clients, including Outlook), and the `<v:roundrect href>` carries the same URL for the Outlook-rendered rounded shape. Marketing automation platforms (SFMC, Marketo, Eloqua, HubSpot) reliably rewrite the **outer `<a href>`** for link tracking — so 100% of non-Outlook clicks are tracked.

**Outlook clicks** go through the `<v:roundrect>` href. Whether they're tracked depends on the platform:

- **SFMC** — when you wrap the URL with `%%=RedirectTo(@var)=%%`, AMPscript expands BOTH href slots at send-time. Outlook clicks are tracked. Replace the URL in the exported HTML manually, or use SFMC's "Auto-track all URLs" account setting.
- **Marketo** — similar pattern with `{{lead.tokens}}` or trackable link tokens. Marketo's link-rewriter does scan mso conditional comments, so it can pick up the v:roundrect href automatically in most templates.
- **HubSpot** — only rewrites `<a href>`, not VML attributes. Outlook clicks navigate to the original URL with no tracking. The fix is to manually replace the URL in both places with HubSpot's tracked-link token after pasting the template.
- **Eloqua** — varies by linker mode. Test in Eloqua's preview before relying on Outlook tracking.

If full Outlook-click tracking matters more to you than rounded corners, you can remove the `<!--[if mso]><v:roundrect>...<![endif]-->` blocks from the exported HTML — buttons will render square in Outlook (every client sees just the flat HTML `<a>` + `<table>`) and tracking is universally 100%. This is configurable per-instance; just delete the VML blocks in your editor before pasting into the MAP.

### Force-invert clients ignore dark-mode CSS

Gmail iOS and Outlook 365 Windows desktop apply their own color inversion regardless of `prefers-color-scheme`. Maestro emits the correct media-query CSS + `[data-ogsc]` mirrors for clients that respect them, but you can't override force-invert. Design the light version to read in those clients.

### No server-side persistence

Templates are local-state only. Download `.json` to save, drag back in to load. URL `?state=` works for templates under ~6KB encoded.

### Single primary recipient per Mailjet send

Mailjet v3.1 requires separate messages for distinct primary recipients. Maestro puts the first recipient in `To` and the rest in `Bcc` — fine for QA test sends, not appropriate for production campaigns (use Mailjet's batch API or your real production ESP for those).

## Development

```bash
npm run dev       # http://localhost:3000 — live editor with hot reload
npm run build     # production build (verifies typecheck + MJML compilation)
npm run start     # production server
npm run lint      # ESLint
```

If the dev server hits the Turbopack `Cannot find module '[turbopack]_runtime.js'` error, it's the `.next` cache colliding with file syncing (OneDrive / iCloud / Dropbox). Fix:

```bash
# kill any stale dev server still holding the port:
netstat -ano | grep ":3000.*LISTENING"
taskkill //PID <pid> //F                # Windows
# or: kill <pid>                         # macOS / Linux
rm -rf .next
npm run dev
```

The durable fix is moving the project off the synced folder.

## License

Private / internal — no public license. If you fork this, please don't ship it as a paid SaaS.
