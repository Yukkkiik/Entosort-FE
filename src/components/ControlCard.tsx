"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ControlCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isManualMode: boolean;
  onToggle: (id: string, value: boolean) => void;
  accentColor?: string;
  animationDelay?: number;
}

// ─── Inner Toggle ─────────────────────────────────────────────────────────────

function MiniToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`
        relative w-11 h-6 rounded-full flex-shrink-0
        transition-all duration-300 ease-out outline-none
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lime-400
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${checked
          ? "bg-gradient-to-r from-[#a3e635] to-[#65a30d] shadow-[0_0_10px_rgba(163,230,53,0.45)]"
          : "bg-gray-200"
        }
      `}
    >
      <span
        className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-white
          shadow-[0_1px_4px_rgba(0,0,0,0.15)]
          transition-all duration-300 ease-out
          ${checked ? "left-[calc(100%-1.375rem)]" : "left-0.5"}
        `}
      />
    </button>
  );
}

// ─── ControlCard ──────────────────────────────────────────────────────────────

export default function ControlCard({
  id,
  title,
  description,
  icon,
  isActive,
  isManualMode,
  onToggle,
  animationDelay = 0,
}: ControlCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    if (showFeedback) {
      const t = setTimeout(() => setShowFeedback(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showFeedback]);

  const handleToggle = () => {
    if (!isManualMode) return;
    const next = !isActive;
    onToggle(id, next);
    setFeedbackMsg(next ? "Command sent — component ON" : "Command sent — component OFF");
    setShowFeedback(true);
  };

  return (
    <div
      className={`
        group relative rounded-3xl p-5 overflow-hidden
        border transition-all duration-400 ease-out
        hover:-translate-y-1.5
        opacity-0 animate-[fadeSlideUp_0.5s_ease_forwards]
        ${
          isActive
            ? "bg-white border-lime-200/70 shadow-[0_4px_32px_rgba(163,230,53,0.14)] hover:shadow-[0_8px_40px_rgba(163,230,53,0.22)]"
            : "bg-white border-gray-100/80 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.09)]"
        }
        ${!isManualMode ? "opacity-60 pointer-events-none" : ""}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Active glow top strip */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#a3e635] to-transparent" />
      )}

      {/* Corner blob */}
      <div
        className={`
          absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl
          transition-all duration-500
          ${isActive ? "bg-lime-200/40 opacity-100" : "bg-gray-100/60 opacity-0 group-hover:opacity-60"}
        `}
      />

      <div className="relative flex flex-col gap-4">
        {/* Top row: icon + toggle */}
        <div className="flex items-start justify-between">
          {/* Icon */}
          <div
            className={`
              w-12 h-12 rounded-2xl flex items-center justify-center
              transition-all duration-300 group-hover:scale-110
              ${
                isActive
                  ? "bg-gradient-to-br from-[#a3e635] to-[#65a30d] text-white shadow-md shadow-lime-300/40"
                  : "bg-gray-100 text-gray-400"
              }
            `}
          >
            {icon}
          </div>

          {/* Toggle */}
          <MiniToggle
            checked={isActive}
            onChange={handleToggle}
            disabled={!isManualMode}
          />
        </div>

        {/* Labels */}
        <div>
          <h3
            className="text-sm font-extrabold text-gray-900 leading-tight"
            style={{ fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif" }}
          >
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-400 leading-relaxed">{description}</p>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isActive ? (
              <CheckCircle2 size={13} strokeWidth={2.5} className="text-[#65a30d]" />
            ) : (
              <XCircle size={13} strokeWidth={2.5} className="text-gray-300" />
            )}
            <span
              className={`text-xs font-bold transition-colors duration-300 ${
                isActive ? "text-[#4d7c0f]" : "text-gray-400"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Live dot */}
          <span className="relative flex w-2.5 h-2.5">
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-lime-400 animate-ping opacity-60" />
            )}
            <span
              className={`relative w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                isActive ? "bg-[#a3e635]" : "bg-gray-200"
              }`}
            />
          </span>
        </div>

        {/* Command feedback */}
        <div
          className={`
            flex items-center gap-1.5 text-[10px] font-semibold
            transition-all duration-300 ease-out
            ${showFeedback ? "opacity-100 max-h-5" : "opacity-0 max-h-0 overflow-hidden"}
            ${isActive ? "text-[#4d7c0f]" : "text-gray-400"}
          `}
        >
          <CheckCircle2 size={10} strokeWidth={2.5} />
          {feedbackMsg}
        </div>
      </div>
    </div>
  );
}