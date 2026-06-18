"use client";

import { Filter, X, Download, Loader2, FileSpreadsheet } from "lucide-react";
import type { AppUnit } from "@/types/unit";

interface Props {
  from:          string;
  to:            string;
  unitId:        string;
  units:         AppUnit[];
  isAdmin:       boolean;
  isExporting:   "pdf" | "xlsx" | null;
  onFromChange:  (v: string) => void;
  onToChange:    (v: string) => void;
  onUnitChange:  (v: string) => void;
  onReset:       () => void;
  onExportPdf:   () => void;
  onExportXlsx:  () => void;
}

export default function HarvestFilter({
  from, to, unitId, units, isAdmin,
  isExporting,
  onFromChange, onToChange, onUnitChange,
  onReset, onExportPdf, onExportXlsx,
}: Props) {
  const hasFilter = from || to || unitId;

  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-lime-950/5 backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-lime-600" />
          <h2 className="text-lg font-bold text-gray-950">Filter Riwayat</h2>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-red-500"
          >
            <X className="h-3.5 w-3.5" />
            Reset filter
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {/* From */}
        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-600">Dari Tanggal</span>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
          />
        </label>

        {/* To */}
        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-600">Sampai Tanggal</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
          />
        </label>

        {/* Unit */}
        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-600">Unit</span>
          <select
            value={unitId}
            onChange={(e) => onUnitChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
          >
            {/* Admin bisa pilih "Semua Unit", peternak tidak (hanya punya 1) */}
            {isAdmin && <option value="">Semua Unit</option>}
            {units.map((u) => (
              <option key={u.unitId} value={u.unitId}>
                {u.unitId} {u.status === "online" ? "🟢" : "⚫"}
                {u.location ? ` — ${u.location}` : ""}
              </option>
            ))}
          </select>
        </label>

        {/* Export PDF */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExporting !== null}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-lime-400 bg-white px-4 py-3 text-sm font-bold text-lime-700 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-400 hover:text-gray-950 hover:shadow-lg hover:shadow-lime-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isExporting === "pdf" ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Download className="h-4 w-4 transition group-hover:scale-110" />Export PDF</>
            )}
          </button>
        </div>

        {/* Export Excel */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onExportXlsx}
            disabled={isExporting !== null}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400 bg-white px-4 py-3 text-sm font-bold text-emerald-700 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:text-gray-950 hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isExporting === "xlsx" ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><FileSpreadsheet className="h-4 w-4 transition group-hover:scale-110" />Export Excel</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}