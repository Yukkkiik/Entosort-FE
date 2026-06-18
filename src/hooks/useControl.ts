"use client";

// hooks/useControl.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { controlApi } from "@/api/controlApi";
import type {
  MotorControlPayload,
  SolenoidControlPayload,
  ManualModePayload,
} from "@/types/control";
import { SETTINGS_KEYS } from "./useSettings";

// ─── useMotorControl ──────────────────────────────────────────────────────────
// Setelah berhasil, invalidate settings karena motorOn ikut terupdate di DB

export function useMotorControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MotorControlPayload) => controlApi.motor(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEYS.byUnit(variables.unitId) });
    },
  });
}

// ─── useSolenoidControl ───────────────────────────────────────────────────────

export function useSolenoidControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SolenoidControlPayload) => controlApi.solenoid(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEYS.byUnit(variables.unitId) });
    },
  });
}

// ─── useManualMode ────────────────────────────────────────────────────────────

export function useManualMode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManualModePayload) => controlApi.setManualMode(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEYS.byUnit(variables.unitId) });
    },
  });
}
