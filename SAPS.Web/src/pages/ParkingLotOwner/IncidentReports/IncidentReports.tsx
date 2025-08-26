import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  RangeValue,
  DateValue,
  DateRangePicker,
} from "@heroui/react";
import { BarChart, Eye, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  formatDateTime,
  formatTime,
} from "../ParkingHistory/HistoryManagement/ParkingHistoryDetail";
import { useParkingLot } from "../ParkingLotContext";

import DefaultLayout from "@/layouts/default";
import { IncidentStatus, IncidentPriority } from "@/types/IncidentReport";
import {
  fetchIncidents,
  fetchIncidentStatistics,
  IncidentReportStatistics,
  PaginatedIncidentResponse,
} from "@/services/parkinglot/incidentService";
import type { IncidentListItem } from "@/services/parkinglot/incidentService";

const statusOptions = [
  { key: "", label: "All Status" },
  { key: "Open", label: "Open" },
  { key: "InProgress", label: "In Progress" },
  { key: "Resolved", label: "Resolved" },
  { key: "Close", label: "Closed" },
];

const priorityOptions = [
  { key: "", label: "All Priority" },
  { key: "Low", label: "Low" },
  { key: "Medium", label: "Medium" },
  { key: "High", label: "High" },
  { key: "Critical", label: "Critical" },
];

