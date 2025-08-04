import { useState } from "react";
import {
  Button,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";

import {
  ParkingFeeSchedule,
  VehicleType,
} from "@/services/parkinglot/parkinglotFeeService";

export const VehicleTypeText = {
  [VehicleType.Car]: "Car",
  [VehicleType.Motorbike]: "Motorbike",
  [VehicleType.Bike]: "Bike",
  [VehicleType.All]: "All",
};

// Fee Schedule Modal Component
export const FeeScheduleModal: React.FC<{
  schedule: ParkingFeeSchedule | null;
  onSave: (data: Partial<ParkingFeeSchedule>) => void;
  onClose: () => void;
}> = ({ schedule, onSave, onClose }) => {
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  };

  const [formData, setFormData] = useState({
    startTime: schedule?.startTime || 0,
    endTime: schedule?.endTime || 1439, // 23:59
    initialFee: schedule?.initialFee || 0,
    initialFeeMinutes: schedule?.initialFeeMinutes || 60,
    additionalFee: schedule?.additionalFee || 0,
    additionalMinutes: schedule?.additionalMinutes || 60,
    dayOfWeeks: schedule?.dayOfWeeks || [],
    isActive: schedule?.isActive !== undefined ? schedule.isActive : true,
    forVehicleType: schedule?.forVehicleType || VehicleType.Car,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [selectedDays, setSelectedDays] = useState<number[]>(
    Array.isArray(formData.dayOfWeeks) ? formData.dayOfWeeks : [],
  );

  const handleDayToggle = (idx: number) => {
    const updatedDays = selectedDays.includes(idx)
      ? selectedDays.filter((d) => d !== idx)
      : [...selectedDays, idx];

    setSelectedDays(updatedDays);
    setFormData({ ...formData, dayOfWeeks: updatedDays });
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        {schedule ? "Edit Fee Schedule" : "Add Fee Schedule"}
      </ModalHeader>
      <ModalBody className="max-h-[600px] overflow-y-auto">
        <form
          className="space-y-4"
          id="fee-schedule-form"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium  mb-1">
                Start Time *
              </label>
              <Input
                required
                aria-label="Start Time"
                className=""
                type="time"
                value={minutesToTime(formData.startTime)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startTime: timeToMinutes(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium   mb-1">
                End Time *
              </label>
              <Input
                required
                aria-label="End Time"
                className=""
                type="time"
                value={minutesToTime(formData.endTime)}
                onChange={(e) => {
                  const minutes = timeToMinutes(e.target.value);

                  setFormData({
                    ...formData,
                    endTime: Math.min(minutes, 1439), // Ensure max is 1439
                  });
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium   mb-1">
              Vehicle Type *
            </label>
            <Select
              isRequired
              aria-label="Vehicle Type"
              defaultSelectedKeys={[formData.forVehicleType.toString()]}
              selectedKeys={[formData.forVehicleType.toString()]}
              onSelectionChange={(e) =>
                setFormData({
                  ...formData,
                  forVehicleType: parseInt(e.currentKey as string) as
                    | VehicleType.Car
                    | VehicleType.Motorbike
                    | VehicleType.Bike,
                })
              }

              // selectedKeys={new Set([formData.forVehicleType.toString()])}
              // onSelectionChange={(keys) => {
              //     const value = parseInt(Array.from(keys)[0] as string);
              //     setFormData({ ...formData, forVehicleType: value as VehicleType });
              // }}
              // defaultSelectedKeys={[formData.forVehicleType.toString()]}
            >
              {/* <SelectItem key={VehicleType.Car} >{VehicleTypeText[VehicleType.Car]}</SelectItem> */}
              <SelectItem key={VehicleType.Car}>
                {VehicleTypeText[VehicleType.Car]}
              </SelectItem>
              <SelectItem key={VehicleType.Motorbike}>
                {VehicleTypeText[VehicleType.Motorbike]}
              </SelectItem>
              <SelectItem key={VehicleType.Bike}>
                {VehicleTypeText[VehicleType.Bike]}
              </SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium   mb-1">
                Initial Fee (VND) *
              </label>
              <Input
                required
                aria-label="Initial Fee"
                className=""
                min="0"
                step="0.01"
                type="number"
                value={formData.initialFee.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initialFee: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium   mb-1">
                Additional Fee (VND) *
              </label>
              <Input
                required
                aria-label="Additional Fee"
                className=""
                min="0"
                step="0.01"
                type="number"
                value={formData.additionalFee.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalFee: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 ">
            <div>
              <label className="block text-sm font-medium   mb-1">
                Initial Fee Duration (minutes) *
              </label>
              <Input
                required
                aria-label="Initial Fee Duration"
                className=""
                min="1"
                type="number"
                value={formData.initialFeeMinutes.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initialFeeMinutes: parseInt(e.target.value) || 60,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Initial fee applies for the first {formData.initialFeeMinutes}{" "}
                minutes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium   mb-1">
                Additional Minutes Interval *
              </label>
              <Input
                required
                aria-label="Additional Minutes Interval"
                className=""
                min="1"
                type="number"
                value={formData.additionalMinutes.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalMinutes: parseInt(e.target.value) || 60,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Additional fee will be charged every{" "}
                {formData.additionalMinutes} minutes after initial period
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="dayofweek" className="block text-sm font-medium   mb-2">
              Days of Week (leave empty for all days)
            </label>
            <div id="dayofweek" className="grid grid-cols-2 gap-2">
              {dayOptions.map((day, idx) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    checked={selectedDays.includes(idx)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    type="checkbox"
                    onChange={() => handleDayToggle(idx)}
                  />
                  <span className="text-sm hover:text-secondary  ">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              checked={formData.isActive}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              id="isActive"
              type="checkbox"
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <label className="text-sm font-medium  " htmlFor="isActive">
              Active Schedule
            </label>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium   mb-2">
              Fee Calculation Preview:
            </h4>
            <div className="text-sm  space-y-1">
              <div>
                • Initial fee: {formData.initialFee.toFixed(2)} VND for first{" "}
                {formData.initialFeeMinutes} minutes
              </div>
              <div>
                • Additional fee: {formData.additionalFee.toFixed(2)} VND per{" "}
                {formData.additionalMinutes} minutes
              </div>
              <div>
                • Time: {minutesToTime(formData.startTime)} -{" "}
                {minutesToTime(formData.endTime)}
              </div>
              <div>• Vehicle: {VehicleTypeText[formData.forVehicleType]}</div>
              <div>
                • Days:{" "}
                {selectedDays.length > 0
                  ? selectedDays.map((idx) => dayOptions[idx]).join(", ")
                  : "All days"}
              </div>
            </div>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button
          className="text-background"
          color="primary"
          onPress={() => {
            const form = document.getElementById(
              "fee-schedule-form",
            ) as HTMLFormElement | null;

            if (form) form.requestSubmit();
          }}
        >
          {schedule ? "Update" : "Create"}
        </Button>
      </ModalFooter>
    </>
  );
};
// import { useState, useEffect } from "react";
// import { ParkingFeeSchedule } from "@/services/parkinglot/parkinglotFeeService";
// import { Button, Input, ModalBody, ModalFooter, ModalHeader, Select, SelectItem, RadioGroup, Radio } from "@heroui/react";

// // Fee Schedule Modal Component
// export const FeeScheduleModal: React.FC<{
//     schedule: ParkingFeeSchedule | null;
//     existingSchedules: ParkingFeeSchedule[]; // Add this prop for duplicate checking
//     onSave: (data: Partial<ParkingFeeSchedule>) => void;
//     onClose: () => void;
// }> = ({ schedule, existingSchedules, onSave, onClose }) => {

//     // Simple fee structure - either by day or by hour
//     const [feeType, setFeeType] = useState<'daily' | 'hourly'>('daily');
//     const [formData, setFormData] = useState({
//         feeType: 'daily' as 'daily' | 'hourly',
//         dailyRate: schedule?.initialFee || 20000, // For daily parking
//         hourlyRate: schedule?.additionalFee || 5000, // For hourly parking
//         // Hourly advanced options
//         startTime: schedule?.startTime || 0,
//         endTime: schedule?.endTime || 1440,
//         initialFee: schedule?.initialFee || 10000,
//         additionalFee: schedule?.additionalFee || 5000,
//         additionalMinutes: schedule?.additionalMinutes || 60,
//         dayOfWeeks: schedule?.dayOfWeeks || [],
//         isActive: schedule?.isActive !== undefined ? schedule.isActive : true,
//         forVehicleType: schedule?.forVehicleType || 'Car' as 'Car' | 'Motorbike',
//     });

//     const [duplicateError, setDuplicateError] = useState<string>('');

//     // Converts minutes (e.g., 90) to "HH:mm" (e.g., "01:30")
// function minutesToTime(minutes: number): string {
//   const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
//   const mins = (minutes % 60).toString().padStart(2, '0');
//   return `${hrs}:${mins}`;
// }

// // Converts "HH:mm" string to total minutes (e.g., "01:30" => 90)
// function timeToMinutes(time: string): number {
//   const [hrs, mins] = time.split(':').map(Number);
//   return hrs * 60 + mins;
// }

//     // Initialize fee type based on existing schedule
//     useEffect(() => {
//         if (schedule) {
//             // If initial fee is much higher than additional fee, likely daily rate
//             const isDailyRate = (schedule.initialFee || 0) > (schedule.additionalFee || 0) * 8;
//             setFeeType(isDailyRate ? 'daily' : 'hourly');
//             setFormData({
//                 feeType: isDailyRate ? 'daily' : 'hourly',
//                 dailyRate: schedule.initialFee || 20000,
//                 hourlyRate: schedule.additionalFee || 5000,
//                 // Hourly advanced options
//                 startTime: schedule.startTime || 0,
//                 endTime: schedule.endTime || 1440,
//                 initialFee: schedule.initialFee || 10000,
//                 additionalFee: schedule.additionalFee || 5000,
//                 additionalMinutes: schedule.additionalMinutes || 60,
//                 dayOfWeeks: schedule.dayOfWeeks || [],
//                 isActive: schedule.isActive !== undefined ? schedule.isActive : true,
//                 forVehicleType: schedule.forVehicleType || 'Car',
//             });
//         }
//     }, [schedule]);

//     // Check for duplicates
//     const checkForDuplicates = () => {
//         const duplicate = existingSchedules.find(existing => {
//             // Skip if editing the same schedule
//             if (schedule && existing.id === schedule.id) return false;

//             if (feeType === 'daily') {
//                 // For daily: check vehicle type and daily rate
//                 return existing.forVehicleType === formData.forVehicleType &&
//                        existing.initialFee === formData.dailyRate &&
//                        existing.additionalFee === 0; // Daily should have no additional fee
//             } else {
//                 // For hourly: check vehicle type, time period, and rates
//                 return existing.forVehicleType === formData.forVehicleType &&
//                        existing.startTime === formData.startTime &&
//                        existing.endTime === formData.endTime &&
//                        existing.initialFee === formData.initialFee &&
//                        existing.additionalFee === formData.additionalFee &&
//                        existing.additionalMinutes === formData.additionalMinutes &&
//                        JSON.stringify(existing.dayOfWeeks || []) === JSON.stringify(formData.dayOfWeeks);
//             }
//         });

//         if (duplicate) {
//             setDuplicateError(`A ${feeType} rate for ${formData.forVehicleType} with these settings already exists`);
//             return true;
//         }

//         setDuplicateError('');
//         return false;
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         // Check for duplicates before saving
//         if (checkForDuplicates()) {
//             return;
//         }

//         // Convert simple structure to complex structure for backend
//         const scheduleData = {
//             startTime: feeType === 'daily' ? 0 : formData.startTime,
//             endTime: feeType === 'daily' ? 1440 : formData.endTime,
//             initialFee: feeType === 'daily' ? formData.dailyRate : formData.initialFee,
//             additionalFee: feeType === 'daily' ? 0 : formData.additionalFee,
//             additionalMinutes: feeType === 'daily' ? 1440 : formData.additionalMinutes,
//             dayOfWeeks: feeType === 'daily' ? [] : formData.dayOfWeeks,
//             isActive: formData.isActive,
//             forVehicleType: formData.forVehicleType,
//         };

//         onSave(scheduleData);
//     };

//     return (
//         <>
//             <ModalHeader className="flex flex-col gap-1">
//                 {schedule ? 'Edit Fee Schedule' : 'Add Fee Schedule'}
//             </ModalHeader>
//             <ModalBody className="max-h-[600px] overflow-y-auto">
//                 <form id="fee-schedule-form" onSubmit={handleSubmit} className="space-y-6">

//                     {/* Fee Type Selection */}
//                     <div>
//                         <label className="block text-sm font-medium mb-3">
//                             Fee Structure *
//                         </label>
//                         <RadioGroup
//                             value={feeType}
//                             onValueChange={(value) => {
//                                 setFeeType(value as 'daily' | 'hourly');
//                                 setFormData({...formData, feeType: value as 'daily' | 'hourly'});
//                                 setDuplicateError(''); // Clear error when changing type
//                             }}
//                             orientation="horizontal"
//                             className="gap-6"
//                         >
//                             <Radio value="daily">
//                                 <div className="flex flex-col">
//                                     <span className="font-medium">Daily Rate</span>
//                                     <span className="text-xs text-gray-500">Flat fee per day</span>
//                                 </div>
//                             </Radio>
//                             <Radio value="hourly">
//                                 <div className="flex flex-col">
//                                     <span className="font-medium">Hourly Rate</span>
//                                     <span className="text-xs text-gray-500">Fee per hour</span>
//                                 </div>
//                             </Radio>
//                         </RadioGroup>
//                     </div>

//                     {/* Vehicle Type */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             Vehicle Type *
//                         </label>
//                         <Select
//                             aria-label="Vehicle Type"
//                             isRequired
//                             selectedKeys={new Set([formData.forVehicleType])}
//                             onSelectionChange={(keys) => {
//                                 const value = Array.from(keys)[0] as 'Car' | 'Motorbike';
//                                 setFormData({ ...formData, forVehicleType: value });
//                                 setDuplicateError(''); // Clear error when changing vehicle type
//                             }}
//                             className=""
//                         >
//                             <SelectItem key="Car">Car</SelectItem>
//                             <SelectItem key="Motorbike">Motorbike</SelectItem>
//                         </Select>
//                     </div>

//                     {/* Fee Input */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             {feeType === 'daily' ? 'Daily Rate (VND) *' : 'Hourly Rate (VND) *'}
//                         </label>
//                         <Input
//                             aria-label={feeType === 'daily' ? 'Daily Rate' : 'Hourly Rate'}
//                             type="number"
//                             min="0"
//                             step="1000"
//                             value={feeType === 'daily' ? formData.dailyRate.toString() : formData.hourlyRate.toString()}
//                             onChange={(e) => {
//                                 const value = parseInt(e.target.value) || 0;
//                                 if (feeType === 'daily') {
//                                     setFormData({ ...formData, dailyRate: value });
//                                 } else {
//                                     setFormData({ ...formData, hourlyRate: value });
//                                 }
//                                 setDuplicateError(''); // Clear error when changing rate
//                             }}
//                             onBlur={checkForDuplicates} // Check duplicates when user leaves the field
//                             className=""
//                             required
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                             {feeType === 'daily'
//                                 ? 'Customers pay this amount for full day parking'
//                                 : 'Basic hourly rate for simple pricing'
//                             }
//                         </p>
//                     </div>

//                     {/* Hourly Advanced Options */}
//                     {feeType === 'hourly' && (
//                         <div className="space-y-4 border-t pt-4">
//                             <h4 className="text-sm font-medium text-gray-700">Advanced Hourly Options</h4>

//                             {/* Time Period */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-1">
//                                         Start Time *
//                                     </label>
//                                     <Input
//                                         aria-label="Start Time"
//                                         type="time"
//                                         value={minutesToTime(formData.startTime)}
//                                         onChange={(e) => setFormData({ ...formData, startTime: timeToMinutes(e.target.value) })}
//                                         className=""
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-1">
//                                         End Time *
//                                     </label>
//                                     <Input
//                                         aria-label="End Time"
//                                         type="time"
//                                         value={minutesToTime(formData.endTime)}
//                                         onChange={(e) => setFormData({ ...formData, endTime: timeToMinutes(e.target.value) })}
//                                         className=""
//                                         required
//                                     />
//                                 </div>
//                             </div>

//                             {/* Initial and Additional Fees */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-1">
//                                         Initial Fee (VND) *
//                                     </label>
//                                     <Input
//                                         aria-label="Initial Fee"
//                                         type="number"
//                                         min="0"
//                                         step="1000"
//                                         value={formData.initialFee.toString()}
//                                         onChange={(e) => setFormData({ ...formData, initialFee: parseInt(e.target.value) || 0 })}
//                                         className=""
//                                         required
//                                     />
//                                     <p className="text-xs text-gray-500 mt-1">First period charge</p>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-1">
//                                         Additional Fee (VND) *
//                                     </label>
//                                     <Input
//                                         aria-label="Additional Fee"
//                                         type="number"
//                                         min="0"
//                                         step="1000"
//                                         value={formData.additionalFee.toString()}
//                                         onChange={(e) => setFormData({ ...formData, additionalFee: parseInt(e.target.value) || 0 })}
//                                         className=""
//                                         required
//                                     />
//                                     <p className="text-xs text-gray-500 mt-1">Per interval charge</p>
//                                 </div>
//                             </div>

//                             {/* Additional Minutes Interval */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">
//                                     Additional Minutes Interval *
//                                 </label>
//                                 <Input
//                                     aria-label="Additional Minutes Interval"
//                                     type="number"
//                                     min="1"
//                                     value={formData.additionalMinutes.toString()}
//                                     onChange={(e) => setFormData({ ...formData, additionalMinutes: parseInt(e.target.value) || 60 })}
//                                     className=""
//                                     required
//                                 />
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Additional fee charged every {formData.additionalMinutes} minutes after initial period
//                                 </p>
//                             </div>

//                             {/* Days of Week */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Days of Week (leave empty for all days)
//                                 </label>
//                                 <div className="grid grid-cols-2 gap-2">
//                                     {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => (
//                                         <label key={day} className="flex items-center space-x-2">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={formData.dayOfWeeks.includes(idx)}
//                                                 onChange={(e) => {
//                                                     const updatedDays = e.target.checked
//                                                         ? [...formData.dayOfWeeks, idx]
//                                                         : formData.dayOfWeeks.filter((d) => d !== idx);
//                                                     setFormData({ ...formData, dayOfWeeks: updatedDays });
//                                                 }}
//                                                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                                             />
//                                             <span className="text-sm hover:text-secondary">{day}</span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Duplicate Error */}
//                     {duplicateError && (
//                         <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                             <p className="text-sm text-red-600">{duplicateError}</p>
//                         </div>
//                     )}

//                     {/* Active Status */}
//                     <div className="flex items-center space-x-3">
//                         <input
//                             type="checkbox"
//                             id="isActive"
//                             checked={formData.isActive}
//                             onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                         <label htmlFor="isActive" className="text-sm font-medium">
//                             Active Schedule
//                         </label>
//                     </div>

//                     {/* Preview */}
//                     <div className="bg-muted p-4 rounded-lg">
//                         <h4 className="text-sm font-medium mb-2">Fee Preview:</h4>
//                         <div className="text-sm space-y-1">
//                             <div>• Vehicle Type: {formData.forVehicleType}</div>
//                             <div>• Fee Structure: {feeType === 'daily' ? 'Daily Rate' : 'Hourly Rate'}</div>
//                             {feeType === 'daily' ? (
//                                 <div>• Rate: {formData.dailyRate} VND per day</div>
//                             ) : (
//                                 <>
//                                     <div>• Time Period: {minutesToTime(formData.startTime)} - {minutesToTime(formData.endTime)}</div>
//                                     <div>• Initial Fee: {formData.initialFee} VND for first {formData.additionalMinutes} minutes</div>
//                                     <div>• Additional Fee: {formData.additionalFee} VND per {formData.additionalMinutes} minutes</div>
//                                     <div>• Days: {formData.dayOfWeeks.length > 0 ? formData.dayOfWeeks.map(idx => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx]).join(', ') : 'All days'}</div>
//                                 </>
//                             )}
//                             <div>• Status: {formData.isActive ? 'Active' : 'Inactive'}</div>
//                         </div>
//                     </div>
//                 </form>
//             </ModalBody>
//             <ModalFooter>
//                 <Button color="danger" variant="light" onPress={onClose}>
//                     Cancel
//                 </Button>
//                 <Button
//                     className="text-background"
//                     color="primary"
//                     isDisabled={!!duplicateError}
//                     onPress={() => {
//                         const form = document.getElementById('fee-schedule-form') as HTMLFormElement | null;
//                         if (form) form.requestSubmit();
//                     }}
//                 >
//                     {schedule ? 'Update' : 'Create'}
//                 </Button>
//             </ModalFooter>
//         </>
//     );
// };
