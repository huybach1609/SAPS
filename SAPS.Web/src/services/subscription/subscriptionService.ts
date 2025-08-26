import { PaginatedResponse } from "../../types";
import { apiUrl } from "@/config/base";
import { createApiInstance } from "../utils/apiUtils";

const api = createApiInstance();

export interface Subscription {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  status: string; // API returns "Active"/"Inactive", we'll convert in component
  lastUpdatedBy?: string;
  note?: string | null;
}

export interface CreateSubscriptionRequest {
  name: string;
  duration: number;
  price: number;
  status: string;
  note: string;
}

export interface UpdateSubscriptionRequest {
  id: string;
  name: string;
  duration: number;
  price: number;
  status: string;
  note: string;
}

export interface SubscriptionListParams {
  pageNumber: number;
  pageSize: number;
  status?: string;
  order?: number;
  searchCriteria?: string;
}

// Helper function to capitalize first letter of status
const capitalizeStatus = (status: string): string => {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Helper function to convert milliseconds to days
const millisecondsTodays = (milliseconds: number): number => {
  return Math.round(milliseconds / (1000 * 60 * 60 * 24));
};

export const subscriptionService = {
  /**
   * Get all subscriptions for statistics
   */
  async getAllSubscriptions(): Promise<Subscription[]> {
    const response = await api.get(`/api/subscription?Order=1`);
    // Map API response fields and convert milliseconds to days
    return response.data.map((sub: any) => ({
      ...sub,
      lastUpdatedBy: sub.updatedBy, // Map updatedBy to lastUpdatedBy
      duration: millisecondsTodays(sub.duration), // Convert milliseconds to days
    }));
  },

  /**
   * Get subscriptions with pagination
   */
  async getSubscriptions(
    params: SubscriptionListParams
  ): Promise<PaginatedResponse<Subscription>> {
    const { pageNumber, pageSize, status, order, searchCriteria } = params;

    let url = `/api/subscription/page?PageNumber=${pageNumber}&PageSize=${pageSize}`;

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

    // Map API response to match frontend expectations
    const result = {
      items: response.data.items.map((sub: any) => ({
        ...sub,
        lastUpdatedBy: sub.updatedBy, // Map updatedBy to lastUpdatedBy
        duration: millisecondsTodays(sub.duration), // Convert milliseconds to days
      })),
      "total-count": response.data.totalCount, // Map totalCount to total-count for compatibility
      pageNumber: response.data.pageNumber,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
      hasPreviousPage: response.data.hasPreviousPage,
      hasNextPage: response.data.hasNextPage,
    };

    return result;
  },

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await api.get(`/api/subscription/${id}`);

    // Map API response fields and convert milliseconds to days
    return {
      ...response.data,
      lastUpdatedBy: response.data.updatedBy, // Map updatedBy to lastUpdatedBy
      duration: millisecondsTodays(response.data.duration), // Convert milliseconds to days
    };
  },

  /**
   * Create new subscription
   */
  async createSubscription(
    data: CreateSubscriptionRequest
  ): Promise<Subscription> {
    // Ensure status has proper capitalization and keep duration as days
    const requestData = {
      ...data,
      status: capitalizeStatus(data.status),
      // duration stays as days - no conversion needed for request
    };

    const response = await api.post(`/api/subscription`, requestData);

    // Map API response fields and convert milliseconds to days
    return {
      ...response.data,
      lastUpdatedBy: response.data.updatedBy, // Map updatedBy to lastUpdatedBy
      duration: millisecondsTodays(response.data.duration), // Convert milliseconds to days
    };
  },

  /**
   * Update subscription
   */
  async updateSubscription(
    data: UpdateSubscriptionRequest
  ): Promise<Subscription> {
    // Ensure status has proper capitalization and keep duration as days
    const requestData = {
      ...data,
      status: capitalizeStatus(data.status),
      // duration stays as days - no conversion needed for request
    };

    const response = await api.put(`/api/subscription`, requestData);

    // Map API response fields and convert milliseconds to days
    return {
      ...response.data,
      lastUpdatedBy: response.data.updatedBy, // Map updatedBy to lastUpdatedBy
      duration: millisecondsTodays(response.data.duration), // Convert milliseconds to days
    };
  },
};
