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

interface ParkingLotOwner {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  parkingLotCount: number;
  status: "active" | "inactive" | "pending";
  createdAt: Date;
}

const mockOwners: ParkingLotOwner[] = [
  {
    id: "1",
    fullName: "John Owner",
    email: "owner@example.com",
    phone: "+1234567890",
    parkingLotCount: 2,
    status: "active",
    createdAt: new Date(),
  },
  // Add more mock owners as needed
];

const ParkingLotOwnerList: React.FC = () => {
  const navigate = useNavigate();
  const [owners] = useState<ParkingLotOwner[]>(mockOwners);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const filteredOwners = owners.filter(
    (owner) =>
      owner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pages = Math.ceil(filteredOwners.length / rowsPerPage);
  const items = filteredOwners.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Parking Lot Owners</h1>
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            onPress={() => navigate("/admin/parking-owners/new")}
          >
            Add New Owner
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="text-default-400" size={20} />}
            className="w-full max-w-xs"
          />
        </div>

        {/* Owners Table */}
        <Table aria-label="Parking lot owners table">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>PHONE</TableColumn>
            <TableColumn>PARKING LOTS</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {items.map((owner) => (
              <TableRow key={owner.id}>
                <TableCell>{owner.fullName}</TableCell>
                <TableCell>{owner.email}</TableCell>
                <TableCell>{owner.phone}</TableCell>
                <TableCell>{owner.parkingLotCount}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      owner.status === "active"
                        ? "bg-success/20 text-success"
                        : owner.status === "pending"
                          ? "bg-warning/20 text-warning"
                          : "bg-danger/20 text-danger"
                    }`}
                  >
                    {owner.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() =>
                      navigate(`/admin/parking-owners/${owner.id}`)
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

export default ParkingLotOwnerList;
