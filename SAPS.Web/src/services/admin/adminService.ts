import { AdminUser, ApiResponse } from "@/types/admin";
import { apiUrl } from "@/config/base";
import { createApiInstance } from "../utils/apiUtils";

// Admin DTO based on the provided backend model
export interface CreateAdminDto {
  adminId: string; // Thêm trường adminId
  fullName: string;
  email: string;
  phone: string;
  password: string; // Thêm trường password
}

// Paginated response interface matching the new API format
export interface PaginatedAdminResponse {
  items: AdminUser[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  // Backward compatibility
  "total-count"?: number;
  "page-number"?: number;
  "page-size"?: number;
  "total-pages"?: number;
  "has-previous-page"?: boolean;
  "has-next-page"?: boolean;
}

const api = createApiInstance(apiUrl);

export const adminService = {
  // Create a new admin
  async createAdmin(
    adminData: CreateAdminDto
  ): Promise<ApiResponse<AdminUser>> {
    try {
      // Đảm bảo adminId có độ dài dưới 36 ký tự
      if (adminData.adminId.length > 35) {
        adminData.adminId = adminData.adminId.substring(0, 35);
      }

      // Sử dụng FormData để gửi request
      const formData = new FormData();
      formData.append("AdminId", adminData.adminId);
      formData.append("Email", adminData.email);
      formData.append("Password", adminData.password);
      formData.append("FullName", adminData.fullName);
      formData.append("Phone", adminData.phone);

      const { data } = await api.post("/api/admin/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

  // Request password reset for current user
  async requestPasswordReset(): Promise<ApiResponse<void>> {
    try {
      await api.get("/api/password/request/reset");
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to send password reset request",
      };
    }
  },

  // Update user status (for head admin to update other admins)
  async updateUserStatus(
    userId: string,
    status: string
  ): Promise<ApiResponse<void>> {
    try {
      await api.put("/api/user/status", {
        id: userId,
        status: status,
      });
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update user status",
      };
    }
  },
};
