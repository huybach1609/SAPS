import axios from "axios";
import { apiUrl } from "@/config/base";
import { PayOsResponse, Subscription } from "@/types/ParkingLot";


const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json',
});

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
    const response = await axios.get(`${apiUrl}/api/subscription/page`, {
      headers: getAuthHeaders(),
      params: {
        PageNumber: 1,
        PageSize: 4,
        Status: 'Active',
        Order: 'Asc',
        SortBy: 'price'
      }
    });
    return response.data.items;
  }

// New function to create payment and get transaction ID
export const createPayment = async (parkingLotId: string, subscriptionId: string): Promise<{ transactionId: string }> => {
  console.log(parkingLotId, subscriptionId);
  const response = await axios.put(`${apiUrl}/api/parkinglot/subscription`, {
    id: parkingLotId,
    subscriptionId: subscriptionId
  }, {
    headers: getAuthHeaders()
  });
  return response.data;
}

// New function to get latest payment details
export const getLatestPayment = async (parkingLotId: string): Promise<PayOsResponse> => {
  const response = await axios.get(`${apiUrl}/api/parkinglot/latest-payment/${parkingLotId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

// Keep the old function for backward compatibility if needed
export const fetchSubscriptionById = async (parkingLotId: string, subscriptionId: string): Promise<PayOsResponse> => {
  const response = await axios.get(`${apiUrl}/api/PayOs/pay/${parkingLotId}/${subscriptionId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}


// Payment status check types and API
export interface PaymentCheckResponse {
  code: string;
  desc: string;
  data: {
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
    orderCode: string;
    amount: number;
    [key: string]: any;
  };
}

export const checkPaymentStatus = async (paymentId: string): Promise<PaymentCheckResponse> => {
  // const response = await axios.get(`${apiUrl}/api/payos/${paymentId}/check`, {
  const response = await axios.get(`${apiUrl}/api/payment/${paymentId}/status`, {
    headers: getAuthHeaders()
  });
  console.log('response:', response.data);
  return response.data;
}
