"use client";

// hooks/useSensor.ts
import { useQuery } from "@tanstack/react-query";
import { sensorApi } from "@/api/sensorApi";
import type { SensorFilters } from "@/types/sensor";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SENSOR_KEYS = {
  latest:       (f: Pick<SensorFilters, "nodeId" | "unitId">) => ["sensor-latest",   f] as const,
  history:      (f: SensorFilters)                            => ["sensor-history",  f] as const,
  perUnit:      ["sensor-per-unit"]  as const,
  perNode:      ["sensor-per-node"]  as const,
};

// ─── useSensorLatest — data sensor terbaru dari satu node atau unit ───────────

export function useSensorLatest(
  filters: Pick<SensorFilters, "nodeId" | "unitId"> = {},
  pollInterval = 10_000
) {
  return useQuery({
    queryKey:                    SENSOR_KEYS.latest(filters),
    queryFn:                     () => sensorApi.getLatest(filters),
    enabled:                     !!(filters.nodeId || filters.unitId),
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
  });
}

// ─── useSensorHistory — riwayat sensor ───────────────────────────────────────

export function useSensorHistory(filters: SensorFilters = {}) {
  return useQuery({
    queryKey:  SENSOR_KEYS.history(filters),
    queryFn:   () => sensorApi.getHistory(filters),
    enabled:   !!(filters.nodeId || filters.unitId),
    staleTime: 30_000,
  });
}

// ─── useSensorPerUnit — satu data terbaru per unit (dashboard summary) ────────

export function useSensorPerUnit(pollInterval = 30_000) {
  return useQuery({
    queryKey:                    SENSOR_KEYS.perUnit,
    queryFn:                     () => sensorApi.getLatestPerUnit(),
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
  });
}

// ─── useSensorPerNode — satu data terbaru per ESP32 (monitoring hardware) ─────

export function useSensorPerNode(pollInterval = 30_000) {
  return useQuery({
    queryKey:                    SENSOR_KEYS.perNode,
    queryFn:                     () => sensorApi.getLatestPerNode(),
    refetchInterval:             pollInterval,
    refetchIntervalInBackground: true,
    staleTime:                   0,
  });
}
