"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import CameraPreview from "@/components/CameraPreview";
import MetricCard from "@/components/MetricCard";
import { RotateCcw, Download } from "lucide-react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: "success" | "warning" | "info";
  message: string;
  time: string;
}

interface SortRecord {
  label: string;
  count: number;
  color: string;
  pct: number;
}



// ─── Data ─────────────────────────────────────────────────────────────────────

const ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "success", message: "Batch #0847 sorted successfully", time: "just now" },
  { id: "a2", type: "info", message: "Conveyor speed auto-adjusted to 15mm/s", time: "2m ago" },
  { id: "a3", type: "warning", message: "Humidity rose above threshold (72%)", time: "5m ago" },
  { id: "a4", type: "success", message: "AI model updated — v2.4.1 deployed", time: "12m ago" },
  { id: "a5", type: "info", message: "IoT gateway sync completed", time: "18m ago" },
];

const SORT_RECORDS: SortRecord[] = [
  { label: "Cream / Prepupa", count: 142, color: "#a3e635", pct: 72 },
  { label: "Late Larva", count: 38, color: "#38bdf8", pct: 19 },
  { label: "Early Larva", count: 12, color: "#f59e0b", pct: 6 },
  { label: "Rejected", count: 6, color: "#f87171", pct: 3 },
];

// ─── MiniBar chart ────────────────────────────────────────────────────────────

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

