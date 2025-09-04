import React, { useState, useMemo } from 'react';
import { BikeIcon, Car, Clock, Edit2, Plus, Trash2 } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Select, SelectItem, Chip } from '@heroui/react';
import { VehicleType, type ParkingFeeSchedule } from '@/services/parkinglot/parkinglotFeeService';
import { VehicleTypeText } from './FeeScheduleModal';
import { formatDate, formatTime, getTimezoneOffsetString } from '@/components/utils/stringUtils';

const FeeSchedulesTab: React.FC<{
   schedules: ParkingFeeSchedule[];
   onEdit: (schedule: ParkingFeeSchedule | null) => void;
   onDelete: (id: string) => void;
   onAdd: () => void;
}> = ({ schedules, onEdit, onDelete, onAdd }) => {

   const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
   const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType>(VehicleType.All);

   // Filter schedules based on current filters
   const filteredSchedules = useMemo(() => {
      return schedules.filter(schedule => {
         // Filter by active status
         if (activeFilter === 'active' && !schedule.isActive) return false;
         if (activeFilter === 'inactive' && schedule.isActive) return false;

         // Filter by vehicle type
         if (vehicleTypeFilter !== VehicleType.All && schedule.forVehicleType !== vehicleTypeFilter) return false;

         return true;
      });
   }, [schedules, activeFilter, vehicleTypeFilter]);

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
               <Button
                  color="default"
                  onPress={onAdd}
                  variant='flat'
                  size='sm'
                  className="ml-2"
               >
                  <Plus size={16} />
                  Add Fee Schedule
               </Button>
            </div>
         </div>

         {/* Filters */}


         <div className="  overflow-hidden">
            <Table
               color='secondary'
               aria-label="Parking Fee Schedules Table"
               className="min-w-full"
               topContent={
                  <>
                     <div className="flex gap-4 rounded-lg">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-gray-700">Status:</span>
                           <Select
                              aria-label="Active Status Filter"
                              className="w-32"
                              selectedKeys={[activeFilter]}
                              onSelectionChange={(keys) => setActiveFilter(Array.from(keys)[0] as 'all' | 'active' | 'inactive')}
                           >
                              <SelectItem key="all">All</SelectItem>
                              <SelectItem key="active">Active</SelectItem>
                              <SelectItem key="inactive">Inactive</SelectItem>
                           </Select>
                        </div>

                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-gray-700">Vehicle Type:</span>
                           <Select
                              aria-label="Vehicle Type Filter"
                              className="w-32"
                              selectedKeys={[vehicleTypeFilter.toString()]}
                              onSelectionChange={(keys) => setVehicleTypeFilter(parseInt(Array.from(keys)[0] as string) as VehicleType)}
                           >
                              <SelectItem key={VehicleType.All.toString()}>All</SelectItem>
                              <SelectItem key={VehicleType.Car.toString()}>Car</SelectItem>
                              <SelectItem key={VehicleType.Motorbike.toString()}>Motorbike</SelectItem>
                           </Select>
                        </div>

                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-gray-700">Results:</span>
                           <Chip size="sm" variant="flat" color="primary">
                              {filteredSchedules.length} of {schedules.length}
                           </Chip>
                        </div>
                     </div>
                  </>
               }
            >
               <TableHeader>
                  <TableColumn>Time Period</TableColumn>
                  <TableColumn>Vehicle Type</TableColumn>
                  <TableColumn>Fees</TableColumn>
                  <TableColumn>Days</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Modified At</TableColumn>
                  <TableColumn>Action</TableColumn>
               </TableHeader>
               <TableBody>
                  {filteredSchedules.map((schedule) => (
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
                              ) : (
                                 <BikeIcon className="w-3 h-3" />
                              )}
                              {VehicleTypeText[schedule.forVehicleType] || 'Motorbike'}
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
                              {(() => {
                                 const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                 const toArray = (value: unknown): number[] => {
                                    if (Array.isArray(value)) {
                                       return value
                                          .map((v) => Number(v))
                                          .filter((n) => Number.isFinite(n));
                                    }
                                    if (typeof value === 'string') {
                                       if (value.trim().length === 0) return [];
                                       return value
                                          .split(',')
                                          .map((s) => Number(s.trim()))
                                          .filter((n) => Number.isFinite(n));
                                    }
                                    return [];
                                 };
                                 const nums = toArray((schedule as any).dayOfWeeks);
                                 if (nums.length === 0) return 'All days';
                                 // Support both 0-based [0..6] and 1-based [1..7]
                                 const isZeroBased = nums.every((n) => n >= 0 && n <= 6) && !nums.some((n) => n === 7);
                                 const normalized = (isZeroBased ? nums.map((n) => n + 1) : nums)
                                    .map((n) => dayNames[Math.max(1, Math.min(7, n)) - 1]);
                                 return normalized.join(', ');
                              })()}
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
                           {/* {schedule.updatedAt} */}
                           <div className="text-sm ">
                              {formatDate(schedule.updatedAt)}
                           </div>
                           <div className="text-sm ">
                              {formatTime(schedule.updatedAt)}
                              {/* {getTimezoneOffsetString()} */}
                           </div>
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
                              className='bg-transparent text-danger hidden'
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

export default FeeSchedulesTab;