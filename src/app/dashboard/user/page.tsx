"use client";

import StatsCard from "@/components/monitoring/StatsCard";
import Card from "@/components/ui/Card";
import UserTable from "@/components/users/UserTable";
import { useSetHeader } from "@/components/layout/HeaderContext";
import { Users, Download, RotateCcw, Wifi, UserCheck, ShieldCheck } from "lucide-react";

export default function UserPage() {
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
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 opacity-0 animate-[fadeSlideUp_0.5s_ease_0.1s_forwards]">
        <StatsCard
          label="Total Accounts"
          value={5}
          icon={<Users size={18} />}
          accent="green"
          trend="up"
          trendValue="+1"
          trendLabel="Since last month"
        />
        <StatsCard
          label="Active Sessions"
          value={2}
          icon={<Wifi size={18} />}
          accent="blue"
          trend="neutral"
          trendValue="—"
          trendLabel="No change today"
        />
        <StatsCard
          label="Active Users"
          value={3}
          icon={<UserCheck size={18} />}
          accent="violet"
          trend="up"
          trendValue="60%"
          trendLabel="Of total accounts"
        />
        <StatsCard
          label="Admin Accounts"
          value={1}
          icon={<ShieldCheck size={18} />}
          accent="amber"
          trend="neutral"
          trendValue="—"
          trendLabel="No change"
        />
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
    </>
  );
}