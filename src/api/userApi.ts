// api/userApi.ts
import { api } from "@/api/api";
import type { AppUser, CreateUserPayload, UpdateUserPayload } from "@/types/user";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const usersApi = {
  // GET /api/users
  getAll: async (): Promise<AppUser[]> => {
    const res = await api.get<ApiResponse<AppUser[]>>("/api/users/");
    return res.data.data;
  },

  // GET /api/users/:id
  getById: async (id: number): Promise<AppUser> => {
    const res = await api.get<ApiResponse<AppUser>>(`/api/users/${id}`);
    return res.data.data;
  },

  // POST /api/users — superadmin: buat admin | admin: buat peternak
  create: async (payload: CreateUserPayload): Promise<AppUser> => {
    const res = await api.post<ApiResponse<AppUser>>("/api/users/", payload);
    return res.data.data;
  },

  // PUT /api/users/:id
  update: async (id: number, payload: UpdateUserPayload): Promise<AppUser> => {
    const res = await api.put<ApiResponse<AppUser>>(`/api/users/${id}`, payload);
    return res.data.data;
  },

  // DELETE /api/users/:id
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
};
