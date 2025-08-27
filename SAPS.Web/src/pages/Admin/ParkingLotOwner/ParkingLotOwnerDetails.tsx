import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Pagination } from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Save,
  FileText,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import {
  ParkingLot,
  ParkingLotOwnerDetails as ParkingLotOwnerDetailsType,
  parkingLotOwnerService,
  UpdateApiKeysRequest,
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
  }; // Fetch parking lots when page changes
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
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <Building2 size={20} className="mr-2 text-primary" />
          Parking Lot List
        </h2>
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
    </div>
  );
};

export default ParkingLotOwnerDetails;
