import React, { useState } from "react";
import {
  Card,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { Search, Users } from "lucide-react";

const mockUsers = [
  {
    id: "U001",
    fullName: "John Michael Smith",
    email: "john.smith@email.com",
    createdAt: "Mar 15, 2024",
    status: "Active",
  },
  {
    id: "U002",
    fullName: "Sarah Elizabeth Johnson",
    email: "sarah.johnson@email.com",
    createdAt: "Apr 20, 2024",
    status: "Active",
  },
  {
    id: "U003",
    fullName: "Michael Robert Wilson",
    email: "mike.wilson@email.com",
    createdAt: "Feb 10, 2024",
    status: "Banned",
  },
  {
    id: "U004",
    fullName: "Emma Catherine Davis",
    email: "emma.davis@email.com",
    createdAt: "May 8, 2024",
    status: "Active",
  },
  {
    id: "U005",
    fullName: "David Christopher Lee",
    email: "david.lee@email.com",
    createdAt: "Jun 1, 2024",
    status: "Pending",
  },
];

const statusColor: Record<string, string> = {
  Active: "bg-blue-100 text-blue-700",
  Banned: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const stats = [
  { label: "Total Users", value: 1247 },
  { label: "Active Users", value: 1189 },
  { label: "Banned Users", value: 32 },
  { label: "Pending Users", value: 26 },
];

const UserAccountList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Filter logic
  const filtered = mockUsers.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || u.status === status;
    // Date filter is not implemented in mock data
    return matchSearch && matchStatus;
  });
  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const items = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page when filter/search changes
  React.useEffect(() => {
    setPage(1);
  }, [search, status, date]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-sky-100 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#023E8A]">
              {s.value.toLocaleString()}
            </div>
            <div className="text-sm text-[#023E8A] font-semibold mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {/* Search & Filter */}
      <Card className="p-4 mb-4">
        <div className="font-bold text-lg mb-2 flex items-center gap-2">
          <Search size={18} /> Search & Filter
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search by ID, name, email, or phone..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="w-full"
            />
          </div>
          <div>
            <Select
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatus(e.target.value)
              }
              className="min-w-[140px]"
            >
              <SelectItem key="All">All Status</SelectItem>
              <SelectItem key="Active">Active</SelectItem>
              <SelectItem key="Banned">Banned</SelectItem>
              <SelectItem key="Pending">Pending</SelectItem>
            </Select>
          </div>
          <div>
            <Input
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(e.target.value)
              }
              className="min-w-[140px]"
            />
          </div>
          <Button className="bg-[#023E8A] text-white" onClick={() => {}}>
            <Search size={16} className="mr-1" /> Search
          </Button>
        </div>
      </Card>
      {/* User Account List Table */}
      <Card className="p-6">
        <div className="font-bold text-lg mb-4 flex items-center gap-2">
          <Users size={18} /> User Account List
        </div>
        <Table aria-label="User Account Table">
          <TableHeader>
            <TableColumn>User ID</TableColumn>
            <TableColumn>Full Name</TableColumn>
            <TableColumn>Email Address</TableColumn>
            <TableColumn>Created Date</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-bold text-[#023E8A]">
                  {user.id}
                </TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[user.status] || ""}`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="light">
                    View
                  </Button>
                  {user.status === "Active" && (
                    <Button size="sm" color="danger" className="ml-2">
                      Ban
                    </Button>
                  )}
                  {user.status === "Banned" && (
                    <Button size="sm" color="success" className="ml-2">
                      Unban
                    </Button>
                  )}
                  {user.status === "Pending" && (
                    <Button size="sm" color="primary" className="ml-2">
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            Showing {items.length} of {filtered.length} entries
          </span>
          <Pagination total={pages} page={page} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
};

export default UserAccountList;
