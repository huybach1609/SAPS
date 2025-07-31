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
import { BarChart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  formatDateTime,
  formatTime,
} from "../ParkingHistory/HistoryManagement/ParkingHistoryDetail";
import { useParkingLot } from "../ParkingLotContext";

import DefaultLayout from "@/layouts/default";
import {
  IncidentReport,
  IncidentStatus,
  IncidentPriority,
} from "@/types/IncidentReport";
import {
  fetchIncidents,
  fetchIncidentStatistics,
  IncidentReportStatistics,
} from "@/services/parkinglot/incidentService";
import { PaginationInfo } from "@/types/Whitelist";

const statusOptions = [
  { key: "", label: "All Status" },
  { key: IncidentStatus.Open, label: "Open" },
  { key: IncidentStatus.InProgress, label: "In Progress" },
  { key: IncidentStatus.Resolved, label: "Resolved" },
  { key: IncidentStatus.Closed, label: "Closed" },
];

const priorityOptions = [
  { key: "", label: "All Priority" },
  { key: IncidentPriority.Low, label: "Low" },
  { key: IncidentPriority.Medium, label: "Medium" },
  { key: IncidentPriority.High, label: "High" },
  { key: IncidentPriority.Critical, label: "Critical" },
];

const getStatusColor = (status: IncidentStatus) => {
  switch (status) {
    case IncidentStatus.Open:
      return "bg-cyan-100 text-cyan-800";
    case IncidentStatus.InProgress:
      return "bg-blue-200 text-blue-800";
    case IncidentStatus.Resolved:
      return "bg-green-200 text-green-800";
    case IncidentStatus.Closed:
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: IncidentPriority) => {
  switch (priority) {
    case IncidentPriority.Low:
      return "bg-gray-200 text-gray-800";
    case IncidentPriority.Medium:
      return "bg-blue-200 text-blue-800";
    case IncidentPriority.High:
      return "bg-yellow-200 text-yellow-800";
    case IncidentPriority.Critical:
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
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // filter by date range (entryDateTime, exitDateTime)
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null,
  );

  const navigate = useNavigate();

  // Fetch incidents from API
  useEffect(() => {
    if (!selectedParkingLot?.id) return;
    setLoading(true);
    // console.log(status, priority, date, search);
    const dateRangeStart = dateRange?.start
      ? new Date(
          dateRange.start.year,
          dateRange.start.month - 1,
          dateRange.start.day,
        ).toISOString()
      : undefined;
    const dateRangeEnd = dateRange?.end
      ? new Date(
          dateRange.end.year,
          dateRange.end.month - 1,
          dateRange.end.day,
        ).toISOString()
      : undefined;

    fetchIncidents(
      selectedParkingLot.id,
      pageSize,
      currentPage,
      search,
      dateRangeStart,
      dateRangeEnd,
      status !== "" ? Number(status) : undefined,
      priority !== "" ? Number(priority) : undefined,
    )
      .then((res) => {
        setIncidents(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        setIncidents([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, [
    selectedParkingLot?.id,
    search,
    status,
    priority,
    date,
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
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(opt.key as IncidentStatus)}`}
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
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(opt.key as IncidentPriority)}`}
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
                  <TableColumn>Incident ID</TableColumn>
                  <TableColumn>Type</TableColumn>
                  <TableColumn>Description</TableColumn>
                  <TableColumn>Reported By</TableColumn>
                  <TableColumn>Date &amp; Time</TableColumn>
                  <TableColumn>Priority</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc) => (
                    <TableRow key={inc.id}>
                      <TableCell className="text-primary font-bold cursor-pointer">
                        {inc.id}
                      </TableCell>
                      <TableCell>{inc.header}</TableCell>
                      <TableCell className="flex flex-col">
                        <span>{inc.description}</span>
                        <span className="text-xs text-background-900/60">
                          {inc.descriptionNote}
                        </span>
                      </TableCell>
                      <TableCell className="">
                        <div className="flex flex-col">
                          <span className="text-primary font-bold cursor-pointer">
                            {inc.reporter?.name}
                          </span>
                          <span className="text-xs text-background-900/60">
                            {inc.reporter?.role}
                          </span>
                        </div>
                      </TableCell>
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
                          {IncidentPriority[inc.priority]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(inc.status)}`}
                        >
                          {IncidentStatus[inc.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          className="text-background"
                          color="secondary"
                          onPress={() => {
                            navigate(
                              `/owner/incidents/${selectedParkingLot?.id}/${inc.id}`,
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
            Showing page {pagination.currentPage} of {pagination.totalPages}(
            {pagination.totalItems} total items)
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
              page={pagination.currentPage}
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
    <Card className="bg-background-100/20 mb-6">
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
