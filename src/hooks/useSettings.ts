"use client";

// hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/api/settingsApi";
import type { UpdateSettingsPayload } from "@/types/settings";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SETTINGS_KEYS = {
  all:    ["settings", "all"] as const,
  byUnit: (nodeId: string) => ["settings", nodeId] as const,
};

// ─── useSettings — settings satu unit ────────────────────────────────────────

export function useSettings(nodeId?: string) {
  return useQuery({
    queryKey:  SETTINGS_KEYS.byUnit(nodeId!),
    queryFn:   () => settingsApi.getByUnit(nodeId!),
    enabled:   !!nodeId,
    staleTime: 30_000,
  });
}

// ─── useAllSettings — semua settings (admin/superadmin) ──────────────────────

export function useAllSettings() {
  return useQuery({
    queryKey:  SETTINGS_KEYS.all,
    queryFn:   settingsApi.getAll,
    staleTime: 30_000,
  });
}

// ─── useUpdateSettings — upsert settings, lalu broadcast ke MQTT di backend ──

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsApi.update(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEYS.byUnit(variables.unitId) });
      qc.invalidateQueries({ queryKey: SETTINGS_KEYS.all });
    },
  });
}
