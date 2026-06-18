// lib/auth/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
  hasHydrated: boolean;       

  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  setHasHydrated: (val: boolean) => void;
}
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      expiresAt: null,
      hasHydrated: false,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
          expiresAt: Date.now() + 60 * 60 * 1000, // 1 jam
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          expiresAt: null,
        }),

      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    {
      name: "auth-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.expiresAt && Date.now() > state.expiresAt) {
          state.clearAuth();
        }

        state.setHasHydrated(true);
      },
    }
  )
);