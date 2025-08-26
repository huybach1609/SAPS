import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Textarea, Checkbox, ScrollShadow, Divider } from '@heroui/react';
import { StaffShift, CreateStaffShift } from '@/services/parkinglot/staffShift';
import { StaffShiftValidator } from '@/components/utils/staffShiftValidator';
import { StaffProfile } from '@/types/User';
import { formatPhoneNumber } from '@/components/utils/stringUtils';
import { Trash } from 'lucide-react';
import { fetchStaffDetail, fetchStaffList } from '@/services/parkinglot/staffService';

interface StaffShiftModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    onSave: (shiftData: StaffShift | CreateStaffShift) => void;
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
        staffIds: [],
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

    // search staff
    const [keySearchStaff, setKeySearchStaff] = useState<string>('');
    // selected staff list
    const [selectedStaffs, setSelectedStaffs] = useState<StaffProfile[]>([]);

    // loading for search staff
    const [loading, setLoading] = useState<boolean>(false);
    const [staffList, setStaffList] = useState<StaffProfile[]>([]);
    const [searchError, setSearchError] = useState<string>('');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
    }, [parkingLotId]);

    useEffect(() => {
        const handleSearchUser = async (term: string) => {
            // console.log(term);
            if (keySearchStaff === '') {
                setStaffList([]);
                setSearchError('');
                return;
            }
            setLoading(true);
            setSearchError('');
            try {
                const response = await fetchStaffList(
                    parkingLotId,
                    10, // default pageSize
                    1, // pageNumber
                    keySearchStaff, // searchCriteria
                    undefined, // status
                    undefined, // order
                    undefined // sortBy
                );

                if (!response.items || response.items.length === 0) {
                    setStaffList([]);
                    return;
                }

                // Map the response items to StaffProfile format
                const mappedStaffList: StaffProfile[] = response.items.map(user => ({
                    userId: user.id,
                    staffId: user.staffId || '',
                    parkingLotId: parkingLotId,
                    status: user.status || '',
                    user: user,
                }));

                setSearchError('');
                setStaffList(mappedStaffList);
            } catch (error) {
                console.error("Failed to search staff:", error);
                setSearchError('Failed to search staff. Please try again.');
                setStaffList([]);
            } finally {
                setLoading(false);
            }
        };
        // console.log("shift", shift);
        const timeoutId = setTimeout(() => {
            if (keySearchStaff) {
                handleSearchUser(keySearchStaff);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [keySearchStaff, parkingLotId]);



    useEffect(() => {
        // console.log("shift", shift);
        if (shift && mode === 'edit') {

            // Fetch staff details for each staff ID
            const fetchStaffDetails = async () => {
                if (shift.staffIds && shift.staffIds.length > 0) {
                    try {
                        const staffDetailsPromises = shift.staffIds.map(staffId => fetchStaffDetail(staffId));
                        const staffDetails = await Promise.all(staffDetailsPromises);

                        // Map the fetched staff details to StaffProfile format
                        const mappedStaffs: StaffProfile[] = staffDetails.map(staff => ({
                            userId: staff.id,
                            staffId: staff.staffId || '',
                            parkingLotId: parkingLotId,
                            status: staff.status || '',
                            user: staff,
                        }));

                        setSelectedStaffs(mappedStaffs);
                    } catch (error) {
                        console.error("Error fetching staff details:", error);
                        // Fallback to assignedStaff if available
                        setSelectedStaffs(shift?.assignedStaff || []);
                    }
                } else {
                    setSelectedStaffs(shift?.assignedStaff || []);
                }
            };

            fetchStaffDetails();


            // staff id 
            setFormData({
                id: shift.id,
                staffIds: shift.staffIds || shift.assignedStaff?.map(staff => staff.staffId) || [],
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
                staffIds: [],
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

    const handleStaffSelection = (staffId: string, staff: StaffProfile) => {
        // Check if staff is already selected
        const isAlreadySelected = selectedStaffs.some(selectedStaff => selectedStaff.staffId === staffId);

        if (isAlreadySelected) {
            // If already selected, remove from selection
            setSelectedStaffs(prev => prev.filter(s => s.staffId !== staffId));
            // Clear staffId if no staff is selected
            if (selectedStaffs.length === 1) {
                handleInputChange('staffIds', []);
            }
        } else {
            // If not selected, add to selection
            handleInputChange('staffIds', [...selectedStaffs.map(s => s.staffId), staffId]);
            setSelectedStaffs(prev => [...prev, staff]);
        }

        // Clear the search input after selection
        setKeySearchStaff('');
        setStaffList([]);
        setSearchError('');
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
            if (error.field === 'staffIds') {
                errorMap[error.field] = 'Please select a staff member from the search results';
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
        // console.log('Submitting form data:', formData);

        if (!validateForm()) {
            console.log('Form validation failed. Current errors:', errors);
            return;
        }

        console.log('Form validation passed, saving...');
        if (mode === 'add') {
            onSave(formData as CreateStaffShift);
            setKeySearchStaff('');
            setStaffList([]);
            setSearchError('');

        } else {
            const newStaffIds = selectedStaffs.map(s => s.staffId);

            // Ensure proper data structure for the API
            const updatedFormData = {
                id: formData.id,
                startTime: formData.startTime,
                endTime: formData.endTime,
                shiftType: formData.shiftType,
                dayOfWeeks: formData.shiftType === 'Regular' ? formData.dayOfWeeks : '',
                specificDate: formData.shiftType === 'Emergency' ? formData.specificDate : null,
                isActive: formData.isActive,
                status: formData.status,
                notes: formData.notes || '',
                staffIds: newStaffIds
            };
            // console.log('Updated form data:', updatedFormData);

            onSave(updatedFormData as StaffShift);
        }

    };

    // const formatTimeForInput = (minutes: number) => {
    //     return TimeUtils.minutesToTime(minutes);
    // };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xl'>
            <ModalContent>
                <ModalHeader>
                    {mode === 'add' ? 'Add New Staff Shift' : 'Edit Staff Shift'}
                </ModalHeader>
                <ModalBody>


                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="search-staff-input">
                                Search Staff *
                            </label>
                            <Input
                                id="search-staff-input"
                                data-testid="search-staff-input"
                                placeholder="Search by email, phone or citizen ID"
                                type="text"
                                value={keySearchStaff}
                                onChange={(e) => setKeySearchStaff(e.target.value)}
                                isInvalid={!!errors.staffIds || !!searchError}
                                errorMessage={errors.staffIds || searchError}
                            />
                        </div>
                        {/* Selected User */}
                        {formData.staffIds != null && formData.staffIds.length > 0 && (
                            <div key={formData.staffIds.join(',')}>
                                <div className="block text-sm font-medium ">
                                    Selected Staff
                                </div>
                                <div className="mb-4 p-3 bg-blue-50 rounded-md ">
                                    {selectedStaffs.map((staff) => {
                                        return (
                                            <>
                                                <div key={staff.staffId} className="flex justify-between">
                                                    <div className='flex items-center gap-2'>

                                                        <div className="font-medium text-sm">
                                                            {staff.user?.fullName || ''}
                                                        </div>
                                                        <div className="text-sm text-gray-600">{staff.user?.email || ''}</div>
                                                        <div className="text-sm text-gray-600">{formatPhoneNumber(staff.user?.phoneNumber || '')}</div>
                                                    </div>
                                                    <Button isIconOnly variant="light" size="sm" color="danger" onPress={() => {
                                                        setSelectedStaffs(prev => {
                                                            const newSelectedStaffs = prev.filter(s => s.staffId !== staff.staffId);
                                                            // Clear staffId if no staff is selected
                                                            if (newSelectedStaffs.length === 0) {
                                                                handleInputChange('staffIds', []);
                                                            }
                                                            return newSelectedStaffs;
                                                        });
                                                    }}>
                                                        <Trash size={16} />
                                                    </Button>

                                                </div>
                                                <Divider className="bg-primary-900/20" />
                                            </>
                                        )
                                    })}

                                </div>
                            </div>

                        )}



                        {/* Search Results */}
                        {loading ? (
                            // if loading
                            <div className="flex justify-center items-center mb-4"><Spinner size="sm" /></div>
                        ) : searchError ? (
                            <div className="mb-4 text-sm text-red-500">{searchError}</div>
                        ) : staffList.length > 0 ? (
                            <ScrollShadow className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-primary-300/30">
                                {staffList.map((staff) => {
                                    const isSelected = selectedStaffs.some(selectedStaff => selectedStaff.staffId === staff.staffId);
                                    return (
                                        <div
                                            key={staff.staffId}
                                            className={`p-3 cursor-pointer flex items-center gap-2
                                                hover:bg-primary-300/40
                                                ${isSelected ? "bg-green-50 border-l-4 border-green-500" : "hover:bg-primary-300/40"}`}
                                            onClick={() => handleStaffSelection(staff.staffId, staff)}
                                        >
                                            <div className="font-medium text-sm">{staff.user?.fullName || ''}</div>
                                            <div className="text-sm text-gray-500">{staff.user?.email || ''}</div>
                                            <div className="text-sm text-gray-500">{formatPhoneNumber(staff.user?.phoneNumber || '')}</div>
                                            {isSelected && (
                                                <div className="ml-auto text-sm text-green-600 font-medium">
                                                    ✓ Selected
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </ScrollShadow>
                        ) : keySearchStaff && !loading ? (
                            <div className="mb-4 text-sm text-gray-500">No results found</div>
                        ) : null}


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
                        <div className='flex-row gap-4 hidden'>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    Shift Type *
                                </label>
                                <Select
                                    aria-label="shift-type"
                                    selectedKeys={['Regular']}
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
                            {/* <div className="flex-1 ">
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
                            </div> */}
                        </div>


                        {/* Days of Week - Show only for Regular shifts */}
                        {(
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