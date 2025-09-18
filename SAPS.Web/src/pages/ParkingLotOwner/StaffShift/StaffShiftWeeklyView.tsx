import React, { useState } from 'react';
import { Clock, Edit2, Plus, Trash2, User, AlertTriangle, RefreshCw } from 'lucide-react';
import { StaffShift } from '@/services/parkinglot/staffShift';
import { Button } from '@heroui/react';
import { TimeUtils } from '@/components/utils/staffShiftValidator';

export interface StaffShiftWeeklyViewProps {
    shiftsData: StaffShift[];
    onEdit: (shift: StaffShift) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    onRefresh?: () => void;
    selectedShiftType?: 'Regular' | 'Emergency' | 'All';
    loading?: boolean;
}

const StaffShiftWeeklyView: React.FC<StaffShiftWeeklyViewProps> = ({
    shiftsData,
    onEdit,
    onDelete,
    onAdd,
    onRefresh,
    selectedShiftType = 'All',
    loading = false
}) => {
    const [hoveredShift, setHoveredShift] = useState<string | null>(null);
    const [shiftTypeFilter] = useState<'Regular' | 'Emergency' | 'All'>(selectedShiftType);



    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // const hours = Array.from({ length: 24 }, (_, i) => i);

    const minutesToTime = (minutes: number): string => {
        return TimeUtils.minutesToTime(minutes);
    };

    const getFilteredShifts = () => {
        return shiftsData.filter(shift => {
            if (shiftTypeFilter === 'All') return true;
            return shift.shiftType === shiftTypeFilter;
        });
    };

    const getShiftsForDay = (dayIndex: number) => {
        return getFilteredShifts().filter(shift => {
            // If no specific days are set, apply to all days
            if (!shift.dayOfWeeks || shift.dayOfWeeks.trim() === '') {
                return true;
            }
            // Parse comma-separated day numbers (1=Monday, 7=Sunday)
            const dayNumbers = shift.dayOfWeeks.split(',').map(d => parseInt(d.trim()));
            return dayNumbers.includes(dayIndex + 1); // Convert to 1-based indexing
        });
    };



    const getShiftStyle = (shift: StaffShift) => {
        const baseStyle = {
            backgroundColor: shift.shiftType === 'Emergency' ? '#fef3c7' : '#dbeafe',
            borderColor: shift.shiftType === 'Emergency' ? '#f59e0b' : '#3b82f6',
            color: shift.shiftType === 'Emergency' ? '#92400e' : '#1e40af'
        };

        if (shift.status === 'Active') {
            baseStyle.backgroundColor = shift.shiftType === 'Emergency' ? '#fef3c7' : '#dcfce7';
            baseStyle.borderColor = shift.shiftType === 'Emergency' ? '#f59e0b' : '#16a34a';
            baseStyle.color = shift.shiftType === 'Emergency' ? '#92400e' : '#15803d';
        } else if (shift.status === 'Deactive') {
            baseStyle.backgroundColor = '#f3f4f6';
            baseStyle.borderColor = '#9ca3af';
            baseStyle.color = '#6b7280';
        }

        return baseStyle;
    };



    return (
        <div className="rounded-xl shadow-sm border border-primary-200/10 my-3 p-3">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Weekly Staff Schedule</h2>

                    {/* Shift Type Filter */}
                    {/* <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Shift Type:</span>
                        <Select
                            aria-label="Shift Type"
                            className="text-sm w-44 rounded px-2 py-1"
                            selectedKeys={[shiftTypeFilter]}
                            defaultSelectedKeys={[shiftTypeFilter]}
                            onSelectionChange={(e) => setShiftTypeFilter(e.currentKey as 'Regular' | 'Emergency' | 'All')}
                        >
                            {shiftTypeOptions.map((item) =>
                                <SelectItem key={item.key} aria-label={item.label}>{item.label}</SelectItem>
                            )}
                        </Select>
                    </div> */}
                </div>

                <div className="flex gap-2">
                    {onRefresh && (
                        <Button
                            onPress={onRefresh}
                            variant="bordered"
                            className=""
                            startContent={<RefreshCw size={16} />}
                            isDisabled={loading}
                        >
                            Refresh
                        </Button>
                    )}
                    <Button
                        onPress={onAdd}
                        className=""
                        startContent={<Plus size={16} />}
                    >
                        Add Shift
                    </Button>
                </div>
            </div>

          

            {/* Weekly Grid - Horizontal Days, Vertical Time Slots */}
            <div className="space-y-2 ">
                {/* Time Slots Configuration */}
                {(() => {
                    const timeSlots = [
                        { label: '12:00 AM - 4:00 AM', start: 0, end: 240 },     // 00:00-04:00
                        { label: '4:00 AM - 8:00 AM', start: 240, end: 480 },    // 04:00-08:00
                        { label: '8:00 AM - 12:00 PM', start: 480, end: 720 },   // 08:00-12:00
                        { label: '12:00 PM - 4:00 PM', start: 720, end: 960 },   // 12:00-16:00
                        { label: '4:00 PM - 8:00 PM', start: 960, end: 1200 },   // 16:00-20:00
                        { label: '8:00 PM - 12:00 AM', start: 1200, end: 1439 }  // 20:00-24:00 (end exclusive)
                    ];

                    return (
                        <div className="overflow-x-auto">
                            <div className="min-w-max">
                                {/* Header Row - Days of Week */}
                                <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '150px repeat(7, 140px)' }}>
                                    <div className="flex items-center justify-center py-3 px-2 bg-gray-100 rounded-md font-medium text-gray-700">
                                        Time Slots
                                    </div>
                                    {daysOfWeek.map((day) => (
                                        <div key={day} className="flex items-center justify-center py-3 px-2 bg-gray-50 rounded-md">
                                            <span className="font-medium text-gray-700">{day}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Time Slot Rows */}
                                {timeSlots.map((timeSlot, slotIndex) => (
                                    <div key={slotIndex} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '150px repeat(7, 140px)' }}>
                                        {/* Time Slot Label */}
                                        <div className="flex items-center justify-center py-4 px-2 bg-gray-100 rounded-md">
                                            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                                                {timeSlot.label}
                                            </span>
                                        </div>

                                        {/* Day Columns */}
                                        {daysOfWeek.map((day, dayIndex) => {
                                            // Get shifts for this day that fall within this time slot
                                            const dayShifts = getShiftsForDay(dayIndex);
                                            const timeSlotShifts = dayShifts.filter(shift => {
                                                // Handle overnight shifts (cross midnight)
                                                if (timeSlot.start > timeSlot.end) {
                                                    return (shift.startTime >= timeSlot.start || shift.endTime <= timeSlot.end) ||
                                                        (shift.startTime < timeSlot.end && shift.endTime > timeSlot.start);
                                                }
                                                // Regular shifts (same day)
                                                return (shift.startTime < timeSlot.end && shift.endTime > timeSlot.start);
                                            });

                                            return (
                                                <div key={`${day}-${slotIndex}`} className="relative min-h-16 bg-gray-50 rounded-md border border-gray-200 p-1">
                                                    {/* Shifts in this time slot */}
                                                    {timeSlotShifts.map((shift) => (
                                                        <div
                                                            key={shift.id}
                                                            className={`relative w-full mb-1 p-2 rounded-md border-2 cursor-pointer transition-all duration-200 ${hoveredShift === shift.id ? 'z-10 scale-105 shadow-lg' : ''
                                                                }`}
                                                            style={{
                                                                minHeight: '48px',
                                                                ...getShiftStyle(shift)
                                                            }}
                                                            onMouseEnter={() => setHoveredShift(shift.id)}
                                                            onMouseLeave={() => setHoveredShift(null)}
                                                        >
                                                            <div className="h-full flex flex-col justify-center">
                                                                <div className="text-xs font-medium truncate flex items-center gap-1 mb-1">
                                                                    {shift.shiftType === 'Emergency' ? (
                                                                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                                                    ) : (
                                                                        <User className="w-3 h-3 flex-shrink-0" />
                                                                    )}
                                                                    <span className="truncate">{shift.assignedStaff?.map(staff => staff.user?.fullName).join(', ') || 'staff shift'}</span>
                                                                </div>
                                                                <div className="text-xs opacity-75 flex items-center gap-1 mb-1">
                                                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                                                    <span className="truncate">
                                                                        {minutesToTime(shift.startTime)} - {minutesToTime(shift.endTime)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs opacity-75 truncate">
                                                                    {shift.status}
                                                                </div>
                                                            </div>

                                                            {/* Hover Actions */}
                                                            {hoveredShift === shift.id && (
                                                                <div className="absolute top-[-10px] right-[30px] transform translate-x-full -translate-y-1 flex gap-1 z-30">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onEdit(shift);
                                                                        }}
                                                                        className="p-1 bg-secondary/40 backdrop-blur-xl text-white rounded-md hover:bg-primary
                                                                         transition-colors"
                                                                    >
                                                                        <Edit2 className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onDelete(shift.id);
                                                                        }}
                                                                        className="p-1 bg-danger/30 backdrop-blur-xl text-white rounded-md hover:bg-danger transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Empty State */}
                                                    {timeSlotShifts.length === 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                                            No shifts
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}
            </div>
            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shift Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {getFilteredShifts().map((shift) => (
                        <div
                            key={shift.id}
                            className="p-2 rounded-md border-2"
                            style={getShiftStyle(shift)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {shift.shiftType === 'Emergency' ? (
                                        <AlertTriangle className="w-3 h-3" />
                                    ) : (
                                        <User className="w-3 h-3" />
                                    )}
                                    <span className="font-medium">{shift.assignedStaff?.map(staff => staff.user?.fullName).join(', ') || 'staff shift'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs">
                                        {minutesToTime(shift.startTime)} - {minutesToTime(shift.endTime)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-1 text-sm">
                                <div className="text-xs opacity-75">
                                    Status: {shift.status}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                    {shift.dayOfWeeks && shift.dayOfWeeks.trim() !== ''
                                        ? shift.dayOfWeeks.split(',').map(d => {
                                            const dayNum = parseInt(d.trim());
                                            return daysOfWeek[dayNum - 1]; // Convert back to 0-based
                                        }).join(', ')
                                        : 'All days'}
                                </div>
                                {shift.notes && (
                                    <div className="text-xs opacity-75 mt-1 truncate">
                                        {shift.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StaffShiftWeeklyView; 