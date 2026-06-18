// api/harvestApi.ts
import { api } from "@/api/api";
import type {
  HarvestLogsResponse,
  HarvestStatsResponse,
  HarvestFilters,
  CreateHarvestPayload,
  HarvestLog,
} from "@/types/harvest";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const harvestApi = {
  // GET /api/harvest?unitId=&from=&to=&page=&limit=
  getAll: async (filters: HarvestFilters = {}): Promise<HarvestLogsResponse> => {
    const params = new URLSearchParams();
    if (filters.unitId) params.set("unitId", filters.unitId);  // ← ganti dari nodeId
    if (filters.from)   params.set("from",   filters.from);
    if (filters.to)     params.set("to",     filters.to);
    if (filters.page)   params.set("page",   String(filters.page));
    if (filters.limit)  params.set("limit",  String(filters.limit));

    const res = await api.get<ApiResponse<HarvestLogsResponse>>(
      `/api/harvest?${params.toString()}`
    );
    return res.data.data;
  },

  // GET /api/harvest/stats?unitId=&from=&to=
  getStats: async (filters: HarvestFilters = {}): Promise<HarvestStatsResponse["data"]> => {
    const params = new URLSearchParams();
    if (filters.unitId) params.set("unitId", filters.unitId);  // ← ganti dari nodeId
    if (filters.from)   params.set("from",   filters.from);
    if (filters.to)     params.set("to",     filters.to);

    const res = await api.get<HarvestStatsResponse>(
      `/api/harvest/stats?${params.toString()}`
    );
    return res.data.data;
  },

  // POST /api/harvest — simpan sesi panen manual
  create: async (payload: CreateHarvestPayload): Promise<HarvestLog> => {
    const res = await api.post<ApiResponse<HarvestLog>>("/api/harvest", payload);
    return res.data.data;
  },
};
