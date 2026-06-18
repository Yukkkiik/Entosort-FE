"use client";

// hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboardApi";

export const DASHBOARD_KEY = ["dashboard-summary"] as const;

// ─── useDashboard — ringkasan: unit, sensor, produksi, error terbaru ──────────

export function useDashboard(pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                    DASHBOARD_KEY,
    queryFn:                     dashboardApi.getSummary,
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
  });

  return {
    summary:      query.data ?? null,
    units:        query.data?.units        ?? null,
    environment:  query.data?.environment  ?? [],
    production:   query.data?.production   ?? null,
    recentErrors: query.data?.recentErrors ?? [],
    isLoading:    query.isLoading,
    isError:      query.isError,
    error:        query.error ? (query.error as Error).message : null,
    refetch:      query.refetch,
  };
}
