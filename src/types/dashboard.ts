// types/dashboard.ts

import type { AppErrorLog } from "./errorLog";

// ─── Unit summary (dari dashboard) ───────────────────────────────────────────

export interface DashboardUnitNode {
  nodeId:    string;
  nodeType:  "esp32" | "raspberry";
  status:    "online" | "offline";
  firmware:  string | null;
  ipAddress: string | null;
  lastSeen:  string | null;
}

export interface DashboardUnit {
  id:       number;
  unitId:   string;
  status:   "online" | "offline";
  location: string | null;
  peternak: string | null;
  nodes:    DashboardUnitNode[];
}

export interface DashboardUnitSummary {
  total:   number;
  online:  number;
  offline: number;
  list:    DashboardUnit[];
}

// ─── Environment (sensor terbaru per unit) ────────────────────────────────────

export interface DashboardEnvironment {
  unitId:      string;
  temperature: number | null;
  humidity:    number | null;
  pressure:    number | null;
  recordedAt:  string;
}

// ─── Production (statistik panen) ────────────────────────────────────────────

export interface DashboardProduction {
  totalSessions:  number;
  totalLarva:     number;
  totalPrepupa:   number;
  totalReject:    number;
  totalHarvested: number;
}

// ─── Dashboard summary response ───────────────────────────────────────────────

export interface DashboardSummary {
  units:        DashboardUnitSummary;
  environment:  DashboardEnvironment[];
  production:   DashboardProduction;
  recentErrors: Pick<AppErrorLog, "id" | "unitId" | "nodeType" | "errorType" | "message" | "severity" | "occurredAt">[];
}

export interface DashboardResponse {
  success: boolean;
  data:    DashboardSummary;
}
