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
    initialFeeMinutes: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
});

export const parkinglotFeeScheduleApi = {
    
// Fetch all fee schedules for a parking lot
fetchFeeSchedules: async (parkingLotId: string): Promise<ParkingFeeSchedule[]> => {
    try {
        const response = await axios.get(`${apiUrl}/api/parkingfeeschedule/by-parking-lot/${parkingLotId}`,{
            headers: getAuthHeaders()
        });
        const apiItems: any[] = Array.isArray(response.data) ? response.data : [];

        const toNumberArrayFromString = (value: unknown): number[] => {
            if (Array.isArray(value)) {
                return (value as unknown[])
                    .map((v) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? n : undefined;
                    })
                    .filter((v): v is number => typeof v === 'number');
            }
            if (typeof value !== 'string') return [];
            return value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .map((s) => Number(s))
                .filter((n) => Number.isFinite(n));
        };

        const toVehicleTypeEnum = (value: unknown): VehicleType => {
            if (typeof value !== 'string') return VehicleType.Car;
            const normalized = value.trim().toLowerCase();
            switch (normalized) {
                case 'car':
                case 'cars':
                    return VehicleType.Car;
                case 'motorbike':
                case 'motorcycle':
                case 'motorcycles':
                    return VehicleType.Motorbike;
                default:
                    return VehicleType.Car;
            }
        };

        const mapped: ParkingFeeSchedule[] = apiItems.map((item) => ({
            id: String(item.id ?? ''),
            name: String(item.name ?? ''),
            startTime: Number(item.startTime ?? 0),
            endTime: Number(item.endTime ?? 1440),
            initialFee: Number(item.initialFee ?? 0),
            additionalFee: Number(item.additionalFee ?? 0),
            additionalMinutes: Number(item.additionalMinutes ?? 60),
            dayOfWeeks: toNumberArrayFromString(item.dayOfWeeks),
            isActive: Boolean(item.isActive ?? true),
            updatedAt: String(item.updatedAt ?? new Date().toISOString()),
            forVehicleType: toVehicleTypeEnum(item.forVehicleType),
            parkingLotId: String(item.parkingLotId ?? parkingLotId),
            initialFeeMinutes: Number(item.initialFeeMinutes ?? 0),
        }));

        return mapped;
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
},

// Create a new fee schedule
createFeeSchedule: async (
    parkingLotId: string,
    scheduleData: Partial<ParkingFeeSchedule>
): Promise<ParkingFeeSchedule> => {
    try {
        const normalizeDayOfWeeks = (value: unknown): number[] => {
            if (!Array.isArray(value)) return [];
            const nums = (value as unknown[])
                .map((v) => Number(v))
                .filter((n) => Number.isFinite(n)) as number[];
            // If looks like 0..6, convert to 1..7. If already 1..7, keep.
            const isZeroBased = nums.every((n) => n >= 0 && n <= 6) && !nums.some((n) => n === 7);
            return (isZeroBased ? nums.map((n) => n + 1) : nums)
                .filter((n) => n >= 1 && n <= 7);
        };

        const vehicleTypeString = (() => {
            const value = scheduleData.forVehicleType;
            if (typeof value === 'string') return value; // assume already 'Car' | 'Motorbike'
            switch (value) {
                case VehicleType.Motorbike:
                    return 'Motorbike';
                case VehicleType.Car:
                default:
                    return 'Car';
            }
        })();

        const requestBody = {
            startTime: scheduleData.startTime ?? 0,
            endTime: scheduleData.endTime ?? 1440,
            initialFee: scheduleData.initialFee ?? 0,
            additionalFee: scheduleData.additionalFee ?? 0,
            additionalMinutes: scheduleData.additionalMinutes ?? 60,
            dayOfWeeks: normalizeDayOfWeeks(scheduleData.dayOfWeeks as any).join(','),
            forVehicleType: vehicleTypeString,
            parkingLotId,
        };

        const response = await axios.post(
            `${apiUrl}/api/parkingFeeSchedule`,
            requestBody,
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
},

// Update an existing fee schedule
updateFeeSchedule: async (
    parkingLotId: string,
    scheduleId: string,
    scheduleData: Partial<ParkingFeeSchedule>
): Promise<ParkingFeeSchedule> => {
    try {
        const normalizeDayOfWeeks = (value: unknown): number[] => {
            if (!Array.isArray(value)) return [];
            const nums = (value as unknown[])
                .map((v) => Number(v))
                .filter((n) => Number.isFinite(n)) as number[];
            const isZeroBased = nums.every((n) => n >= 0 && n <= 6) && !nums.some((n) => n === 7);
            return (isZeroBased ? nums.map((n) => n + 1) : nums)
                .filter((n) => n >= 1 && n <= 7);
        };

        const vehicleTypeString = (() => {
            const value = scheduleData.forVehicleType;
            if (typeof value === 'string') return value; // assume already 'Car' | 'Motorbike'
            switch (value) {
                case VehicleType.Motorbike:
                    return 'Motorbike';
                case VehicleType.Car:
                default:
                    return 'Car';
            }
        })();

        const requestBody = {
            id: scheduleId,
            startTime: scheduleData.startTime ?? 0,
            endTime: scheduleData.endTime ?? 1440,
            initialFee: scheduleData.initialFee ?? 0,
            additionalFee: scheduleData.additionalFee ?? 0,
            additionalMinutes: scheduleData.additionalMinutes ?? 60,
            dayOfWeeks: normalizeDayOfWeeks(scheduleData.dayOfWeeks as any).join(','),
            forVehicleType: vehicleTypeString,
            parkingLotId,
            isActive: scheduleData.isActive ?? true,
        };

        const response = await axios.put(
            `${apiUrl}/api/parkingFeeSchedule`,
            requestBody,
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
},

// Delete a fee schedule
 deleteFeeSchedule: async (parkingLotId: string, scheduleId: string): Promise<void> => {
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
}

}