"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Align } from "@/lib/modules/types";

type Props = {
  label: string;
  value: Align;
  onChange: (v: Align) => void;
};

const OPTIONS: { value: Align; icon: typeof AlignLeft }[] = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
];

export function AlignField({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-stone-600">{label}</span>
      <div className="inline-flex overflow-hidden rounded-md border border-stone-200 bg-stone-50 p-0.5">
        {OPTIONS.map(({ value: v, icon: Icon }) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            className={cn(
              "flex flex-1 items-center justify-center rounded px-2 py-1 transition",
              value === v
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            )}
            onClick={() => onChange(v)}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
