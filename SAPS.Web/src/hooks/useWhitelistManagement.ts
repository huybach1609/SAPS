import { useState, useEffect } from "react";
import type { Whitelist, PaginationInfo } from "@/types/Whitelist";
import type { User } from "@/types/User";
import {
  fetchWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  updateWhitelistEntry,
} from "@/services/parkinglot/whitelistService";

export function useWhitelistManagement(parkingLotId?: string) {
  const [whitelist, setWhitelist] = useState<Whitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Load whitelist data
  const loadWhitelist = async () => {
    if (!parkingLotId) return;

    setLoading(true);
    try {
      const response = await fetchWhitelist(
        parkingLotId,
        6,
        currentPage,
        tableSearch.trim() || "",
      );
      setWhitelist(response.items);
      setPagination({
        totalCount: response.totalCount,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage,
      });
    } catch (error) {
      console.error("Failed to load whitelist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add user to whitelist
  const handleAddToWhitelist = async (user: User, expiryDate: string): Promise<string | null> => {
    if (!parkingLotId) return "No parking lot selected.";

    try {
      await addToWhitelist(parkingLotId, user.id, expiryDate || undefined);
      await loadWhitelist();
      return null;
    } catch (error: any) {
      return error || "Failed to add to whitelist. Please try again.";
    }
  };

  // Remove user from whitelist
  const handleRemoveFromWhitelist = async (clientId: string) => {
    if (!parkingLotId) return;

    try {
      await removeFromWhitelist(parkingLotId, clientId);
      await loadWhitelist();
    } catch (error) {
      console.error("Failed to remove from whitelist:", error);
      throw error;
    }
  };

  // Update whitelist entry
  const handleUpdateEntry = async (updatedEntry: Whitelist, expiryDate: string) => {
    if (!updatedEntry || !parkingLotId) return;

    try {
      await updateWhitelistEntry(parkingLotId, updatedEntry.clientId, expiryDate || undefined);
      await loadWhitelist();
    } catch (error) {
      console.error("Failed to update whitelist entry:", error);
      throw error;
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadWhitelist();
  };

  const handleReset = () => {
    setTableSearch("");
    setCurrentPage(1);
  };

  useEffect(() => {
    loadWhitelist();
  }, [parkingLotId, currentPage]);

  return {
    // State
    whitelist,
    loading,
    pagination,
    tableSearch,
    currentPage,
    
    // Actions
    setTableSearch,
    setCurrentPage,
    loadWhitelist,
    handleAddToWhitelist,
    handleRemoveFromWhitelist,
    handleUpdateEntry,
    handleSearch,
    handleReset,
  };
}