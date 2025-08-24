import axios, { AxiosRequestConfig } from "axios";
import { apiUrl } from "@/config/base";

// Create axios instance with base configuration
export const createApiInstance = (customBaseUrl?: string) => {
  const api = axios.create({
    baseURL: customBaseUrl || apiUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

// Get auth headers for direct axios calls
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Config for direct axios calls
export const getAuthConfig = (): AxiosRequestConfig => {
  return {
    headers: getAuthHeaders(),
  };
};
