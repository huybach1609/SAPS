import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Car, DollarSign, Edit2 } from 'lucide-react';
import DefaultLayout from '@/layouts/default';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, ButtonGroup, Modal, ModalContent,  addToast } from '@heroui/react';
import { FeeScheduleModal } from './FeeScheduleModal';
import { useParkingLot } from '../ParkingLotContext';
import {
    fetchFeeSchedules,
    createFeeSchedule,
    updateFeeSchedule,
    deleteFeeSchedule,
    type ParkingFeeSchedule
} from '@/services/parkinglot/parkinglotFeeService';


// const SINGLE_PARKING_LOT: ParkingLot = {
//     id: '1',
//     Name: 'Downtown Plaza',
//     Description: 'Premium parking in the heart of downtown',
//     Address: '123 Main Street, Downtown',
//     TotalParkingSlot: 150,
//     CreatedAt: '2024-01-15T10:00:00Z',
//     UpdatedAt: '2024-01-15T10:00:00Z',
//     Status: 'Active',
//     ParkingLotOwnerid: '1',
// };

const ParkingFeeManagement: React.FC = () => {
    const [feeSchedules, setFeeSchedules] = useState<ParkingFeeSchedule[]>([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ParkingFeeSchedule | null>(null);
    const { parkingLot, loading } = useParkingLot();

    const loadFeeSchedules = async () => {
        try {
            if (!parkingLot?.id) return;
            const data = await fetchFeeSchedules(parkingLot.id);
            setFeeSchedules(data);
        } catch (error) {
            console.error('Error fetching parking fee schedules:', error);
            setFeeSchedules([]); // fallback to empty if error
        }
    };

    useEffect(() => {
        if (!loading && parkingLot?.id) {
            loadFeeSchedules();
        }
    }, [loading, parkingLot?.id]);

    // Helper functions
    // const generateid = () => Math.random().toString(36).substr(2, 9);

    // Fee Schedule CRUD operations
    const handleSaveSchedule = async (scheduleData: Partial<ParkingFeeSchedule>) => {
        try {
            if (!parkingLot?.id) return;

            if (editingSchedule) {
                // Update existing schedule
                const updatedSchedule = await updateFeeSchedule(
                    parkingLot.id,
                    editingSchedule.id,
                    scheduleData
                );

                setFeeSchedules((schedules) =>
                    schedules.map((schedule) =>
                        schedule.id === editingSchedule.id ? updatedSchedule : schedule
                    )
                );
            } else {
                // Create new schedule
                const createdSchedule = await createFeeSchedule(
                    parkingLot.id,
                    scheduleData
                );

                setFeeSchedules((schedules) => [...schedules, createdSchedule]);
            }
        } catch (error) {
            console.error('Error saving parking fee schedule:', error);
            addToast({
                color: "danger",
                title: "Error",
                description: "Failed to save parking fee schedule",
            });
        } finally {
            setIsScheduleModalOpen(false);
            setEditingSchedule(null);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        try {
            if (!parkingLot?.id) return;

            if (!confirm('Are you sure you want to delete this parking fee schedule?')) {
                return;
            }

            await deleteFeeSchedule(parkingLot.id, id);

            // Only update local state if API call is successful
            setFeeSchedules((schedules) => schedules.filter((schedule) => schedule.id !== id));
        } catch (error) {
            console.error('Error deleting parking fee schedule:', error);
            addToast({
                color: "danger",
                title: "Error",
                description: "Failed to delete parking fee schedule",
            });
        }
    };

    return (
        <DefaultLayout title="Parking Fee Management">
            <div className="bg-background rounded-lg shadow-sm border border-divider mt-10">
                <div className="flex flex-col gap-4">

                </div>
                {/* Fee Schedules Table */}
                <div className="p-6">

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
                                    }}
                                />
                            )}

                        </>
                    )}
                </ModalContent>
            </Modal>
        </DefaultLayout>
    );
};

// Fee Schedules Tab Component
const FeeSchedulesTab: React.FC<{
    schedules: ParkingFeeSchedule[];
    onEdit: (schedule: ParkingFeeSchedule | null) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}> = ({ schedules, onEdit, onDelete, onAdd }) => {

    const [selectSchedule, setSelectSchedule] = useState<ParkingFeeSchedule | null>(null);

    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Fee Schedules</h2>

                <div>
                    <ButtonGroup>
                        <Button
                            disabled={!selectSchedule}
                            size='sm'
                            isIconOnly
                            color={!selectSchedule ? 'default' : 'primary'}
                            variant='solid'
                            className='text-background'
                            onPress={() => onEdit(selectSchedule)}
                        >

                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            disabled={!selectSchedule}
                            size='sm'
                            isIconOnly
                            variant='solid'
                            color={!selectSchedule ? 'default' : 'danger'}
                            className='text-background'
                            onPress={() => onDelete(selectSchedule?.id || '')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </ButtonGroup>

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
                    selectedKeys={selectSchedule ? [selectSchedule.id] : []}
                    onSelectionChange={(keys) => {
                        if (typeof keys === 'string') { // Handle "all" selection
                            setSelectSchedule(null);
                            return;
                        }
                        const [selectedid] = keys;
                        const schedule = schedules.find((s) => s.id === selectedid);
                        setSelectSchedule(schedule || null);
                    }}
                    selectionMode="single"
                    aria-label="Parking Fee Schedules Table"
                    className="min-w-full"
                >
                    <TableHeader>
                        <TableColumn>Time Period</TableColumn>
                        <TableColumn>Vehicle Type</TableColumn>
                        <TableColumn>Fees</TableColumn>
                        <TableColumn>Days</TableColumn>
                        <TableColumn>Status</TableColumn>
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
                                        <Car className="w-4 h-4" />
                                        {schedule.forVehicleType || 'Car'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm ">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            ${(schedule.initialFee || 0).toFixed(2)} initial
                                        </div>
                                        <div className="text-xs ">
                                            +${(schedule.additionalFee || 0).toFixed(2)} per {schedule.additionalMinutes || 60}min
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};



export default ParkingFeeManagement;