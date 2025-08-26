import { AddStaffFormRequest } from "@/components/utils/staffUtils";
import { apiUrl } from "@/config/base";
import { User } from "@/types/User";
import axios from "axios";
import { getAuthConfig, getAuthHeaders } from "../utils/apiUtils";
// import { AddStaffFormRequest } from '../../pages/ParkingLotOwner/StaffManagement/StaffManagement';

// Short ID generation utility for staff IDs
function generateShortStaffId(): string {
  // Generate a shorter ID (20 characters) to avoid database truncation
  return "xxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, function () {
    const r = Math.floor(Math.random() * 36); // Use base 36 (0-9, a-z)
    return r.toString(36);
  });
}

// Generate secure random password that meets the specified requirements
function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?';
  
  // Ensure at least one character from each required category
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)]; // 1 lowercase
  password += uppercase[Math.floor(Math.random() * uppercase.length)]; // 1 uppercase
  password += digits[Math.floor(Math.random() * digits.length)]; // 1 digit
  password += specialChars[Math.floor(Math.random() * specialChars.length)]; // 1 special char
  
  // Fill the rest with random characters from all categories
  const allChars = lowercase + uppercase + digits + specialChars;
  const remainingLength = Math.floor(Math.random() * (24 - 8 + 1)) + 8 - 4; // Random length between 8-24, minus the 4 we already added
  
  for (let i = 0; i < remainingLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Validate full name to contain only letters and spaces
function validateFullName(fullName: string): boolean {
  // Regex to match only letters, spaces, and common name characters like hyphens and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s\-'\.]+$/;
  return nameRegex.test(fullName.trim());
}

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
  items: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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
    // Validate full name
    if (!validateFullName(staff.fullName)) {
      throw new Error("FULL_NAME_LETTERS_ONLY");
    }
    
    // Generate short ID for staffId to avoid database truncation
    const staffId = generateShortStaffId();
    
    // Generate secure password
    const securePassword = generateSecurePassword();
    
    // Prepare the request body according to the new API structure
    const requestBody = {
      email: staff.email,
      password: securePassword, // Use generated secure password
      fullName: staff.fullName,
      phone: staff.phone,
      // profileImage: "string", // Default value as per API spec
      staffId: staffId,
      parkingLotId: parkingLotId
    };

    const response = await axios.post(
      `${apiUrl}/api/staff/register`,
      requestBody,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw new Error(error as string);
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
  pageNumber: number = 1,
  searchCriteria?: string,
  status?: string,
  order?: string,
  sortBy?: string
): Promise<PaginatedStafflistResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
      ParkingLotId: parkingLotId,
    });

    // Only add searchCriteria if it's provided and not empty
    if (searchCriteria && searchCriteria.trim()) {
      params.append("SearchCriteria", searchCriteria.trim());
    }

    // Only add status if it's provided and not empty
    if (status && status.trim()) {
      params.append("Status", status.trim());
    }

    // Only add order if it's provided and not empty
    if (order && order.trim()) {
      params.append("Order", order.trim());
    }

    // Only add sortBy if it's provided and not empty
    if (sortBy && sortBy.trim()) {
      params.append("SortBy", sortBy.trim());
    }
    

    console.log(`${apiUrl}/api/staff/page?${params.toString()}`);
    const response = await axios.get(
      `${apiUrl}/api/staff/page?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log("staffService: fetchStaffList", response.data); 
    // Return the complete paginated response
    return response.data;
  } catch (error) {
    console.error("Error fetching staff list:", error);
    throw error;
  }
};

// Fetch staff detail by staffId
export async function fetchStaffDetail(staffId: string) {
  if (!staffId)
    throw new Error("Staff ID is required");
  try {
    const response = await axios.get(
      `${apiUrl}/api/staff/${staffId}`,
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
