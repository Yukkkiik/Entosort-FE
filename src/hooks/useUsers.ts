"use client";

// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/userApi";
import type { CreateUserPayload, UpdateUserPayload } from "@/types/user";

export const USERS_KEY = ["users"] as const;

// ─── useUsers — ambil semua user (filter by role dilakukan di backend) ────────

export function useUsers() {
  return useQuery({
    queryKey:  USERS_KEY,
    queryFn:   usersApi.getAll,
    staleTime: 30_000,
  });
}

// ─── useCreateUser ────────────────────────────────────────────────────────────
// superadmin: buat admin | admin: buat peternak (+ selectedUnits opsional)

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      qc.invalidateQueries({ queryKey: ["units"] }); // unit bisa berubah jika assign sekaligus
    },
  });
}

// ─── useUpdateUser ────────────────────────────────────────────────────────────
// Bisa update selectedUnits untuk re-assign unit ke peternak

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      qc.invalidateQueries({ queryKey: ["units"] });
    },
  });
}

// ─── useDeleteUser ────────────────────────────────────────────────────────────

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      qc.invalidateQueries({ queryKey: ["units"] });
    },
  });
}
