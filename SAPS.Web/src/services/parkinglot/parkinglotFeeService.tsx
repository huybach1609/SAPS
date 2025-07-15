import axios from 'axios';
import { apiUrl } from '@/config/base';

// Custom error types for better error handling
export class ParkingFeeError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public isBusinessError: boolean = false,
        public errors?: string[] // <-- add this
    ) {
        super(message);
        this.name = 'ParkingFeeError';
    }
}

// // Types based on the database schema
// export interface ParkingLot {
//     id: string;
//     name: string;
//     description?: string;
//     address: string;
//     totalParkingSlot: number;
//     createdAt: string;
//     updatedAt: string;
//     status: 'Active' | 'Inactive';
//     parkingLotOwnerId: string;
// }

export enum VehicleType {
    All = 0,
    Car = 1,
    Motorbike = 2,
    Bike = 3,
}

export interface ParkingFeeSchedule {
    id: string;
    name: string;
    startTime: number; // minutes from midnight
    endTime: number; // minutes from midnight
    initialFee: number;
    additionalFee: number;
    additionalMinutes: number;
    dayOfWeeks?: number[]; // 0=Monday, 6=Sunday
    isActive: boolean;
    updatedAt: string;
    forVehicleType: VehicleType;
    parkingLotId: string;
    // validFrom: Date;
    // validTo: Date;
    initialFeeMinutes: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json',
});

