import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Pagination, Input, Textarea } from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Save,
  FileText,
  Edit,
  Plus,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import {
  ParkingLot,
  ParkingLotOwnerDetails as ParkingLotOwnerDetailsType,
  parkingLotOwnerService,
  UpdateApiKeysRequest,
  CreateParkingLotRequest,
  Subscription,
} from "../../../services/parkingLotOwner/parkingLotOwnerService";
const ParkingLotOwnerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<ParkingLotOwnerDetailsType | null>(null);

  // Parking lots pagination
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParkingLots, setTotalParkingLots] = useState(0);
  const itemsPerPage = 5;

  // API Keys editing state
  const [isEditingApiKeys, setIsEditingApiKeys] = useState(false);
  const [apiKeysForm, setApiKeysForm] = useState({
    clientKey: "",
    apiKey: "",
    checkSumKey: "",
  });
  const [isSavingApiKeys, setIsSavingApiKeys] = useState(false);

  // Add Parking Lot Modal state
  const [isAddParkingLotModalOpen, setIsAddParkingLotModalOpen] =
    useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [newParkingLotForm, setNewParkingLotForm] = useState({
    name: "",
    description: "",
    address: "",
    totalParkingSlot: 1,
    subscriptionId: "",
  });
  const [isSubmittingParkingLot, setIsSubmittingParkingLot] = useState(false);
  const [parkingLotSubmitError, setParkingLotSubmitError] = useState<
    string | null
  >(null);

  // Helper function to convert milliseconds to days for display
  const millisecondsTodays = (milliseconds: number): number => {
    return Math.round(milliseconds / (1000 * 60 * 60 * 24));
  };

  // Format duration (days to user-friendly format with hours)
  const formatDuration = (days: number): string => {
    if (days <= 0) return "0 Days";

    // Convert days to total hours first for more precise calculation
    const totalHours = days * 24;

    const years = Math.floor(totalHours / (365 * 24));
    const remainingAfterYears = totalHours % (365 * 24);

    const months = Math.floor(remainingAfterYears / (30 * 24));
    const remainingAfterMonths = remainingAfterYears % (30 * 24);

    const weeks = Math.floor(remainingAfterMonths / (7 * 24));
    const remainingAfterWeeks = remainingAfterMonths % (7 * 24);

    const daysLeft = Math.floor(remainingAfterWeeks / 24);
    const hoursLeft = Math.floor(remainingAfterWeeks % 24);

    const parts = [];

    if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
    if (weeks > 0) parts.push(`${weeks} Week${weeks > 1 ? "s" : ""}`);
    if (daysLeft > 0) parts.push(`${daysLeft} Day${daysLeft > 1 ? "s" : ""}`);
    if (hoursLeft > 0)
      parts.push(`${hoursLeft} Hour${hoursLeft > 1 ? "s" : ""}`);

    // If no parts, it means less than an hour
    if (parts.length === 0) return "Less than 1 Hour";

    // Join parts with commas and "and" for the last item
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts.join(" and ");

    const lastPart = parts.pop();
    return parts.join(", ") + " and " + lastPart;
  };

  // Format price (VND) - display exact price from database
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price); // Use exact price from database
  };

  // Format date string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Format date time string
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy - HH:mm a");
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch owner details
        const ownerData =
          await parkingLotOwnerService.getParkingLotOwnerDetails(id);
        setOwner(ownerData);

        // Fetch parking lots
        await fetchParkingLots();

        // Fetch subscriptions for add parking lot modal
        await fetchSubscriptions();
      } catch (error) {
        console.error("Error fetching owner details:", error);
        // Reset to safe defaults on error
        setOwner(null);
        setParkingLots([]);
        setTotalParkingLots(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Function to fetch parking lots with pagination
  const fetchParkingLots = async () => {
    if (!id) return;

    try {
      const response = await parkingLotOwnerService.getOwnerParkingLots({
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        parkingLotOwnerId: id,
        order: 1, // Ascending order
      });

      setParkingLots(response?.items || []);
      setTotalParkingLots(response?.["total-count"] || 0);
      setTotalPages(response?.["total-pages"] || 1);
    } catch (error) {
      console.error("Error fetching parking lots:", error);
      // Reset to safe defaults on error
      setParkingLots([]);
      setTotalParkingLots(0);
      setTotalPages(1);
    }
  };

  // Function to fetch active subscriptions
  const fetchSubscriptions = async () => {
    try {
      const subs = await parkingLotOwnerService.getActiveSubscriptions();
      setSubscriptions(subs);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  // Fetch parking lots when page changes
  useEffect(() => {
    fetchParkingLots();
  }, [currentPage]);

  // Initialize API keys form when owner data is loaded
  useEffect(() => {
    if (owner && !isEditingApiKeys) {
      setApiKeysForm({
        clientKey: owner.clientKey || "",
        apiKey: owner.apiKey || "",
        checkSumKey: owner.checkSumKey || "",
      });
    }
  }, [owner, isEditingApiKeys]);

  // Handle API keys editing
  const handleEditApiKeys = () => {
    setIsEditingApiKeys(true);
  };

  const handleCancelEditApiKeys = () => {
    setIsEditingApiKeys(false);
    if (owner) {
      setApiKeysForm({
        clientKey: owner.clientKey || "",
        apiKey: owner.apiKey || "",
        checkSumKey: owner.checkSumKey || "",
      });
    }
  };

  const handleSaveApiKeys = async () => {
    if (!owner || !id) return;

    setIsSavingApiKeys(true);
    try {
      const updateData: UpdateApiKeysRequest = {
        id: owner.id,
        parkingLotOwnerId: owner.parkingLotOwnerId,
        clientKey: apiKeysForm.clientKey,
        apiKey: apiKeysForm.apiKey,
        checkSumKey: apiKeysForm.checkSumKey,
      };

      const updatedOwner =
        await parkingLotOwnerService.updateApiKeys(updateData);

      // Update owner state with new API keys - merge with existing data
      setOwner((prevOwner) => ({
        ...prevOwner!,
        ...updatedOwner,
        clientKey: apiKeysForm.clientKey,
        apiKey: apiKeysForm.apiKey,
        checkSumKey: apiKeysForm.checkSumKey,
      }));

      setIsEditingApiKeys(false);

      // Show success message (you can replace this with a proper toast notification)
      alert("API keys updated successfully!");
    } catch (error) {
      console.error("Error updating API keys:", error);
      alert("Failed to update API keys. Please try again.");
    } finally {
      setIsSavingApiKeys(false);
    }
  };

  const handleApiKeyInputChange = (
    field: keyof typeof apiKeysForm,
    value: string
  ) => {
    setApiKeysForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get current API key values for display
  const getCurrentApiKeyValue = (key: keyof typeof apiKeysForm): string => {
    return owner?.[key] || "Not set";
  };

  // Add Parking Lot Modal handlers
  const handleOpenAddParkingLotModal = () => {
    setNewParkingLotForm({
      name: "",
      description: "",
      address: "",
      totalParkingSlot: 1,
      subscriptionId: "",
    });
    setParkingLotSubmitError(null);
    setIsAddParkingLotModalOpen(true);
  };

  const handleCloseAddParkingLotModal = () => {
    setIsAddParkingLotModalOpen(false);
    setNewParkingLotForm({
      name: "",
      description: "",
      address: "",
      totalParkingSlot: 1,
      subscriptionId: "",
    });
    setParkingLotSubmitError(null);
  };

  const validateParkingLotForm = (): boolean => {
    if (!newParkingLotForm.name.trim()) {
      setParkingLotSubmitError("Parking lot name is required");
      return false;
    }
    if (!newParkingLotForm.address.trim()) {
      setParkingLotSubmitError("Address is required");
      return false;
    }
    if (!newParkingLotForm.subscriptionId) {
      setParkingLotSubmitError("Please select a subscription plan");
      return false;
    }
    if (newParkingLotForm.totalParkingSlot < 1) {
      setParkingLotSubmitError("Total parking slots must be at least 1");
      return false;
    }
    return true;
  };

  const handleSubmitNewParkingLot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateParkingLotForm() || !owner) {
      return;
    }

    setIsSubmittingParkingLot(true);
    setParkingLotSubmitError(null);

    try {
      const parkingLotData: CreateParkingLotRequest = {
        parkingLotOwnerId: owner.parkingLotOwnerId,
        subscriptionId: newParkingLotForm.subscriptionId,
        name: newParkingLotForm.name,
        description: newParkingLotForm.description,
        address: newParkingLotForm.address,
        totalParkingSlot: newParkingLotForm.totalParkingSlot,
      };

      await parkingLotOwnerService.createParkingLot(parkingLotData);

      // Refresh parking lots list
      await fetchParkingLots();

      // Close modal and show success
      handleCloseAddParkingLotModal();
      alert("Parking lot created successfully!");
    } catch (error: any) {
      console.error("Error creating parking lot:", error);

      let errorMessage = "Failed to create parking lot. Please try again.";

      // Extract specific error message from API response
      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors && typeof errorData.errors === "object") {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages)
                ? messages
                : [messages];
              return `${field}: ${messageArray.join(", ")}`;
            })
            .join("\n");
          errorMessage = `Validation errors:\n${fieldErrors}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }

      setParkingLotSubmitError(errorMessage);
    } finally {
      setIsSubmittingParkingLot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-xl font-bold text-gray-700 mb-2">
          Owner not found
        </div>
        <Button
          color="primary"
          onPress={() => navigate("/admin/parking-owners")}
          className="mt-4"
        >
          Back to Owners List
        </Button>
      </div>
    );
  }

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
                <h3 className="text-xl font-bold">{owner.fullName}</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-8 mt-1">
                  <div>
                    <div className="text-sm text-gray-500">Owner ID</div>
                    <div className="font-medium">{owner.parkingLotOwnerId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-sm">
                      {owner.status}
                    </div>
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
              value={owner.email}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Phone Number</div>
            <input
              type="text"
              value={owner.phoneNumber}
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
              value={formatDate(owner.createdAt)}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Last Activity</div>
            <input
              type="text"
              value={formatDateTime(owner.updatedAt || owner.createdAt)}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
        </div>
      </Card>

      {/* API Configuration Keys */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center text-lg font-semibold">
            <CreditCard size={20} className="mr-2 text-primary" />
            API Configuration Keys
          </h2>
          <div className="flex gap-2">
            {!isEditingApiKeys ? (
              <Button
                variant="light"
                size="sm"
                startContent={<Edit size={16} />}
                onPress={handleEditApiKeys}
                className="text-primary"
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="light"
                  size="sm"
                  onPress={handleCancelEditApiKeys}
                  isDisabled={isSavingApiKeys}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  startContent={<Save size={16} />}
                  onPress={handleSaveApiKeys}
                  isLoading={isSavingApiKeys}
                  className="text-white"
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Client Key</div>
            {isEditingApiKeys ? (
              <input
                type="text"
                value={apiKeysForm.clientKey}
                onChange={(e) =>
                  handleApiKeyInputChange("clientKey", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Enter client key"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-md border">
                <code className="text-sm font-mono break-all">
                  {getCurrentApiKeyValue("clientKey")}
                </code>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">API Key</div>
            {isEditingApiKeys ? (
              <input
                type="text"
                value={apiKeysForm.apiKey}
                onChange={(e) =>
                  handleApiKeyInputChange("apiKey", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Enter API key"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-md border">
                <code className="text-sm font-mono break-all">
                  {getCurrentApiKeyValue("apiKey")}
                </code>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Checksum Key</div>
            {isEditingApiKeys ? (
              <input
                type="text"
                value={apiKeysForm.checkSumKey}
                onChange={(e) =>
                  handleApiKeyInputChange("checkSumKey", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Enter checksum key"
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded-md border">
                <code className="text-sm font-mono break-all">
                  {getCurrentApiKeyValue("checkSumKey")}
                </code>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-md">
          <p>
            <span className="font-semibold">Security Note:</span> These API keys
            are used for payment processing integration. Keep them secure and
            only share with authorized personnel.
          </p>
        </div>
      </Card>

      {/* Parking Lot List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center text-lg font-semibold">
            <Building2 size={20} className="mr-2 text-primary" />
            Parking Lot List
          </h2>
          <Button
            color="primary"
            size="sm"
            startContent={<Plus size={16} />}
            onPress={handleOpenAddParkingLotModal}
            className="bg-blue-800 text-white hover:bg-blue-900"
          >
            Add Parking Lot
          </Button>
        </div>
        <div className="overflow-x-auto w-full max-w-full">
          {parkingLots && parkingLots.length > 0 ? (
            <>
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
                  {(parkingLots || []).map((parkingLot, index) => (
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
                      <td className="px-4 py-3 text-sm">
                        {parkingLot.address}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {parkingLot.totalParkingSlot}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                            parkingLot.isExpired
                              ? "bg-red-200 text-red-800"
                              : "bg-green-200 text-green-800"
                          }`}
                        >
                          {parkingLot.isExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {parkingLot.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm w-full">
                <div className="mb-2 md:mb-0">
                  {parkingLots && parkingLots.length > 0
                    ? `Showing ${parkingLots.length} of ${totalParkingLots} parking lots`
                    : "No parking lots to show"}
                </div>

                <div className="flex justify-end w-full md:w-auto items-center gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    className="rounded-full flex items-center"
                    isDisabled={currentPage <= 1}
                    onPress={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
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
                    isDisabled={currentPage >= totalPages}
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

              {/* Note */}
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                <p>
                  <span className="font-semibold">Note:</span> The parking lot
                  owner can manage multiple parking facilities. All facilities
                  share the same payment account.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No parking lots found for this owner.
            </div>
          )}
        </div>
      </Card>

      {/* Add Parking Lot Modal */}
      {isAddParkingLotModalOpen && (
        <div
          className="fixed mt-0 inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto"
          style={{ marginTop: "0px" }}
        >
          <div className="w-full max-w-2xl mx-4 my-8">
            <Card className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Building2 size={24} className="mr-2 text-blue-600" />
                  <h2 className="text-xl font-bold">Add New Parking Lot</h2>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={handleCloseAddParkingLotModal}
                  className="text-gray-500"
                >
                  <X size={24} />
                </Button>
              </div>

              <form onSubmit={handleSubmitNewParkingLot} className="space-y-6">
                {/* Error Message Display */}
                {parkingLotSubmitError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle
                        size={16}
                        className="text-red-600 mr-2 mt-0.5"
                      />
                      <div>
                        <h4 className="font-semibold text-red-800">Error:</h4>
                        <pre className="text-sm text-red-700 mt-1 whitespace-pre-wrap">
                          {parkingLotSubmitError}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parking Lot Information */}
                <div className="space-y-4">
                  <div className="flex items-center text-blue-600 font-semibold border-b pb-2">
                    <Building2 size={20} className="mr-2" />
                    <h3 className="text-lg">Parking Lot Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Parking Lot Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={newParkingLotForm.name}
                        onChange={(e) =>
                          setNewParkingLotForm({
                            ...newParkingLotForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Downtown Parking"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Total Parking Slots{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={newParkingLotForm.totalParkingSlot.toString()}
                        onChange={(e) =>
                          setNewParkingLotForm({
                            ...newParkingLotForm,
                            totalParkingSlot: parseInt(e.target.value) || 1,
                          })
                        }
                        type="number"
                        min="1"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newParkingLotForm.address}
                      onChange={(e) =>
                        setNewParkingLotForm({
                          ...newParkingLotForm,
                          address: e.target.value,
                        })
                      }
                      placeholder="123 Main St, City, State, ZIP"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Subscription Plan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newParkingLotForm.subscriptionId}
                      onChange={(e) =>
                        setNewParkingLotForm({
                          ...newParkingLotForm,
                          subscriptionId: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a subscription plan</option>
                      {subscriptions.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} - {formatPrice(sub.price)} (
                          {formatDuration(millisecondsTodays(sub.duration))})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Textarea
                      value={newParkingLotForm.description}
                      onChange={(e) =>
                        setNewParkingLotForm({
                          ...newParkingLotForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the parking facility..."
                      className="w-full"
                      minRows={2}
                    />
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle
                      size={16}
                      className="text-blue-600 mr-2 mt-0.5"
                    />
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        Important Notice:
                      </h4>
                      <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                        <li>
                          The parking lot will be created with the selected
                          subscription plan
                        </li>
                        <li>
                          The subscription will be active based on the plan
                          duration
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="flat"
                    onPress={handleCloseAddParkingLotModal}
                    className="rounded-full"
                    startContent={<X size={16} />}
                    isDisabled={isSubmittingParkingLot}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    variant="flat"
                    className="rounded-full"
                    isLoading={isSubmittingParkingLot}
                    startContent={<Check size={16} />}
                  >
                    Create Parking Lot
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingLotOwnerDetails;
