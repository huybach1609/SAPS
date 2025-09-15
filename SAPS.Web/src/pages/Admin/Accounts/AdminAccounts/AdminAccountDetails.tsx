import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { Button, Card, Spinner } from "@heroui/react";
import { ArrowLeft, ShieldAlert, Key, Settings } from "lucide-react";
import { adminService } from "@/services/admin/adminService";
import { AdminUser } from "@/types/admin";
import { parseJwt } from "@/components/utils/jwtUtils";

const AdminAccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Chỉ dùng cho lỗi load trang
  const [actionError, setActionError] = useState<string | null>(null); // Dùng cho lỗi các action như reset password
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [resetPasswordLoading, setResetPasswordLoading] =
    useState<boolean>(false);

  // Get current user's role and ID from JWT token to check permissions
  useEffect(() => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        const claims = parseJwt(accessToken) as any;
        const adminRole = claims["AdminRole"];
        const userId =
          claims[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        setCurrentUserRole(adminRole?.toLowerCase()); // Convert to lowercase for consistency
        setCurrentUserId(userId);
      }
    } catch (e) {
      console.error("Error parsing JWT token for admin role and ID", e);
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

  // Handle password reset - only for current user
  const handleResetPassword = async () => {
    if (!admin || !currentUserId) return;

    // Check if the admin being viewed is the current user
    if (admin.id !== currentUserId) {
      setActionError("You can only reset your own password.");
      return;
    }

    try {
      setResetPasswordLoading(true);
      setActionError(null); // Clear any previous action errors
      const response = await adminService.requestPasswordReset();

      if (response.success) {
        setSuccessMessage(
          "Password reset request has been sent to your email. Please check your inbox for instructions."
        );
        setActionError(null); // Clear any previous errors

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setActionError(
          response.error || "Failed to send password reset request"
        );
        // Auto clear error after 8 seconds
        setTimeout(() => {
          setActionError(null);
        }, 8000);
      }
    } catch (err: any) {
      console.error("Error sending password reset request:", err);
      setActionError(
        "An error occurred while sending the password reset request"
      );
      // Auto clear error after 8 seconds
      setTimeout(() => {
        setActionError(null);
      }, 8000);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Handle status update - only for head admin updating others
  const handleStatusUpdate = async (newStatus: string) => {
    if (!admin || !isHeadAdmin || admin.id === currentUserId) return;

    try {
      setStatusLoading(true);
      setActionError(null); // Clear any previous action errors
      const response = await adminService.updateUserStatus(admin.id, newStatus);

      if (response.success) {
        // Update the local admin data
        setAdmin((prev) => (prev ? { ...prev, status: newStatus } : null));
        setSuccessMessage(
          `Account status updated to ${newStatus} successfully.`
        );

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setActionError(response.error || "Failed to update account status");
        // Auto clear error after 8 seconds
        setTimeout(() => {
          setActionError(null);
        }, 8000);
      }
    } catch (err: any) {
      console.error("Error updating account status:", err);
      setActionError("An error occurred while updating the account status");
      // Auto clear error after 8 seconds
      setTimeout(() => {
        setActionError(null);
      }, 8000);
    } finally {
      setStatusLoading(false);
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
  const isHeadAdmin = currentUserRole === "headadmin";
  // Check if current user can reset password (only for themselves)
  const canResetPassword = currentUserId === admin?.id;
  // Check if head admin can update status (only for other admins, not themselves)
  const canUpdateStatus = isHeadAdmin && admin?.id !== currentUserId;

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

      {/* Action Error message (cho các lỗi reset password, update status) */}
      {actionError && (
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
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{actionError}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-sm font-medium text-red-800 hover:text-red-700 underline"
                >
                  Dismiss
                </button>
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
                ? new Date(admin.createdAt).toLocaleDateString()
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

        {/* Status Update - Only for Head Admin updating other admins */}
        {canUpdateStatus && (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-4 flex items-center">
              <Settings size={16} className="mr-2" />
              Update Account Status
            </h3>
            <div className="flex justify-center">
              {admin?.status === "active" ? (
                <Button
                  color="warning"
                  variant="solid"
                  size="lg"
                  className="w-auto px-8 py-3 text-white font-medium"
                  onPress={() => handleStatusUpdate("Inactive")}
                  isLoading={statusLoading}
                >
                  Inactive Account
                </Button>
              ) : (
                <Button
                  color="success"
                  variant="solid"
                  size="lg"
                  className="w-auto px-8 py-3 text-white font-medium"
                  onPress={() => handleStatusUpdate("Active")}
                  isLoading={statusLoading}
                >
                  Active Account
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          {/* Reset Password - Only for self */}
          {canResetPassword && (
            <Button
              color="primary"
              className="text-white"
              startContent={<Key />}
              onPress={handleResetPassword}
              isLoading={resetPasswordLoading}
            >
              Reset My Password
            </Button>
          )}

          {/* Show message if no actions available */}
          {!canResetPassword && !canUpdateStatus && (
            <div className="text-amber-600 bg-amber-50 p-3 rounded-md">
              <p className="font-medium">
                You don't have permission to manage this admin account.
              </p>
              <p>
                You can only reset your own password. Only Head Administrators
                can update status of other admin accounts.
              </p>
            </div>
          )}
        </div>

        {/* Permission Note */}
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
          <p className="font-semibold">Permission Notes:</p>
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>You can only reset your own password</li>
            <li>
              Only Head Administrators can update status of other admin accounts
            </li>
            <li>Head Administrators cannot update their own status</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AdminAccountDetails;
