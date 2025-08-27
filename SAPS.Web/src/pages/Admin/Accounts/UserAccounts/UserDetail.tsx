import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, Button, Avatar, Spinner, Pagination } from "@heroui/react";
import { Ban, Car, Activity } from "lucide-react";
import blankProfilePicture from "@/assets/Default/blank-profile-picture.webp";
import { UserDetails } from "@/types/UserClient";
import {
  userClientService,
  ClientDetailsResponse,
  VehicleResponse,
  ParkingSessionResponse,
  SharedVehicleResponse,
} from "@/services/userClient/userClientService";

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const userData = location.state?.user;

  console.log("Location state:", location.state);
  console.log("User data from navigation:", userData);
  console.log("URL param ID:", id);

  // State management
  const [clientDetails, setClientDetails] =
    useState<ClientDetailsResponse | null>(null);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [sharedVehicles, setSharedVehicles] = useState<SharedVehicleResponse[]>(
    []
  );
  const [parkingSessions, setParkingSessions] = useState<
    ParkingSessionResponse[]
  >([]);
  const [paginatedParkingSessions, setPaginatedParkingSessions] = useState<
    ParkingSessionResponse[]
  >([]);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [sharedVehiclesLoading, setSharedVehiclesLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmBan, setShowConfirmBan] = useState(false);
  const [banLoading, setBanLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Vehicle pagination states
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(1);
  const [vehicleTotalItems, setVehicleTotalItems] = useState(0);
  const vehiclePageSize = 5;

  // Parking session pagination states
  const [sessionPage, setSessionPage] = useState(1);
  const sessionPageSize = 5;
  const [sessionTotalPages, setSessionTotalPages] = useState(1);
  const [sessionTotalItems, setSessionTotalItems] = useState(0);

  // Shared vehicle pagination states
  const [sharedVehiclePage, setSharedVehiclePage] = useState(1);
  const [sharedVehicleTotalPages, setSharedVehicleTotalPages] = useState(1);
  const [sharedVehicleTotalItems, setSharedVehicleTotalItems] = useState(0);
  const sharedVehiclePageSize = 5;

  // Fetch client details from new API
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!id) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching client details from new API...");
        const response = await userClientService.getClientDetails(id);

        if (response.success && response.data) {
          console.log("✅ Successfully fetched client details:", response.data);
          setClientDetails(response.data);

          // Convert to legacy format for compatibility
          const legacyUser: UserDetails = {
            id: response.data.id,
            fullName:
              response.data.fullName || response.data["full-name"] || "",
            email: response.data.email,
            status: (response.data.status || "").toLowerCase() as
              | "active"
              | "inactive"
              | "suspended",
            citizenId:
              response.data.citizenId || response.data["citizen-id"] || "",
            dateOfBirth:
              response.data.dateOfBirth || response.data["date-of-birth"] || "",
            phone: response.data.phone || response.data.phoneNumber || "",
            address:
              response.data.placeOfResidence ||
              response.data["place-of-residence"] ||
              "",
            registrationDate: new Date(
              response.data.createdAt ||
                response.data["created-at"] ||
                new Date()
            ).toLocaleDateString(),
            profileImageUrl:
              response.data.profileImageUrl ||
              response.data["profile-image-url"] ||
              undefined,
            verificationStatus: "Verified",
            lastLogin: "N/A",
            vehicles: [],
            parkingActivity: [],
            stats: {
              totalParkingSessions: 0,
              totalSpent: "$0.00",
              avgSessionDuration: "0h",
            },
          };
          setUser(legacyUser);
        } else {
          console.error("❌ Failed to fetch client details:", response.error);
          setError(response.error || "Failed to load client details");
        }
      } catch (err) {
        console.error("🔥 Exception while fetching client details:", err);
        setError("An error occurred while fetching client details");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id]);

  // Fetch client vehicles with pagination
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!id) return;

      try {
        setVehiclesLoading(true);
        console.log("🔄 Fetching client vehicles...");

        const response = await userClientService.getClientVehicles(
          id,
          vehiclePage,
          vehiclePageSize,
          1
        );

        if (response.success && response.data) {
          console.log("✅ Successfully fetched vehicles:", response.data);
          setVehicles(response.data.items);
          setVehicleTotalPages(
            response.data.totalPages || response.data["total-pages"] || 1
          );
          setVehicleTotalItems(
            response.data.totalCount || response.data["total-count"] || 0
          );
        } else {
          console.error("❌ Failed to fetch vehicles:", response.error);
        }
      } catch (err) {
        console.error("🔥 Exception while fetching vehicles:", err);
      } finally {
        setVehiclesLoading(false);
      }
    };

    fetchVehicles();
  }, [id, vehiclePage]);

  // Fetch shared vehicles with pagination
  useEffect(() => {
    const fetchSharedVehicles = async () => {
      if (!id) return;

      try {
        setSharedVehiclesLoading(true);
        console.log("🔄 Fetching shared vehicles...");

        const response = await userClientService.getClientSharedVehicles(
          id,
          sharedVehiclePage,
          sharedVehiclePageSize,
          1
        );

        if (response.success && response.data) {
          console.log(
            "✅ Successfully fetched shared vehicles:",
            response.data
          );
          setSharedVehicles(response.data.items);
          setSharedVehicleTotalPages(
            response.data.totalPages || response.data["total-pages"] || 1
          );
          setSharedVehicleTotalItems(
            response.data.totalCount || response.data["total-count"] || 0
          );
        } else {
          console.error("❌ Failed to fetch shared vehicles:", response.error);
        }
      } catch (err) {
        console.error("🔥 Exception while fetching shared vehicles:", err);
      } finally {
        setSharedVehiclesLoading(false);
      }
    };

    fetchSharedVehicles();
  }, [id, sharedVehiclePage]);

  // Fetch parking sessions for statistics
  useEffect(() => {
    const fetchParkingSessions = async () => {
      if (!id) return;

      try {
        setSessionsLoading(true);
        console.log("🔄 Fetching parking sessions...");

        const response = await userClientService.getClientParkingSessions(id);

        if (response.success && response.data) {
          console.log(
            "✅ Successfully fetched parking sessions:",
            response.data
          );
          setParkingSessions(response.data);
        } else {
          console.error("❌ Failed to fetch parking sessions:", response.error);
        }
      } catch (err) {
        console.error("🔥 Exception while fetching parking sessions:", err);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchParkingSessions();
  }, [id]);

  // Fetch parking sessions with pagination
  useEffect(() => {
    const fetchPaginatedParkingSessions = async () => {
      if (!id) return;

      try {
        setSessionsLoading(true);
        console.log("🔄 Fetching paginated parking sessions...");

        const response =
          await userClientService.getClientParkingSessionsPaginated(
            id,
            sessionPage,
            sessionPageSize,
            1
          );

        if (response.success && response.data) {
          console.log(
            "✅ Successfully fetched paginated parking sessions:",
            response.data
          );
          console.log("Type of response.data:", typeof response.data);
          console.log(
            "Is response.data an array?",
            Array.isArray(response.data)
          );
          console.log("response.data.items:", response.data.items);

          // Kiểm tra cấu trúc response.data
          if (Array.isArray(response.data)) {
            // Nếu response.data là một mảng (API trả về mảng trực tiếp)
            console.log("API returned array directly:", response.data);
            setPaginatedParkingSessions(response.data);
            setSessionTotalPages(1); // Không có thông tin phân trang
            setSessionTotalItems(response.data.length);
          } else if (Array.isArray(response.data.items)) {
            // Nếu response.data là một đối tượng có thuộc tính items (Cấu trúc phân trang)
            console.log("Items to display:", response.data.items);
            setPaginatedParkingSessions(response.data.items);
            setSessionTotalPages(
              response.data.totalPages || response.data["total-pages"] || 1
            );
            setSessionTotalItems(
              response.data.totalCount || response.data["total-count"] || 0
            );
          } else if (
            response.data.items &&
            Array.isArray(response.data.items)
          ) {
            // Nếu response.data.items là một mảng (API trả về nested data)
            console.log("Nested data array:", response.data.items);
            setPaginatedParkingSessions(response.data.items as any[]);
            setSessionTotalPages(1); // Không có thông tin phân trang
            setSessionTotalItems((response.data.items as any[]).length);
          } else {
            console.error("Unexpected data format:", response.data);
            setPaginatedParkingSessions([]);
            setSessionTotalPages(1);
            setSessionTotalItems(0);
          }
        } else {
          console.error(
            "❌ Failed to fetch paginated parking sessions:",
            response.error
          );
        }
      } catch (err) {
        console.error(
          "🔥 Exception while fetching paginated parking sessions:",
          err
        );
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchPaginatedParkingSessions();
  }, [id, sessionPage]);

  // Calculate statistics from parking sessions
  const calculateStats = () => {
    if (!parkingSessions || parkingSessions.length === 0) {
      return {
        totalSessions: 0,
        totalSpent: "$0.00",
        avgDuration: "0h",
      };
    }

    const totalSessions = parkingSessions.length;
    const totalCost = parkingSessions.reduce(
      (sum, session) => sum + session.cost,
      0
    );
    const totalSpent = `$${(totalCost / 1000).toFixed(2)}`; // Convert from VND to USD for display

    // Calculate average duration
    let totalMinutes = 0;
    let validSessions = 0;

    parkingSessions.forEach((session) => {
      const exitTime = session["exit-date-time"] || session.exitDateTime;
      if (exitTime) {
        const entryTime = new Date(
          session["entry-date-time"] || session.entryDateTime || ""
        );
        const exitTimeDate = new Date(exitTime);
        const durationMs = exitTimeDate.getTime() - entryTime.getTime();
        const durationMinutes = durationMs / (1000 * 60);
        totalMinutes += durationMinutes;
        validSessions++;
      }
    });

    const avgMinutes = validSessions > 0 ? totalMinutes / validSessions : 0;
    const avgHours = Math.round((avgMinutes / 60) * 10) / 10;
    const avgDuration = `${avgHours}h`;

    return {
      totalSessions,
      totalSpent,
      avgDuration,
    };
  };

  const stats = calculateStats();

  // Handle vehicle page change
  const handleVehiclePageChange = (page: number) => {
    setVehiclePage(page);
  };

  // Handle shared vehicle page change
  const handleSharedVehiclePageChange = (page: number) => {
    setSharedVehiclePage(page);
  };

  // Handle session page change
  const handleSessionPageChange = (page: number) => {
    setSessionPage(page);
  };
  const handleBanUser = async () => {
    if (!id || !user) return;

    try {
      setBanLoading(true);
      setError(null);

      // Determine new status based on current status
      const newStatus: "active" | "inactive" | "suspended" =
        user.status === "active" ? "inactive" : "active";

      // Map to API status format: "Active" for active, "Inactive" for inactive
      const apiStatus = user.status === "active" ? "Inactive" : "Active";

      console.log(`🔄 Updating user client status to ${apiStatus}...`);
      const response = await userClientService.banUserClient(id, apiStatus);

      if (response.success) {
        console.log("✅ User client status updated successfully");
        const actionText = user.status === "active" ? "banned" : "unbanned";

        setSuccessMessage(`User account ${actionText} successfully`);
        setUser({ ...user, status: newStatus }); // Update local state
        setShowConfirmBan(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error("❌ Failed to update user client:", response.error);
        const actionText = user.status === "active" ? "ban" : "unban";
        setError(response.error || `Failed to ${actionText} user account`);
      }
    } catch (err) {
      console.error("🔥 Exception while banning user client:", err);
      setError("An error occurred while banning user account");
    } finally {
      setBanLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
        <span className="ml-2">Loading user details...</span>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="w-full">
        <div className="mb-2">
          <button
            onClick={() => navigate("/admin/accounts/users")}
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to User Account List
          </button>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-800">{error || "User not found"}</p>
          <Button
            color="primary"
            className="mt-4"
            onPress={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Back button */}
      <div className="mb-2">
        <button
          onClick={() => navigate("/admin/accounts/users")}
          className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to User Account List
        </button>
      </div>

      {/* Header */}
      <div className="w-full">
        <div className="flex items-center mb-1 w-full">
          <svg
            className="w-6 h-6 mr-2 text-indigo-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-indigo-900">
            User Account Details
          </h1>
        </div>
        <p className="text-gray-500 mb-4">
          View and manage user account information and activity
        </p>
      </div>

      {/* User Overview Section */}
      <Card className="p-6 w-full border border-gray-200 shadow-sm">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">User Overview</h2>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-shrink-0">
              <Avatar
                src={user.profileImageUrl || blankProfilePicture}
                alt={user.fullName}
                className="w-24 h-24 border-2 border-white shadow-md"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-bold text-blue-900">
                {user.fullName}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verification Status</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                    {user.verificationStatus || "Verified"}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Account Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Information Section */}
      <Card className="p-6 w-full border border-gray-200 shadow-sm">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              Personal Information
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Email Address</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.email || user?.email}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Phone Number</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.phone || user?.phone || "N/A"}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Citizen ID</p>
            <div className="border rounded p-3 bg-gray-50 flex items-center">
              {clientDetails?.["citizen-id"] || user?.citizenId || "N/A"}
              {(clientDetails?.["citizen-id"] || user?.citizenId) && (
                <span className="ml-2 text-xs text-gray-500 italic">
                  (number is masked for privacy)
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.["date-of-birth"]
                ? new Date(clientDetails["date-of-birth"]).toLocaleDateString()
                : user?.dateOfBirth || "N/A"}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Nationality</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.nationality || "N/A"}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Place of Origin</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.["place-of-origin"] || "N/A"}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Sex</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.sex !== undefined
                ? clientDetails.sex
                  ? "Male"
                  : "Female"
                : "N/A"}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Registration Date</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.["created-at"]
                ? new Date(clientDetails["created-at"]).toLocaleDateString()
                : user?.registrationDate || "N/A"}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Address</p>
            <div className="border rounded p-3 bg-gray-50">
              {clientDetails?.["place-of-residence"] || user?.address || "N/A"}
            </div>
          </div>
        </div>
      </Card>

      {/* Registered Vehicles Section */}
      <Card className="p-6 w-full border border-gray-200 shadow-sm">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <div className="flex items-center">
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Registered Vehicles
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          {vehiclesLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" color="primary" />
              <span className="ml-2">Loading vehicles...</span>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      License Plate
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Model
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Color
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Sharing Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles && vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {vehicle.licensePlate || vehicle["license-plate"]}
                        </td>
                        <td className="px-4 py-3 text-sm">{vehicle.brand}</td>
                        <td className="px-4 py-3 text-sm">{vehicle.model}</td>
                        <td className="px-4 py-3 text-sm">{vehicle.color}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                              (
                                vehicle.status || vehicle["status"]
                              )?.toLowerCase() === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {vehicle.status || vehicle["status"]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                              (
                                vehicle.status || vehicle["sharing-status"]
                              )?.toLowerCase() === "available"
                                ? "bg-blue-100 text-blue-800"
                                : (
                                      vehicle.status ||
                                      vehicle["sharing-status"]
                                    )?.toLowerCase() === "shared"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {vehicle.status || vehicle["sharing-status"]}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No registered vehicles found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Vehicle Pagination */}
              {vehicleTotalItems > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {(vehiclePage - 1) * vehiclePageSize + 1} to{" "}
                    {Math.min(vehiclePage * vehiclePageSize, vehicleTotalItems)}{" "}
                    of {vehicleTotalItems} vehicles
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      className="rounded-full flex items-center"
                      isDisabled={vehiclePage === 1}
                      onPress={() => handleVehiclePageChange(vehiclePage - 1)}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </Button>
                    <Pagination
                      total={vehicleTotalPages}
                      page={vehiclePage}
                      onChange={handleVehiclePageChange}
                      size="sm"
                      classNames={{
                        item: "text-black",
                        cursor: "bg-blue-900 text-white",
                      }}
                    />
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      className="rounded-full flex items-center"
                      isDisabled={vehiclePage === vehicleTotalPages}
                      onPress={() => handleVehiclePageChange(vehiclePage + 1)}
                    >
                      Next
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Shared Vehicles Section */}
      <Card className="p-6 w-full border border-gray-200 shadow-sm">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <div className="flex items-center">
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Shared Vehicles</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          {sharedVehiclesLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" color="primary" />
              <span className="ml-2">Loading shared vehicles...</span>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      License Plate
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Model
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Color
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Access Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sharedVehicles && sharedVehicles.length > 0 ? (
                    sharedVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {vehicle.licensePlate || vehicle["license-plate"]}
                        </td>
                        <td className="px-4 py-3 text-sm">{vehicle.brand}</td>
                        <td className="px-4 py-3 text-sm">{vehicle.model}</td>
                        <td className="px-4 py-3 text-sm">{vehicle.color}</td>
                        <td className="px-4 py-3 text-sm">
                          {vehicle.ownerName || vehicle["owner-name"]}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {vehicle.accessDuration || vehicle["access-duration"]
                            ? `${vehicle.accessDuration || vehicle["access-duration"]} hours`
                            : "Unlimited"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                              (
                                vehicle.status || vehicle["sharing-status"]
                              )?.toLowerCase() === "available"
                                ? "bg-blue-100 text-blue-800"
                                : (
                                      vehicle.status ||
                                      vehicle["sharing-status"]
                                    )?.toLowerCase() === "shared"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {vehicle.status || vehicle["sharing-status"]}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No shared vehicles found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Shared Vehicle Pagination */}
              {sharedVehicleTotalItems > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    {(sharedVehiclePage - 1) * sharedVehiclePageSize + 1} to{" "}
                    {Math.min(
                      sharedVehiclePage * sharedVehiclePageSize,
                      sharedVehicleTotalItems
                    )}{" "}
                    of {sharedVehicleTotalItems} shared vehicles
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      className="rounded-full flex items-center"
                      isDisabled={sharedVehiclePage === 1}
                      onPress={() =>
                        handleSharedVehiclePageChange(sharedVehiclePage - 1)
                      }
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </Button>
                    <Pagination
                      total={sharedVehicleTotalPages}
                      page={sharedVehiclePage}
                      onChange={handleSharedVehiclePageChange}
                      size="sm"
                      classNames={{
                        item: "text-black",
                        cursor: "bg-blue-900 text-white",
                      }}
                    />
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      className="rounded-full flex items-center"
                      isDisabled={sharedVehiclePage === sharedVehicleTotalPages}
                      onPress={() =>
                        handleSharedVehiclePageChange(sharedVehiclePage + 1)
                      }
                    >
                      Next
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Usage Statistics Section */}
      <Card className="p-6 w-full border border-gray-200 shadow-sm">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Usage Statistics
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#40bcd8] rounded-lg p-5 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {sessionsLoading ? "..." : stats.totalSessions}
              </div>
              <div className="text-sm">Total Parking Sessions</div>
            </div>
          </div>

          <div className="bg-[#40bcd8] rounded-lg p-5 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {sessionsLoading ? "..." : stats.totalSpent}
              </div>
              <div className="text-sm">Total Spent</div>
            </div>
          </div>

          <div className="bg-[#40bcd8] rounded-lg p-5 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {sessionsLoading ? "..." : stats.avgDuration}
              </div>
              <div className="text-sm">Avg Session Duration</div>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-blue-600 pl-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Parking Activity
          </h3>
        </div>

        <div className="overflow-x-auto">
          {sessionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" color="primary" />
              <span className="ml-2">Loading parking activity...</span>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedParkingSessions &&
                  paginatedParkingSessions.length > 0 ? (
                    paginatedParkingSessions.map((session) => {
                      console.log("Rendering session:", session);
                      const entryDate = new Date(
                        session.entryDateTime || session["entry-date-time"]
                      );
                      const exitDateTime =
                        session.exitDateTime || session["exit-date-time"];
                      const exitDate = exitDateTime
                        ? new Date(exitDateTime)
                        : null;

                      let duration = "Ongoing";
                      if (exitDate) {
                        const durationMs =
                          exitDate.getTime() - entryDate.getTime();
                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                        const minutes = Math.floor(
                          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
                        );
                        duration = `${hours}h ${minutes}m`;
                      }

                      return (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {entryDate.toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {entryDate.toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {session.parkingLotName ||
                              session["parking-lot-name"]}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">
                            {session.licensePlate || session["license-plate"]}
                          </td>
                          <td className="px-4 py-3 text-sm">{duration}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            ${(session.cost / 1000).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                (
                                  session.status || session["status"]
                                )?.toLowerCase() === "finished"
                                  ? "bg-green-100 text-green-800"
                                  : (
                                        session.status || session["status"]
                                      )?.toLowerCase() === "parking"
                                    ? "bg-blue-100 text-blue-800"
                                    : (
                                          session.status || session["status"]
                                        )?.toLowerCase() === "checkedout"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {session.status || session["status"]}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No parking activity found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Parking Sessions Pagination */}
              {sessionTotalItems > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {(sessionPage - 1) * sessionPageSize + 1} to{" "}
                    {Math.min(sessionPage * sessionPageSize, sessionTotalItems)}{" "}
                    of {sessionTotalItems} parking sessions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      className="rounded-full flex items-center"
                      isDisabled={sessionPage === 1}
                      onPress={() => handleSessionPageChange(sessionPage - 1)}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </Button>
                    <Pagination
                      total={sessionTotalPages}
                      page={sessionPage}
                      onChange={handleSessionPageChange}
                      size="sm"
                      classNames={{
                        item: "text-black",
                        cursor: "bg-blue-900 text-white",
                      }}
                    />
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      className="rounded-full flex items-center"
                      isDisabled={sessionPage === sessionTotalPages}
                      onPress={() => handleSessionPageChange(sessionPage + 1)}
                    >
                      Next
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Account Management Section */}
      <Card className="p-6 w-full border border-gray-200 shadow-sm">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              Account Management
            </h2>
          </div>
        </div>

        <div className="w-full flex justify-center items-center">
          {user.status === "active" ? (
            <Button
              color="danger"
              size="lg"
              startContent={<Ban />}
              className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              onPress={() => setShowConfirmBan(true)}
            >
              Ban Account
            </Button>
          ) : (
            <Button
              color="success"
              size="lg"
              startContent={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
              onPress={() => setShowConfirmBan(true)}
            >
              Unban Account
            </Button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-md">
          <p className="text-sm">
            <span className="font-semibold">Privacy Note:</span> Sensitive user
            information is protected and masked. Account actions are logged for
            audit purposes. Password resets require user confirmation.
          </p>
        </div>
      </Card>

      {/* Ban Confirmation Modal */}
      {showConfirmBan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-0 mt-auto">
          <div className="relative">
            <Card className="w-full max-w-lg mx-auto p-8 shadow-2xl border-0 bg-white rounded-2xl transform transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    user?.status === "active" ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {user?.status === "active" ? (
                    <Ban className="w-8 h-8 text-red-600" />
                  ) : (
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {user?.status === "active" ? "Ban Account" : "Unban Account"}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Are you sure you want to{" "}
                  {user?.status === "active" ? "ban" : "unban"}{" "}
                  <span className="font-semibold text-gray-900">
                    {user?.fullName}
                  </span>
                  's account?
                  <br />
                  <span className="text-sm text-gray-500 mt-2 inline-block">
                    {user?.status === "active"
                      ? "The user will not be able to log in until the account is reactivated."
                      : "The user will be able to log in and use the system again."}
                  </span>
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="flat"
                  onPress={() => setShowConfirmBan(false)}
                  className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                  isDisabled={banLoading}
                >
                  Cancel
                </Button>
                <Button
                  color={user?.status === "active" ? "danger" : "success"}
                  onPress={handleBanUser}
                  isLoading={banLoading}
                  isDisabled={banLoading}
                  className={`w-full sm:w-auto px-6 py-3 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl ${
                    user?.status === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {banLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {user?.status === "active"
                        ? "Banning..."
                        : "Unbanning..."}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {user?.status === "active" ? (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Ban Account
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Unban Account
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
