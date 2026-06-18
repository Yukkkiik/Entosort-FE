"use client";

import { useState, useCallback, useEffect } from "react";
import { Bug, Sprout, FileWarning, Layers3, Activity, TrendingUp } from "lucide-react";
import SummaryCard from "@/components/monitoring/SummaryCard";
import HarvestFilter from "@/components/reports/ReportFilter";
import HarvestTable from "@/components/reports/ActivityTable";
import { useHarvestLogs, useHarvestStats } from "@/hooks/useHarvest";
import { useUnits } from "@/hooks/useUnit";
import { useCurrentUser } from "@/hooks/useAuth";
import { reportApi } from "@/api/reportApi";

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}
function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Shape error response dari backend (axios wraps ini di err.response.data)
interface ApiErrorResponse {
  success: boolean;
  message: string;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    err !== null &&
    typeof err === "object" &&
    "response" in err
  ) {
    const response = (err as { response?: { data?: unknown } }).response;
    const data = response?.data;

    // Backend kadang return Blob kalau responseType:"blob" tapi status error
    if (data instanceof Blob) return "Tidak ada data pada filter yang dipilih.";

    if (
      data !== null &&
      typeof data === "object" &&
      "message" in data
    ) {
      return (data as ApiErrorResponse).message ?? fallback;
    }
  }
  return fallback;
}

export default function HistoryDashboard() {
  const { isAdmin } = useCurrentUser();

  const [from,        setFrom]        = useState(defaultFrom());
  const [to,          setTo]          = useState(defaultTo());
  const [unitId,      setUnitId]      = useState("");
  const [page,        setPage]        = useState(1);
  const [isExporting, setIsExporting] = useState<"pdf" | "xlsx" | null>(null);

  const { units } = useUnits();

  // Kalau peternak hanya punya 1 unit, auto-select
  useEffect(() => {
    if (!isAdmin && units?.length === 1 && !unitId) {
      setUnitId(units[0].unitId);
    }
  }, [units, isAdmin, unitId]);

  const filters     = { from, to, unitId: unitId || undefined, page, limit: 20 };
  const statFilters = { from, to, unitId: unitId || undefined };

  const { data: logsData, isLoading: logsLoading } = useHarvestLogs(filters);
  const { data: stats,    isLoading: statsLoading } = useHarvestStats(statFilters);

  const logs        = Array.isArray(logsData) ? logsData : (logsData?.data ?? []);
  const pagination  = Array.isArray(logsData) ? null : logsData?.pagination;
  const total       = pagination?.total      ?? logs.length;
  const totalPages  = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page       ?? page;

  const handleReset = () => {
    setFrom(defaultFrom());
    setTo(defaultTo());
    setUnitId(!isAdmin && units?.length === 1 ? units[0].unitId : "");
    setPage(1);
  };

  const handleFromChange = (v: string) => { setFrom(v);   setPage(1); };
  const handleToChange   = (v: string) => { setTo(v);     setPage(1); };
  const handleUnitChange = (v: string) => { setUnitId(v); setPage(1); };

  const handleExportPdf = useCallback(async () => {
    setIsExporting("pdf");
    try {
      const blob     = await reportApi.exportPdf({ from, to, unitId: unitId || undefined });
      const filename = `laporan_panen_${from}_${to}.pdf`;
      downloadBlob(blob, filename);
    } catch (err) {
      alert(extractErrorMessage(err, "Gagal export PDF. Coba lagi."));
    } finally {
      setIsExporting(null);
    }
  }, [from, to, unitId]);

  const handleExportXlsx = useCallback(async () => {
    setIsExporting("xlsx");
    try {
      const blob     = await reportApi.exportXlsx({ from, to, unitId: unitId || undefined });
      const filename = `laporan_panen_${from}_${to}.xlsx`;
      downloadBlob(blob, filename);
    } catch (err) {
      alert(extractErrorMessage(err, "Gagal export Excel. Coba lagi."));
    } finally {
      setIsExporting(null);
    }
  }, [from, to, unitId]);

  return (
    <div className="mt-6 space-y-6">
      <HarvestFilter
        from={from}
        to={to}
        unitId={unitId}
        units={units ?? []}
        isAdmin={isAdmin}
        isExporting={isExporting}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onUnitChange={handleUnitChange}
        onReset={handleReset}
        onExportPdf={handleExportPdf}
        onExportXlsx={handleExportXlsx}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Bug}
          label="Total Larva"
          value={statsLoading ? "—" : (stats?.totalLarva ?? 0).toLocaleString()}
          trend={statsLoading ? "..." : `~${stats?.avgLarvaPerSession ?? 0}/sesi`}
        />
        <SummaryCard
          icon={Sprout}
          label="Total Prepupa"
          value={statsLoading ? "—" : (stats?.totalPrepupa ?? 0).toLocaleString()}
          trend={statsLoading ? "..." : `~${stats?.avgPrepupaPerSession ?? 0}/sesi`}
        />
        <SummaryCard
          icon={FileWarning}
          label="Total Reject"
          value={statsLoading ? "—" : (stats?.totalReject ?? 0).toLocaleString()}
          trend={statsLoading ? "..." : `${stats?.successRate ?? 0}% success`}
        />
        <SummaryCard
          icon={Layers3}
          label="Total Sesi"
          value={statsLoading ? "—" : (stats?.totalSessions ?? 0).toString()}
          trend={statsLoading ? "..." : `${(stats?.totalHarvested ?? 0).toLocaleString()} total`}
        />
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-lime-950/5 backdrop-blur-xl md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-lime-600" />
              <h2 className="text-lg font-bold text-gray-950">Riwayat Sortir</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Log sesi sortir, hasil klasifikasi, dan catatan produksi.
            </p>
          </div>

          {!logsLoading && total > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>
                <span className="font-bold text-gray-700">{total}</span> records ditemukan
              </span>
            </div>
          )}
        </div>

        <HarvestTable
          data={logs}
          isLoading={logsLoading}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}