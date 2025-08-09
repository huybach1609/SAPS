import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { Button, Card, Spinner } from "@heroui/react";
import { ArrowLeft, ShieldAlert, Key } from "lucide-react";
import { adminService } from "@/services/admin/adminService";
import { AdminUser } from "@/types/admin";

const AdminAccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Get current user's role from localStorage to check permissions
  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role);
      } catch (e) {
        console.error("Error parsing admin user from localStorage", e);
      }
    }
  }, []);

  // Check for admin data in location state first, otherwise fetch from API
  useEffect(() => {
    if (!id) {
      navigate("/admin/accounts/admins");
      return;
    }

    // First try to get admin data from the navigation state
    if (location.state && location.state.admin) {
      setAdmin(location.state.admin);
      setLoading(false);
      return;
    }

    // If no data in state, fetch from API as fallback
    const fetchAdminDetails = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAdminById(id);
        if (response.success && response.data) {
          setAdmin(response.data);
          setError(null);
        } else {
          setError(response.error || "Failed to fetch admin details");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error fetching admin details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
  }, [id, navigate, location.state]);

  // Handle password reset
  const handleResetPassword = async () => {
    if (!admin) return;

    // As per requirements, just show a notification message for reset password
    setSuccessMessage(
      "Password reset request has been sent. Additional verification will be required."
    );

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Handle admin account removal
  const handleRemoveAccount = async () => {
    if (!admin) return;

    if (
      window.confirm(
        `Are you sure you want to remove ${admin.fullName || "this admin"}'s account? This action cannot be undone.`
      )
    ) {
      try {
        setLoading(true);
        // Call the delete API directly as specified in requirements
        const response = await fetch(
          `https://localhost:7136/api/Admin/${admin.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("admin_token") || localStorage.getItem("auth_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Success - navigate back to the list
          navigate("/admin/accounts/admins", {
            state: {
              message: `${admin.fullName || "Admin"}'s account has been removed successfully.`,
            },
          });
        } else {
          // Handle error
          const data = await response.json();
          setError(data.message || "Failed to remove account");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while removing the account");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
        <span className="ml-2">Loading admin details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading admin details
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/accounts/admins")}
                className="text-sm font-medium text-red-800 hover:text-red-700"
              >
                Return to admin list
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <div>Admin not found</div>;
  }

  // Check if current user is head admin (for permissions)
  const isHeadAdmin = currentUserRole === "head_admin";

  return (
    <div className="space-y-6 py-4">
      {/* Back button */}
      <div>
        <Link
          to="/admin/accounts/admins"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Admin Account List
        </Link>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <ShieldAlert size={32} className="mr-2 text-blue-900" />
          <h1 className="text-2xl font-bold text-blue-900">
            Admin Account Details
          </h1>
        </div>
        <p className="text-gray-500">
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
              {admin.fullName && admin.fullName.length > 0
                ? admin.fullName
                    .split(" ")
                    .map((name: string) => name[0])
                    .join("")
                : "A"}
            </div>
          </div>
          <div className="md:w-3/4 mt-4 md:mt-0 md:pl-4 flex flex-col md:flex-row">
            <div className="flex-1">
              <h3 className="text-xl font-bold">
                {admin.fullName || "No name provided"}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-sm text-gray-500">Admin ID</div>
                  <div className="font-medium">{admin.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Role</div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-sm">
                    {admin.role === "head_admin" ? "Head Admin" : "Admin"}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <span
                    className={`px-2 py-1 rounded-md text-sm ${
                      admin.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {admin.status
                      ? admin.status.charAt(0).toUpperCase() +
                        admin.status.slice(1)
                      : "Unknown"}
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
            <div className="p-2 bg-gray-50 rounded border">
              {admin.email || "No email provided"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Admin ID</div>
            <div className="p-2 bg-gray-50 rounded border">{admin.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created Date</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.createdAt
                ? admin.createdAt instanceof Date
                  ? admin.createdAt.toLocaleDateString()
                  : new Date(admin.createdAt).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.updatedAt
                ? admin.updatedAt instanceof Date
                  ? admin.updatedAt.toLocaleDateString()
                  : new Date(admin.updatedAt).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Role</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.role === "head_admin"
                ? "Head Administrator"
                : "Administrator"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="p-2 bg-gray-50 rounded border">
              {admin.status
                ? admin.status.charAt(0).toUpperCase() + admin.status.slice(1)
                : "Unknown"}
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
          {isHeadAdmin ? (
            <>
              <Button
                color="primary"
                startContent={<Key />}
                onPress={handleResetPassword}
              >
                Reset Password
              </Button>

              {/* Only show remove account button if the target is not head_admin */}
              {admin.role !== "head_admin" && (
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
                  onPress={handleRemoveAccount}
                >
                  Remove Account
                </Button>
              )}
            </>
          ) : (
            <div className="text-amber-600 bg-amber-50 p-3 rounded-md">
              <p className="font-medium">
                You don't have permission to manage admin accounts.
              </p>
              <p>
                Only Head Administrators can reset passwords or remove admin
                accounts.
              </p>
            </div>
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
