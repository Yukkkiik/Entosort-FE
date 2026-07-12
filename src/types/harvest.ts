// types/harvest.ts

export type TriggerSource = "ir_sensor" | "manual" | "mqtt";

// ─── Relasi ringkas ───────────────────────────────────────────────────────────

export interface HarvestUser {
  id:       number;
  username: string;
}

// ─── Harvest log ─────────────────────────────────────────────────────────────

export interface HarvestLog {
  id:            number;
  unitId:        string;      
  userId:        number | null;
  larvaCount:    number;
  prepupaCount:  number;
  rejectCount:   number;
  totalCount:    number;
  durationSec:   number | null;
  notes:         string | null;
  triggerSource: TriggerSource;
  recordedAt:    string;
  user:          HarvestUser | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface HarvestPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface HarvestLogsResponse {
  data:       HarvestLog[];
  pagination: HarvestPagination;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface HarvestStats {
  totalSessions:        number;
  totalLarva:           number;
  totalPrepupa:         number;
  totalReject:          number;
  totalHarvested:       number;
  avgLarvaPerSession:   number;
  avgPrepupaPerSession: number;
  successRate:          string | number;
}

export interface HarvestStatsResponse {
  success: boolean;
  data:    HarvestStats;
}

// ─── Filters & Payloads ───────────────────────────────────────────────────────

export interface HarvestFilters {
  unitId?: string; 
  from?:   string;
  to?:     string;
  page?:   number;
  limit?:  number;
}

export interface CreateHarvestPayload {
  unitId:        string;
  larvaCount:    number;
  prepupaCount:  number;
  rejectCount:   number;
  durationSec?:  number;
  notes?:        string;
  triggerSource?: TriggerSource;
}
