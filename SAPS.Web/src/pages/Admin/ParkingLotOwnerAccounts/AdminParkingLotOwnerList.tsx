import DefaultLayout from "@/layouts/default";
import {
  Button,
  Card,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  Building2,
  Edit,
  FileText,
  Search,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Status action buttons mapping
  const getStatusActions = (status) => {
    switch (status) {
      case "Active":
        return (
          <>
            <Button size="sm" color="warning" variant="flat">
              Suspend
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={16} />}
            >
              Remove
            </Button>
          </>
        );
      case "Pending":
        return (
          <>
            <Button
              size="sm"
              color="success"
              variant="flat"
              startContent={<CheckCircle size={16} />}
            >
              Approve
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<XCircle size={16} />}
            >
              Reject
            </Button>
          </>
        );
      case "Suspended":
        return (
          <>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<RefreshCw size={16} />}
            >
              Reactivate
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<Trash2 size={16} />}
            >
              Ban
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header Section */}
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <Building2 size={32} className="mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-primary">
            Parking Lot Owner Management
          </h1>
        </div>
        <p className="text-default-500">
          Manage parking lot owners and their facilities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{totalOwners}</div>
          <div className="text-sm">Total Owners</div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{activeOwners}</div>
          <div className="text-sm">Active Owners</div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{pendingApproval}</div>
          <div className="text-sm">Pending Approval</div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{totalParkingLots}</div>
          <div className="text-sm">Total Parking Lots</div>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <Card className="p-6 border border-default-200">
        <div className="mb-4 flex items-center gap-2">
          <Search size={20} className="text-default-500" />
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm">
              Search Parking Lot Owners
            </label>
            <Input
              type="text"
              placeholder="Search by ID, owner name, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Status</label>
            <select
              className="w-full p-2 border rounded-md"
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
            <label className="block mb-2 text-sm">Join Date</label>
            <Input type="date" className="w-full" />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button color="primary" startContent={<Search />}>
            Search
          </Button>
          <Button color="success" startContent={<UserPlus />}>
            Add Owner
          </Button>
        </div>
      </Card>

      {/* Owner List Table */}
      <Card className="border border-default-200">
        <div className="p-4 border-b border-default-200">
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h2 className="text-lg font-semibold">Parking Lot Owner List</h2>
          </div>
        </div>

        <Table aria-label="Parking Lot Owners">
          <TableHeader>
            <TableColumn className="bg-primary text-white font-bold">
              Owner ID
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Parking Lot Name
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Owner Name
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Contact Email
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Join Date
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Status
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Actions
            </TableColumn>
          </TableHeader>
          <TableBody>
            {currentItems.map((owner) => (
              <TableRow key={owner.id}>
                <TableCell>{owner.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="bg-primary p-2 rounded mr-2">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <div>
                      <div>{owner.parkingLotName}</div>
                      <div className="text-xs text-default-500">
                        {owner.details.slots} • {owner.details.operation}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{owner.ownerName}</TableCell>
                <TableCell>{owner.email}</TableCell>
                <TableCell>{owner.joinDate}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      owner.status === "Active"
                        ? "bg-success-100 text-success"
                        : owner.status === "Pending"
                          ? "bg-warning-100 text-warning"
                          : "bg-danger-100 text-danger"
                    }`}
                  >
                    {owner.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" color="primary" variant="flat">
                      Details
                    </Button>
                    {getStatusActions(owner.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between p-4 items-center border-t border-default-200">
          <div className="text-sm text-default-500">
            Showing {startItem} to {endItem} of {filteredOwners.length} entries
          </div>
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              variant="light"
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Determine which page numbers to show
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  size="sm"
                  color={currentPage === pageNum ? "primary" : "default"}
                  onClick={() => setCurrentPage(pageNum)}
                  variant={currentPage === pageNum ? "solid" : "light"}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              variant="light"
            >
              Next
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
    </div>
  );
}
