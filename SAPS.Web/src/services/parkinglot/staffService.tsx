import { AddStaffFormRequest } from "@/components/utils/staffUtils";
import { apiUrl } from "@/config/base";
import { User } from "@/types/User";
import { PaginationInfo } from "@/types/Whitelist";
import axios from "axios";
import { getAuthConfig, getAuthHeaders } from "../utils/apiUtils";
// import { AddStaffFormRequest } from '../../pages/ParkingLotOwner/StaffManagement/StaffManagement';

export async function fetchStaffListStatus(parkingLotId: string) {
  if (!parkingLotId) throw new Error("Parking lot ID is required");
  try {
    const response = await axios.get(
      `${apiUrl}/api/Staff/${parkingLotId}/status`,
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch staff list status");
  }
}

export interface PaginatedStafflistResponse {
  data: User[];
  pagination: PaginationInfo;
}

export async function removeStaff(parkingLotid: string, staffId: string) {
  try {
    const response = await axios.delete(
      `${apiUrl}/api/Staff/${parkingLotid}/${staffId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to remove staff");
  }
}

export async function deactivateStaff(parkingLotid: string, staffId: string) {
  try {
    const response = await axios.patch(
      `${apiUrl}/api/Staff/${parkingLotid}/${staffId}/deactivate`,
      {
        status: "deactive",
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to deactivate staff");
  }
}

export async function addStaff(
  parkingLotId: string,
  staff: AddStaffFormRequest
) {
  try {
    const response = await axios.post(
      `${apiUrl}/api/Staff/${parkingLotId}`,
      staff,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to add staff");
  }
}
export async function updateStaff(
  parkingLotId: string,
  staff: AddStaffFormRequest
) {
  try {
    const response = await axios.put(
      `${apiUrl}/api/Staff/${parkingLotId}`,
      staff,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update staff");
  }
}
// Fetch all whitelist entries for a parking lot
export const fetchStaffList = async (
  parkingLotId: string,
  pageSize: number = 10,
  currentPage: number = 1,
  searchKey?: string,
  status?: number
): Promise<PaginatedStafflistResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
      currentPage: currentPage.toString(),
    });

    // Only add searchKey if it's provided and not empty
    if (searchKey && searchKey.trim()) {
      params.append("searchKey", searchKey.trim());
    }

    // Only add status if it's provided and not undefined
    if (status !== undefined && status !== null) {
      params.append("status", status.toString());
    }

    console.log(`${apiUrl}/api/Staff/${parkingLotId}?${params.toString()}`);
    const response = await axios.get(
      `${apiUrl}/api/Staff/${parkingLotId}?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    // Return the complete paginated response
    return response.data;
  } catch (error) {
    console.error("Error fetching staff list:", error);
    throw error;
  }
};

// Fetch staff detail by parkingLotId and staffId
export async function fetchStaffDetail(parkingLotId: string, staffId: string) {
  if (!staffId || !parkingLotId)
    throw new Error("Staff ID and Parking Lot ID are required");
  try {
    const response = await axios.get(
      `${apiUrl}/api/Staff/${parkingLotId}/${staffId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching staff details");
  }
}

export async function fetchStaffShiftList(parkingLotId: string) {
  try {
    const response = await axios.get(
      `${apiUrl}/api/StaffShift/${parkingLotId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching staff shift list");
  }
}
export async function searchStaff(keySearch: string, parkingLotId: string) {
  try {
    const url = `${apiUrl}/api/shift/parking-lot/${parkingLotId}/search-staff?keySearch=${keySearch}`;
    console.log(url);
    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error("Error searching staff");
  }
}
