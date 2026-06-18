// types/sensor.ts

// ─── Node ringkas (dari relasi) ───────────────────────────────────────────────

export interface SensorNode {
  nodeId:   string;
  nodeType: "esp32" | "raspberry";
  status:   "online" | "offline";
}

// ─── Unit ringkas (dari relasi) ───────────────────────────────────────────────

export interface SensorUnit {
  unitId: string;
  status: "online" | "offline";
}

// ─── Sensor log utama ─────────────────────────────────────────────────────────

export interface SensorLog {
  id:          number;
  nodeId:      string;
  unitId:      string;
  temperature: number | null;
  humidity:    number | null;
  pressure:    number | null;
  recordedAt:  string;
  node?:       SensorNode;
  unit?:       SensorUnit;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface SensorFilters {
  nodeId?: string;
  unitId?: string;
  from?:   string;
  to?:     string;
  limit?:  number;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface SensorResponse {
  success: boolean;
  data:    SensorLog | null;
}

export interface SensorListResponse {
  success: boolean;
  data:    SensorLog[];
}
