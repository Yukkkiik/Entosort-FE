"use client";

import { useMemo } from "react";
import StatsCard from "@/components/monitoring/StatsCard";
import Card from "@/components/ui/Card";
import UserTable from "@/components/users/UserTable";
import { useSetHeader } from "@/components/layout/HeaderContext";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useAuth";
import RoleGuard from "@/lib/RoleGuard";
import { Users, Download, RotateCcw, Package, UserCheck, ShieldCheck } from "lucide-react";

export default function UserPage() {
  const { data: allUsers = [] } = useUsers();
  const { role } = useCurrentUser();

  // ── Hitung stats berdasarkan role ─────────────────────────────────────────
  const stats = useMemo(() => {
    if (role === "superadmin") {
      const admins   = allUsers.filter((u) => u.role === "admin");
      const peternak = allUsers.filter((u) => u.role === "peternak");
      const total    = allUsers.filter((u) => u.role !== "superadmin");
      return {
        totalAccounts:    total.length,
        adminAccounts:    admins.length,
        peternakAccounts: peternak.length,
        ratio: admins.length > 0
          ? `${(peternak.length / admins.length).toFixed(1)}x`
          : "—",
      };
    }

    if (role === "admin") {
      // Admin hanya lihat peternak — data sudah difilter di backend
      const myPeternak = allUsers.filter((u) => u.role === "peternak");

      // Peternak yang sudah punya unit (peternakUnit bukan null)
      const withUnit    = myPeternak.filter((u) => u.peternakUnit != null);
      const withoutUnit = myPeternak.length - withUnit.length;

      // Total node dari semua unit peternak
      const totalNodes = myPeternak.reduce(
        (acc, u) => acc + (u.peternakUnit?.nodes?.length ?? 0),
        0
      );

      return {
        totalAccounts: myPeternak.length,
        withUnit:      withUnit.length,
        withoutUnit,
        totalNodes,
        unitRatio: myPeternak.length > 0
          ? `${Math.round((withUnit.length / myPeternak.length) * 100)}%`
          : "0%",
      };
    }

    return {
      totalAccounts:    0,
      adminAccounts:    0,
      peternakAccounts: 0,
      ratio:            "—",
    };
  }, [allUsers, role]);

  useSetHeader({
    titleIcon: "🧑🏼‍💼",
    title: "User Management",
    subtitle: "Kelola hak akses dan akun operator sistem.",
    breadcrumbs: [{ label: "EntoSort" }, { label: "Dashboard" }, { label: "User Management" }],
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
    <RoleGuard allowedRoles={["superadmin", "admin"]}>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.1s_forwards]">
        {role === "superadmin" ? (
          <>
            <StatsCard
              label="Total Akun"
              value={stats.totalAccounts}
              icon={<Users size={18} />}
              accent="green"
              trend="neutral"
              trendValue={`${stats.totalAccounts}`}
              trendLabel="Admin + Peternak"
            />
            <StatsCard
              label="Admin"
              value={stats.adminAccounts ?? 0}
              icon={<ShieldCheck size={18} />}
              accent="amber"
              trend="neutral"
              trendValue={`${stats.adminAccounts ?? 0}`}
              trendLabel="Total admin terdaftar"
            />
            <StatsCard
              label="Peternak"
              value={stats.peternakAccounts ?? 0}
              icon={<UserCheck size={18} />}
              accent="violet"
              trend="neutral"
              trendValue={`${stats.peternakAccounts ?? 0}`}
              trendLabel="Total peternak terdaftar"
            />
            <StatsCard
              label="Ratio Peternak/Admin"
              value={stats.ratio ?? "—"}
              icon={<Package size={18} />}
              accent="blue"
              trend="neutral"
              trendValue="—"
              trendLabel="Rata-rata per admin"
            />
          </>
        ) : (
          <>
            <StatsCard
              label="Total Peternak"
              value={stats.totalAccounts}
              icon={<Users size={18} />}
              accent="green"
              trend="neutral"
              trendValue={`${stats.totalAccounts}`}
              trendLabel="Peternak Anda"
            />
            <StatsCard
              label="Sudah Punya Unit"
              value={stats.withUnit ?? 0}
              icon={<UserCheck size={18} />}
              accent="blue"
              trend="neutral"
              trendValue={stats.unitRatio ?? "0%"}
              trendLabel="Dari total peternak"
            />
            <StatsCard
              label="Total Node"
              value={stats.totalNodes ?? 0}
              icon={<Package size={18} />}
              accent="violet"
              trend="neutral"
              trendValue={`${stats.totalNodes ?? 0}`}
              trendLabel="Node di unit peternak"
            />
            <StatsCard
              label="Belum Ada Unit"
              value={stats.withoutUnit ?? 0}
              icon={<ShieldCheck size={18} />}
              accent="amber"
              trend={(stats.withoutUnit ?? 0) > 0 ? "down" : "neutral"}
              trendValue={`${stats.withoutUnit ?? 0}`}
              trendLabel="Perlu assign unit"
            />
          </>
        )}
      </div>

      {/* ── User Table Card ── */}
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
              All Users
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Click on a row or action buttons to manage users
            </p>
          </div>
        </div>

        <UserTable />
      </Card>
    </RoleGuard>
  );
}