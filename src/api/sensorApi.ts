// api/sensorApi.ts
import { api } from "@/api/api";
import type { SensorLog, SensorFilters } from "@/types/sensor";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const sensorApi = {
  // GET /api/sensor/latest?nodeId=&unitId=
  getLatest: async (filters: Pick<SensorFilters, "nodeId" | "unitId"> = {}): Promise<SensorLog | null> => {
    const params = new URLSearchParams();
    if (filters.nodeId) params.set("nodeId", filters.nodeId);
    if (filters.unitId) params.set("unitId", filters.unitId);

    const res = await api.get<ApiResponse<SensorLog | null>>(
      `/api/sensor/latest?${params.toString()}`
    );
    return res.data.data;
  },

  // GET /api/sensor/history?nodeId=&unitId=&from=&to=&limit=
  getHistory: async (filters: SensorFilters = {}): Promise<SensorLog[]> => {
    const params = new URLSearchParams();
    if (filters.nodeId) params.set("nodeId", filters.nodeId);
    if (filters.unitId) params.set("unitId", filters.unitId);
    if (filters.from)   params.set("from",   filters.from);
    if (filters.to)     params.set("to",     filters.to);
    if (filters.limit)  params.set("limit",  String(filters.limit));

    const res = await api.get<ApiResponse<SensorLog[]>>(
      `/api/sensor/history?${params.toString()}`
    );
    return res.data.data;
  },

  // GET /api/sensor/latest/per-unit — satu data terbaru per unit (dashboard)
  getLatestPerUnit: async (): Promise<SensorLog[]> => {
    const res = await api.get<ApiResponse<SensorLog[]>>("/api/sensor/latest/per-unit");
    return res.data.data;
  },

  // GET /api/sensor/latest/per-node — satu data terbaru per ESP32 (monitoring hardware)
  getLatestPerNode: async (): Promise<SensorLog[]> => {
    const res = await api.get<ApiResponse<SensorLog[]>>("/api/sensor/latest/per-node");
    return res.data.data;
  },
};
