"use client";

import { useMemo } from "react";
import { Settings2, Trash2 } from "lucide-react";
import { useEditor } from "@/lib/state/store";
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

  const instance = useMemo(
    () => instances.find((i) => i.uid === selectedUid) ?? null,
    [instances, selectedUid]
  );
  const module = instance ? getModule(instance.moduleId) : null;

  if (!instance || !module) {
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-stone-200 bg-white">
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
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-stone-200 bg-white">
      <header className="border-b border-stone-200 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
          {module.category}
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <h2 className="truncate text-sm font-semibold text-stone-900">
            {module.label}
          </h2>
          <button
            type="button"
            title="Remove module"
            onClick={() => remove(instance.uid)}
            className="rounded p-1 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
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
