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
  Search,
  FileText,
  User,
  Car,
  Shield,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// Demo data for request list
const requestsList = [
  {
    id: "REQ001",
    header: "Personal Information Update",
    type: "Personal",
    description: "Update ID card and contact information",
    senderId: "U001",
    senderName: "John Smith",
    sentDate: "Jun 3, 2025",
    sentTime: "14:30 PM",
    status: "Pending",
    icon: <User size={24} className="text-white" />,
    iconBg: "bg-blue-500",
  },
  {
    id: "REQ002",
    header: "Vehicle Registration",
    type: "Vehicle",
    description: "Register new vehicle ABC-1278",
    senderId: "U025",
    senderName: "Sarah Johnson",
    sentDate: "Jun 3, 2025",
    sentTime: "10:15 AM",
    status: "Pending",
    icon: <Car size={24} className="text-white" />,
    iconBg: "bg-green-500",
  },
  {
    id: "REQ003",
    header: "Account Verification",
    type: "Account",
    description: "Verify identity documents",
    senderId: "U012",
    senderName: "Mike Wilson",
    sentDate: "Jun 2, 2025",
    sentTime: "16:45 PM",
    status: "Approved",
    icon: <Shield size={24} className="text-white" />,
    iconBg: "bg-purple-500",
  },
  {
    id: "REQ004",
    header: "Parking Lot Registration",
    type: "Facility",
    description: "Register new parking facility",
    senderId: "PO007",
    senderName: "Mall Center Corp",
    sentDate: "Jun 2, 2025",
    sentTime: "09:20 AM",
    status: "Under Review",
    icon: <Building size={24} className="text-white" />,
    iconBg: "bg-amber-500",
  },
  {
    id: "REQ005",
    header: "Vehicle Registration",
    type: "Vehicle",
    description: "Register vehicle XYZ-9999",
    senderId: "U008",
    senderName: "Emma Davis",
    sentDate: "Jun 1, 2025",
    sentTime: "11:30 AM",
    status: "Rejected",
    icon: <Car size={24} className="text-white" />,
    iconBg: "bg-green-500",
  },
  {
    id: "REQ006",
    header: "Staff Account Request",
    type: "Account",
    description: "Create staff account for new employee",
    senderId: "PO002",
    senderName: "Airport Authority",
    sentDate: "Jun 1, 2025",
    sentTime: "08:45 AM",
    status: "Pending",
    icon: <User size={24} className="text-white" />,
    iconBg: "bg-blue-500",
  },
  {
    id: "REQ007",
    header: "Incident Report",
    type: "Incident",
    description: "Report of damaged vehicle in section B",
    senderId: "PO004",
    senderName: "University Campus",
    sentDate: "May 31, 2025",
    sentTime: "17:20 PM",
    status: "Under Review",
    icon: <AlertCircle size={24} className="text-white" />,
    iconBg: "bg-red-500",
  },
  {
    id: "REQ008",
    header: "Fee Structure Change",
    type: "Finance",
    description: "Request to update hourly rates",
    senderId: "PO003",
    senderName: "CityParking Inc.",
    sentDate: "May 31, 2025",
    sentTime: "13:15 PM",
    status: "Approved",
    icon: <FileText size={24} className="text-white" />,
    iconBg: "bg-cyan-500",
  },
  {
    id: "REQ009",
    header: "Access Permission",
    type: "Security",
    description: "Request for extended access hours",
    senderId: "PO005",
    senderName: "Metro Transportation",
    sentDate: "May 30, 2025",
    sentTime: "10:00 AM",
    status: "Rejected",
    icon: <Shield size={24} className="text-white" />,
    iconBg: "bg-purple-500",
  },
  {
    id: "REQ010",
    header: "Equipment Installation",
    type: "Facility",
    description: "Request to install new barrier system",
    senderId: "PO001",
    senderName: "Downtown Mall",
    sentDate: "May 30, 2025",
    sentTime: "09:05 AM",
    status: "Pending",
    icon: <Building size={24} className="text-white" />,
    iconBg: "bg-amber-500",
  },
];

// Request type options for filter
const requestTypeOptions = [
  { label: "All Types", value: "All" },
  { label: "Personal", value: "Personal" },
  { label: "Vehicle", value: "Vehicle" },
  { label: "Account", value: "Account" },
  { label: "Facility", value: "Facility" },
  { label: "Incident", value: "Incident" },
  { label: "Finance", value: "Finance" },
  { label: "Security", value: "Security" },
];

