import { useState, useEffect } from 'react';
import { UserStatus, User } from '@/types/User';
import { fetchStaffList,  updateStaff } from '@/services/parkinglot/staffService';

interface PaginationData {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const useStaffManagement = (parkingLotId: string | undefined) => {
  const [stafflist, setStafflist] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadStaffList = async () => {
    if (!parkingLotId) return;

    setLoading(true);
    try {
      let response;
      const statusParam = statusFilter === '' ? '' : statusFilter;

      if (tableSearch != null && tableSearch.trim() !== '') {
        response = await fetchStaffList(parkingLotId, 6, currentPage, tableSearch, statusParam);
      } else {
        response = await fetchStaffList(parkingLotId, 6, currentPage,"" , statusParam);
      }
      setStafflist(response.items);
      setPagination({
        totalCount: response.totalCount,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage
      });
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

  const handleDeactivateStaff = async ( user: User) => {
    if (!parkingLotId) return;

    if (window.confirm('Are you sure you want to deactivate this user ?')) {
      try {
        // Create the update request with the required fields
        const updateRequest = {
          fullName: user.fullName,
          email: user.email,
          phone: user.phoneNumber,
          employeeId: user.staffProfile?.staffId || '',
          dateOfBirth: '',
          status: UserStatus.INACTIVE
        };
        console.log("updateRequest", updateRequest);
        await updateStaff(parkingLotId, updateRequest);
        

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
    handleDeactivateStaff,
    handleReset,
  };
};