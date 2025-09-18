import React, { useState, useEffect } from 'react';
import { Spinner, useDisclosure } from '@heroui/react';
import { Users, Clock } from 'lucide-react';
import StaffShiftWeeklyView from './StaffShiftWeeklyView';
import StaffShiftModal from './StaffShiftModal';
import StaffShiftConflictModal, { ShiftConflict } from './StaffShiftConflictModal';
import { StaffShift, CreateStaffShift, fetchStaffShifts, createStaffShift, updateStaffShift, deleteStaffShift } from '@/services/parkinglot/staffShift';
import { StaffShiftValidator } from '@/components/utils/staffShiftValidator';
import DefaultLayout from '@/layouts/default';
import { useParkingLot } from '../ParkingLotContext';
import { AxiosError } from 'axios';
// import { ShiftConflictChecker } from '@/components/utils/shiftConflictChecker';

const StaffShiftManagement: React.FC = () => {

    const { selectedParkingLot, loading: loadingParkingLot } = useParkingLot();

    const [shiftsData, setShiftsData] = useState<StaffShift[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedShift, setSelectedShift] = useState<StaffShift | null>(null);
    const [conflicts, setConflicts] = useState<ShiftConflict[]>([]);
    const [pendingShiftData, setPendingShiftData] = useState<StaffShift | CreateStaffShift | null>(null);

    // Modal disclosures
    const addModalDisclosure = useDisclosure();
    const editModalDisclosure = useDisclosure();
    const conflictModalDisclosure = useDisclosure();
 
    
    
    const loadShifts = async () => {
        try {
            setRefreshing(true);
            const shifts = await fetchStaffShifts(selectedParkingLot?.id || '');
            setShiftsData(shifts);
        } catch (error) {
            console.error('Error loading shifts:', error);
            // Fallback to mock data if API fails
            // setShiftsData(mockShifts);
        } finally {
            setRefreshing(false);
        }
    }



    // // Mock data for demonstration
    // const mockShifts: StaffShift[] = [
    //     {
    //         id: '1',
    //         staffId: 'staff-1',
    //         parkingLotId: selectedParkingLot?.id || '',
    //         startTime: TimeUtils.timeToMinutes('09:00'),
    //         endTime: TimeUtils.timeToMinutes('17:00'),
    //         shiftType: 'Regular',
    //         dayOfWeeks: '1,2,3,4,5', // Monday to Friday
    //         specificDate: null,
    //         isActive: true,
    //         status: 'Scheduled',
    //         notes: 'Morning shift',
    //         createdAt: new Date().toISOString(),
    //         updatedAt: new Date().toISOString()
    //     },
    //     {
    //         id: '2',
    //         staffId: 'staff-2',
    //         parkingLotId: selectedParkingLot?.id || '',
    //         startTime: TimeUtils.timeToMinutes('17:00'),
    //         endTime: TimeUtils.timeToMinutes('01:00'),
    //         shiftType: 'Emergency',
    //         dayOfWeeks: '6,7', // Weekend
    //         specificDate: null,
    //         isActive: true,
    //         status: 'Active',
    //         notes: 'Weekend emergency shift',
    //         createdAt: new Date().toISOString(),
    //         updatedAt: new Date().toISOString()
    //     }
    // ];

    useEffect(() => {
        const initialLoad = async () => {
            try {
                setLoading(true);
                await loadShifts();
            } finally {
                setLoading(false);
            }
        };
        initialLoad();
    }, [selectedParkingLot]);

    const handleAddShift = () => {
        addModalDisclosure.onOpen();
    };

    const handleEditShift = (shift: StaffShift) => {
        setSelectedShift(shift);
        editModalDisclosure.onOpen();
    };

    const handleDeleteShift = async (shiftId: string) => {
        if (window.confirm('Are you sure you want to delete this shift?')) {
            try {
                await deleteStaffShift(selectedParkingLot?.id || '', shiftId);

                // Update local state
                setShiftsData(prev => prev.filter(shift => shift.id !== shiftId));

                // Force a refresh of the data to ensure consistency
                await loadShifts();
            } catch (error) {
                console.error('Error deleting shift:', error);
                alert('Failed to delete shift. Please try again.');
            }
        }
    };

    const handleSaveShift = async (shiftData: CreateStaffShift | StaffShift) => {

        try {


            const errors = StaffShiftValidator.validate(shiftData);
            if (errors.length > 0) {
                alert('Validation errors: ' + errors.map(e => e.message).join(', '));
                return;

            }


            // Prepare the data for API
            const shiftToCreate = {
                ...shiftData,
                shiftType: shiftData.shiftType || 'Regular',
                isActive: shiftData.isActive ?? true,
                status: shiftData.status || 'Scheduled',
            };

            const newShift = await createStaffShift(selectedParkingLot?.id || '', shiftToCreate as CreateStaffShift);

            // Update local state
            setShiftsData(prev => [...prev, newShift]);

            // Force a refresh of the data to ensure consistency
            await loadShifts();

            addModalDisclosure.onClose();

        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data.errors) {
                    // Store the conflicts and pending shift data
                    console.log(error.response.data);
                    setConflicts(error.response.data.errors);
                    setPendingShiftData(shiftData);
                    // Show the conflict modal
                    conflictModalDisclosure.onOpen();
                } else {
                    // Handle other types of errors
                    alert('An error occurred while creating the shift. Please try again.');
                }
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleUpdateShift = async (shiftData: StaffShift | CreateStaffShift) => {

        try {
            console.log(shiftData);
            // Validate the shift data
            const errors = StaffShiftValidator.validate(shiftData);
            if (errors.length > 0) {
                alert('Validation errors: ' + errors.map(e => e.message).join(', '));
                return;
            }

            // Find the existing shift to preserve createdAt
            const existingShift = shiftsData.find(shift => shift.id === shiftData.id);
            if (!existingShift) {
                alert('Shift not found');
                return;
            }

            // Prepare the data for API update
            const shiftToUpdate = {
                ...shiftData,
                shiftType: shiftData.shiftType || 'Regular',
                isActive: shiftData.isActive ?? true,
                status: shiftData.status || 'Scheduled',
            };

            // Call API to update shift
            const updatedShift = await updateStaffShift(selectedParkingLot?.id || '', shiftData.id || '', shiftToUpdate);

            // Update local state with the fresh data from API
            setShiftsData(prev => prev.map(shift =>
                shift.id === updatedShift.id ? updatedShift : shift
            ));

            // Force a refresh of the data to ensure consistency
            await loadShifts();
            editModalDisclosure.onClose();
            setSelectedShift(null);


        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data.errors) {
                    // Store the conflicts and pending shift data
                    console.log(error.response.data.errors);
                    setConflicts(error.response.data.errors);
                    setPendingShiftData(shiftData);
                    // Show the conflict modal
                    conflictModalDisclosure.onOpen();
                } else {
                    // Handle other types of errors
                    alert('An error occurred while updating the shift. Please try again.');
                }
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleRetryOperation = async () => {
        if (pendingShiftData) {
            conflictModalDisclosure.onClose();
            // Check if it's an update (has id) or create operation
            if ('id' in pendingShiftData) {
                await handleUpdateShift(pendingShiftData);
            } else {
                await handleSaveShift(pendingShiftData);
            }
        }
    };

    return (
        <DefaultLayout className="p-6" title="Staff Shift Management" description={`Manage staff shifts for ${selectedParkingLot?.name}`}>
            <div className="mb-6">
                {/* <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900"></h1>
                        <p className="text-gray-600">Manage staff schedules and shifts</p>
                    </div>
                </div> */}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Shifts</p>
                                <p className="text-2xl font-bold text-gray-900">{shiftsData.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Shifts</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {shiftsData.filter(s => s.status === 'Active').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Scheduled</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {shiftsData.filter(s => s.status === 'Scheduled').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly View */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
                    <span className="ml-2 text-gray-600">Loading shifts...</span>
                </div>
            ) : (
                <StaffShiftWeeklyView
                    key={`shifts-${shiftsData.length}`}
                    shiftsData={shiftsData}
                    onEdit={handleEditShift}
                    onDelete={handleDeleteShift}
                    onAdd={handleAddShift}
                    onRefresh={loadShifts}
                    loading={loading || refreshing}
                />
            )}

            {loadingParkingLot ? <Spinner /> : (
                <>
                    {/* Add Shift Modal */}
                    <StaffShiftModal
                        isOpen={addModalDisclosure.isOpen}
                        onOpenChange={addModalDisclosure.onClose}
                        onSave={handleSaveShift}
                        mode="add"
                        parkingLotId={selectedParkingLot?.id || ''}
                    />

                    {/* Edit Shift Modal */}
                    <StaffShiftModal
                        isOpen={editModalDisclosure.isOpen}
                        onOpenChange={editModalDisclosure.onClose}
                        onSave={handleUpdateShift}
                        shift={selectedShift}
                        mode="edit"
                        parkingLotId={selectedParkingLot?.id || ''}
                    />

                    {/* Conflict Modal */}
                    <StaffShiftConflictModal
                        isOpen={conflictModalDisclosure.isOpen}
                        onOpenChange={conflictModalDisclosure.onClose}
                        conflicts={conflicts}
                        onRetry={handleRetryOperation}
                    />
                </>
            )}
        </DefaultLayout>
    );
};

export default StaffShiftManagement;
