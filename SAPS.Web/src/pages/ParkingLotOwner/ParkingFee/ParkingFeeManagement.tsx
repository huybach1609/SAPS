import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Calendar, Car, DollarSign, MapPin, Settings, Edit2 } from 'lucide-react';
import DefaultLayout from '@/layouts/default';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, ButtonGroup, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';

// Types based on the database schema
interface ParkingLot {
    Id: string;
    Name: string;
    Description?: string;
    Address: string;
    TotalParkingSlot: number;
    CreatedAt: string;
    UpdatedAt: string;
    Status: 'Active' | 'Inactive';
    ParkingLotOwnerId: string;
}

interface ParkingFeeSchedule {
    Id: string;
    StartTime: number; // minutes from midnight
    EndTime: number; // minutes from midnight
    InitialFee: number;
    AdditionalFee: number;
    AdditionalMinutes: number;
    DayOfWeeks?: string;
    IsActive: boolean;
    UpdatedAt: string;
    ForVehicleType: 'Car' | 'Motorbike' | 'Truck' | 'Bus';
    ParkingLotId: string;
}

const SINGLE_PARKING_LOT: ParkingLot = {
    Id: '1',
    Name: 'Downtown Plaza',
    Description: 'Premium parking in the heart of downtown',
    Address: '123 Main Street, Downtown',
    TotalParkingSlot: 150,
    CreatedAt: '2024-01-15T10:00:00Z',
    UpdatedAt: '2024-01-15T10:00:00Z',
    Status: 'Active',
    ParkingLotOwnerId: 'owner1',
};

