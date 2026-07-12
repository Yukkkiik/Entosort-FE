"use client";
 
import { useSetHeader } from "@/components/layout/HeaderContext";
import HistoryDashboard from "@/components/reports/ReportsDashboard";
import { RotateCcw, Download } from "lucide-react";
import RoleGuard from "@/lib/RoleGuard";
 
export default function HistoryPage() {
  useSetHeader({
    titleIcon: "📋",
    title: "Riwayat & History",
    subtitle: "Catatan produksi dan log sortir larva.",
    breadcrumbs: [
      { label: "EntoSort" },
      { label: "Dashboard" },
      { label: "History" },
    ],
    pollInterval: 30_000,
    actions: (
      <div className="flex items-center gap-2">
        <button
          title="Reset filter"
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
          title="Export data"
          className="
            flex items-center gap-1.5 px-3.5 py-2 rounded-xl
            bg-white border border-gray-200/80 text-gray-500 text-xs font-semibold
            hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300
            transition-all duration-200 hover:scale-105 shadow-sm
          "
        >
          <Download size={13} strokeWidth={2.5} />
          Export
        </button>
      </div>
    ),
  });
 
  return (
    <RoleGuard allowedRoles={["admin", "operator"]}>
      <HistoryDashboard />
    </RoleGuard>
  );
}