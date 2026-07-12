// components/users/UserFormPage.tsx
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  User,
  Lock,
  Phone,
  Check,
  Loader2,
  AlertCircle,
  UserPlus,
  Pencil,
  Package,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useUnits } from "@/hooks/useUnit";
import { useCurrentUser } from "@/hooks/useAuth";
import type { AppUser } from "@/types/user";

// ─── Types ────────────────────────────────────────────────────────────────────

const defaultForm = {
  username: "",
  password: "",
  phone: "",
};

type TargetRole = "admin" | "operator";

interface Props {
  editUser: AppUser | null;
  onBack: () => void;
  onSubmit: (
    form: typeof defaultForm,
    selectedUnits: string[]
  ) => Promise<void>;
  isMutating: boolean;

  /**
   * true  → tampilkan kolom assign unit
   * false → hanya form data user
   */
  showUnitAssignment?: boolean;

  /**
   * superadmin → targetRole = "admin"
   * admin      → targetRole = "operator"
   */
  targetRole?: TargetRole;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function UserFormPage({
  editUser,
  onBack,
  onSubmit,
  isMutating,
  showUnitAssignment = true,
  targetRole,
}: Props) {
  const isEdit = !!editUser;
  const { user: currentUser } = useCurrentUser();

  const role = currentUser?.role;
  const isSuperadmin = role === "superadmin";
  const isAdmin      = role === "admin";

  const resolvedTargetRole: TargetRole =
    targetRole ?? (isSuperadmin ? "admin" : "operator");

  const entityLabel    = resolvedTargetRole === "admin" ? "Admin" : "operator";
  const entityLabelLow = entityLabel.toLowerCase();

  // ── Form state ─────────────────────────────────────────────────────────────

  const [form, setForm] = useState(
    isEdit
      ? { username: editUser.username, password: "", phone: editUser.phone ?? "" }
      : defaultForm
  );
  const [error, setError] = useState("");

  // ── Unit assignment state ──────────────────────────────────────────────────
  // Admin: bisa pilih banyak unit (adminUnits[])
  // Peternak: hanya 1 unit (operatorUnit)

  const getInitialUnits = (): string[] => {
    if (!isEdit) return [];
    if (resolvedTargetRole === "admin") {
      return (editUser.adminUnits ?? []).map((u) => u.unitId);
    }
    return editUser.operatorUnit ? [editUser.operatorUnit.unitId] : [];
  };

  const [selectedUnits, setSelectedUnits] = useState<string[]>(getInitialUnits);

  const { units: allUnits, isLoading: unitsLoading } = useUnits(0);

  // Filter unit yang boleh dipilih berdasarkan role
  const availableUnits = allUnits.filter((unit) => {
    if (isSuperadmin) {
      // Superadmin assign admin ke unit: tampilkan unit yang belum punya admin
      // atau sudah punya admin = user yang sedang diedit
      return (
        unit.adminId == null ||
        (isEdit && String(unit.adminId) === String(editUser?.id))
      );
    }

    if (isAdmin) {
      // Admin assign operator ke unit miliknya: tampilkan unit milik admin ini
      // yang belum punya operator, atau sudah punya operator = user yang diedit
      const milikAdmin      = String(unit.adminId) === String(currentUser?.id);
      const belumAdaOperator = unit.operatorId == null;
      const OperatorIniSendiri =
        isEdit && String(unit.operatorId) === String(editUser?.id);
      return milikAdmin && (belumAdaOperator || OperatorIniSendiri);
    }

    return false;
  });

  const set =
    (key: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // ── Unit toggle ────────────────────────────────────────────────────────────

  const toggleUnit = (unitId: string) => {
    if (resolvedTargetRole === "operator") {
      // operator hanya boleh 1 unit
      setSelectedUnits((prev) => (prev.includes(unitId) ? [] : [unitId]));
    } else {
      // Admin boleh banyak unit
      setSelectedUnits((prev) =>
        prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
      );
    }
  };

  const clearSelectedUnits = () => setSelectedUnits([]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!form.username.trim()) { setError("Username wajib diisi."); return; }
    if (!form.phone.trim())    { setError("Nomor HP wajib diisi."); return; }
    if (!isEdit && !form.password.trim()) { setError("Password wajib diisi."); return; }

    setError("");
    try {
      await onSubmit(form, selectedUnits);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          Kembali
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900">
            {isEdit ? `Edit ${entityLabel}` : `Tambah ${entityLabel} Baru`}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {isEdit
              ? `Perbarui data akun ${entityLabelLow}`
              : showUnitAssignment
              ? "Isi detail dan assign unit sekaligus"
              : `Isi detail akun ${entityLabelLow} baru`}
          </p>
        </div>
      </div>

      <div
        className={`grid items-start gap-5 ${
          showUnitAssignment ? "grid-cols-5" : "grid-cols-1 max-w-xl"
        }`}
      >
        {/* Main form */}
        <div
          className={`${
            showUnitAssignment ? "col-span-3" : "col-span-1"
          } overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm`}
        >
          <div
            className={`flex items-center gap-4 border-b px-6 py-5 ${
              isSuperadmin
                ? "border-blue-100 bg-blue-50"
                : "border-lime-100 bg-lime-50"
            }`}
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                isSuperadmin ? "bg-blue-700" : "bg-green-700"
              }`}
            >
              {isEdit ? (
                <Pencil size={16} className="text-white" />
              ) : (
                <UserPlus size={16} className="text-white" />
              )}
            </div>

            <div>
              <p className={`text-sm font-semibold ${isSuperadmin ? "text-blue-900" : "text-green-900"}`}>
                {isEdit ? `Edit ${entityLabel}` : `Data ${entityLabel}`}
              </p>
              <p className={`mt-0.5 text-xs ${isSuperadmin ? "text-blue-600" : "text-lime-700"}`}>
                {isEdit
                  ? "Kosongkan password jika tidak diubah"
                  : `Isi informasi akun ${entityLabelLow} baru`}
              </p>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                <AlertCircle size={13} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <User size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={set("username")}
                  placeholder={resolvedTargetRole === "admin" ? "contoh: admin_jakarta" : "contoh: budi_peternak"}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Password{" "}
                {isEdit && <span className="text-xs font-normal text-slate-400">— opsional</span>}
              </label>
              <div className="relative">
                <Lock size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-50"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">No. HP</label>
              <div className="relative">
                <Phone size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="contoh: 08123456789"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-50"
                />
              </div>
            </div>

            {/* Role info */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                  isSuperadmin
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-lime-200 bg-lime-50 text-lime-700"
                }`}
              >
                <User size={13} />
                {entityLabel}
              </div>
              <p className="text-xs text-slate-400">Role ditentukan otomatis berdasarkan akun Anda.</p>
            </div>
          </div>
        </div>

        {/* Unit assignment */}
        {showUnitAssignment && (
          <div className="col-span-2 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700">
                <Package size={15} className="text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">Unit</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Assign unit ke {entityLabelLow} ini
                  {resolvedTargetRole === "operator" && (
                    <span className="ml-1 text-amber-500">(maks. 1)</span>
                  )}
                </p>
              </div>

              {selectedUnits.length > 0 && (
                <span className="rounded-lg border border-green-100 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                  {selectedUnits.length} dipilih
                </span>
              )}

              {isEdit && selectedUnits.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelectedUnits}
                  className="text-xs font-semibold text-red-500 hover:underline"
                >
                  Cabut semua
                </button>
              )}
            </div>

            <div className="space-y-3 px-5 py-4">
              {unitsLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Memuat unit...</span>
                </div>
              ) : availableUnits.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Package size={16} className="text-slate-300" />
                  </div>
                  <p className="text-xs font-medium text-slate-500">Tidak ada unit tersedia</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {isSuperadmin
                      ? "Semua unit sudah terhubung ke admin lain."
                      : "Semua unit Anda sudah memiliki peternak."}
                  </p>
                </div>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {availableUnits.map((unit) => {
                    const checked = selectedUnits.includes(unit.unitId);
                    const esp32   = unit.nodes?.find((n) => n.nodeType === "esp32");
                    const rpi     = unit.nodes?.find((n) => n.nodeType === "raspberry");

                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => toggleUnit(unit.unitId)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                          checked
                            ? "border-green-300 bg-green-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            checked ? "border-green-600 bg-green-600" : "border-slate-300"
                          }`}
                        >
                          {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>

                        {/* Info unit */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-mono text-xs font-semibold text-slate-800">
                              {unit.unitId}
                            </p>
                            <span
                              className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-medium ${
                                unit.status === "online" ? "text-emerald-600" : "text-slate-400"
                              }`}
                            >
                              {unit.status === "online" ? <Wifi size={9} /> : <WifiOff size={9} />}
                              {unit.status}
                            </span>
                          </div>

                          {unit.location && (
                            <p className="mt-0.5 text-[10px] text-slate-400 truncate">{unit.location}</p>
                          )}

                          {/* Node pills */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {esp32 && (
                              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium border ${
                                esp32.status === "online"
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                  : "border-slate-100 bg-slate-50 text-slate-400"
                              }`}>
                                ESP32 · {esp32.status}
                              </span>
                            )}
                            {rpi && (
                              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium border ${
                                rpi.status === "online"
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                  : "border-slate-100 bg-slate-50 text-slate-400"
                              }`}>
                                RPi · {rpi.status}
                              </span>
                            )}
                            {!esp32 && !rpi && (
                              <span className="text-[9px] text-slate-300">Belum ada node</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Summary */}
              {selectedUnits.length > 0 && (
                <div className="border-t border-slate-100 pt-2">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Akan di-assign ({selectedUnits.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUnits.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-lg border border-green-100 bg-green-50 px-2 py-1 font-mono text-[10px] font-medium text-green-700"
                      >
                        <Package size={9} />
                        {id}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUnit(id);
                          }}
                          className="ml-0.5 rounded text-green-500 hover:text-red-500"
                        >
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
        <p className="text-xs text-slate-400">
          {showUnitAssignment
            ? selectedUnits.length > 0
              ? `${selectedUnits.length} unit akan di-assign ke ${entityLabelLow} ini`
              : "Unit bisa di-assign nanti dari halaman edit"
            : `Akun ${entityLabelLow} akan langsung aktif setelah disimpan`}
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isMutating}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isSuperadmin ? "bg-blue-700 hover:bg-blue-800" : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {isMutating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check size={14} strokeWidth={2.5} />
                {isEdit ? "Simpan Perubahan" : `Tambah ${entityLabel}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}