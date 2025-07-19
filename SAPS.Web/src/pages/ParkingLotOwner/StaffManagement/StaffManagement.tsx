import React, { useState, useEffect } from 'react';
import DefaultLayout from "@/layouts/default";
import { useParkingLot } from '../ParkingLotContext';

import { StaffStatus, User } from '@/types/User';
import type { PaginationInfo } from '@/types/Whitelist';
import { Button, Card, CardBody, CardHeader, DropdownMenu, DropdownTrigger, DropdownItem, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure, UseDisclosureProps, Dropdown } from '@heroui/react';
import { BarChart, EllipsisVertical, FolderSearch, PlusIcon, RefreshCcw } from 'lucide-react';
// import { fetchStaffList, fetchStaffListStatus, removeStaff } from '../../../services/parkinglot/StaffService';
import { useNavigate } from 'react-router-dom';
import { ParkingLot } from '@/types/ParkingLot';
import { formatPhoneNumber } from '@/components/utils/stringUtils';
import { StaffStatusBadge } from '@/components/utils/staffUtils';
import { AddStaffModal, UpdateStaffModal } from './StaffModal';
import { fetchStaffList, fetchStaffListStatus, removeStaff } from '@/services/parkinglot/staffService';
// import { fetchStaffList, fetchStaffListStatus, removeStaff } from '@/services/parkinglot/StaffService';

