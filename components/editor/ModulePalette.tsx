"use client";

import { useDraggable } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { MODULES } from "@/lib/modules/registry";
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

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="px-3 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Modules
          </h2>
          <span className="font-mono text-[11px] text-stone-400">
            {totalShown}
          </span>
        </div>
      </header>
      <div className="px-2 pb-2">
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
      <div className="flex-1 overflow-y-auto px-2 pb-3">
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={onAdd}
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
  );
}
