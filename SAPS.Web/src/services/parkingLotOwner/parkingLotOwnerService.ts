import { PaginatedResponse } from "../../types";
import { createApiInstance } from "../utils/apiUtils";

const api = createApiInstance();

export interface ParkingLotOwner {
  parkingLotOwnerId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  status: string;
  id: string;
}

export interface ParkingLotOwnerDetails {
  parkingLotOwnerId: string;
  clientKey: string;
  apiKey: string;
  checkSumKey: string;
  googleId: string | null;
  profileImageUrl: string | null;
  phone: string;
  updatedAt: string;
  role: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  status: string;
  id: string;
}

export interface PaymentSource {
  "bank-name": string;
  "account-name": string;
  "account-number": string;
  "parking-lot-owner-id": string;
  status: string;
  id: string;
}

export interface ParkingLot {
  name: string;
  address: string;
  isExpired: boolean;
  totalParkingSlot: number;
  description: string;
  id: string;
}

export interface UpdateApiKeysRequest {
  id: string;
  parkingLotOwnerId: string;
  clientKey: string;
  apiKey: string;
  checkSumKey: string;
}

export interface CreateOwnerRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  profileImage?: string | null;
  parkingLotOwnerId: string;
  clientKey: string;
  apiKey: string;
  checkSumKey: string;
}

export interface CreateParkingLotRequest {
  parkingLotOwnerId: string;
  subscriptionId: string;
  name: string;
  description: string;
  address: string;
  totalParkingSlot: number;
}

export interface Subscription {
  id: string;
  name: string;
  duration: number;
  price: number;
  status: string;
  updatedBy: string;
}

export interface ParkingLotOwnerListParams {
  pageNumber: number;
  pageSize: number;
  status?: string;
  order?: number;
  searchCriteria?: string;
}

export interface ParkingLotListParams {
  pageNumber: number;
  pageSize: number;
  parkingLotOwnerId: string;
  order?: number;
}

export const parkingLotOwnerService = {
  /**
   * Get all parking lot owners for statistics
   */
  async getAllParkingLotOwners(): Promise<ParkingLotOwner[]> {
    const response = await api.get(`/api/parkinglotowner?Order=1`);
    return response.data;
  },

  /**
   * Get parking lot owners with pagination
   */
  async getParkingLotOwners(
    params: ParkingLotOwnerListParams
  ): Promise<PaginatedResponse<ParkingLotOwner>> {
    const { pageNumber, pageSize, status, order, searchCriteria } = params;

    let url = `/api/parkinglotowner/page?PageNumber=${pageNumber}&PageSize=${pageSize}`;

    if (status && status !== "All") {
      url += `&Status=${status}`;
    }

    if (order !== undefined) {
      url += `&Order=${order}`;
    }

    if (searchCriteria) {
      url += `&SearchCriteria=${searchCriteria}`;
    }

    const response = await api.get(url);

    // Map new API response format to existing frontend format
    const result = {
      items: response.data.items,
      "total-count": response.data.totalCount,
      "page-number": response.data.pageNumber,
      "page-size": response.data.pageSize,
      "total-pages": response.data.totalPages,
      "has-previous-page": response.data.hasPreviousPage,
      "has-next-page": response.data.hasNextPage,
    };

    return result;
  },

  /**
   * Get parking lot owner details by ID
   */
  async getParkingLotOwnerDetails(id: string): Promise<ParkingLotOwnerDetails> {
    const response = await api.get(`/api/parkinglotowner/user/${id}`);
    return response.data;
  },

  /**
   * Get parking lots for a parking lot owner with pagination
   */
  async getOwnerParkingLots(
    params: ParkingLotListParams
  ): Promise<PaginatedResponse<ParkingLot>> {
    const { pageNumber, pageSize, parkingLotOwnerId, order } = params;

    let url = `/api/parkinglot/page?ParkingLotOwnerId=${parkingLotOwnerId}&PageNumber=${pageNumber}&PageSize=${pageSize}`;

    if (order !== undefined) {
      url += `&Order=${order}`;
    }

    const response = await api.get(url);

    // Map new API response format to existing frontend format
    const result = {
      items: response.data.items,
      "total-count": response.data.totalCount,
      "page-number": response.data.pageNumber,
      "page-size": response.data.pageSize,
      "total-pages": response.data.totalPages,
      "has-previous-page": response.data.hasPreviousPage,
      "has-next-page": response.data.hasNextPage,
    };

    return result;
  },

  /**
   * Update API Configuration Keys for parking lot owner
   */
  async updateApiKeys(
    data: UpdateApiKeysRequest
  ): Promise<ParkingLotOwnerDetails> {
    const response = await api.put("/api/parkinglotowner", data);
    return response.data;
  },

  /**
   * Get active subscriptions for parking lot selection
   */
  async getActiveSubscriptions(): Promise<Subscription[]> {
    const response = await api.get("/api/subscription?Status=Active");
    return response.data;
  },

  /**
   * Register new parking lot owner
   */
  async registerOwner(
    data: CreateOwnerRequest
  ): Promise<ParkingLotOwnerDetails> {
    const response = await api.post("/api/parkinglotowner/register", data);
    return response.data;
  },

  /**
   * Create new parking lot
   */
  async createParkingLot(data: CreateParkingLotRequest): Promise<any> {
    const response = await api.post("/api/parkinglot", data);
    return response.data;
  },
};
