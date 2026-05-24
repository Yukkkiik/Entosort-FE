// ============================================================
// types/node.ts
// ============================================================

// --------------- User (relasi dari node) --------------------

export interface NodeUser {
  id: number;
  username: string;
  role: string;
}

// --------------- Node utama ---------------------------------

export interface NodeStatusResponse {
  id: number;
  nodeId: string;
  ipAddress: string | null;
  status: "online" | "offline";
  firmware: string | null;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
  nodeType: "microcontroller" | "raspberry";
  userId: number | null;
  user: NodeUser | null;
}

// Alias singkat
export type NodeStatus = NodeStatusResponse["status"];
export type NodeType = NodeStatusResponse["nodeType"];

// --------------- Request payloads ---------------------------

export interface CreateNodePayload {
  nodeId: string;
  nodeType: "microcontroller" | "raspberry";
  ipAddress?: string;
  firmware?: string;
  userId?: number;
}

export interface UpdateNodePayload {
  nodeType?: "microcontroller" | "raspberry";
  ipAddress?: string;
  firmware?: string;
  status?: "online" | "offline";
}

export interface AssignUserPayload {
  userId: number;
}

// --------------- API response wrappers ----------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

// --------------- Halaman / UI (tidak berubah) ---------------

export type SystemStatus = "online" | "offline" | "connecting";

export interface Breadcrumb {
  label: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  titleIcon?: string;
  breadcrumbs?: Breadcrumb[];
  status?: SystemStatus;
  nodeId?: string | number;
  pollInterval?: number;
  actions?: React.ReactNode;
  animationDelay?: number;
}