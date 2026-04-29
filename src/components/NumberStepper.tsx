"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit: string;
  description?: string;
  onChange: (value: number) => void;
  accent?: "green" | "blue" | "amber" | "red";
  className?: string;
}

const accentMap = {
  green: {
    label: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-100",
    valueColor: "text-green-800",
    btnActive: "hover:bg-green-100 text-green-600 active:bg-green-200",
  },
  blue: {
    label: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    valueColor: "text-blue-800",
    btnActive: "hover:bg-blue-100 text-blue-600 active:bg-blue-200",
  },
  amber: {
    label: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    valueColor: "text-amber-800",
    btnActive: "hover:bg-amber-100 text-amber-600 active:bg-amber-200",
  },
  red: {
    label: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-100",
    valueColor: "text-red-800",
    btnActive: "hover:bg-red-100 text-red-600 active:bg-red-200",
  },
};

export default function NumberStepper({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit,
  description,
  onChange,
  accent = "green",
  className,
}: NumberStepperProps) {
  const config = accentMap[accent];

  const increment = () => {
    if (value + step <= max) onChange(Math.round((value + step) * 100) / 100);
  };

  const decrement = () => {
    if (value - step >= min) onChange(Math.round((value - step) * 100) / 100);
  };

  const isAtMax = value >= max;
  const isAtMin = value <= min;

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border transition-all duration-200",
        config.bg,
        config.border,
        "hover:shadow-soft",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-4">
          <p className={cn("text-sm font-semibold font-body mb-0.5", config.label)}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Decrement */}
          <button
            onClick={decrement}
            disabled={isAtMin}
            aria-label={`Decrease ${label}`}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center",
              "transition-all duration-150 active:scale-90",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
              "bg-white shadow-soft-sm border border-white/80",
              config.btnActive
            )}
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>

          {/* Value display */}
          <div className="text-center min-w-[72px]">
            <span
              className={cn(
                "text-2xl font-display font-bold tracking-tight tabular-nums",
                config.valueColor
              )}
            >
              {value}
            </span>
            <span className="text-sm font-medium text-slate-500 ml-1">{unit}</span>
          </div>

          {/* Increment */}
          <button
            onClick={increment}
            disabled={isAtMax}
            aria-label={`Increase ${label}`}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center",
              "transition-all duration-150 active:scale-90",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
              "bg-white shadow-soft-sm border border-white/80",
              config.btnActive
            )}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400 font-mono">{min}{unit}</span>
          <span className="text-[10px] text-slate-400 font-mono">{max}{unit}</span>
        </div>
      </div>
    </div>
  );
}