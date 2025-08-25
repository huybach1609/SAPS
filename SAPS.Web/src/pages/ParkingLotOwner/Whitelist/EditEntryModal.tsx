import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Whitelist } from "@/types/Whitelist";
import React, { useEffect, useState } from "react";

interface EditEntryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entryToEdit: Whitelist | null;
  handleUpdateEntry: (updatedEntry: Whitelist, expiryDate: string, onClose?: () => void) => void;
}

const formatDateForInput = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return ""; 
  return date.toISOString().split("T")[0];
};

const EditEntryModal: React.FC<EditEntryModalProps> = ({
  isOpen,
  onOpenChange,
  entryToEdit,
  handleUpdateEntry,
}) => {
  const [editingEntry, setEditingEntry] = useState<Whitelist | null>(null);
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (isOpen && entryToEdit) {
      setEditingEntry(entryToEdit);
      setExpiryDate(entryToEdit.expiredDate ? formatDateForInput(entryToEdit.expiredDate) : "");
    } else if (!isOpen) {
      setEditingEntry(null);
      setExpiryDate("");
    }
  }, [isOpen, entryToEdit]);

  return (
    <Modal isOpen={isOpen && !!editingEntry} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) =>
          editingEntry && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Whitelist Entry
              </ModalHeader>
              <ModalBody>
                <div className="mb-4">
                  <div className="font-medium">
                    {editingEntry.fullName || "Unknown User"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {editingEntry.email || editingEntry.clientId}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    aria-label="Expiry Date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onOpenChange(false);
                    onClose();
                    setEditingEntry(null);
                    setExpiryDate("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="text-background"
                  color="primary"
                  onPress={() => {
                    if (editingEntry) {
                      handleUpdateEntry(editingEntry, expiryDate, onClose);
                    }
                  }}
                >
                  Update
                </Button>
              </ModalFooter>
            </>
          )
        }
      </ModalContent>
    </Modal>
  );
};

export default EditEntryModal; 