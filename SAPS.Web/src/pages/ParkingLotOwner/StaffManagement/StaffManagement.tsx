import React, { useState, useEffect } from 'react';
import DefaultLayout from "@/layouts/default";
import { useParkingLot } from '../ParkingLotContext';

import { User } from '@/types/User';
import type { PaginationInfo } from '@/types/Whitelist';
import { Accordion, AccordionItem, addToast, Button, ButtonGroup, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, PressEvent, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure, UseDisclosureProps } from '@heroui/react';
import { BarChart, Calendar, ClipboardList, Edit2, FolderSearch, InfoIcon, PlusIcon, RefreshCcw, Trash2, Users } from 'lucide-react';
import { addStaff, fetchStaffList, fetchStaffListStatus, removeStaff, updateStaff } from './StaffService';
import { useNavigate } from 'react-router-dom';

// thiếu dateof birth
export default function StaffManagement() {
    const { parkingLot, loading: parkingLotLoading } = useParkingLot();

    const [stafflist, setStafflist] = useState<User[]>([]);

    // loading for staff list
    const [loading, setLoading] = useState(true);
    // search for staff 
    const [searchTerm, setSearchTerm] = useState('');
    // search results for add staff
    const [searchResults, setSearchResults] = useState<User[]>([]);

    // user selected for add to 
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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


    const navigate = useNavigate();


    // Modal disclosure hooks
    const addModalDisclosure = useDisclosure();
    const editModalDisclosure = useDisclosure();
    const updateModalDisclosure = useDisclosure();

    const loadStaffList = async () => {
        if (!parkingLot?.id) return;

        setLoading(true);
        try {
            if (tableSearch != null && tableSearch.trim() !== '') {
                const response = await fetchStaffList(parkingLot.id, 6, currentPage, tableSearch);
                setStafflist(response.data);
                setPagination(response.pagination);
            } else {
                const response = await fetchStaffList(parkingLot.id, 6, currentPage);
                setStafflist(response.data);
                setPagination(response.pagination);
            }

        } catch (error) {
            console.error('Failed to load stafflist:', error);
        } finally {
            setLoading(false);
        }
    };


    // Search users
    const handleSearch = async (term: string) => {
        try {
            loadStaffList();
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };


    // Remove user from 
    const handleRemoveFromStaffList = async (staffId: string) => {
        if (!parkingLot?.id) return;

        if (window.confirm('Are you sure you want to remove this user ?')) {
            try {
                await removeStaff(parkingLot.id, staffId);
                loadStaffList(); // Refresh the list
            } catch (error) {
                console.error('Failed to remove from stafflist:', error);
            }
        }
    };

    const handleUpdateEntry = async (onClose?: () => void) => {
        if (!editingEntry || !parkingLot?.id) return;

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
    }, [parkingLot?.id, currentPage]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const formatDateForInput = (isoString: string) => {
        if (!isoString) return '';
        return isoString.split('T')[0]; // Gets just the yyyy-MM-dd part
    };

    function handleReset() {
        setTableSearch('');
        setCurrentPage(1);
        loadStaffList();
    }
    useEffect(() => {
        console.log(selectedUser);
    }, [selectedUser]);

    return (
        <DefaultLayout title="Staff List">
            <StaffListStatusComponent parkingLotId={parkingLot?.id || ''} loadparking={parkingLotLoading} />
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
                                        handleSearch(tableSearch);
                                    }
                                }}
                            />
                            <Button
                                size="sm"
                                onPress={() => handleSearch(tableSearch)}
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
                            isIconOnly
                        >
                        </Button>


                        <ButtonGroup isDisabled={selectedUser === null}>
                            <Button color='primary' className='text-background' size='sm' startContent={<ClipboardList size={16} />}
                                onPress={() => navigate(`/owner/staff/${parkingLot?.id}/${selectedUser?.staffProfile?.staffId}`)}>Detail</Button>
                            <Button color='secondary' className='text-background' size='sm'
                                onPress={() => updateModalDisclosure.onOpen()}
                                startContent={<Edit2 size={16} />}>Edit</Button>
                            <Button color='danger' className='text-background' size='sm' startContent={
                                <Trash2 size={16} />
                            }
                                onPress={() => handleRemoveFromStaffList(selectedUser?.staffProfile?.staffId || '')}
                            >Remove</Button>
                        </ButtonGroup>

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

            <AddStaffModal addModalDisclosure={addModalDisclosure} parkingLotId={parkingLot?.id || ''} />
            <UpdateStaffModal updateModalDisclosure={updateModalDisclosure} parkingLotId={parkingLot?.id || ''} user={selectedUser || null} />
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
};

