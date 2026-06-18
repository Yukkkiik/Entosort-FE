// components/units/UnitFormPage.tsx
"use client";

import { useState } from "react";
import {
  ArrowLeft, Package, MapPin,
  Check, Loader2, AlertCircle, Plus, Pencil,
  User, Tractor,
} from "lucide-react";
import { useCreateUnit, useUpdateUnit, useAssignAdmin, useRemoveAdmin, useAssignPeternak, useRemovePeternak } from "@/hooks/useUnit";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useAuth";
import type { AppUnit } from "@/types/unit";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  editUnit: AppUnit | null;
  onBack:   () => void;
  isMutating?: boolean;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function UnitFormPage({ editUnit, onBack }: Props) {
  const isEdit = !!editUnit;
  const { user: currentUser } = useCurrentUser();
  const isSuperadmin = currentUser?.role === "superadmin";
  const isAdmin      = currentUser?.role === "admin";

  const createUnit     = useCreateUnit();
  const updateUnit     = useUpdateUnit();
  const assignAdmin    = useAssignAdmin();
  const removeAdmin    = useRemoveAdmin();
  const assignPeternak = useAssignPeternak();
  const removePeternak = useRemovePeternak();

  const { data: allUsers = [] } = useUsers();

  // Filter admin dan peternak yang tersedia
  const admins    = allUsers.filter((u) => u.role === "admin");
  const peternaks = allUsers.filter((u) => u.role === "peternak");

  // ── Form state ─────────────────────────────────────────────────────────────

  const [unitId,   setUnitId]   = useState(editUnit?.unitId   ?? "");
  const [location, setLocation] = useState(editUnit?.location ?? "");
  const [error,    setError]    = useState("");

  // ── Assign state (superadmin only) ─────────────────────────────────────────

  const [selectedAdminId,    setSelectedAdminId]    = useState<number | "">(editUnit?.adminId    ?? "");
  const [selectedPeternakId, setSelectedPeternakId] = useState<number | "">(editUnit?.peterId    ?? "");

  const isMutating =
    createUnit.isPending     ||
    updateUnit.isPending     ||
    assignAdmin.isPending    ||
    removeAdmin.isPending    ||
    assignPeternak.isPending ||
    removePeternak.isPending;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isEdit && !unitId.trim()) { setError("Unit ID wajib diisi."); return; }
    setError("");

    try {
      let savedUnitId: string;

      if (isEdit) {
        await updateUnit.mutateAsync({
          id: editUnit.id,
          payload: {
            ...(location.trim() && { location }),
          },
        });
        savedUnitId = editUnit.unitId;
      } else {
        const created = await createUnit.mutateAsync({
          unitId: unitId.trim(),
          ...(location.trim() && { location }),
          ...(isSuperadmin && selectedAdminId ? { adminId: Number(selectedAdminId) } : {}),
        });
        savedUnitId = created.unitId;
      }

      // Handle assign/remove admin (superadmin only, saat edit)
      if (isSuperadmin && isEdit) {
        const prevAdminId = editUnit.adminId;
        const newAdminId  = selectedAdminId ? Number(selectedAdminId) : null;

        if (prevAdminId && prevAdminId !== newAdminId) {
          await removeAdmin.mutateAsync(savedUnitId);
        }
        if (newAdminId && newAdminId !== prevAdminId) {
          await assignAdmin.mutateAsync({ unitId: savedUnitId, payload: { adminId: newAdminId } });
        }
      }

      // Handle assign/remove peternak (superadmin & admin pemilik, saat edit)
      if (isEdit && (isSuperadmin || isAdmin)) {
        const prevPeterId = editUnit.peterId;
        const newPeterId  = selectedPeternakId ? Number(selectedPeternakId) : null;

        if (prevPeterId && prevPeterId !== newPeterId) {
          await removePeternak.mutateAsync(savedUnitId);
        }
        if (newPeterId && newPeterId !== prevPeterId) {
          await assignPeternak.mutateAsync({
            unitId: savedUnitId,
            payload: { peterId: newPeterId },
          });
        }
      }

      onBack();
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
            {isEdit ? "Edit Unit" : "Tambah Unit Baru"}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {isEdit ? "Perbarui data unit dan assign pengguna" : "Daftarkan unit BSF AutoSort baru"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 items-start gap-5">
        {/* ── Main form ── */}
        <div className="col-span-3 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-700">
              {isEdit ? <Pencil size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isEdit ? "Edit Unit" : "Data Unit"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {isEdit ? "Unit ID tidak bisa diubah setelah terdaftar" : "Unit ID harus unik dan sesuai konfigurasi hardware"}
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

            {/* Unit ID */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Unit ID
                {isEdit && <span className="ml-2 text-xs font-normal text-slate-400">— tidak bisa diubah</span>}
              </label>
              <div className="relative">
                <Package size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={isEdit ? editUnit.unitId : unitId}
                  onChange={(e) => !isEdit && setUnitId(e.target.value.toUpperCase())}
                  disabled={isEdit}
                  placeholder="contoh: UNIT-BSF-001"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 font-mono text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              {!isEdit && (
                <p className="text-xs text-slate-400">Harus sama persis dengan konfigurasi firmware ESP32 dan RPi.</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Lokasi <span className="text-xs font-normal text-slate-400">— opsional</span>
              </label>
              <div className="relative">
                <MapPin size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="contoh: Kandang B, Blok 3"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-50"
                />
              </div>
            </div>

            {/* Info node */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Info Node</p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Node (ESP32 & Raspberry Pi) tidak perlu didaftarkan manual. Node akan otomatis terdaftar saat hardware dinyalakan dan terhubung ke broker MQTT.
              </p>
            </div>
          </div>
        </div>

        {/* ── Assign panel (superadmin & admin) ── */}
        <div className="col-span-2 space-y-4">

          {/* Assign Admin — superadmin only */}
          {isSuperadmin && (
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-blue-50 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700">
                  <User size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Assign Admin</p>
                  <p className="mt-0.5 text-xs text-blue-600">Pilih admin pengelola unit ini</p>
                </div>
              </div>
              <div className="px-5 py-4">
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                >
                  <option value="">— Tidak ada admin —</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>{a.username}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Assign Peternak — superadmin & admin */}
          {(isSuperadmin || isAdmin) && isEdit && (
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-lime-50 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-700">
                  <Tractor size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-lime-900">Assign Peternak</p>
                  <p className="mt-0.5 text-xs text-lime-600">Satu unit, satu peternak</p>
                </div>
              </div>
              <div className="px-5 py-4">
                <select
                  value={selectedPeternakId}
                  onChange={(e) => setSelectedPeternakId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-lime-400 focus:ring-2 focus:ring-lime-50"
                >
                  <option value="">— Tidak ada peternak —</option>
                  {peternaks.map((p) => (
                    <option key={p.id} value={p.id}>{p.username}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  Hanya peternak yang belum memiliki unit yang ditampilkan.
                </p>
              </div>
            </div>
          )}

          {/* Placeholder kalau peternak dan tidak ada panel assign */}
          {!isSuperadmin && !isAdmin && (
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-400">Anda tidak memiliki akses untuk assign pengguna ke unit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
        <p className="text-xs text-slate-400">
          {isEdit
            ? "Perubahan akan langsung aktif setelah disimpan"
            : "Unit baru akan aktif setelah hardware terhubung via MQTT"}
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
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMutating ? (
              <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
            ) : (
              <><Check size={14} strokeWidth={2.5} /> {isEdit ? "Simpan Perubahan" : "Tambah Unit"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}