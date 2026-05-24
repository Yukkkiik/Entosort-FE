"use client";

import { useState, useCallback, useEffect } from "react";
import { Cog, Zap, Layers, Lightbulb, RotateCcw, Download } from "lucide-react";

import ManualModeToggle from "@/components/control/ManualModeControl";
import ControlCard from "@/components/control/ControlCard";
import StatusSummary, { type ComponentStatus } from "@/components/control/StatusSummary";
import { useSetHeader } from "@/components/layout/HeaderContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MachineComponent {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
  defaultActive: boolean;
}

// ─── Machine components config ────────────────────────────────────────────────

const MACHINE_COMPONENTS: MachineComponent[] = [
  {
    id: "motor_conveyor",
    title: "Motor Conveyor",
    description: "Main belt drive transporting larva trays through the sorting pipeline at variable speed.",
    icon: <Cog size={20} strokeWidth={2} />,
    detail: "Running at 15 mm/s",
    defaultActive: true,
  },
  {
    id: "sorting_servo",
    title: "Sorting Servo",
    description: "Precision actuator physically separating classified larvae into target output channels.",
    icon: <Zap size={20} strokeWidth={2} />,
    detail: "Actuating @ 60 Hz",
    defaultActive: true,
  },
  {
    id: "feeding_system",
    title: "Feeding System",
    description: "Automated feeder dosing organic substrate into larva bins on a scheduled cycle.",
    icon: <Layers size={20} strokeWidth={2} />,
    detail: "Next cycle in 8 min",
    defaultActive: false,
  },
  {
    id: "lighting_system",
    title: "Lighting System",
    description: "High-CRI LED array providing optimal spectrum lighting for computer vision accuracy.",
    icon: <Lightbulb size={20} strokeWidth={2} />,
    detail: "5600 K · 95 CRI",
    defaultActive: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ControlPage() {
  const [isManual, setIsManual] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const defaultActiveMap = Object.fromEntries(
    MACHINE_COMPONENTS.map((c) => [c.id, c.defaultActive])
  );
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(defaultActiveMap);

  useEffect(() => {
    const tick = () =>
      setLastUpdated(
        new Date().toLocaleTimeString("en-US", {
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

  const handleToggle = useCallback((id: string, value: boolean) => {
    setActiveMap((prev) => ({ ...prev, [id]: value }));
  }, []);

  const summaryComponents: ComponentStatus[] = MACHINE_COMPONENTS.map((c) => ({
    id: c.id,
    label: c.title,
    isActive: activeMap[c.id],
    icon: c.icon,
    detail: c.detail,
  }));

  useSetHeader({
    titleIcon: "🎛️",
    title: "Manual Control Panel",
    subtitle: "Interactive remote control for physical machine components — commands are sent directly to IoT hardware in real time.",
    breadcrumbs: [{ label: "EntoSort" }, { label: "Dashboard" }, { label: "Manual Control" }],
    pollInterval: 30_000,
    actions: (
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
    ),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Section label ── */}
      <div className="flex items-center gap-3 mb-4 opacity-0 animate-[fadeSlideUp_0.45s_ease_0.1s_forwards]">
        <h2
          className="text-xs font-extrabold text-gray-500 uppercase tracking-widest whitespace-nowrap"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Manual Control Interface
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
      </div>

      {/* ── Mode toggle ── */}
      <div className="mb-5">
        <ManualModeToggle
          isManual={isManual}
          onChange={setIsManual}
          animationDelay={150}
        />
      </div>

      {/* ── Control cards grid ── */}
      <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {MACHINE_COMPONENTS.map((comp, i) => (
          <ControlCard
            key={comp.id}
            id={comp.id}
            title={comp.title}
            description={comp.description}
            icon={comp.icon}
            isActive={activeMap[comp.id]}
            isManualMode={isManual}
            onToggle={handleToggle}
            animationDelay={250 + i * 75}
          />
        ))}
      </div>

      {/* ── Status summary ── */}
      <StatusSummary
        components={summaryComponents}
        lastUpdated={lastUpdated}
        animationDelay={600}
      />
    </>
  );
}