import React, { useState } from 'react';
import { BikeIcon, Car, Clock, DollarSign, Edit2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { VehicleType, type ParkingFeeSchedule } from '@/services/parkinglot/parkinglotFeeService';
import { Button, Select, SelectItem, Spinner } from '@heroui/react';
import { VehicleTypeText } from './FeeScheduleModal';
import { getScheduleStyle } from '@/utils/scheduleColorUtils';

export interface ParkingFeeWeeklyViewProps {
    schedulesData: ParkingFeeSchedule[];
    onEdit: (schedule: ParkingFeeSchedule) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    onRefresh?: () => void;
    selectedVehicleType?: VehicleType;
    loading?: boolean;

}

const ParkingFeeWeeklyView: React.FC<ParkingFeeWeeklyViewProps> = ({
    schedulesData,
    onEdit,
    onDelete,
    onAdd,
    onRefresh,
    selectedVehicleType = VehicleType.Motorbike,
    loading = false
}) => {
    const [hoveredSchedule, setHoveredSchedule] = useState<string | null>(null);
    const [vehicleFilter, setVehicleFilter] = useState<VehicleType>(selectedVehicleType);


    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // const hours = Array.from({ length: 24 }, (_, i) => i);

    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const getFilteredSchedules = () => {
        return schedulesData.filter(schedule => {
            if (!schedule.isActive) return false;
            if (vehicleFilter === VehicleType.All) return true;
            return schedule.forVehicleType === vehicleFilter;
        });
    };

    const getSchedulesForDay = (dayIndex: number) => {
        return getFilteredSchedules().filter(schedule => {
            // If no specific days are set, apply to all days
            if (!schedule.dayOfWeeks || schedule.dayOfWeeks.length === 0) {
                return true;
            }
            return schedule.dayOfWeeks.includes(dayIndex);
        });
    };



    const getTimePosition = (minutes: number) => {
        return (minutes / 1440) * 100; // 1440 minutes in a day
    };

    const getScheduleWidth = (startTime: number, endTime: number) => {
        const duration = endTime - startTime;
        return (duration / 1440) * 100;
    };

    const formatFeeDisplay = (schedule: ParkingFeeSchedule) => {
        if (schedule.additionalFee === 0) {
            return `${schedule.initialFee}đ/entry`;
        }
        return `${schedule.initialFee}đ + ${schedule.additionalFee}đ/${schedule.additionalMinutes}min`;
    };

    const vehicleTypeOptions = [
        // { label: 'All', key: VehicleType.All },
        { label: 'Car', key: VehicleType.Car },
        { label: 'Motorbike', key: VehicleType.Motorbike }
    ]
    if (loading) {
        return <Spinner />
    }
    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-foreground">Weekly Fee Schedule</h2>

                    {/* Vehicle Type Filter */}
                    <div className="flex items-center gap-2">
                        {/* <span className="text-sm text-foreground">Vehicle:</span> */}
                        <Select
                            aria-label="Vehicle Type"
                            className="text-sm w-44 rounded px-2 py-1"
                            selectedKeys={[vehicleFilter.toString()]}
                            defaultSelectedKeys={[vehicleFilter.toString()]}
                            onSelectionChange={(e) => setVehicleFilter(parseInt(e.currentKey as string) as VehicleType)}
                            selectionMode='single'
                            disallowEmptySelection={true}
                        >
                            {vehicleTypeOptions.map((item) =>
                                <SelectItem key={item.key} aria-label={item.label}>{item.label}</SelectItem>)}
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onPress={onRefresh}
                        isDisabled={!onRefresh || loading}
                        variant="flat"
                        startContent={<RefreshCw size={16} />}
                    >
                        Refresh
                    </Button>
                    <Button
                        onPress={onAdd}
                        className=""
                        startContent={<Plus size={16} />}
                    >
                        Add Schedule
                    </Button>
                </div>
            </div>

            {/* Time Header */}
            <div className="mb-4">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div></div>
                    <div className="relative">
                        <div className="flex justify-between text-xs text-foreground/50 mb-1">
                            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(hour => (
                                <div key={hour} className="flex flex-col items-center">
                                    <span>{hour}</span>
                                    <span className="text-foreground/50">
                                        {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-primary-300/20"></div>
                    </div>
                </div>
            </div>


            {/* Weekly Grid */}
            <div className="space-y-2">
                {daysOfWeek.map((day, dayIndex) => {
                    const daySchedules = getSchedulesForDay(dayIndex);

                    return (
                        <div key={day} className="grid grid-cols-[120px_1fr] gap-2">
                            <div className="flex items-center justify-center py-3 px-2 bg-primary-100/10 rounded-2xl">
                                <span className="font-medium text-foreground/90">{day}</span>
                            </div>

                            <div className="relative min-h-20 bg-primary-100/10  border border-primary-300/20 rounded-xl ">
                                {/* Hour Grid Lines */}
                                {[3, 6, 9, 12, 15, 18, 21].map(hour => (
                                    <div
                                        key={hour}
                                        className="absolute top-0 bottom-0 w-px bg-primary-300/20"
                                        style={{ left: `${(hour / 24) * 100}%` }}
                                    />
                                ))}

                                {/* Fee Schedules */}
                                {daySchedules.map((schedule) => {
                                    const left = getTimePosition(schedule.startTime);
                                    const width = getScheduleWidth(schedule.startTime, schedule.endTime);

                                    return (
                                        <div
                                            key={schedule.id}
                                            className={`absolute top-1 bottom-1 p-2 rounded-2xl  cursor-pointer transition-all duration-200 
                                                ${hoveredSchedule === schedule.id ? 'z-10 scale-102 shadow-lg' : ''}`}
                                            style={{
                                                height: 'auto',
                                                minHeight: '56px',
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                minWidth: '60px',
                                                ...getScheduleStyle(schedule)
                                            }}
                                            onMouseEnter={() => setHoveredSchedule(schedule.id)}
                                            onMouseLeave={() => setHoveredSchedule(null)}
                                        >

                                            <div className="h-full p-1 flex flex-col justify-center">
                                                <div className="text-xs font-medium truncate">
                                                    {formatFeeDisplay(schedule)}
                                                </div>
                                                <div className="text-xs opacity-75 flex items-center gap-1">
                                                    {schedule.forVehicleType === VehicleType.Car ? (
                                                        <Car className="w-3 h-3" />
                                                    ) : (
                                                        <BikeIcon className="w-3 h-3" />
                                                    )}
                                                    <span className=" whitespace-nowrap">
                                                        {VehicleTypeText[schedule.forVehicleType]}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Hover Actions */}
                                            {hoveredSchedule === schedule.id && (
                                                <div className="absolute top-0 right-4 transform translate-x-full -translate-y-1 flex gap-1 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(schedule);
                                                        }}
                                                        className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(schedule.id);
                                                        }}
                                                        className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors hidden"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Empty State */}
                                {daySchedules.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                        No schedules
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Schedule Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {getFilteredSchedules().map((schedule) => (
                        <div
                            key={schedule.id}
                            className="p-2 rounded-md "
                            style={getScheduleStyle(schedule)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {schedule.forVehicleType === VehicleType.Car ? (
                                        <Car className="w-3 h-3" />
                                    ) : (
                                        <BikeIcon className="w-3 h-3" />
                                    )}
                                    {/* <Car className="w-4 h-4" /> */}
                                    <span className="font-medium">{VehicleTypeText[schedule.forVehicleType]}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs">
                                        {minutesToTime(schedule.startTime)} - {minutesToTime(schedule.endTime)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-1 text-sm">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {formatFeeDisplay(schedule)}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                    {(() => {
                                        const toArray = (value: unknown): number[] => {
                                            if (Array.isArray(value)) {
                                                return value
                                                    .map((v) => Number(v))
                                                    .filter((n) => Number.isFinite(n));
                                            }
                                            if (typeof value === 'string') {
                                                const trimmed = value.trim();
                                                if (trimmed.length === 0) return [];
                                                return trimmed
                                                    .split(',')
                                                    .map((s) => Number(s.trim()))
                                                    .filter((n) => Number.isFinite(n));
                                            }
                                            return [];
                                        };
                                        const nums = toArray((schedule as any).dayOfWeeks);
                                        if (nums.length === 0) return 'All days';
                                        const isZeroBased = nums.every((n) => n >= 0 && n <= 6) && !nums.some((n) => n === 7);
                                        const normalized = isZeroBased ? nums.map((n) => n + 1) : nums;
                                        return normalized
                                            .map((n) => daysOfWeek[Math.max(1, Math.min(7, n)) - 1])
                                            .join(', ');
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParkingFeeWeeklyView;