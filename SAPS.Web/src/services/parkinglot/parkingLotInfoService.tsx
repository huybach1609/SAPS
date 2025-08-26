import axios from 'axios';
import { ParkingLot } from '@/types/ParkingLot';
import { Subscription } from '@/types/subscription';
import { apiUrl } from '@/config/base';
import { getAuthHeaders } from '../utils/apiUtils';

// Interface for the API response structure
interface ParkingLotApiResponse {
    description: string;
    totalParkingSlot: number;
    parkingLotOwner: {
        parkingLotOwnerId: string;
        clientKey: string;
        apiKey: string;
        checkSumKey: string;
        googleId: string | null;
        profileImageUrl: string;
        phone: string;
        updatedAt: string;
        role: string;
        email: string;
        fullName: string;
        phoneNumber: string;
        createdAt: string;
        status: string;
        id: string;
    };
    name: string;
    address: string;
    id: string;
    expiredAt?: string;
    settings?: string;
}

export const parkingLotInfoService = {
    /**
     * Fetch parking lots for a specific parking lot owner
     * @param userId - The ID of the parking lot owner
     * @returns Promise<ParkingLot[]> - Array of parking lots
     */
    fetchParkingLots: async (userId: string): Promise<ParkingLot[]> => {
        try {
            const response = await axios.get(`${apiUrl}/api/ParkingLot?parkingLotOwnerId=${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching parking lots:', error);
            throw error;
        }
    },

    /**
     * Fetch a single parking lot by its ID
     * @param parkingLotId - The ID of the parking lot
     * @returns Promise<ParkingLot> - The parking lot data
     */
    fetchParkingLotById: async (parkingLotId: string): Promise<ParkingLot> => {
        try {
            const response = await axios.get(`${apiUrl}/api/parkinglot/for-owner/${parkingLotId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            // console.log('Fetched parking lot by ID:', response.data);

            // Map the API response to ParkingLot interface
            const apiData: ParkingLotApiResponse = response.data;
            const parkingLot: ParkingLot = {
                id: apiData.id,
                name: apiData.name,
                description: apiData.description,
                address: apiData.address,
                totalParkingSlot: apiData.totalParkingSlot,
                createdAt: apiData.parkingLotOwner.createdAt, // Extract createdAt from parkingLotOwner
                updatedAt: apiData.parkingLotOwner.updatedAt, // Extract updatedAt from parkingLotOwner
                status: apiData.parkingLotOwner.status as 'Active' | 'Inactive',
                parkingLotOwnerId: apiData.parkingLotOwner.id,
                expiredAt: apiData.expiredAt,
                settings: apiData.settings
            };
            console.log('parkingLot:', parkingLot);

            return parkingLot;
        } catch (error) {
            console.error('Error fetching parking lot by ID:', error);
            throw error;
        }
    },
    fetchParkingLotSubscriptionPlan: async (parkingLotId: string): Promise<Subscription> => {
        try {
            const response = await axios.get(`${apiUrl}/api/parkinglot/subscription/${parkingLotId}`, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching parking lot subscription plan:', error);
            throw error;
        }
    },

    /**
     * Update parking lot basic information
     */
    updateParkingLotBasicInfo: async (data: {
        id: string;
        name: string;
        description: string;
        totalParkingSlot: number;
        status: string;
        settings?: string | null;
        useWhiteList?: boolean;
    }): Promise<void> => {
        try {

            // onsole.log('data:', data.useWhiteList);

            const body = {
                id: data.id,
                name: data.name,
                description: data.description,
                totalParkingSlot: data.totalParkingSlot,
                status: data.status,
                settings: JSON.stringify({ useWhiteList: data.useWhiteList ?? false })
            };
            console.log('body:', body);
            await axios.put(
                `${apiUrl}/api/parkinglot/basic-info`,
                body,
                { headers: getAuthHeaders() }
            );
        } catch (error) {
            console.error('Error updating parking lot basic info:', error);
            throw error;
        }
    }
};


