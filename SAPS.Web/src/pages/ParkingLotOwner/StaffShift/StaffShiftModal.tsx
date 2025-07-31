import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Textarea, useDisclosure, Checkbox } from '@heroui/react';
import { StaffShift, CreateStaffShift } from '@/services/parkinglot/staffShift';
import { StaffShiftValidator, TimeUtils } from '@/components/utils/staffShiftValidator';
import { searchStaff } from '@/services/parkinglot/staffService';
import { StaffProfile, User } from '@/types/User';
import { formatPhoneNumber } from '@/components/utils/stringUtils';

interface StaffShiftModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    onSave: (shiftData: CreateStaffShift | StaffShift) => void;
    shift?: StaffShift | null;
    mode: 'add' | 'edit';
    parkingLotId: string;

}

const StaffShiftModal: React.FC<StaffShiftModalProps> = ({
    isOpen,
    onOpenChange,
    onSave,
    shift,
    mode,
    parkingLotId,
}) => {
    const [formData, setFormData] = useState<Partial<CreateStaffShift>>({
        id: '',
        staffId: '',
        parkingLotId: '',
        startTime: 0,
        endTime: 0,
        shiftType: 'Regular',
        dayOfWeeks: '',
        specificDate: null,
        isActive: true,
        status: 'Scheduled',
        notes: ''
    });

    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    const [keySearchStaff, setKeySearchStaff] = useState<string>('');
    const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);

    // loading for search staff
    const [loading, setLoading] = useState<boolean>(false);
    const [staffList, setStaffList] = useState<StaffProfile[]>([]);
    const [searchError, setSearchError] = useState<string>('');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
    }, [parkingLotId]);

    useEffect(() => {
        const handleSearchUser = async (term: string) => {
            if (keySearchStaff === '') {
                setStaffList([]);
                setSearchError('');
                return;
            }
            setLoading(true);
            setSearchError('');
            try {
                const response = await searchStaff(keySearchStaff, parkingLotId);
                setStaffList(response as unknown as StaffProfile[]);
            } catch (error) {
                console.error("Failed to search users:", error);
                setSearchError('Failed to search staff. Please try again.');
                setStaffList([]);
            } finally {
                setLoading(false);
            }
        };
        const timeoutId = setTimeout(() => {
            if (keySearchStaff) {
                handleSearchUser(keySearchStaff);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [keySearchStaff, parkingLotId]);



    useEffect(() => {
        setSelectedStaff(shift?.staff || null);
        if (shift && mode === 'edit') {
            setFormData({
                id: shift.id,
                staffId: shift.staffId,
                parkingLotId: shift.parkingLotId,
                startTime: shift.startTime,
                endTime: shift.endTime,
                shiftType: shift.shiftType,
                dayOfWeeks: shift.dayOfWeeks || '',
                specificDate: shift.specificDate,
                isActive: shift.isActive,
                status: shift.status,
                notes: shift.notes || ''
            });

            // Parse dayOfWeeks string to array for checkboxes
            if (shift.dayOfWeeks) {
                const daysArray = shift.dayOfWeeks.split(',').map(day => parseInt(day.trim())).filter(day => !isNaN(day));
                setSelectedDays(daysArray);
            } else {
                setSelectedDays([]);
            }
        } else {

            // Reset form for add mode
            setFormData({
                id: '',
                staffId: '',
                parkingLotId: parkingLotId,
                startTime: 0,
                endTime: 0,
                shiftType: 'Regular',
                dayOfWeeks: '',
                specificDate: null,
                isActive: true,
                status: 'Scheduled',
                notes: ''
            });
            setSelectedDays([]);
        }
        // Only clear errors when the modal first opens, not on every render
        if (isOpen) {
            setErrors({});
        }
    }, [shift, mode, isOpen]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing, but only for the specific field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleDaySelection = (day: number, isSelected: boolean) => {
        let newSelectedDays: number[];
        if (isSelected) {
            newSelectedDays = [...selectedDays, day].sort((a, b) => a - b);
        } else {
            newSelectedDays = selectedDays.filter(d => d !== day);
        }
        setSelectedDays(newSelectedDays);

        // Update formData with comma-separated string
        const dayOfWeeksString = newSelectedDays.join(',');
        handleInputChange('dayOfWeeks', dayOfWeeksString);
        handleInputChange('specificDate', null); // Clear specific date when using days
    };

    const handleShiftTypeChange = (shiftType: string) => {
        handleInputChange('shiftType', shiftType);
        // Clear the other date field when switching types
        if (shiftType === 'Regular') {
            handleInputChange('specificDate', null);
        } else {
            handleInputChange('dayOfWeeks', '');
            setSelectedDays([]);
        }
    };

    const handleStaffSelection = (staffId: string,) => {
        handleInputChange('staffId', staffId);
        setSelectedStaff(staffList.find(staff => staff.staffId === staffId) || null);
        // // Clear the search input after selection
        setKeySearchStaff('');
        setStaffList([]);
        setSearchError('');
    };

    const handleTimeChange = (field: 'startTime' | 'endTime', timeString: string) => {
        if (TimeUtils.isValidTimeFormat(timeString)) {
            const minutes = TimeUtils.timeToMinutes(timeString);
            handleInputChange(field, minutes);
            // Clear any existing time format errors
            if (errors[field]) {
                setErrors(prev => ({ ...prev, [field]: '' }));
            }
        } else {
            setErrors(prev => ({ ...prev, [field]: 'Invalid time format (HH:MM)' }));
        }
    };

    const validateForm = () => {
        if (mode === 'add') {
            formData.id = '0';
        }
        const validationErrors = StaffShiftValidator.validate(formData as CreateStaffShift);
        console.log('Validation errors:', validationErrors);
        const errorMap: { [key: string]: string } = {};

        validationErrors.forEach(error => {
            // Customize error message for staffId
            if (error.field === 'staffId') {
                errorMap[error.field] = 'Please select a staff member from the search results';
            }
            if (error.field === 'dateLogic') {
                // Map dateLogic errors to appropriate fields based on shift type
                if (formData.shiftType === 'Regular') {
                    errorMap['dayOfWeeks'] = error.message;
                } else if (formData.shiftType === 'Emergency') {
                    errorMap['specificDate'] = error.message;
                }
            }
            if (error.field === 'timeRangeSelection') {
                errorMap['timeRangeSelection'] = error.message;
            }
            else {
                errorMap[error.field] = error.message;
            }
        });

        setErrors(errorMap);
        console.log('Error map:', errorMap);
        return validationErrors.length === 0;
    };

    const handleSubmit = () => {
        console.log('Submitting form data:', formData);

        if (!validateForm()) {
            console.log('Form validation failed. Current errors:', errors);
            return;
        }

        console.log('Form validation passed, saving...');
        if (mode === 'add') {
            onSave(formData as CreateStaffShift);
        } else {
            if (formData.shiftType === 'Regular') {
                handleInputChange('specificDate', null);
            } else if (formData.shiftType === 'Emergency') {
                handleInputChange('dayOfWeeks', null);
            }
            onSave(formData as StaffShift);
        }
    };

    const formatTimeForInput = (minutes: number) => {
        return TimeUtils.minutesToTime(minutes);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xl'>
            <ModalContent>
                <ModalHeader>
                    {mode === 'add' ? 'Add New Staff Shift' : 'Edit Staff Shift'}
                </ModalHeader>
                <ModalBody>
                    {/* Error Summary */}
                    {/* {Object.keys(errors).length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="text-red-800 font-medium mb-2">Please fix the following errors:</div>
                            <ul className="text-red-700 text-sm space-y-1">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>• {message}</li>
                                ))}
                            </ul>
                        </div>
                    )} */}

                    <div className="space-y-4">
                        {/* Staff ID */}
                        {/* <Input
                            label="Staff ID"
                            value={formData.staffId || ''}
                            onChange={(e) => handleInputChange('staffId', e.target.value)}
                            isInvalid={!!errors.staffId}
                            errorMessage={errors.staffId}
                            
                            placeholder="Enter staff ID"
                            
                        /> */}

                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="search-staff-input">
                                Search Staff *
                            </label>
                            <Input
                                id="search-staff-input"
                                data-testid="search-staff-input"
                                placeholder="Search by name, email or phone"
                                type="text"
                                value={keySearchStaff}
                                onChange={(e) => setKeySearchStaff(e.target.value)}
                                isInvalid={!!errors.staffId || !!searchError}
                                errorMessage={errors.staffId || searchError}
                            />
                        </div>
                        {/* Selected User */}
                        {formData.staffId && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-md">
                                <div className="font-medium">
                                    Selected: {selectedStaff?.user?.fullName || ''}
                                </div>
                                <div className="text-sm text-gray-600">{selectedStaff?.user?.email || ''}</div>
                                <div className="text-sm text-gray-600">{formatPhoneNumber(selectedStaff?.user?.phone || '')}</div>
                            </div>
                            // (shift && mode === 'edit' && shift.staff) ?
                            // <>

                            //     <div className="mb-4 p-3 bg-blue-50 rounded-md">
                            //         <div className="font-medium">
                            //             Selected: {shift.staff?.user?.fullName || ''}
                            //         </div>
                            //         <div className="text-sm text-gray-600">{shift.staff?.user?.email || ''}</div>
                            //         <div className="text-sm text-gray-600">{formatPhoneNumber(shift.staff?.user?.phone || '')}</div>
                            //     </div>
                            // </>
                            // :
                            // <>
                            //     <div className="mb-4 p-3 bg-blue-50 rounded-md">
                            //         <div className="font-medium">
                            //             Selected: {selectedStaff?.user?.fullName || ''}
                            //         </div>
                            //         <div className="text-sm text-gray-600">{selectedStaff?.user?.email || ''}</div>
                            //         <div className="text-sm text-gray-600">{formatPhoneNumber(selectedStaff?.user?.phone || '')}</div>
                            //     </div>
                            // </>
                        )}



                        {/* Search Results */}
                        {loading ? (
                            // if loading
                            <div className="flex justify-center items-center mb-4"><Spinner size="sm" /></div>
                        ) : searchError ? (
                            <div className="mb-4 text-sm text-red-500">{searchError}</div>
                        ) : staffList.length > 0 ? (
                            <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                                {staffList.map((staff) => (
                                    <div
                                        key={staff.staffId}
                                        className={`p-3 cursor-pointer hover:bg-gray-50 ${formData.staffId === staff.staffId ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                                        onClick={() => handleStaffSelection(staff.staffId)}
                                    >
                                        <div className="font-medium">{staff.user?.fullName || ''}</div>
                                        <div className="text-sm text-gray-500">{staff.user?.email || ''}</div>
                                        <div className="text-sm text-gray-500">{formatPhoneNumber(staff.user?.phone || '')}</div>
                                    </div>
                                ))}
                            </div>
                        ) : keySearchStaff && !loading ? (
                            <div className="mb-4 text-sm text-gray-500">No results found</div>
                        ) : null}
                        {/* Parking Lot ID */}
                        {/* <Input
                            label="Parking Lot ID"
                            value={formData.parkingLotId || ''}
                            onChange={(e) => handleInputChange('parkingLotId', e.target.value)}
                            isInvalid={!!errors.parkingLotId}
                            errorMessage={errors.parkingLotId}
                            placeholder="Enter parking lot ID"
                        /> */}

                        {/* Time Range */}
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="timerange">
                                Time Range *
                            </label>
                            <Select
                                aria-label="timerange"
                                id="timerange"
                                selectedKeys={formData.startTime !== undefined && formData.endTime !== undefined ?
                                    [`${formData.startTime}-${formData.endTime}`] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    if (selected === 'custom') {
                                        // Keep current values for custom or set defaults
                                        if (formData.startTime === undefined || formData.endTime === undefined) {
                                            handleInputChange('startTime', 480); // 8:00 AM default
                                            handleInputChange('endTime', 960);   // 4:00 PM default
                                        }
                                    } else if (selected) {
                                        const [startTime, endTime] = selected.split('-').map(Number);
                                        handleInputChange('startTime', startTime);
                                        handleInputChange('endTime', endTime);
                                    }
                                }}
                                isInvalid={!!errors.startTime || !!errors.endTime || !!errors.timeRangeSelection}
                                errorMessage={errors.startTime || errors.endTime || errors.timeRangeSelection}
                                placeholder="Select a time range"
                            >
                                <SelectItem key="0-0" aria-label="0-0" hidden>select a time range</SelectItem>
                                <SelectItem key="360-599" aria-label="360-600">(6:00 AM - 10:00 AM)</SelectItem>
                                <SelectItem key="600-839" aria-label="600-840">Late Morning (10:00 AM - 2:00 PM)</SelectItem>
                                <SelectItem key="840-1079" aria-label="840-1080">Early Afternoon (2:00 PM - 6:00 PM)</SelectItem>
                                <SelectItem key="1080-1319" aria-label="1080-1320">Late Afternoon (6:00 PM - 10:00 PM)</SelectItem>
                                <SelectItem key="1320-119" aria-label="1320-120">Early Night (10:00 PM - 2:00 AM)</SelectItem>
                                <SelectItem key="120-359" aria-label="120-360">Late Night (2:00 AM - 6:00 AM)</SelectItem>
                                {/* <SelectItem key="custom">Custom Time Range</SelectItem> */}
                            </Select>
                        </div>
                        {/* Time Range
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Start Time *
                                </label>
                                <Input
                                    type="time"
                                    value={formatTimeForInput(formData.startTime || 0)}
                                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                    isInvalid={!!errors.startTime}
                                    errorMessage={errors.startTime}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    End Time *
                                </label>
                                <Input
                                    type="time"
                                    value={formatTimeForInput(formData.endTime || 0)}
                                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                    isInvalid={!!errors.endTime}
                                    errorMessage={errors.endTime}
                                />
                            </div>
                        </div>
 */}
                        <div className='flex flex-row gap-4'>

                            {/* Shift Type */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    Shift Type *
                                </label>
                                <Select
                                    aria-label="shift-type"
                                    selectedKeys={[formData.shiftType || 'Regular']}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        handleShiftTypeChange(selected);
                                    }}
                                    isInvalid={!!errors.shiftType}
                                    errorMessage={errors.shiftType}
                                >
                                    <SelectItem key="Regular" aria-label="Regular">Regular</SelectItem>
                                    <SelectItem key="Emergency" aria-label="Emergency">Emergency</SelectItem>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    Status *
                                </label>


                                <Select
                                    aria-label='status'
                                    selectedKeys={[formData.status || 'Scheduled']}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        handleInputChange('status', selected);
                                    }}
                                    isInvalid={!!errors.status}
                                    errorMessage={errors.status}
                                >
                                    <SelectItem key="Scheduled" aria-label="Scheduled">Scheduled</SelectItem>
                                    <SelectItem key="Active" aria-label="Active">Active</SelectItem>
                                    <SelectItem key="Deactive" aria-label="Deactive">Deactive</SelectItem>
                                </Select>
                            </div>
                        </div>


                        {/* Days of Week - Show only for Regular shifts */}
                        {formData.shiftType === 'Regular' && (
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="days-of-week">
                                    Days of Week *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Checkbox
                                        isSelected={selectedDays.includes(1)}
                                        onValueChange={(isSelected) => handleDaySelection(1, isSelected)}
                                    >
                                        Monday
                                    </Checkbox>
                                    <Checkbox
                                        isSelected={selectedDays.includes(2)}
                                        onValueChange={(isSelected) => handleDaySelection(2, isSelected)}
                                    >
                                        Tuesday
                                    </Checkbox>
                                    <Checkbox
                                        isSelected={selectedDays.includes(3)}
                                        onValueChange={(isSelected) => handleDaySelection(3, isSelected)}
                                    >
                                        Wednesday
                                    </Checkbox>
                                    <Checkbox
                                        isSelected={selectedDays.includes(4)}
                                        onValueChange={(isSelected) => handleDaySelection(4, isSelected)}
                                    >
                                        Thursday
                                    </Checkbox>
                                    <Checkbox
                                        isSelected={selectedDays.includes(5)}
                                        onValueChange={(isSelected) => handleDaySelection(5, isSelected)}
                                    >
                                        Friday
                                    </Checkbox>
                                    <Checkbox
                                        isSelected={selectedDays.includes(6)}
                                        onValueChange={(isSelected) => handleDaySelection(6, isSelected)}
                                    >
                                        Saturday
                                    </Checkbox>
                                    <Checkbox
                                        isSelected={selectedDays.includes(7)}
                                        onValueChange={(isSelected) => handleDaySelection(7, isSelected)}
                                    >
                                        Sunday
                                    </Checkbox>
                                </div>
                                {errors.dayOfWeeks && (
                                    <div className="text-danger text-sm mt-1">{errors.dayOfWeeks}</div>
                                )}
                            </div>
                        )}

                        {/* Specific Date - Show only for Emergency shifts */}
                        {formData.shiftType === 'Emergency' && (
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="specific-date">
                                    Specific Date *
                                </label>
                                <Input
                                    id="specific-date"
                                    type="date"
                                    value={formData.specificDate || ''}
                                    onChange={(e) => handleInputChange('specificDate', e.target.value)}
                                    isInvalid={!!errors.specificDate}
                                    errorMessage={errors.specificDate}
                                />
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="notes">
                                Notes
                            </label>
                            <Textarea
                                id="notes"
                                value={formData.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                isInvalid={!!errors.notes}
                                errorMessage={errors.notes}
                                placeholder="Optional notes about this shift"
                                maxLength={500}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onOpenChange}>
                        Cancel
                    </Button>
                    <Button color="primary" onPress={handleSubmit} className='text-background'>
                        {mode === 'add' ? 'Save' : 'Update'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default StaffShiftModal; 