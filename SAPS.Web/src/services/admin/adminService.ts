import axios from "axios";
import { AdminUser, ApiResponse } from "@/types/admin";
import { apiUrl } from "@/config/base";

// Admin DTO based on the provided backend model
export interface CreateAdminDto {
  fullName: string;
  email: string;
  phone: string;
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("admin_token") || localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminService = {
  // Create a new admin
  async createAdmin(
    adminData: CreateAdminDto
  ): Promise<ApiResponse<AdminUser>> {
    try {
      const { data } = await api.post("/api/Admin", adminData);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create admin",
      };
    }
  },

  // Get all admins
  async getAllAdmins(): Promise<ApiResponse<AdminUser[]>> {
    try {
      const { data } = await api.get("/api/Admin");
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get admins",
      };
    }
  },

  // Get admin by ID
  async getAdminById(id: string): Promise<ApiResponse<AdminUser>> {
    try {
      const { data } = await api.get(`/api/Admin/${id}`);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get admin details",
      };
    }
  },

  // Update admin status
  async updateAdminStatus(
    adminId: string,
    status: "active" | "suspended"
  ): Promise<ApiResponse<AdminUser>> {
    try {
      const { data } = await api.patch(`/api/Admin/${adminId}/status`, {
        status,
      });
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update admin status",
      };
    }
  },
};