const ParkingFeeManagement: React.FC = () => {
    const [feeSchedules, setFeeSchedules] = useState<ParkingFeeSchedule[]>([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ParkingFeeSchedule | null>(null);

    // Sample data initialization
    useEffect(() => {
        const sampleSchedules: ParkingFeeSchedule[] = [
            {
                Id: '1',
                StartTime: 0, // 12 AM
                EndTime: 360, // 6 AM
                InitialFee: 5.0,
                AdditionalFee: 2.0,
                AdditionalMinutes: 60,
                DayOfWeeks: 'Monday,Tuesday,Wednesday,Thursday,Friday',
                IsActive: true,
                UpdatedAt: '2024-01-15T10:00:00Z',
                ForVehicleType: 'Car',
                ParkingLotId: SINGLE_PARKING_LOT.Id,
            },
            {
                Id: '2',
                StartTime: 360, // 6 AM
                EndTime: 1080, // 6 PM
                InitialFee: 10.0,
                AdditionalFee: 5.0,
                AdditionalMinutes: 60,
                DayOfWeeks: 'Monday,Tuesday,Wednesday,Thursday,Friday',
                IsActive: true,
                UpdatedAt: '2024-01-15T10:00:00Z',
                ForVehicleType: 'Car',
                ParkingLotId: SINGLE_PARKING_LOT.Id,
            },
            {
                Id: '3',
                StartTime: 1080, // 6 PM
                EndTime: 1440, // 12 AM
                InitialFee: 8.0,
                AdditionalFee: 3.0,
                AdditionalMinutes: 60,
                DayOfWeeks: 'Monday,Tuesday,Wednesday,Thursday,Friday',
                IsActive: true,
                UpdatedAt: '2024-01-15T10:00:00Z',
                ForVehicleType: 'Car',
                ParkingLotId: SINGLE_PARKING_LOT.Id,
            },
        ];
        setFeeSchedules(sampleSchedules);
    }, []);

    // Helper functions
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Fee Schedule CRUD operations
    const handleSaveSchedule = (scheduleData: Partial<ParkingFeeSchedule>) => {
        if (editingSchedule) {
            setFeeSchedules((schedules) =>
                schedules.map((schedule) =>
                    schedule.Id === editingSchedule.Id
                        ? { ...schedule, ...scheduleData, UpdatedAt: new Date().toISOString() }
                        : schedule
                )
            );
        } else {
            const newSchedule: ParkingFeeSchedule = {
                Id: generateId(),
                StartTime: scheduleData.StartTime || 0,
                EndTime: scheduleData.EndTime || 1440,
                InitialFee: scheduleData.InitialFee || 0,
                AdditionalFee: scheduleData.AdditionalFee || 0,
                AdditionalMinutes: scheduleData.AdditionalMinutes || 60,
                DayOfWeeks: scheduleData.DayOfWeeks,
                IsActive: scheduleData.IsActive !== undefined ? scheduleData.IsActive : true,
                UpdatedAt: new Date().toISOString(),
                ForVehicleType: scheduleData.ForVehicleType || 'Car',
                ParkingLotId: SINGLE_PARKING_LOT.Id,
            };
            setFeeSchedules((schedules) => [...schedules, newSchedule]);
        }
        setIsScheduleModalOpen(false);
        setEditingSchedule(null);
    };

    const handleDeleteSchedule = (id: string) => {
        setFeeSchedules((schedules) => schedules.filter((schedule) => schedule.Id !== id));
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
                size="2xl"
                onClose={() => {
                    setIsScheduleModalOpen(false);
                    setEditingSchedule(null);
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {editingSchedule ? 'Edit Fee Schedule' : 'Add Fee Schedule'}
                            </ModalHeader>
                            <ModalBody>
                                {/* The content of FeeScheduleModal should be refactored and placed here. */}
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                                    risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                                    quam.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => handleSaveSchedule(editingSchedule || {})}>
                                    Save
                                </Button>
                            </ModalFooter>
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
                            onPress={() => onDelete(selectSchedule?.Id || '')}
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
                    selectedKeys={selectSchedule ? [selectSchedule.Id] : []}
                    onSelectionChange={(keys) => {
                        if (typeof keys === 'string') { // Handle "all" selection
                            setSelectSchedule(null);
                            return;
                        }
                        const [selectedId] = keys;
                        const schedule = schedules.find((s) => s.Id === selectedId);
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
                        {/* <TableColumn>Actions</TableColumn> */}
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.Id}>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm ">
                                        <Clock className="w-4 h-4" />
                                        {minutesToTime(schedule.StartTime)} - {minutesToTime(schedule.EndTime)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm ">
                                        <Car className="w-4 h-4" />
                                        {schedule.ForVehicleType}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm ">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            ${schedule.InitialFee.toFixed(2)} initial
                                        </div>
                                        <div className="text-xs ">
                                            +${schedule.AdditionalFee.toFixed(2)} per {schedule.AdditionalMinutes}min
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm ">
                                        {schedule.DayOfWeeks || 'All days'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${schedule.IsActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {schedule.IsActive ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                {/* <TableCell> */}
                                    {/* <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(schedule)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(schedule.Id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div> */}
                                {/* </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

// Fee Schedule Modal Component
const FeeScheduleModal: React.FC<{
    schedule: ParkingFeeSchedule | null;
    onSave: (data: Partial<ParkingFeeSchedule>) => void;
    onClose: () => void;
}> = ({ schedule, onSave, onClose }) => {
    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const [formData, setFormData] = useState({
        StartTime: schedule?.StartTime || 0,
        EndTime: schedule?.EndTime || 1440,
        InitialFee: schedule?.InitialFee || 0,
        AdditionalFee: schedule?.AdditionalFee || 0,
        AdditionalMinutes: schedule?.AdditionalMinutes || 60,
        DayOfWeeks: schedule?.DayOfWeeks || '',
        IsActive: schedule?.IsActive !== undefined ? schedule.IsActive : true,
        ForVehicleType: schedule?.ForVehicleType || 'Car' as 'Car' | 'Motorbike' | 'Truck' | 'Bus',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const dayOptions = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ];

    const [selectedDays, setSelectedDays] = useState<string[]>(
        formData.DayOfWeeks ? formData.DayOfWeeks.split(',') : []
    );

    const handleDayToggle = (day: string) => {
        const updatedDays = selectedDays.includes(day)
            ? selectedDays.filter((d) => d !== day)
            : [...selectedDays, day];

        setSelectedDays(updatedDays);
        setFormData({ ...formData, DayOfWeeks: updatedDays.join(',') });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-screen overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                    {schedule ? 'Edit Fee Schedule' : 'Add Fee Schedule'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                value={minutesToTime(formData.StartTime)}
                                onChange={(e) => setFormData({ ...formData, StartTime: timeToMinutes(e.target.value) })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time *
                            </label>
                            <input
                                type="time"
                                value={minutesToTime(formData.EndTime)}
                                onChange={(e) => setFormData({ ...formData, EndTime: timeToMinutes(e.target.value) })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle Type *
                        </label>
                        <select
                            value={formData.ForVehicleType}
                            onChange={(e) => setFormData({ ...formData, ForVehicleType: e.target.value as 'Car' | 'Motorbike' | 'Truck' | 'Bus' })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Car">Car</option>
                            <option value="Motorbike">Motorbike</option>
                            <option value="Truck">Truck</option>
                            <option value="Bus">Bus</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Initial Fee ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.InitialFee}
                                onChange={(e) => setFormData({ ...formData, InitialFee: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Fee ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.AdditionalFee}
                                onChange={(e) => setFormData({ ...formData, AdditionalFee: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Minutes Interval *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.AdditionalMinutes}
                            onChange={(e) => setFormData({ ...formData, AdditionalMinutes: parseInt(e.target.value) || 60 })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Additional fee will be charged every {formData.AdditionalMinutes} minutes after initial period
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days of Week (leave empty for all days)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {dayOptions.map((day) => (
                                <label key={day} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedDays.includes(day)}
                                        onChange={() => handleDayToggle(day)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{day}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.IsActive}
                            onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Active Schedule
                        </label>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Fee Calculation Preview:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div>• Initial fee: ${formData.InitialFee.toFixed(2)} for first period</div>
                            <div>• Additional fee: ${formData.AdditionalFee.toFixed(2)} per {formData.AdditionalMinutes} minutes</div>
                            <div>• Time: {minutesToTime(formData.StartTime)} - {minutesToTime(formData.EndTime)}</div>
                            <div>• Vehicle: {formData.ForVehicleType}</div>
                            <div>• Days: {selectedDays.length > 0 ? selectedDays.join(', ') : 'All days'}</div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {schedule ? 'Update' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParkingFeeManagement;