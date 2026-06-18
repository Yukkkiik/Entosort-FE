"use client";

// components/users/UserTable.tsx
import { useState } from "react";
import {
  Search, UserPlus, Pencil, Trash2,
  ChevronUp, ChevronDown, ChevronsUpDown,
  X, Tractor, Loader2, Phone, Calendar, Package,
  Wifi, WifiOff, User,
} from "lucide-react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { useAssignPeternak, useRemovePeternak, useAssignAdmin, useRemoveAdmin } from "@/hooks/useUnit";
import { useCurrentUser } from "@/hooks/useAuth";
import type { AppUser, CreateUserPayload, UpdateUserPayload } from "@/types/user";
import { Avatar } from "./Avatar";
import { UserFormPage } from "./UserFormPage";
import { DeletePage } from "./DeletePage";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "username" | "phone";
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

// ─── UnitBadge ────────────────────────────────────────────────────────────────
// Menampilkan info unit dari peternakUnit (1 unit) atau adminUnits (banyak unit)

function UnitBadge({ user, targetRole }: { user: AppUser; targetRole: "admin" | "peternak" }) {
  if (targetRole === "peternak") {
    const unit = user.peternakUnit;
    if (!unit) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
          <Package size={11} />
          Belum ada unit
        </span>
      );
    }
    const online  = unit.nodes.filter((n) => n.status === "online").length;
    const offline = unit.nodes.length - online;
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg font-semibold w-fit">
          <Package size={11} />
          {unit.unitId}
        </span>
        <div className="flex items-center gap-2 pl-0.5">
          {online > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <Wifi size={9} /> {online} online
            </span>
          )}
          {offline > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <WifiOff size={9} /> {offline} offline
            </span>
          )}
        </div>
      </div>
    );
  }

  // Admin — adminUnits[]
  const units = user.adminUnits ?? [];
  if (units.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
        <Package size={11} />
        Belum ada unit
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg font-semibold w-fit">
        <Package size={11} />
        {units.length} unit
      </span>
      <div className="flex flex-wrap gap-1 pl-0.5">
        {units.slice(0, 2).map((u) => (
          <span key={u.unitId} className="text-[10px] text-slate-500 font-mono">{u.unitId}</span>
        ))}
        {units.length > 2 && (
          <span className="text-[10px] text-slate-400">+{units.length - 2} lainnya</span>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function UserTable() {
  const { data: allUsers = [], isLoading, isError } = useUsers();
  const { role } = useCurrentUser();

  const createUser     = useCreateUser();
  const updateUser     = useUpdateUser();
  const deleteUser     = useDeleteUser();
  const assignPeternak = useAssignPeternak();
  const removePeternak = useRemovePeternak();
  const assignAdmin    = useAssignAdmin();
  const removeAdmin    = useRemoveAdmin();

  const [view,       setView]       = useState<PageView>("table");
  const [activeUser, setActiveUser] = useState<AppUser | null>(null);
  const [search,     setSearch]     = useState("");
  const [sortField,  setSortField]  = useState<SortField | null>(null);
  const [sortDir,    setSortDir]    = useState<SortDir>(null);

  // ── Filter berdasarkan role yang login ─────────────────────────────────────

  const targetRole  = role === "superadmin" ? "admin" : "peternak";
  const entityLabel = role === "superadmin" ? "Admin" : "Peternak";

  const users = allUsers.filter((u) => {
    if (u.role !== targetRole) return false;
    return true;
  });

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

  const filtered = users
    .filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone ?? "").includes(search)
    )
    .sort((a, b) => {
      if (!sortField || !sortDir) return 0;
      const av = String(a[sortField] ?? "").toLowerCase();
      const bv = String(b[sortField] ?? "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goAdd    = ()           => { setActiveUser(null); setView("add"); };
  const goEdit   = (u: AppUser) => { setActiveUser(u);    setView("edit"); };
  const goDelete = (u: AppUser) => { setActiveUser(u);    setView("delete"); };
  const goTable  = ()           => { setActiveUser(null); setView("table"); };

  // ── Submit ─────────────────────────────────────────────────────────────────
  // Logika assign/remove unit dilakukan di sini berdasarkan diff selectedUnits

  const handleSubmit = async (
    form: { username: string; password: string; phone: string },
    selectedUnits: string[],
  ): Promise<void> => {
    let userId: number;

    if (activeUser) {
      const payload: UpdateUserPayload = {
        username: form.username,
        phone:    form.phone,
        role:     targetRole,
      };
      if (form.password.trim()) payload.password = form.password;

      const updated = await updateUser.mutateAsync({ id: activeUser.id, payload });
      userId = updated.id;
    } else {
      const created = await createUser.mutateAsync({
        username: form.username,
        password: form.password,
        phone:    form.phone,
        role:     targetRole,
      } as CreateUserPayload);
      userId = created.id;
    }

    if (targetRole === "admin") {
      // Hitung diff untuk adminUnits
      const originalUnits = activeUser
        ? (activeUser.adminUnits ?? []).map((u) => u.unitId)
        : [];
      const toAdd    = selectedUnits.filter((id) => !originalUnits.includes(id));
      const toRemove = originalUnits.filter((id) => !selectedUnits.includes(id));

      for (const unitId of toAdd) {
        await assignAdmin.mutateAsync({ unitId, payload: { adminId: userId } });
      }
      for (const unitId of toRemove) {
        await removeAdmin.mutateAsync(unitId);
      }
    } else {
      // Peternak hanya 1 unit — cek apakah perlu swap
      const currentUnitId = activeUser?.peternakUnit?.unitId ?? null;
      const newUnitId     = selectedUnits[0] ?? null;

      if (currentUnitId && currentUnitId !== newUnitId) {
        await removePeternak.mutateAsync(currentUnitId);
      }
      if (newUnitId && newUnitId !== currentUnitId) {
        await assignPeternak.mutateAsync({ unitId: newUnitId, payload: { peterId: userId } });
      }
    }

    goTable();
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!activeUser) return;
    await deleteUser.mutateAsync(activeUser.id);
    goTable();
  };

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Memuat data {entityLabel.toLowerCase()}...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <X size={20} className="text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-500">Gagal memuat data</p>
        <p className="text-xs text-slate-400">Periksa koneksi atau coba refresh halaman</p>
      </div>
    );
  }

  const isMutating =
    createUser.isPending    ||
    updateUser.isPending    ||
    assignPeternak.isPending ||
    removePeternak.isPending ||
    assignAdmin.isPending   ||
    removeAdmin.isPending;

  // ── Full-page views ────────────────────────────────────────────────────────

  if (view === "add" || view === "edit") {
    return (
      <UserFormPage
        editUser={view === "edit" ? activeUser : null}
        onBack={goTable}
        onSubmit={handleSubmit}
        isMutating={isMutating}
        showUnitAssignment={true}
      />
    );
  }

  if (view === "delete" && activeUser) {
    return (
      <DeletePage
        user={activeUser}
        isPending={deleteUser.isPending}
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
            placeholder="Cari username atau nomor HP..."
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
        <button
          onClick={goAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors flex-shrink-0 shadow-sm"
        >
          <UserPlus size={15} strokeWidth={2.5} />
          Tambah {entityLabel}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100">
              <th
                onClick={() => handleSort("username")}
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60 cursor-pointer select-none hover:text-slate-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {entityLabel} <SortIcon field="username" sortField={sortField} sortDir={sortDir} />
                </div>
              </th>
              <th
                onClick={() => handleSort("phone")}
                className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60 cursor-pointer select-none hover:text-slate-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  No. HP <SortIcon field="phone" sortField={sortField} sortDir={sortDir} />
                </div>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                Terdaftar
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <div className="flex items-center gap-1.5"><Package size={11} /> Unit</div>
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      {targetRole === "peternak"
                        ? <Tractor size={20} className="text-slate-300" />
                        : <User size={20} className="text-slate-300" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {search
                          ? `Tidak ada ${entityLabel.toLowerCase()} ditemukan`
                          : `Belum ada ${entityLabel.toLowerCase()} terdaftar`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search
                          ? "Coba ubah kata kunci pencarian"
                          : `Klik tambah ${entityLabel.toLowerCase()} untuk memulai`}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar username={user.username} />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{user.username}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md mt-0.5
                          ${targetRole === "admin"
                            ? "text-blue-700 bg-blue-50"
                            : "text-lime-700 bg-lime-50"
                          }`}>
                          {targetRole === "admin"
                            ? <><User size={9} /> Admin</>
                            : <><Tractor size={9} /> Peternak</>
                          }
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-xs truncate">{user.phone ?? "—"}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <UnitBadge user={user} targetRole={targetRole} />
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => goEdit(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => goDelete(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
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
          <span className="font-semibold text-slate-600">{users.length}</span> {entityLabel.toLowerCase()}
        </p>
      )}
    </>
  );
}