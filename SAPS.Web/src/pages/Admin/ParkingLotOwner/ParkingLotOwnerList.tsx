import { Button, Card, Input, Pagination } from "@heroui/react";
import { Building2, UserPlus, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddParkingLotOwner from "./AddParkingLotOwner";
import {
  ParkingLotOwner,
  parkingLotOwnerService,
} from "../../../services/parkingLotOwner/parkingLotOwnerService";
import { format } from "date-fns";

// We'll use the API instead of fallback data
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
  const itemsPerPage = 5; // Matching API pageSize

  // State for API data
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<ParkingLotOwner[]>([]);
  const [totalOwners, setTotalOwners] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Stats
  const [activeOwners, setActiveOwners] = useState(0);
  const [pendingOwners, setPendingOwners] = useState(0);
  const [suspendedOwners, setSuspendedOwners] = useState(0);

  // Function to fetch owners
  const fetchOwners = async () => {
    setLoading(true);
    try {
      const response = await parkingLotOwnerService.getParkingLotOwners({
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        status: statusFilter !== "All" ? statusFilter : undefined,
        order: 1, // Ascending order
        searchCriteria: searchTerm || undefined,
      });

      // Safely handle response data
      setOwners(response?.items || []);
      setTotalOwners(response?.["total-count"] || 0);
      setTotalPages(response?.["total-pages"] || 1);
      setHasNextPage(response?.["has-next-page"] || false);
      setHasPreviousPage(response?.["has-previous-page"] || false);
    } catch (error) {
      console.error("Error fetching parking lot owners:", error);
      // Reset to safe defaults on error
      setOwners([]);
      setTotalOwners(0);
      setTotalPages(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary statistics
  const fetchStats = async () => {
    try {
      // Get active owners count
      const activeResponse = await parkingLotOwnerService.getParkingLotOwners({
        pageNumber: 1,
        pageSize: 1,
        status: "Active",
        order: 1,
      });
      setActiveOwners(activeResponse?.["total-count"] || 0);

      // Get pending owners count
      const pendingResponse = await parkingLotOwnerService.getParkingLotOwners({
        pageNumber: 1,
        pageSize: 1,
        status: "Pending",
        order: 1,
      });
      setPendingOwners(pendingResponse?.["total-count"] || 0);

      // Get suspended owners count
      const suspendedResponse =
        await parkingLotOwnerService.getParkingLotOwners({
          pageNumber: 1,
          pageSize: 1,
          status: "Suspended",
          order: 1,
        });
      setSuspendedOwners(suspendedResponse?.["total-count"] || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Reset to safe defaults on error
      setActiveOwners(0);
      setPendingOwners(0);
      setSuspendedOwners(0);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchOwners();
    fetchStats();
  }, []);

  // Fetch when filters or pagination change
  useEffect(() => {
    fetchOwners();
  }, [currentPage, statusFilter]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOwners();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Format date string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Calculate start and end items for pagination display
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalOwners);

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
            <div className="text-4xl font-bold mb-1">{pendingOwners}</div>
            <div className="text-sm">Pending Approval</div>
          </div>
        </Card>
        <Card className="p-4 bg-[#00B4D8] text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{suspendedOwners}</div>
            <div className="text-sm">Suspended Owners</div>
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
                // Apply filters and reset to first page
                setCurrentPage(1);
                fetchOwners();
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
                fetchOwners();
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
                <th className="px-4 py-3 text-left text-sm font-medium w-[20%]">
                  Owner ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[25%]">
                  Owner Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[20%]">
                  Contact Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[15%]">
                  Join Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium w-[10%]">
                  Status
                </th>
                <th className="px-4 py-n3 text-center text-sm font-medium w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : !owners || owners.length === 0 ? (
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
                (owners || []).map((owner, index) => (
                  <tr key={owner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {startItem + index}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center">
                        <div className="bg-primary p-2 rounded mr-2">
                          <Building2 size={24} className="text-white" />
                        </div>
                        <div>{owner["parking-lot-owner-id"]}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{owner["full-name"]}</td>
                    <td className="px-4 py-3 text-sm">{owner.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(owner["created-at"])}
                    </td>
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
                        {owner.status}
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
            {owners && owners.length > 0
              ? `Showing ${startItem} to ${endItem} of ${totalOwners} entries`
              : "No entries to show"}
          </div>

          <div className="flex justify-end w-full md:w-auto items-center gap-2">
            <Button
              size="sm"
              variant="light"
              color="primary"
              className="rounded-full flex items-center"
              isDisabled={!hasPreviousPage}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              isDisabled={!hasNextPage}
              onPress={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
            fetchOwners();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
