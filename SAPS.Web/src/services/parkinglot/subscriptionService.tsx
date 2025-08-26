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


  export const fetchSubscriptionById = async (parkingLotId: string, subscriptionId: string): Promise<PayOsResponse> => {
    const response = await axios.get(`${apiUrl}/api/PayOs/pay/${parkingLotId}/${subscriptionId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }

