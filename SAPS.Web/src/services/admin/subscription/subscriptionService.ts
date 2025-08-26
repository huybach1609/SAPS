import axios from "axios";
import {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  ApiResponse,
} from "@/types/subscription";
import { apiUrl } from "@/config/base";
import { createApiInstance } from "../../utils/apiUtils";

/**
 * Subscription Service - Real API Implementation Only
 *
 * This service calls actual API endpoints exclusively.
 * Features:
 * - GET /api/subscriptions - Get all subscriptions
 * - GET /api/subscriptions/{id} - Get subscription by ID
 * - POST /api/subscriptions - Create new subscription
 * - PUT /api/subscriptions/{id} - Update subscription
 * - PATCH /api/subscriptions/{id}/status - Update subscription status
 * - DELETE /api/subscriptions/{id} - Delete subscription
 *
 * API Response Format:
 * - Server returns status as "Active"/"Inactive" (title case)
 * - Client converts to "active"/"inactive" (lowercase) for consistency
 *
 * No fallback: All API failures will return error responses
 */
const api = createApiInstance(apiUrl);

export const subscriptionService = {
  // Get all subscriptions
  async getAllSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    try {
      // Call actual API
      const { data } = await api.get("/api/subscription");

      // Map the API response to match our interface
      const mappedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        duration: item.duration,
        description: "", // Not provided by API, set default
        price: item.price,
        status: item.status.toLowerCase(), // Convert "Active" to "active"
        createdAt: "", // Not provided by API, set default
        updatedAt: "", // Not provided by API, set default
        lastUpdatedBy: "", // Not provided by API, set default
      }));

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch subscriptions",
      };
    }
  }, // Get subscription by ID
  async getSubscriptionById(id: string): Promise<ApiResponse<Subscription>> {
    try {
      // Call actual API
      const { data } = await api.get(`/api/subscriptions/${id}`);

      // Map the API response to match our interface
      const mappedData = {
        id: data.id,
        name: data.name,
        duration: data.duration,
        description: data.description,
        price: data.price,
        status: data.status.toLowerCase(), // Convert "Active" to "active"
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastUpdatedBy: data.lastUpdatedBy,
      };

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error("Get subscription by ID API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch subscription details",
      };
    }
  },

  // Create new subscription
  async createSubscription(
    subscriptionData: CreateSubscriptionDto
  ): Promise<ApiResponse<Subscription>> {
    try {
      // Prepare data for API (convert status to title case if needed)
      const apiData = {
        ...subscriptionData,
        status: subscriptionData.status.toLocaleLowerCase(),
      };

      // Call actual API
      const { data } = await api.post("/api/Subscription", apiData);

      // Map the API response to match our interface
      const mappedData = {
        id: data.id,
        name: data.name,
        duration: data.duration,
        description: data.description,
        price: data.price,
        status: data.status.toLowerCase(), // Convert "Active" to "active"
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastUpdatedBy: data.lastUpdatedBy,
      };

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error("Create subscription API Error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create subscription",
      };
    }
  },

  // Update subscription
  async updateSubscription(
    id: string,
    updateData: UpdateSubscriptionDto
  ): Promise<ApiResponse<Subscription>> {
    try {
      // Prepare data for API (convert status to title case if needed)
      const apiData = {
        ...updateData,
        status: updateData.status
          ? updateData.status.toLocaleLowerCase()
          : undefined,
      };

      // Call actual API
      const { data } = await api.put(`/api/Subscription/${id}`, apiData);

      // Map the API response to match our interface
      const mappedData = {
        id: data.id,
        name: data.name,
        duration: data.duration,
        description: data.description,
        price: data.price,
        status: data.status.toLowerCase(), // Convert "Active" to "active"
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastUpdatedBy: data.lastUpdatedBy,
      };

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error("Update subscription API Error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update subscription",
      };
    }
  },

  // Update subscription status
  async updateSubscriptionStatus(
    id: string,
    status: "active" | "inactive"
  ): Promise<ApiResponse<Subscription>> {
    try {
      // Prepare data for API (convert status to title case)
      const apiStatus = status.charAt(0).toUpperCase() + status.slice(1);

      // Call actual API
      const { data } = await api.patch(`/api/subscriptions/${id}/status`, {
        status: apiStatus,
      });

      // Map the API response to match our interface
      const mappedData = {
        id: data.id,
        name: data.name,
        duration: data.duration,
        description: data.description,
        price: data.price,
        status: data.status.toLowerCase(), // Convert "Active" to "active"
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastUpdatedBy: data.lastUpdatedBy,
      };

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error("Update status API Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to update subscription status",
      };
    }
  },

  // Delete subscription (soft delete - set status to inactive)
  async deleteSubscription(id: string): Promise<ApiResponse<void>> {
    try {
      // Call actual API
      await api.delete(`/api/subscriptions/${id}`);

      return { success: true };
    } catch (error: any) {
      console.error("Delete subscription API Error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete subscription",
      };
    }
  },
};
