// ============================================================
// ENUMS
// ============================================================

export type UserRole = 'superadmin' | 'admin' | 'peternak';
export type NodeType = 'esp32' | 'raspberry';
export type NodeStatus = 'online' | 'offline';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TriggerSource = 'ir_sensor' | 'manual';

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}