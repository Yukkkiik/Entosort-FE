"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  trendLabel?: string;
  accent?: "green" | "blue" | "violet" | "amber";
  className?: string;
}

const accentConfig = {
  green: {
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    trendUpColor: "text-green-600",
    badge: "bg-green-50 text-green-700",
    glow: "shadow-[0_0_0_1px_rgba(22,163,74,0.1)]",
  },
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    trendUpColor: "text-blue-600",
    badge: "bg-blue-50 text-blue-700",
    glow: "shadow-[0_0_0_1px_rgba(37,99,235,0.1)]",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    trendUpColor: "text-violet-600",
    badge: "bg-violet-50 text-violet-700",
    glow: "shadow-[0_0_0_1px_rgba(124,58,237,0.1)]",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    trendUpColor: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
    glow: "shadow-[0_0_0_1px_rgba(217,119,6,0.1)]",
  },
};

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  trendLabel,
  accent = "green",
  className,
}: StatsCardProps) {
  const config = accentConfig[accent];

  const TrendIcon =
    trend === "up"
      ? TrendingUp
      : trend === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-500"
        : "text-slate-400";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 shadow-soft border border-slate-100",
        "transition-all duration-200 hover:shadow-soft-md hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            config.iconBg
          )}
        >
          <span className={cn("w-5 h-5 flex items-center justify-center", config.iconColor)}>
            {icon}
          </span>
        </div>

        {/* Trend badge */}
        {trend && trendValue && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
              config.badge
            )}
          >
            <TrendIcon size={11} />
            {trendValue}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-3xl font-display font-bold text-slate-900 tracking-tight">
          {value}
        </span>
      </div>

      {/* Label */}
      <p className="text-sm text-slate-500 font-body">
        {label}
      </p>

      {/* Trend label */}
      {trendLabel && (
        <p className={cn("text-xs mt-1 font-medium", trendColor)}>
          {trendLabel}
        </p>
      )}
    </div>
  );
}