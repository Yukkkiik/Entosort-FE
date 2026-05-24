// lib/auth/usersApi.ts
import { api } from "./api";
import type { AppUser, CreateUserPayload, UpdateUserPayload } from "@/types/user";

export const usersApi = {
  getAll: async (): Promise<AppUser[]> => {
    const res = await api.get("/api/users/");
    return res.data.data;
  },

  create: async (payload: CreateUserPayload): Promise<AppUser> => {
    const res = await api.post("/api/users/", payload);
    return res.data.data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<AppUser> => {
    const res = await api.put(`/api/users/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
};