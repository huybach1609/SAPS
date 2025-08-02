import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, Button, Avatar } from "@heroui/react";
import { Ban, Car, Activity, Users } from "lucide-react";
import blankProfilePicture from "@/assets/Default/blank-profile-picture.webp";
import { UserDetails } from "@/types/UserClient";

// Mock user data showing default empty state
const mockUserData: UserDetails = {
  id: "U001",
  fullName: "John Michael Smith",
  email: "john.smith@email.com",
  profileImageUrl: blankProfilePicture,
  status: "active",
  verificationStatus: "Verified",
  citizenId: "********1234",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "March 15, 1990",
  address: "456 Elm Street, District 3, Ho Chi Minh City, Vietnam",
  registrationDate: "March 15, 2024",
  lastLogin: "June 3, 2025 - 14:30 PM",
  vehicles: [
    {
      licensePlate: "ABC-1234",
      model: "2020 Toyota Camry",
      color: "White",
      registrationDate: "Mar 16, 2024",
      status: "active",
    },
    {
      licensePlate: "XYZ-5678",
      model: "2019 Honda Civic",
      color: "Blue",
      registrationDate: "Apr 10, 2024",
      status: "active",
    },
  ],
  sharedVehicles: [
    {
      licensePlate: "GHI-3456",
      model: "2018 Ford Focus",
      color: "Red",
      registrationDate: "Feb 20, 2024",
      owner: "Sarah Johnson (USER-SARAH2024)",
      accessType: "Temporary Access",
      status: "active",
    },
    {
      licensePlate: "DEF-9012",
      model: "2021 Nissan Altima",
      color: "Silver",
      registrationDate: "Jan 15, 2024",
      owner: "Mike Wilson (USER-MIKE2023)",
      accessType: "Permanent Access",
      status: "active",
    },
  ],
  parkingActivity: [
    {
      date: "Jun 2, 2025",
      location: "Downtown Mall",
      vehicle: "ABC-1234",
      duration: "2h 15m",
      amount: "$12.38",
    },
    {
      date: "Jun 1, 2025",
      location: "Airport Terminal",
      vehicle: "XYZ-5678",
      duration: "4h 30m",
      amount: "$22.50",
    },
    {
      date: "May 30, 2025",
      location: "City Center",
      vehicle: "ABC-1234",
      duration: "1h 45m",
      amount: "$8.75",
    },
  ],
  stats: {
    totalParkingSessions: 47,
    totalSpent: "$234.50",
    avgSessionDuration: "2.3h",
  },
};

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  useParams<{ id: string }>();
  const location = useLocation();
  const userData = location.state?.user;

  console.log("Location state:", location.state);
  console.log("User data from navigation:", userData);

  // Transform ClientUser to UserDetails if userData is provided
  // Nếu là real data, chỉ thay thế các thông tin cơ bản và giữ nguyên mockdata cho phần vehicles, activities
  const transformedUserData = userData
    ? ({
        ...mockUserData, // Giữ lại dữ liệu mock cho phần xe và hoạt động
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        status: userData.status,
        registrationDate: userData.createdAt || mockUserData.registrationDate,
        // Các trường khác vẫn giữ giá trị mock
      } as UserDetails)
    : null;

  // Use transformed data or fallback to mock data
  const [user] = useState<UserDetails>(transformedUserData || mockUserData);
  const [showConfirmBan, setShowConfirmBan] = useState(false);

  return (
    <div className="space-y-6 w-full">
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
                    {user.verificationStatus}
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
            <div className="border rounded p-3 bg-gray-50">{user.email}</div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Phone Number</p>
            <div className="border rounded p-3 bg-gray-50">{user.phone}</div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Citizen ID</p>
            <div className="border rounded p-3 bg-gray-50 flex items-center">
              {user.citizenId}
              <span className="ml-2 text-xs text-gray-500 italic">
                (number is masked for privacy)
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
            <div className="border rounded p-3 bg-gray-50">
              {user.dateOfBirth}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Registration Date</p>
            <div className="border rounded p-3 bg-gray-50">
              {user.registrationDate}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Login</p>
            <div className="border rounded p-3 bg-gray-50">
              {user.lastLogin}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Address</p>
            <div className="border rounded p-3 bg-gray-50">{user.address}</div>
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
          <table className="w-full border-collapse">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  License Plate
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Vehicle Model
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Color
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Registration Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {user.vehicles.length > 0 ? (
                user.vehicles.map((vehicle) => (
                  <tr key={vehicle.licensePlate} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {vehicle.licensePlate}
                    </td>
                    <td className="px-4 py-3 text-sm">{vehicle.model}</td>
                    <td className="px-4 py-3 text-sm">{vehicle.color}</td>
                    <td className="px-4 py-3 text-sm">
                      {vehicle.registrationDate}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No registered vehicles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Shared Vehicles Section */}
      <Card className="p-6 w-full border border-gray-200 shadow-sm">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Shared Vehicles</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  License Plate
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Vehicle Model
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Access Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {user.sharedVehicles && user.sharedVehicles.length > 0 ? (
                user.sharedVehicles.map((vehicle) => (
                  <tr key={vehicle.licensePlate} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {vehicle.licensePlate}
                    </td>
                    <td className="px-4 py-3 text-sm">{vehicle.model}</td>
                    <td className="px-4 py-3 text-sm">{vehicle.owner}</td>
                    <td className="px-4 py-3 text-sm">{vehicle.accessType}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                          vehicle.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vehicle.status.charAt(0).toUpperCase() +
                          vehicle.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No shared vehicles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-sm text-gray-500 mt-2">
            Vehicles that other users have shared with this account
          </div>
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
                {user.stats.totalParkingSessions}
              </div>
              <div className="text-sm">Total Parking Sessions</div>
            </div>
          </div>

          <div className="bg-[#40bcd8] rounded-lg p-5 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {user.stats.totalSpent}
              </div>
              <div className="text-sm">Total Spent</div>
            </div>
          </div>

          <div className="bg-[#40bcd8] rounded-lg p-5 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {user.stats.avgSessionDuration}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {user.parkingActivity.length > 0 ? (
                user.parkingActivity.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{activity.date}</td>
                    <td className="px-4 py-3 text-sm">{activity.location}</td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {activity.vehicle}
                    </td>
                    <td className="px-4 py-3 text-sm">{activity.duration}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {activity.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No parking activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

        <Button
          color="danger"
          size="lg"
          startContent={<Ban />}
          className="bg-red-600 text-white px-8"
          onPress={() => setShowConfirmBan(true)}
        >
          Ban Account
        </Button>

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Ban Account</h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to ban {user.fullName}'s account? The user
              will not be able to log in until the account is reactivated.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={() => setShowConfirmBan(false)}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  alert("Account banned successfully");
                  setShowConfirmBan(false);
                }}
              >
                Ban Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
