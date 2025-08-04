import axios from "axios";
import { apiUrl } from "@/config/base";
import { ApiResponse } from "@/types/admin";

// Client User interface based on the mock data structure
export interface ClientUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  status: "active" | "suspended";
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

export const userService = {
  // Get all client users
  async getAllClientUsers(): Promise<ApiResponse<ClientUser[]>> {
    try {
      const { data } = await api.get("/api/UserClient");
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch client users",
      };
    }
  },

  // Get client user by ID
  async getClientUserById(id: string): Promise<ApiResponse<ClientUser>> {
    try {
      const { data } = await api.get(`/api/Users/clients/${id}`);
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to get client user details",
      };
    }
  },

  // Update client user status
  async updateClientUserStatus(
    userId: string,
    status: "active" | "suspended"
  ): Promise<ApiResponse<ClientUser>> {
    try {
      const { data } = await api.patch(`/api/Users/clients/${userId}/status`, {
        status,
      });
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to update client user status",
      };
    }
  },
};
