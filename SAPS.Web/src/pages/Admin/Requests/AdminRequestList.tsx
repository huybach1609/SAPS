import { Button, Input, Pagination, Spinner } from "@heroui/react";
import {
  Search,
  FileText,
  User,
  Car,
  Shield,
  Building,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestService, Request } from "@/services/admin/requestService";

// Component to render the appropriate icon based on type
const getRequestIcon = (iconType: string) => {
  switch (iconType) {
    case "user":
      return <User size={20} className="text-blue-800" strokeWidth={2.5} />;
    case "car":
      return <Car size={20} className="text-green-800" strokeWidth={2.5} />;
    case "shield":
      return <Shield size={20} className="text-purple-800" strokeWidth={2.5} />;
    case "building":
      return (
        <Building size={20} className="text-amber-800" strokeWidth={2.5} />
      );
    case "alert-circle":
      return (
        <AlertCircle size={20} className="text-red-800" strokeWidth={2.5} />
      );
    case "file-text":
      return <FileText size={20} className="text-cyan-800" strokeWidth={2.5} />;
    default:
      return <FileText size={20} className="text-gray-800" strokeWidth={2.5} />;
  }
};

// Request type options for filter
const requestTypeOptions = [
  { label: "All Types", value: "All" },
  { label: "Personal Info Update", value: "Personal" },
  { label: "Vehicle Registration", value: "Vehicle" },
  { label: "Account Verification", value: "Account" },
  { label: "Parking Lot Registration", value: "Facility" },
  { label: "Staff Account Request", value: "Staff" },
];

// Status options for filter
const statusOptions = [
  { label: "All Status", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

export default function AdminRequestList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of requests per page

  // We'll store the actual filter values used for filtering separately
  // Initialize with the same values as the form controls
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRequestType, setAppliedRequestType] = useState("All");
  const [appliedStatus, setAppliedStatus] = useState("All");

  // State for requests data
  const [requestsList, setRequestsList] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await requestService.getAllRequests();
        if (response.success) {
          setRequestsList(response.data);
        } else {
          setError("Failed to load requests data");
        }
      } catch (err) {
        setError("An error occurred while fetching requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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

  // Display loading state if data is being fetched
  const showLoadingState = () => (
    <div className="w-full flex justify-center items-center py-8">
      <Spinner size="lg" color="primary" />
      <span className="ml-2 text-blue-600">Loading request data...</span>
    </div>
  );

  // Filter requests based on the applied filters, not the current input values
  const filteredRequests = requestsList.filter((request) => {
    const matchesSearch =
      appliedSearch === "" ||
      request.id.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      request.header.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      request.senderName.toLowerCase().includes(appliedSearch.toLowerCase());

    const matchesType =
      appliedRequestType === "All" || request.type === appliedRequestType;

    const matchesStatus =
      appliedStatus === "All" || request.status === appliedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentItems = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredRequests.length);

  // We're using inline styles for status badges now

  // Get action buttons - simplified to just show View button with eye icon
  const getActionButtons = (requestId: string) => {
    return (
      <button
        className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full flex items-center"
        onClick={() => navigate(`/admin/requests/details/${requestId}`)}
      >
        <Eye className="w-3 h-3 mr-1" />
        View
      </button>
    );
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header Section */}
      <div className="w-full">
        <div className="flex items-center mb-1 w-full">
          <FileText className="w-6 h-6 mr-2 text-indigo-900" />
          <h1 className="text-2xl font-bold text-indigo-900">
            Request Management
          </h1>
        </div>
        <p className="text-gray-500 mb-4">
          Manage user requests, vehicle registrations, and information updates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 w-full">
        <div className="bg-[#00b4d8] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalRequests}</div>
            <div className="text-sm">Total Requests</div>
          </div>
        </div>
        <div className="bg-[#0096c7] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{pendingRequests}</div>
            <div className="text-sm">Pending Requests</div>
          </div>
        </div>
        <div className="bg-[#48cae4] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{approvedToday}</div>
            <div className="text-sm">Approved Today</div>
          </div>
        </div>
        <div className="bg-[#90e0ef] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{rejectedToday}</div>
            <div className="text-sm">Rejected Today</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search input */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by ID, header or sender"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                startContent={<Search size={16} className="text-gray-500" />}
              />
            </div>
          </div>

          {/* Request Type filter */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Type
            </label>
            <div className="relative">
              <select
                className="w-full rounded-md border py-2 pl-4 pr-10 bg-white appearance-none focus:outline-none"
                value={requestTypeFilter}
                onChange={(e) => setRequestTypeFilter(e.target.value)}
              >
                {requestTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Status filter */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <select
                className="w-full rounded-md border py-2 pl-4 pr-10 bg-white appearance-none focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Search button */}
          <div className="md:col-span-1">
            <Button
              color="primary"
              className="w-full bg-blue-800 rounded-md text-white"
              onPress={() => {
                // Apply the filter values when the search button is clicked
                setAppliedSearch(searchTerm);
                setAppliedRequestType(requestTypeFilter);
                setAppliedStatus(statusFilter);
                setCurrentPage(1); // Reset to first page on new search
              }}
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
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Request List Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-indigo-700" />
            <h2 className="text-lg font-semibold text-indigo-900">
              Request List
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="w-full flex justify-center items-center py-8">
            <Spinner size="lg" color="primary" />
            <span className="ml-2 text-blue-600">Loading request data...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <Button
              color="primary"
              className="mt-4"
              onPress={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-blue-900 text-white text-left">
                  <th className="px-4 py-3 font-semibold">Request ID</th>
                  <th className="px-4 py-3 font-semibold">Request Details</th>
                  <th className="px-4 py-3 font-semibold">Sent Date</th>
                  <th className="px-4 py-3 font-semibold">Sender Info</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-blue-700 font-medium">
                      {request.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div
                          className={`${request.iconBg} p-2 rounded-full mr-2 flex items-center justify-center w-10 h-10`}
                        >
                          {getRequestIcon(request.iconType)}
                        </div>
                        <div>
                          <div className="font-medium">{request.header}</div>
                          <div className="text-xs text-gray-500">
                            {request.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{request.sentDate}</div>
                      <div className="text-xs text-gray-500">
                        {request.sentTime}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{request.senderId}</div>
                      <div className="text-xs text-gray-500">
                        {request.senderName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                          request.status === "Approved"
                            ? "bg-green-200 text-green-800"
                            : request.status === "Rejected"
                              ? "bg-red-200 text-red-800"
                              : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getActionButtons(request.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Information message */}
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 mx-4 rounded-md">
              <p>
                <span className="font-semibold">Note:</span> All requests must
                be processed within 48 hours. Pending requests older than 48
                hours will be escalated.
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm p-4 border-t border-gray-200">
          <div className="mb-2 md:mb-0 text-gray-500">
            Showing {startItem} to {endItem} of {filteredRequests.length}{" "}
            entries
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
      </div>
    </div>
  );
}
