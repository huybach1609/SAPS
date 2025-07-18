import { useState } from "react";
import { ParkingFeeSchedule } from "@/services/parkinglot/parkinglotFeeService";
import { Button, Input, ModalBody, ModalFooter, ModalHeader, Select, SelectItem } from "@heroui/react";

// Fee Schedule Modal Component
export const FeeScheduleModal: React.FC<{
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
        startTime: schedule?.startTime || 0,
        endTime: schedule?.endTime || 1440,
        initialFee: schedule?.initialFee || 0,
        additionalFee: schedule?.additionalFee || 0,
        additionalMinutes: schedule?.additionalMinutes || 60,
        dayOfWeeks: schedule?.dayOfWeeks || [],
        isActive: schedule?.isActive !== undefined ? schedule.isActive : true,
        forVehicleType: schedule?.forVehicleType || 'Car' as 'Car' | 'Motorbike',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const dayOptions = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ];

    const [selectedDays, setSelectedDays] = useState<number[]>(
        Array.isArray(formData.dayOfWeeks) ? formData.dayOfWeeks : []
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
                {schedule ? 'Edit Fee Schedule' : 'Add Fee Schedule'}
            </ModalHeader>
            <ModalBody className="max-h-[600px] overflow-y-auto">
                <form id="fee-schedule-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium  mb-1">
                                Start Time *
                            </label>
                            <Input
                                aria-label="Start Time"
                                type="time"
                                value={minutesToTime(formData.startTime)}
                                onChange={(e) => setFormData({ ...formData, startTime: timeToMinutes(e.target.value) })}
                                className=""
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium   mb-1">
                                End Time *
                            </label>
                            <Input
                                aria-label="End Time"
                                type="time"
                                value={minutesToTime(formData.endTime)}
                                onChange={(e) => setFormData({ ...formData, endTime: timeToMinutes(e.target.value) })}
                                className=""
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium   mb-1">
                            Vehicle Type *
                        </label>
                        <Select
                            aria-label="Vehicle Type"
                            isRequired
                            selectedKeys={new Set([formData.forVehicleType])}
                            onSelectionChange={(keys) => {
                                const value = Array.from(keys)[0] as 'Car' | 'Motorbike';
                                setFormData({ ...formData, forVehicleType: value });
                            }}
                            defaultSelectedKeys={"Car"}
                            className=""
                        >
                            <SelectItem key="Car">Car</SelectItem>
                            <SelectItem key="Motorbike">Motorbike</SelectItem>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium   mb-1">
                                Initial Fee ($) *
                            </label>
                            <Input
                                aria-label="Initial Fee"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.initialFee.toString()}
                                onChange={(e) => setFormData({ ...formData, initialFee: parseFloat(e.target.value) || 0 })}
                                className=""
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium   mb-1">
                                Additional Fee ($) *
                            </label>
                            <Input
                                aria-label="Additional Fee"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.additionalFee.toString()}
                                onChange={(e) => setFormData({ ...formData, additionalFee: parseFloat(e.target.value) || 0 })}
                                className=""
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium   mb-1">
                            Additional Minutes Interval *
                        </label>
                        <Input
                            aria-label="Additional Minutes Interval"
                            type="number"
                            min="1"
                            value={formData.additionalMinutes.toString()}
                            onChange={(e) => setFormData({ ...formData, additionalMinutes: parseInt(e.target.value) || 60 })}
                            className=""
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Additional fee will be charged every {formData.additionalMinutes} minutes after initial period
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium   mb-2">
                            Days of Week (leave empty for all days)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {dayOptions.map((day, idx) => (
                                <label key={day} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedDays.includes(idx)}
                                        onChange={() => handleDayToggle(idx)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm hover:text-secondary  ">{day}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium  ">
                            Active Schedule
                        </label>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="text-sm font-medium   mb-2">Fee Calculation Preview:</h4>
                        <div className="text-sm  space-y-1">
                            <div>• Initial fee: ${formData.initialFee.toFixed(2)} for first period</div>
                            <div>• Additional fee: ${formData.additionalFee.toFixed(2)} per {formData.additionalMinutes} minutes</div>
                            <div>• Time: {minutesToTime(formData.startTime)} - {minutesToTime(formData.endTime)}</div>
                            <div>• Vehicle: {formData.forVehicleType}</div>
                            <div>• Days: {selectedDays.length > 0 ? selectedDays.map(idx => dayOptions[idx]).join(', ') : 'All days'}</div>
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
                    color="primary" onPress={() => {
                        const form = document.getElementById('fee-schedule-form') as HTMLFormElement | null;
                        if (form) form.requestSubmit();
                    }}>
                    {schedule ? 'Update' : 'Create'}
                </Button>
            </ModalFooter>
        </>
    );
};