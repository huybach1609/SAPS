import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Avatar,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate("/admin/parking-owners")}
          className="text-default-900"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold">Parking Lot Owner Details</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar
              alt={owner.fullName}
              className="w-24 h-24"
              // Generate initials from name
              text={owner.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            />
            <h2 className="mt-4 text-xl font-semibold">{owner.fullName}</h2>
            <p className="text-default-600">{owner.email}</p>
            <p className="text-default-600">{owner.phone}</p>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  owner.status === "active"
                    ? "bg-success/20 text-success"
                    : owner.status === "pending"
                      ? "bg-warning/20 text-warning"
                      : "bg-danger/20 text-danger"
                }`}
              >
                {owner.status}
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
                isDisabled={owner.status === "inactive"}
              >
                Ban Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Financial Summary Card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Financial Summary</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-default-600">Total Revenue</label>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(owner.totalRevenue)}
              </p>
            </div>

            <Divider />

            <div>
              <label className="text-sm text-default-600">
                Payment Sources
              </label>
              {owner.paymentSources.map((source) => (
                <div
                  key={source.id}
                  className="mt-2 p-3 bg-default-100 rounded-lg"
                >
                  <p className="font-medium">{source.bankName}</p>
                  <p className="text-sm text-default-600">
                    {source.accountName} • {source.accountNumber}
                  </p>
                  <p className="text-xs text-default-400">
                    Last updated: {source.lastUpdated.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Parking Lots Card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Parking Lots</h3>
          </div>

          <Table aria-label="Parking lots">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>SLOTS</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {owner.parkingLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lot.name}</p>
                      <p className="text-xs text-default-400">{lot.address}</p>
                    </div>
                  </TableCell>
                  <TableCell>{lot.totalSlots}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        lot.status === "active"
                          ? "bg-success/20 text-success"
                          : "bg-danger/20 text-danger"
                      }`}
                    >
                      {lot.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Ban Confirmation Modal */}
      {showConfirmBan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Ban Owner Account</h3>
            <p className="text-default-600 mb-6">
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
