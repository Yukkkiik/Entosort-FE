// api/reportApi.ts
import { api } from "@/api/api";
import type { DailyReport, DailyReportResponse, ReportFilters } from "@/types/report";

export const reportApi = {
  // GET /api/report/daily?unitId=&date=YYYY-MM-DD
  getDaily: async (filters: Pick<ReportFilters, "unitId" | "date"> = {}): Promise<DailyReport> => {
    const params = new URLSearchParams();
    if (filters.unitId) params.set("unitId", filters.unitId);
    if (filters.date)   params.set("date",   filters.date);

    const res = await api.get<DailyReportResponse>(
      `/api/report/daily?${params.toString()}`
    );
    return res.data.data;
  },

  // GET /api/report/export/pdf — mengembalikan blob PDF
  exportPdf: async (filters: ReportFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.unitId) params.set("unitId", filters.unitId);
    if (filters.from)   params.set("from",   filters.from);
    if (filters.to)     params.set("to",     filters.to);

    const res = await api.get(`/api/report/export/pdf?${params.toString()}`, {
      responseType: "blob",
    });
    return res.data;
  },

  // GET /api/report/export/xlsx — mengembalikan blob Excel
  exportXlsx: async (filters: ReportFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.unitId) params.set("unitId", filters.unitId);
    if (filters.from)   params.set("from",   filters.from);
    if (filters.to)     params.set("to",     filters.to);

    const res = await api.get(`/api/report/export/xlsx?${params.toString()}`, {
      responseType: "blob",
    });
    return res.data;
  },
};
