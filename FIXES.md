# FIXES log

A chronological log of verified bugfixes. Read this before editing an area
you've touched before. The "Never regress to" line is the stop sign: if
you're about to write that pattern again, re-read the entry first and
confirm with the user before regressing.

Format per entry:

```
## YYYY-MM-DD — <one-line title>

**Problem:** <one-sentence symptom>
**Root cause:** <one-sentence diagnosis>
**Fix:** <where the change is, file:line>
**Verified by:** <how the user confirmed it works>
**Never regress to:** <the wrong pattern>
```

---

## 2026-05-14 — Hero CTA flush against overlay edge

**Problem:** The CTA button in the hero-bg-image module rendered flush against the overlay's rounded left edge in Outlook (all variants), instead of being inset ~25px.
**Root cause:** Original inset relied on `.banner .button { margin: 20px 0 20px 25px }` inside an `<!--[if mso]>` conditional. Outlook 365 web, Outlook Mac, and Outlook iOS strip MSO conditionals entirely, so the rule never fired in those clients. A later attempt using a sibling `<td width="25">` spacer cell worked positionally but punched a transparent hole in the `.blackbg` overlay because Outlook 2007-2016 does not paint a parent table's `background` (rgba or solid) behind nested tables.
**Fix:** `lib/modules/banner/hero-bg-image.ts:194-216`. Inset is now an inline `margin-left:${ctaInset}px` directly on the `<table class="button">`. Single table, no spacer cell, no MSO dependency. `ctaInset` is a new schema prop (0-80px, default 25). The button table's `display:inline-block` falls back to block in Outlook Word renderer, which respects table-level inline `margin-left`.
**Verified by:** User opened the exported HTML in multiple Outlook versions and confirmed the CTA is inset with a solid overlay color behind it.
**Never regress to:** A sibling `<td width="N">` spacer cell inside a nested `<table>` for inset positioning. Always use inline `margin-left` on the button table itself.

---

## 2026-05-14 — Mobile hamburger menu hidden behind palette pills

**Problem:** Tapping the mobile hamburger opened a full-screen menu, but module palette items ("Preheader", "Top utility bar") and canvas content rendered THROUGH the menu, on top of it.
**Root cause:** The Toolbar `<header>` has `backdrop-blur`, which creates a new CSS stacking context. The `z-[70]` set on the menu overlay was relative to that header's stacking context, while ModulePalette and Canvas (later in DOM order, root stacking context) had effective higher z because their stacking-context parent was the root.
**Fix:** `components/editor/Toolbar.tsx:254-322`. The menu overlay is now rendered via `createPortal(..., document.body)` so it becomes a direct child of `<body>`, escaping the header's stacking context. Bumped z to `z-[100]`/`z-[101]`. Added `body.style.overflow = "hidden"` while the menu is open to prevent the page underneath from scrolling.
**Verified by:** User confirmed on mobile that the menu opens fullscreen and nothing bleeds through.
**Never regress to:** Rendering a fixed-position overlay as a child of an element with `backdrop-filter`, `transform`, `opacity<1`, `filter`, or `will-change`. Use a portal to `document.body` for any full-screen modal.

---

## 2026-05-14 — Footer not visible on landing page

**Problem:** User reported the landing page footer was not visible at all.
**Root cause:** Previous footer had `bg-white` against `bg-stone-50` main (near-invisible contrast at the border) plus an absolute-positioned diagonal-hatch overlay inside `overflow-hidden`. The hatch overlay likely interfered with layout paint or the contrast was simply imperceptible.
**Fix:** `app/page.tsx` footer block. Replaced with `bg-stone-900` dark surface, `mt-auto` to anchor at the bottom of the flex column, `min-h-[88px]` so it can't collapse, and dropped the hatch overlay entirely. Lightning-bolt credit pill kept with amber→blue hover transition that pops against the dark surface.
**Verified by:** User confirmed the footer is now visible.
**Never regress to:** White footer with low-contrast border. If a footer must look subtle, use a slight tone shift (e.g. `bg-stone-100`) plus a visible border, never `bg-white` on `bg-stone-50`.

---

## 2026-05-14 — Drag-drop laggy and "cannot release"

**Problem:** UAT tester reported: "sometimes you cannot grab it, sometimes it lags when you release it, can't even release when moving right."
**Root cause:** Three independent bugs:
1. The live-preview iframe in Canvas covers ~90% of the visible drop zone. The iframe is a separate browsing context that swallows pointermove events, so dnd-kit's `pointerWithin` collision detection (running in the parent window) loses the cursor once it crosses into the iframe area. Effective drop zone shrunk to a thin frame around the iframe.
2. Render pipeline used a 250ms debounce on every state change including structural ones. After drop the user waited 250ms (debounce) + 200-400ms (API) + 100-200ms (iframe srcDoc reload) = ~700ms before seeing the module.
3. The palette card had click-vs-drag ambiguity. The whole card was the drag handle, AND the hover-revealed `+` button used `onPointerDown stopProp` to opt out, making the button area a dead zone for drag-start. Single-click did nothing (only `onDoubleClick` was wired).
**Fix:**
- `components/editor/Canvas.tsx`: subscribed to drag state via `useDndMonitor()`, set `pointer-events: none` on the iframe wrapper while a drag is in flight.
- Same file: split the render debounce. Derive a `structureKey` from the uid list, render with delay=0 when structureKey or theme/forceDark change, keep 250ms only for prop-only updates (typing).
- `components/editor/ModulePalette.tsx`: split the card into a dedicated 28px GripVertical drag handle on the left + a click-to-add region for the rest of the row. Every pixel has one purpose.
- `components/editor/Editor.tsx`: PointerSensor `activationConstraint.distance` bumped 4→6.
**Verified by:** User tested drag-drop after deploy and reported it feels smooth.
**Never regress to:** Wrapping a live `<iframe>` directly inside a dnd-kit droppable without a pointer-events guard during drag. Always set `pointer-events: none` on iframe wrappers while a drag is active.

---

## 2026-05-14 — Tiptap "Duplicate extension names ['link']" warning

**Problem:** Console warning `[tiptap warn]: Duplicate extension names found: ['link']. This can lead to issues.` on every keystroke in rich-text fields.
**Root cause:** Tiptap v3 StarterKit bundles a default Link extension. We were also configuring our own `Link.configure(...)` for autolink + `target=_blank`. Both registered with the same name.
**Fix:** `components/editor/fields/RichTextField.tsx:19-30`. Pass `link: false` to `StarterKit.configure({...})` so only our custom Link runs.
**Verified by:** Console clean of duplicate-extension warnings.
**Never regress to:** Adding a Tiptap extension without checking whether StarterKit already bundles it in v3+.

---

## 2026-05-14 — "Blocked script execution in 'about:srcdoc'" console errors

**Problem:** ~11 console errors per editor page load: `Blocked script execution in 'about:srcdoc' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.`
**Root cause:** ModulePalette hover-preview iframes were fetched with `?mode=preview`, which injects a chrome `<script>` intended for the main canvas iframe (postMessage bridge for click-to-select). The palette iframe is sandboxed without `allow-scripts`, so that script fails noisily on every popover.
**Fix:** `components/editor/ModulePalette.tsx:35-60`. Palette preview fetcher now uses the default export mode (no chrome script). Same compiled HTML for the popover, no console noise.
**Verified by:** Page loads cleanly without the run of script-blocked errors.
**Never regress to:** Using `?mode=preview` for any iframe that does not need the click-to-select bridge.
