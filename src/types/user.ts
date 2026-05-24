// types/user.ts

export type UserRole   = "admin" | "peternak";
export type NodeType   = "microcontroller" | "raspberry";
export type NodeStatus = "online" | "offline";

// ─── Node (dari relasi) ───────────────────────────────────────────────────────

export interface AppNode {
  id:        number;
  nodeId:    string;
  nodeType:  NodeType;
  status:    NodeStatus;
  ipAddress: string | null;
  firmware:  string | null;
  lastSeen:  string | null;
  createdAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id:        number;
  username:  string;
  role:      UserRole;
  phone:     string;
  createdAt: string;
  updatedAt: string;
  nodes:     AppNode[];   // ← relasi 1-to-many dari Prisma include
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  username: string;
  password: string;
  role:     UserRole;
  phone:    string;
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  role?:     UserRole;
  phone?:    string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

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