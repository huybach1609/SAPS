import axios from 'axios';
import { apiUrl } from '@/config/base';
import type { Whitelist, PaginatedWhitelistResponse, WhitelistStatus } from '@/types/Whitelist';
import { User } from '@/types/User';

// Helper function to get auth headers
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
});


// Fetch all whitelist entries for a parking lot
export const fetchWhitelist = async (
    parkingLotId: string,
    pageSize: number = 10,
    currentPage: number = 1,
    searchKey?: string
): Promise<PaginatedWhitelistResponse> => {
    try {
        // Build query parameters
        const params = new URLSearchParams({
            PageSize: pageSize.toString(),
            PageNumber: currentPage.toString(),
            ParkingLotId: parkingLotId
        });

        // Only add searchKey if it's provided and not empty
        if (searchKey && searchKey.trim()) {
            params.append('SearchCriteria', searchKey.trim());
        }

        console.log(`${apiUrl}/api/whitelist/page?${params.toString()}`);
        const response = await axios.get(`${apiUrl}/api/whitelist/page?${params.toString()}`, {
            headers: getAuthHeaders()
        });

        // Return the complete paginated response
        return response.data;
    } catch (error) {
        console.error('Error fetching whitelist:', error);
        throw error;
    }
};

// Add a client to whitelist
export const addToWhitelist = async (
    parkingLotId: string,
    clientId: string,
    expireAt?: string
): Promise<Whitelist> => {
    try {
        const whitelistData = {
            parkingLotId,
            clientId,
            expireAt: expireAt ? new Date(expireAt).toISOString() : null,
        };

        
        console.log('Whitelist data:', whitelistData);
        const response = await axios.post(
            `${apiUrl}/api/whitelist`,
            whitelistData,
            { headers: getAuthHeaders() }
        );
        console.log('Whitelist response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding to whitelist:', error);
        throw error;
    }
};

// Remove a client from whitelist
export const removeFromWhitelist = async (parkingLotId: string, clientId: string): Promise<void> => {
    try {
        const response = await fetch(`${apiUrl}/api/whitelist`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            body: JSON.stringify({ parkingLotId, clientId })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to remove from whitelist');
        }
    } catch (error) {
        console.error('Error removing from whitelist:', error);
        throw error;
    }
};

// Update whitelist entry (e.g., extend expiry date)
export const updateWhitelistEntry = async (
    parkingLotId: string,
    clientId: string,
    expiredDate?: string
): Promise<Whitelist> => {
    try {
        const body = {
            parkingLotId,
            clientId,
            expiredDate: expiredDate ? new Date(expiredDate).toISOString() : null,
        };

        const response = await fetch(`${apiUrl}/api/whitelist/expire-date`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to update whitelist entry');
        }

        // Some APIs return 200 OK with no body
        const text = await response.text();
        return text ? JSON.parse(text) : ({} as unknown as Whitelist);
    } catch (error) {
        console.error('Error updating whitelist entry:', error);
        throw error;
    }
};


// Fetch whitelist status for a parking lot
export const fetchWhitelistStatus = async (parkingLotId: string): Promise<WhitelistStatus> => {
    try {
        console.log(`${apiUrl}/api/Whitelist/${parkingLotId}/status`);
        const response = await axios.get(`${apiUrl}/api/Whitelist/${parkingLotId}/status`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching whitelist status:', error);
        throw error;
    }
};

// Search user by phone or email. Returns a single user object or null if not found
export const searchUser = async (searchTerm: string): Promise<User | null> => {
    try {
        const url = `${apiUrl}/api/user/search/${encodeURIComponent(searchTerm)}`;
        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });
        return response.data ?? null;
    } catch (error: any) {
        // If API returns 404 for not found, map to null instead of throwing
        if (error?.response?.status === 404) {
            return null;
        }
        console.error('Error searching user:', error);
        throw error;
    }
}; 