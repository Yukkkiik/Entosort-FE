"use client";

// hooks/useUnit.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { unitApi } from "@/api/unitApi";
import type {
  CreateUnitPayload,
  UpdateUnitPayload,
  AssignPeternakPayload,
  AssignAdminPayload,
} from "@/types/unit";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const UNIT_KEYS = {
  all:    ["units", "list"] as const,
  detail: (id: string | number) => ["units", String(id)] as const,
};

// ─── useUnits — list semua unit (filter by role dilakukan di backend) ─────────

export function useUnits(pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                    UNIT_KEYS.all,
    queryFn:                     () => unitApi.getAll(),
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
    retry:                       2,
  });

  const units   = query.data ?? [];
  const online  = units.filter((u) => u.status === "online").length;
  const offline = units.filter((u) => u.status === "offline").length;

  return {
    units,
    total:     units.length,
    online,
    offline,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error ? (query.error as Error).message : null,
    refetch:   query.refetch,
  };
}

// ─── useUnitStatus — detail satu unit dengan polling ─────────────────────────

export function useUnitStatus(id?: string | number, pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                    UNIT_KEYS.detail(id!),
    queryFn:                     () => unitApi.getStatus(id!),
    enabled:                     !!id,
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
    retry:                       2,
  });

  return {
    unit:      query.data ?? null,
    status:    query.data?.status ?? "offline",
    nodes:     query.data?.nodes ?? [],
    settings:  query.data?.settings ?? null,
    isLoading: query.isLoading,
    error:     query.error ? (query.error as Error).message : null,
    refetch:   query.refetch,
  };
}

// ─── useCreateUnit — superadmin ───────────────────────────────────────────────

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitPayload) => unitApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: UNIT_KEYS.all }),
  });
}

// ─── useUpdateUnit — admin pemilik ────────────────────────────────────────────

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateUnitPayload }) =>
      unitApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIT_KEYS.all }),
  });
}

// ─── useDeleteUnit — superadmin ───────────────────────────────────────────────

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => unitApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: UNIT_KEYS.all }),
  });
}

// ─── useAssignPeternak — admin pemilik unit ───────────────────────────────────

export function useAssignPeternak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, payload }: { unitId: string; payload: AssignPeternakPayload }) =>
      unitApi.assignPeternak(unitId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ─── useRemovePeternak — admin pemilik unit ───────────────────────────────────

export function useRemovePeternak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => unitApi.removePeternak(unitId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["units"] }),
        qc.invalidateQueries({ queryKey: ["users"] }),
      ]);
    },
  });
}

// ─── useAssignAdmin — superadmin ──────────────────────────────────────────────

export function useAssignAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, payload }: { unitId: string; payload: AssignAdminPayload }) =>
      unitApi.assignAdmin(unitId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ─── useRemoveAdmin — superadmin ──────────────────────────────────────────────

export function useRemoveAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => unitApi.removeAdmin(unitId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["units"] }),
        qc.invalidateQueries({ queryKey: ["users"] }),
      ]);
    },
  });
}
