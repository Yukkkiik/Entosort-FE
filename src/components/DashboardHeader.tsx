"use client";

import { useEffect, useState } from "react";
import { Wifi, RefreshCw, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  status?: "online" | "offline" | "syncing";
  onRefresh?: () => void;
}

// ─── DashboardHeader ──────────────────────────────────────────────────────────

export default function DashboardHeader({
  title,
  subtitle,
  breadcrumbs = [],
  status = "online",
  onRefresh,
}: DashboardHeaderProps) {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {

    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1000);
    onRefresh?.();
  };

  const statusConfig = {
    online: {
      dot: "bg-[#a3e635] shadow-[0_0_6px_rgba(163,230,53,0.7)]",
      text: "text-[#65a30d]",
      bg: "bg-lime-50",
      border: "border-lime-100",
      label: "All Systems Online",
    },
    offline: {
      dot: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]",
      text: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
      label: "Disconnected",
    },
    syncing: {
      dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]",
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      label: "Syncing...",
    },
  };

  const s = statusConfig[status];

  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      {/* Left: title block */}
      <div
        className="opacity-0 animate-[fadeSlideUp_0.5s_ease_0.05s_forwards]"
        style={{ ["--tw-animate-duration" as string]: "0.5s" }}
      >
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-2">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
                <span
                  className={`text-xs font-medium ${
                    i === breadcrumbs.length - 1
                      ? "text-gray-400"
                      : "text-gray-300 hover:text-gray-500 cursor-pointer"
                  }`}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1
          className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight"
          style={{ fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif" }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-400 font-medium">{subtitle}</p>
        )}

        {/* Status badge */}
        <div
          className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${s.bg} ${s.border}`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${s.dot}`} />
          <Wifi size={11} className={s.text} strokeWidth={2.5} />
          <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
        </div>
      </div>

      {/* Right: clock + refresh */}
         <div
            className="flex items-center gap-3 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.15s_forwards]"
         >
                {/* Live clock */}
                <div className="text-right">
          <div
            className="text-xl font-black text-gray-800 tabular-nums tracking-tight"
            style={{ fontFamily: "'Sora', monospace" }}
          >
            {time || "--:--:--"}
          </div>
          <div className="text-xs text-gray-400 font-medium">
            {date || "Loading date"}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-gray-100" />

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="
            w-10 h-10 rounded-2xl bg-white border border-gray-100
            flex items-center justify-center
            text-gray-400 hover:text-[#65a30d] hover:border-lime-200
            hover:bg-lime-50 hover:shadow-md hover:shadow-lime-100/50
            transition-all duration-200 hover:scale-105 active:scale-95
          "
          aria-label="Refresh dashboard"
        >
          <RefreshCw
            size={15}
            strokeWidth={2.5}
            className={spinning ? "animate-spin" : ""}
          />
        </button>

        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#65a30d] flex items-center justify-center shadow-md shadow-lime-200/50 text-white text-xs font-black">
          ES
        </div>
      </div>
    </header>
  );
}