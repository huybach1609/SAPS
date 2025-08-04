import axios from "axios";
import { apiUrl } from "@/config/base";
import { ApiResponse } from "@/types/admin";
import { UserDetails } from "@/types/UserClient";

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

export const userClientService = {
  // Get user client details by ID
  async getUserClientDetails(id: string): Promise<ApiResponse<UserDetails>> {
    try {
      console.log(`🔄 Fetching user client details for ID: ${id}`);
      const { data } = await api.get(`/api/UserClient/${id}`);

      console.log("✅ User client details API response:", data);

      // API trả về data đã đúng format UserDetails, không cần mapping
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Get user client details API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch user client details",
      };
    }
  },

  // Ban user client
  async banUserClient(id: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🔄 Banning user client with ID: ${id}`);
      await api.put(`/api/UserClient/${id}/banOrUnban`);

      console.log("✅ User client banned successfully");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Ban user client API Error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to ban user client",
      };
    }
  },
};
