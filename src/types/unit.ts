// types/unit.ts

import type { NodeStatus, NodeType } from "./node";

// ─── User ringkas (dari relasi admin/operator di unit) ────────────────────────

export interface UnitUser {
  id:       number;
  username: string;
  role:     string;
}

// ─── Node ringkas (dari relasi nodes[] di unit) ───────────────────────────────

export interface UnitNode {
  id:        number;
  nodeId:    string;
  nodeType:  NodeType;
  status:    NodeStatus;
  ipAddress: string | null;
  firmware:  string | null;
  lastSeen:  string | null;
  createdAt: string;
  updatedAt: string;
  unitId:    string;
}

// ─── Settings ringkas (dari relasi settings di unit) ─────────────────────────

export interface UnitSettings {
  unitId:          string;
  irThreshold:     number | null;
  motorSpeedRpm:   number | null;
  solenoidDelayMs: number | null;
  manualMode:      boolean;
  motorOn:         boolean;
  solenoidOn:      boolean;
  hsvLowerH:       number | null;
  hsvLowerS:       number | null;
  hsvLowerV:       number | null;
  hsvUpperH:       number | null;
  hsvUpperS:       number | null;
  hsvUpperV:       number | null;
}

// ─── Unit utama ───────────────────────────────────────────────────────────────

export type UnitStatus = "online" | "offline";

export interface AppUnit {
  id:        number;
  unitId:    string;
  name:      string | null;
  location:  string | null;
  status:    UnitStatus;
  adminId:   number | null;
  operatorId:   number | null;
  createdAt: string;
  updatedAt: string;
  admin:     UnitUser | null;
  operator:  UnitUser | null;
  nodes:     UnitNode[];
  settings:  UnitSettings | null;
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CreateUnitPayload {
  unitId:    string;
  name?:     string;
  location?: string;
  adminId?:  number;
}

export interface UpdateUnitPayload {
  name?:     string;
  location?: string;
  status?:   UnitStatus;
}

export interface AssignOperatorPayload {
  operatorId: number;
}

export interface AssignAdminPayload {
  adminId: number;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface UnitsResponse {
  success: boolean;
  data:    AppUnit[];
}

export interface UnitResponse {
  success: boolean;
  message?: string;
  data:    AppUnit;
}

export interface UnitDeleteResponse {
  success: boolean;
  message: string;
}
