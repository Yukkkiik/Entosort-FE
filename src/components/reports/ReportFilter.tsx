"use client";
 
import { Filter, X, Download, Loader2 } from "lucide-react";
import type { NodeStatusResponse } from "@/types/node";
 
interface Props {
  from:           string;
  to:             string;
  nodeId:         string;
  nodes:          NodeStatusResponse[];
  isExporting:    boolean;
  onFromChange:   (v: string) => void;
  onToChange:     (v: string) => void;
  onNodeChange:   (v: string) => void;
  onReset:        () => void;
  onExport:       () => void;
}
 
export default function HarvestFilter({
  from, to, nodeId, nodes, isExporting,
  onFromChange, onToChange, onNodeChange, onReset, onExport,
}: Props) {
  const hasFilter = from || to || nodeId;
 
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-lime-950/5 backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-lime-600" />
          <h2 className="text-lg font-bold text-gray-950">Filter Riwayat</h2>
        </div>
        {hasFilter && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Reset filter
          </button>
        )}
      </div>
 
      <div className="grid gap-4 md:grid-cols-4">
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
 
        {/* Node */}
        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-600">Node</span>
          <select
            value={nodeId}
            onChange={(e) => onNodeChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
          >
            <option value="">Semua Node</option>
            {nodes.map((n) => (
              <option key={n.nodeId} value={n.nodeId}>
                {n.nodeId} {n.status === "online" ? "🟢" : "⚫"}
              </option>
            ))}
          </select>
        </label>
 
        {/* Export button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-lime-400 bg-white px-4 py-3 text-sm font-bold text-lime-700 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-400 hover:text-gray-950 hover:shadow-lg hover:shadow-lime-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 transition group-hover:scale-110" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}