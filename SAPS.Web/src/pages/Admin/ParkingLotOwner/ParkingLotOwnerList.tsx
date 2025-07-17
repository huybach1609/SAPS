import { Button, Card, Input, Pagination } from "@heroui/react";
import { Building2, UserPlus, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddParkingLotOwner from "./AddParkingLotOwner";

// Fake data for demonstration
const parkingLotOwners = [
  {
    id: "PO001",
    parkingLotName: "Downtown Mall Parking",
    ownerName: "Downtown Mall Corporation",
    email: "owner@downtownmall.com",
    joinDate: "Mar 15, 2024",
    status: "Active",
    details: {
      slots: "150 slots",
      operation: "24/7 operation",
    },
  },
  {
    id: "PO002",
    parkingLotName: "Airport Parking Complex",
    ownerName: "City Airport Authority",
    email: "parking@cityairport.com",
    joinDate: "Jan 05, 2024",
    status: "Active",
    details: {
      slots: "300 slots",
      operation: "24/7 operation",
    },
  },
  {
    id: "PO003",
    parkingLotName: "Central Park Garage",
    ownerName: "CityParking Inc.",
    email: "info@cityparking.com",
    joinDate: "Apr 22, 2024",
    status: "Pending",
    details: {
      slots: "85 slots",
      operation: "8am-10pm",
    },
  },
  {
    id: "PO004",
    parkingLotName: "University Campus Parking",
    ownerName: "State University",
    email: "facilities@stateuni.edu",
    joinDate: "Feb 28, 2024",
    status: "Active",
    details: {
      slots: "500 slots",
      operation: "24/7 operation",
    },
  },
  {
    id: "PO005",
    parkingLotName: "Metro Station Parking",
    ownerName: "Metro Transportation Co.",
    email: "parking@metrotrans.com",
    joinDate: "Apr 5, 2024",
    status: "Suspended",
    details: {
      slots: "80 slots",
      operation: "5AM-12AM",
    },
  },
  {
    id: "PO006",
    parkingLotName: "Business District Garage",
    ownerName: "Business Park Management",
    email: "info@businesspark.com",
    joinDate: "Jun 1, 2024",
    status: "Pending",
    details: {
      slots: "400 slots",
      operation: "Mon-Fri 7AM-8PM",
    },
  },
  {
    id: "PO007",
    parkingLotName: "Seaside Beach Parking",
    ownerName: "Coastal Resorts Ltd",
    email: "parking@coastalresorts.com",
    joinDate: "May 12, 2024",
    status: "Active",
    details: {
      slots: "120 slots",
      operation: "9AM-11PM",
    },
  },
  {
    id: "PO008",
    parkingLotName: "Highland Shopping Center",
    ownerName: "Highland Retail Group",
    email: "admin@highlandretail.com",
    joinDate: "Feb 03, 2024",
    status: "Active",
    details: {
      slots: "250 slots",
      operation: "8AM-10PM",
    },
  },
  {
    id: "PO009",
    parkingLotName: "Grand Hotel Valet",
    ownerName: "Luxury Hotels International",
    email: "valet@grandhotel.com",
    joinDate: "Jan 15, 2024",
    status: "Active",
    details: {
      slots: "75 slots",
      operation: "24/7 operation",
    },
  },
  {
    id: "PO010",
    parkingLotName: "Medical Center Parking",
    ownerName: "City Health Services",
    email: "parking@cityhealth.org",
    joinDate: "Mar 22, 2024",
    status: "Active",
    details: {
      slots: "180 slots",
      operation: "24/7 operation",
    },
  },
  {
    id: "PO011",
    parkingLotName: "Sports Arena Parking",
    ownerName: "Metropolitan Sports Authority",
    email: "parking@metrosports.com",
    joinDate: "Apr 10, 2024",
    status: "Active",
    details: {
      slots: "600 slots",
      operation: "Event days only",
    },
  },
  {
    id: "PO012",
    parkingLotName: "Riverside Park & Ride",
    ownerName: "City Transit Authority",
    email: "transit@citygovt.org",
    joinDate: "May 05, 2024",
    status: "Pending",
    details: {
      slots: "220 slots",
      operation: "6AM-8PM",
    },
  },
];

// Status options for filter
const statusOptions = [
  { label: "All Status", value: "All" },
  { label: "Active", value: "Active" },
  { label: "Pending", value: "Pending" },
  { label: "Suspended", value: "Suspended" },
];

export default function AdminParkingLotOwnerList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddOwner, setShowAddOwner] = useState(false);
  const itemsPerPage = 4; // Số lượng items trên mỗi trang

  // Stats
  const totalOwners = parkingLotOwners.length;
  const activeOwners = parkingLotOwners.filter(
    (owner) => owner.status === "Active"
  ).length;
  const pendingApproval = parkingLotOwners.filter(
    (owner) => owner.status === "Pending"
  ).length;
  const totalParkingLots = parkingLotOwners.length; // For demo, assuming 1 lot per owner

  // Filter parking lot owners based on search term and status
  const filteredOwners = parkingLotOwners.filter((owner) => {
    const matchesSearch =
      owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.parkingLotName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || owner.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const currentItems = filteredOwners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredOwners.length);

  // Đã xóa bỏ tất cả các action buttons khác, chỉ giữ lại View Details

  return (
    <div className="space-y-6 py-4">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h1 className="text-2xl font-bold text-indigo-900">
            Parking Lot Owner Management
          </h1>
        </div>
        <p className="text-gray-500 mb-4">
          Manage parking lot owners and their facilities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalOwners}</div>
            <div className="text-sm">Total Owners</div>
          </div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{activeOwners}</div>
            <div className="text-sm">Active Owners</div>
          </div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{pendingApproval}</div>
            <div className="text-sm">Pending Approval</div>
          </div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalParkingLots}</div>
            <div className="text-sm">Total Parking Lots</div>
          </div>
        </Card>
      </div>

      {/* Search & Actions Section */}
      <div className="border border-gray-200 rounded-lg shadow-sm p-6 mb-4 w-full">
        <div className="border-l-4 border-blue-600 pl-4 mb-4">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              Search & Actions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Search Owners
            </label>
            <Input
              placeholder="Search by name, email, etc"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Join Date</label>
            <Input type="date" className="w-full" />
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              color="primary"
              className="bg-blue-600 rounded-full text-white"
              startContent={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              onPress={() => {
                // Apply filters
                setCurrentPage(1); // Reset to first page when applying new filters
              }}
            >
              Search
            </Button>

            <Button
              color="default"
              variant="light"
              className="rounded-full"
              onPress={() => {
                // Clear all filters
                setSearchTerm("");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>

          <Button
            color="primary"
            startContent={<UserPlus size={18} />}
            className="bg-blue-600 rounded-full text-white"
            onPress={() => setShowAddOwner(true)}
          >
            Add Owner
          </Button>
        </div>
      </div>

      {/* Owner List Table */}
      <Card className="border border-gray-200 rounded-lg shadow-sm p-6 w-full flex-grow">
        <div className="border-l-4 border-blue-600 pl-4 mb-4 w-full">
          <div className="flex items-center w-full">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              Parking Lot Owner List
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-full table-fixed border-collapse">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium w-[5%]">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[22%]">
                  Parking Lot Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[18%]">
                  Owner Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[20%]">
                  Contact Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[12%]">
                  Join Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[10%]">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium w-[13%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="text-center py-6">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No parking lot owners found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || statusFilter !== "All"
                          ? "Try adjusting your search or filter criteria"
                          : "Get started by adding a new parking lot owner."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((owner, index) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center">
                        <div className="bg-primary p-2 rounded mr-2">
                          <Building2 size={24} className="text-white" />
                        </div>
                        <div>
                          <div>{owner.parkingLotName}</div>
                          <div className="text-xs text-gray-500">
                            {owner.details.slots} • {owner.details.operation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{owner.ownerName}</td>
                    <td className="px-4 py-3 text-sm">{owner.email}</td>
                    <td className="px-4 py-3 text-sm">{owner.joinDate}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                          owner.status === "Active"
                            ? "bg-green-200 text-green-800"
                            : owner.status === "Pending"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-red-200 text-red-800"
                        }`}
                      >
                        {owner.status.charAt(0).toUpperCase() +
                          owner.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="rounded-full bg-blue-100 hover:bg-blue-200"
                        startContent={<Eye size={16} />}
                        onPress={() =>
                          navigate(`/admin/parking-owners/${owner.id}`)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Management Note - within table container */}
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
            <p>
              <span className="font-semibold">Permission Note:</span> Active
              owners can manage their parking lots independently. Pending owners
              require approval before their facilities go live.
            </p>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm w-full">
          <div className="mb-2 md:mb-0">
            Showing {startItem} to {endItem} of {filteredOwners.length} entries
          </div>

          <div className="flex justify-end w-full md:w-auto items-center gap-2">
            <Button
              size="sm"
              variant="light"
              color="primary"
              className="rounded-full flex items-center"
              isDisabled={currentPage === 1}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
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
                  d="M15 5l-7 7 7 7"
                />
              </svg>
              Previous
            </Button>

            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
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
              isDisabled={currentPage === totalPages}
              onPress={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
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
      </Card>

      {/* Management Note */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
        <p className="font-semibold">Management Note:</p>
        <p>
          Active owners can manage their parking lots independently. Pending
          owners require approval before their facilities go live. Suspended
          owners cannot process new parking sessions.
        </p>
      </div>

      {/* Add Owner Modal */}
      {showAddOwner && (
        <AddParkingLotOwner
          onClose={() => setShowAddOwner(false)}
          onSuccess={() => {
            // Refresh owner list or show success message
            setCurrentPage(1); // Reset to first page to show new owner
          }}
        />
      )}
    </div>
  );
}
