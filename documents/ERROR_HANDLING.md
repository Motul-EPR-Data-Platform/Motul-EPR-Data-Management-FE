# Centralized Error Handling

This document describes the centralized error handling system for the application.

## Overview

The error handling system provides a centralized way to map error codes to user-friendly Vietnamese messages, with support for overriding messages when needed.

## Files

- **`src/constants/errors.ts`** - Defines error codes, messages, and core functions
- **`src/lib/utils/errorHandler.ts`** - Utility functions for common use cases

## Usage

### Basic Usage

```typescript
import { getErrorMessage } from "@/lib/utils/errorHandler";

// With error code
const message = getErrorMessage("2005"); // Returns mapped message

// With error object (extracts code automatically)
const message = getErrorMessage(error);

// With override
const message = getErrorMessage("2005", "Custom message");

// With default fallback
const message = getErrorMessage(error, null, "Default message");
```

### With Toast Notifications

```typescript
import {
  getToastErrorMessage,
  DEFAULT_ERROR_MESSAGES,
} from "@/lib/utils/errorHandler";

toast.promise(apiCall(), {
  loading: "Đang xử lý...",
  success: "Thành công!",
  error: (err) =>
    getToastErrorMessage(err, null, DEFAULT_ERROR_MESSAGES.SAVE_DATA),
});
```

### With Form Errors

```typescript
import {
  getFormErrorMessage,
  DEFAULT_ERROR_MESSAGES,
} from "@/lib/utils/errorHandler";

try {
  await submitForm();
} catch (error) {
  const errorMessage = getFormErrorMessage(
    error,
    null,
    DEFAULT_ERROR_MESSAGES.VALIDATION_ERROR,
  );
  setError(errorMessage);
}
```

## Error Code Ranges

- **1000-1999**: Authentication errors
- **2000-2999**: User management errors
- **3000-3999**: Definition errors
- **4000-4999**: Profile errors
- **5000-5999**: Validation errors
- **6000-6999**: Network errors
- **7000-7999**: Permission errors

## Adding New Error Codes

1. Add the error code and message to `ERROR_MESSAGES` in `src/constants/errors.ts`:

```typescript
export const ERROR_MESSAGES: ErrorMessageMap = {
  // ... existing codes
  "8001": "Your custom error message",
};
```

2. Use the error code in your code:

```typescript
const message = getErrorMessage("8001");
```

## Error Code Extraction

The system automatically extracts error codes from various error formats:

- `error.code`
- `error.errorCode`
- `error.error_code`
- `error.response.data.code`
- `error.response.data.errorCode`
- `error.response.data.error_code`
- `error.response.status` (HTTP status code)

## Message Priority

When handling errors, the system follows this priority order:

1. **Override message** (if provided via `overrideMessage` parameter)
2. **Backend message** (`error.response.data.message` or `error.message`) - **Takes precedence over mapped codes**
3. **Mapped message** (from error code in `ERROR_MESSAGES`)
4. **Default message** (if provided via `defaultMessage` parameter)
5. **Generic error message** (fallback)

## Handling Undefined Error Codes

If the backend returns an error code that is **not defined** in `ERROR_MESSAGES`:

1. **Backend message is used** - If the backend provides a message in `error.response.data.message`, it will be displayed to the user (even if the code is not mapped)

2. **Development warning** - In development mode, a console warning will be logged to help identify unmapped error codes:

   ```
   [Error Handler] Unknown error code: 8001. Add it to ERROR_MESSAGES in src/constants/errors.ts
   ```

3. **Fallback to generic** - If no backend message is available and the code is not mapped, the system falls back to the generic error message

### Example: Undefined Error Code

```typescript
// Backend returns: { code: "8001", message: "Custom backend message" }
// Code "8001" is NOT in ERROR_MESSAGES

getErrorMessage(error);
// Returns: "Custom backend message" (uses backend message)

// Backend returns: { code: "8001" } (no message)
// Code "8001" is NOT in ERROR_MESSAGES

getErrorMessage(error);
// Returns: "Đã xảy ra lỗi. Vui lòng thử lại" (generic fallback)
// Console warning in development: "Unknown error code: 8001..."
```

### Checking if Error Code is Mapped

```typescript
import { isErrorCodeMapped } from "@/lib/utils/errorHandler";

if (!isErrorCodeMapped("8001")) {
  console.log("Error code 8001 is not mapped");
}
```

## Examples

See `src/lib/utils/errorHandler.example.ts` for more detailed examples.
