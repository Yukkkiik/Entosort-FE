"use client";

// hooks/useNode.ts
// Node bersifat read-only dari frontend.
// Status node diupdate otomatis via MQTT heartbeat di backend.
import { useQuery } from "@tanstack/react-query";
import { nodeApi } from "@/api/nodeApi";
import type { SystemStatus } from "@/types/node";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const NODE_KEYS = {
  byUnit:  (unitId: string) => ["nodes", unitId, "all"]   as const,
  esp32:   (unitId: string) => ["nodes", unitId, "esp32"] as const,
  rpi:     (unitId: string) => ["nodes", unitId, "rpi"]   as const,
};

// ─── useNodesByUnit — semua node (ESP32 + RPi) milik satu unit ────────────────

export function useNodesByUnit(unitId?: string, pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                    NODE_KEYS.byUnit(unitId!),
    queryFn:                     () => nodeApi.getByUnitId(unitId!),
    enabled:                     !!unitId,
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
    retry:                       2,
  });

  const nodes   = query.data ?? [];
  const esp32   = nodes.find((n) => n.nodeType === "esp32")     ?? null;
  const rpi     = nodes.find((n) => n.nodeType === "raspberry") ?? null;

  const systemStatus: SystemStatus = !unitId
    ? "offline"
    : query.isLoading
    ? "connecting"
    : nodes.some((n) => n.status === "online")
    ? "online"
    : "offline";

  return {
    nodes,
    esp32,
    rpi,
    systemStatus,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error ? (query.error as Error).message : null,
    refetch:   query.refetch,
  };
}

// ─── useEsp32 — hanya node ESP32 dari satu unit ───────────────────────────────

export function useEsp32(unitId?: string, pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                    NODE_KEYS.esp32(unitId!),
    queryFn:                     () => nodeApi.getEsp32(unitId!),
    enabled:                     !!unitId,
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
    retry:                       2,
  });

  const status: SystemStatus = !unitId
    ? "offline"
    : query.isLoading
    ? "connecting"
    : (query.data?.status ?? "offline");

  return {
    node:      query.data ?? null,
    status,
    isLoading: query.isLoading,
    error:     query.error ? (query.error as Error).message : null,
    refetch:   query.refetch,
  };
}

// ─── useRpi — hanya node Raspberry Pi dari satu unit ─────────────────────────

export function useRpi(unitId?: string, pollInterval = 30_000) {
  const query = useQuery({
    queryKey:                    NODE_KEYS.rpi(unitId!),
    queryFn:                     () => nodeApi.getRpi(unitId!),
    enabled:                     !!unitId,
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
    retry:                       2,
  });

  const status: SystemStatus = !unitId
    ? "offline"
    : query.isLoading
    ? "connecting"
    : (query.data?.status ?? "offline");

  return {
    node:      query.data ?? null,
    status,
    isLoading: query.isLoading,
    error:     query.error ? (query.error as Error).message : null,
    refetch:   query.refetch,
  };
}
