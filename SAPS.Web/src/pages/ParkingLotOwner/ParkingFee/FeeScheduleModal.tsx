import { useState } from "react";
import {
  Button,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
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

    // console.log("hours", hours);
    // console.log("mins", mins);
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  };



  const [formData, setFormData] = useState({
    startTime: schedule?.startTime ?? 0,
    endTime: schedule?.endTime ?? 1439, // 23:59
    initialFee: schedule?.initialFee ?? 0,
    initialMinutes: schedule?.initialMinutes ?? 60,
    additionalFee: schedule?.additionalFee ?? 0,
    additionalMinutes: schedule?.additionalMinutes ?? 60,
    dayOfWeeks: schedule?.dayOfWeeks ?? [],
    isActive: schedule?.isActive !== undefined ? schedule.isActive : true,
    forVehicleType: schedule?.forVehicleType ?? VehicleType.Car,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedDays = Array.isArray(formData.dayOfWeeks)
      ? Array.from(new Set((formData.dayOfWeeks as number[]).filter((n) => Number.isFinite(n)))).sort((a, b) => a - b)
      : [];
    const payload = { ...formData, dayOfWeeks: normalizedDays };
    console.log('payload', payload);
    onSave(payload);
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
    Array.isArray(formData.dayOfWeeks) ? (formData.dayOfWeeks as number[]) : [],
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
        <ScrollShadow hideScrollBar={true}>
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
                      | VehicleType.Motorbike,
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
                  value={formData.initialMinutes.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialMinutes: parseInt(e.target.value) || 60,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Initial fee applies for the first {formData.initialMinutes}{" "}
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
                  min="0"
                  type="number"
                  value={formData.additionalMinutes.toString()}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? 0 : parseInt(raw, 10);
                    setFormData({
                      ...formData,
                      additionalMinutes: Number.isNaN(parsed) ? 0 : parsed,
                    });
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional fee interval (minutes). 0 means no recurring additional fee.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="dayofweek" className="block text-sm font-medium   mb-2">
                Days of Week
              </label>
              <div id="dayofweek" className="grid grid-cols-2 gap-2">
                {dayOptions.map((day, idx) => {
                  // console.log('idx-day-selectedDays', idx, day, selectedDays);
                  return (<label key={day} className="flex items-center space-x-2">
                    <input
                      checked={selectedDays.includes(idx)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      type="checkbox"
                      onChange={() => handleDayToggle(idx)}
                    />
                    <span className="text-sm hover:text-secondary  ">{day}</span>
                  </label>)
                })}
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
                  {formData.initialMinutes} minutes
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
        </ScrollShadow>
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
