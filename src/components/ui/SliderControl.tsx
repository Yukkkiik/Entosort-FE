"use client";

import { cn } from "@/lib/utils";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
  colorHint?: string;
  className?: string;
}

export default function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
  unit = "",
  colorHint,
  className,
}: SliderControlProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("group", className)}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide font-body">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          {colorHint && (
            <div
              className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: colorHint }}
            />
          )}
          <span className="text-sm font-semibold text-slate-800 font-mono min-w-[3ch] text-right tabular-nums">
            {value}
            <span className="text-slate-400 text-xs font-normal ml-0.5">{unit}</span>
          </span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #16a34a 0%, #16a34a ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-400 font-mono">{min}</span>
        <span className="text-[10px] text-slate-400 font-mono">{max}</span>
      </div>
    </div>
  );
}