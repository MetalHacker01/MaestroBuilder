"use client";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
};

export function SelectField({ label, value, onChange, options }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-stone-600">{label}</span>
      <select
        className="rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
