import DefaultLayout from "@/layouts/default";
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
} from "@heroui/react";
import { Search } from "lucide-react";
import { Select, SelectItem } from "@/components/ui/Select";
import { useNavigate } from "react-router-dom";

const mockAdmins = [
  {
    id: "A001",
    fullName: "John David Smith",
    email: "john.admin@sapls.com",
    role: "Head Admin",
    createdAt: "Jan 1, 2024",
    status: "Active",
    protected: true,
  },
  {
    id: "A002",
    fullName: "Sarah Michelle Johnson",
    email: "sarah.admin@sapls.com",
    role: "Admin",
    createdAt: "Jan 15, 2024",
    status: "Active",
    protected: false,
  },
  {
    id: "A003",
    fullName: "Michael Robert Wilson",
    email: "mike.admin@sapls.com",
    role: "Moderator",
    createdAt: "Feb 1, 2024",
    status: "Suspended",
    protected: false,
  },
  {
    id: "A004",
    fullName: "Lisa Marie Rodriguez",
    email: "lisa.admin@sapls.com",
    role: "Admin",
    createdAt: "Mar 10, 2024",
    status: "Active",
    protected: false,
  },
  {
    id: "A005",
    fullName: "James William Brown",
    email: "james.admin@sapls.com",
    role: "Moderator",
    createdAt: "Apr 5, 2024",
    status: "Active",
    protected: false,
  },
];

const stats = [
  { label: "Total Admins", value: 12 },
  { label: "Active Admins", value: 10 },
  { label: "Suspended Admins", value: 2 },
  { label: "Head Admin", value: 1 },
];

const statusColor: Record<string, string> = {
  Active: "bg-blue-100 text-blue-700",
  Suspended: "bg-red-100 text-red-700",
};
const roleColor: Record<string, string> = {
  "Head Admin": "bg-yellow-200 text-yellow-800 font-bold",
  Admin: "bg-blue-200 text-blue-800",
  Moderator: "bg-cyan-100 text-cyan-800",
};

const AdminAccountList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  const filtered = mockAdmins.filter((a) => {
    const matchSearch =
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || a.status === status;
    const matchRole = role === "All" || a.role === role;
    return matchSearch && matchStatus && matchRole;
  });
  const pages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const items = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  React.useEffect(() => {
    setPage(1);
  }, [search, status, role]);

  const handleViewDetails = (adminId: string) => {
    navigate(`/admin/accounts/admins/${adminId}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-sky-100 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#023E8A]">{s.value}</div>
            <div className="text-sm text-[#023E8A] font-semibold mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {/* Search & Actions */}
      <Card className="p-4 mb-4">
        <div className="font-bold text-lg mb-2 flex items-center gap-2">
          <Search size={18} /> Search & Actions
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search by ID, name, email, ..."
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
              onValueChange={setStatus}
              className="min-w-[120px]"
            >
              <SelectItem key="All">All Status</SelectItem>
              <SelectItem key="Active">Active</SelectItem>
              <SelectItem key="Suspended">Suspended</SelectItem>
            </Select>
          </div>
          <div>
            <Select
              value={role}
              onValueChange={setRole}
              className="min-w-[120px]"
            >
              <SelectItem key="All">All Roles</SelectItem>
              <SelectItem key="Head Admin">Head Admin</SelectItem>
              <SelectItem key="Admin">Admin</SelectItem>
              <SelectItem key="Moderator">Moderator</SelectItem>
            </Select>
          </div>
          <Button className="bg-[#023E8A] text-white">Search</Button>
          <Button className="bg-sky-200 text-[#023E8A] ml-2">
            + Add Admin
          </Button>
        </div>
      </Card>
      {/* Admin Account List Table */}
      <Card className="p-6">
        <div className="font-bold text-lg mb-4 flex items-center gap-2">
          <span role="img" aria-label="admin">
            👨‍💼
          </span>{" "}
          Admin Account List
        </div>
        <Table aria-label="Admin Account Table">
          <TableHeader>
            <TableColumn>Admin ID</TableColumn>
            <TableColumn>Full Name</TableColumn>
            <TableColumn>Email Address</TableColumn>
            <TableColumn>Role</TableColumn>
            <TableColumn>Created Date</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {items.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-bold text-[#023E8A]">
                  {admin.id}
                </TableCell>
                <TableCell>{admin.fullName}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColor[admin.role] || ""}`}
                  >
                    {admin.role}
                  </span>
                </TableCell>
                <TableCell>{admin.createdAt}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[admin.status] || ""}`}
                  >
                    {admin.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => handleViewDetails(admin.id)}
                  >
                    View
                  </Button>
                  {!admin.protected && (
                    <Button size="sm" color="primary" className="ml-2">
                      Edit
                    </Button>
                  )}
                  {!admin.protected && admin.status === "Active" && (
                    <Button size="sm" color="danger" className="ml-2">
                      Ban
                    </Button>
                  )}
                  {!admin.protected && admin.status === "Suspended" && (
                    <Button size="sm" color="success" className="ml-2">
                      Unban
                    </Button>
                  )}
                  {admin.protected && (
                    <Button size="sm" disabled className="ml-2">
                      Protected
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
        <div className="mt-6 p-3 bg-blue-50 rounded text-blue-900 text-sm">
          <b>Permission Note:</b> Only Head Administrators can ban/unban other
          admin accounts. Head Admin accounts are protected and cannot be
          modified or banned.
        </div>
      </Card>
    </div>
  );
};

export default AdminAccountList;
