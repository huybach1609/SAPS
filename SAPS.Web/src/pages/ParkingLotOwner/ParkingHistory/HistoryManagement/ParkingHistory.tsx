import React, { useState, useEffect } from "react";
import { Eye, FolderSearch, RefreshCcw } from "lucide-react";
import { useParkingLot } from "../../ParkingLotContext";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  DateRangePicker,
  DateValue,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  RangeValue,
  SelectItem,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { PaginationInfo } from "@/types/Whitelist";
import { useNavigate } from "react-router-dom";
import {
  fetchParkingHistory,
  ParkingSession,
} from "@/services/parkinglot/parkingHistoryService";
import ParkingHistoryStatistics from "./ParkingHistoryStatistics";
import { formatDate, formatTime } from "@/components/utils/stringUtils";
import { ParkingSessionStatus } from "@/types/ParkingSession";
import DefaultLayout from "@/layouts/default";

const ParkingHistory: React.FC = () => {
  const { selectedParkingLot, loading: parkingLotLoading } = useParkingLot();
  const [parkingSessions, setParkingSessions] = useState<ParkingSession[]>([]);
  // loading for parking sessions list
  const [loading, setLoading] = useState(true);

  // session selected for viewing details
  const [selectedSession, setSelectedSession] = useState<ParkingSession | null>(
    null
  );

  // pagination for parking sessions list
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  // pagination for parking sessions list
  const [currentPage, setCurrentPage] = useState(1);

  // search for search & add field
  const [tableSearch, setTableSearch] = useState("");
  // filter by date range (entryDateTime, exitDateTime)
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null
  );
  // filter by status
  const [status, setStatus] = useState<string>(
    ParkingSessionStatus.CURRENTLY_PARKED.toString()
  );

  const navigate = useNavigate();

  const loadParkingSessions = async () => {
    if (!selectedParkingLot?.id) return;

    setLoading(true);
    try {
      // Convert DateValue objects to ISO strings if present
      const dateRangeStart = dateRange?.start
        ? new Date(
          dateRange.start.year,
          dateRange.start.month - 1,
          dateRange.start.day
        ).toISOString()
        : undefined;
      const dateRangeEnd = dateRange?.end
        ? new Date(
          dateRange.end.year,
          dateRange.end.month - 1,
          dateRange.end.day
        ).toISOString()
        : undefined;
      const statusValue = status || undefined;

      if (tableSearch != null && tableSearch.trim() !== "") {
        const response = await fetchParkingHistory(
          selectedParkingLot.id,
          6,
          currentPage,
          tableSearch,
          dateRangeStart,
          dateRangeEnd,
          statusValue
        );
        setParkingSessions(response.data);
        setPagination(response.pagination);
      } else {
        const response = await fetchParkingHistory(
          selectedParkingLot.id,
          6,
          currentPage,
          undefined,
          dateRangeStart,
          dateRangeEnd,
          statusValue
        );
        setParkingSessions(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Failed to load parking sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search parking sessions
  const handleSearch = async (term: string) => {
    try {
      setCurrentPage(1);
      loadParkingSessions();
    } catch (error) {
      console.error("Failed to search parking sessions:", error);
    }
  };

  // View session details
  const handleViewSessionDetails = async (sessionId: string) => {
    if (!selectedParkingLot?.id) return;

    try {
      // Navigate to session details page or open modal
      navigate(`/owner/history/${selectedParkingLot.id}/${sessionId}`);
    } catch (error) {
      console.error("Failed to view session details:", error);
    }
  };

  useEffect(() => {
    loadParkingSessions();
  }, [selectedParkingLot?.id, currentPage, dateRange, status]);

  function handleReset() {
    setTableSearch("");
    setDateRange(null);
    setStatus(ParkingSessionStatus.CURRENTLY_PARKED.toString());
    setCurrentPage(1);
    loadParkingSessions();
  }

  return (
    <DefaultLayout title="Parking History">
      <ParkingHistoryStatistics parkingLotId={selectedParkingLot?.id || ""} />

      {/* Search & Filter */}
      <Card className="bg-background-100/20 mb-6">
        <CardHeader className="flex items-center gap-2">
          <FolderSearch className="w-6 h-6 text-primary" />
          <h2 className=" font-bold">Search & Filter Parking Sessions</h2>
        </CardHeader>
        <CardBody className="">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between w-full">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
              <Input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search by license plate, session ID, or vehicle info..."
                className="w-full sm:w-48 lg:w-64"
                size="sm"
                color="primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(tableSearch);
                  }
                }}
              />
              <DateRangePicker
                aria-label="date range picker"
                value={dateRange}
                onChange={setDateRange}
                size="sm"
                color="primary"
                className="w-full sm:w-48 lg:w-64 text-primary-900"
              />

              <Select
                className="w-full sm:w-48 lg:w-48"
                color="primary"
                size="sm"
                label=""
                placeholder="select status"
                aria-label="select status"
                selectedKeys={status === "" ? new Set() : new Set([status])}
                onSelectionChange={(keys) => {
                  setStatus(keys.currentKey || "");
                  setCurrentPage(1);
                }}
              >
                <SelectItem key="">All</SelectItem>
                <SelectItem
                  key={ParkingSessionStatus.COMPLETED}
                  className="text-green-700"
                >
                  Completed
                </SelectItem>
                <SelectItem
                  key={ParkingSessionStatus.CURRENTLY_PARKED}
                  className="text-primary-700"
                >
                  Currently Parked
                </SelectItem>
                <SelectItem
                  key={ParkingSessionStatus.PAYMENT_PENDING}
                  className="text-yellow-700"
                >
                  Payment Pending
                </SelectItem>
              </Select>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onPress={() => handleSearch(tableSearch)}
                  color="primary"
                  className="text-background"
                >
                  Search
                </Button>

                <Button
                  size="sm"
                  onPress={() => handleReset()}
                  color="primary"
                  className="text-background"
                  isIconOnly
                >
                  <RefreshCcw size={16} />
                </Button>
              </div>
            </div>

            {/* <ButtonGroup isDisabled={selectedSession === null}>
                            <Button color='primary' className='text-background' size='sm' startContent={<Eye size={16} />}
                                onPress={() => handleViewSessionDetails(selectedSession?.id || '')}>View Details</Button>
                        </ButtonGroup> */}
          </div>
        </CardBody>
      </Card>

      {/*  Table */}
      <div className="min-h-[70vh] w-full">
        {parkingLotLoading || loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : parkingSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No parking sessions found.</p>
          </div>
        ) : (
          <ParkingHistoryTable
            parkingSessions={parkingSessions}
            selectedSession={selectedSession}
            setSelectedSession={setSelectedSession}
            handleViewSessionDetails={handleViewSessionDetails}
          />
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-center sm:text-left">
            Showing page {pagination.currentPage} of {pagination.totalPages}(
            {pagination.totalItems} total items)
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onPress={() => {
                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
              }}
              disabled={!pagination.hasPreviousPage || parkingLotLoading}
              className=""
            >
              Previous
            </Button>
            <Pagination
              color="secondary"
              className="text-white"
              page={pagination.currentPage}
              total={pagination.totalPages}
              onChange={setCurrentPage}
              isDisabled={parkingLotLoading}
            />
            <Button
              onPress={() => {
                setCurrentPage((prev) =>
                  prev < pagination.totalPages ? prev + 1 : prev
                );
              }}
              disabled={!pagination.hasNextPage || parkingLotLoading}
              className=""
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

type ParkingHistoryTableProps = {
  parkingSessions: ParkingSession[];
  selectedSession: ParkingSession | null;
  setSelectedSession: React.Dispatch<
    React.SetStateAction<ParkingSession | null>
  >;
  handleViewSessionDetails: (sessionId: string) => void;
};

function ParkingHistoryTable({
  parkingSessions,
  selectedSession,
  setSelectedSession,
  handleViewSessionDetails,
}: ParkingHistoryTableProps) {
  const getStatusBadge = (status: ParkingSessionStatus) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case ParkingSessionStatus.COMPLETED:
        return `${baseClasses} bg-green-100 text-green-800`;
      case ParkingSessionStatus.CURRENTLY_PARKED:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case ParkingSessionStatus.PAYMENT_PENDING:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex justify-between mb-4">
        <div className="text-lg font-bold"></div>
      </div>
      <Table
        aria-label="Parking History Table"
        className="w-full"
        color="secondary"
      // selectedKeys={selectedSession ? [selectedSession.id] : []}
      // onSelectionChange={(keys: any) => {
      //     if (typeof keys === 'string') { // Handle "all" selection
      //         setSelectedSession(null);
      //         return;
      //     }
      //     const [selectedId] = keys;
      //     const session = parkingSessions.find((s) => s.id === selectedId);
      //     setSelectedSession(session || null);
      // }}
      // selectionMode="single"
      >
        <TableHeader className="">
          <TableColumn
            key="sessionId"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Session ID
          </TableColumn>
          <TableColumn
            key="licensePlate"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            License Plate
          </TableColumn>
          <TableColumn
            key="entryTime"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Entry Time
          </TableColumn>
          <TableColumn
            key="exitTime"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Exit Time
          </TableColumn>
          <TableColumn
            key="duration"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Duration
          </TableColumn>
          <TableColumn
            key="amount"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Amount
          </TableColumn>
          <TableColumn
            key="status"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Status
          </TableColumn>
          <TableColumn
            key="action"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Action
          </TableColumn>
        </TableHeader>
        <TableBody>
          {parkingSessions.map((session, index) => {
            return (
              <TableRow key={`${session.id}`}>
                {/* session id */}
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm ">
                  {session.id}
                </TableCell>
                {/* license plate */}
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium ">
                        {session.vehicle?.licensePlate ||
                          "Unknown License Plate"}
                      </div>
                      <div className="text-sm text-primary-900/90 ">
                        {session.vehicle?.brand} {session.vehicle?.model}
                      </div>
                    </div>
                  </div>
                </TableCell>
                {/* entry time */}
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm ">
                  <div className="text-sm text-foreground/90">
                    {formatDate(session.entryDateTime)}
                  </div>
                  <div className="text-sm text-primary-900/80">
                    {formatTime(session.entryDateTime)}
                  </div>
                </TableCell>
                {/* exit time */}
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground/90">
                    {session.exitDateTime
                      ? formatDate(session.exitDateTime)
                      : "-"}
                  </div>
                  <div className="text-sm text-primary-900/80">
                    {session.exitDateTime
                      ? formatTime(session.exitDateTime)
                      : "Currently parked"}
                  </div>
                </TableCell>
                {/* duration */}
                <TableCell
                  className={`text-sm font-medium ${session.status === ParkingSessionStatus.CURRENTLY_PARKED ? "text-orange-600" : "text-gray-900"}`}
                >
                  {session.duration}
                </TableCell>
                {/* amount */}
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  {session.status === ParkingSessionStatus.CURRENTLY_PARKED
                    ? "-"
                    : session.cost != null && session.cost > 0
                      ? `${session.cost.toFixed(0)} đ`
                      : "0 đ"}
                </TableCell>
                {/* status */}
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(session.status)}>
                    {session.status === ParkingSessionStatus.CURRENTLY_PARKED
                      ? "Currently Parked"
                      : session.status === ParkingSessionStatus.COMPLETED
                        ? "Completed"
                        : "Payment Pending"}
                  </span>
                </TableCell>
                {/* action */}
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <Button
                    aria-label="view details"
                    color="secondary"
                    className="text-background"
                    size="sm"
                    onPress={() => handleViewSessionDetails(session.id)}
                    isIconOnly
                  >
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ParkingHistory;
