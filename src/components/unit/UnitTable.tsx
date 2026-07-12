// components/units/UnitTable.tsx
"use client";

import { useState } from "react";
import {
  Search, Plus, Pencil, Trash2,
  ChevronUp, ChevronDown, ChevronsUpDown,
  X, Loader2, Package, Wifi, WifiOff,
  MapPin, Cpu, Server, Tractor, User,
} from "lucide-react";
import { useUnits, useDeleteUnit } from "@/hooks/useUnit";
import { useCurrentUser } from "@/hooks/useAuth";
import type { AppUnit } from "@/types/unit";
import { UnitFormPage } from "./UnitFormPage";
import { UnitDeletePage } from "./UnitDeletePage";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "unitId" | "location";
type SortDir   = "asc" | "desc" | null;
type PageView  = "table" | "add" | "edit" | "delete";

// ─── SortIcon ─────────────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }: {
  field: SortField; sortField: SortField | null; sortDir: SortDir;
}) {
  if (sortField !== field) return <ChevronsUpDown size={11} className="text-slate-300" />;
  return sortDir === "asc"
    ? <ChevronUp size={11} className="text-green-600" />
    : <ChevronDown size={11} className="text-green-600" />;
}

// ─── UnitAvatar ───────────────────────────────────────────────────────────────

function UnitAvatar({ unitId }: { unitId: string }) {
  const letter = unitId[0]?.toUpperCase() ?? "U";
  return (
    <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-white font-mono">{letter}</span>
    </div>
  );
}

// ─── NodePills ────────────────────────────────────────────────────────────────

function NodePills({ unit }: { unit: AppUnit }) {
  const esp32 = unit.nodes?.find((n) => n.nodeType === "esp32");
  const rpi   = unit.nodes?.find((n) => n.nodeType === "raspberry");

  if (!esp32 && !rpi) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap">
        <Package size={11} />
        Belum ada node
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {esp32 && (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border w-fit whitespace-nowrap ${
          esp32.status === "online"
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-slate-100 bg-slate-50 text-slate-400"
        }`}>
          <Cpu size={10} />
          ESP32 · {esp32.status}
        </span>
      )}
      {rpi && (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border w-fit whitespace-nowrap ${
          rpi.status === "online"
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-slate-100 bg-slate-50 text-slate-400"
        }`}>
          <Server size={10} />
          RPi · {rpi.status}
        </span>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function UnitTable() {
  const { units, isLoading, isError } = useUnits(30_000);
  const { user: currentUser } = useCurrentUser();
  const deleteUnit = useDeleteUnit();

  const isSuperadmin = currentUser?.role === "superadmin";
  const isAdmin      = currentUser?.role === "admin";

  const [view,       setView]       = useState<PageView>("table");
  const [activeUnit, setActiveUnit] = useState<AppUnit | null>(null);
  const [search,     setSearch]     = useState("");
  const [sortField,  setSortField]  = useState<SortField | null>(null);
  const [sortDir,    setSortDir]    = useState<SortDir>(null);

  // ── Sort ───────────────────────────────────────────────────────────────────

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortField(null); setSortDir(null); }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = units
    .filter((u) =>
      u.unitId.toLowerCase().includes(search.toLowerCase()) ||
      (u.location  ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.name      ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.admin?.username    ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.operator?.username ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField || !sortDir) return 0;
      const av = String(a[sortField] ?? "").toLowerCase();
      const bv = String(b[sortField] ?? "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goAdd    = ()           => { setActiveUnit(null); setView("add"); };
  const goEdit   = (u: AppUnit) => { setActiveUnit(u);   setView("edit"); };
  const goDelete = (u: AppUnit) => { setActiveUnit(u);   setView("delete"); };
  const goTable  = ()           => { setActiveUnit(null); setView("table"); };

  const handleDelete = async () => {
    if (!activeUnit) return;
    await deleteUnit.mutateAsync(activeUnit.id);
    goTable();
  };

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Memuat data unit...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <X size={20} className="text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-500">Gagal memuat data unit</p>
        <p className="text-xs text-slate-400">Periksa koneksi atau coba refresh halaman</p>
      </div>
    );
  }

  // ── Full-page views ────────────────────────────────────────────────────────

  if (view === "add" || view === "edit") {
    return (
      <UnitFormPage
        editUnit={view === "edit" ? activeUnit : null}
        onBack={goTable}
      />
    );
  }

  if (view === "delete" && activeUnit) {
    return (
      <UnitDeletePage
        unit={activeUnit}
        isPending={deleteUnit.isPending}
        onConfirm={handleDelete}
        onBack={goTable}
      />
    );
  }

  // ── Table view ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari unit ID, lokasi, admin, atau peternak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        {isSuperadmin && (
          <button
            onClick={goAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors flex-shrink-0 shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            Tambah Unit
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "17%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "13%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100">
              <th
                onClick={() => handleSort("unitId")}
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60 cursor-pointer select-none hover:text-slate-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Unit <SortIcon field="unitId" sortField={sortField} sortDir={sortDir} />
                </div>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                Status
              </th>
              <th
                onClick={() => handleSort("location")}
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60 cursor-pointer select-none hover:text-slate-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Lokasi <SortIcon field="location" sortField={sortField} sortDir={sortDir} />
                </div>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <div className="flex items-center gap-1.5"><User size={11} /> Admin</div>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <div className="flex items-center gap-1.5"><Tractor size={11} /> Peternak</div>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                Nodes
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Package size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {search ? "Tidak ada unit ditemukan" : "Belum ada unit terdaftar"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search
                          ? "Coba ubah kata kunci pencarian"
                          : isSuperadmin
                          ? "Klik tambah unit untuk memulai"
                          : "Hubungi superadmin untuk menambah unit"}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Unit */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3.5 pr-2">
                      <UnitAvatar unitId={unit.unitId} />
                      <div>
                        <p className="font-mono font-bold text-slate-800 text-sm leading-tight">
                          {unit.unitId}
                        </p>
                        {unit.name ? (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{unit.name}</p>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md mt-0.5 text-slate-500 bg-slate-50">
                            <Package size={9} /> Unit
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      unit.status === "online"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}>
                      {unit.status === "online" ? <Wifi size={9} /> : <WifiOff size={9} />}
                      {unit.status}
                    </span>
                  </td>

                  {/* Lokasi */}
                  <td className="px-5 py-3.5">
                    {unit.location ? (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={11} className="flex-shrink-0 text-slate-400" />
                        <span className="text-xs truncate">{unit.location}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>

                  {/* Admin */}
                  <td className="px-5 py-3.5">
                    {unit.admin ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-blue-700">
                            {unit.admin.username[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {unit.admin.username}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                        <User size={10} />
                        Belum ada
                      </span>
                    )}
                  </td>

                  {/* operator */}
                  <td className="px-5 py-3.5">
                    {unit.operator ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-lime-700">
                            {unit.operator.username[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {unit.operator.username}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                        <Tractor size={10} />
                        Belum ada
                      </span>
                    )}
                  </td>

                  {/* Nodes */}
                  <td className="px-5 py-3.5">
                    <NodePills unit={unit} />
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {(isSuperadmin || isAdmin) && (
                        <button
                          onClick={() => goEdit(unit)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                      {isSuperadmin && (
                        <button
                          onClick={() => goDelete(unit)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 px-1">
          Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> dari{" "}
          <span className="font-semibold text-slate-600">{units.length}</span> unit
        </p>
      )}
    </>
  );
}