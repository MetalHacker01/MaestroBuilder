"use client";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export function NumberField({ label, value, onChange, min, max, step, unit }: Props) {
  const lo = min ?? 0;
  const hi = max ?? 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-stone-600">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-stone-500">
          {value}
          {unit ?? ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="flex-1"
          min={lo}
          max={hi}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          type="number"
          className="w-14 rounded-md border border-stone-200 bg-white px-1.5 py-1 text-xs tabular-nums text-stone-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          min={lo}
          max={hi}
          step={step ?? 1}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
        />
      </div>
    </div>
  );
}
