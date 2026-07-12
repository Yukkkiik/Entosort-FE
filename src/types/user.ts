// types/user.ts

export type UserRole   = "superadmin" | "admin" | "operator";
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

// ─── Unit ringkas (dari relasi operatorUnit / adminUnits) ────────────────────

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
  operatorUnit: UserUnit ;  
  adminUnits:   UserUnit[];     
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  username:      string;
  password:      string;
  role:          UserRole;
  phone:         string;
  selectedUnits?: string[]; 
}

export interface UpdateUserPayload {
  username?:     string;
  password?:     string;
  role?:         UserRole;
  phone?:        string;
  selectedUnits?: string[]; 
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
