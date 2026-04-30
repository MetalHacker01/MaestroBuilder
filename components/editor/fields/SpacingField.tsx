"use client";

import { useState } from "react";
import type { Spacing } from "@/lib/modules/types";

type Props = {
  label: string;
  value: Spacing;
  onChange: (v: Spacing) => void;
};

export function SpacingField({ label, value, onChange }: Props) {
  const [linked, setLinked] = useState(
    value.t === value.r && value.r === value.b && value.b === value.l
  );

  const setAll = (v: number) => onChange({ t: v, r: v, b: v, l: v });
  const setOne = (k: keyof Spacing, v: number) => onChange({ ...value, [k]: v });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-stone-600">{label}</span>
        <button
          type="button"
          className="text-[11px] font-medium text-blue-700 transition hover:text-blue-900"
          onClick={() => {
            const next = !linked;
            setLinked(next);
            if (next) setAll(value.t);
          }}
        >
          {linked ? "Per side" : "Linked"}
        </button>
      </div>
      {linked ? (
        <input
          type="number"
          min={0}
          max={120}
          className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs tabular-nums text-stone-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={value.t}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) setAll(v);
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {(["t", "r", "b", "l"] as (keyof Spacing)[]).map((k) => (
            <label key={k} className="flex items-center gap-1.5">
              <span className="w-3 text-center font-mono text-[10px] uppercase text-stone-400">
                {k}
              </span>
              <input
                type="number"
                min={0}
                max={120}
                className="w-full rounded-md border border-stone-200 bg-white px-1.5 py-1 text-xs tabular-nums text-stone-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={value[k]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v)) setOne(k, v);
                }}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
