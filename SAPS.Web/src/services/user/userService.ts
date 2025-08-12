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
  // New API format properties
  "citizen-id"?: string;
  "date-of-birth"?: string;
  sex?: boolean;
  nationality?: string;
  "place-of-origin"?: string;
  "place-of-residence"?: string;
  "full-name"?: string;
  "created-at"?: string;
}

// Paginated response interface for client users
export interface PaginatedClientResponse {
  items: ClientUser[];
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

export const userService = {
  // Get all client users (for statistics)
  async getAllClientUsers(): Promise<ApiResponse<ClientUser[]>> {
    try {
      const { data } = await api.get("/api/client/all?Order=1");
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch client users",
      };
    }
  },

  // Get paginated client users with filtering
  async getPaginatedClientUsers(
    pageNumber: number = 1,
    pageSize: number = 5,
    order: number = 1,
    status?: string,
    searchCriteria?: string
  ): Promise<ApiResponse<PaginatedClientResponse>> {
    try {
      console.log("🔄 Calling paginated client API with filters...");

      // Build query parameters
      const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        Order: order.toString(),
      });

      // Add optional filters
      if (status && status.trim()) {
        params.append("Status", status);
      }
      if (searchCriteria && searchCriteria.trim()) {
        params.append("SearchCriteria", searchCriteria);
      }

      const url = `/api/client/page?${params.toString()}`;
      console.log("📡 Client API URL with filters:", url);

      const { data } = await api.get(url);

      console.log("✅ Paginated Client API Response:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Paginated Client API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to get paginated client users",
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
