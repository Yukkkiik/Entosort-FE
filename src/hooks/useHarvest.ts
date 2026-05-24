"use client";
 
import { useQuery } from "@tanstack/react-query";
import { harvestApi } from "@/api/harvestApi";
import type { HarvestFilters } from "@/types/harvest";
 
export const HARVEST_KEYS = {
  logs:  (f: HarvestFilters) => ["harvest-logs",  f] as const,
  stats: (f: HarvestFilters) => ["harvest-stats", f] as const,
};
 
export function useHarvestLogs(filters: HarvestFilters = {}) {
  return useQuery({
    queryKey: HARVEST_KEYS.logs(filters),
    queryFn:  () => harvestApi.getAll(filters),
    staleTime: 30_000,
  });
}
 
export function useHarvestStats(filters: HarvestFilters = {}) {
  return useQuery({
    queryKey: HARVEST_KEYS.stats(filters),
    queryFn:  () => harvestApi.getStats(filters),
    staleTime: 30_000,
  });
}
 