// ─── ActivityRow ──────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: ActivityItem }) {
  const cfg = {
    success: { icon: <CheckCircle2 size={13} strokeWidth={2.5} />, color: "text-emerald-500", bg: "bg-emerald-50" },
    warning: { icon: <AlertCircle size={13} strokeWidth={2.5} />, color: "text-amber-500", bg: "bg-amber-50" },
    info: { icon: <Info size={13} strokeWidth={2.5} />, color: "text-blue-400", bg: "bg-blue-50" },
  }[item.type];

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
      <div className={`mt-0.5 w-6 h-6 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 leading-snug">{item.message}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
      </div>
      <ChevronRight size={12} className="text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <>
      {/* ── Global font + animation injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(163,230,53,0); }
          50%       { box-shadow: 0 0 20px 4px rgba(163,230,53,0.18); }
        }

        .dashboard-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f4f5f7;
          min-height: 100vh;
        }
        .card-float { animation: floatY 4s ease-in-out infinite; }
        .glow-pulse  { animation: glowPulse 3s ease-in-out infinite; }
      `}</style>

      <div className="dashboard-root relative overflow-x-hidden">
        {/* ── Background blobs ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-lime-200/20 blur-[120px]" />
          <div className="absolute top-1/2 -right-60 w-[400px] h-[400px] rounded-full bg-emerald-200/15 blur-[100px]" />
          <div className="absolute -bottom-40 left-1/3 w-[300px] h-[300px] rounded-full bg-lime-100/20 blur-[80px]" />
        </div>

        {/* ── Sidebar ── */}
        <Sidebar activeItem={activeNav} onNavChange={setActiveNav} />

        {/* ── Main content ── */}
        <main
          className="relative min-h-screen"
          style={{ paddingLeft: "calc(68px + 2rem)" }}
        >
          <div className="max-w-[1280px] mx-auto px-6 py-8 pb-16">

            {/* ── Header ── */}
            <PageHeader
              titleIcon="🖥️"
              title="Live Monitoring"
              subtitle="EntoSort AI · BSF Larva Sorting System"
              breadcrumbs={[{ label: "EntoSort" }, { label: "Dashboard" }]}
              status="online"
               actions={
                <div className="flex items-center gap-2">
                  <button
                    title="Reset all to defaults"
                    className="
                      flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                      bg-white border border-gray-200/80 text-gray-500 text-xs font-semibold
                      hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300
                      transition-all duration-200 hover:scale-105 shadow-sm
                    "
                  >
                    <RotateCcw size={13} strokeWidth={2.5} />
                    Reset
                  </button>
                  <button
                    title="Export command log"
                    className="
                      flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                      bg-white border border-gray-200/80 text-gray-500 text-xs font-semibold
                      hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300
                      transition-all duration-200 hover:scale-105 shadow-sm
                    "
                  >
                    <Download size={13} strokeWidth={2.5} />
                    Export Log
                  </button>
                </div>
              }
            />

            {/* ── Camera + right panel ── */}
            <div className="grid xl:grid-cols-[1fr_300px] gap-5 mb-5">
              {/* Camera */}
              <CameraPreview
                temperature={28}
                speed={15}
                fps={30}
                isLive
              />

              {/* Right panel: sort history */}
              <div
                className="
                  rounded-3xl bg-white border border-gray-100/80
                  shadow-[0_2px_20px_rgba(0,0,0,0.05)]
                  p-5 flex flex-col gap-4
                  opacity-0 animate-[fadeSlideUp_0.5s_ease_0.25s_forwards]
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-sm font-black text-gray-900"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      Current Batch
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Batch #0847 · 198 total</p>
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-lime-50 border border-gray-100 hover:border-lime-200 flex items-center justify-center transition-all text-gray-400 hover:text-[#65a30d]">
                    <SlidersHorizontal size={13} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Donut-style summary */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-50/30 border border-lime-100/60">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a3e635] to-[#65a30d] flex items-center justify-center shadow-md shadow-lime-200/50 text-white font-black text-lg">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Sorting Accuracy</p>
                    <p
                      className="text-2xl font-black text-gray-900"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      97.4<span className="text-sm text-lime-500">%</span>
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-lime-500" />
                </div>

                {/* Sort breakdown */}
                <div className="flex flex-col gap-3">
                  {SORT_RECORDS.map((r) => (
                    <SortHistoryBar key={r.label} record={r} />
                  ))}
                </div>

                {/* Throughput gauge */}
                <div className="mt-auto pt-3 border-t border-gray-50">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                    <span>Throughput</span>
                    <span className="text-lime-600 font-bold">198/min</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lime-300 to-[#a3e635] transition-all duration-1000"
                      style={{ width: "82%" }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">82% of target capacity</p>
                </div>
              </div>
            </div>

            {/* ── Metric cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <MetricCard
                variant="temperature"
                title="Temperature"
                value={25}
                unit="°C"
                trend="stable"
                trendValue="±0.3"
                subtitle="Optimal range: 24–28°C"
                fill={62}
                animationDelay={300}
              />
              <MetricCard
                variant="humidity"
                title="Humidity"
                value={70}
                unit="%"
                trend="up"
                trendValue="+2.1%"
                subtitle="Monitor: max 75%"
                fill={70}
                animationDelay={400}
              />
              <MetricCard
                variant="prepupa"
                title="Total Prepupa"
                value={142}
                trend="up"
                trendValue="+18"
                subtitle="This batch cycle"
                fill={71}
                animationDelay={500}
              />
              <MetricCard
                variant="larva"
                title="Total Larva"
                value={56}
                trend="down"
                trendValue="−12"
                subtitle="Remaining in bin"
                fill={28}
                animationDelay={600}
              />
            </div>

            {/* ── Bottom row: activity + system health ── */}
            <div className="grid xl:grid-cols-[1fr_280px] gap-5">

              {/* Activity feed */}
              <div
                className="
                  rounded-3xl bg-white border border-gray-100/80
                  shadow-[0_2px_20px_rgba(0,0,0,0.05)]
                  p-5
                  opacity-0 animate-[fadeSlideUp_0.5s_ease_0.55s_forwards]
                "
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-sm font-black text-gray-900"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Activity Log
                  </h3>
                  <button className="text-[11px] font-semibold text-lime-600 hover:text-lime-700 flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div>
                  {ACTIVITY.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* System health */}
              <div
                className="
                  rounded-3xl bg-white border border-gray-100/80
                  shadow-[0_2px_20px_rgba(0,0,0,0.05)]
                  p-5 flex flex-col gap-4
                  opacity-0 animate-[fadeSlideUp_0.5s_ease_0.65s_forwards]
                "
              >
                <h3
                  className="text-sm font-black text-gray-900"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  System Health
                </h3>

                {[
                  { label: "AI Inference", pct: 94, color: "#a3e635", status: "Nominal" },
                  { label: "IoT Gateway", pct: 100, color: "#34d399", status: "Connected" },
                  { label: "Conveyor", pct: 82, color: "#38bdf8", status: "Running" },
                  { label: "Storage", pct: 57, color: "#f59e0b", status: "57% used" },
                  { label: "Edge TPU", pct: 71, color: "#a78bfa", status: "Active" },
                ].map((sys) => (
                  <div key={sys.label} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-600">{sys.label}</span>
                      <span className="text-[10px] font-bold text-gray-400">{sys.status}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                        style={{ width: `${sys.pct}%`, backgroundColor: sys.color }}
                      />
                    </div>
                  </div>
                ))}

                {/* Uptime badge */}
                <div className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-lime-50 border border-lime-100">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                  <span className="text-xs font-bold text-lime-700">Uptime: 99.97%</span>
                  <span className="ml-auto text-[10px] text-lime-600 font-medium">↑ 14d 6h</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <footer className="border-t border-gray-100 bg-white/60 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
            <p className="text-[11px] text-gray-400 font-medium">
              © 2025 <span className="font-bold text-gray-600">EntoSort</span> · AI-Powered BSF Sorting
            </p>
            <p className="text-[11px] text-gray-400 font-mono hidden sm:block">
              v2.4.1 · Edge · YOLOv8
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}