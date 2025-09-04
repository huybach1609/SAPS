// Centralized error messages for the application
export const errorMessages: Record<string, string> = {
  // Staff validation errors
  FULL_NAME_LETTERS_ONLY: "Full name can only contain letters, spaces, hyphens, apostrophes, and dots.",
  EMAIL_ALREADY_EXISTS: "An account with this email address already exists.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
  REQUIRED: "is required.",
  MIN_LENGTH: "is too short.",
  MAX_LENGTH: "is too long.",
  INVALID_FORMAT: "has an invalid format.",
  
  // User errors
  USER_NOT_FOUND: "User not found.",
  ID_REQUIRED: "ID is required.",
  
  // Parking lot errors
  PARKING_LOT_NAME_REQUIRED: "Parking lot name is required.",
  PARKING_LOT_NOT_FOUND: "Parking lot not found.",
  
  // Generic validation errors
  VALIDATION_ERROR: "One or more validation errors occurred.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  
  // Operation errors
  OPERATION_FAILED: "Operation failed. Please try again.",
  PERMISSION_DENIED: "You don't have permission to perform this action.",
  RESOURCE_NOT_FOUND: "The requested resource was not found.",
  
  // Authentication errors
  UNAUTHORIZED: "You are not authorized to perform this action.",
  INVALID_CREDENTIALS: "Invalid credentials. Please check your login information.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  
  // File upload errors
  FILE_TOO_LARGE: "File size is too large.",
  INVALID_FILE_TYPE: "Invalid file type.",
  FILE_UPLOAD_FAILED: "File upload failed. Please try again.",
  
  // Payment errors
  PAYMENT_FAILED: "Payment failed. Please try again.",
  INSUFFICIENT_FUNDS: "Insufficient funds.",
  INVALID_PAYMENT_METHOD: "Invalid payment method.",
  
  // Subscription errors
  SUBSCRIPTION_EXPIRED: "Your subscription has expired.",
  SUBSCRIPTION_NOT_FOUND: "Subscription not found.",
  SUBSCRIPTION_ALREADY_EXISTS: "Subscription already exists.",
  
  // Whitelist errors
  WHITELIST_ENTRY_EXISTS: "This entry already exists in the whitelist.",
  WHITELIST_ENTRY_NOT_FOUND: "Whitelist entry not found.",
  
  // Staff management errors
  STAFF_NOT_FOUND: "Staff member not found.",
  STAFF_ALREADY_EXISTS: "Staff member already exists.",
  STAFF_UPDATE_FAILED: "Failed to update staff member.",
  STAFF_DELETE_FAILED: "Failed to delete staff member.",
  
  // Shift management errors
  SHIFT_NOT_FOUND: "Shift not found.",
  SHIFT_CONFLICT: "Shift time conflicts with existing shifts.",
  SHIFT_UPDATE_FAILED: "Failed to update shift.",
  SHIFT_DELETE_FAILED: "Failed to delete shift.",
  
  // Incident report errors
  INCIDENT_NOT_FOUND: "Incident report not found.",
  INCIDENT_UPDATE_FAILED: "Failed to update incident report.",
  INCIDENT_DELETE_FAILED: "Failed to delete incident report.",
  
  // Parking fee errors
  PARKING_FEE_NOT_FOUND: "Parking fee not found.",
  PARKING_FEE_UPDATE_FAILED: "Failed to update parking fee.",
  PARKING_FEE_DELETE_FAILED: "Failed to delete parking fee.",
  
  // Parking history errors
  PARKING_HISTORY_NOT_FOUND: "Parking history not found.",
  PARKING_HISTORY_UPDATE_FAILED: "Failed to update parking history.",
  PARKING_HISTORY_DELETE_FAILED: "Failed to delete parking history.",
  
  // Parking info errors
  PARKING_INFO_NOT_FOUND: "Parking information not found.",
  PARKING_INFO_UPDATE_FAILED: "Failed to update parking information.",
  PARKING_INFO_DELETE_FAILED: "Failed to delete parking information.",
};

// Field name mappings for user-friendly display
export const fieldNameMap: Record<string, string> = {
  'FullName': 'Full Name',
  'Email': 'Email',
  'Phone': 'Phone Number',
  'EmployeeId': 'Employee ID',
  'DateOfBirth': 'Date of Birth',
  'Status': 'Status',
  'Password': 'Password',
  'ConfirmPassword': 'Confirm Password',
  'ParkingLotName': 'Parking Lot Name',
  'Address': 'Address',
  'Capacity': 'Capacity',
  'HourlyRate': 'Hourly Rate',
  'DailyRate': 'Daily Rate',
  'MonthlyRate': 'Monthly Rate',
  'YearlyRate': 'Yearly Rate',
  'LicensePlate': 'License Plate',
  'VehicleType': 'Vehicle Type',
  'EntryTime': 'Entry Time',
  'ExitTime': 'Exit Time',
  'Duration': 'Duration',
  'TotalFee': 'Total Fee',
  'PaymentMethod': 'Payment Method',
  'PaymentStatus': 'Payment Status',
  'IncidentType': 'Incident Type',
  'IncidentDescription': 'Incident Description',
  'IncidentDate': 'Incident Date',
  'ShiftStart': 'Shift Start',
  'ShiftEnd': 'Shift End',
  'ShiftDate': 'Shift Date',
  'StaffId': 'Staff ID',
  'ParkingLotId': 'Parking Lot ID',
  'SubscriptionType': 'Subscription Type',
  'SubscriptionStart': 'Subscription Start',
  'SubscriptionEnd': 'Subscription End',
  'SubscriptionStatus': 'Subscription Status',
  'WhitelistEntry': 'Whitelist Entry',
  'WhitelistType': 'Whitelist Type',
  'WhitelistReason': 'Whitelist Reason',
};

// Helper function to get error message with field name
export function getErrorMessage(errorCode: string, fieldName?: string): string {
  const baseMessage = errorMessages[errorCode];
  
  if (!baseMessage) {
    return fieldName ? `${fieldName}: ${errorCode}` : errorCode;
  }
  
  // For field-specific errors that need the field name
  if (baseMessage.includes('is required') || 
      baseMessage.includes('is too short') || 
      baseMessage.includes('is too long') || 
      baseMessage.includes('has an invalid format')) {
    return fieldName ? `${fieldName} ${baseMessage}` : baseMessage;
  }
  
  return baseMessage;
}

// Helper function to get field display name
export function getFieldDisplayName(fieldName: string): string {
  return fieldNameMap[fieldName] || fieldName;
}
