"use client";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Loader2, Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "@/lib/state/store";
import { cn } from "@/lib/utils";

type Viewport = "desktop" | "mobile";
type ColorScheme = "light" | "dark";

type PreviewMessage =
  | { source: "mb-preview"; type: "ready" }
  | { source: "mb-preview"; type: "select"; uid: string | null };

export function Canvas() {
  const instances = useEditor((s) => s.instances);
  const selectedUid = useEditor((s) => s.selectedUid);
  const select = useEditor((s) => s.select);
  const theme = useEditor((s) => s.theme);

  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [previewScheme, setPreviewScheme] = useState<ColorScheme>("light");
  const [html, setHtml] = useState<string>("");
  const [rendering, setRendering] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = useRef<AbortController | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const lastScrollRef = useRef(0);

  const dropArea = useDroppable({ id: "canvas-drop-area" });

  // Subscribe to drag-state from the parent DndContext so we can disable
  // pointer events on the iframe during a drag. The iframe is a separate
  // browsing context and swallows pointer events — without this, dnd-kit's
  // `pointerWithin` collision detection can't see the cursor once it crosses
  // into the iframe area (≈90% of the visible drop zone), so drops fail.
  const [isDragging, setIsDragging] = useState(false);
  useDndMonitor({
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
    onDragCancel: () => setIsDragging(false),
  });

  // If template doesn't have darkMode but user wants dark preview, that's fine —
  // we force-dark in the iframe URL param regardless. But if the template is
  // configured with darkMode and user toggles preview to dark, both line up.
  const forceDark = previewScheme === "dark";

  // Capture iframe scroll before we replace srcDoc, so we can restore it.
  useEffect(() => {
    function captureScroll() {
      const w = iframeRef.current?.contentWindow;
      if (w) lastScrollRef.current = w.scrollY;
    }
    const id = setInterval(captureScroll, 250);
    return () => clearInterval(id);
  }, []);

  // Render → iframe srcDoc (debounced for typing, immediate for structure).
  //
  // The structureKey only changes when modules are added/removed/reordered —
  // i.e. the drag-drop path. Typing into a property field changes the props
  // inside an existing module but leaves the structureKey identical. We
  // render with delay=0 on structure changes so drops feel instant, and
  // keep the 250ms debounce on prop-only changes so typing doesn't fire
  // a request per keystroke. Same logic for theme + forceDark toggles
  // (single-click events, not repeated).
  const structureKey = useMemo(
    () => instances.map((i) => i.uid).join(","),
    [instances]
  );
  const lastStructureKeyRef = useRef(structureKey);
  const lastThemeRef = useRef(theme);
  const lastForceDarkRef = useRef(forceDark);

  useEffect(() => {
    const structureChanged = structureKey !== lastStructureKeyRef.current;
    const themeChanged = theme !== lastThemeRef.current;
    const darkChanged = forceDark !== lastForceDarkRef.current;
    lastStructureKeyRef.current = structureKey;
    lastThemeRef.current = theme;
    lastForceDarkRef.current = forceDark;

    const skipDebounce = structureChanged || themeChanged || darkChanged;
    const delay = skipDebounce ? 0 : 250;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (reqRef.current) reqRef.current.abort();
      const controller = new AbortController();
      reqRef.current = controller;
      readyRef.current = false;
      setRendering(true);
      const params = new URLSearchParams({ mode: "preview" });
      if (forceDark) params.set("forceDark", "1");
      fetch(`/api/render?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: 1, instances, theme }),
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data: { html: string; errors?: { message: string }[] }) => {
          setHtml(data.html ?? "");
          setErrors((data.errors ?? []).map((e) => e.message));
        })
        .catch(() => {})
        .finally(() => setRendering(false));
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [instances, theme, forceDark, structureKey]);

  // Receive postMessage from iframe (click-to-select + ready signal)
  useEffect(() => {
    function onMsg(ev: MessageEvent<PreviewMessage>) {
      const data = ev.data;
      if (!data || data.source !== "mb-preview") return;
      if (data.type === "ready") {
        readyRef.current = true;
        sendSelected(selectedUid);
        // restore scroll position from before re-render
        const w = iframeRef.current?.contentWindow;
        w?.postMessage(
          { source: "mb-editor", type: "restore-scroll", scrollTop: lastScrollRef.current },
          "*"
        );
      } else if (data.type === "select") {
        select(data.uid ?? null);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [select]);

  const sendSelected = useCallback((uid: string | null, scroll = false) => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.postMessage({ source: "mb-editor", type: "set-selected", uid, scroll }, "*");
  }, []);

  useEffect(() => {
    if (readyRef.current) sendSelected(selectedUid, true);
  }, [selectedUid, sendSelected]);

  const handleIframeLoad = useCallback(() => {
    readyRef.current = true;
    sendSelected(selectedUid);
  }, [selectedUid, sendSelected]);

  const widthClass = useMemo(
    () => (viewport === "desktop" ? "max-w-[680px]" : "max-w-[380px]"),
    [viewport]
  );

  return (
    <main
      className={cn(
        "relative flex h-full min-w-0 flex-1 flex-col transition-colors",
        forceDark ? "bg-stone-900" : "bg-stone-100"
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-center justify-between gap-2 border-b px-3 py-2 backdrop-blur transition-colors md:px-4",
          forceDark
            ? "border-stone-800 bg-stone-900/80 text-stone-300"
            : "border-stone-200 bg-white/80"
        )}
      >
        <div className="flex min-w-0 items-center gap-2 text-xs md:gap-3">
          <RenderStatus rendering={rendering} errors={errors} dark={forceDark} />
          <span className={cn("hidden md:inline", forceDark ? "text-stone-600" : "text-stone-400")}>·</span>
          <span className={cn("hidden truncate md:inline", forceDark ? "text-stone-400" : "text-stone-500")}>
            {instances.length === 0
              ? "Empty canvas"
              : `${instances.length} module${instances.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SchemeSwitch value={previewScheme} onChange={setPreviewScheme} />
          <ViewportSwitch value={viewport} onChange={setViewport} />
        </div>
      </div>

      <div
        ref={dropArea.setNodeRef}
        className={cn(
          "relative flex flex-1 justify-center overflow-y-auto px-3 pb-32 pt-3 transition md:px-6 md:pb-10 md:pt-6",
          // Bottom padding bumped on mobile so the property-panel drawer
          // (max-h:70vh) doesn't cover the canvas tail when expanded.
          !forceDark && "mb-grain",
          dropArea.isOver && "ring-2 ring-blue-300/50 ring-inset",
          dropArea.isOver && !forceDark && "bg-blue-50/40",
          dropArea.isOver && forceDark && "bg-blue-950/30"
        )}
      >
        <div
          className={cn(
            "w-full overflow-hidden rounded-lg transition-[max-width,box-shadow] duration-300 ease-out md:rounded-xl",
            widthClass,
            forceDark
              ? "bg-stone-950 shadow-[0_1px_0_rgba(0,0,0,0.6),0_18px_40px_-20px_rgba(0,0,0,0.7)]"
              : "bg-white shadow-[0_1px_0_rgba(28,25,23,0.04),0_18px_40px_-20px_rgba(28,25,23,0.18)]"
          )}
          style={{
            minHeight: "calc(100dvh - 240px)",
            // While a drag is in flight, kill pointer events on the
            // iframe wrapper so dnd-kit's collision detection (which lives
            // in the parent window) can see the cursor as it moves over
            // the canvas. Without this the iframe captures pointermove
            // events and the drop zone effectively shrinks to the ~24px
            // padding strip around the iframe.
            pointerEvents: isDragging ? "none" : "auto",
          }}
        >
          {/* `100dvh` (dynamic viewport height) so the iframe doesn't jump
              when iOS Safari's address bar hides/shows on scroll. */}
          <iframe
            ref={iframeRef}
            title="Live email preview"
            srcDoc={html}
            onLoad={handleIframeLoad}
            className="h-full w-full border-0"
            style={{ minHeight: "calc(100dvh - 240px)" }}
          />
        </div>

        {dropArea.isOver && (
          <div className="pointer-events-none absolute inset-x-6 top-6 flex items-start justify-center">
            <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-medium text-white shadow-lg shadow-blue-700/25">
              Release to add to layout
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

function RenderStatus({
  rendering,
  errors,
  dark,
}: {
  rendering: boolean;
  errors: string[];
  dark: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (rendering) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          dark ? "text-stone-400" : "text-stone-500"
        )}
      >
        <Loader2 size={12} className="animate-spin" />
        Rendering
      </span>
    );
  }
  if (errors.length > 0) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition hover:underline",
            dark ? "text-amber-400 hover:bg-amber-400/10" : "text-amber-700 hover:bg-amber-50"
          )}
          aria-expanded={open}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {errors.length} MJML warning{errors.length > 1 ? "s" : ""}
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              className={cn(
                "absolute left-0 top-7 z-40 w-[440px] max-w-[80vw] overflow-hidden rounded-md border shadow-lg",
                dark
                  ? "border-stone-700 bg-stone-900 text-stone-200"
                  : "border-stone-200 bg-white text-stone-800"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide",
                  dark ? "border-b border-stone-700 text-stone-400" : "border-b border-stone-100 text-stone-500"
                )}
              >
                <span>MJML warnings · {errors.length}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={dark ? "text-stone-400 hover:text-stone-100" : "text-stone-400 hover:text-stone-700"}
                  aria-label="Close warnings"
                >
                  ×
                </button>
              </div>
              <ul className="max-h-60 overflow-y-auto py-1">
                {errors.map((message, i) => (
                  <li
                    key={i}
                    className={cn(
                      "px-3 py-2 text-[11px] leading-snug",
                      i > 0 && (dark ? "border-t border-stone-800" : "border-t border-stone-100")
                    )}
                  >
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        dark ? "text-emerald-400" : "text-emerald-700"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Up to date
    </span>
  );
}

function ViewportSwitch({
  value,
  onChange,
}: {
  value: Viewport;
  onChange: (v: Viewport) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-stone-200 bg-white p-0.5 text-xs">
      <SwitchBtn active={value === "desktop"} onClick={() => onChange("desktop")} icon={Monitor}>
        Desktop
      </SwitchBtn>
      <SwitchBtn active={value === "mobile"} onClick={() => onChange("mobile")} icon={Smartphone}>
        Mobile
      </SwitchBtn>
    </div>
  );
}

function SchemeSwitch({
  value,
  onChange,
}: {
  value: ColorScheme;
  onChange: (v: ColorScheme) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-stone-200 bg-white p-0.5 text-xs">
      <SwitchBtn active={value === "light"} onClick={() => onChange("light")} icon={Sun}>
        Light
      </SwitchBtn>
      <SwitchBtn active={value === "dark"} onClick={() => onChange("dark")} icon={Moon}>
        Dark
      </SwitchBtn>
    </div>
  );
}

function SwitchBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Monitor;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition",
        active
          ? "bg-stone-900 text-white shadow-sm"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      )}
    >
      <Icon size={12} />
      <span>{children}</span>
    </button>
  );
}
