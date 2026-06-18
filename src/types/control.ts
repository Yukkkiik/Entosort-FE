// types/control.ts

export type ControlAction = "on" | "off";

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface MotorControlPayload {
  unitId:    string;
  action:    ControlAction;
  speedRpm?: number;
}

export interface SolenoidControlPayload {
  unitId:   string;
  action:   ControlAction;
  delayMs?: number;
}

export interface ManualModePayload {
  unitId:  string;
  enabled: boolean;
}

// ─── Response data ────────────────────────────────────────────────────────────

export interface MotorControlResult {
  unitId:   string;
  command:  "motor";
  action:   ControlAction;
  speedRpm: number;
}

export interface SolenoidControlResult {
  unitId:   string;
  command:  "solenoid";
  action:   ControlAction;
  delayMs:  number;
}

export interface ManualModeResult {
  unitId:     string;
  manualMode: boolean;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ControlResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}
