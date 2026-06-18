// api/dashboardApi.ts
import { api } from "@/api/api";
import type { DashboardSummary, DashboardResponse } from "@/types/dashboard";

export const dashboardApi = {
  // GET /api/dashboard
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get<DashboardResponse>("/api/dashboard");
    return res.data.data;
  },
};
