// ============================================================
// api/nodeApi.ts
// ============================================================

import { api } from "@/api/api";
import type {
  NodeStatusResponse,
  CreateNodePayload,
  UpdateNodePayload,
  AssignUserPayload,
  ApiResponse,
  ApiMessageResponse,
} from "@/types/node";

export const nodeApi = {
  // ----------------------------------------------------------
  // GET /api/nodes
  // Role peternak  → hanya node milik user sendiri
  // Role admin/lain → semua node
  // ----------------------------------------------------------
  getAll: async (): Promise<NodeStatusResponse[]> => {
    const res = await api.get<ApiResponse<NodeStatusResponse[]>>("/api/nodes");
    return res.data.data;
  },

  // ----------------------------------------------------------
  // GET /api/nodes/:id/status
  // ----------------------------------------------------------
  getStatus: async (id: string | number): Promise<NodeStatusResponse> => {
    const res = await api.get<ApiResponse<NodeStatusResponse>>(
      `/api/nodes/${id}/status`
    );
    return res.data.data;
  },

  // ----------------------------------------------------------
  // POST /api/nodes  (admin only)
  // ----------------------------------------------------------
  create: async (payload: CreateNodePayload): Promise<NodeStatusResponse> => {
    const res = await api.post<ApiResponse<NodeStatusResponse>>(
      "/api/nodes",
      payload
    );
    return res.data.data;
  },

  // ----------------------------------------------------------
  // PUT /api/nodes/:id  (admin only)
  // ----------------------------------------------------------
  update: async (
    id: string | number,
    payload: UpdateNodePayload
  ): Promise<NodeStatusResponse> => {
    const res = await api.put<ApiResponse<NodeStatusResponse>>(
      `/api/nodes/${id}`,
      payload
    );
    return res.data.data;
  },

  // ----------------------------------------------------------
  // DELETE /api/nodes/:id  (admin only)
  // ----------------------------------------------------------
  remove: async (id: string | number): Promise<void> => {
    await api.delete<ApiMessageResponse>(`/api/nodes/${id}`);
  },

  // ----------------------------------------------------------
  // POST /api/nodes/:nodeId/assign  (admin only)
  //
  // ⚠️  Catatan bug backend:
  //     controller mengambil userId dari req.params, tapi route
  //     tidak mendefinisikan :userId → userId selalu undefined.
  //     Solusi sementara: kirim userId lewat body (assignUserSchema
  //     sudah validasi body). Setelah backend diperbaiki, hapus
  //     komentar ini dan bagian workaround di bawah.
  // ----------------------------------------------------------
  assignUser: async (
    nodeId: string,
    payload: AssignUserPayload
  ): Promise<NodeStatusResponse> => {
    const res = await api.post<ApiResponse<NodeStatusResponse>>(
      `/api/nodes/${nodeId}/assign`,
      payload // { userId: number }
    );
    return res.data.data;
  },

  // ----------------------------------------------------------
  // DELETE /api/nodes/:nodeId/assign  (admin only)
  // ----------------------------------------------------------
  removeUser: async (nodeId: string): Promise<NodeStatusResponse> => {
    const res = await api.delete<ApiResponse<NodeStatusResponse>>(
      `/api/nodes/${nodeId}/assign`
    );
    return res.data.data;
  },
};