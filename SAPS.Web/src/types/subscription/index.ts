export interface Subscription {
  id: string;
  name: string;
  duration: number; // days
  description?: string | null;
  note?: string | null;
  price: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
  lastUpdatedBy?: string;
}

export interface CreateSubscriptionDto {
  name: string;
  duration: number;
  note: string;
  price: number;
  status: "active" | "inactive";
}

export interface UpdateSubscriptionDto {
  name?: string;
  note?: string;
  price?: number;
  status?: "active" | "inactive";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
