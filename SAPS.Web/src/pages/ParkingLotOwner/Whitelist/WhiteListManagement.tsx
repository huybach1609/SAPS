import type { Whitelist, PaginationInfo } from "@/types/Whitelist";

import { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Input,

  Pagination,
  Spinner,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  Table,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import {
  Edit2,
  FolderSearch,
  PlusIcon,
  RefreshCcw,
  Trash2,
  Users,
} from "lucide-react";

import { useParkingLot } from "../ParkingLotContext";

import WhitelistStatusComponent from "./WhiteListStatus";
import AddFileModal from "./WhiteListModal";
import AddUserModal from "./AddUserModal";
import EditEntryModal from "./EditEntryModal";

import { User } from "@/types/User";
import {
  fetchWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  updateWhitelistEntry,
  searchWhitelist,
} from "@/services/parkinglot/whitelistService";
import DefaultLayout from "@/layouts/default";

export default function Whitelist() {
  const { selectedParkingLot, loading: parkingLotLoading } = useParkingLot();
  const [whitelist, setWhitelist] = useState<Whitelist[]>([]);
  const [loading, setLoading] = useState(true);
  // searchTerm for add user
  // const [searchTerm, setSearchTerm] = useState("");
  // const [searchResults, setSearchResults] = useState<User[]>([]);
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [expiryDate, setExpiryDate] = useState("");
  const [editingEntry, setEditingEntry] = useState<Whitelist | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [tableSearch, setTableSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // Modal disclosure hooks
  const addModalDisclosure = useDisclosure();
  const editModalDisclosure = useDisclosure();
  const addFileModalDisclosure = useDisclosure();

  // Fetch whitelist data
  const loadWhitelist = async () => {
    if (!selectedParkingLot?.id) return;

    setLoading(true);
    try {
      if (tableSearch != null && tableSearch.trim() !== "") {
        const response = await fetchWhitelist(
          selectedParkingLot.id,
          6,
          currentPage,
          tableSearch,
        );

        setWhitelist(response.data);
        setPagination(response.pagination);
      } else {
        const response = await fetchWhitelist(
          selectedParkingLot.id,
          6,
          currentPage,
        );

        setWhitelist(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Failed to load whitelist:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const handleSearch = async (term: string) => {
    try {
      // const response = await SearchWhitelist(term);
      loadWhitelist();
      // setSearchResults(response as unknown as User[]);
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  // Add user to whitelist

  const handleAddToWhitelist = async (user: User, expiryDate: string): Promise<string | null> => {
    if (!selectedParkingLot?.id) return "No parking lot selected.";
    // success then load whitelist to refresh new data
    try {
      await addToWhitelist(
        selectedParkingLot.id,
        user.id,
        expiryDate || undefined,
      );
      loadWhitelist(); // Refresh the list
      return null;
    }catch (error: any) {
      // fetch faill to show error message
      return (
        error?.message ||
        "Failed to add to whitelist. Please try again."
      );
    }
  };

  // Remove user from whitelist
  const handleRemoveFromWhitelist = async (clientId: string) => {
    if (!selectedParkingLot?.id) return;

    if (
      window.confirm(
        "Are you sure you want to remove this user from the whitelist?",
      )
    ) {
      try {
        await removeFromWhitelist(selectedParkingLot.id, clientId);
        loadWhitelist(); // Refresh the list
      } catch (error) {
        console.error("Failed to remove from whitelist:", error);
      }
    }
  };

  // Update whitelist entry
  const handleUpdateEntry = async (updatedEntry: Whitelist, expiryDate: string, onClose?: () => void) => {
    if (!updatedEntry || !selectedParkingLot?.id) return;

    try {
      await updateWhitelistEntry(selectedParkingLot.id, updatedEntry.clientId, {
        expiredDate: expiryDate || undefined,
      });
      if (onClose) onClose();
      setEditingEntry(null);
      // setExpiryDate("");
      loadWhitelist(); // Refresh the list
    } catch (error) {
      console.error("Failed to update whitelist entry:", error);
    }
  };

  // Open edit modal
  const openEditModal = (entry: Whitelist) => {
    setEditingEntry(entry);
    setExpiryDate(entry.expiredDate || "");
    editModalDisclosure.onOpen();
  };

  useEffect(() => {
    loadWhitelist();
  }, [selectedParkingLot?.id, currentPage]);

  const formatDateForInput = (isoString: string) => {
    if (!isoString) return "";

    return isoString.split("T")[0]; // Gets just the yyyy-MM-dd part
  };

  function handleReset() {
    setTableSearch("");
    setCurrentPage(1);
    loadWhitelist();
  }

  return (
    <DefaultLayout title="Whitelist">
      <div className="max-w-7xl mx-auto p-6">
        <WhitelistStatusComponent
          loadparking={parkingLotLoading}
          parkingLotId={selectedParkingLot?.id || ""}
        />

        {/* Search & add */}
        <Card className="bg-background-100/20 mb-6">
          <CardHeader className="flex items-center gap-2">
            <FolderSearch className="w-6 h-6 text-primary" />
            <h2 className=" font-bold">Search & Add User</h2>
          </CardHeader>
          <CardBody className="">
            <div className="flex gap-2 items-center justify-between w-full ">
              <div className="flex gap-2 items-center w-full">
                <Input
                  className="w-1/2"
                  color="primary"
                  placeholder="Search by name, email, or ID..."
                  size="sm"
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(tableSearch);
                    }
                  }}
                />
                <Button
                  className="text-background"
                  color="primary"
                  size="sm"
                  onPress={() => handleSearch(tableSearch)}
                >
                  Search
                </Button>
                <Button
                  isIconOnly
                  className="text-background"
                  color="primary"
                  size="sm"
                  onPress={() => handleReset()}
                >
                  <RefreshCcw size={16} />
                </Button>
              </div>
              <ButtonGroup>
                <Button
                  className="text-background"
                  color="secondary"
                  radius="sm"
                  size="sm"
                  startContent={<PlusIcon size={16} />}
                  onPress={addModalDisclosure.onOpen}
                >
                  Add User
                </Button>
                <Button
                  className="text-background"
                  color="success"
                  radius="sm"
                  size="sm"
                  startContent={<Users size={16} />}
                  onPress={addFileModalDisclosure.onOpen}
                >
                  Add File
                </Button>
              </ButtonGroup>
            </div>
          </CardBody>
        </Card>

        {/* Whitelist Table */}
        <div className="min-h-[70vh]">
          {parkingLotLoading || loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : whitelist.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No users in whitelist yet.</p>
            </div>
          ) : (
            <WhitelistTable
              handleRemoveFromWhitelist={handleRemoveFromWhitelist}
              openEditModal={openEditModal}
              whitelist={whitelist}
            />
          )}
        </div>

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

        {/* Add User Modal */}
        <AddUserModal
          isOpen={addModalDisclosure.isOpen}
          onOpenChange={addModalDisclosure.onOpenChange}
          onAddToWhitelist={handleAddToWhitelist}
          parkingLotId={selectedParkingLot?.id || ""}
        />

        {/* Edit Entry Modal */}
        <EditEntryModal
          isOpen={editModalDisclosure.isOpen && !!editingEntry}
          onOpenChange={editModalDisclosure.onOpenChange}
          entryToEdit={editingEntry}
          handleUpdateEntry={handleUpdateEntry}
        />

        {/* Add File Modal */}
        <AddFileModal
          addFileModalDisclosure={addFileModalDisclosure}
          parkingLotId={selectedParkingLot?.id || ""}
        />
      </div>
    </DefaultLayout>
  );
}
// Pass openEditModal and handleRemoveFromWhitelist as props from the parent component
type WhitelistTableProps = {
  whitelist: Whitelist[];
  openEditModal: (entry: Whitelist) => void;
  handleRemoveFromWhitelist: (clientId: string) => void;
};

function WhitelistTable({
  whitelist,
  openEditModal,
  handleRemoveFromWhitelist,
}: WhitelistTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table aria-label="Whitelist Table" className="">
        <TableHeader className="">
          <TableColumn
            key="user"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            User
          </TableColumn>
          <TableColumn
            key="addedDate"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Added Date
          </TableColumn>
          <TableColumn
            key="expiryDate"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Expiry Date
          </TableColumn>
          <TableColumn
            key="status"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Status
          </TableColumn>
          <TableColumn
            key="actions"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {whitelist.map((entry) => {
            const isExpired =
              entry.expiredDate && new Date(entry.expiredDate) < new Date();
            const isActive = !entry.expiredDate || !isExpired;

            return (
              <TableRow key={`${entry.parkingLotId}-${entry.clientId}`}>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      {entry.client?.profileImageUrl ? (
                        <img
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                          src={entry.client.profileImageUrl}
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {entry.client?.fullName?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.client?.fullName || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.client?.email || entry.clientId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(entry.addedDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.expiredDate
                    ? new Date(entry.expiredDate).toLocaleDateString()
                    : "No expiry"}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {isActive ? "Active" : "Expired"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    isIconOnly
                    aria-label={`Edit ${entry.clientId || "Unknown User"}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    data-testid={`edit-button-${entry.clientId}`}
                    startContent={<Edit2 className="w-4 h-4" />}
                    variant="light"
                    onPress={() => openEditModal(entry)}
                  />
                  <Button
                    isIconOnly
                    aria-label={`Remove ${entry.client?.fullName || "Unknown User"}`}
                    className="text-red-600 hover:text-red-900"
                    startContent={<Trash2 className="w-4 h-4" />}
                    variant="light"
                    onPress={() => handleRemoveFromWhitelist(entry.clientId)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
