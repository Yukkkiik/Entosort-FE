"use client";

import { useState, useCallback, useEffect } from "react";
import { Cog, Zap, Layers, Lightbulb, RotateCcw, Download } from "lucide-react";
import type { UnitNode } from "@/types/unit";

import ManualModeToggle from "@/components/control/ManualModeControl";
import ControlCard from "@/components/control/ControlCard";
import StatusSummary, { type ComponentStatus } from "@/components/control/StatusSummary";
import UnitSelector from "@/components/control/unitSelector";
import { useSetHeader } from "@/components/layout/HeaderContext";
import { useUnits } from "@/hooks/useUnit";
import { useCurrentUser } from "@/hooks/useAuth";
import { useManualMode } from "@/hooks/useControl";
import { useSettings } from "@/hooks/useSettings";
import RoleGuard from "@/lib/RoleGuard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MachineComponent {
  id:            string;
  title:         string;
  description:   string;
  icon:          React.ReactNode;
  detail:        string;
  defaultActive: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MACHINE_COMPONENTS: MachineComponent[] = [
  {
    id:            "motor_conveyor",
    title:         "Motor Conveyor",
    description:   "Main belt drive transporting larva trays through the sorting pipeline at variable speed.",
    icon:          <Cog size={20} strokeWidth={2} />,
    detail:        "Running at 15 mm/s",
    defaultActive: true,
  },
  {
    id:            "sorting_servo",
    title:         "Sorting Servo",
    description:   "Precision actuator physically separating classified larvae into target output channels.",
    icon:          <Zap size={20} strokeWidth={2} />,
    detail:        "Actuating @ 60 Hz",
    defaultActive: true,
  },
  {
    id:            "feeding_system",
    title:         "Feeding System",
    description:   "Automated feeder dosing organic substrate into larva bins on a scheduled cycle.",
    icon:          <Layers size={20} strokeWidth={2} />,
    detail:        "Next cycle in 8 min",
    defaultActive: false,
  },
  {
    id:            "lighting_system",
    title:         "Lighting System",
    description:   "High-CRI LED array providing optimal spectrum lighting for computer vision accuracy.",
    icon:          <Lightbulb size={20} strokeWidth={2} />,
    detail:        "5600 K · 95 CRI",
    defaultActive: true,
  },
];

const defaultActiveMap = Object.fromEntries(
  MACHINE_COMPONENTS.map((c) => [c.id, c.defaultActive])
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ControlPage() {
  const { role }           = useCurrentUser();
  const isAdmin            = role === "admin";
  const { units }          = useUnits();
  const manualModeMutation = useManualMode();

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [lastUpdated,    setLastUpdated]    = useState("");
  const [activeMap,      setActiveMap]      = useState<Record<string, boolean>>(defaultActiveMap);

  // isManual: null = belum ada data dari DB (loading)
  const [isManual, setIsManual] = useState<boolean | null>(null);

  const activeUnitId =
    selectedUnitId ??
    units?.find((u) => u.status === "online")?.unitId ??
    units?.[0]?.unitId ??
    "";

  // ── Fetch settings dari DB untuk unit yang dipilih ──────────────────────────
  const { data: settings } = useSettings(activeUnitId || undefined);

  // Sync isManual dari DB setiap kali settings atau unit berubah
  useEffect(() => {
    if (!settings) return;
    setIsManual(settings.manualMode ?? false);

    // Sync activeMap dari DB — motorOn & solenoidOn
    setActiveMap((prev) => ({
      ...prev,
      motor_conveyor: settings.motorOn    ?? prev.motor_conveyor,
      sorting_servo:  settings.solenoidOn ?? prev.sorting_servo,
    }));
  }, [settings]);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setLastUpdated(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Ganti unit → reset ke default sementara, tunggu settings baru dari DB
  const handleUnitChange = useCallback((unitId: string) => {
    setSelectedUnitId(unitId);
    setActiveMap(defaultActiveMap);
    setIsManual(null); // loading state sampai settings masuk
  }, []);

  const handleToggle = useCallback((id: string, value: boolean) => {
    setActiveMap((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleManualModeChange = useCallback(
    async (value: boolean) => {
      if (!activeUnitId) return;
      setIsManual(value); // optimistic
      try {
        await manualModeMutation.mutateAsync({ unitId: activeUnitId, enabled: value });
        // Setelah berhasil, useSettings akan invalidate & refetch otomatis
        // sehingga activeMap juga ikut terupdate dari DB
      } catch {
        setIsManual(!value); // rollback
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeUnitId]
  );

  const handleReset = useCallback(() => {
    setActiveMap(defaultActiveMap);
    setIsManual(false); // reset ke AUTO
  }, []);

  const summaryComponents: ComponentStatus[] = MACHINE_COMPONENTS.map((c) => ({
    id:       c.id,
    label:    c.title,
    isActive: activeMap[c.id],
    icon:     c.icon,
    detail:   c.detail,
  }));

  const selectedUnit                    = units?.find((u) => u.unitId === activeUnitId);
  const esp32Node: UnitNode | undefined = selectedUnit?.nodes?.find(
    (n) => n.nodeType === "esp32"
  );

  // isManual masih null = settings belum loaded
  const isManualResolved = isManual ?? false;
  const isLoading        = isManual === null && !!activeUnitId;

  useSetHeader({
    titleIcon:   "🎛️",
    title:       "Manual Control Panel",
    subtitle:    "Interactive remote control for physical machine components — commands are sent directly to IoT hardware in real time.",
    breadcrumbs: [
      { label: "EntoSort" },
      { label: "Dashboard" },
      { label: "Manual Control" },
    ],
    pollInterval: 30_000,
    actions: (
      <div className="flex items-center gap-2">
        <button
          title="Reset all to defaults"
          onClick={handleReset}
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
      <RoleGuard allowedRoles={["admin", "operator"]}>
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

        {/* ── Unit selector — hanya admin ── */}
        {isAdmin && units && units.length > 0 && (
          <div className="mb-5">
            <UnitSelector
              units={units}
              selectedUnitId={activeUnitId}
              esp32Node={esp32Node}
              onChange={handleUnitChange}
              animationDelay={100}
            />
          </div>
        )}

        {/* ── Mode toggle ── */}
        <div className="mb-5">
          <ManualModeToggle
            isManual={isManualResolved}
            onChange={handleManualModeChange}
            disabled={manualModeMutation.isPending || isLoading}
            animationDelay={150}
          />
        </div>

        {/* ── Control cards ── */}
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {MACHINE_COMPONENTS.map((comp, i) => (
            <ControlCard
              key={comp.id}
              id={comp.id}
              title={comp.title}
              description={comp.description}
              icon={comp.icon}
              isActive={activeMap[comp.id]}
              isManualMode={isManualResolved}
              unitId={activeUnitId}
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
      </RoleGuard>
    </>
  );
}