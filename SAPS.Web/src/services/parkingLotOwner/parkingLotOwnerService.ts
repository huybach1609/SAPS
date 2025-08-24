import { PaginatedResponse } from "../../types";
import { apiUrl } from "@/config/base";
import { createApiInstance, getAuthConfig } from "../utils/apiUtils";

const api = createApiInstance();

export interface ParkingLotOwner {
  "parking-lot-owner-id": string;
  email: string;
  "full-name": string;
  "created-at": string;
  status: string;
  id: string;
}

export interface ParkingLotOwnerDetails extends ParkingLotOwner {
  "profile-image-url": string | null;
  phone: string;
  "updated-at": string;
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
  description: string;
  "total-parking-slot": number;
  id: string;
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
    return response.data;
  },

  /**
   * Get parking lot owner details by ID
   */
  async getParkingLotOwnerDetails(id: string): Promise<ParkingLotOwnerDetails> {
    const response = await api.get(`/api/parkinglotowner/details?Id=${id}`);
    return response.data;
  },

  /**
   * Get payment sources for a parking lot owner
   */
  async getOwnerPaymentSources(ownerId: string): Promise<PaymentSource[]> {
    const response = await api.get(`/api/paymentsource/owner/${ownerId}`);
    return response.data;
  },

  /**
   * Get parking lots for a parking lot owner with pagination
   */
  async getOwnerParkingLots(
    params: ParkingLotListParams
  ): Promise<PaginatedResponse<ParkingLot>> {
    const { pageNumber, pageSize, parkingLotOwnerId, order } = params;

    let url = `/api/parkinglot/page?PageNumber=${pageNumber}&PageSize=${pageSize}&ParkingLotOwnerId=${parkingLotOwnerId}`;

    if (order !== undefined) {
      url += `&Order=${order}`;
    }

    const response = await api.get(url);
    return response.data;
  },
};
