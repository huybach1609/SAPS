import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Divider, Pagination } from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  CheckCircle2,
  Save,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import {
  ParkingLot,
  ParkingLotOwnerDetails as ParkingLotOwnerDetailsType,
  PaymentSource,
  parkingLotOwnerService,
} from "../../../services/parkingLotOwner/parkingLotOwnerService";
const ParkingLotOwnerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<ParkingLotOwnerDetailsType | null>(null);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);

  // Parking lots pagination
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParkingLots, setTotalParkingLots] = useState(0);
  const itemsPerPage = 5;

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

        // Fetch payment sources
        const paymentSourcesData =
          await parkingLotOwnerService.getOwnerPaymentSources(id);
        setPaymentSources(paymentSourcesData || []);

        // Fetch parking lots
        await fetchParkingLots();
      } catch (error) {
        console.error("Error fetching owner details:", error);
        // Reset to safe defaults on error
        setOwner(null);
        setPaymentSources([]);
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
                <h3 className="text-xl font-bold">{owner["full-name"]}</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-8 mt-1">
                  <div>
                    <div className="text-sm text-gray-500">Owner ID</div>
                    <div className="font-medium">{owner.id}</div>
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
              value={owner.phone}
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
              value={formatDate(owner["created-at"])}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Last Activity</div>
            <input
              type="text"
              value={formatDateTime(owner["updated-at"] || owner["created-at"])}
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
          Save Changes
        </Button>
      </Card>

      {/* Current Payment Source */}
      <Card className="p-6">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <CreditCard size={20} className="mr-2 text-primary" />
          Current Payment Source
        </h2>

        {paymentSources.length > 0 ? (
          <>
            {paymentSources.map((source, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-semibold text-center mb-6">
                  {source["bank-name"]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0">
                      <CreditCard size={28} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        Account Number
                      </div>
                      <div className="font-medium text-lg">
                        {source["account-number"]}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Account Name
                    </div>
                    <div className="font-medium text-lg">
                      {source["account-name"]}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Bank</div>
                    <div className="font-medium text-primary">
                      {source["bank-name"]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="font-medium">{source.status}</div>
                  </div>
                </div>

                <Divider className="my-4" />
                <div className="bg-blue-50 p-4 rounded-md flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full ${source.status === "Active" ? "bg-green-500" : "bg-yellow-500"} flex items-center justify-center mr-3 flex-shrink-0`}
                  >
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Payment Account Status:</span>
                    {source.status === "Active"
                      ? " Active and verified for payment processing"
                      : " Pending verification"}
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`px-3 py-1 rounded-full ${source.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} text-xs font-medium`}
                    >
                      {source.status === "Active" ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No payment sources found for this owner.
          </div>
        )}
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
                        {parkingLot["total-parking-slot"]}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-green-200 text-green-800">
                          Active
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
