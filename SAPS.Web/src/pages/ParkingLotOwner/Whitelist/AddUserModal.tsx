import { Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner} from "@heroui/react";
import { User } from "@/types/User";
import React, { useState, useEffect } from "react";
import { searchUser } from "@/services/parkinglot/whitelistService";

interface AddUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToWhitelist: (user: User, expiryDate: string) => Promise<string | null>;
  parkingLotId: string;
}

const formatDateForInput = (isoString: string) => {
  if (!isoString) return "";
  return isoString.split("T")[0];
};

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onOpenChange,
  onAddToWhitelist,
  parkingLotId = '',
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // handle search user from add user modal
  useEffect(() => {
    const handleSearchUser = async (term: string) => {
      setLoading(true);
      try {
        const user = await searchUser(term);
        setSearchResults(user ? [user] : []);
      } catch (error) {
        console.error("Failed to search users:", error);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearchUser(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, parkingLotId]);



  const handleAdd = async (onClose: () => void) => {
    setError("");
    if (!selectedUser) return;
    const result = await onAddToWhitelist(selectedUser, expiryDate);

    if (result) {
      setError(result);
    } else {
      onOpenChange(false);
      onClose();
      setSearchTerm("");
      setSearchResults([]);
      setSelectedUser(null);
      setExpiryDate("");
      setError("");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // onClose();
    setSearchTerm("");
    setSearchResults([]);
    setSelectedUser(null);
    setExpiryDate("");
    setError("");
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add User to Whitelist
              <p className="text-sm text-gray-500">
                Search user by Citizen ID and add to parking whitelist
              </p>
            </ModalHeader>
            <ModalBody>
              {/* Error Message */}
              {error && (
                <div className="mb-2 text-red-500 text-sm">{error}</div>
              )}
              {/* Search Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <Input
                  data-testid="input-name-or-email"
                  placeholder="Search by name or email..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Search Results */}
              {loading ? (
                // if loading
                <div className="flex justify-center items-center mb-4"><Spinner size="sm" /></div>
              ) : searchResults.length > 0 ? (
                <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 text-sm text-gray-500">No results found</div>
              )}
              {/* Selected User */}
              {selectedUser && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="font-medium">
                    Selected: {selectedUser.fullName}
                  </div>
                  <div className="text-sm text-gray-600">{selectedUser.email}</div>
                </div>
              )}
              {/* Expiry Date */}
              <div className="mb-4">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formatDateForInput(expiryDate)}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                data-testid="button-cancel"
                color="danger"
                variant="light"
                onPress={() => handleCancel()}
              >
                Cancel
              </Button>
              <Button
                data-testid="button-add-to-whitelist"
                className="text-background"
                color="primary"
                disabled={!selectedUser}
                onPress={() => handleAdd(onClose)}
              >
                Add to Whitelist
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal >
  );
};

export default AddUserModal; 