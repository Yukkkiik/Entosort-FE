"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/userApi";
import type { CreateUserPayload, UpdateUserPayload } from "@/types/user";

// Query key konstant — satu tempat, tidak typo
export const USERS_KEY = ["users"] as const;

// ─── useUsers — ambil semua user ─────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: usersApi.getAll,
    staleTime: 30 * 1000, 
  });
}

// ─── useCreateUser ────────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

// ─── useUpdateUser ────────────────────────────────────────────────────────────

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
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
    },
  });
}