import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { ArrowLeft, ShieldAlert, Key } from "lucide-react";

// Mock admin data (matching the same format from AdminAccountList)
const mockAdmins = [
  {
    id: "A001",
    fullName: "John David Smith",
    email: "john.admin@sapls.com",
    role: "Head Admin",
    createdAt: "Jan 1, 2024",
    status: "Active",
    protected: true,
    department: "System Administration",
    phoneNumber: "+1 (555) 123-4567",
    lastLogin: "June 3, 2025 - 08:30 AM",
    employeeId: "EMP-2024-001",
  },
  {
    id: "A002",
    fullName: "Sarah Michelle Johnson",
    email: "sarah.admin@sapls.com",
    role: "Admin",
    createdAt: "Jan 15, 2024",
    status: "Active",
    protected: false,
    department: "System Administration",
    phoneNumber: "+1 (555) 987-6543",
    lastLogin: "June 3, 2025 - 08:30 AM",
    employeeId: "EMP-2024-002",
  },
  {
    id: "A003",
    fullName: "Michael Robert Wilson",
    email: "mike.admin@sapls.com",
    role: "Moderator",
    createdAt: "Feb 1, 2024",
    status: "Suspended",
    protected: false,
    department: "Support Team",
    phoneNumber: "+1 (555) 456-7890",
    lastLogin: "May 28, 2025 - 15:45 PM",
    employeeId: "EMP-2024-003",
  },
  {
    id: "A004",
    fullName: "Lisa Marie Rodriguez",
    email: "lisa.admin@sapls.com",
    role: "Admin",
    createdAt: "Mar 10, 2024",
    status: "Active",
    protected: false,
    department: "Account Management",
    phoneNumber: "+1 (555) 789-0123",
    lastLogin: "June 2, 2025 - 11:20 AM",
    employeeId: "EMP-2024-004",
  },
  {
    id: "A005",
    fullName: "James William Brown",
    email: "james.admin@sapls.com",
    role: "Moderator",
    createdAt: "Apr 5, 2024",
    status: "Active",
    protected: false,
    department: "Technical Support",
    phoneNumber: "+1 (555) 234-5678",
    lastLogin: "June 1, 2025 - 09:15 AM",
    employeeId: "EMP-2024-005",
  },
];

const AdminAccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    // Find the admin with the matching ID from the mock data
    const foundAdmin = mockAdmins.find((a) => a.id === id);
    if (foundAdmin) {
      setAdmin(foundAdmin);
    } else {
      // If no matching admin is found, navigate back to the list
      navigate("/admin/accounts/admins");
    }
  }, [id, navigate]);

  if (!admin) {
    return <div>Loading...</div>;
  }

  // Determine if the admin is a Head Admin (for permissions)
  const isHeadAdmin = admin.role === "Head Admin";

  return (
    <div className="space-y-6 py-4">
      {/* Back button */}
      <div>
        <Link
          to="/admin/accounts/admins"
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Admin Account List
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <ShieldAlert size={32} className="mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-primary">
            Admin Account Details
          </h1>
        </div>
        <p className="text-default-500">
          View and manage administrator account information
        </p>
      </div>

      {/* Admin Overview */}
      <Card className="p-6 bg-blue-50">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ShieldAlert size={20} className="mr-2 text-blue-600" /> Admin
          Overview
        </h2>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 flex justify-center md:justify-start">
            <div className="w-24 h-24 bg-blue-600 rounded-md flex items-center justify-center text-white text-3xl font-bold">
              {admin.fullName
                .split(" ")
                .map((name: string) => name[0])
                .join("")}
            </div>
          </div>
          <div className="md:w-3/4 mt-4 md:mt-0 md:pl-4 flex flex-col md:flex-row">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{admin.fullName}</h3>
              <div className="mt-2 grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-sm text-gray-500">Admin ID</div>
                  <div className="font-medium">{admin.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Role</div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-sm">
                    {admin.role}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <span
                    className={`px-2 py-1 rounded-md text-sm ${
                      admin.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {admin.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Email Address</div>
            <div className="p-2 bg-gray-50 rounded border">{admin.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Phone Number</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.phoneNumber}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created Date</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.createdAt}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last Login</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.lastLogin}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Department</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.department}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Employee ID</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.employeeId}
            </div>
          </div>
        </div>
      </Card>

      {/* Account Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Key size={20} className="mr-2" />
          Account Management
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <Button color="primary" startContent={<Key />}>
            Reset Password
          </Button>
          {!admin.protected && (
            <Button
              color="danger"
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
            >
              Remove Account
            </Button>
          )}
        </div>

        {/* Permission Note */}
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
          <p className="font-semibold">Permission Note:</p>
          <p>
            Only Head Administrators can remove other admin accounts. Password
            resets require additional verification for admin accounts.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminAccountDetails;
