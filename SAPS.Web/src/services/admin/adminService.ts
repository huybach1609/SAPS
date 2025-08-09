import axios from "axios";
import { AdminUser, ApiResponse } from "@/types/admin";
import { apiUrl } from "@/config/base";

// Admin DTO based on the provided backend model
export interface CreateAdminDto {
  fullName: string;
  email: string;
  phone: string;
}

// Paginated response interface matching the new API format
export interface PaginatedAdminResponse {
  items: AdminUser[];
  "total-count": number;
  "page-number": number;
  "page-size": number;
  "total-pages": number;
  "has-previous-page": boolean;
  "has-next-page": boolean;
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
      const { data } = await api.post("/api/admin", adminData);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create admin",
      };
    }
  },

  // Get all admins with pagination
  async getAllAdmins(): Promise<ApiResponse<AdminUser[]>> {
    try {
      const { data } = await api.get("/api/admin?Order=1");
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get admins",
      };
    }
  },

  // Get paginated admins using the new API endpoint with filtering
  async getPaginatedAdmins(
    pageNumber: number = 1,
    pageSize: number = 5,
    order: number = 1,
    role?: string,
    status?: string,
    searchCriteria?: string
  ): Promise<ApiResponse<PaginatedAdminResponse>> {
    try {
      console.log("🔄 Calling new paginated admin API with filters...");

      // Build query parameters
      const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        Order: order.toString(),
      });

      // Add optional filters
      if (role && role.trim()) {
        params.append("Role", role);
      }
      if (status && status.trim()) {
        params.append("Status", status);
      }
      if (searchCriteria && searchCriteria.trim()) {
        params.append("SearchCriteria", searchCriteria);
      }

      const url = `https://localhost:7040/api/admin/page?${params.toString()}`;
      console.log("📡 API URL with filters:", url);

      const { data } = await api.get(`/api/admin/page?${params.toString()}`);

      console.log("✅ New Paginated API Response:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ New Paginated API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to get paginated admins",
      };
    }
  },

  // Get admin by ID
  async getAdminById(id: string): Promise<ApiResponse<AdminUser>> {
    try {
      const { data } = await api.get(`/api/admin/${id}`);
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
      const { data } = await api.patch(`/api/admin/${adminId}/status`, {
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

  // Delete an admin
  async deleteAdmin(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/admin/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to delete admin account",
      };
    }
  },

  // Reset admin password
  async resetAdminPassword(id: string): Promise<ApiResponse<void>> {
    try {
      await api.post(`/api/admin/${id}/reset-password`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to reset admin password",
      };
    }
  },
};
