import { useState, useEffect } from 'react';
import { StaffStatus, User } from '@/types/User';
import { PaginationInfo } from '@/types/Whitelist';
import { fetchStaffList, removeStaff, updateStaff } from '@/services/parkinglot/staffService';

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

  const handleDeactivateStaff = async (staffId: string, user: User) => {
    if (!parkingLotId) return;

    if (window.confirm('Are you sure you want to deactivate this user ?')) {
      try {
        // Create the update request with the required fields
        const updateRequest = {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          employeeId: user.staffProfile?.staffId || '',
          dateOfBirth: '',
          status: StaffStatus.TERMINATED
        };
        
        await updateStaff(parkingLotId, updateRequest);
        

       loadStaffList();
        // // Update the local state instead of refetching
        // setStafflist(prevStaffList => 
        //   prevStaffList.map(staff => 
        //     staff.id === staffId 
        //       ? { 
        //           ...staff, 
        //           staffProfile: staff.staffProfile 
        //             ? { ...staff.staffProfile, status: StaffStatus.TERMINATED }
        //             : undefined 
        //         }
        //       : staff
        //   )
        // );
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