// Status options for filter
const statusOptions = [
  { label: "All Status", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Under Review", value: "Under Review" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

export default function AdminRequestList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng yêu cầu hiển thị trên mỗi trang

  // Stats
  const totalRequests = requestsList.length;
  const pendingRequests = requestsList.filter(
    (request) => request.status === "Pending"
  ).length;
  const approvedToday = requestsList.filter(
    (request) =>
      request.status === "Approved" && request.sentDate.includes("Jun 3")
  ).length;
  const rejectedToday = requestsList.filter(
    (request) =>
      request.status === "Rejected" && request.sentDate.includes("Jun 3")
  ).length;

  // Filter requests based on search term, type and status
  const filteredRequests = requestsList.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.senderName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      requestTypeFilter === "All" || request.type === requestTypeFilter;

    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentItems = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredRequests.length);

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success-100 text-success";
      case "Rejected":
        return "bg-danger-100 text-danger";
      case "Pending":
        return "bg-warning-100 text-warning";
      case "Under Review":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-default-100 text-default-600";
    }
  };

  // Get action buttons based on request status
  const getActionButtons = (status) => {
    switch (status) {
      case "Pending":
        return (
          <>
            <Button size="sm" color="primary" variant="flat">
              Details
            </Button>
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
      case "Under Review":
        return (
          <>
            <Button size="sm" color="primary" variant="flat">
              Details
            </Button>
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
      case "Approved":
        return (
          <>
            <Button size="sm" color="primary" variant="flat">
              Details
            </Button>
            <Button size="sm" color="success" variant="flat" disabled>
              Completed
            </Button>
          </>
        );
      case "Rejected":
        return (
          <>
            <Button size="sm" color="primary" variant="flat">
              Details
            </Button>
            <Button size="sm" color="danger" variant="flat" disabled>
              Rejected
            </Button>
          </>
        );
      default:
        return (
          <Button size="sm" color="primary" variant="flat">
            Details
          </Button>
        );
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header Section */}
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <FileText size={32} className="mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-primary">
            Request Management
          </h1>
        </div>
        <p className="text-default-500">
          Manage user requests, vehicle registrations, and information updates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{totalRequests}</div>
          <div className="text-sm">Total Requests</div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{pendingRequests}</div>
          <div className="text-sm">Pending Requests</div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{approvedToday}</div>
          <div className="text-sm">Approved Today</div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-4xl font-bold">{rejectedToday}</div>
          <div className="text-sm">Rejected Today</div>
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
            <label className="block mb-2 text-sm">Search Requests</label>
            <Input
              type="text"
              placeholder="Search by request ID, header, or sender ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Request Type</label>
            <select
              className="w-full p-2 border rounded-md"
              value={requestTypeFilter}
              onChange={(e) => setRequestTypeFilter(e.target.value)}
            >
              {requestTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
        </div>

        <div className="mt-4">
          <Button color="primary" startContent={<Search />}>
            Search
          </Button>
        </div>
      </Card>

      {/* Request List Table */}
      <Card className="border border-default-200">
        <div className="p-4 border-b border-default-200">
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h2 className="text-lg font-semibold">Request List</h2>
          </div>
        </div>

        <Table aria-label="Request List">
          <TableHeader>
            <TableColumn className="bg-primary text-white font-bold">
              Request ID
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Request Header
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Sent Date
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Sender ID
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Status
            </TableColumn>
            <TableColumn className="bg-primary text-white font-bold">
              Actions
            </TableColumn>
          </TableHeader>
          <TableBody>
            {currentItems.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`${request.iconBg} p-2 rounded mr-2`}>
                      {request.icon}
                    </div>
                    <div>
                      <div>{request.header}</div>
                      <div className="text-xs text-default-500">
                        {request.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>{request.sentDate}</div>
                  <div className="text-xs text-default-500">
                    {request.sentTime}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{request.senderId}</div>
                  <div className="text-xs text-default-500">
                    {request.senderName}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {getActionButtons(request.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between p-4 items-center border-t border-default-200">
          <div className="text-sm text-default-500">
            Showing {startItem} to {endItem} of {filteredRequests.length}{" "}
            entries
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
    </div>
  );
}
