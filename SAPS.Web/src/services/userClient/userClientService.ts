import axios from "axios";
import { apiUrl } from "@/config/base";
import { ApiResponse } from "@/types/admin";
import { UserDetails } from "@/types/UserClient";

// Client details interface matching the new API format
export interface ClientDetailsResponse {
  "citizen-id": string;
  "date-of-birth": string;
  sex: boolean;
  nationality: string;
  "place-of-origin": string;
  "place-of-residence": string;
  "profile-image-url": string | null;
  phone: string;
  "updated-at": string;
  email: string;
  "full-name": string;
  "created-at": string;
  status: string;
  id: string;
}

// Vehicle interface for the new API
export interface VehicleResponse {
  "license-plate": string;
  brand: string;
  model: string;
  color: string;
  status: string;
  "sharing-status": string;
  id: string;
}

// Paginated vehicle response
export interface PaginatedVehicleResponse {
  items: VehicleResponse[];
  "total-count": number;
  "page-number": number;
  "page-size": number;
  "total-pages": number;
  "has-previous-page": boolean;
  "has-next-page": boolean;
}

// Parking session interface
export interface ParkingSessionResponse {
  "parking-lot-name": string;
  "license-plate": string;
  "entry-date-time": string;
  "exit-date-time": string;
  cost: number;
  status: string;
  "payment-status": string;
  id: string;
}

// Shared vehicle interface
export interface SharedVehicleResponse {
  "license-plate": string;
  brand: string;
  model: string;
  color: string;
  status: string;
  "owner-name": string;
  id: string;
}

// Paginated shared vehicle response
export interface PaginatedSharedVehicleResponse {
  items: SharedVehicleResponse[];
  "total-count": number;
  "page-number": number;
  "page-size": number;
  "total-pages": number;
  "has-previous-page": boolean;
  "has-next-page": boolean;
}

// Paginated parking session response
export interface PaginatedParkingSessionResponse {
  items: ParkingSessionResponse[];
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

export const userClientService = {
  // Get client details by ID using new API
  async getClientDetails(
    id: string
  ): Promise<ApiResponse<ClientDetailsResponse>> {
    try {
      console.log(`🔄 Fetching client details for ID: ${id}`);
      const { data } = await api.get(`/api/client/details?Id=${id}`);

      console.log("✅ Client details API response:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Get client details API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch client details",
      };
    }
  },

  // Get client vehicles with pagination
  async getClientVehicles(
    ownerId: string,
    pageNumber: number = 1,
    pageSize: number = 5,
    order: number = 1
  ): Promise<ApiResponse<PaginatedVehicleResponse>> {
    try {
      console.log(`🔄 Fetching vehicles for owner ID: ${ownerId}`);
      const { data } = await api.get(
        `/api/vehicle/page?PageNumber=${pageNumber}&PageSize=${pageSize}&OwnerId=${ownerId}&Order=${order}`
      );

      console.log("✅ Client vehicles API response:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Get client vehicles API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch client vehicles",
      };
    }
  },

  // Get client parking sessions
  async getClientParkingSessions(
    clientId: string
  ): Promise<ApiResponse<ParkingSessionResponse[]>> {
    try {
      console.log(`🔄 Fetching parking sessions for client ID: ${clientId}`);
      const { data } = await api.get(
        `/api/parkingsession/client?ClientId=${clientId}&Order=1`
      );

      console.log("✅ Client parking sessions API response:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Get client parking sessions API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch client parking sessions",
      };
    }
  },

  // Get client parking sessions with pagination
  async getClientParkingSessionsPaginated(
    clientId: string,
    pageNumber: number = 1,
    pageSize: number = 5,
    order: number = 1
  ): Promise<ApiResponse<PaginatedParkingSessionResponse>> {
    try {
      console.log(
        `🔄 Fetching paginated parking sessions for client ID: ${clientId}`
      );
      const { data } = await api.get(
        `/api/parkingsession/client/page?PageNumber=${pageNumber}&PageSize=${pageSize}&ClientId=${clientId}&Order=${order}`
      );

      console.log("✅ Client paginated parking sessions API response:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error(
        "❌ Get client paginated parking sessions API Error:",
        error
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch paginated client parking sessions",
      };
    }
  },

  // Get client shared vehicles with pagination
  async getClientSharedVehicles(
    sharedPersonId: string,
    pageNumber: number = 1,
    pageSize: number = 5,
    order: number = 1
  ): Promise<ApiResponse<PaginatedSharedVehicleResponse>> {
    try {
      console.log(
        `🔄 Fetching shared vehicles for person ID: ${sharedPersonId}`
      );
      const { data } = await api.get(
        `/api/sharedvehicle/page?PageNumber=${pageNumber}&PageSize=${pageSize}&SharedPersonId=${sharedPersonId}&Order=${order}`
      );

      console.log("✅ Client shared vehicles API response:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Get client shared vehicles API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch client shared vehicles",
      };
    }
  },

  // Get user client details by ID (legacy method - keeping for backward compatibility)
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

  // Update user client status
  async banUserClient(id: string, status: string): Promise<ApiResponse<void>> {
    try {
      console.log(`🔄 Updating user client status to ${status} with ID: ${id}`);
      await api.put(`/api/user/status`, {
        id: id,
        status: status,
      });

      console.log("✅ User client status updated successfully");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Update user status API Error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update user status",
      };
    }
  },
};
