// Admin related types
export interface AdminUser {
  id: string;
  "admin-id": string;
  "admin-role": string;
  email: string;
  "full-name": string;
  "created-at": string;
  status: string;
  // Add computed properties for backward compatibility
  adminId?: string;
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role?: string;
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
