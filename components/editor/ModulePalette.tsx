"use client";

import { useDraggable } from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { MODULES, getDefaultProps } from "@/lib/modules/registry";
import type { Module, ModuleCategory } from "@/lib/modules/types";
import { useEditor } from "@/lib/state/store";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  preheader: "Preheader",
  logo: "Logo",
  banner: "Banner",
  body: "Body",
  footer: "Footer",
  spacer: "Spacer",
};

const CATEGORY_ORDER: ModuleCategory[] = [
  "preheader",
  "logo",
  "banner",
  "body",
  "footer",
  "spacer",
];

/* Module-level preview cache: render-on-first-hover, reused for all later
 * hovers. Keyed by moduleId. Stored outside the component so it survives
 * re-renders (and palette re-mounts from search filtering). */
const previewCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

async function fetchPreview(moduleId: string): Promise<string> {
  if (previewCache.has(moduleId)) return previewCache.get(moduleId)!;
  if (inflight.has(moduleId)) return inflight.get(moduleId)!;
  const promise = (async () => {
    const props = getDefaultProps(moduleId);
    const res = await fetch("/api/render?mode=preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: 1,
        instances: [{ uid: "_preview", moduleId, props }],
      }),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { html?: string };
    const html = data.html ?? "";
    previewCache.set(moduleId, html);
    return html;
  })();
  inflight.set(moduleId, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(moduleId);
  }
}

export function ModulePalette() {
  const [filter, setFilter] = useState("");
  const add = useEditor((s) => s.add);

  const grouped = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const buckets: Record<ModuleCategory, Module[]> = {
      preheader: [],
      logo: [],
      banner: [],
      body: [],
      footer: [],
      spacer: [],
    };
    for (const m of MODULES) {
      if (f && !m.label.toLowerCase().includes(f) && !m.id.includes(f)) continue;
      buckets[m.category].push(m);
    }
    return buckets;
  }, [filter]);

  const totalShown = useMemo(
    () => Object.values(grouped).reduce((s, l) => s + l.length, 0),
    [grouped]
  );

  // Flatten for mobile horizontal layout (no category headers on mobile —
  // not enough horizontal space and search covers the filtering need).
  const flat = useMemo(() => {
    const out: Module[] = [];
    for (const cat of CATEGORY_ORDER) for (const m of grouped[cat]) out.push(m);
    return out;
  }, [grouped]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      {/* DESKTOP: vertical grouped list with header + search */}
      <header className="hidden px-3 pb-2 pt-3 md:block">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Modules
          </h2>
          <span className="font-mono text-[11px] text-stone-400">
            {totalShown}
          </span>
        </div>
      </header>
      <div className="hidden px-2 pb-2 md:block">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Search modules"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-md border border-stone-200 bg-stone-50 py-1.5 pl-7 pr-2 text-xs text-stone-800 placeholder:text-stone-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
      <div className="hidden flex-1 overflow-y-auto px-2 pb-3 md:block">
        {CATEGORY_ORDER.map((cat) => {
          const list = grouped[cat];
          if (list.length === 0) return null;
          return (
            <div key={cat} className="mb-3">
              <h3 className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="flex flex-col gap-1">
                {list.map((m) => (
                  <DraggableModuleCard
                    key={m.id}
                    module={m}
                    onAdd={() => add(m.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {totalShown === 0 && (
          <div className="mt-6 rounded-md border border-dashed border-stone-200 bg-stone-50 p-3 text-center text-xs text-stone-500">
            No modules match &ldquo;{filter}&rdquo;
          </div>
        )}
      </div>

      {/* MOBILE: horizontal scrollable pill bar. Tap to add (no drag — touch
           drag-drop is unreliable on phones and gets fighty with scroll). */}
      <div className="flex min-w-0 flex-1 items-stretch gap-2 overflow-x-auto px-3 py-2 md:hidden">
        {flat.length === 0 ? (
          <div className="flex items-center justify-center px-3 text-xs text-stone-500">
            No modules
          </div>
        ) : (
          flat.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => add(m.id)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition active:scale-[0.97] active:bg-stone-100"
            >
              <Plus size={12} className="text-stone-400" />
              {m.label}
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function DraggableModuleCard({
  module,
  onAdd,
}: {
  module: Module;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${module.id}`,
    data: { source: "palette", moduleId: module.id },
  });

  const [hovered, setHovered] = useState(false);
  const [html, setHtml] = useState<string>("");
  const enterTimer = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [popoverTop, setPopoverTop] = useState(0);

  function handleEnter() {
    if (enterTimer.current) window.clearTimeout(enterTimer.current);
    // 200ms intent delay so the preview doesn't flicker as the cursor
    // skims down the list.
    enterTimer.current = window.setTimeout(async () => {
      // Anchor popover to the card's top edge so it never floats off-screen.
      const r = cardRef.current?.getBoundingClientRect();
      if (r) setPopoverTop(r.top);
      setHovered(true);
      const cached = previewCache.get(module.id);
      if (cached) {
        setHtml(cached);
      } else {
        const fetched = await fetchPreview(module.id);
        setHtml(fetched);
      }
    }, 200);
  }
  function handleLeave() {
    if (enterTimer.current) {
      window.clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    setHovered(false);
  }

  useEffect(() => {
    return () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
    };
  }, []);

  return (
    <>
      <div
        ref={(el) => {
          setNodeRef(el);
          cardRef.current = el;
        }}
        {...listeners}
        {...attributes}
        onDoubleClick={onAdd}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={cn(
          "group relative flex cursor-grab items-center gap-2 rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs transition",
          "hover:-translate-y-px hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm active:cursor-grabbing",
          isDragging && "opacity-40"
        )}
        title="Drag to canvas, or double-click to append"
      >
        <span className="truncate font-medium text-stone-800">{module.label}</span>
        <button
          type="button"
          aria-label="Add module"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-stone-400 opacity-0 transition hover:bg-blue-50 hover:text-blue-700 group-hover:opacity-100"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Hover preview popover — hidden on touch devices via the hover:
            media-query gate (CSS) AND on mobile via md: layout differences */}
      {hovered && !isDragging && (
        <div
          className="pointer-events-none fixed left-[268px] z-50 hidden w-[360px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-2xl md:block"
          style={{ top: Math.max(16, Math.min(popoverTop, window.innerHeight - 480)) }}
        >
          <div className="border-b border-stone-200 bg-stone-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
              {module.category}
            </p>
            <p className="truncate text-xs font-semibold text-stone-900">
              {module.label}
            </p>
          </div>
          <div className="relative h-[420px] w-full overflow-hidden bg-white">
            {html ? (
              <iframe
                title={`${module.label} preview`}
                srcDoc={html}
                className="absolute left-0 top-0 origin-top-left border-0"
                style={{
                  width: "640px",
                  height: "1080px",
                  transform: "scale(0.5625)", // 360 / 640
                }}
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                Loading preview…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
