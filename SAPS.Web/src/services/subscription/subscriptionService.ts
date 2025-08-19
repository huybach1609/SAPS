import axios from "axios";
import { PaginatedResponse } from "../../types";
import { apiUrl } from "@/config/base";

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

const baseUrl = apiUrl;

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
    const response = await axios.get(`${baseUrl}/api/subscription?Order=1`);
    // Convert milliseconds to days for frontend consumption
    return response.data.map((sub: any) => ({
      ...sub,
      duration: millisecondsTodays(sub.duration),
    }));
  },

  /**
   * Get subscriptions with pagination
   */
  async getSubscriptions(
    params: SubscriptionListParams
  ): Promise<PaginatedResponse<Subscription>> {
    const { pageNumber, pageSize, status, order, searchCriteria } = params;

    let url = `${baseUrl}/api/subscription/page?PageNumber=${pageNumber}&PageSize=${pageSize}`;

    if (status && status !== "All") {
      url += `&Status=${status}`;
    }

    if (order !== undefined) {
      url += `&Order=${order}`;
    }

    if (searchCriteria) {
      url += `&SearchCriteria=${searchCriteria}`;
    }

    const response = await axios.get(url);

    // Convert milliseconds to days for frontend consumption
    const result = {
      ...response.data,
      items: response.data.items.map((sub: any) => ({
        ...sub,
        duration: millisecondsTodays(sub.duration),
      })),
    };

    return result;
  },

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await axios.get(`${baseUrl}/api/subscription/${id}`);

    // Convert response duration from milliseconds to days for frontend
    return {
      ...response.data,
      duration: millisecondsTodays(response.data.duration),
    };
  },

  /**
   * Create new subscription
   */
  async createSubscription(
    data: CreateSubscriptionRequest
  ): Promise<Subscription> {
    // Ensure status has proper capitalization but keep duration as days
    const requestData = {
      ...data,
      status: capitalizeStatus(data.status),
      // duration stays as days - no conversion to milliseconds
    };

    const response = await axios.post(
      `${baseUrl}/api/subscription`,
      requestData
    );

    // Convert response duration from milliseconds to days for frontend
    return {
      ...response.data,
      duration: millisecondsTodays(response.data.duration),
    };
  },

  /**
   * Update subscription
   */
  async updateSubscription(
    data: UpdateSubscriptionRequest
  ): Promise<Subscription> {
    // Ensure status has proper capitalization but keep duration as days
    const requestData = {
      ...data,
      status: capitalizeStatus(data.status),
      // duration stays as days - no conversion to milliseconds
    };

    const response = await axios.put(
      `${baseUrl}/api/subscription`,
      requestData
    );

    // Convert response duration from milliseconds to days for frontend
    return {
      ...response.data,
      duration: millisecondsTodays(response.data.duration),
    };
  },
};