const getStatusColor = (status: string | IncidentStatus) => {
  const value = typeof status === "string" ? status.toLowerCase() : IncidentStatus[status].toLowerCase();
  switch (value) {
    case "open":
      return "bg-cyan-100 text-cyan-800";
    case "inprogress":
    case "in progress":
      return "bg-blue-200 text-blue-800";
    case "resolved":
      return "bg-green-200 text-green-800";
    case "closed":
    case "close":
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string | IncidentPriority) => {
  const value = typeof priority === "string" ? priority.toLowerCase() : IncidentPriority[priority].toLowerCase();
  switch (value) {
    case "low":
      return "bg-gray-200 text-gray-800";
    case "medium":
      return "bg-blue-200 text-blue-800";
    case "high":
      return "bg-yellow-200 text-yellow-800";
    case "critical":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function IncidentReports() {
  const { selectedParkingLot, loading: parkingLotLoading } = useParkingLot();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  // const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [pagination, setPagination] = useState<PaginatedIncidentResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // filter by date range (entryDateTime, exitDateTime)
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null,
  );

  const navigate = useNavigate();

  // helper to format expected date-only string: YYYY-MM-DD
  const formatForApi = (year: number, month: number, day: number) => {
    const two = (n: number) => n.toString().padStart(2, "0");
    return `${year}-${two(month)}-${two(day)}`;
  };

  // Fetch incidents from API
  useEffect(() => {
    if (!selectedParkingLot?.id) return;
    setLoading(true);
    const dateRangeStart = dateRange?.start
      ? formatForApi(dateRange.start.year, dateRange.start.month, dateRange.start.day)
      : undefined;
    const dateRangeEnd = dateRange?.end
      ? formatForApi(dateRange.end.year, dateRange.end.month, dateRange.end.day)
      : undefined;

    fetchIncidents(
      selectedParkingLot.id,
      pageSize,
      currentPage,
      search,
      dateRangeStart,
      dateRangeEnd,
      status || undefined,
      priority || undefined,
    )
      .then((res) => {
        setIncidents(res.items);
        setPagination(res);
      })
      .catch(() => {
        setIncidents([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, [
    selectedParkingLot?.id,
    search,
    status,
    priority,
    // date,
    currentPage,
    dateRange,
  ]);

  return (
    <DefaultLayout title="Incident Reports">
      <IncidentReportStatisticsCard
        loading={parkingLotLoading}
        parkingLotId={selectedParkingLot?.id ?? ""}
      />
      <Card className="bg-background-100/20 mb-6 ">
        <CardHeader className="flex items-center gap-2">
          <span aria-label="search" role="img">
            🔍
          </span>
          <h2 className="font-bold">Search &amp; Filter Incidents</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2 items-center w-full">
            <Input
              className="w-64"
              color="primary"
              placeholder="Search by incident ID, description..."
              size="sm"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              aria-label="Filter by Status"
              className="w-40"
              color="primary"
              placeholder="All Status"
              selectedKeys={status === "" ? new Set() : new Set([status])}
              size="sm"
              onSelectionChange={(keys) =>
                setStatus(Array.from(keys)[0]?.toString() ?? "")
              }
            >
              {statusOptions.map((opt) => (
                <SelectItem key={opt.key} textValue={opt.label}>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(opt.key)}`}
                  >
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </Select>

            <Select
              aria-label="Filter by Priority"
              className="w-40"
              color="primary"
              placeholder="All Priority"
              selectedKeys={priority === "" ? new Set() : new Set([priority])}
              size="sm"
              onSelectionChange={(keys) =>
                setPriority(Array.from(keys)[0]?.toString() ?? "")
              }
            >
              {priorityOptions.map((opt) => (
                <SelectItem key={opt.key} textValue={opt.label}>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(opt.key)}`}
                  >
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </Select>

            <DateRangePicker
              aria-label="date range picker"
              className="w-auto text-primary-900"
              color="primary"
              size="sm"
              value={dateRange}
              onChange={setDateRange}
            />

            <Button className="text-background" color="primary" size="sm">
              Search
            </Button>
            <Button
            isIconOnly
              className="text-primary"
              color="default"
              size="sm"
              variant="flat"
              onPress={() => {
                setSearch("");
                setStatus("");
                setPriority("");
                setDateRange(null);
                setCurrentPage(1);
              }}
              
            >
              <RefreshCcw size={16}/>
            </Button>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="font-bold">Recent Incident Reports</CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-[78vh]">
                <Spinner />
              </div>
            ) : (
              <Table aria-label="Incident Reports Table">
                <TableHeader>
                  <TableColumn>No.</TableColumn>
                  <TableColumn>Header</TableColumn>
                  <TableColumn>Date &amp; Time</TableColumn>
                  <TableColumn>Priority</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc, index) => (
                    <TableRow key={inc.id}>
                      <TableCell className="text-primary font-bold cursor-pointer">
                        {index + 1}
                      </TableCell>
                      <TableCell>{inc.header}</TableCell>
                      <TableCell className="flex flex-col">
                        <span>{formatDateTime(inc.reportedDate)}</span>
                        <span className="text-xs text-background-900/60">
                          {formatTime(inc.reportedDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(inc.priority)}`}
                        >
                          {typeof inc.priority === "string" ? inc.priority : IncidentPriority[inc.priority]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(inc.status)}`}
                        >
                          {typeof inc.status === "string" ? inc.status : IncidentStatus[inc.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          className="text-background"
                          color="secondary"
                          onPress={() => {
                            navigate(
                              `/owner/incidents/${inc.id}`,
                            );
                          }}
                        >
                          <Eye className="w-4 h-4 cursor-pointer" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm ">
            Showing page {pagination.pageNumber} of {pagination.totalPages}(
            {pagination.totalCount} total items)
          </div>
          <div className="flex space-x-2">
            <Button
              className=""
              disabled={!pagination.hasPreviousPage || parkingLotLoading}
              onPress={() => {
                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
              }}
            >
              Previous
            </Button>
            <Pagination
              className="text-white"
              color="secondary"
              isDisabled={parkingLotLoading}
              page={pagination.pageNumber}
              total={pagination.totalPages}
              onChange={setCurrentPage}
            />
            <Button
              className=""
              disabled={!pagination.hasNextPage || parkingLotLoading}
              onPress={() => {
                setCurrentPage((prev) =>
                  prev < pagination.totalPages ? prev + 1 : prev,
                );
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
const IncidentReportStatisticsCard = ({
  parkingLotId,
  loading,
}: {
  parkingLotId: string;
  loading: boolean;
}) => {
  const [statistics, setStatistics] = useState<IncidentReportStatistics>();

  useEffect(() => {
    fetchIncidentStatistics(parkingLotId)
      .then((res) => setStatistics(res))
      .catch(() => setStatistics(undefined));
  }, [parkingLotId]);

  return loading ? (
    <div className="flex justify-center items-center h-[78vh]">
      <Spinner />
    </div>
  ) : (
    <Card className="bg-background-100/20 mb-6 hidden">
      <CardHeader className="flex items-center gap-2">
        <BarChart className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-bold">Incident Report Statistics</h2>
      </CardHeader>
      <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-orange-500/80 text-background p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{statistics?.openIncidents}</p>
          <p className="text-sm">Open Incidents</p>
        </div>
        <div className="bg-yellow-500/80 text-background p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{statistics?.inProgress}</p>
          <p className="text-sm">In Progress</p>
        </div>
        <div className="bg-blue-600/80 text-background p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{statistics?.thisMonth}</p>
          <p className="text-sm">This Month</p>
        </div>
        <div className="bg-green-600/80 text-background p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{statistics?.resolved}</p>
          <p className="text-sm">Resolved</p>
        </div>
      </CardBody>
    </Card>
  );
};
