// components/units/UnitFormPage.tsx
"use client";

import { useState } from "react";
import {
  ArrowLeft, Package, MapPin,
  Check, Loader2, AlertCircle, Plus, Pencil,
} from "lucide-react";
import { useCreateUnit, useUpdateUnit } from "@/hooks/useUnit";
import type { AppUnit } from "@/types/unit";

interface Props {
  editUnit: AppUnit | null;
  onBack:   () => void;
}

export function UnitFormPage({ editUnit, onBack }: Props) {
  const isEdit = !!editUnit;

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const [unitId,   setUnitId]   = useState(editUnit?.unitId   ?? "");
  const [location, setLocation] = useState(editUnit?.location ?? "");
  const [error,    setError]    = useState("");

  const isMutating = createUnit.isPending || updateUnit.isPending;

  const handleSubmit = async () => {
    if (!isEdit && !unitId.trim()) { setError("Unit ID wajib diisi."); return; }
    setError("");

    try {
      if (isEdit) {
        await updateUnit.mutateAsync({
          id: editUnit.id,
          payload: { ...(location.trim() && { location }) },
        });
      } else {
        await createUnit.mutateAsync({
          unitId: unitId.trim(),
          ...(location.trim() && { location }),
        });
      }
      onBack();
    } catch (err) {
      setError((err as Error).message);
    }
  };

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
            {isEdit ? "Perbarui data unit" : "Daftarkan unit BSF AutoSort baru"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-700">
            {isEdit ? <Pencil size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isEdit ? "Edit Unit" : "Data Unit"}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {isEdit
                ? "Unit ID tidak bisa diubah setelah terdaftar"
                : "Unit ID harus unik dan sesuai konfigurasi hardware"}
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
              <p className="text-xs text-slate-400">
                Harus sama persis dengan konfigurasi firmware ESP32 dan RPi.
              </p>
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
              Node (ESP32 & Raspberry Pi) tidak perlu didaftarkan manual. Node akan otomatis
              terdaftar saat hardware dinyalakan dan terhubung ke broker MQTT.
            </p>
          </div>
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