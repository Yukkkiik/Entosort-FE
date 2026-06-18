// hooks/useAuth.ts
"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/lib/authStore";
import type { LoginPayload } from "@/types/auth";

// ─── useLogin ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),

    onSuccess: (res) => {
      const { user } = res.data;
      setAuth(user);

      if (user.role === "superadmin") {
        router.push("/dashboard/user");
      } else {
        router.push("/dashboard");
      }
    },
  });
}

// ─── useLogout ────────────────────────────────────────────────────────────────

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
 
  return useMutation({
    mutationFn: () => authApi.logout(),
 
    onSettled: () => {
      clearAuth();
      router.push("/login");
    },
  });
}

// ─── useMe ────────────────────────────────────────────────────────────────────
// Re-hydrate user dari server saat halaman di-refresh
// Berguna agar isAuthenticated tidak false sesaat setelah refresh

export function useMe() {
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await authApi.me();
      if (user) {
        setAuth(user);
      } else {
        clearAuth();
      }
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, 
    retry: false,
  });
}

// ─── useCurrentUser ───────────────────────────────────────────────────────────

export function useCurrentUser() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated,
    isAdmin: user?.role === "admin",
    isFarmer: user?.role === "peternak",
    isSuperAdmin: user?.role === 'superadmin'
  };
}