// hooks/useNodes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nodeApi } from "@/api/nodeApi";
import type {
  CreateNodePayload,
  UpdateNodePayload,
  AssignUserPayload,
  SystemStatus,
} from "@/types/node";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const NODE_KEYS = {
  all:    ["nodes"] as const,
  status: (id: string | number) => ["nodes", String(id), "status"] as const,
};

// ─── useNodes ─────────────────────────────────────────────────────────────────

export function useNodes(pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                  NODE_KEYS.all,
    queryFn:                   () => nodeApi.getAll(),
    refetchInterval:           pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                 0,
    retry:                     2,
  });

  const online  = query.data?.filter((n) => n.status === "online").length  ?? 0;
  const offline = query.data?.filter((n) => n.status === "offline").length ?? 0;
  const total   = query.data?.length ?? 0;

  return {
    nodes:     query.data ?? [],
    total,
    online,
    offline,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error ? (query.error as Error).message : null,
    refetch:   query.refetch,
  };
}

// ─── useNodeStatus — polling satu node ───────────────────────────────────────

export function useNodeStatus(nodeId?: string | number, pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                  NODE_KEYS.status(nodeId!),
    queryFn:                   () => nodeApi.getStatus(nodeId!),
    enabled:                   !!nodeId,
    refetchInterval:           pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                 0,
    retry:                     2,
  });

  const status: SystemStatus = !nodeId
    ? "offline"
    : query.isLoading
    ? "connecting"
    : (query.data?.status ?? "offline");

  return {
    status,
    lastSeen: query.data?.lastSeen ?? null,
    nodeData: query.data           ?? null,
    isLoading: query.isLoading,
    error:     query.error ? (query.error as Error).message : null,
    refetch:   query.refetch,
  };
}

// ─── useCreateNode ────────────────────────────────────────────────────────────

export function useCreateNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNodePayload) => nodeApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: NODE_KEYS.all }),
  });
}

// ─── useUpdateNode ────────────────────────────────────────────────────────────

export function useUpdateNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateNodePayload }) =>
      nodeApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: NODE_KEYS.all }),
  });
}

// ─── useDeleteNode ────────────────────────────────────────────────────────────

export function useDeleteNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => nodeApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: NODE_KEYS.all }),
  });
}

// ─── useAssignNode ────────────────────────────────────────────────────────────

export function useAssignNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, payload }: { nodeId: string; payload: AssignUserPayload }) =>
      nodeApi.assignUser(nodeId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: NODE_KEYS.all }),
  });
}

// ─── useRemoveNodeUser ────────────────────────────────────────────────────────

export function useRemoveNodeUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) => nodeApi.removeUser(nodeId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: NODE_KEYS.all }),
  });
}