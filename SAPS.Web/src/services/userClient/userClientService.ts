// import { apiUrl } from "@/config/base";
import { ApiResponse } from "@/types/admin";
import { UserDetails } from "@/types/UserClient";
import { createApiInstance } from "../utils/apiUtils";

// Create API instance
const api = createApiInstance();

// Client details interface matching the new API format
export interface ClientDetailsResponse {
  // Support both kebab-case and camelCase formats
  "citizen-id"?: string;
  citizenId?: string;
  "date-of-birth"?: string;
  dateOfBirth?: string;
  sex: boolean;
  nationality: string;
  "place-of-origin"?: string;
  placeOfOrigin?: string;
  "place-of-residence"?: string;
  placeOfResidence?: string;
  "profile-image-url"?: string | null;
  profileImageUrl?: string | null;
  phone?: string;
  phoneNumber?: string;
  "updated-at"?: string;
  updatedAt?: string;
  role?: string;
  email: string;
  "full-name"?: string;
  fullName?: string;
  "created-at"?: string;
  createdAt?: string;
  googleId?: string | null;
  status: string;
  id: string;
}

// Vehicle interface for the new API
export interface VehicleResponse {
  "license-plate"?: string;
  licensePlate?: string;
  brand: string;
  model: string;
  color: string;
  status: string;
  "sharing-status"?: string;
  sharingStatus?: string;
  id: string;
}

// Paginated vehicle response
export interface PaginatedVehicleResponse {
  items: VehicleResponse[];
  "total-count"?: number;
  totalCount?: number;
  "page-number"?: number;
  pageNumber?: number;
  "page-size"?: number;
  pageSize?: number;
  "total-pages"?: number;
  totalPages?: number;
  "has-previous-page"?: boolean;
  hasPreviousPage?: boolean;
  "has-next-page"?: boolean;
  hasNextPage?: boolean;
}

// Parking session interface
export interface ParkingSessionResponse {
  "parking-lot-name"?: string;
  parkingLotName?: string;
  "license-plate"?: string;
  licensePlate?: string;
  "entry-date-time"?: string;
  entryDateTime?: string;
  "exit-date-time"?: string;
  exitDateTime?: string;
  cost: number;
  status: string;
  "payment-status"?: string;
  paymentStatus?: string;
  id: string;
}

// Shared vehicle interface
export interface SharedVehicleResponse {
  "license-plate"?: string;
  licensePlate?: string;
  brand: string;
  model: string;
  color: string;
  status: string;
  "owner-name"?: string;
  ownerName?: string;
  "access-duration"?: number;
  accessDuration?: number;
  id: string;
}

// Paginated shared vehicle response
export interface PaginatedSharedVehicleResponse {
  items: SharedVehicleResponse[];
  "total-count"?: number;
  totalCount?: number;
  "page-number"?: number;
  pageNumber?: number;
  "page-size"?: number;
  pageSize?: number;
  "total-pages"?: number;
  totalPages?: number;
  "has-previous-page"?: boolean;
  hasPreviousPage?: boolean;
  "has-next-page"?: boolean;
  hasNextPage?: boolean;
}

// Paginated parking session response
export interface PaginatedParkingSessionResponse {
  items: ParkingSessionResponse[];
  "total-count"?: number;
  totalCount?: number;
  "page-number"?: number;
  pageNumber?: number;
  "page-size"?: number;
  pageSize?: number;
  "total-pages"?: number;
  totalPages?: number;
  "has-previous-page"?: boolean;
  hasPreviousPage?: boolean;
  "has-next-page"?: boolean;
  hasNextPage?: boolean;
}

export const userClientService = {
  // Get client details by ID using new API
  async getClientDetails(
    id: string
  ): Promise<ApiResponse<ClientDetailsResponse>> {
    try {
      console.log(`🔄 Fetching client details for ID: ${id}`);
      const { data } = await api.get(`/api/client/user/${id}`);

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
      const response = await api.get(
        `/api/parkingsession/by-client?ClientId=${clientId}&Order=1`
      );

      // Handle the response format where data is nested under the "data" field
      const parkingSessions = response.data.data;

      console.log("✅ Client parking sessions API response:", parkingSessions);
      return { success: true, data: parkingSessions };
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

      const response = await api.get(
        `/api/parkingsession/page/by-client?ClientId=${clientId}&Order=${order}&PageNumber=${pageNumber}&PageSize=${pageSize}`
      );

      // Handle the new response format where data contains paginated structure
      const paginatedData = response.data.data;

      console.log(
        "✅ Client paginated parking sessions API response:",
        paginatedData
      );

      // Return the data directly as it already has the correct paginated structure
      return { success: true, data: paginatedData };
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
