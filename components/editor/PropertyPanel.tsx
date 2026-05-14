"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings2, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useEditor } from "@/lib/state/store";
import { cn } from "@/lib/utils";
import { getModule } from "@/lib/modules/registry";
import type { FieldSchema, Spacing } from "@/lib/modules/types";
import { TextField } from "./fields/TextField";
import { UrlField } from "./fields/UrlField";
import { NumberField } from "./fields/NumberField";
import { ColorField } from "./fields/ColorField";
import { AlignField } from "./fields/AlignField";
import { SpacingField } from "./fields/SpacingField";
import { SelectField } from "./fields/SelectField";
import { RichTextField } from "./fields/RichTextField";

export function PropertyPanel() {
  const selectedUid = useEditor((s) => s.selectedUid);
  const instances = useEditor((s) => s.instances);
  const updateProp = useEditor((s) => s.updateProp);
  const remove = useEditor((s) => s.remove);
  const select = useEditor((s) => s.select);
  // Mobile-only collapsed state. When collapsed the drawer shrinks to a
  // header-only strip so the canvas behind it is fully visible. Tap the
  // header (or the expand button) to expand back. Desktop ignores this.
  const [mobileCollapsed, setMobileCollapsed] = useState(false);

  // Auto-expand the panel when the user selects a different module so they
  // see the fields immediately (don't keep the previous module's collapsed
  // state). Re-collapsing is their explicit action via the chevron/header.
  useEffect(() => {
    if (selectedUid) setMobileCollapsed(false);
  }, [selectedUid]);

  const instance = useMemo(
    () => instances.find((i) => i.uid === selectedUid) ?? null,
    [instances, selectedUid]
  );
  const module = instance ? getModule(instance.moduleId) : null;

  if (!instance || !module) {
    // Empty state — hidden entirely on mobile so the canvas gets the full
    // viewport. On desktop it stays visible as a "Nothing selected" hint.
    return (
      <aside className="hidden h-full w-[320px] shrink-0 flex-col border-l border-stone-200 bg-white md:flex">
        <header className="border-b border-stone-200 px-4 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Properties
          </h2>
        </header>
        <div className="flex flex-1 items-center justify-center px-8">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <Settings2 size={16} />
            </div>
            <p className="text-sm font-medium text-stone-700">
              Nothing selected
            </p>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Click a module in the canvas or in the layout list to edit its
              properties here.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const grouped: Record<string, [string, FieldSchema][]> = {};
  for (const [key, schema] of Object.entries(module.schema)) {
    const g = schema.group ?? "General";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push([key, schema]);
  }

  return (
    // Mobile bottom drawer with THREE states:
    //   - Collapsed (default after tapping a module): header strip only,
    //     canvas mostly visible. Tap header to expand.
    //   - Expanded: 50vh — half the viewport for editing, half for canvas
    //     visibility (was 70vh which felt suffocating).
    //   - Closed: tap X → select(null) → empty state returns null on
    //     mobile so the drawer disappears entirely.
    // Safe-area-inset-bottom keeps controls clear of the iPhone home bar.
    <aside
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex w-full shrink-0 flex-col rounded-t-2xl border-t border-stone-200 bg-white shadow-[0_-12px_32px_-8px_rgba(0,0,0,0.15)] transition-[max-height] duration-200 ease-out md:static md:inset-auto md:z-auto md:h-full md:max-h-none md:w-[320px] md:rounded-none md:border-l md:border-t-0 md:shadow-none",
        mobileCollapsed ? "max-h-[64px]" : "max-h-[50vh]",
        "md:max-h-none"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Tap-target header: clicking the header toggles collapsed/expanded
          on mobile. The grab handle on top is the visual affordance. */}
      <button
        type="button"
        onClick={() => setMobileCollapsed((v) => !v)}
        aria-expanded={!mobileCollapsed}
        aria-label={mobileCollapsed ? "Expand properties" : "Collapse properties"}
        className="flex w-full flex-col items-stretch border-b border-stone-200 text-left md:cursor-default md:pointer-events-none md:border-b"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-stone-300 md:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
              {module.category}
            </p>
            <h2 className="mt-0.5 truncate text-sm font-semibold text-stone-900">
              {module.label}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setMobileCollapsed((v) => !v);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition active:bg-stone-100 md:hidden"
              role="button"
              aria-label={mobileCollapsed ? "Expand" : "Collapse"}
            >
              {mobileCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                remove(instance.uid);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition active:bg-red-50 active:text-red-600 hover:bg-red-50 hover:text-red-600 md:h-7 md:w-7"
              role="button"
              aria-label="Remove module"
              title="Remove module"
            >
              <Trash2 size={14} />
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                select(null);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition active:bg-stone-100 md:hidden"
              role="button"
              aria-label="Close properties panel"
              title="Close"
            >
              <X size={16} />
            </span>
          </div>
        </div>
      </button>
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          mobileCollapsed && "hidden md:block"
        )}
      >
        {Object.entries(grouped).map(([group, fields]) => (
          <div key={group} className="border-b border-stone-100 px-4 py-3 last:border-0">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
              {group}
            </h3>
            <div className="flex flex-col gap-3">
              {fields.map(([key, schema]) => (
                <FieldRenderer
                  key={key}
                  schema={schema}
                  value={instance.props[key]}
                  onChange={(v) => updateProp(instance.uid, key, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function FieldRenderer({
  schema,
  value,
  onChange,
}: {
  schema: FieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (schema.type) {
    case "text":
      return (
        <TextField
          label={schema.label}
          value={(value as string) ?? schema.default}
          onChange={onChange}
          placeholder={schema.placeholder}
        />
      );
    case "url":
    case "image-url":
      return (
        <UrlField
          label={schema.label}
          value={(value as string) ?? schema.default}
          onChange={onChange}
          placeholder={schema.placeholder}
        />
      );
    case "richtext":
      return (
        <RichTextField
          label={schema.label}
          value={(value as string) ?? schema.default}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <NumberField
          label={schema.label}
          value={(value as number) ?? schema.default}
          onChange={onChange}
          min={schema.min}
          max={schema.max}
          step={schema.step}
          unit={schema.unit}
        />
      );
    case "color":
      return (
        <ColorField
          label={schema.label}
          value={(value as string) ?? schema.default}
          onChange={onChange}
        />
      );
    case "align":
      return (
        <AlignField
          label={schema.label}
          value={(value as "left" | "center" | "right") ?? schema.default}
          onChange={onChange}
        />
      );
    case "spacing":
      return (
        <SpacingField
          label={schema.label}
          value={(value as Spacing) ?? schema.default}
          onChange={onChange}
        />
      );
    case "select":
      return (
        <SelectField
          label={schema.label}
          value={(value as string) ?? schema.default}
          onChange={onChange}
          options={schema.options}
        />
      );
  }
}
