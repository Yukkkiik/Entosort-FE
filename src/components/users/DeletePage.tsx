// components/users/DeletePage.tsx
"use client";

import { ArrowLeft, Trash2, Phone, Loader2, AlertTriangle } from "lucide-react";
import { Avatar } from "./Avatar";
import type { AppUser } from "@/types/user";

interface Props {
  user: AppUser;
  isPending: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function DeletePage({ user, isPending, onConfirm, onBack }: Props) {
  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={14} />
          Kembali
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900">Hapus Peternak</h1>
          <p className="text-xs text-slate-400 mt-0.5">Konfirmasi penghapusan akun peternak</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="bg-red-50 border-b border-red-100 px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900">Hapus Peternak</p>
            <p className="text-xs text-red-500 mt-0.5">Tindakan ini permanen dan tidak dapat dibatalkan</p>
          </div>
        </div>

        <div className="px-7 py-6 space-y-4">
          {/* User preview */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
            <Avatar username={user.username} />
            <div>
              <p className="text-sm font-semibold text-slate-800">{user.username}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <Phone size={11} />
                <span className="font-mono">{user.phone}</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
            <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">
              Semua data peternak ini akan dihapus secara permanen — termasuk histori transaksi,
              rekaman produksi, dan seluruh data terkait lainnya.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-red-400">Aksi ini tidak bisa dibatalkan</p>
          <div className="flex gap-2.5">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Menghapus...</>
              ) : (
                <><Trash2 size={14} /> Ya, Hapus</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}