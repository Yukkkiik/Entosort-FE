// api/errorLogApi.ts
import { api } from "@/api/api";
import type { AppErrorLog, ErrorLogFilters, ErrorLogListResponse } from "@/types/errorLog";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const errorLogApi = {
  // GET /api/errors?unitId=&resolved=&limit=
  getAll: async (filters: ErrorLogFilters = {}): Promise<AppErrorLog[]> => {
    const params = new URLSearchParams();
    if (filters.unitId !== undefined)   params.set("unitId",   filters.unitId);
    if (filters.resolved !== undefined) params.set("resolved", String(filters.resolved));
    if (filters.limit !== undefined)    params.set("limit",    String(filters.limit));

    const res = await api.get<ErrorLogListResponse>(
      `/api/errors?${params.toString()}`
    );
    return res.data.data;
  },

  // POST /api/errors/resolve/:id
  resolve: async (id: number): Promise<AppErrorLog> => {
    const res = await api.post<ApiResponse<AppErrorLog>>(`/api/errors/resolve/${id}`);
    return res.data.data;
  },
};
