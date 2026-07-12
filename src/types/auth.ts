export type UserRole = "superadmin"|"admin" | "operator";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  phone: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
 
export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}