// Fetch all fee schedules for a parking lot
export const fetchFeeSchedules = async (parkingLotId: string): Promise<ParkingFeeSchedule[]> => {
    try {
        const response = await axios.get(`${apiUrl}/api/ParkingFeeSchedule/${parkingLotId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching parking fee schedules:', error);
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 401) {
                throw new ParkingFeeError('Authentication required. Please log in again.', status);
            } else if (status === 403) {
                throw new ParkingFeeError('You do not have permission to view fee schedules.', status);
            } else if (status === 404) {
                throw new ParkingFeeError('Parking lot not found or no schedules available.', status);
            } else if (status >= 500) {
                throw new ParkingFeeError('Server error. Please try again later.', status);
            } else {
                const errorMessage = data?.error || data?.message || 'Failed to fetch fee schedules';
                throw new ParkingFeeError(errorMessage, status);
            }
        } else if (error.request) {
            // Network error
            throw new ParkingFeeError('Network error. Please check your connection and try again.');
        } else {
            // Other error
            throw new ParkingFeeError(error.message || 'An unexpected error occurred');
        }
    }
};

// Create a new fee schedule
export const createFeeSchedule = async (
    parkingLotId: string,
    scheduleData: Partial<ParkingFeeSchedule>
): Promise<ParkingFeeSchedule> => {
    try {
        const newScheduleData = {
            startTime: scheduleData.startTime || 0,
            endTime: scheduleData.endTime || 1440,
            initialFee: scheduleData.initialFee || 0,
            additionalFee: scheduleData.additionalFee || 0,
            additionalMinutes: scheduleData.additionalMinutes || 60,
            dayOfWeeks: scheduleData.dayOfWeeks,
            isActive: scheduleData.isActive !== undefined ? scheduleData.isActive : true,
            updatedAt: new Date().toISOString(),
            forVehicleType: scheduleData.forVehicleType || 'Car',
            parkingLotId: parkingLotId,
        };

        const response = await axios.post(
            `${apiUrl}/api/ParkingFeeSchedule/${parkingLotId}`,
            newScheduleData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        console.error('Error creating parking fee schedule:', error);
        
        // Parse error response
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 400) {
                let errorMessage = 'Invalid schedule configuration';
                let errorList: string[] | undefined = undefined;
                if (Array.isArray(data?.errors)) {
                    errorList = data.errors;
                    errorMessage = data.errors.join(', ');
                } else if (data?.error) {
                    errorMessage = data.error;
                }
                throw new ParkingFeeError(errorMessage, status, true, errorList);
            } else if (status === 401) {
                throw new ParkingFeeError('Authentication required. Please log in again.', status);
            } else if (status === 403) {
                throw new ParkingFeeError('You do not have permission to create fee schedules.', status);
            } else if (status === 404) {
                throw new ParkingFeeError('Parking lot not found.', status);
            } else if (status >= 500) {
                throw new ParkingFeeError('Server error. Please try again later.', status);
            } else {
                const errorMessage = data?.error || data?.message || 'Failed to create fee schedule';
                throw new ParkingFeeError(errorMessage, status);
            }
        } else if (error.request) {
            // Network error
            throw new ParkingFeeError('Network error. Please check your connection and try again.');
        } else {
            // Other error
            throw new ParkingFeeError(error.message || 'An unexpected error occurred');
        }
    }
};

// Update an existing fee schedule
export const updateFeeSchedule = async (
    parkingLotId: string,
    scheduleId: string,
    scheduleData: Partial<ParkingFeeSchedule>
): Promise<ParkingFeeSchedule> => {
    try {
        const response = await axios.put(
            `${apiUrl}/api/ParkingFeeSchedule/${parkingLotId}/${scheduleId}`,
            {
                ...scheduleData,
                UpdatedAt: new Date().toISOString()
            },
            { headers: getAuthHeaders() }
        );
        return response.data;

    } catch (error: any) {
        console.error('Error updating parking fee schedule:', error);
        
        // Parse error response
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 400) {
                let errorMessage = 'Invalid schedule configuration';
                let errorList: string[] | undefined = undefined;
                if (Array.isArray(data?.errors)) {
                    errorList = data.errors;
                    errorMessage = data.errors.join(', ');
                } else if (data?.error) {
                    errorMessage = data.error;
                }
                throw new ParkingFeeError(errorMessage, status, true, errorList);
            } else if (status === 401) {
                throw new ParkingFeeError('Authentication required. Please log in again.', status);
            } else if (status === 403) {
                throw new ParkingFeeError('You do not have permission to update fee schedules.', status);
            } else if (status === 404) {
                throw new ParkingFeeError('Fee schedule or parking lot not found.', status);
            } else if (status >= 500) {
                throw new ParkingFeeError('Server error. Please try again later.', status);
            } else {
                const errorMessage = data?.error || data?.message || 'Failed to update fee schedule';
                throw new ParkingFeeError(errorMessage, status);
            }
        } else if (error.request) {
            // Network error
            throw new ParkingFeeError('Network error. Please check your connection and try again.');
        } else {
            // Other error
            throw new ParkingFeeError(error.message || 'An unexpected error occurred');
        }
    }
};

// Delete a fee schedule
export const deleteFeeSchedule = async (parkingLotId: string, scheduleId: string): Promise<void> => {
    try {
        await axios.delete(
            `${apiUrl}/api/ParkingFeeSchedule/${parkingLotId}/${scheduleId}`,
            {
                headers: getAuthHeaders(),
                data: { id: scheduleId },
            }
        );
    } catch (error: any) {
        console.error('Error deleting parking fee schedule:', error);
        
        // Parse error response
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 400) {
                let errorMessage = 'Cannot delete this schedule';
                let errorList: string[] | undefined = undefined;
                if (Array.isArray(data?.errors)) {
                    errorList = data.errors;
                    errorMessage = data.errors.join(', ');
                } else if (data?.error) {
                    errorMessage = data.error;
                }
                throw new ParkingFeeError(errorMessage, status, true, errorList);
            } else if (status === 401) {
                throw new ParkingFeeError('Authentication required. Please log in again.', status);
            } else if (status === 403) {
                throw new ParkingFeeError('You do not have permission to delete fee schedules.', status);
            } else if (status === 404) {
                throw new ParkingFeeError('Fee schedule not found.', status);
            } else if (status >= 500) {
                throw new ParkingFeeError('Server error. Please try again later.', status);
            } else {
                const errorMessage = data?.error || data?.message || 'Failed to delete fee schedule';
                throw new ParkingFeeError(errorMessage, status);
            }
        } else if (error.request) {
            // Network error
            throw new ParkingFeeError('Network error. Please check your connection and try again.');
        } else {
            // Other error
            throw new ParkingFeeError(error.message || 'An unexpected error occurred');
        }
    }
};
