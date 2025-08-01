import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Car, DollarSign, Edit2, BikeIcon, ChartNoAxesColumn } from 'lucide-react';
import DefaultLayout from '@/layouts/default';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, ButtonGroup, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, addToast, Tabs, Tab } from '@heroui/react';
import { FeeScheduleModal, VehicleTypeText } from './FeeScheduleModal';
import { useParkingLot } from '../ParkingLotContext';
import {
    fetchFeeSchedules,
    createFeeSchedule,
    updateFeeSchedule,
    deleteFeeSchedule,
    type ParkingFeeSchedule,
    VehicleType,
    ParkingFeeError
} from '@/services/parkinglot/parkinglotFeeService';
import ParkingFeeWeeklyView from './ParkingFeeWeeklyView';


const ParkingFeeManagement: React.FC = () => {
    const [feeSchedules, setFeeSchedules] = useState<ParkingFeeSchedule[]>([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ParkingFeeSchedule | null>(null);
    const { selectedParkingLot, loading } = useParkingLot();

    const [loadingFeeSchedules, setLoadingFeeSchedules] = useState(false);

    // Error modal state
    const [errorModal, setErrorModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        messages?: string[]; // <-- add this
        type: 'error' | 'warning' | 'success';
    }>({
        isOpen: false,
        title: '',
        message: '',
        messages: undefined,
        type: 'error'
    });

    const loadFeeSchedules = async () => {
        try {
            if (!selectedParkingLot?.id) return;
            setLoadingFeeSchedules(true);
            const data = await fetchFeeSchedules(selectedParkingLot.id);
            setFeeSchedules(data);
        } catch (error) {
            console.error('Error fetching parking fee schedules:', error);

            if (error instanceof ParkingFeeError) {
                // Handle custom parking fee errors
                if (error.statusCode === 401) {
                    setErrorModal({
                        isOpen: true,
                        title: "Authentication Error",
                        message: "Please log in again to continue",
                        type: "error"
                    });
                } else if (error.statusCode === 403) {
                    setErrorModal({
                        isOpen: true,
                        title: "Permission Denied",
                        message: "You don't have permission to view fee schedules",
                        type: "error"
                    });
                } else if (error.statusCode === 404) {
                    setErrorModal({
                        isOpen: true,
                        title: "No Schedules Found",
                        message: "No fee schedules found for this parking lot",
                        type: "warning"
                    });
                } else if (error.statusCode && error.statusCode >= 500) {
                    setErrorModal({
                        isOpen: true,
                        title: "Server Error",
                        message: "Failed to load fee schedules. Please try again later.",
                        type: "error"
                    });
                } else {
                    console.log(error);
                    setErrorModal({
                        isOpen: true,
                        title: "Error",
                        message: error.message,
                        type: "error"
                    });
                }
            } else {
                // Generic error fallback
                setErrorModal({
                    isOpen: true,
                    title: "Error",
                    message: "Failed to load fee schedules. Please try again.",
                    type: "error"
                });
            }

            setFeeSchedules([]); // fallback to empty if error
        } finally {
            setLoadingFeeSchedules(false);
        }
    };

    useEffect(() => {
        if (!loading && selectedParkingLot?.id) {
            loadFeeSchedules();
        }
    }, [loading, selectedParkingLot?.id]);

    // Helper functions
    // const generateid = () => Math.random().toString(36).substr(2, 9);
    // Fee Schedule CRUD operations
    const handleSaveSchedule = async (scheduleData: Partial<ParkingFeeSchedule>) => {
        try {
            if (!selectedParkingLot?.id) return;

            if (editingSchedule) {
                // Update existing schedule
                const updatedSchedule = await updateFeeSchedule(
                    selectedParkingLot.id,
                    editingSchedule.id,
                    scheduleData
                );

                setFeeSchedules((schedules) =>
                    schedules.map((schedule) =>
                        schedule.id === editingSchedule.id ? updatedSchedule : schedule
                    )
                );

                // Success announcement for update
                setErrorModal({
                    isOpen: true,
                    title: "Success",
                    message: "Fee schedule updated successfully",
                    type: "success"
                });
            } else {
                // Create new schedule
                const createdSchedule = await createFeeSchedule(
                    selectedParkingLot.id,
                    scheduleData
                );

                setFeeSchedules((schedules) => [...schedules, createdSchedule]);

                // Success announcement for create
                setErrorModal({
                    isOpen: true,
                    title: "Success",
                    message: "Fee schedule created successfully",
                    type: "success"
                });
            }
        } catch (error) {
            console.error('Error saving parking fee schedule:', error);
            console.log(error);

            if (error instanceof ParkingFeeError) {
                // Handle custom parking fee errors
                if (error.isBusinessError) {
                    // Business logic errors (e.g., overlapping schedules)
                    setErrorModal({
                        isOpen: true,
                        title: "Schedule Conflict",
                        message: error.message,
                        messages: error.errors, // <-- pass the array here
                        type: "warning"
                    });
                } else if (error.statusCode === 401) {
                    // Authentication error
                    setErrorModal({
                        isOpen: true,
                        title: "Authentication Error",
                        message: "Please log in again to continue",
                        type: "error"
                    });
                } else if (error.statusCode === 403) {
                    // Permission error
                    setErrorModal({
                        isOpen: true,
                        title: "Permission Denied",
                        message: "You don't have permission to perform this action",
                        type: "error"
                    });
                } else if (error.statusCode === 404) {
                    // Not found error
                    setErrorModal({
                        isOpen: true,
                        title: "Not Found",
                        message: "The requested resource was not found",
                        type: "error"
                    });
                } else if (error.statusCode && error.statusCode >= 500) {
                    // Server error
                    setErrorModal({
                        isOpen: true,
                        title: "Server Error",
                        message: "Please try again later. If the problem persists, contact support.",
                        type: "error"
                    });
                } else {
                    // Other API errors
                    setErrorModal({
                        isOpen: true,
                        title: "Error",
                        message: error.message,
                        type: "error"
                    });
                }
                // Don't close the modal on error - let user see the error and try again
                return;
            } else {
                // Generic error fallback
                setErrorModal({
                    isOpen: true,
                    title: "Error",
                    message: "Failed to save parking fee schedule. Please try again.",
                    type: "error"
                });
                // Don't close the modal on error
                return;
            }
        }

        // Only close modal and reset editing state on success
        setIsScheduleModalOpen(false);
        setEditingSchedule(null);
    };

    const handleDeleteSchedule = async (id: string) => {
        try {
            if (!selectedParkingLot?.id) return;

            if (!confirm('Are you sure you want to delete this parking fee schedule?')) {
                return;
            }

            await deleteFeeSchedule(selectedParkingLot.id, id);

            // Only update local state if API call is successful
            setFeeSchedules((schedules) => schedules.filter((schedule) => schedule.id !== id));

            // Success announcement for delete
            setErrorModal({
                isOpen: true,
                title: "Success",
                message: "Fee schedule deleted successfully",
                type: "success"
            });
        } catch (error) {
            console.error('Error deleting parking fee schedule:', error);

            if (error instanceof ParkingFeeError) {
                // Handle custom parking fee errors
                if (error.isBusinessError) {
                    // Business logic errors (e.g., schedule in use)
                    setErrorModal({
                        isOpen: true,
                        title: "Cannot Delete",
                        message: error.message,
                        messages: error.errors, // <-- pass the array here
                        type: "warning"
                    });
                } else if (error.statusCode === 401) {
                    // Authentication error
                    setErrorModal({
                        isOpen: true,
                        title: "Authentication Error",
                        message: "Please log in again to continue",
                        type: "error"
                    });
                } else if (error.statusCode === 403) {
                    // Permission error
                    setErrorModal({
                        isOpen: true,
                        title: "Permission Denied",
                        message: "You don't have permission to delete fee schedules",
                        type: "error"
                    });
                } else if (error.statusCode === 404) {
                    // Not found error
                    setErrorModal({
                        isOpen: true,
                        title: "Not Found",
                        message: "The fee schedule was not found",
                        type: "error"
                    });
                } else if (error.statusCode && error.statusCode >= 500) {
                    // Server error
                    setErrorModal({
                        isOpen: true,
                        title: "Server Error",
                        message: "Please try again later. If the problem persists, contact support.",
                        type: "error"
                    });
                } else {
                    // Other API errors
                    setErrorModal({
                        isOpen: true,
                        title: "Error",
                        message: error.message,
                        type: "error"
                    });
                }
            } else {
                // Generic error fallback
                setErrorModal({
                    isOpen: true,
                    title: "Error",
                    message: "Failed to delete parking fee schedule. Please try again.",
                    type: "error"
                });
            }
        }
    };

    return (
        <DefaultLayout title="Parking Fee Management">
            <div className="bg-background rounded-lg shadow-sm border border-divider mt-10">
                <div className="flex flex-col gap-4">

                </div>
                {/* Fee Schedules Table */}
                <div className="p-6">
                    <Tabs aria-label="Options">

                        <Tab key="weekly" title="Weekly view">
                            {/* day of week view */}
                            <ParkingFeeWeeklyView
                                schedulesData={feeSchedules}
                                onEdit={(schedule: ParkingFeeSchedule) => {
                                    setEditingSchedule(schedule);
                                    setIsScheduleModalOpen(true);
                                }}
                                onDelete={(id: string) => {
                                    handleDeleteSchedule(id);
                                }}
                                onAdd={() => setIsScheduleModalOpen(true)}
                                loading={loadingFeeSchedules}
                            />
                        </Tab>

                        <Tab key="table" title="Table view">
                            <FeeSchedulesTab
                                schedules={feeSchedules}
                                onEdit={(schedule) => {
                                    if (schedule == null) {
                                        return;
                                    }
                                    setEditingSchedule(schedule);
                                    setIsScheduleModalOpen(true);
                                }}
                                onDelete={handleDeleteSchedule}
                                onAdd={() => setIsScheduleModalOpen(true)}
                            />
                        </Tab>

                    </Tabs>


                </div>
            </div>


            {/* Modal */}
            <Modal
                isOpen={isScheduleModalOpen}
                size="xl"
                onClose={() => {
                    setIsScheduleModalOpen(false);
                    setEditingSchedule(null);
                }}
            >
                <ModalContent>
                    {() => (
                        <>
                            {/* The content of FeeScheduleModal should be refactored and placed here. */}
                            {isScheduleModalOpen && (
                                <FeeScheduleModal
                                    schedule={editingSchedule}
                                    onSave={handleSaveSchedule}
                                    onClose={() => {
                                        setIsScheduleModalOpen(false);
                                        setEditingSchedule(null);
                                    }} />
                            )}

                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Error/Success Modal */}
            <Modal
                isOpen={errorModal.isOpen}
                size="md"
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className={`flex items-center gap-2 ${errorModal.type === 'error' ? 'text-danger' :
                                    errorModal.type === 'warning' ? 'text-warning' :
                                        'text-success'
                                    }`}>
                                    {errorModal.type === 'error' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {errorModal.type === 'warning' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {errorModal.type === 'success' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {errorModal.title}
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-gray-600">
                                    {/* {errorModal.message} */}
                                </p>
                                {errorModal.messages && errorModal.messages.length > 0 && (

                                    <ul className="mt-2 list-disc list-inside text-sm text-danger">
                                        {errorModal.messages.map((msg, idx) => {
                                            const schedule = feeSchedules.find(s => s.id === msg);
                                            if (!schedule) return null;
                                            return (
                                                <li key={idx}>
                                                    {formatDays(schedule.dayOfWeeks ?? [])} | {minutesToTime(schedule.startTime)} - {minutesToTime(schedule.endTime)}
                                                    {/* Optionally: | {VehicleTypeText[schedule.forVehicleType]} */}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color={errorModal.type === 'success' ? 'primary' : 'default'}
                                    className='text-background'
                                    onPress={() => setErrorModal({ ...errorModal, isOpen: false })}
                                >
                                    {errorModal.type === 'success' ? 'Continue' : 'OK'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

        </DefaultLayout>
    );
};

export const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

export const formatDays = (dayOfWeeks: number[]): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!Array.isArray(dayOfWeeks) || dayOfWeeks.length === 0) return 'All days';
    return dayOfWeeks.map(idx => days[idx] || '').filter(Boolean).join(', ');
};


// Fee Schedules Tab Component
const FeeSchedulesTab: React.FC<{
    schedules: ParkingFeeSchedule[];
    onEdit: (schedule: ParkingFeeSchedule | null) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}> = ({ schedules, onEdit, onDelete, onAdd }) => {

    const [selectSchedule, setSelectSchedule] = useState<ParkingFeeSchedule | null>(null);

      return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Fee Schedules</h2>

                <div>

                    <Button
                        color="default"
                        onPress={onAdd}
                        variant='flat'
                        size='sm'
                        className="ml-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Fee Schedule
                    </Button>
                </div>
            </div>

            <div className="  overflow-hidden">
                <Table
                    color='secondary'
                    // defaultSelectedKeys={['1']}
                    // selectedKeys={selectSchedule ? [selectSchedule.id] : []}
                    // onSelectionChange={(keys) => {
                    //     if (typeof keys === 'string') { // Handle "all" selection
                    //         setSelectSchedule(null);
                    //         return;
                    //     }
                    //     const [selectedid] = keys;
                    //     const schedule = schedules.find((s) => s.id === selectedid);
                    //     setSelectSchedule(schedule || null);
                    // }}
                    // selectionMode="single"
                    aria-label="Parking Fee Schedules Table"
                    className="min-w-full"
                >
                    <TableHeader>
                        <TableColumn>Time Period</TableColumn>
                        <TableColumn>Vehicle Type</TableColumn>
                        <TableColumn>Fees</TableColumn>
                        <TableColumn>Days</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Action</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm ">
                                        <Clock className="w-4 h-4" />
                                        {minutesToTime(schedule.startTime || 0)} - {minutesToTime(schedule.endTime || 1440)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm ">
                                        {schedule.forVehicleType === VehicleType.Car ? (
                                            <Car className="w-3 h-3" />
                                        ) : schedule.forVehicleType === VehicleType.Motorbike ? (
                                            <BikeIcon className="w-3 h-3" />
                                        ) : (
                                            <BikeIcon className="w-3 h-3" />
                                        )}
                                        {VehicleTypeText[schedule.forVehicleType] || 'Car'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm ">
                                        <div className="flex items-center gap-1">
                                            {/* <DollarSign className="w-4 h-4" /> */}
                                            {(schedule.initialFee || 0).toFixed(0)}đ initial
                                        </div>
                                        <div className="text-xs ">
                                            +{(schedule.additionalFee || 0).toFixed(0)}đ per {schedule.additionalMinutes || 60}min
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm ">
                                        {Array.isArray(schedule.dayOfWeeks) && schedule.dayOfWeeks.length > 0
                                            ? schedule.dayOfWeeks.map(idx => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx]).join(', ')
                                            : 'All days'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${schedule.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {schedule.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        color='primary'
                                        variant='solid'
                                        className='bg-transparent'
                                        onPress={() => onEdit(schedule)}

                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        variant='solid'
                                        color='danger'
                                        className='bg-transparent text-danger'
                                        onPress={() => onDelete(schedule.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};



export default ParkingFeeManagement;