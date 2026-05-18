"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { Copy, GripVertical, Layers, Trash2 } from "lucide-react";
import { useEditor } from "@/lib/state/store";
import { getModule } from "@/lib/modules/registry";
import type { ModuleInstance } from "@/lib/modules/types";
import { cn } from "@/lib/utils";

export function Outline() {
  const instances = useEditor((s) => s.instances);
  const selectedUid = useEditor((s) => s.selectedUid);
  const select = useEditor((s) => s.select);
  const remove = useEditor((s) => s.remove);
  const duplicate = useEditor((s) => s.duplicate);

  const dropZone = useDroppable({ id: "outline-drop-area" });
  const ids = instances.map((i) => i.uid);

  return (
    <section
      ref={dropZone.setNodeRef}
      className={cn(
        "flex min-h-0 flex-1 flex-col border-t border-stone-200 bg-stone-50/60 transition",
        dropZone.isOver && "bg-blue-50"
      )}
    >
      <header className="px-3 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            <Layers size={11} />
            Layout
          </div>
          <span className="font-mono text-[11px] text-stone-400">
            {instances.length}
          </span>
        </div>
        {instances.length > 0 && (
          <p className="mt-1 flex items-center gap-1 text-[10.5px] leading-snug text-stone-400">
            Drag
            <GripVertical
              size={10}
              className="inline-block text-stone-400"
              aria-hidden
            />
            to reorder
            <span className="text-stone-300">·</span>
            click to select
          </p>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {instances.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-stone-300 bg-white px-3 py-4 text-center text-xs text-stone-500">
            Click a module on the left to add it,
            <br />
            or drag the
            <GripVertical
              size={10}
              className="mx-1 inline-block align-text-bottom text-stone-400"
              aria-hidden
            />
            handle into this list
          </div>
        ) : (
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-1">
              {instances.map((inst, idx) => (
                <OutlineCard
                  key={inst.uid}
                  index={idx}
                  instance={inst}
                  selected={inst.uid === selectedUid}
                  onSelect={() => select(inst.uid)}
                  onDuplicate={() => duplicate(inst.uid)}
                  onRemove={() => remove(inst.uid)}
                />
              ))}
            </ol>
          </SortableContext>
        )}
      </div>
    </section>
  );
}

function OutlineCard({
  index,
  instance,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
}: {
  index: number;
  instance: ModuleInstance;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const m = getModule(instance.moduleId);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instance.uid,
    data: { source: "canvas", uid: instance.uid },
  });

  if (!m) return null;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative flex cursor-pointer items-stretch gap-1.5 rounded-md border bg-white px-1.5 py-1.5 text-xs transition",
        selected
          ? "border-blue-500 ring-1 ring-blue-500/30 shadow-sm"
          : "border-stone-200 hover:border-stone-300 hover:shadow-sm",
        isDragging && "opacity-40"
      )}
    >
      <button
        type="button"
        aria-label={`Drag ${m.label} to reorder`}
        title="Drag to reorder this module in the layout"
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        className="flex w-4 cursor-grab items-center justify-center text-stone-400 hover:text-stone-700 active:cursor-grabbing"
      >
        <GripVertical size={12} />
      </button>
      <span className="flex w-5 shrink-0 items-center justify-center font-mono text-[10px] text-stone-400">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-medium text-stone-900">
          {m.label}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-stone-400">
          {m.category}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          title="Duplicate"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <Copy size={11} />
        </button>
        <button
          type="button"
          title="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded p-1 text-stone-500 hover:bg-red-100 hover:text-red-700"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </li>
  );
}
