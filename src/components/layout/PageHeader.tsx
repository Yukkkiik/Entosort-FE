// ─── PageHeader.tsx ───────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Loader2, Wifi, WifiOff } from "lucide-react";
import { useNodes, useNodeStatus } from "@/hooks/useNode";
import { useAuthStore } from "@/lib/authStore";
import type { PageHeaderProps, SystemStatus } from "@/types/node";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  SystemStatus,
  {
    label: string;
    dot: string;
    ping: boolean;
    text: string;
    pill: string;
    icon: React.ReactNode;
  }
> = {
  online: {
    label: "System Online",
    dot: "bg-[#a3e635]",
    ping: true,
    text: "text-[#4d7c0f]",
    pill: "bg-lime-50 border-lime-200/70",
    icon: <Wifi size={11} strokeWidth={2.5} />,
  },
  offline: {
    label: "System Offline",
    dot: "bg-rose-400",
    ping: false,
    text: "text-rose-600",
    pill: "bg-rose-50 border-rose-200/70",
    icon: <WifiOff size={11} strokeWidth={2.5} />,
  },
  connecting: {
    label: "Connecting...",
    dot: "bg-amber-400",
    ping: false,
    text: "text-amber-600",
    pill: "bg-amber-50 border-amber-200/70",
    icon: <Loader2 size={11} strokeWidth={2.5} className="animate-spin" />,
  },
};

// ─── NodeSummaryBadge — ditampilkan ketika tidak ada nodeId spesifik ──────────
// Menampilkan berapa node online dari total milik user

function NodeSummaryBadge() {
  const { total, online, isLoading } = useNodes(30_000);
  const user = useAuthStore((s) => s.user);

  // Admin tidak perlu lihat summary node di PageHeader
  if (user?.role === "admin") return null;

  if (isLoading) {
    const s = STATUS_CFG["connecting"];
    return (
      <div
        className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${s.pill} ${s.text}`}
      >
        <span>{s.icon}</span>
        {s.label}
      </div>
    );
  }

  const allOffline = online === 0;
  const s = allOffline ? STATUS_CFG["offline"] : STATUS_CFG["online"];

  return (
    <div
      className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${s.pill} ${s.text}`}
    >
      <span className="relative flex w-2 h-2">
        {s.ping && (
          <span
            className={`absolute inset-0 rounded-full ${s.dot} animate-ping opacity-60`}
          />
        )}
        <span className={`relative w-2 h-2 rounded-full ${s.dot}`} />
      </span>
      <span>{s.icon}</span>
      {allOffline ? "Semua Node Offline" : `${online} / ${total} Node Online`}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export default function PageHeader({
  title,
  subtitle,
  titleIcon,
  breadcrumbs = [],
  status: staticStatus = "online",
  nodeId,
  pollInterval = 30_000,
  actions,
  animationDelay = 0,
}: PageHeaderProps) {
  const [time, setTime] = useState("");
  const user = useAuthStore((s) => s.user);
  const isPeternak = user?.role === "peternak";

  // Jika ada nodeId spesifik → poll status satu node
  const { status: dynamicStatus, lastSeen } = useNodeStatus(nodeId, pollInterval);

  const status: SystemStatus = nodeId ? dynamicStatus : staticStatus;
  const s = STATUS_CFG[status];

  const lastSeenText = lastSeen
    ? `Last seen: ${new Date(lastSeen).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`
    : null;

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="
        relative rounded-3xl overflow-hidden
        bg-white border border-gray-100/80
        shadow-[0_2px_24px_rgba(0,0,0,0.06)]
        p-6 sm:p-7 mb-6
        opacity-0 animate-[fadeSlideUp_0.55s_ease_forwards]
      "
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-lime-100/50 to-emerald-50/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-36 h-16 rounded-full bg-lime-50/30 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* ── Left block ── */}
        <div>
          {breadcrumbs.length > 0 && (
            <nav
              className="flex items-center gap-1 mb-2.5"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight size={10} className="text-gray-300" />
                  )}
                  <span
                    className={`text-[11px] font-semibold ${
                      i === breadcrumbs.length - 1
                        ? "text-gray-400"
                        : "text-gray-300"
                    }`}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          )}

          <h1
            className="flex items-center gap-2.5 text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight"
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
          >
            {titleIcon && (
              <span className="text-2xl leading-none select-none">
                {titleIcon}
              </span>
            )}
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1.5 text-sm text-gray-400 font-medium max-w-lg leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* 
            ── Status badge — hanya untuk peternak ────────────────
            Admin tidak perlu lihat status node di PageHeader
            1. Ada nodeId  → status node spesifik (misal halaman detail)
            2. Tidak ada   → ringkasan semua node milik peternak
          */}
          {isPeternak && (
            nodeId ? (
              <div
                className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${s.pill} ${s.text}`}
              >
                <span className="relative flex w-2 h-2">
                  {s.ping && (
                    <span
                      className={`absolute inset-0 rounded-full ${s.dot} animate-ping opacity-60`}
                    />
                  )}
                  <span className={`relative w-2 h-2 rounded-full ${s.dot}`} />
                </span>
                <span>{s.icon}</span>
                {s.label}
                {status === "offline" && lastSeenText && (
                  <span className="ml-1 text-rose-400 font-normal">
                    · {lastSeenText}
                  </span>
                )}
              </div>
            ) : (
              <NodeSummaryBadge />
            )
          )}
        </div>

        {/* ── Right block ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span
              className="text-xl font-black text-gray-800 tabular-nums tracking-tight"
              style={{ fontFamily: "'Sora', monospace" }}
            >
              {time}
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Live Clock
            </span>
          </div>

          {actions && (
            <>
              <div className="w-px h-10 bg-gray-100 hidden sm:block" />
              <div className="flex items-center gap-2">{actions}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}