// thiếu dateof birth
export default function StaffManagement() {
    const { selectedParkingLot, loading: parkingLotLoading } = useParkingLot();

    const [stafflist, setStafflist] = useState<User[]>([]);

    // loading for staff list
    const [loading, setLoading] = useState(true);
    // user selected for add to 
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    // expiry date for input modal
    const [expiryDate, setExpiryDate] = useState('');

    // edit for update 
    const [editingEntry, setEditingEntry] = useState<User | null>(null);
    // pagination for staff list
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    // pagination for staff list
    const [currentPage, setCurrentPage] = useState(1);

    // search for search & add field
    const [tableSearch, setTableSearch] = useState('');
    // status filter for staff
    const [statusFilter, setStatusFilter] = useState<string>('');

    // const navigate = useNavigate();

    // Modal disclosure hooks
    const addModalDisclosure = useDisclosure();
    const editModalDisclosure = useDisclosure();
    const updateModalDisclosure = useDisclosure();

    const loadStaffList = async () => {
        if (!selectedParkingLot?.id) return;

        setLoading(true);
        try {
            let response;
            const statusParam = statusFilter === '' ? undefined : Number(statusFilter);

            if (tableSearch != null && tableSearch.trim() !== '') {
                response = await fetchStaffList(selectedParkingLot.id, 6, currentPage, tableSearch, statusParam);
            } else {
                response = await fetchStaffList(selectedParkingLot.id, 6, currentPage, undefined, statusParam);
            }
            setStafflist(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to load stafflist:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search users
    const handleSearch = async () => {
        try {
            loadStaffList();
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    // Remove user from 
    const handleRemoveFromStaffList = async (staffId: string) => {
        if (!selectedParkingLot?.id) return;

        if (window.confirm('Are you sure you want to remove this user ?')) {
            try {
                await removeStaff(selectedParkingLot.id, staffId);
                loadStaffList(); // Refresh the list
            } catch (error) {
                console.error('Failed to remove from stafflist:', error);
            }
        }
    };

    const handleUpdateEntry = async (onClose?: () => void) => {
        if (!editingEntry || !selectedParkingLot?.id) return;

        try {
            if (onClose) onClose();
            setEditingEntry(null);
            setExpiryDate('');
            loadStaffList(); // Refresh the list
        } catch (error) {
            console.error('Failed to update stafflist  entry:', error);
        }
    };

    useEffect(() => {
        loadStaffList();
    }, [selectedParkingLot?.id, currentPage, statusFilter]);

    const formatDateForInput = (isoString: string) => {
        if (!isoString) return '';
        return isoString.split('T')[0]; // Gets just the yyyy-MM-dd part
    };

    function handleReset() {
        setTableSearch('');
        setStatusFilter('');
        setCurrentPage(1);
        loadStaffList();
    }


    return (
        <DefaultLayout title="Staff List">
            <StaffListStatusComponent parkingLotId={selectedParkingLot?.id || ''} loadparking={parkingLotLoading} />
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
                                type="text"
                                value={tableSearch}
                                onChange={e => setTableSearch(e.target.value)}
                                placeholder="Search by name, email, or ID..."
                                className="w-1/2"
                                size="sm"
                                color='primary'
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                            {/* Status Filter Dropdown */}
                            <Select
                                aria-label="Filter by Status"
                                placeholder="All Statuses"
                                className="w-40"
                                size="sm"
                                color='primary'
                                selectedKeys={statusFilter === '' ? new Set() : new Set([statusFilter])}
                                onSelectionChange={keys => {
                                    const val = Array.from(keys)[0]?.toString() ?? '';
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                    // Optionally trigger search immediately
                                    loadStaffList();
                                }}
                            >
                                <SelectItem key="">All</SelectItem>
                                <SelectItem key={StaffStatus.ACTIVE}>Active</SelectItem>
                                <SelectItem key={StaffStatus.ON_LEAVE}>On Leave</SelectItem>
                                <SelectItem key={StaffStatus.SUSPENDED}>Suspended</SelectItem>
                                <SelectItem key={StaffStatus.TERMINATED}>Terminated</SelectItem>
                            </Select>
                            <Button
                                size="sm"
                                onPress={() => handleSearch()}
                                color='primary'
                                className="text-background"
                            >
                                Search
                            </Button>
                            <Button
                                size="sm"
                                onPress={() => handleReset()}
                                color='primary'
                                className="text-background"
                                isIconOnly
                            >
                                <RefreshCcw size={16} />
                            </Button>

                        </div>
                        <Button
                            onPress={addModalDisclosure.onOpen}
                            startContent={<PlusIcon size={16} />}
                            radius="sm"
                            size="sm"
                            color='secondary'
                            className='text-background'
                        >
                            Add Staff
                        </Button>
                    </div>

                </CardBody>
            </Card>

            {/*  Table */}
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
                        updateModalDisclosure={updateModalDisclosure}
                        handleRemoveFromStaffList={handleRemoveFromStaffList}
                    />
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm ">
                        Showing page {pagination.currentPage} of {pagination.totalPages}
                        ({pagination.totalItems} total items)
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            onPress={() => {
                                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                            }}
                            disabled={!pagination.hasPreviousPage || parkingLotLoading}
                            className=""
                        >
                            Previous
                        </Button>
                        <Pagination color="secondary" className='text-white' page={pagination.currentPage} total={pagination.totalPages} onChange={setCurrentPage} isDisabled={parkingLotLoading} />
                        <Button
                            onPress={() => {
                                setCurrentPage((prev) => (prev < pagination.totalPages ? prev + 1 : prev))
                            }}
                            disabled={!pagination.hasNextPage || parkingLotLoading}
                            className=""
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <AddStaffModal addModalDisclosure={addModalDisclosure} parkingLotId={selectedParkingLot?.id || ''} />
            <UpdateStaffModal updateModalDisclosure={updateModalDisclosure} parkingLotId={selectedParkingLot?.id || ''} user={selectedUser || null} />
            {/* Edit Entry Modal */}
            <Modal isOpen={editModalDisclosure.isOpen && !!editingEntry} onOpenChange={editModalDisclosure.onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        editingEntry && (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Edit Staff Entry</ModalHeader>
                                <ModalBody>
                                    <div className="mb-4">
                                        <div className="font-medium">{editingEntry.fullName || 'Unknown User'}</div>
                                        <div className="text-sm text-gray-600">{editingEntry.email || editingEntry.staffProfile?.staffId}</div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateForInput(expiryDate)}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => {
                                            onClose();
                                            setEditingEntry(null);
                                            setExpiryDate('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        className='text-background'
                                        onPress={() => handleUpdateEntry(onClose)}
                                    >
                                        Update
                                    </Button>
                                </ModalFooter>
                            </>
                        )
                    )}
                </ModalContent>
            </Modal>

        </DefaultLayout>
    );
}

type StaffListTableProps = {
    staffList: User[];
    selectUser: User | null;
    setSelectUser: React.Dispatch<React.SetStateAction<User | null>>;
    parkingLot: ParkingLot | null;
    updateModalDisclosure: UseDisclosureProps;
    handleRemoveFromStaffList: (staffId: string) => void;
};

function StaffListTable({ staffList, selectUser, setSelectUser, parkingLot, updateModalDisclosure, handleRemoveFromStaffList }: StaffListTableProps) {
    // Example: useEffect to do something when selectUser changes
    const navigate = useNavigate();
    return (
        <div className="overflow-x-auto">
            <div className="flex justify-between mb-4">
                <div className='text-lg font-bold'></div>

            </div>
            <Table aria-label="Staff Table" className=""
                color='secondary'
                selectedKeys={selectUser ? [selectUser.staffProfile?.staffId || ''] : []}
                onSelectionChange={(keys) => {
                    if (typeof keys === 'string') { // Handle "all" selection
                        setSelectUser(null);
                        return;
                    }
                    const [selectedid] = keys;
                    const staff = staffList.find((s) => s.staffProfile?.staffId === selectedid);
                    setSelectUser(staff || null);
                }}
            // selectionMode="single"
            >
                <TableHeader className="">
                    <TableColumn key="user" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff ID
                    </TableColumn>
                    <TableColumn key="addedDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                    </TableColumn>
                    <TableColumn key="expiryDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email & Phone
                    </TableColumn>
                    <TableColumn key="createdAt" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                    </TableColumn>
                    <TableColumn key="status" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </TableColumn>
                    <TableColumn key="action" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </TableColumn>
                </TableHeader>
                <TableBody >
                    {staffList.map((entry) => {
                        return (
                            <TableRow key={`${entry.staffProfile?.staffId}`}>
                                {/* staffid */}
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {entry.staffProfile?.staffId}
                                </TableCell >
                                {/* name */}
                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-4">

                                            <div className="text-sm font-medium ">
                                                {entry.fullName || 'Unknown User'}
                                            </div>
                                            {/* <div className="text-sm text-gray-500">
                                                {entry.email || entry.staffProfile?.staffId}
                                            </div> */}
                                        </div>
                                    </div>
                                </TableCell >
                                {/* email */}
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {entry.email}
                                    <div className="text-sm text-gray-500">
                                        {entry.phone ? formatPhoneNumber(entry.phone) : 'No phone'}
                                    </div>
                                </TableCell >
                                {/* created date */}
                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                    {new Date(entry.createdAt).toLocaleDateString()}

                                </TableCell >
                                <TableCell >
                                    <StaffStatusBadge status={entry.staffProfile?.status || 0} />

                                </TableCell>
                                <TableCell >
                                    <Dropdown className='mx-auto'>
                                        <DropdownTrigger>
                                            <Button variant='light' isIconOnly> <EllipsisVertical size={16} /></Button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="action" >

                                            <DropdownItem key="detail" onPress={() => navigate(`/owner/staff/${parkingLot?.id}/${entry?.staffProfile?.staffId}`)}>
                                                Detail
                                            </DropdownItem>
                                            <DropdownItem key="update" onPress={() => {
                                                setSelectUser(entry);
                                                updateModalDisclosure.onOpen?.();
                                            }}>
                                                Update
                                            </DropdownItem>

                                            <DropdownItem key="delete" className="text-danger" color="danger"
                                                onPress={() => handleRemoveFromStaffList(entry?.staffProfile?.staffId || '')}
                                            >
                                                Deactivate
                                            </DropdownItem>

                                        </DropdownMenu>
                                    </Dropdown>
                                </TableCell>

                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
export interface staffListStatus {
    totalOwner: number;
    activeOwner: number;
    pendingApproval: number;
}
function StaffListStatusComponent({ parkingLotId, loadparking }: { parkingLotId: string, loadparking: boolean }) {
    const [staffListStatus, setStaffListStatus] = useState<staffListStatus | null>(null);


    const fetch = async () => {
        const status = await fetchStaffListStatus(parkingLotId);
        setStaffListStatus(status);
    };

    useEffect(() => {
        if (!loadparking) {
            fetch();
        }
    }, [loadparking]);


    return (

        <Card className="bg-background-100/20 mb-6">
            <CardHeader className="flex items-center gap-2">
                <BarChart className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-bold">Staff List Status</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-900 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{staffListStatus?.totalOwner}</p>
                    <p className="text-sm">Total Owner</p>
                </div>
                <div className="bg-primary-900/80 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{staffListStatus?.activeOwner}</p>
                    <p className="text-sm">Active Onwer</p>
                </div>
                <div className="bg-primary-900/70 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{staffListStatus?.pendingApproval}</p>
                    <p className="text-sm">Pending Approval</p>
                </div>
            </CardBody>
        </Card>
    );

}

export interface AddStaffFormRequest {
    fullName: string;
    email: string;
    phone: string;
    employeeId: string;
    dateOfBirth: string;
    status: number;
}

// Status options for the select dropdown
export const statusOptions = [
    { key: StaffStatus.ACTIVE.toString(), label: 'Active' },
    { key: StaffStatus.ON_LEAVE.toString(), label: 'On Leave' },
    { key: StaffStatus.SUSPENDED.toString(), label: 'Suspended' },
    { key: StaffStatus.TERMINATED.toString(), label: 'Terminated' }
];

