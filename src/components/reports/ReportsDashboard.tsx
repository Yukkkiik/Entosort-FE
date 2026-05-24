"use client";

import { useState, useCallback } from "react";
import { Bug, Sprout, FileWarning, Layers3, Activity, TrendingUp } from "lucide-react";
import SummaryCard from "@/components/monitoring/SummaryCard";
import HarvestFilter from "@/components/reports/ReportFilter";
import HarvestTable from "@/components/reports/ActivityTable";
import { useHarvestLogs, useHarvestStats } from "@/hooks/useHarvest";
import { useNodes } from "@/hooks/useNode";
import { harvestApi } from "@/api/harvestApi";
import { exportHarvestPdf } from "@/lib/exportPdf";

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}
function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export default function HistoryDashboard() {
  
  const [from,        setFrom]        = useState(defaultFrom());
  const [to,          setTo]          = useState(defaultTo());
  const [nodeId,      setNodeId]      = useState("");
  const [page,        setPage]        = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const filters     = { from, to, nodeId: nodeId || undefined, page, limit: 20 };
  const statFilters = { from, to, nodeId: nodeId || undefined };

  const { data: logsData,  isLoading: logsLoading  } = useHarvestLogs(filters);
  const { data: stats,     isLoading: statsLoading  } = useHarvestStats(statFilters);
  const { nodes }                                     = useNodes(0);

  // ── Safe accessors — defensive terhadap bentuk response apapun ─────────────
  const logs       = Array.isArray(logsData) ? logsData : (logsData?.data ?? []);
  const pagination = Array.isArray(logsData) ? null : logsData?.pagination;
  const total      = pagination?.total      ?? logs.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page      ?? page;

  const handleReset = () => {
    setFrom(defaultFrom());
    setTo(defaultTo());
    setNodeId("");
    setPage(1);
  };

  const handleFromChange = (v: string) => { setFrom(v);   setPage(1); };
  const handleToChange   = (v: string) => { setTo(v);     setPage(1); };
  const handleNodeChange = (v: string) => { setNodeId(v); setPage(1); };

  // ── Export PDF ─────────────────────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    if (!stats) return;
    setIsExporting(true);
    try {
      const allLogs = await harvestApi.getAll({
        from,
        to,
        nodeId: nodeId || undefined,
        page:   1,
        limit:  9999,
      });
      const exportData = allLogs?.data ?? (Array.isArray(allLogs) ? allLogs : []);
      await exportHarvestPdf(exportData, stats, { from, to, nodeId: nodeId || undefined });
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("Gagal export PDF. Coba lagi.");
    } finally {
      setIsExporting(false);
    }
  }, [from, to, nodeId, stats]);

  return (
    <div className="mt-6 space-y-6">

      {/* Filter */}
      <HarvestFilter
        from={from}
        to={to}
        nodeId={nodeId}
        nodes={nodes}
        isExporting={isExporting}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onNodeChange={handleNodeChange}
        onReset={handleReset}
        onExport={handleExport}
      />

      {/* Stats cards */}
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

      {/* Table */}
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

          {/* Hanya tampil kalau sudah ada data */}
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