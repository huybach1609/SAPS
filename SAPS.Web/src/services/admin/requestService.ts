import { ApiResponse } from "@/types/admin";
import { apiUrl } from "@/config/base";
import { createApiInstance, getAuthConfig } from "../utils/apiUtils";

const api = createApiInstance();

// Define request types
export interface Request {
  id: string;
  header: string;
  type: string;
  description: string;
  senderId: string;
  senderName: string;
  sentDate: string;
  sentTime: string;
  status: "Pending" | "Approved" | "Rejected";
  iconType:
    | "user"
    | "car"
    | "shield"
    | "building"
    | "alert-circle"
    | "file-text";
  iconBg: string;
}

export interface RequestDetail {
  id: string;
  header: string;
  description: string;
  type: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  submittedDate: string;
  submittedTime: string;
  lastUpdated: string;
  status: "Pending" | "Approved" | "Rejected";
  detailedDescription: string;
  changes: string[];
  attachedFiles: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    uploadDate: string;
    uploadTime: string;
    fileFormat: string;
    url: string;
  }[];
  adminNotes: string;
  responseMessage: string;
}

// Mock data for requests list
const mockRequests: Request[] = [
  {
    id: "REQ001",
    header: "Personal Information Update",
    type: "Personal",
    description: "Update ID card and contact information",
    senderId: "U001",
    senderName: "John Smith",
    sentDate: "Jun 3, 2025",
    sentTime: "14:30 PM",
    status: "Pending",
    iconType: "user",
    iconBg: "bg-blue-500",
  },
  {
    id: "REQ002",
    header: "Vehicle Registration",
    type: "Vehicle",
    description: "Register new vehicle ABC-1278",
    senderId: "U025",
    senderName: "Sarah Johnson",
    sentDate: "Jun 3, 2025",
    sentTime: "10:15 AM",
    status: "Pending",
    iconType: "car",
    iconBg: "bg-green-500",
  },
  {
    id: "REQ003",
    header: "Account Verification",
    type: "Account",
    description: "Verify identity documents",
    senderId: "U012",
    senderName: "Mike Wilson",
    sentDate: "Jun 2, 2025",
    sentTime: "16:45 PM",
    status: "Approved",
    iconType: "shield",
    iconBg: "bg-purple-500",
  },
  {
    id: "REQ004",
    header: "Parking Lot Registration",
    type: "Facility",
    description: "Register new parking facility",
    senderId: "PO007",
    senderName: "Mall Center Corp",
    sentDate: "Jun 2, 2025",
    sentTime: "09:20 AM",
    status: "Pending",
    iconType: "building",
    iconBg: "bg-amber-500",
  },
  {
    id: "REQ005",
    header: "Vehicle Registration",
    type: "Vehicle",
    description: "Register vehicle XYZ-9999",
    senderId: "U008",
    senderName: "Emma Davis",
    sentDate: "Jun 1, 2025",
    sentTime: "11:30 AM",
    status: "Rejected",
    iconType: "car",
    iconBg: "bg-green-500",
  },
  {
    id: "REQ006",
    header: "Staff Account Request",
    type: "Account",
    description: "Create staff account for new employee",
    senderId: "PO002",
    senderName: "Airport Authority",
    sentDate: "Jun 1, 2025",
    sentTime: "08:45 AM",
    status: "Pending",
    iconType: "user",
    iconBg: "bg-blue-500",
  },
  {
    id: "REQ007",
    header: "Incident Report",
    type: "Incident",
    description: "Report of damaged vehicle in section B",
    senderId: "PO004",
    senderName: "University Campus",
    sentDate: "May 31, 2025",
    sentTime: "17:20 PM",
    status: "Pending",
    iconType: "alert-circle",
    iconBg: "bg-red-500",
  },
  {
    id: "REQ008",
    header: "Fee Structure Change",
    type: "Finance",
    description: "Request to update hourly rates",
    senderId: "PO003",
    senderName: "CityParking Inc.",
    sentDate: "May 31, 2025",
    sentTime: "13:15 PM",
    status: "Approved",
    iconType: "file-text",
    iconBg: "bg-cyan-500",
  },
  {
    id: "REQ009",
    header: "Access Permission",
    type: "Security",
    description: "Request for extended access hours",
    senderId: "PO005",
    senderName: "Metro Transportation",
    sentDate: "May 30, 2025",
    sentTime: "10:00 AM",
    status: "Rejected",
    iconType: "shield",
    iconBg: "bg-purple-500",
  },
  {
    id: "REQ010",
    header: "Equipment Installation",
    type: "Facility",
    description: "Request to install new barrier system",
    senderId: "PO001",
    senderName: "Downtown Mall",
    sentDate: "May 30, 2025",
    sentTime: "09:05 AM",
    status: "Pending",
    iconType: "building",
    iconBg: "bg-amber-500",
  },
];

