// types/errorLog.ts

export type ErrorSeverity = "low" | "medium" | "high" | "critical";
export type ErrorNodeType = "esp32" | "raspberry";

// ─── Error log utama ──────────────────────────────────────────────────────────

export interface AppErrorLog {
  id:         number;
  unitId:     string;
  nodeType:   ErrorNodeType | null;
  errorType:  string;
  message:    string;
  severity:   ErrorSeverity;
  resolved:   boolean;
  occurredAt: string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ErrorLogFilters {
  unitId?:   string;
  resolved?: boolean;
  limit?:    number;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ErrorLogListResponse {
  success: boolean;
  data:    AppErrorLog[];
}

export interface ErrorLogResponse {
  success: boolean;
  message: string;
  data:    AppErrorLog;
}
