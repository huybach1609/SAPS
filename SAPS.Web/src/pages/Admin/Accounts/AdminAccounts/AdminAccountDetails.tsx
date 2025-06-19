import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Avatar, Divider } from "@heroui/react";
import { ArrowLeft, Ban, Lock, Trash } from "lucide-react";
import { AdminUser } from "@/types/admin";
import { useAuth } from "@/contexts/AuthContext";

interface AdminDetails extends AdminUser {
  lastLogin: Date;
  actionsCount: number;
}

const mockAdminDetails: AdminDetails = {
  id: "1",
  email: "admin@sapls.com",
  fullName: "John Admin",
  adminId: "AD001",
  role: "admin",
  status: "active",
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
  lastLogin: new Date("2023-06-19"),
  actionsCount: 156,
};

const AdminAccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [admin] = useState<AdminDetails>(mockAdminDetails);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const isCurrentUserHeadAdmin = currentUser?.role === "head_admin";
  const isTargetHeadAdmin = admin.role === "head_admin";
  const canModifyAdmin = isCurrentUserHeadAdmin && !isTargetHeadAdmin;

  const handleRemoveAdmin = () => {
    // Implement remove admin logic here
    setShowConfirmRemove(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate("/admin/accounts/admins")}
          className="text-default-900"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold">Admin Account Details</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar
              alt={admin.fullName}
              className="w-24 h-24"
              // Generate initials from name
              text={admin.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            />
            <h2 className="mt-4 text-xl font-semibold">{admin.fullName}</h2>
            <p className="text-default-600">{admin.email}</p>
            <div className="mt-2 space-y-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  admin.role === "head_admin"
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary/20 text-secondary"
                }`}
              >
                {admin.role === "head_admin" ? "Head Admin" : "Admin"}
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  admin.status === "active"
                    ? "bg-success/20 text-success"
                    : "bg-danger/20 text-danger"
                }`}
              >
                {admin.status}
              </span>
            </div>

            {/* Action Buttons */}
            {canModifyAdmin && (
              <div className="mt-6 space-y-2 w-full">
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Lock />}
                  className="w-full"
                >
                  Reset Password
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<Trash />}
                  className="w-full"
                  onPress={() => setShowConfirmRemove(true)}
                >
                  Remove Admin
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Details Card */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Admin Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-default-600">Admin ID</label>
              <p className="font-medium">{admin.adminId}</p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Role</label>
              <p className="font-medium capitalize">
                {admin.role.replace("_", " ")}
              </p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Status</label>
              <p className="font-medium capitalize">{admin.status}</p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Last Login</label>
              <p className="font-medium">{admin.lastLogin.toLocaleString()}</p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Total Actions</label>
              <p className="font-medium">
                {admin.actionsCount} actions performed
              </p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">
                Account Created
              </label>
              <p className="font-medium">
                {admin.createdAt.toLocaleDateString()}
              </p>
            </div>
            <Divider />
            <div>
              <label className="text-sm text-default-600">Last Updated</label>
              <p className="font-medium">
                {admin.updatedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Remove Confirmation Modal */}
      {showConfirmRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Remove Admin</h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to remove this admin? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="flat"
                onPress={() => setShowConfirmRemove(false)}
              >
                Cancel
              </Button>
              <Button color="danger" onPress={handleRemoveAdmin}>
                Remove Admin
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAccountDetails;
