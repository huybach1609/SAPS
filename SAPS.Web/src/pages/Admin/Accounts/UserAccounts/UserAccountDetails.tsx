import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Avatar, Divider } from "@heroui/react";
import { ArrowLeft, Ban, Lock } from "lucide-react";

interface UserDetails {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  profileImageUrl: string;
  status: "active" | "inactive" | "banned";
  createdAt: Date;
  citizenId: string;
  dateOfBirth: Date;
  nationality: string;
  placeOfResidence: string;
}

const mockUserDetails: UserDetails = {
  id: "1",
  email: "user@example.com",
  fullName: "John Doe",
  phone: "+1234567890",
  profileImageUrl: "/default-avatar.png",
  status: "active",
  createdAt: new Date("2023-01-01"),
  citizenId: "123456789012",
  dateOfBirth: new Date("1990-01-01"),
  nationality: "Vietnamese",
  placeOfResidence: "Ho Chi Minh City",
};

const UserAccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user] = useState<UserDetails>(mockUserDetails);
  const [showConfirmBan, setShowConfirmBan] = useState(false);

  const handleBanUser = () => {
    // Implement ban user logic here
    setShowConfirmBan(false);
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

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar
              src={user.profileImageUrl}
              alt={user.fullName}
              className="w-24 h-24"
            />
            <h2 className="mt-4 text-xl font-semibold">{user.fullName}</h2>
            <p className="text-default-600">{user.email}</p>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  user.status === "active"
                    ? "bg-success/20 text-success"
                    : user.status === "banned"
                      ? "bg-danger/20 text-danger"
                      : "bg-warning/20 text-warning"
                }`}
              >
                {user.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2 w-full">
              <Button
                color="danger"
                variant="flat"
                startContent={<Ban />}
                className="w-full"
                onPress={() => setShowConfirmBan(true)}
                isDisabled={user.status === "banned"}
              >
                Ban Account
              </Button>
              <Button
                color="primary"
                variant="flat"
                startContent={<Lock />}
                className="w-full"
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
            <div>
              <label className="text-sm text-default-600">Citizen ID</label>
              <p className="font-medium">•••••••{user.citizenId.slice(-4)}</p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Phone Number</label>
              <p className="font-medium">{user.phone}</p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Date of Birth</label>
              <p className="font-medium">
                {user.dateOfBirth.toLocaleDateString()}
              </p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Nationality</label>
              <p className="font-medium">{user.nationality}</p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">
                Place of Residence
              </label>
              <p className="font-medium">{user.placeOfResidence}</p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">
                Account Created
              </label>
              <p className="font-medium">
                {user.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ban Confirmation Modal */}
      {showConfirmBan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Ban Account</h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to ban this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={() => setShowConfirmBan(false)}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleBanUser}>
                Ban Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserAccountDetails;
