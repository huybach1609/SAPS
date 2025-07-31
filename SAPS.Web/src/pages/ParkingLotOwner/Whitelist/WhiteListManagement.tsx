// WhiteListManagement.tsx (Refactored)
import type { Whitelist } from "@/types/Whitelist";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Pagination,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { FolderSearch } from "lucide-react";

import { useParkingLot } from "../ParkingLotContext";
import { useWhitelistManagement } from "@/hooks/useWhitelistManagement";

import WhitelistStatusComponent from "./WhiteListStatus";
import AddFileModal from "./WhiteListModal";
import AddUserModal from "./AddUserModal";
import EditEntryModal from "./EditEntryModal";
import { WhitelistTable } from "@/components/ui/whitelist/WhitelistTable";
import { WhitelistSearchBar } from "@/components/ui/whitelist/WhitelistSearchBar";

export function WhitelistManagement() {
  const { selectedParkingLot, loading: parkingLotLoading } = useParkingLot();
  const [editingEntry, setEditingEntry] = useState<Whitelist | null>(null);

  // Modal disclosures
  const addModalDisclosure = useDisclosure();
  const editModalDisclosure = useDisclosure();
  const addFileModalDisclosure = useDisclosure();

  // Custom hook for whitelist management
  const {
    whitelist,
    loading,
    pagination,
    tableSearch,
    setTableSearch,
    setCurrentPage,
    handleAddToWhitelist,
    handleRemoveFromWhitelist,
    handleUpdateEntry,
    handleSearch,
    handleReset,
  } = useWhitelistManagement(selectedParkingLot?.id);

  // Modal handlers
  const openEditModal = (entry: Whitelist) => {
    setEditingEntry(entry);
    editModalDisclosure.onOpen();
  };

  const handleUpdateEntryWithModal = async (
    updatedEntry: Whitelist,
    expiryDate: string,
    onClose?: () => void
  ) => {
    await handleUpdateEntry(updatedEntry, expiryDate);
    if (onClose) onClose();
    setEditingEntry(null);
  };

  const handleRemoveWithConfirmation = async (clientId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this user from the whitelist?"
      )
    ) {
      await handleRemoveFromWhitelist(clientId);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        <WhitelistStatusComponent
          loadparking={parkingLotLoading}
          parkingLotId={selectedParkingLot?.id || ""}
        />

        {/* Search & Add Section */}
        <Card className="bg-background-100/20 mb-6">
          <CardHeader className="flex items-center gap-2">
            <FolderSearch className="w-6 h-6 text-primary" />
            <h2 className="font-bold">Search & Add User</h2>
          </CardHeader>
          <CardBody>
            <WhitelistSearchBar
              searchValue={tableSearch}
              onSearchChange={setTableSearch}
              onSearch={handleSearch}
              onReset={handleReset}
              onAddUser={addModalDisclosure.onOpen}
              onAddFile={addFileModalDisclosure.onOpen}
            />
          </CardBody>
        </Card>

        {/* Whitelist Table Section */}
        <div className="min-h-[70vh]">
          {parkingLotLoading || loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner data-testid="spinner" />
            </div>
          ) : whitelist.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No users in whitelist yet.</p>
            </div>
          ) : (
            <WhitelistTable
              whitelist={whitelist}
              onEdit={openEditModal}
              onRemove={handleRemoveWithConfirmation}
            />
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalItems} total items)
            </div>
            <div className="flex space-x-2">
              <Button
                disabled={!pagination.hasPreviousPage || parkingLotLoading}
                onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                disabled={!pagination.hasNextPage || parkingLotLoading}
                onPress={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1)
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <AddUserModal
          isOpen={addModalDisclosure.isOpen}
          onOpenChange={addModalDisclosure.onOpenChange}
          onAddToWhitelist={handleAddToWhitelist}
          parkingLotId={selectedParkingLot?.id || ""}
        />

        <EditEntryModal
          isOpen={editModalDisclosure.isOpen && !!editingEntry}
          onOpenChange={editModalDisclosure.onOpenChange}
          entryToEdit={editingEntry}
          handleUpdateEntry={handleUpdateEntryWithModal}
        />

        <AddFileModal
          addFileModalDisclosure={addFileModalDisclosure}
          parkingLotId={selectedParkingLot?.id || ""}
        />
      </div>
    </>
  );
}
