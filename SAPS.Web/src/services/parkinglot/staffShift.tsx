// StaffShift TypeScript Interface and Validation Functions

import { ParkingLot } from "@/types/ParkingLot";
import { StaffProfile } from "@/types/User";
import { apiUrl } from '@/config/base';
import axios from 'axios';

export interface StaffShift {
  id: string;
  staffIds: string[];
  parkingLotId: string;
  startTime: number; // Minutes from midnight (0-1439)
  endTime: number; // Minutes from midnight (0-1439)
  shiftType: 'Regular' | 'Emergency';
  dayOfWeeks?: string | null; // Comma-separated: "1,2,3,4,5" or null
  specificDate?: string | null; // ISO date string or null
  isActive: boolean;
  status: 'Scheduled' | 'Active' | 'Deactive';
  notes?: string | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string

  parkingLot?: ParkingLot;
  assignedStaff?: StaffProfile[];
}

// Type for creating new StaffShift (optional fields for defaults)
export interface CreateStaffShift {
  id?: string;
  staffIds: string[];
  parkingLotId: string;
  startTime: number;
  endTime: number;
  shiftType?: 'Regular' | 'Emergency';
  dayOfWeeks?: string | null;
  specificDate?: string | null;
  isActive?: boolean;
  status?: 'Scheduled' | 'Active' | 'Deactive';
  notes?: string | null;
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Content-Type': 'application/json',
});

// API Service Functions

/**
 * Fetch all staff shifts for a parking lot
 */
export async function fetchStaffShifts(parkingLotId: string): Promise<StaffShift[]> {
  if (!parkingLotId) throw new Error('Parking lot ID is required');
  try {
    const response = await axios.get(`${apiUrl}/api/Shift/parking-lot/${parkingLotId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff shifts:', error);
    throw new Error('Failed to fetch staff shifts');
  }
}

/**
 * Create a new staff shift
 */
export async function createStaffShift(parkingLotId: string, shiftData: CreateStaffShift): Promise<StaffShift> {
  if (!parkingLotId) throw new Error('Parking lot ID is required');
  try {
    const response = await axios.post(`${apiUrl}/api/Shift`, shiftData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing staff shift
 */
export async function updateStaffShift(parkingLotId: string, shiftId: string, shiftData: Partial<StaffShift>): Promise<StaffShift> {
  if (!parkingLotId || !shiftId) throw new Error('Parking lot ID and shift ID are required');
  try {
    const response = await axios.put(`${apiUrl}/api/Shift/${shiftId}`, shiftData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a staff shift
 */
export async function deleteStaffShift(parkingLotId: string, shiftId: string): Promise<void> {
  if (!parkingLotId || !shiftId) throw new Error('Parking lot ID and shift ID are required');
  try {
    await axios.delete(`${apiUrl}/api/Shift/${shiftId}`, {
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Error deleting staff shift:', error);
    throw new Error('Failed to delete staff shift');
  }
}

/**
 * Get a specific staff shift by ID
 */
export async function getStaffShift(parkingLotId: string, shiftId: string): Promise<StaffShift> {
  if (!parkingLotId || !shiftId) throw new Error('Parking lot ID and shift ID are required');
  try {
    const response = await axios.get(`${apiUrl}/api/StaffShift/shift/${shiftId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff shift:', error);
    throw new Error('Failed to fetch staff shift');
  }
}

