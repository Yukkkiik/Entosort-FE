"use client";

import { useNodeStatusSync } from "@/hooks/useNodeStatusSync";

/**
 * Komponen tak terlihat yang menjalankan sync status node secara global.
 * Dipasang sekali di Providers, supaya semua halaman otomatis dapat
 * update status online/offline secara real-time tanpa perlu refresh.
 */
export function GlobalNodeStatusSync() {
  useNodeStatusSync();
  return null;
}