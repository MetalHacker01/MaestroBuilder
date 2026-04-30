"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

export function ColorField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-stone-600">{label}</span>
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          aria-label="Open color picker"
          className="h-7 w-7 shrink-0 rounded border border-stone-300 shadow-inner transition hover:scale-105"
          style={{ backgroundColor: value }}
          onClick={() => setOpen((o) => !o)}
        />
        <input
          type="text"
          className="flex-1 rounded-md border border-stone-200 bg-white px-2 py-1.5 font-mono text-[11px] uppercase tracking-wide text-stone-800 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-9 z-20 rounded-lg border border-stone-200 bg-white p-2 shadow-lg">
              <HexColorPicker color={value} onChange={onChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
