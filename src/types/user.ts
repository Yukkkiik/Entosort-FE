// types/user.ts

export type UserRole   = "superadmin" | "admin" | "peternak";
export type NodeType   = "esp32" | "raspberry";
export type NodeStatus = "online" | "offline";

// ─── Node ringkas (dari relasi di unit) ──────────────────────────────────────

export interface UserNode {
  nodeId:    string;
  nodeType:  NodeType;
  status:    NodeStatus;
  ipAddress: string | null;
  firmware:  string | null;
  lastSeen:  string | null;
}

// ─── Unit ringkas (dari relasi peternakUnit / adminUnits) ────────────────────

export interface UserUnit {
  id:       number;
  unitId:   string;
  location: string | null;
  status:   "online" | "offline";
  nodes:    UserNode[];
}

// ─── User utama ───────────────────────────────────────────────────────────────

export interface AppUser {
  id:           number;
  username:     string;
  role:         UserRole;
  phone:        string;
  createdAt:    string;
  updatedAt:    string;
  peternakUnit: UserUnit ;   // peternak: 1 unit saja
  adminUnits:   UserUnit[];        // admin: bisa banyak unit
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  username:      string;
  password:      string;
  role:          UserRole;
  phone:         string;
  selectedUnits?: string[];  // unitId[] — opsional saat create
}

export interface UpdateUserPayload {
  username?:     string;
  password?:     string;
  role?:         UserRole;
  phone?:        string;
  selectedUnits?: string[];  // re-assign unit
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface UsersResponse {
  success: boolean;
  data:    AppUser[];
}

export interface UserResponse {
  success: boolean;
  message: string;
  data:    AppUser;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
