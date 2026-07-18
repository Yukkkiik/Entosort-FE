"use client";

import { useState, useCallback } from "react";
import CameraPreview from "@/components/monitoring/CameraPreview";
import MetricCard from "@/components/monitoring/MetricCard";
import UnitSelector from "@/components/control/unitSelector";
import { useSetHeader } from "@/components/layout/HeaderContext";
import RoleGuard from "@/lib/RoleGuard";
import { useUnits } from "@/hooks/useUnit";
import { useHarvestLogs } from "@/hooks/useHarvest";
import { useSensorLatest } from "@/hooks/useSensor";
import type { UnitNode } from "@/types/unit";
import {
  CheckCircle2, AlertCircle, Info,
  ArrowUpRight, SlidersHorizontal, ChevronRight,
  Download, RotateCcw, Wifi, WifiOff,
  Bug, Sprout, FileWarning, ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SortRecord {
  label: string;
  count: number;
  color: string;
  pct:   number;
}

// ─── SortHistoryBar ───────────────────────────────────────────────────────────

function SortHistoryBar({ record }: { record: SortRecord }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0">
        <p className="text-[11px] font-semibold text-gray-600 truncate">{record.label}</p>
        <p className="text-xs font-black text-gray-900">{record.count}</p>
      </div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${record.pct}%`, backgroundColor: record.color }}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-400 w-8 text-right">{record.pct}%</span>
    </div>
  );
}

// ─── ActivityRow dari HarvestLog ──────────────────────────────────────────────

function ActivityRow({ log }: {
  log: {
    id: number;
    totalCount: number;
    rejectCount: number;
    larvaCount: number;
    prepupaCount: number;
    recordedAt: string;
    unitId: string;
  }
}) {
  const rejectRate = log.totalCount > 0 ? (log.rejectCount / log.totalCount) * 100 : 0;
  const type = rejectRate > 20 ? "warning" : rejectRate > 5 ? "info" : "success";

  const cfg = {
    success: {
      icon: <CheckCircle2 size={13} strokeWidth={2.5} />,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    warning: {
      icon: <AlertCircle size={13} strokeWidth={2.5} />,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    info: {
      icon: <Info size={13} strokeWidth={2.5} />,
      color: "text-blue-400",
      bg: "bg-blue-50",
    },
  }[type];

  const timeLabel = new Date(log.recordedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });

  const dateLabel = new Date(log.recordedAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "short",
  });

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
      <div className={`mt-0.5 w-6 h-6 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 leading-snug">
          Sesi sortir — {log.larvaCount} larva, {log.prepupaCount} prepupa
          {log.rejectCount > 0 && (
            <span className="text-red-500"> · {log.rejectCount} reject</span>
          )}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {dateLabel} · {timeLabel} · {log.unitId}
        </p>
      </div>
      <ChevronRight size={12} className="text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { units, isLoading: unitsLoading } = useUnits();
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const resolvedUnitId = selectedUnitId || units[0]?.unitId || "";

  const selectedUnit = units.find((u) => u.unitId === resolvedUnitId);
  const raspiNode: UnitNode | undefined = selectedUnit?.nodes?.find(
    (n) => n.nodeType === "raspberry"   
  );

  const handleUnitChange = useCallback((id: string) => {
    setSelectedUnitId(id);
  }, []);

  const [liveDetection, setLiveDetection] = useState({
    larvaCount: 0, prepupaCount: 0, totalDetected: 0, avgConfidence: 0, fps: 0,
  });
  const { data: sensorResponse } = useSensorLatest(
    resolvedUnitId? { unitId: resolvedUnitId } : {},
    5000
  );

  const currentTemp = sensorResponse?.temperature ?? 0;
  const currentHum = sensorResponse?.humidity ?? 0;

  const tempFill = Math.min(Math.max((currentTemp / 40) * 100, 0), 100); // Batas grafik 40°C
  const humFill = Math.min(Math.max(currentHum, 0), 100);

  const tempTrend = currentTemp >= 24 && currentTemp <= 28 ? "stable" : currentTemp > 28 ? "up" : "down";
  const humTrend = currentHum <= 75 ? "stable" : "up";
  const tempTrendValue = tempTrend === "stable" ? "±0.3" : tempTrend === "up" ? "+0.5" : "-0.5";
  const humTrendValue = humTrend === "stable" ? "Stable" : "Overlimit";

  const handleDetectionUpdate = useCallback((data: {
    larvaCount:    number;
    prepupaCount:  number;
    totalDetected: number;
    avgConfidence: number;
    fps:           number;
  }) => {
    setLiveDetection(data);
  }, []);

  const totalLive = liveDetection.larvaCount + liveDetection.prepupaCount;

  const liveSortRecords = [
    {
      label: "Prepupa",
      count: liveDetection.prepupaCount,
      color: "#a3e635",
      pct: totalLive > 0 ? Math.round((liveDetection.prepupaCount / totalLive) * 100) : 0,
    },
    {
      label: "Larva",
      count: liveDetection.larvaCount,
      color: "#38bdf8",
      pct: totalLive > 0 ? Math.round((liveDetection.larvaCount / totalLive) * 100) : 0,
    },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  })();

  // ── FIX 1 (lanjutan): pakai resolvedUnitId + undefined (bukan null) ────────
  // undefined = sinyal ke hook untuk skip fetch (TanStack Query: enabled: !!param)
  const { data: logsData, isLoading: logsLoading } = useHarvestLogs(
    resolvedUnitId
      ? { unitId: resolvedUnitId, from: thirtyDaysAgo, to: today, page: 1, limit: 5 }
      : undefined
  );

  const recentLogs = Array.isArray(logsData)
    ? logsData.slice(0, 5)
    : (logsData?.data ?? []).slice(0, 5);

  const totalPrepupa = recentLogs.reduce((sum, log) => sum + log.prepupaCount, 0);
  const totalLarva = recentLogs.reduce((sum, log) => sum + log.larvaCount, 0);

  const prepupaTargetMax = 200;
  const larvaTargetMax = 200;

  const prepupaFillPct = Math.min(Math.max((totalPrepupa / prepupaTargetMax ) * 100, 0), 100);
  const larvaFillPct = Math.min(Math.max((totalLarva / larvaTargetMax) * 100, 0), 100);

  useSetHeader({
    titleIcon: "🖥️",
    title: "Live Monitoring",
    subtitle: "EntoSort AI · BSF Larva Sorting System",
    breadcrumbs: [{ label: "EntoSort" }, { label: "Dashboard" }],
    pollInterval: 30_000,
    actions: (
      <div className="flex items-center gap-2">
        <button
          title="Reset all to defaults"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200/80 text-gray-500 text-xs font-semibold hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-sm"
        >
          <RotateCcw size={13} strokeWidth={2.5} />
          Reset
        </button>
        <button
          title="Export command log"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200/80 text-gray-500 text-xs font-semibold hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 hover:scale-105 shadow-sm"
        >
          <Download size={13} strokeWidth={2.5} />
          Export Log
        </button>
      </div>
    ),
  });

  return (
    <>
      <RoleGuard allowedRoles={["admin", "operator"]}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes floatY {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-6px); }
          }
          .dashboard-root { font-family: 'DM Sans', system-ui, sans-serif; background: #f4f5f7; min-height: 100vh; }
        `}</style>

        <div className="dashboard-root relative overflow-x-hidden">
          {/* Background blobs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-lime-200/20 blur-[120px]" />
            <div className="absolute top-1/2 -right-60 w-[400px] h-[400px] rounded-full bg-emerald-200/15 blur-[100px]" />
            <div className="absolute -bottom-40 left-1/3 w-[300px] h-[300px] rounded-full bg-lime-100/20 blur-[80px]" />
          </div>

          <div className="max-w-[1280px] mx-auto pb-16">

            {/* ── Unit Selector — kini menampilkan node Raspberry Pi ── */}
            {!unitsLoading && units.length > 0 && (
              <div className="mb-5">
                <UnitSelector
                  units={units}
                  selectedUnitId={resolvedUnitId}
                  node={raspiNode}
                  nodeLabel="Unit Aktif (Raspberry Pi)"
                  onChange={handleUnitChange}
                  animationDelay={0}
                />
              </div>
            )}

            {/* ── Camera + right panel ── */}
            <div className="grid xl:grid-cols-[1fr_300px] gap-5 mb-5">
              <CameraPreview
                nodeId={raspiNode?.nodeId ?? resolvedUnitId}
                onDetectionUpdate={handleDetectionUpdate}
              />

              {/* Right panel: sort history */}
              <div className="rounded-3xl bg-white border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.25s_forwards]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                      Current Batch
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Live · {liveDetection.totalDetected} detected
                    </p>
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-lime-50 border border-gray-100 hover:border-lime-200 flex items-center justify-center transition-all text-gray-400 hover:text-[#65a30d]">
                    <SlidersHorizontal size={13} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-50/30 border border-lime-100/60">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#65a30d] flex items-center justify-center shadow-md shadow-lime-200/50 text-white font-black text-lg">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Avg Confidence</p>
                    <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {liveDetection.avgConfidence}<span className="text-sm text-lime-500">%</span>
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-lime-500" />
                </div>

                <div className="flex flex-col gap-3">
                  {liveSortRecords.map((r) => (
                    <SortHistoryBar key={r.label} record={r} />
                  ))}
                </div>

                {/* Target FPS realistis untuk RPi (15, bukan 30) ── */}
                <div className="mt-auto pt-3 border-t border-gray-50">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                    <span>FPS</span>
                    <span className="text-lime-600 font-bold">{liveDetection.fps.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lime-300 to-[#a3e635] transition-all duration-1000"
                      style={{ width: `${Math.min((liveDetection.fps / 15) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Target: 15 FPS</p>
                </div>
              </div>
            </div>

            {/* ── Metric cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <MetricCard 
                variant="temperature" 
                title="Temperature" 
                value={Number(currentTemp.toFixed(1))} 
                unit="°C" 
                trend={tempTrend} 
                trendValue={tempTrendValue} 
                subtitle="Optimal range: 24-28°C"  
                fill={Math.round(tempFill)}
                animationDelay={300} 
              />
              <MetricCard 
                variant="humidity" 
                title="Humidity" 
                value={Number(currentHum.toFixed(1))} 
                unit="%" 
                trend={humTrend} 
                trendValue={humTrendValue} 
                subtitle="Monitor: max 75%" 
                fill={Math.round(humFill)} 
                animationDelay={400} 
              />
              <MetricCard 
                variant="prepupa" 
                title="Total Prepupa" 
                value={totalPrepupa} 
                trend={totalPrepupa > 1 ? "up" : "down"} 
                trendValue={`+${totalPrepupa > 0 ? totalPrepupa : 0}`} 
                subtitle="This batch cycle" 
                fill={Math.round(prepupaFillPct)} 
                animationDelay={500} />
              <MetricCard 
                variant="larva" 
                title="Total Larva" 
                value={totalLarva} 
                trend={totalLarva > 1 ? "up" : "down"} 
                trendValue={`+${totalLarva > 0 ? totalLarva : 0}`} 
                subtitle="Remaining in bin" 
                fill={Math.round(larvaFillPct)} 
                animationDelay={600} />
            </div>

            {/* ── Bottom row: activity live + system health ── */}
            <div className="grid xl:grid-cols-[1fr_280px] gap-5">

              {/* Activity feed — live dari backend */}
              <div className="rounded-3xl bg-white border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] p-5 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.55s_forwards]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                      Activity Log
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      5 sesi terbaru · {resolvedUnitId || "memuat unit..."}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/reports"
                    className="text-[11px] font-semibold text-lime-600 hover:text-lime-700 flex items-center gap-1 transition-colors"
                  >
                    Lihat semua <ExternalLink size={11} />
                  </Link>
                </div>

                {!resolvedUnitId || logsLoading ? (
                  <div className="flex items-center gap-2 py-8 justify-center text-sm text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
                    {!resolvedUnitId ? "Memuat unit..." : "Memuat log..."}
                  </div>
                ) : recentLogs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm font-semibold text-gray-400">Belum ada aktivitas</p>
                    <p className="text-xs text-gray-300 mt-1">Unit ini belum memiliki log sortir.</p>
                  </div>
                ) : (
                  <div>
                    {recentLogs.map((log) => (
                      <ActivityRow key={log.id} log={log} />
                    ))}
                  </div>
                )}

                {/* Quick stats bar */}
                {!logsLoading && recentLogs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-3">
                    {[
                      { icon: Bug,         label: "Larva",   value: recentLogs.reduce((s, l) => s + l.larvaCount, 0),   color: "text-blue-500"  },
                      { icon: Sprout,      label: "Prepupa", value: recentLogs.reduce((s, l) => s + l.prepupaCount, 0), color: "text-lime-600"  },
                      { icon: FileWarning, label: "Reject",  value: recentLogs.reduce((s, l) => s + l.rejectCount, 0),  color: "text-red-400"   },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50">
                        <Icon size={13} className={color} />
                        <span className="text-base font-black text-gray-800">{value.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* System health */}
              <div className="rounded-3xl bg-white border border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.65s_forwards]">
                <h3 className="text-sm font-black text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                  System Health
                </h3>
                {[
                  { label: "AI Inference", pct: 94,  color: "#a3e635", status: "Nominal"    },
                  { label: "IoT Gateway",  pct: 100, color: "#34d399", status: "Connected"  },
                  { label: "Conveyor",     pct: 82,  color: "#38bdf8", status: "Running"    },
                  { label: "Storage",      pct: 57,  color: "#f59e0b", status: "57% used"   },
                  { label: "Edge TPU",     pct: 71,  color: "#a78bfa", status: "Active"     },
                ].map((sys) => (
                  <div key={sys.label} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-600">{sys.label}</span>
                      <span className="text-[10px] font-bold text-gray-400">{sys.status}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80" style={{ width: `${sys.pct}%`, backgroundColor: sys.color }} />
                    </div>
                  </div>
                ))}
                <div className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-lime-50 border border-lime-100">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                  <span className="text-xs font-bold text-lime-700">Uptime: 99.97%</span>
                  <span className="ml-auto text-[10px] text-lime-600 font-medium">↑ 14d 6h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RoleGuard>
    </>
  );
}