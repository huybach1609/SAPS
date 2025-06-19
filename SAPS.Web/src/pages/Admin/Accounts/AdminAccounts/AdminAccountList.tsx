import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";
import { Search, Plus } from "lucide-react";
import { AdminUser } from "@/types/admin";

const mockAdmins: AdminUser[] = [
  {
    id: "1",
    email: "admin@sapls.com",
    fullName: "John Admin",
    adminId: "AD001",
    role: "admin",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more mock admins as needed
];

const AdminAccountList: React.FC = () => {
  const navigate = useNavigate();
  const [admins] = useState<AdminUser[]>(mockAdmins);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pages = Math.ceil(filteredAdmins.length / rowsPerPage);
  const items = filteredAdmins.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Accounts</h1>
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            onPress={() => navigate("/admin/accounts/admins/new")}
          >
            Add New Admin
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="text-default-400" size={20} />}
            className="w-full max-w-xs"
          />
        </div>

        {/* Admins Table */}
        <Table aria-label="Admins table">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {items.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.fullName}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      admin.role === "head_admin"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {admin.role === "head_admin" ? "Head Admin" : "Admin"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      admin.status === "active"
                        ? "bg-success/20 text-success"
                        : "bg-danger/20 text-danger"
                    }`}
                  >
                    {admin.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() =>
                      navigate(`/admin/accounts/admins/${admin.id}`)
                    }
                  >
                    View Details
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

export default AdminAccountList;