// Mock request details data with attached files
const mockRequestDetails: Record<string, RequestDetail> = {
  REQ001: {
    id: "REQ001",
    header: "Personal Information Update",
    description: "Update ID card and contact information",
    type: "Personal",
    senderId: "U001",
    senderName: "John Smith",
    senderEmail: "john.smith@email.com",
    submittedDate: "June 3, 2025",
    submittedTime: "14:30 PM",
    lastUpdated: "June 3, 2025 - 14:30 PM",
    status: "Pending",
    detailedDescription:
      "I need to update my personal information in the system due to a recent change of address and phone number. I have moved to a new location and my contact details have changed. I am providing the updated identity card and supporting documents to verify the new information.",
    changes: [
      'Update residential address from "123 Old Street" to "456 Elm Street, District 3, Ho Chi Minh City"',
      'Change phone number from "+1 (555) 999-8888" to "+1 (555) 123-4567"',
      "Update emergency contact information",
    ],
    attachedFiles: [
      {
        id: "file1",
        fileName: "Updated_ID_Card.jpg",
        fileType: "Identity Card - Front Side",
        fileSize: "2.1 MB",
        uploadDate: "Jun 3, 2025",
        uploadTime: "14:25 PM",
        fileFormat: "JPG Image",
        url: "#",
      },
      {
        id: "file2",
        fileName: "Utility_Bill_June2025.pdf",
        fileType: "Proof of Address - Electricity Bill",
        fileSize: "0.65 MB",
        uploadDate: "Jun 3, 2025",
        uploadTime: "14:27 PM",
        fileFormat: "PDF Document",
        url: "#",
      },
      {
        id: "file3",
        fileName: "Bank_Statement_May2025.pdf",
        fileType: "Additional Proof of Address",
        fileSize: "1.3 MB",
        uploadDate: "Jun 3, 2025",
        uploadTime: "14:29 PM",
        fileFormat: "PDF Document",
        url: "#",
      },
    ],
    adminNotes: "",
    responseMessage: "",
  },
  REQ002: {
    id: "REQ002",
    header: "Vehicle Registration",
    description: "Register new vehicle ABC-1278",
    type: "Vehicle",
    senderId: "U025",
    senderName: "Sarah Johnson",
    senderEmail: "sarah.johnson@email.com",
    submittedDate: "June 3, 2025",
    submittedTime: "10:15 AM",
    lastUpdated: "June 3, 2025 - 10:15 AM",
    status: "Pending",
    detailedDescription:
      "I would like to register my newly purchased vehicle in the system. The vehicle is a Toyota Camry 2025 model with license plate number ABC-1278. I have attached the vehicle registration document and proof of insurance.",
    changes: [],
    attachedFiles: [
      {
        id: "file1",
        fileName: "Vehicle_Registration_ABC1278.pdf",
        fileType: "Vehicle Registration Document",
        fileSize: "1.8 MB",
        uploadDate: "Jun 3, 2025",
        uploadTime: "10:12 AM",
        fileFormat: "PDF Document",
        url: "#",
      },
      {
        id: "file2",
        fileName: "Insurance_Policy_2025.pdf",
        fileType: "Vehicle Insurance Document",
        fileSize: "0.95 MB",
        uploadDate: "Jun 3, 2025",
        uploadTime: "10:13 AM",
        fileFormat: "PDF Document",
        url: "#",
      },
    ],
    adminNotes: "",
    responseMessage: "",
  },
};

// const api = axios.create({
//   baseURL: apiUrl,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// Add token to requests
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("admin_token") || localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const requestService = {
  // Get all requests
  async getAllRequests(): Promise<ApiResponse<Request[]>> {
    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockRequests });
      }, 500);
    });
  },

  // Get request by ID
  async getRequestById(id: string): Promise<ApiResponse<RequestDetail>> {
    // Simulate API call with mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockRequestDetails[id];
        if (request) {
          resolve({ success: true, data: request });
        } else {
          reject({ success: false, error: "Request not found" });
        }
      }, 500);
    });
  },

  // Update request status and add response
  async updateRequestStatus(
    requestId: string,
    status: "Approved" | "Rejected",
    responseMessage: string,
    adminNotes: string
  ): Promise<ApiResponse<RequestDetail>> {
    // Simulate API call with mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockRequestDetails[requestId];
        if (request) {
          const updatedRequest = {
            ...request,
            status,
            responseMessage,
            adminNotes,
            lastUpdated: new Date().toLocaleString(),
          };
          mockRequestDetails[requestId] = updatedRequest;
          resolve({ success: true, data: updatedRequest });
        } else {
          reject({ success: false, error: "Request not found" });
        }
      }, 500);
    });
  },

  // Add admin note to request
  async addAdminNote(
    requestId: string,
    note: string
  ): Promise<ApiResponse<RequestDetail>> {
    // Simulate API call with mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockRequestDetails[requestId];
        if (request) {
          const updatedRequest = {
            ...request,
            adminNotes: note,
            lastUpdated: new Date().toLocaleString(),
          };
          mockRequestDetails[requestId] = updatedRequest;
          resolve({ success: true, data: updatedRequest });
        } else {
          reject({ success: false, error: "Request not found" });
        }
      }, 500);
    });
  },
};
