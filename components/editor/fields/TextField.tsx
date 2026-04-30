"use client";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function TextField({ label, value, onChange, placeholder }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-stone-600">{label}</span>
      <input
        type="text"
        className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
