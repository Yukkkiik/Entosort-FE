"use client";

// hooks/useHarvest.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { harvestApi } from "@/api/harvestApi";
import type { HarvestFilters, CreateHarvestPayload } from "@/types/harvest";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const HARVEST_KEYS = {
  logs:  (f: HarvestFilters) => ["harvest-logs",  f] as const,
  stats: (f: HarvestFilters) => ["harvest-stats", f] as const,
};

// ─── useHarvestLogs ───────────────────────────────────────────────────────────

export function useHarvestLogs(filters: HarvestFilters = {}) {
  return useQuery({
    queryKey:  HARVEST_KEYS.logs(filters),
    queryFn:   () => harvestApi.getAll(filters),
    staleTime: 30_000,
  });
}

// ─── useHarvestStats ──────────────────────────────────────────────────────────

export function useHarvestStats(filters: HarvestFilters = {}) {
  return useQuery({
    queryKey:  HARVEST_KEYS.stats(filters),
    queryFn:   () => harvestApi.getStats(filters),
    staleTime: 30_000,
  });
}

// ─── useCreateHarvest — input sesi panen manual ───────────────────────────────

export function useCreateHarvest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHarvestPayload) => harvestApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["harvest-logs"] });
      qc.invalidateQueries({ queryKey: ["harvest-stats"] });
    },
  });
}
