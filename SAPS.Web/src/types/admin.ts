// Admin related types
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  adminId: string;
  role: "admin" | "head_admin";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
