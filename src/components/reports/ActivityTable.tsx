"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Database, Clock, FileText } from "lucide-react";
import type { HarvestLog } from "@/types/harvest";
 
type SortKey = "recordedAt" | "larvaCount" | "prepupaCount" | "rejectCount" | "totalCount" | "durationSec";
type SortDir = "asc" | "desc";
 
interface Props {
  data:       HarvestLog[];
  isLoading:  boolean;
  page:       number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

 
function StatusBadge({ total, reject }: { total: number; reject: number }) {
  const rejectRate = total > 0 ? (reject / total) * 100 : 0;
  if (total === 0)       return <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 bg-gray-100 text-gray-500 ring-gray-200">No Data</span>;
  if (rejectRate > 20)   return <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 bg-red-100 text-red-700 ring-red-200">Warning</span>;
  if (rejectRate > 5)    return <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 bg-yellow-100 text-yellow-700 ring-yellow-200">Perlu Cek</span>;
  return <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 bg-lime-100 text-lime-700 ring-lime-200">Normal</span>;
}
 
function ThBtn({ label, sortKey, onSort }: { label: string; sortKey: SortKey; onSort: (k: SortKey) => void }) {
  return (
    <th className="px-5 py-4">
      <button
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide transition hover:text-lime-700"
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );
}
 

export default function HarvestTable({ data, isLoading, page, totalPages, onPageChange }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("recordedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
 
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };
  
    
 
  const sorted = useMemo(() => [...data].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (typeof av === "number" && typeof bv === "number")
      return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  }), [data, sortKey, sortDir]);
 
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-gray-50">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
        <span className="text-sm text-gray-500">Memuat data...</span>
      </div>
    );
  }
 
  if (sorted.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Database className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Belum ada data</h3>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          Coba ubah rentang tanggal atau pilih node yang berbeda.
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <ThBtn label="Waktu"          sortKey="recordedAt"   onSort={handleSort} />
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wide">Node</th>
                <ThBtn label="Larva"          sortKey="larvaCount"   onSort={handleSort} />
                <ThBtn label="Prepupa"        sortKey="prepupaCount" onSort={handleSort} />
                <ThBtn label="Reject"         sortKey="rejectCount"  onSort={handleSort} />
                <ThBtn label="Total"          sortKey="totalCount"   onSort={handleSort} />
                <ThBtn label="Durasi"         sortKey="durationSec"  onSort={handleSort} />
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wide">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sorted.map((row) => (
                <tr key={row.id} className="transition hover:bg-lime-50/60">
                  {/* Waktu */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          {new Date(row.recordedAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(row.recordedAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
 
                  {/* Node */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
                      {row.nodeId}
                    </span>
                  </td>
 
                  {/* Counts */}
                  <td className="px-5 py-4 font-medium text-gray-700">{row.larvaCount.toLocaleString()}</td>
                  <td className="px-5 py-4 font-medium text-gray-700">{row.prepupaCount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${row.rejectCount > 0 ? "text-red-500" : "text-gray-400"}`}>
                      {row.rejectCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-950">{row.totalCount.toLocaleString()}</td>
 
                  {/* Durasi */}
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {row.durationSec != null
                      ? `${Math.floor(row.durationSec / 60)}m ${row.durationSec % 60}s`
                      : "—"}
                  </td>
 
                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge total={row.totalCount} reject={row.rejectCount} />
                  </td>
 
                  {/* Catatan */}
                  <td className="px-5 py-4 max-w-[160px]">
                    {row.notes ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500" title={row.notes}>
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{row.notes}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Halaman <span className="font-bold text-gray-900">{page}</span> dari{" "}
            <span className="font-bold text-gray-900">{totalPages}</span>
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}