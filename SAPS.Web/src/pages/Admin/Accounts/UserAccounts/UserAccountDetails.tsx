import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, Button, Avatar, Divider } from "@heroui/react";
import { ArrowLeft, Ban, Lock } from "lucide-react";
import { userService, ClientUser } from "@/services/user/userService";
import blankProfilePicture from "@/assets/Default/blank-profile-picture.webp";

// Extended user details interface
interface ExtendedUserDetails extends ClientUser {
  phone?: string;
  profileImageUrl?: string;
  citizenId?: string;
  dateOfBirth?: string;
  nationality?: string;
  placeOfResidence?: string;
}

const UserAccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Get the user from location state or fetch it
  const userFromNav = location.state?.user as ClientUser | undefined;

  const [loading, setLoading] = useState<boolean>(!userFromNav);
  const [user, setUser] = useState<ExtendedUserDetails | null>(
    userFromNav || null
  );
  const [error, setError] = useState<string | null>(null);
  const [showConfirmBan, setShowConfirmBan] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(
    null
  );

  // Fetch user data if not passed through navigation
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) {
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      if (userFromNav) {
        setUser(userFromNav);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userService.getClientUserById(id);

        if (response.success && response.data) {
          setUser(response.data);
          setError(null);
        } else {
          setError(response.error || "Failed to fetch user details");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, userFromNav]);

  const handleStatusChange = async (newStatus: "active" | "suspended") => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const response = await userService.updateClientUserStatus(id, newStatus);

      if (response.success && response.data) {
        setUser({ ...user, status: response.data.status });
        setShowSuccessMessage(
          `User status successfully changed to ${newStatus}`
        );
        setTimeout(() => setShowSuccessMessage(null), 3000);
      } else {
        setError(response.error || "Failed to update user status");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
      setShowConfirmBan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate("/admin/accounts/users")}
          className="text-default-900"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold">User Account Details</h1>
      </div>

      {/* Error message */}
      {error && (
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
                Error loading user data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {showSuccessMessage && (
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
                <p>{showSuccessMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ml-2">Loading user details...</span>
        </div>
      ) : user ? (
        /* Main Content */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={user.profileImageUrl || blankProfilePicture}
                alt={user.fullName}
                className="w-24 h-24"
              />
              <h2 className="mt-4 text-xl font-semibold">{user.fullName}</h2>
              <p className="text-default-600">{user.email}</p>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2 w-full">
                {user.status === "active" ? (
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<Ban />}
                    className="w-full"
                    onPress={() => setShowConfirmBan(true)}
                  >
                    Suspend Account
                  </Button>
                ) : (
                  <Button
                    color="success"
                    variant="flat"
                    startContent={<ArrowLeft />}
                    className="w-full"
                    onPress={() => handleStatusChange("active")}
                  >
                    Activate Account
                  </Button>
                )}
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Lock />}
                  className="w-full"
                  onPress={() =>
                    alert(
                      "Password reset functionality will be implemented soon."
                    )
                  }
                >
                  Reset Password
                </Button>
              </div>
            </div>
          </Card>

          {/* Details Card */}
          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-4">
              {user.citizenId && (
                <>
                  <div>
                    <label className="text-sm text-default-600">
                      Citizen ID
                    </label>
                    <p className="font-medium">
                      •••••••{user.citizenId.slice(-4)}
                    </p>
                  </div>
                  <Divider />
                </>
              )}

              {user.phone && (
                <>
                  <div>
                    <label className="text-sm text-default-600">
                      Phone Number
                    </label>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <Divider />
                </>
              )}

              {user.dateOfBirth && (
                <>
                  <div>
                    <label className="text-sm text-default-600">
                      Date of Birth
                    </label>
                    <p className="font-medium">{user.dateOfBirth}</p>
                  </div>
                  <Divider />
                </>
              )}

              {user.nationality && (
                <>
                  <div>
                    <label className="text-sm text-default-600">
                      Nationality
                    </label>
                    <p className="font-medium">{user.nationality}</p>
                  </div>
                  <Divider />
                </>
              )}

              {user.placeOfResidence && (
                <>
                  <div>
                    <label className="text-sm text-default-600">
                      Place of Residence
                    </label>
                    <p className="font-medium">{user.placeOfResidence}</p>
                  </div>
                  <Divider />
                </>
              )}

              <div>
                <label className="text-sm text-default-600">
                  Account Created
                </label>
                <p className="font-medium">{user.createdAt}</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            User not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The user you are looking for does not exist or you don't have
            permission to view it.
          </p>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showConfirmBan && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Suspend Account</h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to suspend {user.fullName}'s account? The
              user will not be able to log in until the account is reactivated.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={() => setShowConfirmBan(false)}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => handleStatusChange("suspended")}
              >
                Suspend Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserAccountDetails;
