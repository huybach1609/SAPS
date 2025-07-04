import { apiUrl } from '@/config/base';
import { PaginationInfo } from '@/types/Whitelist';
import axios from 'axios';

// Types based on SAPLS database schema
export interface Vehicle {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    color: string;
    ownerVehicleFullName: string;
    status: 'Active' | 'Inactive';
    sharingStatus: 'Available' | 'Unavailable' | 'Shared' | 'Pending';
    ownerId: string;
}

export interface ParkingSession {
    id: string;
    vehicleId: string;
    parkingLotId: string;
    entryDateTime: string;
    exitDateTime: string | null;
    checkOutTime: string | null;
    entryFrontCaptureUrl: string;
    entryBackCaptureUrl: string;
    exitFrontCaptureUrl: string | null;
    exitBackCaptureUrl: string | null;
    transactionId: string | null;
    paymentMethod: 'Cash' | 'Bank';
    cost: number;
    // Joined data
    vehicle?: Vehicle;
    duration?: string;
    status: 'Completed' | 'Currently Parked' | 'Pending';
}

export interface PaginatedParkingHistoryResponse {
    data: ParkingSession[];
    pagination: PaginationInfo;
}

// Helper function to get auth headers
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json',
});

// Fetch parking history for a parking lot
export const fetchParkingHistory = async (
    parkingLotId: string, 
    pageSize: number = 10, 
    currentPage: number = 1, 
    searchKey?: string
): Promise<PaginatedParkingHistoryResponse> => {
    try {
        // Build query parameters
        const params = new URLSearchParams({
            pageSize: pageSize.toString(),
            currentPage: currentPage.toString()
        });
        
        // Only add searchKey if it's provided and not empty
        if (searchKey && searchKey.trim()) {
            params.append('searchKey', searchKey.trim());
        }
        
        const response = await axios.get(`${apiUrl}/api/ParkingSession/${parkingLotId}?${params.toString()}`, {
            headers: getAuthHeaders()
        });
        
        console.log(response.data);
        // Return the complete paginated response
        return response.data;
    } catch (error) {
        console.error('Error fetching parking history:', error);
        throw error;
    }
};

// Fetch parking history status for a parking lot
export const fetchParkingHistoryStatus = async (parkingLotId: string) => {
    if (!parkingLotId) throw new Error('Parking lot ID is required');
    try {
        const response = await axios.get(`${apiUrl}/api/ParkingSession/${parkingLotId}/status`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch parking history status');
    }
};

// Get parking session details
export const getParkingSessionDetails = async (parkingLotId: string, sessionId: string): Promise<ParkingSession> => {
    try {
        const response = await axios.get(`${apiUrl}/api/ParkingSession/${parkingLotId}/${sessionId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching parking session details:', error);
        throw error;
    }
}; 