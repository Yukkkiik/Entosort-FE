"use client";

import { Activity, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComponentStatus {
  id: string;
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
  detail?: string;
}

export interface StatusSummaryProps {
  components: ComponentStatus[];
  lastUpdated?: string;
  animationDelay?: number;
}

// ─── StatusRow ────────────────────────────────────────────────────────────────

function StatusRow({ comp }: { comp: ComponentStatus }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50/80 last:border-0 group hover:bg-gray-50/60 -mx-2 px-2 rounded-2xl transition-colors duration-150 cursor-default">
      {/* Icon */}
      <div className={`
        w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        transition-all duration-300 group-hover:scale-105
        ${comp.isActive ? "bg-lime-50 text-[#65a30d]" : "bg-gray-100 text-gray-300"}
      `}>
        {comp.icon}
      </div>

      {/* Label + detail */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-700 leading-tight">{comp.label}</p>
        {comp.detail && (
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            {comp.isActive ? comp.detail : "Standby"}
          </p>
        )}
      </div>

      {/* Status indicator + badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {comp.isActive
          ? <CheckCircle2 size={13} strokeWidth={2.5} className="text-[#65a30d]" />
          : <XCircle size={13} strokeWidth={2.5} className="text-gray-300" />
        }
        <span
          className={`
            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
            text-[10px] font-bold uppercase tracking-wider border
            transition-all duration-300
            ${comp.isActive
              ? "bg-lime-100 text-[#4d7c0f] border-lime-200/60"
              : "bg-gray-100 text-gray-400 border-gray-200/60"
            }
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${comp.isActive ? "bg-[#a3e635]" : "bg-gray-300"}`} />
          {comp.isActive ? "ON" : "OFF"}
        </span>
      </div>
    </div>
  );
}

// ─── StatusSummary ────────────────────────────────────────────────────────────

export default function StatusSummary({
  components,
  lastUpdated,
  animationDelay = 0,
}: StatusSummaryProps) {
  const activeCount = components.filter((c) => c.isActive).length;
  const total = components.length;
  const healthPct = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  return (
    <div
      className="
        relative rounded-3xl overflow-hidden
        bg-white border border-gray-100/80
        shadow-[0_2px_20px_rgba(0,0,0,0.05)]
        p-6
        opacity-0 animate-[fadeSlideUp_0.55s_ease_forwards]
      "
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Decorative background blob */}
      <div className="pointer-events-none absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-lime-50/50 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-lime-50 border border-lime-100 flex items-center justify-center">
            <Activity size={16} strokeWidth={2} className="text-[#65a30d]" />
          </div>
          <div>
            <h2
              className="text-sm font-extrabold text-gray-900 leading-tight"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              Status Summary
            </h2>
            <p className="text-[10px] text-gray-400 font-medium">All machine components</p>
          </div>
        </div>

        {/* Active count */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-50 border border-lime-100/80">
          <TrendingUp size={11} className="text-[#65a30d]" strokeWidth={2.5} />
          <span className="text-xs font-bold text-[#4d7c0f]">{activeCount}/{total} Active</span>
        </div>
      </div>

      {/* Component list */}
      <div className="relative">
        {components.map((comp) => (
          <StatusRow key={comp.id} comp={comp} />
        ))}
      </div>

      {/* System health bar */}
      <div className="relative mt-5 pt-5 border-t border-gray-50">
        <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-2">
          <span>Overall System Health</span>
          <span className={`font-bold ${healthPct >= 75 ? "text-[#65a30d]" : healthPct >= 50 ? "text-amber-500" : "text-rose-500"}`}>
            {healthPct}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              healthPct >= 75
                ? "bg-gradient-to-r from-lime-300 to-[#a3e635]"
                : healthPct >= 50
                ? "bg-gradient-to-r from-amber-300 to-amber-400"
                : "bg-gradient-to-r from-rose-300 to-rose-400"
            }`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <div className="relative mt-3 flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
          <Clock size={10} strokeWidth={2} />
          Last updated: {lastUpdated}
        </div>
      )}
    </div>
  );
}