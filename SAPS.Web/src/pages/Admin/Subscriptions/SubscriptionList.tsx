import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Spinner,
  Pagination,
  useDisclosure,
} from "@heroui/react";
import { Search, Plus, Package, Edit, DollarSign, Clock } from "lucide-react";
import { Subscription } from "@/types/subscription";
import { subscriptionService } from "@/services/admin/subscription/subscriptionService";
import AddEditSubscriptionModal from "./AddEditSubscriptionModal";

const statusOptions = [
  { label: "All Status", value: "All" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function SubscriptionList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Applied filters for actual filtering
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("All");

  // State for subscriptions data
  const [subscriptionsList, setSubscriptionsList] = useState<Subscription[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const {
    isOpen: isAddEditModalOpen,
    onOpen: onAddEditModalOpen,
    onClose: onAddEditModalClose,
  } = useDisclosure();
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  // Fetch subscriptions data
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching subscriptions from API...");
      const response = await subscriptionService.getAllSubscriptions();

      if (response.success && response.data) {
        console.log("✅ Successfully fetched subscriptions:", response.data);
        setSubscriptionsList(response.data);
      } else {
        console.error("❌ Failed to fetch subscriptions:", response.error);
        setError(response.error || "Failed to load subscriptions data");
      }
    } catch (err) {
      console.error("🔥 Exception while fetching subscriptions:", err);
      setError("An error occurred while fetching subscriptions");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setAppliedStatus(statusFilter);
    setCurrentPage(1);
  };

  // Handle reset filters
  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setAppliedSearch("");
    setAppliedStatus("All");
    setCurrentPage(1);
  };

  // Handle add subscription
  const handleAddSubscription = () => {
    setEditingSubscription(null);
    onAddEditModalOpen();
  };

  // Handle edit subscription
  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    onAddEditModalOpen();
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchSubscriptions();
    setSuccessMessage(
      editingSubscription
        ? "Subscription updated successfully"
        : "Subscription created successfully"
    );

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Stats calculations
  const totalSubscriptions = subscriptionsList.length;
  const activeSubscriptions = subscriptionsList.filter(
    (sub) => sub.status === "active"
  ).length;
  const inactiveSubscriptions = subscriptionsList.filter(
    (sub) => sub.status === "inactive"
  ).length;

  // Filter subscriptions
  const filteredSubscriptions = subscriptionsList.filter((subscription) => {
    const matchesSearch =
      appliedSearch === "" ||
      subscription.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      (subscription.description &&
        subscription.description
          .toLowerCase()
          .includes(appliedSearch.toLowerCase()));

    const matchesStatus =
      appliedStatus === "All" || subscription.status === appliedStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const currentItems = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredSubscriptions.length
  );

  // Format duration
  const formatDuration = (durationMs: number): string => {
    // Convert milliseconds to months
    const months = Math.round(durationMs / (30 * 24 * 60 * 60 * 1000));
    return `${months} Month(s)`;
  };

  // Loading state
  if (loading && subscriptionsList.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
        <span className="ml-2">Loading subscriptions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="w-full">
        <div className="flex items-center mb-1 w-full">
          <Package className="w-6 h-6 mr-2 text-indigo-900" />
          <h1 className="text-2xl font-bold text-indigo-900">
            Subscription Management
          </h1>
        </div>
        <p className="text-gray-500 mb-4">
          Manage subscription plans and pricing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 w-full">
        <div className="bg-[#00b4d8] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalSubscriptions}</div>
            <div className="text-sm">Total Plans</div>
          </div>
        </div>
        <div className="bg-[#0096c7] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{activeSubscriptions}</div>
            <div className="text-sm">Active Plans</div>
          </div>
        </div>
        <div className="bg-[#48cae4] rounded-lg p-4 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">
              {inactiveSubscriptions}
            </div>
            <div className="text-sm">Inactive Plans</div>
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
                placeholder="Search by name or description"
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

          {/* Empty column for spacing */}
          <div className="md:col-span-1">
            <Button
              variant="flat"
              onPress={handleReset}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Reset Filters
            </Button>
          </div>

          {/* Search button */}
          <div className="md:col-span-1">
            <Button
              color="primary"
              className="w-full bg-blue-800 rounded-md text-white"
              onPress={handleSearch}
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

      {/* Subscription List Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-indigo-700" />
            <h2 className="text-lg font-semibold text-indigo-900">
              Subscription Plans
            </h2>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              color="primary"
              onPress={handleAddSubscription}
              startContent={<Plus size={16} />}
              className="bg-blue-800 text-white hover:bg-blue-900"
              size="sm"
            >
              Add Subscription
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="w-full flex justify-center items-center py-8">
            <Spinner size="lg" color="primary" />
            <span className="ml-2 text-blue-600">Loading subscriptions...</span>
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
                  <th className="px-4 py-3 font-semibold">
                    Subscription Details
                  </th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Last Updated By</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No subscriptions found
                        </h3>
                        <p className="text-gray-500">
                          {filteredSubscriptions.length === 0 &&
                          subscriptionsList.length > 0
                            ? "Try adjusting your filters"
                            : "Get started by creating your first subscription plan"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((subscription, index) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-blue-700 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-full mr-2 flex items-center justify-center w-10 h-10">
                            <Package size={16} className="text-indigo-700" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {subscription.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subscription.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          {formatDuration(subscription.duration)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center font-medium text-green-600">
                          <DollarSign size={16} className="mr-1" />
                          {subscription.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                            subscription.status === "active"
                              ? "bg-green-200 text-green-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {subscription.status.charAt(0).toUpperCase() +
                            subscription.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {subscription.lastUpdatedBy || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full flex items-center"
                          onClick={() => handleEditSubscription(subscription)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Information message */}
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 mx-4 rounded-md">
              <p>
                <span className="font-semibold">Note:</span> Create and manage
                subscription plans for parking lot owners. Only active plans are
                available for purchase.
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm p-4 border-t border-gray-200">
          <div className="mb-2 md:mb-0 text-gray-500">
            Showing {startItem} to {endItem} of {filteredSubscriptions.length}{" "}
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

      {/* Add/Edit Modal */}
      <AddEditSubscriptionModal
        isOpen={isAddEditModalOpen}
        onClose={onAddEditModalClose}
        onSuccess={handleModalSuccess}
        subscription={editingSubscription}
      />
    </div>
  );
}
