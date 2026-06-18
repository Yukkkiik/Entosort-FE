"use client";

// hooks/useErrorLog.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorLogApi } from "@/api/errorLogApi";
import type { ErrorLogFilters } from "@/types/errorLog";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const ERROR_LOG_KEYS = {
  all:    (f: ErrorLogFilters) => ["error-logs", f] as const,
};

// ─── useErrorLogs ─────────────────────────────────────────────────────────────

export function useErrorLogs(filters: ErrorLogFilters = {}, pollInterval = 30_000) {
  return useQuery({
    queryKey:                    ERROR_LOG_KEYS.all(filters),
    queryFn:                     () => errorLogApi.getAll(filters),
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
  });
}

// ─── useResolveError ──────────────────────────────────────────────────────────

export function useResolveError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => errorLogApi.resolve(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["error-logs"] }),
  });
}
