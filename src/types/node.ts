// types/node.ts

// ─── Enums ────────────────────────────────────────────────────────────────────

export type NodeType   = "esp32" | "raspberry";
export type NodeStatus = "online" | "offline";

// ─── Node utama (read-only, dibuat dari MQTT heartbeat) ──────────────────────

export interface AppNode {
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

// ─── API responses ────────────────────────────────────────────────────────────

export interface NodesResponse {
  success: boolean;
  data:    AppNode[];
}

export interface NodeResponse {
  success: boolean;
  data:    AppNode | null;
}

// ─── UI / Page types (tidak berubah) ─────────────────────────────────────────

export type SystemStatus = "online" | "offline" | "connecting";

export interface Breadcrumb {
  label: string;
}

export interface PageHeaderProps {
  title:         string;
  subtitle?:     string;
  titleIcon?:    string;
  breadcrumbs?:  Breadcrumb[];
  status?:       SystemStatus;
  unitId?:       string;
  pollInterval?: number;
  actions?:      React.ReactNode;
  animationDelay?: number;
}
