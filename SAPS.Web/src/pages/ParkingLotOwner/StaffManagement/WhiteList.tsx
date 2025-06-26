import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from "@/layouts/default";
import { useParkingLot } from '../ParkingLotContext';
// import {
//     fetchWhitelist,
//     addToWhitelist,
//     removeFromWhitelist,
//     updateWhitelistEntry,
//     WhitelistStatus,
//     fetchWhitelistStatus,
//     SearchWhitelist
// } from '@/services/parkinglot/whitelistService';
import { title } from '@/components/primitives';
import { User } from '@/types/User';
import type { Whitelist, PaginationInfo } from '@/types/Whitelist';
import { Button, ButtonGroup, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react';
import { AlertCircle, BarChart, Check, Download, Edit2, FileText, FolderSearch, FunctionSquareIcon, PlusIcon, RefreshCcw, Trash2, Upload, Users } from 'lucide-react';
import { apiUrl } from '@/config/base';

export default function Whitelist() {
    const { parkingLot, loading: parkingLotLoading } = useParkingLot();

    const [stafflist, setStafflist] = useState<User[]>([]);

    // loading for staff list
    const [loading, setLoading] = useState(true);
    // search for staff 
    const [searchTerm, setSearchTerm] = useState('');
    // search results for add staff
    const [searchResults, setSearchResults] = useState<User[]>([]);
    // user selected for add to whitelist
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    // expiry date for input modal
    const [expiryDate, setExpiryDate] = useState('');
    // edit for update whitelist 
    const [editingEntry, setEditingEntry] = useState<Whitelist | null>(null);
    // pagination for staff list
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    // search for search & add field
    const [tableSearch, setTableSearch] = useState('');


    // pagination for staff list
    const [currentPage, setCurrentPage] = useState(1);


    // Modal disclosure hooks
    const addModalDisclosure = useDisclosure();
    const editModalDisclosure = useDisclosure();
    const addFileModalDisclosure = useDisclosure();

    // Fetch whitelist data
    const loadWhitelist = async () => {
        if (!parkingLot?.id) return;

        setLoading(true);
        try {
            if (tableSearch != null && tableSearch.trim() !== '') {
                const response = await fetchWhitelist(parkingLot.id, 6, currentPage, tableSearch);
                setWhitelist(response.data);
                setPagination(response.pagination);
            } else {
                const response = await fetchWhitelist(parkingLot.id, 6, currentPage);
                setWhitelist(response.data);
                setPagination(response.pagination);
            }

        } catch (error) {
            console.error('Failed to load whitelist:', error);
        } finally {
            setLoading(false);
        }
    };


    // Search users
    const handleSearch = async (term: string) => {
        try {
            loadWhitelist();
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    // Add user to whitelist
    const handleAddToWhitelist = async (onClose?: () => void) => {
        if (!selectedUser || !parkingLot?.id) return;

        try {
            await addToWhitelist(parkingLot.id, selectedUser.id, expiryDate || undefined);
            if (onClose) onClose();
            setSelectedUser(null);
            setExpiryDate('');
            setSearchTerm('');
            setSearchResults([]);
            loadWhitelist(); // Refresh the list
        } catch (error) {
            console.error('Failed to add to whitelist:', error);
        }
    };

    // Remove user from whitelist
    const handleRemoveFromWhitelist = async (clientId: string) => {
        if (!parkingLot?.id) return;

        if (window.confirm('Are you sure you want to remove this user from the whitelist?')) {
            try {
                await removeFromWhitelist(parkingLot.id, clientId);
                loadWhitelist(); // Refresh the list
            } catch (error) {
                console.error('Failed to remove from whitelist:', error);
            }
        }
    };

    // Update whitelist entry
    const handleUpdateEntry = async (onClose?: () => void) => {
        if (!editingEntry || !parkingLot?.id) return;

        try {
            await updateWhitelistEntry(parkingLot.id, editingEntry.clientId, {
                expiredDate: expiryDate || undefined
            });
            if (onClose) onClose();
            setEditingEntry(null);
            setExpiryDate('');
            loadWhitelist(); // Refresh the list
        } catch (error) {
            console.error('Failed to update whitelist entry:', error);
        }
    };

    // Open edit modal
    const openEditModal = (entry: Whitelist) => {
        setEditingEntry(entry);
        setExpiryDate(entry.expiredDate || '');
        editModalDisclosure.onOpen();
    };

    useEffect(() => {
        loadWhitelist();
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
        loadWhitelist();
    }

    return (
        <DefaultLayout title="Whitelist">
            <div className="max-w-7xl mx-auto p-6">
                <WhitelistStatusComponent parkingLotId={parkingLot?.id || ''} loadparking={parkingLotLoading} />


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
                            <ButtonGroup>
                                <Button
                                    onPress={addModalDisclosure.onOpen}
                                    startContent={<PlusIcon size={16} />}
                                    radius="sm"
                                    size="sm"
                                    color='secondary'
                                    className='text-background'
                                >
                                    Add User
                                </Button>
                                <Button
                                    color='success'
                                    className='text-background'
                                    startContent={<Users size={16} />}
                                    radius="sm"
                                    size="sm"
                                    onPress={addFileModalDisclosure.onOpen}
                                >
                                    Add File
                                </Button>


                            </ButtonGroup>

                        </div>

                    </CardBody>
                </Card>

                {/* Whitelist Table */}
                <div className="min-h-[70vh]">
                    {(parkingLotLoading || loading) ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner />
                        </div>
                    ) : whitelist.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No users in whitelist yet.</p>
                        </div>
                    ) : (
                        <WhitelistTable
                            whitelist={whitelist}
                            openEditModal={openEditModal}
                            handleRemoveFromWhitelist={handleRemoveFromWhitelist}
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

                {/* Add User Modal */}
                <Modal isOpen={addModalDisclosure.isOpen} onOpenChange={addModalDisclosure.onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    Add User to Whitelist

                                    <p className='text-sm text-gray-500'>Search user by Citizen ID and add to parking whitelist</p>

                                </ModalHeader>
                                <ModalBody>
                                    {/* Search Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search Users
                                        </label>

                                        <Input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className=""
                                        />
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                                            {searchResults.map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => setSelectedUser(user)}
                                                    className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                                >
                                                    <div className="font-medium">{user.fullName}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selected User */}
                                    {selectedUser && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-md">
                                            <div className="font-medium">Selected: {selectedUser.fullName}</div>
                                            <div className="text-sm text-gray-600">{selectedUser.email}</div>
                                        </div>
                                    )}

                                    {/* Expiry Date */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Expiry Date (Optional)
                                        </label>
                                        <Input
                                            type="date"
                                            value={formatDateForInput(expiryDate)}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            className=""
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => {
                                            onClose();
                                            setSelectedUser(null);
                                            setSearchTerm('');
                                            setSearchResults([]);
                                            setExpiryDate('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        className='text-background'
                                        onPress={() => handleAddToWhitelist(onClose)}
                                        disabled={!selectedUser}
                                    >
                                        Add to Whitelist
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {/* Edit Entry Modal */}
                <Modal isOpen={editModalDisclosure.isOpen && !!editingEntry} onOpenChange={editModalDisclosure.onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            editingEntry && (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">Edit Whitelist Entry</ModalHeader>
                                    <ModalBody>
                                        <div className="mb-4">
                                            <div className="font-medium">{editingEntry.client?.fullName || 'Unknown User'}</div>
                                            <div className="text-sm text-gray-600">{editingEntry.client?.email || editingEntry.clientId}</div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Add File Modal */}
                <AddFileModal addFileModalDisclosure={addFileModalDisclosure} parkingLotId={parkingLot?.id || ''} />
            </div>
        </DefaultLayout>
    );
}
// Pass openEditModal and handleRemoveFromWhitelist as props from the parent component
type WhitelistTableProps = {
    whitelist: Whitelist[];
    openEditModal: (entry: Whitelist) => void;
    handleRemoveFromWhitelist: (clientId: string) => void;
};

function WhitelistTable({ whitelist, openEditModal, handleRemoveFromWhitelist }: WhitelistTableProps) {
    return (
        <div className="overflow-x-auto">
            <Table aria-label="Whitelist Table" className="" >
                <TableHeader className="">
                    <TableColumn key="user" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                    </TableColumn>
                    <TableColumn key="addedDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added Date
                    </TableColumn>
                    <TableColumn key="expiryDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                    </TableColumn>
                    <TableColumn key="status" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </TableColumn>
                    <TableColumn key="actions" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </TableColumn>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                    {whitelist.map((entry) => {
                        const isExpired = entry.expiredDate && new Date(entry.expiredDate) < new Date();
                        const isActive = !entry.expiredDate || !isExpired;

                        return (
                            <TableRow key={`${entry.parkingLotId}-${entry.clientId}`}>
                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            {entry.client?.profileImageUrl ? (
                                                <img
                                                    src={entry.client.profileImageUrl}
                                                    alt="Profile"
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-gray-600 font-medium">
                                                    {entry.client?.fullName?.charAt(0) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {entry.client?.fullName || 'Unknown User'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {entry.client?.email || entry.clientId}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell >
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(entry.addedDate).toLocaleDateString()}
                                </TableCell >
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {entry.expiredDate ?
                                        new Date(entry.expiredDate).toLocaleDateString() :
                                        'No expiry'
                                    }
                                </TableCell >
                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {isActive ? 'Active' : 'Expired'}
                                    </span>
                                </TableCell >
                                <TableCell >
                                    <Button
                                        isIconOnly
                                        onPress={() => openEditModal(entry)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                        variant='light'
                                        startContent={<Edit2 className="w-4 h-4" />}
                                    >
                                    </Button>
                                    <Button
                                        isIconOnly
                                        variant='light'
                                        onPress={() => handleRemoveFromWhitelist(entry.clientId)}
                                        className="text-red-600 hover:text-red-900"
                                        startContent={<Trash2 className="w-4 h-4" />}
                                    >
                                    </Button>
                                </TableCell >
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
function WhitelistStatusComponent({ parkingLotId, loadparking }: { parkingLotId: string, loadparking: boolean }) {
    const [whitelistStatus, setWhitelistStatus] = useState<WhitelistStatus | null>(null);


    const fetch = async () => {
        const status = await fetchWhitelistStatus(parkingLotId);
        setWhitelistStatus(status);
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
                <h2 className="text-lg font-bold">Whitelist Status</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-900 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{whitelistStatus?.tottalWhitelistUsers}</p>
                    <p className="text-sm">Total Whitelisted Users</p>
                </div>
                <div className="bg-primary-900/80 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{whitelistStatus?.activeUser}</p>
                    <p className="text-sm">Active Today</p>
                </div>
                <div className="bg-primary-900/70 text-background p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold">{whitelistStatus?.expiringThisWeek}</p>
                    <p className="text-sm">Expiring This Week</p>
                </div>
            </CardBody>
        </Card>
    );

}

// interface UploadUserListCardProps { }
