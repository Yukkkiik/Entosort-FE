// lib/auth/authApi.ts
import { api } from "./api";
import type { ChangePasswordPayload, ChangePasswordResponse, LoginPayload, LoginResponse } from "@/types/auth";

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post("/api/auth/login", payload);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout").catch(() => {});
  },

  me: async (): Promise<LoginResponse["data"]["user"] | null> => {
    const res = await api.get("/api/auth/me").catch(() => null);
    return res?.data?.data?.user ?? null;
  },

  changePassword: async (
    payload: ChangePasswordPayload
  ): Promise<ChangePasswordResponse> => {
    const res = await api.put("/api/auth/change-password", payload);
    return res.data;
  },
};