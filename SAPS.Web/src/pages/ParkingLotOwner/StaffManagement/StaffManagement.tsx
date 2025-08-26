import { useState } from 'react';
import DefaultLayout from "@/layouts/default";
import { useParkingLot } from '../ParkingLotContext';
import { User } from '@/types/User';
import { Button, Pagination, Spinner, useDisclosure } from '@heroui/react';
import { AddStaffModal, UpdateStaffModal } from './StaffModal';
import { useStaffManagement } from '@/hooks/useStaffManagement';
import { StaffSearchAndAdd } from './components/StaffSearchAndAdd';
import { StaffListTable } from './components/StaffListTable';
// import { StaffListStatusComponent } from './components/StaffListStatusComponent';

export default function StaffManagement() {
    const { selectedParkingLot, loading: parkingLotLoading } = useParkingLot();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);


    const {
        stafflist,
        loading,
        pagination,
        tableSearch,
        statusFilter,
        setCurrentPage,
        setTableSearch,
        setStatusFilter,
        loadStaffList,
        handleSearch,
        // handleDeactivateStaff,
        handleReset,
    } = useStaffManagement(selectedParkingLot?.id);

    // Modal disclosure hooks
    const addModalDisclosure = useDisclosure();
    const updateModalDisclosure = useDisclosure();

   

    return (
        <DefaultLayout title="Staff List" className="mt-5">
            {/* <StaffListStatusComponent
                parkingLotId={selectedParkingLot?.id || ''}
                loadparking={parkingLotLoading}
            /> */}

            <StaffSearchAndAdd
                tableSearch={tableSearch}
                setTableSearch={setTableSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                setCurrentPage={setCurrentPage}
                handleSearch={handleSearch}
                handleReset={handleReset}
                onAddStaffer={addModalDisclosure.onOpen}
                loadStaffList={loadStaffList}
            />

            {/* Staff List Content */}
            <div className="min-h-[70vh]">
                {(parkingLotLoading || loading) ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                ) : stafflist.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No staff yet.</p>
                    </div>
                ) : (
                    <StaffListTable
                        staffList={stafflist}
                        selectUser={selectedUser}
                        setSelectUser={setSelectedUser}
                        parkingLot={selectedParkingLot}
                        // updateModalDisclosure={updateModalDisclosure}
                        // handleDeactivateStaff={handleDeactivateStaff}
                    />
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm">
                        Showing page {pagination.pageNumber} of {pagination.totalPages}
                        ({pagination.totalCount} total items)
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            onPress={() => {
                                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                            }}
                            disabled={!pagination.hasPreviousPage || parkingLotLoading}
                        >
                            Previous
                        </Button>
                        <Pagination
                            color="secondary"
                            className="text-white"
                            page={pagination.pageNumber}
                            total={pagination.totalPages}
                            onChange={setCurrentPage}
                            isDisabled={parkingLotLoading}
                        />
                        <Button
                            onPress={() => {
                                setCurrentPage((prev) => (prev < pagination.totalPages ? prev + 1 : prev))
                            }}
                            disabled={!pagination.hasNextPage || parkingLotLoading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <AddStaffModal
                addModalDisclosure={addModalDisclosure}
                parkingLotId={selectedParkingLot?.id || ''}
            />
            <UpdateStaffModal
                updateModalDisclosure={updateModalDisclosure}
                parkingLotId={selectedParkingLot?.id || ''}
                user={selectedUser || null}
            />

         
        </DefaultLayout>
    );
}