function StaffListTable({ staffList, selectUser, setSelectUser }: StaffListTableProps) {
    // Example: useEffect to do something when selectUser changes


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
                selectionMode="single"
            >
                <TableHeader className="">
                    <TableColumn key="user" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff ID
                    </TableColumn>
                    <TableColumn key="addedDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                    </TableColumn>
                    <TableColumn key="expiryDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                    </TableColumn>
                    <TableColumn key="status" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
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
                                            <div className="text-sm text-gray-500">
                                                {entry.email || entry.staffProfile?.staffId}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell >
                                {/* email */}
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {entry.email}
                                </TableCell >
                                {/* created date */}
                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </TableCell >

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
}
function AddStaffModal({ addModalDisclosure, parkingLotId }: { addModalDisclosure: UseDisclosureProps, parkingLotId: string }) {

    const [formData, setFormData] = useState<AddStaffFormRequest>({
        fullName: '',
        email: 'staff@downtownmall.com',
        phone: '+1 (555) 123-4567',
        employeeId: 'EMP-2025-XXX',
        dateOfBirth: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    async function handleAddUser(e: PressEvent): Promise<void> {
        try {
            const response = await addStaff(parkingLotId, formData);
            console.log("succces", response);
            addModalDisclosure.onClose?.();

        } catch (error) {
            console.error('Error adding staff:', error);
            // Handle error (show toast notification, etc.)
            addToast({
                title: 'Error',
                description: 'Failed to add staff',
                color: 'danger',
            });
        }
    }

    return (
        <Modal size='xl' isOpen={addModalDisclosure.isOpen}>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-900" />
                            <h3 className="text-xl font-semibold text-primary-900">Personal Information</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="p-2">
                                {/* Personal Information Section */}
                                <div className="">
                                    {/* Full Name */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="Enter staff member's full name"
                                            className=""
                                        />
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className=""
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Will be used for login and notifications</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className=""
                                            />
                                        </div>
                                    </div>

                                    {/* Employee ID and Date of Birth */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Employee ID
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.employeeId}
                                                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                                className=""
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Optional - auto-generated if empty</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Date of Birth
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                    className=""
                                                />
                                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Optional - for HR records</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Setup Info */}
                                <Accordion>
                                    <AccordionItem key="1" aria-label="account-setup" title="Account Setup" startContent={<InfoIcon className='w-4 h-4 text-primary-900' />}>
                                        <div className="bg-cyan-50 border bordeir-cyan-200 rounded-lg p-4 ">
                                            <ul className=" text-sm text-primary-900/90">
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>System will auto-generate a secure temporary password</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Login credentials will be sent to the staff's email address</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Staff will be required to change password on first login</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Email will include desktop application download link and instructions</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Additional employment details can be configured after account creation</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </AccordionItem>

                                </Accordion>
                            </div>

                        </ModalBody>
                        <ModalFooter>
                            <Button color='danger' variant='light' className='' onPress={addModalDisclosure.onClose}>
                                Cancel
                            </Button>
                            <Button color='primary' className='text-background' onPress={handleAddUser}>
                                Add
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>


    )
}
function UpdateStaffModal({ updateModalDisclosure, parkingLotId, user }
    : { updateModalDisclosure: UseDisclosureProps, parkingLotId: string, user: User | null }) {


    const [formData, setFormData] = useState<AddStaffFormRequest>({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        employeeId: user?.staffProfile?.staffId || '',
        dateOfBirth: ''
    });
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user?.fullName || '',
                email: user?.email || '',
                phone: user?.phone || '',
                employeeId: user?.staffProfile?.staffId || '',
                dateOfBirth: ''
            });
        }
    }, [user]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    async function handleUpdateUser(e: PressEvent): Promise<void> {
        try {
            const response = await updateStaff(parkingLotId, formData);
            console.log("succces", response);
            updateModalDisclosure.onClose?.();

        } catch (error) {
            console.error('Error adding staff:', error);
            // Handle error (show toast notification, etc.)
            addToast({
                title: 'Error',
                description: 'Failed to add staff',
                color: 'danger',
            });
        }
    }

    return (
        <Modal size='xl' isOpen={updateModalDisclosure.isOpen}>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-900" />
                            <h3 className="text-xl font-semibold text-primary-900">Personal Information</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="p-2">
                                {/* Personal Information Section */}
                                <div className="">
                                    {/* Full Name */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="Enter staff member's full name"
                                            className=""
                                        />
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className=""
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Will be used for login and notifications</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className=""
                                            />
                                        </div>
                                    </div>

                                    {/* Employee ID and Date of Birth */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Employee ID
                                            </label>
                                            <Input
                                                isDisabled
                                                readOnly
                                                type="text"
                                                value={formData.employeeId}
                                                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                                className=""
                                            />
                                            {/* <p className="text-xs text-gray-500 mt-1">Optional - auto-generated if empty</p> */}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Date of Birth
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                    className=""
                                                />
                                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Optional - for HR records</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Setup Info */}
                                {/* <Accordion>
                                    <AccordionItem key="1" aria-label="account-setup" title="Account Setup" startContent={<InfoIcon className='w-4 h-4 text-primary-900' />}>
                                        <div className="bg-cyan-50 border bordeir-cyan-200 rounded-lg p-4 ">
                                            <ul className=" text-sm text-primary-900/90">
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>System will auto-generate a secure temporary password</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Login credentials will be sent to the staff's email address</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Staff will be required to change password on first login</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Email will include desktop application download link and instructions</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Additional employment details can be configured after account creation</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </AccordionItem>

                                </Accordion> */}
                            </div>

                        </ModalBody>
                        <ModalFooter>
                            <Button color='danger' variant='light' className='' onPress={updateModalDisclosure.onClose}>
                                Cancel
                            </Button>
                            <Button color='primary' className='text-background' onPress={handleUpdateUser}>
                                Add
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>


    )
}



