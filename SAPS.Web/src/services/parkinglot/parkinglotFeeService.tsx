import axios from 'axios';
import { apiUrl } from '@/config/base';

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

export interface ParkingFeeSchedule {
    id: string;
    startTime: number; // minutes from midnight
    endTime: number; // minutes from midnight
    initialFee: number;
    additionalFee: number;
    additionalMinutes: number;
    dayOfWeeks?: number[]; // 0=Monday, 6=Sunday
    isActive: boolean;
    updatedAt: string;
    forVehicleType: 'Car' | 'Motorbike';
    parkingLotId: string;
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
    } catch (error) {
        console.error('Error fetching parking fee schedules:', error);
        throw error;
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
    } catch (error) {
        console.error('Error creating parking fee schedule:', error);
        throw error;
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
        
    } catch (error) {
        console.error('Error updating parking fee schedule:', error);
        throw error;
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
    } catch (error) {
        console.error('Error deleting parking fee schedule:', error);
        throw error;
    }
};
