import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Divider } from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  CheckCircle2,
  Save,
  FileText,
} from "lucide-react";

interface ParkingLot {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
  status: "Active" | "Maintenance" | "Closed";
  description: string;
}

interface ParkingLotOwner {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  status: "Active" | "Pending" | "Suspended";
  joinDate: string;
  lastActivity: string;
  parkingLot: {
    name: string;
    address: string;
    totalSlots: number;
    operatingHours: string;
    hourlyRate: number;
    dailyRate: number;
  };
  paymentSource: {
    bank: string;
    accountNumber: string;
    accountName: string;
    branch: string;
    swiftCode: string;
    isVerified: boolean;
  };
  requests: {
    id: string;
    type: string;
    description: string;
    sentDate: string;
    status: "Pending" | "Approved" | "Rejected";
  }[];
  parkingLots: ParkingLot[];
}

// Mock data based on the image
const mockOwnerData: ParkingLotOwner = {
  id: "PO001",
  ownerName: "Downtown Mall Corporation",
  email: "owner@downtownmall.com",
  phone: "+1 (555) 123-4567",
  status: "Active",
  joinDate: "March 15, 2024",
  lastActivity: "June 3, 2025 - 14:30 PM",
  parkingLot: {
    name: "Downtown Mall Parking",
    address: "123 Main Street, Downtown District, City Center, 10001",
    totalSlots: 150,
    operatingHours: "24/7 Operation",
    hourlyRate: 5.0,
    dailyRate: 25.0,
  },
  paymentSource: {
    bank: "Vietcombank",
    accountNumber: "12345678901234",
    accountName: "Downtown Mall Corporation",
    branch: "Downtown Branch",
    swiftCode: "BFTVVNVX",
    isVerified: true,
  },
  requests: [
    {
      id: "REQ004",
      type: "Payment Source Update",
      description: "Update bank account information",
      sentDate: "Jun 3, 2025",
      status: "Pending",
    },
    {
      id: "REQ003",
      type: "Staff Account Creation",
      description: "Add new staff member: John Smith",
      sentDate: "Jun 2, 2025",
      status: "Pending",
    },
    {
      id: "REQ002",
      type: "Parking Lot Information Update",
      description: "Update operating hours and rates",
      sentDate: "May 28, 2025",
      status: "Approved",
    },
    {
      id: "REQ001",
      type: "Contact Information Update",
      description: "Update email and phone number",
      sentDate: "May 15, 2025",
      status: "Approved",
    },
  ],
  parkingLots: [
    {
      id: "PL001",
      name: "Downtown Mall Main Parking",
      address: "123 Main Street, Downtown District, City Center, 10001",
      totalSlots: 150,
      status: "Active",
      description:
        "Main parking facility for Downtown Mall with 24/7 operation",
    },
    {
      id: "PL002",
      name: "Downtown Mall VIP Parking",
      address: "125 Main Street, Downtown District, City Center, 10001",
      totalSlots: 50,
      status: "Active",
      description: "Premium parking area for VIP customers with valet service",
    },
    {
      id: "PL003",
      name: "Downtown Mall Staff Parking",
      address: "130 Side Street, Downtown District, City Center, 10001",
      totalSlots: 75,
      status: "Active",
      description: "Dedicated parking area for mall staff and employees",
    },
    {
      id: "PL004",
      name: "Downtown Mall Outdoor Parking",
      address: "140 Rear Avenue, Downtown District, City Center, 10001",
      totalSlots: 120,
      status: "Maintenance",
      description: "Outdoor parking area currently under renovation",
    },
    {
      id: "PL005",
      name: "Downtown Mall Event Parking",
      address: "150 Event Square, Downtown District, City Center, 10001",
      totalSlots: 200,
      status: "Closed",
      description:
        "Special event parking area, currently closed until next event",
    },
  ],
};

const ParkingLotOwnerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // In real implementation, id would be used to fetch data from API
  console.log("Owner ID:", id); // Using the id parameter to avoid lint error

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div className="flex items-start gap-2">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate("/admin/parking-owners")}
          className="text-primary mt-1"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Parking Owner Details
          </h1>
          <p className="text-sm text-gray-500">
            View comprehensive information about parking lot owner and their
            requests
          </p>
        </div>
      </div>

      {/* Owner Overview */}
      <Card className="p-6">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <Building2 size={20} className="mr-2 text-primary" />
          Owner Overview
        </h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center">
              <div className="bg-primary w-16 h-16 rounded-md flex items-center justify-center">
                <Building2 size={32} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between w-full">
              <div>
                <h3 className="text-xl font-bold">{mockOwnerData.ownerName}</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-8 mt-1">
                  <div>
                    <div className="text-sm text-gray-500">Owner ID</div>
                    <div className="font-medium">{mockOwnerData.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-sm">
                      {mockOwnerData.status}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">Parking Lot Name</div>
                  <div className="font-medium">
                    {mockOwnerData.parkingLot.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card className="p-6">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <FileText size={20} className="mr-2 text-primary" />
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Contact Email</div>
            <input
              type="text"
              value={mockOwnerData.email}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Phone Number</div>
            <input
              type="text"
              value={mockOwnerData.phone}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Join Date</div>
            <input
              type="text"
              value={mockOwnerData.joinDate}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Last Activity</div>
            <input
              type="text"
              value={mockOwnerData.lastActivity}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Parking Lot Address</div>
          <input
            type="text"
            value={mockOwnerData.parkingLot.address}
            readOnly
            className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
          />
          <div className="text-xs text-gray-400 mt-1">
            This field can be modified by administrators
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Total Parking Slots
            </div>
            <input
              type="text"
              value={mockOwnerData.parkingLot.totalSlots}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Operating Hours</div>
            <input
              type="text"
              value={mockOwnerData.parkingLot.operatingHours}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Hourly Rate</div>
            <input
              type="text"
              value={`$${mockOwnerData.parkingLot.hourlyRate.toFixed(2)}`}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Daily Rate</div>
            <input
              type="text"
              value={`$${mockOwnerData.parkingLot.dailyRate.toFixed(2)}`}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <Button
          color="primary"
          startContent={<Save size={16} />}
          className="mt-4 text-white"
        >
          Save Address Changes
        </Button>
      </Card>

      {/* Current Payment Source */}
      <Card className="p-6">
        <h2
          className="flex items-center tex
        6+
        6t-lg font-semibold mb-4"
        >
          <CreditCard size={20} className="mr-2 text-primary" />
          Current Payment Source
        </h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-center mb-6">
            {mockOwnerData.paymentSource.bank}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0">
                <CreditCard size={28} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Account Number</div>
                <div className="font-medium text-lg">
                  {mockOwnerData.paymentSource.accountNumber}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Account Name</div>
              <div className="font-medium text-lg">
                {mockOwnerData.paymentSource.accountName}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Branch</div>
              <div className="font-medium text-primary">
                {mockOwnerData.paymentSource.branch}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Swift Code</div>
              <div className="font-medium">
                {mockOwnerData.paymentSource.swiftCode}
              </div>
            </div>
          </div>
        </div>
        <Divider className="my-4" />
        <div className="bg-blue-50 p-4 rounded-md flex items-center">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-3 flex-shrink-0">
            <CheckCircle2 size={16} className="text-white" />
          </div>
          <div className="text-sm">
            <span className="font-medium">Payment Account Status:</span> Active
            and verified for payment processing
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              Active
            </span>
          </div>
        </div>
      </Card>

      {/* Parking Lot List */}
      <Card className="p-6">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <Building2 size={20} className="mr-2 text-primary" />
          Parking Lot List
        </h2>
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-full table-fixed border-collapse">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium w-[5%]">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[25%]">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[25%]">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[15%]">
                  Total Parking Slots
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[10%]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[20%]">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockOwnerData.parkingLots.map((parkingLot, index) => (
                <tr key={parkingLot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center">
                      <div className="bg-primary p-2 rounded mr-2">
                        <Building2 size={20} className="text-white" />
                      </div>
                      <div>{parkingLot.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{parkingLot.address}</td>
                  <td className="px-4 py-3 text-sm">{parkingLot.totalSlots}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                        parkingLot.status === "Active"
                          ? "bg-green-200 text-green-800"
                          : parkingLot.status === "Maintenance"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-red-200 text-red-800"
                      }`}
                    >
                      {parkingLot.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {parkingLot.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Note */}
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
            <p>
              <span className="font-semibold">Note:</span> The parking lot owner
              can manage multiple parking facilities. All facilities share the
              same payment account.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ParkingLotOwnerDetails;
