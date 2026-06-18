// types/report.ts

// ─── Daily report ─────────────────────────────────────────────────────────────

export interface DailyReportSession {
  id:            number;
  unitId:        string;
  peternak:      string;
  larvaCount:    number;
  prepupaCount:  number;
  rejectCount:   number;
  totalCount:    number;
  durationSec:   number | null;
  triggerSource: string;
  recordedAt:    string;
}

export interface DailyReportStats {
  totalSessions:  number;
  totalLarva:     number;
  totalPrepupa:   number;
  totalReject:    number;
  totalHarvested: number;
  successRate:    string | number;
}

export interface DailyReport {
  date:     string;
  unitId:   string;
  stats:    DailyReportStats;
  sessions: DailyReportSession[];
}

export interface DailyReportResponse {
  success: boolean;
  data:    DailyReport;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ReportFilters {
  unitId?: string;
  from?:   string;
  to?:     string;
  date?:   string;  // untuk daily report (YYYY-MM-DD)
}
