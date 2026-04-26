"use client";

import { useEffect, useState } from "react";
import { Bot, Hand, Zap, ShieldCheck, ShieldAlert } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ManualModeToggleProps {
  isManual: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  animationDelay?: number;
}

// ─── Toggle Switch sub-component ─────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`
        relative flex-shrink-0 w-14 h-7 rounded-full
        transition-all duration-400 ease-out outline-none
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lime-400
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${checked
          ? "bg-gradient-to-r from-[#a3e635] to-[#65a30d] shadow-[0_0_14px_rgba(163,230,53,0.55)]"
          : "bg-gray-200 hover:bg-gray-300"
        }
      `}
    >
      {/* Thumb */}
      <span
        className={`
          absolute top-0.5 w-6 h-6 rounded-full bg-white
          shadow-[0_2px_6px_rgba(0,0,0,0.18)]
          transition-all duration-300 ease-out
          flex items-center justify-center
          ${checked ? "left-[calc(100%-1.625rem)]" : "left-0.5"}
        `}
      >
        {checked
          ? <Hand size={11} className="text-[#65a30d]" strokeWidth={2.5} />
          : <Bot size={11} className="text-gray-400" strokeWidth={2.5} />
        }
      </span>
    </button>
  );
}

// ─── ManualModeToggle ─────────────────────────────────────────────────────────

export default function ManualModeToggle({
  isManual,
  onChange,
  disabled = false,
  animationDelay = 0,
}: ManualModeToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!showConfirm) return;
    const t = setTimeout(() => setShowConfirm(false), 2500);
    return () => clearTimeout(t);
  }, [showConfirm]);

  const handleToggle = () => {
    if (disabled) return;
    onChange(!isManual);
    setShowConfirm(true);
  };

  return (
    <div
      className={`
        relative rounded-3xl overflow-hidden border
        transition-all duration-500 ease-out
        opacity-0 animate-[fadeSlideUp_0.55s_ease_forwards]
        ${isManual
          ? "bg-gradient-to-br from-lime-50 via-white to-emerald-50/20 border-lime-200/60 shadow-[0_4px_32px_rgba(163,230,53,0.14)]"
          : "bg-white border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
        }
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Active top highlight strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-500 bg-gradient-to-r from-transparent via-[#a3e635] to-transparent ${isManual ? "opacity-100" : "opacity-0"}`}
      />

      <div className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

          {/* Left: icon + text */}
          <div className="flex items-start gap-4">
            {/* Mode icon */}
            <div
              className={`
                relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                transition-all duration-500
                ${isManual
                  ? "bg-gradient-to-br from-[#a3e635] to-[#65a30d] shadow-lg shadow-lime-300/40"
                  : "bg-gray-100"
                }
              `}
            >
              {isManual
                ? <Hand size={22} className="text-white" strokeWidth={2} />
                : <Bot size={22} className="text-gray-400" strokeWidth={2} />
              }
              {isManual && (
                <span className="absolute -inset-1 rounded-[18px] border-2 border-lime-300/40 animate-ping" />
              )}
            </div>

            {/* Text block */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2
                  className="text-base font-extrabold text-gray-900"
                  style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
                >
                  Automatic / Manual Mode
                </h2>

                {/* Mode pill */}
                <span
                  className={`
                    inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                    text-[10px] font-bold uppercase tracking-wider border
                    transition-all duration-300
                    ${isManual
                      ? "bg-lime-100 text-[#4d7c0f] border-lime-200/60"
                      : "bg-gray-100 text-gray-500 border-gray-200/60"
                    }
                  `}
                >
                  {isManual
                    ? <><Zap size={9} strokeWidth={3} /> Manual Active</>
                    : <><Bot size={9} strokeWidth={3} /> Auto Active</>
                  }
                </span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                {isManual
                  ? "Manual mode active — full control over all physical components is available."
                  : "Automatic mode active — the AI system handles all sorting decisions and control."}
              </p>

              {/* Confirmation flash */}
              <div
                className={`
                  mt-2 flex items-center gap-1.5 text-[11px] font-semibold
                  transition-all duration-300
                  ${showConfirm ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}
                  ${isManual ? "text-[#4d7c0f]" : "text-gray-400"}
                `}
              >
                <ShieldCheck size={12} strokeWidth={2.5} />
                {isManual ? "Switched to Manual — full control enabled." : "Returned to Automatic mode."}
              </div>
            </div>
          </div>

          {/* Right: toggle + warning */}
          <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold transition-colors ${isManual ? "text-gray-400" : "text-gray-800"}`}>Auto</span>
              <ToggleSwitch checked={isManual} onChange={handleToggle} disabled={disabled} />
              <span className={`text-xs font-bold transition-colors ${isManual ? "text-[#4d7c0f]" : "text-gray-400"}`}>Manual</span>
            </div>

            <div className={`flex items-center gap-1.5 text-[10px] font-semibold transition-all duration-300 ${isManual ? "text-amber-500" : "text-gray-300"}`}>
              <ShieldAlert size={11} strokeWidth={2.5} />
              Use with caution — physical control active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}