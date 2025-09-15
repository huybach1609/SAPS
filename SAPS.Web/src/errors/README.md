# Centralized Error Handling System

This directory contains the centralized error handling system for the SAPS application.

## Files

- `errorMessages.ts` - Centralized error message definitions
- `../utils/errorHandler.ts` - Generic error handling utilities

## Usage

### 1. Adding New Error Messages

To add new error messages, edit `src/errors/errorMessages.ts`:

```typescript
export const errorMessages: Record<string, string> = {
  // Existing messages...
  
  // Add your new error message
  NEW_ERROR_CODE: "Your user-friendly error message here.",
  
  // Field-specific errors (will be combined with field name)
  REQUIRED: "is required.",
  MIN_LENGTH: "is too short.",
  MAX_LENGTH: "is too long.",
  INVALID_FORMAT: "has an invalid format.",
};
```

### 2. Adding New Field Names

To add new field name mappings, edit the `fieldNameMap` in `src/errors/errorMessages.ts`:

```typescript
export const fieldNameMap: Record<string, string> = {
  // Existing mappings...
  
  // Add your new field mapping
  'NewFieldName': 'User Friendly Field Name',
};
```

### 3. Using Error Handlers in Services

#### For Staff Operations:
```typescript
import { handleStaffError } from "@/utils/errorHandler";

export async function someStaffFunction() {
  try {
    // Your API call
    const response = await axios.post('/api/staff', data);
    return response.data;
  } catch (error) {
    handleStaffError(error, 'perform operation');
  }
}
```

#### For Other Operations:
```typescript
import { 
  handleParkingLotError, 
  handleAuthError, 
  handlePaymentError,
  handleApiValidationError 
} from "@/utils/errorHandler";

// Specific handlers
handleParkingLotError(error, 'create parking lot');
handleAuthError(error, 'login');
handlePaymentError(error, 'process');

// Generic handler
handleApiValidationError(error, 'Custom message', 'Custom Title');
```

### 4. Using Error Messages Directly

```typescript
import { getErrorMessage, getFieldDisplayName } from "@/errors/errorMessages";

// Get error message
const message = getErrorMessage('EMAIL_ALREADY_EXISTS');
// Returns: "An account with this email address already exists."

// Get error message with field name
const fieldMessage = getErrorMessage('REQUIRED', 'Email');
// Returns: "Email is required."

// Get field display name
const fieldName = getFieldDisplayName('FullName');
// Returns: "Full Name"
```

## Error Message Structure

### Field-Specific Errors
These errors are combined with field names:
- `REQUIRED` → "Field Name is required."
- `MIN_LENGTH` → "Field Name is too short."
- `MAX_LENGTH` → "Field Name is too long."
- `INVALID_FORMAT` → "Field Name has an invalid format."

### Standalone Errors
These errors are used as-is:
- `EMAIL_ALREADY_EXISTS` → "An account with this email address already exists."
- `USER_NOT_FOUND` → "User not found."

## API Error Response Handling

The system handles two types of API error responses:

### 1. Validation Errors (with 'errors' object)
```json
{
  "errors": {
    "FullName": ["FULL_NAME_LETTERS_ONLY"],
    "Email": ["INVALID_EMAIL", "REQUIRED"]
  }
}
```

### 2. Single Message Errors
```json
{
  "message": "EMAIL_ALREADY_EXISTS"
}
```

## Benefits

1. **Consistency**: All error messages are centralized and consistent
2. **Maintainability**: Easy to update error messages in one place
3. **Internationalization Ready**: Easy to add multiple language support
4. **Type Safety**: TypeScript provides autocomplete and type checking
5. **Reusability**: Error handlers can be used across different services
6. **User-Friendly**: Messages are automatically formatted for better UX

## Best Practices

1. **Use descriptive error codes**: Make error codes self-explanatory
2. **Keep messages user-friendly**: Avoid technical jargon in user-facing messages
3. **Be specific**: Provide clear guidance on how to fix the error
4. **Consistent formatting**: Use consistent punctuation and capitalization
5. **Add context**: Include field names when relevant
6. **Test error scenarios**: Ensure error handling works in all cases
