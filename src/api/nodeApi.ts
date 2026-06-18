// api/nodeApi.ts
// Node bersifat read-only dari frontend.
// Node dibuat otomatis dari MQTT heartbeat, bukan dari HTTP.
import { api } from "@/api/api";
import type { AppNode } from "@/types/node";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const nodeApi = {
  // GET /api/nodes/:unitId — semua node (ESP32 + RPi) milik unit
  getByUnitId: async (unitId: string): Promise<AppNode[]> => {
    const res = await api.get<ApiResponse<AppNode[]>>(`/api/nodes/${unitId}`);
    return res.data.data;
  },

  // GET /api/nodes/:unitId/esp32 — hanya ESP32
  getEsp32: async (unitId: string): Promise<AppNode | null> => {
    const res = await api.get<ApiResponse<AppNode | null>>(
      `/api/nodes/${unitId}/esp32`
    );
    return res.data.data;
  },

  // GET /api/nodes/:unitId/rpi — hanya Raspberry Pi
  getRpi: async (unitId: string): Promise<AppNode | null> => {
    const res = await api.get<ApiResponse<AppNode | null>>(
      `/api/nodes/${unitId}/rpi`
    );
    return res.data.data;
  },
};
