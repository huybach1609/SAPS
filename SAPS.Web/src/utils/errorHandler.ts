import { AxiosError } from "axios";
import { getErrorMessage, getFieldDisplayName } from "@/errors/errorMessages";

// Generic error handling function for API validation errors
export function handleApiValidationError(
  error: any, 
  defaultMessage: string = 'An error occurred',
  defaultTitle: string = 'Error'
): never {
  console.log("error", error);
  let errorTitle = defaultTitle;
  let errorMessage = '';
  
  if (error instanceof AxiosError && error.response?.data) {
    console.log("error.response.data", error.response.data);
    
    // Handle the new error structure with 'errors' object
    if (error.response.data.errors) {
      const errors = error.response.data.errors;
      const errorMessages: string[] = [];
      
      // Process each error field
      Object.keys(errors).forEach(field => {
        const fieldErrors = errors[field];
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          const fieldDisplayName = getFieldDisplayName(field);
          
          // Map error codes to user-friendly messages using centralized error messages
          fieldErrors.forEach(errorCode => {
            const message = getErrorMessage(errorCode, fieldDisplayName);
            errorMessages.push(message);
          });
        }
      });
      
      if (errorMessages.length > 0) {
        errorTitle = 'Validation Error';
        errorMessage = errorMessages.join('. ');
      }
    } else if (error.response.data.message) {
      // Handle single message errors
      const message = error.response.data.message;
      
      // Try to match common error patterns
      if (message.includes('FULL_NAME_LETTERS_ONLY')) {
        errorTitle = 'Invalid Full Name';
        errorMessage = getErrorMessage('FULL_NAME_LETTERS_ONLY');
      } else if (message.includes('EMAIL_ALREADY_EXISTS')) {
        errorTitle = 'Email Already Exists';
        errorMessage = getErrorMessage('EMAIL_ALREADY_EXISTS');
      } else if (message.includes('INVALID_EMAIL')) {
        errorTitle = 'Invalid Email';
        errorMessage = getErrorMessage('INVALID_EMAIL');
      } else if (message.includes('INVALID_PHONE')) {
        errorTitle = 'Invalid Phone Number';
        errorMessage = getErrorMessage('INVALID_PHONE');
      } else if (message.includes('USER_NOT_FOUND')) {
        errorTitle = 'User Not Found';
        errorMessage = getErrorMessage('USER_NOT_FOUND');
      } else if (message.includes('PARKING_LOT_NOT_FOUND')) {
        errorTitle = 'Parking Lot Not Found';
        errorMessage = getErrorMessage('PARKING_LOT_NOT_FOUND');
      } else if (message.includes('UNAUTHORIZED')) {
        errorTitle = 'Unauthorized';
        errorMessage = getErrorMessage('UNAUTHORIZED');
      } else if (message.includes('PERMISSION_DENIED')) {
        errorTitle = 'Permission Denied';
        errorMessage = getErrorMessage('PERMISSION_DENIED');
      } else {
        // Use the message as is, but clean it up
        errorMessage = message.replace('Error: ', '').replace('error: ', '');
      }
    }
  }
  
  // If no specific error was handled, provide a generic message
  if (!errorMessage) {
    errorMessage = defaultMessage;
  }
  
  throw new Error(errorTitle + ': ' + errorMessage);
}

// Specific error handler for staff operations
export function handleStaffError(error: any, operation: string = 'staff operation'): never {
  const defaultMessage = `Failed to ${operation}. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Staff Error');
}

// Specific error handler for parking lot operations
export function handleParkingLotError(error: any, operation: string = 'parking lot operation'): never {
  const defaultMessage = `Failed to ${operation}. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Parking Lot Error');
}

// Specific error handler for authentication operations
export function handleAuthError(error: any, operation: string = 'authentication'): never {
  const defaultMessage = `Authentication failed. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Authentication Error');
}

// Specific error handler for payment operations
export function handlePaymentError(error: any, operation: string = 'payment'): never {
  const defaultMessage = `Payment ${operation} failed. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Payment Error');
}

// Specific error handler for file upload operations
export function handleFileUploadError(error: any, operation: string = 'file upload'): never {
  const defaultMessage = `File ${operation} failed. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'File Upload Error');
}

// Specific error handler for subscription operations
export function handleSubscriptionError(error: any, operation: string = 'subscription operation'): never {
  const defaultMessage = `Failed to ${operation}. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Subscription Error');
}

// Specific error handler for whitelist operations
export function handleWhitelistError(error: any, operation: string = 'whitelist operation'): never {
  const defaultMessage = `Failed to ${operation}. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Whitelist Error');
}

// Specific error handler for shift operations
export function handleShiftError(error: any, operation: string = 'shift operation'): never {
  const defaultMessage = `Failed to ${operation}. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Shift Error');
}

// Specific error handler for incident operations
export function handleIncidentError(error: any, operation: string = 'incident operation'): never {
  const defaultMessage = `Failed to ${operation}. Please try again.`;
  return handleApiValidationError(error, defaultMessage, 'Incident Error');
}
