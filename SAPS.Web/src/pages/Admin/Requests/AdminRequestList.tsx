import { Button, Input, Pagination, Spinner } from "@heroui/react";
import { Search, FileText, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  requestService,
  ApiRequest,
  PaginatedRequestResponse,
} from "@/services/admin/requestService";

// Status options for filter (updated for new API)
const statusOptions = [
  { label: "All Status", value: "All" },
  { label: "Open", value: "Open" },
  { label: "In Progress", value: "InProgress" },
  { label: "Resolved", value: "Resolved" },
  { label: "Closed", value: "Closed" },
];

export default function AdminRequestList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of requests per page

  // We'll store the actual filter values used for filtering separately
  // Initialize with the same values as the form controls
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("All");

  // State for requests data
  const [requestsList, setRequestsList] = useState<ApiRequest[]>([]);
  const [paginatedData, setPaginatedData] =
    useState<PaginatedRequestResponse | null>(null);
  const [statsData, setStatsData] = useState<ApiRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Fetch requests data for statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await requestService.getAllRequestsStats();
        setStatsData(response.data || []);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  // Fetch paginated requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const searchCriteria = appliedSearch !== "" ? appliedSearch : undefined;
        const status = appliedStatus !== "All" ? appliedStatus : undefined;

        const response = await requestService.getRequestsPage(
          currentPage,
          itemsPerPage,
          undefined, // userId
          searchCriteria,
          status
        );
        setPaginatedData(response.data);
        setRequestsList(response.data.items || []);
      } catch (err) {
        setError("An error occurred while fetching requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentPage, appliedSearch, appliedStatus]);

  // Stats calculations from API data
  const totalRequests = statsData.length;
  const openRequests = statsData.filter(
    (request) => request.status === "Open"
  ).length;
  const inProgressRequests = statsData.filter(
    (request) => request.status === "InProgress"
  ).length;
  const resolvedRequests = statsData.filter(
    (request) => request.status === "Resolved"
  ).length;
  const closedRequests = statsData.filter(
    (request) => request.status === "Closed"
  ).length;

  // Filter requests based on the applied filters (now handled by API)

  // Use API data directly since filtering is done server-side
  const displayRequests = requestsList;

  // Pagination info
  const totalPages = paginatedData?.totalPages || 1;
  const totalCount = paginatedData?.totalCount || 0;
  const startItem = paginatedData
    ? (paginatedData.pageNumber - 1) * paginatedData.pageSize + 1
    : 1;
  const endItem = paginatedData
    ? Math.min(paginatedData.pageNumber * paginatedData.pageSize, totalCount)
    : displayRequests.length;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 w-full">
        <div className="bg-[#00b4d8] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalRequests}</div>
            <div className="text-sm">Total Requests</div>
          </div>
        </div>
        <div className="bg-[#fbbf24] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{openRequests}</div>
            <div className="text-sm">Open</div>
          </div>
        </div>
        <div className="bg-[#3b82f6] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{inProgressRequests}</div>
            <div className="text-sm">In Progress</div>
          </div>
        </div>
        <div className="bg-[#10b981] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{resolvedRequests}</div>
            <div className="text-sm">Resolved</div>
          </div>
        </div>
        <div className="bg-[#6b7280] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{closedRequests}</div>
            <div className="text-sm">Closed</div>
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
                placeholder="Search by header"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                startContent={<Search size={16} className="text-gray-500" />}
              />
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

          {/* Reset button */}
          <div className="md:col-span-1">
            <Button
              color="default"
              variant="bordered"
              className="w-full border-gray-300 text-gray-700 rounded-md"
              onPress={() => {
                // Reset all filter values
                setSearchTerm("");
                setStatusFilter("All");
                setAppliedSearch("");
                setAppliedStatus("All");
                setCurrentPage(1); // Reset to first page
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            >
              Reset
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
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Request Details</th>
                  <th className="px-4 py-3 font-semibold">Sent Date</th>
                  <th className="px-4 py-3 font-semibold">Sender Name</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayRequests.map((request, index) => {
                  const { date, time } = formatDate(request.submittedAt);
                  // Calculate row number based on current page
                  const rowNumber = paginatedData
                    ? (paginatedData.pageNumber - 1) * paginatedData.pageSize +
                      index +
                      1
                    : index + 1;

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{request.header}</div>
                          <div className="text-xs text-gray-500">
                            Request from user
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {request.senderFullName || "Unknown"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                            request.status === "Resolved"
                              ? "bg-green-200 text-green-800"
                              : request.status === "InProgress"
                                ? "bg-blue-200 text-blue-800"
                                : request.status === "Closed"
                                  ? "bg-gray-200 text-gray-800"
                                  : request.status === "Open"
                                    ? "bg-yellow-200 text-yellow-800"
                                    : "bg-red-200 text-red-800"
                          }`}
                        >
                          {request.status === "InProgress"
                            ? "In Progress"
                            : request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getActionButtons(request.id)}
                      </td>
                    </tr>
                  );
                })}
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
            Showing {startItem} to {endItem} of {totalCount} entries
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
