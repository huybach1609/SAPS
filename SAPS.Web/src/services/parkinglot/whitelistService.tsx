import axios from 'axios';
import { apiUrl } from '@/config/base';
import type { Whitelist, PaginatedWhitelistResponse, WhitelistStatus } from '@/types/Whitelist';
import { User } from '@/types/User';

// Helper function to get auth headers
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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
            pageSize: pageSize.toString(),
            currentPage: currentPage.toString()
        });

        // Only add searchKey if it's provided and not empty
        if (searchKey && searchKey.trim()) {
            params.append('searchKey', searchKey.trim());
        }

        console.log(`${apiUrl}/api/Whitelist/${parkingLotId}?${params.toString()}`);
        const response = await axios.get(`${apiUrl}/api/Whitelist/${parkingLotId}?${params.toString()}`, {
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
    expiredDate?: string
): Promise<Whitelist> => {
    try {
        const whitelistData = {
            parkingLotId,
            clientId,
            addedDate: new Date().toISOString(),
            expiredDate: expiredDate ? new Date(expiredDate).toISOString() : null,
            client: null // Add this if required by DTO
        };

        console.log('Whitelist data:', whitelistData);
        const response = await axios.post(
            `${apiUrl}/api/Whitelist/${parkingLotId}`,
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
        await axios.delete(
            `${apiUrl}/api/Whitelist/${parkingLotId}/${clientId}`,
            { headers: getAuthHeaders() }
        );
    } catch (error) {
        console.error('Error removing from whitelist:', error);
        throw error;
    }
};

// Update whitelist entry (e.g., extend expiry date)
export const updateWhitelistEntry = async (
    parkingLotId: string,
    clientId: string,
    updates: Partial<Whitelist>
): Promise<Whitelist> => {
    console.log('Updates:', updates);
    try {
        const response = await axios.put(
            `${apiUrl}/api/Whitelist/${parkingLotId}/${clientId}`,
            updates,
            { headers: getAuthHeaders() }
        );
        return response.data;
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

// Search whitelist entries by user info
export const searchUser = async (searchTerm: string, parkingLotId?: string): Promise<User[]> => {
    try {
        const url =
            `${apiUrl}/api/whitelist/${parkingLotId}/search?q=${encodeURIComponent(searchTerm)}`;
        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error searching whitelist:', error);
        throw error;
    }
}; 