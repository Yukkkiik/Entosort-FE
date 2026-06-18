"use client";

// hooks/useReport.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { reportApi } from "@/api/reportApi";
import type { ReportFilters } from "@/types/report";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const REPORT_KEYS = {
  daily: (f: Pick<ReportFilters, "unitId" | "date">) => ["report-daily", f] as const,
};

// ─── useDailyReport ───────────────────────────────────────────────────────────

export function useDailyReport(filters: Pick<ReportFilters, "unitId" | "date"> = {}) {
  return useQuery({
    queryKey:  REPORT_KEYS.daily(filters),
    queryFn:   () => reportApi.getDaily(filters),
    staleTime: 60_000,
  });
}

// ─── useExportPdf ─────────────────────────────────────────────────────────────
// useMutation karena ini aksi triggered, bukan fetch otomatis

export function useExportPdf() {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportApi.exportPdf(filters),
    onSuccess: (blob) => {
      const url      = URL.createObjectURL(blob);
      const anchor   = document.createElement("a");
      anchor.href    = url;
      anchor.download = `bsf_harvest_report_${Date.now()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });
}

// ─── useExportXlsx ────────────────────────────────────────────────────────────

export function useExportXlsx() {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportApi.exportXlsx(filters),
    onSuccess: (blob) => {
      const url      = URL.createObjectURL(blob);
      const anchor   = document.createElement("a");
      anchor.href    = url;
      anchor.download = `bsf_harvest_report_${Date.now()}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });
}
