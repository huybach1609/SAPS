import React, { useState, useEffect } from 'react';
import { Clock, Edit2, Loader2, Plus, Trash2, User, AlertTriangle, RefreshCw } from 'lucide-react';
import { StaffShift } from '@/services/parkinglot/staffShift';
import { Button, Select, SelectItem, Skeleton } from '@heroui/react';
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
    const [shiftTypeFilter, setShiftTypeFilter] = useState<'Regular' | 'Emergency' | 'All'>(selectedShiftType);



    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

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

    const getTimePosition = (minutes: number) => {
        return (minutes / 1440) * 100; // 1440 minutes in a day
    };

    const getShiftWidth = (startTime: number, endTime: number) => {
        const duration = endTime - startTime;
        return (duration / 1440) * 100;
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

    const shiftTypeOptions = [
        { label: 'All Shifts', key: 'All' },
        { label: 'Regular', key: 'Regular' },
        { label: 'Emergency', key: 'Emergency' }
    ];

    return (
        <div className="rounded-xl shadow-sm border border-primary-200/10 my-3 p-3">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Weekly Staff Schedule</h2>

                    {/* Shift Type Filter */}
                    <div className="flex items-center gap-2">
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
                    </div>
                </div>

                <div className="flex gap-2">
                    {onRefresh && (
                        <Button
                            onPress={onRefresh}
                            variant="bordered"
                            className=""
                            startContent={<RefreshCw className="w-4 h-4" />}
                            isDisabled={loading}
                        >
                            Refresh
                        </Button>
                    )}
                    <Button
                        onPress={onAdd}
                        className=""
                        startContent={<Plus className="w-4 h-4" />}
                    >
                        Add Shift
                    </Button>
                </div>
            </div>

            {/* Time Header */}
            <div className="mb-4 pr-10 mr-10">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div></div>
                    <div className="relative">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(hour => (
                                <div key={hour} className="flex flex-col items-center">
                                    <span>{hour}</span>
                                    <span className="text-gray-400">
                                        {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-gray-300"></div>
                    </div>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="space-y-2  pr-10 mr-10">
                {daysOfWeek.map((day, dayIndex) => {
                    const dayShifts = getShiftsForDay(dayIndex);

                    return (
                        <div key={day} className="grid grid-cols-[120px_1fr] gap-2">
                            <div className="flex items-center py-3 px-2 bg-gray-50 rounded-l-md">
                                <span className="font-medium text-gray-700">{day}</span>
                            </div>

                            <div className="relative min-h-20 bg-gray-50 rounded-r-md border border-gray-200">
                                {/* Hour Grid Lines */}
                                {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(hour => (
                                    <div
                                        key={hour}
                                        className="absolute top-0 bottom-0 w-px bg-gray-200"
                                        style={{ left: `${(hour / 24) * 100}%` }}
                                    />
                                ))}

                                {/* Staff Shifts */}
                                {dayShifts.map((shift, index) => {
                                    const left = getTimePosition(shift.startTime);
                                    const width = getShiftWidth(shift.startTime, shift.endTime);

                                    return (
                                        <div
                                            key={shift.id}
                                            className={`absolute top-1 bottom-1 p-2 rounded-md border-2 cursor-pointer transition-all duration-200 ${hoveredShift === shift.id ? 'z-10 scale-105 shadow-lg' : ''}`}
                                            style={{
                                                height: 'auto',
                                                minHeight: '56px',
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                minWidth: '60px',
                                                ...getShiftStyle(shift)
                                            }}
                                            onMouseEnter={() => setHoveredShift(shift.id)}
                                            onMouseLeave={() => setHoveredShift(null)}
                                        >
                                            <div className="h-full p-1 flex flex-col justify-center">
                                                <div className="text-xs font-medium truncate flex items-center gap-1">
                                                    {shift.shiftType === 'Emergency' ? (
                                                        <AlertTriangle className="w-3 h-3" />
                                                    ) : (
                                                        <User className="w-3 h-3" />
                                                    )}
                                                    <span>{shift.staff?.user?.fullName || 'staff shift'}</span>
                                                </div>
                                                <div className="text-xs opacity-75 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="whitespace-nowrap">
                                                        {minutesToTime(shift.startTime)} - {minutesToTime(shift.endTime)}
                                                    </span>
                                                </div>
                                                <div className="text-xs opacity-75">
                                                    {shift.status}
                                                </div>
                                            </div>

                                            {/* Hover Actions */}
                                            {hoveredShift === shift.id && (
                                                <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1 flex gap-1 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(shift);
                                                        }}
                                                        className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(shift.id);
                                                        }}
                                                        className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Empty State */}
                                {dayShifts.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                        No shifts
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shift Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {getFilteredShifts().map((shift, index) => (
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
                                    <span className="font-medium">{shift.staff?.user?.fullName || 'staff shift'}</span>
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