import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Search } from "lucide-react";

interface RequestWithUser {
  id: string;
  header: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  updatedAt: Date;
  internalNote?: string;
  responseMessage?: string;
  lastUpdatePersonId: string;
  requesterName: string;
  requesterType: "user" | "owner";
}

const mockRequests: RequestWithUser[] = [
  {
    id: "1",
    header: "Account Verification",
    description: "Request for account verification with submitted documents",
    status: "pending",
    submittedAt: new Date(),
    updatedAt: new Date(),
    internalNote: "",
    lastUpdatePersonId: "admin1",
    requesterName: "John Doe",
    requesterType: "user",
  },
  // Add more mock requests as needed
];

const RequestList: React.FC = () => {
  const navigate = useNavigate();
  const [requests] = useState<RequestWithUser[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.header.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pages = Math.ceil(filteredRequests.length / rowsPerPage);
  const items = filteredRequests.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/20 text-warning";
      case "approved":
        return "bg-success/20 text-success";
      case "rejected":
        return "bg-danger/20 text-danger";
      default:
        return "bg-default/20 text-default";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Requests</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="text-default-400" size={20} />}
            className="w-full max-w-xs"
          />{" "}
          <Select
            placeholder="Filter by status"
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) =>
              setStatusFilter(Array.from(keys)[0] as string)
            }
            className="w-48"
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="pending">Pending</SelectItem>
            <SelectItem key="approved">Approved</SelectItem>
            <SelectItem key="rejected">Rejected</SelectItem>
          </Select>
        </div>

        {/* Requests Table */}
        <Table aria-label="Requests table">
          <TableHeader>
            <TableColumn>REQUEST ID</TableColumn>
            <TableColumn>TITLE</TableColumn>
            <TableColumn>REQUESTER</TableColumn>
            <TableColumn>TYPE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>SUBMITTED</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {items.map((request) => (
              <TableRow key={request.id}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>{request.header}</TableCell>
                <TableCell>{request.requesterName}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      request.requesterType === "owner"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {request.requesterType === "owner" ? "Owner" : "User"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(request.submittedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => navigate(`/admin/requests/${request.id}`)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination total={pages} page={page} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
};

export default RequestList;
