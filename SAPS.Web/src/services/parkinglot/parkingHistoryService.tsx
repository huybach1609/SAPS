import { apiUrl } from '@/config/base';
// import { ParkingSessionStatus } from '@/types/ParkingSession';
// import { PaginationInfo } from '@/types/Whitelist';
import axios from 'axios';

// Types based on new API response structure
export interface Vehicle {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    color: string;
    status: 'Active' | 'Inactive';
    sharingStatus: 'Available' | 'Unavailable' | 'Shared' | 'Pending';
}

export interface Owner {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    createdAt: string;
    status: 'Active' | 'Inactive';
}

export interface ParkingSession {
    id: string;
    vehicle: Vehicle;
    owner: Owner;
    entryDateTime: string;
    exitDateTime: string | null;
    checkOutDateTime: string | null;
    entryFrontCaptureUrl: string;
    entryBackCaptureUrl: string;
    exitFrontCaptureUrl: string | null;
    exitBackCaptureUrl: string | null;
    paymentMethod: string;
    cost: number;
    status: string;
    paymentStatus: string;
    // Legacy fields for backward compatibility
    licensePlate?: string;
    parkingLotName?: string;
    vehicleId?: string;
    parkingLotId?: string;
    checkOutTime?: string | null;
    transactionId?: string | null;
    duration?: string;
}

export interface PaginatedParkingHistoryResponse {
    items: ParkingSession[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// Helper function to get auth headers
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
});

// Helper function to get client ID from JWT token
// const getClientId = (): string => {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//         throw new Error('No access token found');
//     }
    
//     try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
//     } catch (error) {
//         console.error('Error parsing JWT token:', error);
//         throw new Error('Invalid token format');
//     }
// };


export const parkingHistoryService = {
    // Fetch parking history for a client (parking lot owner)
    fetchParkingHistory: async (
        parkingLotId: string,
        pageSize: number = 10,
        currentPage: number = 1,
        searchCriteria?: string,
        status?: string,
        startExitDate?: string,
        endExitDate?: string,
        order?: string,
        sortBy?: string
    ): Promise<PaginatedParkingHistoryResponse> => {
        try {
            // const clientId = getClientId();
            
            // Build query parameters
            const params = new URLSearchParams({
                PageNumber: currentPage.toString(),
                PageSize: pageSize.toString()
            });

            // Add optional parameters if provided
            if (searchCriteria && searchCriteria.trim()) {
                params.append('SearchCriteria', searchCriteria.trim());
            }
            if (status && status.trim()) {
                params.append('Status', status.trim());
            }
            if (startExitDate) {
                params.append('StartExitDate', startExitDate);
            }
            if (endExitDate) {
                params.append('EndExitDate', endExitDate);
            }
            if (order && order.trim()) {
                params.append('Order', order.trim());
            }
            if (sortBy && sortBy.trim()) {
                params.append('SortBy', sortBy.trim());
            }

            params.append('ParkingLotId', parkingLotId);
            console.log(`${apiUrl}/api/parkingsession/page/by-lot?${params.toString()}`);
            const response = await axios.get(`${apiUrl}/api/parkingsession/page/by-lot?${params.toString()}`, {
                headers: getAuthHeaders()
            });

            // console.log(response.data);
            // Return the complete paginated response
            return response.data;
        } catch (error) {
            console.error('Error fetching parking history:', error);
            throw error;
        }
    },

    // Fetch parking history status for a parking lot
    fetchParkingHistoryStatus: async (parkingLotId: string) => {
        if (!parkingLotId) throw new Error('Parking lot ID is required');
        try {
            const response = await axios.get(`${apiUrl}/api/ParkingSession/${parkingLotId}/status`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch parking history status');
        }
    },
    // Get parking session details
    getParkingSessionDetails: async (sessionId: string): Promise<ParkingSession> => {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }
        
        try {
            const response = await axios.get(`${apiUrl}/api/parkingsession/lot/${sessionId}`, {
                headers: getAuthHeaders()
            });
            return response.data.data; // Return the data property from the response
        } catch (error) {
            console.error('Error fetching parking session details:', error);
            throw new Error('Failed to fetch parking session details');
        }
    },
}