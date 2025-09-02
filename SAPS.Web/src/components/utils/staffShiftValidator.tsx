import { StaffShift, ValidationError } from "@/services/parkinglot/staffShift";

// Validation functions
export class StaffShiftValidator {

  /**
   * Validates time constraints (0-1439 minutes from midnight)
   */
  static validateTime(startTime: number, endTime: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (startTime < 0 || startTime > 1439) {
      errors.push({
        field: 'startTime',
        message: 'Start time must be between 0 and 1439 minutes from midnight'
      });
    }

    if (endTime < 0 || endTime > 1439) {
      errors.push({
        field: 'endTime',
        message: 'End time must be between 0 and 1439 minutes from midnight'
      });
    }

    return errors;
  }

  /**
   * Validates shift type constraint
   */
  static validateShiftType(shiftType: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const validTypes = ['Regular', 'Emergency'];

    if (!validTypes.includes(shiftType)) {
      errors.push({
        field: 'shiftType',
        message: `Shift type must be one of: ${validTypes.join(', ')}`
      });
    }

    return errors;
  }

  /**
   * Validates status constraint
   */
  // static validateStatus(status: string): ValidationError[] {
  //   const errors: ValidationError[] = [];
  //   const validStatuses = ['Scheduled', 'Active', 'Deactive'];

  //   if (!validStatuses.includes(status)) {
  //     errors.push({
  //       field: 'status',
  //       message: `Status must be one of: ${validStatuses.join(', ')}`
  //     });
  //   }

  //   return errors;
  // }

  /**
   * Validates date logic constraint (either dayOfWeeks OR specificDate, not both)
   */
  static validateDateLogic(dayOfWeeks?: string | null, specificDate?: string | null): ValidationError[] {
    const errors: ValidationError[] = [];

    const hasDayOfWeeks = dayOfWeeks !== null && dayOfWeeks !== undefined && dayOfWeeks.trim() !== '';
    const hasSpecificDate = specificDate !== null && specificDate !== undefined && specificDate.trim() !== '';

    if (hasDayOfWeeks && hasSpecificDate) {
      errors.push({
        field: 'dateLogic',
        message: 'Cannot have both dayOfWeeks and specificDate set. Use one or the other.'
      });
    }

    if (!hasDayOfWeeks && !hasSpecificDate) {
      errors.push({
        field: 'dateLogic',
        message: 'Must have either dayOfWeeks set.'
      });
    }

    return errors;
  }


  /**
  * Validates notes length constraint
  */
  static validateNotes(notes?: string | null): ValidationError[] {
    const errors: ValidationError[] = [];

    if (notes && notes.length > 500) {
      errors.push({
        field: 'notes',
        message: 'Notes cannot exceed 500 characters'
      });
    }

    return errors;
  }

  /**
   * Validates required fields
   */
  static validateRequiredFields(shift: Partial<StaffShift>): ValidationError[] {
    const errors: ValidationError[] = [];
    const requiredFields: (keyof StaffShift)[] = [
      'id', 'staffIds',  'startTime', 'endTime'
    ];

    for (const field of requiredFields) {
      if (shift[field] === undefined || shift[field] === null || shift[field] === '') {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }

    return errors;
  }

  static validateTimeRangeSelection(startTime: number, endTime: number): ValidationError[] {
    const errors: ValidationError[] = [];


    if (startTime === 0 && endTime === 0) {
      errors.push({
        field: 'timeRangeSelection',
        message: 'Please select a time range'
      });
    }

    return errors;
  }

  /**
   * Comprehensive validation of a StaffShift object
   */
  static validate(shift: Partial<StaffShift>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields validation
    errors.push(...this.validateRequiredFields(shift));

    // Only validate other constraints if required fields are present
    if (shift.startTime !== undefined && shift.endTime !== undefined) {
      errors.push(...this.validateTime(shift.startTime, shift.endTime));
    }


    if (shift.startTime !== undefined && shift.endTime !== undefined) {
      errors.push(...this.validateTimeRangeSelection(shift.startTime, shift.endTime));
    }

    errors.push(...this.validateDateLogic(shift.dayOfWeeks, shift.specificDate));
    errors.push(...this.validateNotes(shift.notes));

    return errors;
  }

  /**
   * Validates and returns boolean result
   */
  static isValid(shift: Partial<StaffShift>): boolean {
    return this.validate(shift).length === 0;
  }
}

// Utility functions for time conversion
export class TimeUtils {
  /**
   * Converts HH:MM format to minutes from midnight
   */
  static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Converts minutes from midnight to HH:MM format
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Validates if time string is in correct HH:MM format
   */
  static isValidTimeFormat(timeString: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  }
}

// Example usage:
/*
const newShift: CreateStaffShift = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  staffId: '456e7890-e89b-12d3-a456-426614174001',
  parkingLotId: '789e0123-e89b-12d3-a456-426614174002',
  startTime: TimeUtils.timeToMinutes('09:00'), // 540 minutes
  endTime: TimeUtils.timeToMinutes('17:00'),   // 1020 minutes
  shiftType: 'Regular',
  dayOfWeeks: '1,2,3,4,5', // Monday to Friday
  specificDate: null,
  isActive: true,
  status: 'Scheduled',
  notes: 'Morning shift with parking lot supervision'
};

const validationErrors = StaffShiftValidator.validate(newShift);
if (validationErrors.length > 0) {
  console.log('Validation errors:', validationErrors);
} else {
  console.log('Staff shift is valid!');
}
*/