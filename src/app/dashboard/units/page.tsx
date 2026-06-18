"use client";

import { useMemo } from "react";
import StatsCard from "@/components/monitoring/StatsCard";
import Card from "@/components/ui/Card";
import UnitTable from "@/components/unit/UnitTable";
import { useSetHeader } from "@/components/layout/HeaderContext";
import { useUnits } from "@/hooks/useUnit";
import { useCurrentUser } from "@/hooks/useAuth";
import RoleGuard from "@/lib/RoleGuard";
import { Package, Download, RotateCcw, Wifi, WifiOff, Tractor } from "lucide-react";

export default function UnitPage() {
  const { units, total, online, offline } = useUnits(30_000);
  const {} = useCurrentUser();

  const stats = useMemo(() => {
    const withAdmin    = units.filter((u) => u.adminId != null).length;
    const withPeternak = units.filter((u) => u.peterId != null).length;
    const withoutAdmin = total - withAdmin;

    return { withAdmin, withPeternak, withoutAdmin };
  }, [units, total]);

  useSetHeader({
    titleIcon: "🔧",
    title: "Unit Management",
    subtitle: "Kelola unit BSF AutoSort dan assign pengguna.",
    breadcrumbs: [{ label: "EntoSort" }, { label: "Dashboard" }, { label: "Unit Management" }],
    pollInterval: 30_000,
    actions: (
      <div className="flex items-center gap-2">
        <button
          title="Reset"
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
          title="Export log"
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
    <RoleGuard allowedRoles={["superadmin", "admin"]}>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.1s_forwards]">
        <StatsCard
          label="Total Unit"
          value={total}
          icon={<Package size={18} />}
          accent="green"
          trend="neutral"
          trendValue={`${total}`}
          trendLabel="Semua unit terdaftar"
        />
        <StatsCard
          label="Online"
          value={online}
          icon={<Wifi size={18} />}
          accent="blue"
          trend="neutral"
          trendValue={`${online}`}
          trendLabel="Terhubung ke server"
        />
        <StatsCard
          label="Offline"
          value={offline}
          icon={<WifiOff size={18} />}
          accent="amber"
          trend={offline > 0 ? "down" : "neutral"}
          trendValue={`${offline}`}
          trendLabel="Tidak terhubung"
        />
        <StatsCard
          label="Terisi Peternak"
          value={`${stats.withPeternak}/${total}`}
          icon={<Tractor size={18} />}
          accent="violet"
          trend="neutral"
          trendValue={`${stats.withoutAdmin} tanpa admin`}
          trendLabel="Unit belum punya admin"
        />
      </div>

      {/* ── Unit Table Card ── */}
      <Card
        variant="default"
        padding="md"
        className="opacity-0 animate-[fadeSlideUp_0.5s_ease_0.25s_forwards] border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.05)] rounded-3xl"
      >
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-50">
          <div>
            <h2
              className="text-sm font-black text-gray-900"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              All Units
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Click on a row or action buttons to manage units
            </p>
          </div>
        </div>

        <UnitTable />
      </Card>
    </RoleGuard>
  );
}