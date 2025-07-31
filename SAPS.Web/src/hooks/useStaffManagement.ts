import { useState, useEffect } from 'react';
import { User } from '@/types/User';
import { PaginationInfo } from '@/types/Whitelist';
import { fetchStaffList, removeStaff } from '@/services/parkinglot/staffService';

export const useStaffManagement = (parkingLotId: string | undefined) => {
  const [stafflist, setStafflist] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadStaffList = async () => {
    if (!parkingLotId) return;

    setLoading(true);
    try {
      let response;
      const statusParam = statusFilter === '' ? undefined : Number(statusFilter);

      if (tableSearch != null && tableSearch.trim() !== '') {
        response = await fetchStaffList(parkingLotId, 6, currentPage, tableSearch, statusParam);
      } else {
        response = await fetchStaffList(parkingLotId, 6, currentPage, undefined, statusParam);
      }
      setStafflist(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load stafflist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      loadStaffList();
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleRemoveFromStaffList = async (staffId: string) => {
    if (!parkingLotId) return;

    if (window.confirm('Are you sure you want to deactivate this user ?')) {
      try {
        await removeStaff(parkingLotId, staffId);
        loadStaffList();
      } catch (error) {
        console.error('Failed to deactivate user:', error);
      }
    }
  };

  const handleReset = () => {
    setTableSearch('');
    setStatusFilter('');
    setCurrentPage(1);
    loadStaffList();
  };

  useEffect(() => {
    loadStaffList();
  }, [parkingLotId, currentPage, statusFilter]);

  return {
    stafflist,
    loading,
    pagination,
    currentPage,
    tableSearch,
    statusFilter,
    setCurrentPage,
    setTableSearch,
    setStatusFilter,
    loadStaffList,
    handleSearch,
    handleRemoveFromStaffList,
    handleReset,
  };
};