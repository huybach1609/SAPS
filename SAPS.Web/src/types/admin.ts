// Admin related types
export interface AdminUser {
  id: string;
  // Mới - camelCase
  adminId: string;
  adminRole: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  createdAt: string;
  status: string;

  // Cũ - kebab-case (cho backward compatibility)
  "admin-id"?: string;
  "admin-role"?: string;
  "full-name"?: string;
  "created-at"?: string;

  // Computed properties
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
