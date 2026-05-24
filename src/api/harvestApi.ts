// api/harvestApi.ts
import { api } from "@/api/api";
import type {
  HarvestLogsResponse,
  HarvestStatsResponse,
  HarvestFilters,
} from "@/types/harvest";

export const harvestApi = {
  // GET /api/harvest?nodeId=&from=&to=&page=&limit=
  getAll: async (filters: HarvestFilters = {}): Promise<HarvestLogsResponse> => {
    const params = new URLSearchParams();
    if (filters.nodeId) params.set("nodeId", filters.nodeId);
    if (filters.from)   params.set("from",   filters.from);
    if (filters.to)     params.set("to",     filters.to);
    if (filters.page)   params.set("page",   String(filters.page));
    if (filters.limit)  params.set("limit",  String(filters.limit));

    const res = await api.get<{ success: boolean; data: HarvestLogsResponse }>(
      `/api/harvest?${params.toString()}`
    );
    return res.data.data;
  },

  // GET /api/harvest/stats?nodeId=&from=&to=
  getStats: async (filters: HarvestFilters = {}): Promise<HarvestStatsResponse["data"]> => {
    const params = new URLSearchParams();
    if (filters.nodeId) params.set("nodeId", filters.nodeId);
    if (filters.from)   params.set("from",   filters.from);
    if (filters.to)     params.set("to",     filters.to);

    const res = await api.get<HarvestStatsResponse>(
      `/api/harvest/stats?${params.toString()}`
    );
    return res.data.data;
  },
};