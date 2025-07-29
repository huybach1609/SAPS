export interface Subscription {
  id: string;
  name: string;
  duration: number; // milliseconds
  description: string;
  price: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriptionDto {
  name: string;
  duration: number;
  description: string;
  price: number;
  status: "active" | "inactive";
}

export interface UpdateSubscriptionDto {
  name?: string;
  description?: string;
  price?: number;
  status?: "active" | "inactive";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
