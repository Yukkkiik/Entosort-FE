// types/harvest.ts

export interface HarvestUser {
  id:       number;
  username: string;
}

export interface HarvestNode {
  nodeId: string;
}

export interface HarvestLog {
  id:           number;
  nodeId:       string;
  userId:       number | null;
  larvaCount:   number;
  prepupaCount: number;
  rejectCount:  number;
  totalCount:   number;
  durationSec:  number | null;
  notes:        string | null;
  recordedAt:   string;
  user:         HarvestUser | null;
  node?:        HarvestNode;
}

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

export interface HarvestFilters {
  nodeId?: string;
  from?:   string;
  to?:     string;
  page?:   number;
  limit?:  number;
}