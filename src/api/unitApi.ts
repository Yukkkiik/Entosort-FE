// api/unitApi.ts
import { api } from "@/api/api";
import type {
  AppUnit,
  CreateUnitPayload,
  UpdateUnitPayload,
  AssignOperatorPayload,
  AssignAdminPayload,
} from "@/types/unit";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const unitApi = {
  // GET /api/units
  getAll: async (): Promise<AppUnit[]> => {
    const res = await api.get<ApiResponse<AppUnit[]>>("/api/units");
    return res.data.data;
  },

  // GET /api/units/:id
  getStatus: async (id: string | number): Promise<AppUnit> => {
    const res = await api.get<ApiResponse<AppUnit>>(`/api/units/${id}`);
    return res.data.data;
  },

  // POST /api/units — superadmin only
  create: async (payload: CreateUnitPayload): Promise<AppUnit> => {
    const res = await api.post<ApiResponse<AppUnit>>("/api/units", payload);
    return res.data.data;
  },

  // PUT /api/units/:id — admin pemilik
  update: async (id: string | number, payload: UpdateUnitPayload): Promise<AppUnit> => {
    const res = await api.put<ApiResponse<AppUnit>>(`/api/units/${id}`, payload);
    return res.data.data;
  },

  // DELETE /api/units/:id — superadmin
  remove: async (id: string | number): Promise<void> => {
    await api.delete(`/api/units/${id}`);
  },

  // POST /api/units/:unitId/assign-operator — admin pemilik
  assignOperator: async (unitId: string, payload: AssignOperatorPayload): Promise<AppUnit> => {
    const res = await api.post<ApiResponse<AppUnit>>(
      `/api/units/${unitId}/assign-operator`,
      payload
    );
    return res.data.data;
  },

  // DELETE /api/units/:unitId/assign-operator — admin pemilik
  removeOperator: async (unitId: string): Promise<AppUnit> => {
    const res = await api.delete<ApiResponse<AppUnit>>(
      `/api/units/${unitId}/assign-operator`
    );
    return res.data.data;
  },

  // POST /api/units/:unitId/assign-admin — superadmin
  assignAdmin: async (unitId: string, payload: AssignAdminPayload): Promise<AppUnit> => {
    const res = await api.post<ApiResponse<AppUnit>>(
      `/api/units/${unitId}/assign-admin`,
      payload
    );
    return res.data.data;
  },

  // DELETE /api/units/:unitId/assign-admin — superadmin
  removeAdmin: async (unitId: string): Promise<AppUnit> => {
    const res = await api.delete<ApiResponse<AppUnit>>(
      `/api/units/${unitId}/assign-admin`
    );
    return res.data.data;
  },
};
