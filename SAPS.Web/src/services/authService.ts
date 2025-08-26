// import axios from "axios";
import { AdminLoginCredentials, AdminUser, ApiResponse } from "@/types/admin";
import { createApiInstance } from "./utils/apiUtils";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = createApiInstance(BASE_URL);

export const authService = {
  async login(
    credentials: AdminLoginCredentials
  ): Promise<ApiResponse<{ token: string; user: AdminUser }>> {
    try {
      const { data } = await api.post("/admin/auth/login", credentials);
      localStorage.setItem("admin_token", data.token);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("admin_token");
  },

  async getCurrentAdmin(): Promise<ApiResponse<AdminUser>> {
    try {
      const { data } = await api.get("/admin/me");
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get current admin",
      };
    }
  },
};
