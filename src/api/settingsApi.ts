// api/settingsApi.ts
import { api } from "@/api/api";
import type { AppSettings, UpdateSettingsPayload } from "@/types/settings";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const settingsApi = {
  // GET /api/settings?unitId=unit-001
  getByUnit: async (unitId: string): Promise<AppSettings> => {
    const res = await api.get<ApiResponse<AppSettings>>(
      `/api/settings?unitId=${unitId}`
    );
    return res.data.data;
  },

  // GET /api/settings — semua settings (admin/superadmin)
  getAll: async (): Promise<AppSettings[]> => {
    const res = await api.get<ApiResponse<AppSettings[]>>("/api/settings");
    return res.data.data;
  },

  // PUT /api/settings — update (upsert) settings untuk satu unit
  update: async (payload: UpdateSettingsPayload): Promise<AppSettings> => {
    const res = await api.put<ApiResponse<AppSettings>>("/api/settings", payload);
    return res.data.data;
  },
};
