import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Divider } from "@heroui/react";
import { ArrowLeft, Building2, CreditCard, Ban } from "lucide-react";

interface ParkingLot {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
  status: "active" | "inactive";
}

interface PaymentSource {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  lastUpdated: Date;
}

interface ParkingLotOwnerDetails {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  createdAt: Date;
  totalRevenue: number;
  parkingLots: ParkingLot[];
  paymentSources: PaymentSource[];
}

const mockOwnerDetails: ParkingLotOwnerDetails = {
  id: "1",
  fullName: "John Owner",
  email: "owner@example.com",
  phone: "+1234567890",
  status: "active",
  createdAt: new Date("2023-01-01"),
  totalRevenue: 15000000,
  parkingLots: [
    {
      id: "PL001",
      name: "Central Parking",
      address: "123 Main St, City",
      totalSlots: 100,
      status: "active",
    },
    {
      id: "PL002",
      name: "West Side Parking",
      address: "456 West St, City",
      totalSlots: 80,
      status: "active",
    },
  ],
  paymentSources: [
    {
      id: "PS001",
      bankName: "VietcomBank",
      accountName: "John Owner",
      accountNumber: "•••••789",
      lastUpdated: new Date("2023-06-01"),
    },
  ],
};

const ParkingLotOwnerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // Trong thực tế, id sẽ được sử dụng để fetch dữ liệu từ API
  const [owner] = useState<ParkingLotOwnerDetails>(mockOwnerDetails);
  const [showConfirmBan, setShowConfirmBan] = useState(false);

  const handleBanOwner = () => {
    // Implement ban owner logic here
    setShowConfirmBan(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <div
          onClick={() => navigate("/admin/parking-owners")}
          className="flex items-center text-blue-600 hover:underline cursor-pointer"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Parking Lot Owner
          List
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <Building2 size={32} className="mr-2 text-blue-900" />
          <h1 className="text-2xl font-bold text-blue-900">
            Parking Lot Owner Details
          </h1>
        </div>
        <p className="text-gray-500">
          View and manage parking lot owner account information
        </p>
      </div>

      {/* Owner Overview */}
      <Card className="p-6 bg-blue-50">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Building2 size={20} className="mr-2 text-blue-600" /> Owner Overview
        </h2>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 flex justify-center md:justify-start">
            <div className="w-24 h-24 bg-blue-600 rounded-md flex items-center justify-center text-white text-3xl font-bold">
              {owner.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
          <div className="md:w-3/4 mt-4 md:mt-0 md:pl-4 flex flex-col md:flex-row">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{owner.fullName}</h3>
              <div className="mt-2 grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-sm text-gray-500">Owner ID</div>
                  <div className="font-medium">{owner.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <span
                    className={`px-2 py-1 rounded-md text-sm ${
                      owner.status === "active"
                        ? "bg-green-100 text-green-600"
                        : owner.status === "pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {owner.status.charAt(0).toUpperCase() +
                      owner.status.slice(1)}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{owner.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{owner.phone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Summary Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard size={20} className="mr-2" />
            Financial Summary
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="p-2 bg-gray-50 rounded border text-xl font-bold text-blue-600">
                {formatCurrency(owner.totalRevenue)}
              </div>
            </div>

            <Divider />

            <div>
              <div className="text-sm text-gray-500 mb-2">Payment Sources</div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        BANK
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        ACCOUNT
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        UPDATED
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {owner.paymentSources.map((source) => (
                      <tr key={source.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{source.bankName}</td>
                        <td className="px-4 py-2 text-sm">
                          {source.accountName} • {source.accountNumber}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {source.lastUpdated.toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* Parking Lots Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Building2 size={20} className="mr-2" />
            Parking Lots
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    NAME
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    SLOTS
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {owner.parkingLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div>
                        <p className="font-medium">{lot.name}</p>
                        <p className="text-xs text-gray-400">{lot.address}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">{lot.totalSlots}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs ${
                          lot.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {lot.status.charAt(0).toUpperCase() +
                          lot.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Account Management */}
      <Card className="p-6 col-span-1 md:col-span-2">
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
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Account Management
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            color={owner.status === "active" ? "warning" : "success"}
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
                  d={
                    owner.status === "active"
                      ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      : "M5 13l4 4L19 7"
                  }
                />
              </svg>
            }
          >
            {owner.status === "active" ? "Suspend Account" : "Activate Account"}
          </Button>

          <Button
            color="danger"
            startContent={<Ban size={20} />}
            onPress={() => setShowConfirmBan(true)}
            isDisabled={owner.status === "inactive"}
          >
            Ban Account
          </Button>
        </div>

        {/* Permission Note */}
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
          <p className="font-semibold">Management Note:</p>
          <p>
            Banning an owner account will permanently remove their access to the
            system and suspend all their parking lots. Suspended accounts can be
            reactivated later if needed.
          </p>
        </div>
      </Card>

      {/* Ban Confirmation Modal */}
      {showConfirmBan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Ban Owner Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to ban this parking lot owner? This will
              also suspend all their parking lots.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={() => setShowConfirmBan(false)}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleBanOwner}>
                Ban Owner
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParkingLotOwnerDetails;
