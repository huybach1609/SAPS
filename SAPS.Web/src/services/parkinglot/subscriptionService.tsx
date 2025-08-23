import axios from "axios";
import { apiUrl } from "@/config/base";
import { PayOsResponse, Subscription } from "@/types/ParkingLot";


const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Content-Type': 'application/json',
});

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
    const response = await axios.get(`${apiUrl}/api/Subscription/plans`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }


  export const fetchSubscriptionById = async (parkingLotId: string, subscriptionId: string): Promise<PayOsResponse> => {
    const response = await axios.get(`${apiUrl}/api/PayOs/pay/${parkingLotId}/${subscriptionId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }

